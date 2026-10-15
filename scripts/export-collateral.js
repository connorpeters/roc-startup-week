#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer');
const QRCode = require('qrcode');

const root = path.resolve(__dirname, '..');
const outputRoot = path.join(root, 'output');
const socialDir = path.join(outputRoot, 'social');
const pdfDir = path.join(outputRoot, 'pdf');
const tvDir = path.join(outputRoot, 'tv');
const qrPath = path.join(root, 'images', 'brand', 'website-qr.png');

// Recommended campaign sequence. The index becomes the three-digit filename prefix.
const concepts = ['coming', 'intro-red', 'one-week', 'dont-miss', 'full-week-calendar', 'daily-schedule', 'happening-today', 'thank-you', 'see-you-next-year'];
const sizes = {
  instagram: [1080, 1080],
  linkedin: [1200, 1200],
  twitter: [1600, 900],
  email: [1200, 628]
};
function contentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  return ({ '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.md': 'text/markdown' })[ext] || 'application/octet-stream';
}

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const requestPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const safePath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, '');
      let filePath = path.join(root, safePath);
      if (!filePath.startsWith(root)) { res.writeHead(403).end('Forbidden'); return; }
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) filePath = path.join(filePath, 'index.html');
      fs.readFile(filePath, (error, data) => {
        if (error) { res.writeHead(404).end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': contentType(filePath) });
        res.end(data);
      });
    });
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

async function ready(page, selector = '#creative') {
  await page.waitForSelector(`${selector}[data-ready="true"]`, { timeout: 15000 });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => Promise.all(Array.from(document.images).map(image => image.complete ? image.decode().catch(() => {}) : new Promise(resolve => {
    image.addEventListener('load', resolve, { once: true });
    image.addEventListener('error', resolve, { once: true });
  }))));
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
  });
  await new Promise(resolve => setTimeout(resolve, 50));
}

async function renderLinkedInHeaders(page, port) {
  const { linkedInHeaderSizes } = await import('../collateral/data.mjs');
  fs.mkdirSync(socialDir, { recursive: true });
  for (const [format, { width, height }] of Object.entries(linkedInHeaderSizes)) {
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await page.goto(`http://127.0.0.1:${port}/collateral/linkedin-header.html`, { waitUntil: 'load' });
    await ready(page);
    const valid = await page.evaluate(() => {
      const logo = document.querySelector('.logo').getBoundingClientRect();
      return [...document.images].every(image => image.naturalWidth > 0)
        && Math.abs(logo.x + logo.width / 2 - innerWidth / 2) < 1
        && Math.abs(logo.y + logo.height / 2 - innerHeight / 2) < 1;
    });
    if (!valid) throw new Error(`LinkedIn header assets or logo centering failed: ${format}`);
    await page.screenshot({ path: path.join(socialDir, `000-linkedin-header-${format}-${width}x${height}.png`), captureBeyondViewport: false });
  }
}

