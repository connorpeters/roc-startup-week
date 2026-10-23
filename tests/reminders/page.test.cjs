const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const puppeteer = require('puppeteer');

(async () => {
  const server = http.createServer((req, res) => {
    const files = { '/reminders.html': 'text/html', '/reminders.js': 'application/javascript', '/reminders.css': 'text/css' };
    if (!files[req.url]) { res.writeHead(404).end(); return; }
    res.setHeader('content-type', files[req.url]);
    res.end(fs.readFileSync(path.join(process.cwd(), req.url.slice(1))));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  const requests = [];
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await page.setRequestInterception(true);
    const api = 'https://testing.execute-api.us-east-1.amazonaws.com';
    page.on('request', request => {
      if (request.url().endsWith('/reminders-config.json')) {
        return request.respond({ status: 200, contentType: 'application/json', body: JSON.stringify({ apiUrl: api }) });
      }
      if (request.url().startsWith(api)) {
        if (request.method() === 'OPTIONS') return request.respond({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'POST, GET', 'access-control-allow-headers': 'content-type' } });
        const data = request.url().endsWith('/events') ? [{ id: 'event-one', title: 'Founder Event', startsAt: '2099-11-02T09:00:00-05:00', date: 'Nov 2', time: '9:00 AM', location: 'Rochester' }] : { message: request.url().endsWith('/unsubscribe') ? 'You have unsubscribed.' : 'You’re signed up. No email confirmation is needed.' };
        if (request.method() === 'POST') requests.push({ url: request.url(), data: JSON.parse(request.postData()) });
        return request.respond({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(data) });
      }
      if (!request.url().startsWith('http://127.0.0.1')) return request.abort();
      request.continue();
    });
    const base = `http://127.0.0.1:${server.address().port}/reminders.html`;
    await page.goto(base);
    await page.waitForSelector('#signup:not([hidden])');
    assert.equal(await page.$eval('[name=consent]', element => element.checked), false);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.type('#email', 'person@example.com');
    await page.click('[name=eventIds]');
    await page.click('[type=submit]');
    assert.equal(requests.length, 0, 'unchecked consent must prevent submission');
    await page.click('[name=consent]');
    fs.mkdirSync('backend/reminders/build', { recursive: true });
    await page.screenshot({ path: 'backend/reminders/build/signup-mobile.png', fullPage: true });
    await page.click('[type=submit]');
    await page.waitForFunction(() => document.querySelector('#signup').hidden);
    assert.deepEqual(requests[0].data, { email: 'person@example.com', eventIds: ['event-one'], consent: true });
    assert(!requests.some(request => request.url.includes('confirm')));
    await page.goto(base + '#unsubscribe=' + 'a'.repeat(43));
    await page.waitForSelector('#token-action:not([hidden])');
    assert.equal(await page.evaluate(() => location.hash), '');
    assert.equal(requests.length, 1, 'opening a link must not automatically unsubscribe');
    await page.click('#action-button');
    await page.waitForFunction(() => document.querySelector('#token-action').hidden);
    assert(requests[1].url.endsWith('/reminders/unsubscribe'));
    console.log('PASS: checkbox-only signup, mobile layout, API payload, and deliberate unsubscribe.');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
