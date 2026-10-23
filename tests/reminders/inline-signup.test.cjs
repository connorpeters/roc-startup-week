const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const puppeteer = require('puppeteer');

(async () => {
  const root = path.resolve('dist');
  const server = http.createServer((req, res) => {
    const filename = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!filename.startsWith(root + path.sep) || !fs.existsSync(filename) || !fs.statSync(filename).isFile()) return res.writeHead(404).end();
    res.setHeader('content-type', ({ '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' })[path.extname(filename)] || 'application/octet-stream');
    res.end(fs.readFileSync(filename));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await puppeteer.launch({ headless: true });
  const requests = [];
  let failNext = false;
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 900 });
    await page.setRequestInterception(true);
    const api = 'https://testing.execute-api.us-east-1.amazonaws.com';
    page.on('request', request => {
      if (request.url().endsWith('/reminders-config.json')) return request.respond({ status: 200, contentType: 'application/json', body: JSON.stringify({ apiUrl: api }) });
      if (request.url().startsWith(api)) {
        const headers = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'POST', 'access-control-allow-headers': 'content-type' };
        if (request.method() === 'OPTIONS') return request.respond({ status: 204, headers });
        requests.push(JSON.parse(request.postData()));
        const fail = failNext; failNext = false;
        return request.respond({ status: fail ? 429 : 202, headers, contentType: 'application/json', body: JSON.stringify({ message: fail ? 'Please try again later.' : 'You’re signed up.' }) });
      }
      if (!request.url().startsWith('http://127.0.0.1')) return request.abort();
      request.continue();
    });
    await page.goto(`http://127.0.0.1:${server.address().port}/index.html`, { waitUntil: 'networkidle0' });
    await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; } * { transition: none !important; }' });
    assert.equal(await page.$$eval('[data-inline-signup]', forms => forms.length), 2);
    assert(await page.$$eval('[data-inline-signup] [name=consent]', inputs => inputs.every(input => !input.checked)));
    assert(await page.$$eval('[data-inline-signup] button', buttons => buttons.every(button => button.disabled)));
    assert.equal(await page.$eval('.inline-signup--hero button', button => getComputedStyle(button).backgroundColor), 'rgb(204, 204, 204)');
    await page.type('#hero-signup-email', 'person@example.com');
    await page.click('.inline-signup--hero button');
    assert.equal(requests.length, 0, 'Consent is required');
    await page.click('.inline-signup--hero [name=consent]');
    assert.equal(await page.$eval('.inline-signup--hero button', button => button.disabled), false);
    assert.equal(await page.$eval('.inline-signup--hero button', button => getComputedStyle(button).backgroundColor), 'rgb(237, 28, 36)');
    await page.click('.inline-signup--hero [name=consent]');
    assert.equal(await page.$eval('.inline-signup--hero button', button => button.disabled), true);
    await page.click('.inline-signup--hero [name=consent]');
    await page.$eval('.inline-signup--hero', form => { form.requestSubmit(); form.requestSubmit(); });
    await page.waitForFunction(() => document.querySelector('.inline-signup--hero [role=status]').textContent.includes('Check your inbox'));
    assert.deepEqual(requests, [{ email: 'person@example.com', consent: true }]);
    await page.type('#footer-signup-email', 'person@example.com');
    await page.click('.inline-signup--footer [name=consent]');
    await page.click('.inline-signup--footer button');
    assert.equal(requests.length, 1, 'Same address in the footer must not produce another request');
    await page.$eval('#footer-signup-email', input => input.value = 'second@example.com');
    failNext = true;
    await page.click('.inline-signup--footer button');
    await page.waitForFunction(() => document.querySelector('.inline-signup--footer [role=status]').textContent === 'Please try again later.');
    assert.equal(await page.$eval('.inline-signup--footer button', button => button.disabled), false);
    await page.click('.inline-signup--footer button');
    await page.waitForFunction(() => document.querySelector('.inline-signup--footer [role=status]').textContent.includes('Check your inbox'));
    for (const width of [1280, 390]) {
      await page.setViewport({ width, height: 900 });
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      for (const area of ['hero', 'footer']) {
        const selector = '.inline-signup--' + area;
        assert(await page.$eval(selector, form => {
          const input = form.querySelector('[type=email]').getBoundingClientRect();
          const button = form.querySelector('button').getBoundingClientRect();
          return Math.abs(input.top - button.top) < 2 && button.right <= innerWidth;
        }), 'Email and button stay on the same row');
        await page.$eval(selector, form => form.scrollIntoView({ block: 'center' }));
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        await (await page.$(selector)).screenshot({ path: `backend/reminders/build/inline-${area}-${width}.png` });
      }
    }
    console.log('PASS: embedded hero/footer signup, explicit consent, no event selection, duplicate protection, retryable errors, and inline mobile/desktop layout.');
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