async function main() {
  if (process.argv.includes('--headers-only')) {
    const { server, port } = await startServer();
    let browser;
    try {
      browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      await renderLinkedInHeaders(await browser.newPage(), port);
    } finally {
      if (browser) await browser.close();
      await new Promise(resolve => server.close(resolve));
    }
    console.log('Exported centered-logo LinkedIn company and personal headers.');
    return;
  }
  const { days, additionalDays } = await import('../collateral/data.mjs');
  const eventsFlag = process.argv.find(a => a.startsWith('--events'));
  const eventsOnly = eventsFlag ? (eventsFlag.includes('=') ? eventsFlag.split('=')[1] : process.argv[process.argv.indexOf(eventsFlag) + 1]).split(',') : null;
  const weekOnly = process.argv.includes('--tv-week-only');
  const tvOnly = weekOnly || process.argv.includes('--tv-only');
  fs.mkdirSync(tvDir, { recursive: true });
  for (const filename of weekOnly ? [] : fs.readdirSync(tvDir)) {
    if (filename.endsWith('.png')) fs.unlinkSync(path.join(tvDir, filename));
  }
  fs.mkdirSync(socialDir, { recursive: true });
  fs.rmSync(path.join(socialDir, 'variants'), { recursive: true, force: true });
  fs.rmSync(path.join(socialDir, 'connor-sign-off'), { recursive: true, force: true });
  fs.mkdirSync(pdfDir, { recursive: true });
  fs.mkdirSync(path.dirname(qrPath), { recursive: true });
  // Social images are generated artifacts. Clear old names so each export has one
  // canonical, sequence-numbered filename and the folder remains distribution-ready.
  for (const filename of (tvOnly || eventsOnly) ? [] : fs.readdirSync(socialDir)) {
    if (filename.endsWith('.png')) fs.unlinkSync(path.join(socialDir, filename));
  }
  await QRCode.toFile(qrPath, 'https://rocstartupweek.com', { width: 900, margin: 3, color: { dark: '#1a1a1a', light: '#fffdf9' }, errorCorrectionLevel: 'H' });

  const { server, port } = await startServer();
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    if (!tvOnly && !eventsOnly) await renderLinkedInHeaders(page, port);
    for (const [conceptIndex, concept] of (tvOnly || eventsOnly ? [] : concepts).entries()) {
      const sequence = String(conceptIndex + 1).padStart(3, '0');
      for (const [size, [width, height]] of Object.entries(sizes)) {
        await page.setViewport({ width, height, deviceScaleFactor: 1 });
        await page.goto(`http://127.0.0.1:${port}/collateral/creative.html?concept=${concept}&size=${size}`, { waitUntil: 'networkidle0' });
        await ready(page);
        await page.screenshot({ path: path.join(socialDir, `${sequence}-${concept}-${size}-${width}x${height}.png`), captureBeyondViewport: false });
      }
    }

    if (!tvOnly) {
      let sequence = concepts.length;
      for (const day of [...days, ...additionalDays]) for (const event of day.events) {
        sequence++;
        if (eventsOnly && !eventsOnly.includes(event.id)) continue;
        for (const [size, [width, height]] of Object.entries(sizes)) {
          await page.setViewport({ width, height, deviceScaleFactor: 1 });
          await page.goto(`http://127.0.0.1:${port}/collateral/social-event.html?event=${event.id}&size=${size}`, { waitUntil: 'networkidle0' });
          await ready(page);
          const overflow = await page.evaluate(() => [...document.querySelectorAll('header,.copy,footer')].some(el => el.scrollHeight > el.clientHeight + 1 || el.getBoundingClientRect().right > innerWidth || el.getBoundingClientRect().bottom > innerHeight));
          if (overflow) throw new Error(`Social event callout overflow: ${event.id}, ${size}`);
          await page.screenshot({ path: path.join(socialDir, `${String(sequence).padStart(3, '0')}-event-${event.id}-${size}-${width}x${height}.png`), captureBeyondViewport: false });
        }
      }
    }

    if (eventsOnly) {
      console.log(`Exported ${eventsOnly.length * Object.keys(sizes).length} event graphics for: ${eventsOnly.join(', ')}`);
      return;
    }
    const slides = [{ name: '001-full-week', query: 'mode=week' }];
    for (const day of days) slides.push({ name: `${String(slides.length + 1).padStart(3, '0')}-${day.key}-schedule`, query: `mode=day&day=${day.key}` });
    for (const day of days) for (const event of day.events) slides.push({ name: `${String(slides.length + 1).padStart(3, '0')}-${day.key}-${event.id}`, query: `mode=event&theme=birch&day=${day.key}&event=${event.id}` });
    const birchEvents = slides.filter(slide => slide.query.startsWith('mode=event'));
    slides.push(...birchEvents.map(slide => ({ name: `${slide.name}-red`, query: slide.query.replace('theme=birch', 'theme=red') })));
    for (const slide of weekOnly ? slides.slice(0, 1) : slides) {
      await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
      await page.goto(`http://127.0.0.1:${port}/collateral/tv.html?${slide.query}`, { waitUntil: 'networkidle0' });
      await ready(page);
      const slideParams = new URLSearchParams(slide.query);
      if (slideParams.get('mode') !== 'event') {
        const expectedEvents = slideParams.get('mode') === 'week'
          ? days.flatMap(day => day.events)
          : days.find(day => day.key === slideParams.get('day')).events;
        const locations = await page.$$eval('.event-location', elements => elements.map(element => element.textContent.trim()));
        if (locations.length !== expectedEvents.length || locations.some(location => !location)) {
          throw new Error(`TV schedule is missing event locations (${slide.name})`);
        }
      }
      const problems = await page.evaluate(() => [...document.querySelectorAll('h1,h2,li,.scan,.photo,.event-summary,.event-time,.event-detail,.event-entry')].filter(el => {
        const bounds = el.getBoundingClientRect();
        return bounds.bottom > 964 || bounds.right > 1864;
      }).map(el => ({ text: el.textContent.trim(), bounds: el.getBoundingClientRect().toJSON() })));
      if (problems.length) {
        fs.mkdirSync(path.join(root, 'tmp'), { recursive: true });
        await page.screenshot({ path: path.join(root, 'tmp', 'tv-overflow.png'), captureBeyondViewport: false });
        throw new Error(`TV slide overflow (${slide.name}): ${JSON.stringify(problems)}`);
      }
      await page.screenshot({ path: path.join(tvDir, `${slide.name}-1920x1080.png`), captureBeyondViewport: false });
    }
    const flyers = tvOnly ? [] : [
      ['flyer-schedule.html', 'roc-startup-week-full-schedule.pdf'],
      ['flyer-qr.html', 'roc-startup-week-qr-flyer.pdf']
    ];
    for (const [input, output] of flyers) {
      await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1 });
      await page.goto(`http://127.0.0.1:${port}/collateral/${input}`, { waitUntil: 'networkidle0' });
      await page.evaluate(() => document.fonts.ready);
      await page.pdf({ path: path.join(pdfDir, output), printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
    }
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
  console.log(tvOnly ? 'Exported TV slides.' : `Exported ${(concepts.length + [...days, ...additionalDays].reduce((count, day) => count + day.events.length, 0)) * Object.keys(sizes).length} final social graphics, TV slides, and 2 PDFs.`);
}

main().catch(error => { console.error(error); process.exit(1); });
