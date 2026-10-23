const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    for (const category of ['itinerary', 'headliners', 'welcome']) {
      for (const [size, width] of [['desktop', 680], ['mobile', 390]]) {
        await page.setViewport({ width, height: 1000, deviceScaleFactor: 1 });
        await page.goto(pathToFileURL(path.resolve(`backend/reminders/build/email-${category}.html`)).href, { waitUntil: 'networkidle0' });
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${category} overflows at ${width}px`);
        assert(await page.$eval('img', image => image.complete && image.naturalWidth > 0), 'Embedded logo must render');
        if (category === 'welcome') {
          assert.equal(await page.$$eval('a[href="https://rocstartupweek.com/assets/pdf/roc-startup-week-full-schedule.pdf"]', links => links.length), 1);
        } else {
          assert.equal(await page.$$eval('h2', headings => headings.length), category === 'itinerary' ? 5 : 2);
        }
        await page.screenshot({ path: `backend/reminders/build/email-${category}-${size}.png`, fullPage: true });
      }
    }
    console.log('PASS: both HTML email templates fit desktop/mobile and render their embedded logo.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
