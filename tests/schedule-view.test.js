const puppeteer = require('puppeteer');
const assert = require('node:assert/strict');

(async () => {
    const { days, additionalDays } = await import('../collateral/data.mjs');
    const events = [...days, ...additionalDays].flatMap(day => day.events);
    for (const event of events) {
        assert.match(event.time, /^\d{1,2}:\d{2}(?: (?:AM|PM))?-(?:\d{1,2}:\d{2} (?:AM|PM)|late)$|^\d{1,2}:\d{2} (?:AM|PM) \(end time TBD\)$/, event.title + ' must have a time range or an explicit open/pending end.');
    }
    const attendanceFields = events.reduce((count, event) => count + 2 + Number(Boolean(event.meta?.Cost)) + Number(Boolean(event.registration)), 0);
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    try {
        const page = await browser.newPage();
        await page.setRequestInterception(true);
        page.on('request', request => request.url().startsWith('file:') ? request.continue() : request.abort());
        const visible = selector => page.$$eval(selector, elements => elements.filter(element => getComputedStyle(element).display !== 'none' && element.getClientRects().length).length);
        for (const width of [1440, 390]) {
            await page.setViewport({ width, height: 1000 });
            await page.goto('file://' + process.cwd() + '/dist/index.html', { waitUntil: 'load' });
            assert.equal(await visible('.schedule__events li'), events.length);
            const descriptions = await visible('.schedule__event-description');
            assert(descriptions > 0);
            await page.click('[data-schedule-view="simplified"]');
            assert.equal(await visible('.schedule__event-description'), 0);
            assert.equal(await visible('.schedule__event-note'), 0);
            assert.equal(await visible('.schedule__event-meta-extra'), 0);
            assert.equal(await visible('.schedule__events li'), events.length);
            assert.equal(await visible('.schedule__event-meta > span:not(.schedule__event-meta-extra)'), attendanceFields);
            assert.equal(await page.$eval('[data-schedule-view="simplified"]', element => element.getAttribute('aria-pressed')), 'true');
            assert.equal(await page.$eval('[data-schedule-view="detailed"]', element => element.getAttribute('aria-pressed')), 'false');
            assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
            await page.evaluate(() => Promise.all(document.getAnimations().filter(animation => animation.effect?.target?.matches('.schedule__view-button')).map(animation => animation.finished)));
            await (await page.$('#schedule')).screenshot({ path: '/tmp/roc-schedule-' + width + '.png' });
            await page.click('[data-schedule-view="detailed"]');
            assert.equal(await visible('.schedule__event-description'), descriptions);
            await page.focus('[data-schedule-view="simplified"]');
            await page.keyboard.press('Enter');
            assert.equal(await visible('.schedule__event-description'), 0);
            console.log('PASS: schedule toggle, attendance details, keyboard control, and layout at ' + width + 'px.');
        }
        await page.setJavaScriptEnabled(false);
        await page.reload();
        assert.equal(await visible('.schedule__view-controls'), 0);
        assert(await visible('.schedule__event-description') > 0);
        console.log('PASS: full schedule remains available without JavaScript.');
    } finally {
        await browser.close();
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
