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

async function main() {
  fs.mkdirSync(socialDir, { recursive: true });
  fs.rmSync(path.join(socialDir, 'variants'), { recursive: true, force: true });
  fs.rmSync(path.join(socialDir, 'connor-sign-off'), { recursive: true, force: true });
  fs.mkdirSync(pdfDir, { recursive: true });
  fs.mkdirSync(path.dirname(qrPath), { recursive: true });
  // Social images are generated artifacts. Clear old names so each export has one
  // canonical, sequence-numbered filename and the folder remains distribution-ready.
  for (const filename of fs.readdirSync(socialDir)) {
    if (filename.endsWith('.png')) fs.unlinkSync(path.join(socialDir, filename));
  }
  await QRCode.toFile(qrPath, 'https://rocstartupweek.com', { width: 900, margin: 3, color: { dark: '#1a1a1a', light: '#fffdf9' }, errorCorrectionLevel: 'H' });

  const { server, port } = await startServer();
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    for (const [conceptIndex, concept] of concepts.entries()) {
      const sequence = String(conceptIndex + 1).padStart(3, '0');
      for (const [size, [width, height]] of Object.entries(sizes)) {
        await page.setViewport({ width, height, deviceScaleFactor: 1 });
        await page.goto(`http://127.0.0.1:${port}/collateral/creative.html?concept=${concept}&size=${size}`, { waitUntil: 'networkidle0' });
        await ready(page);
        await page.screenshot({ path: path.join(socialDir, `${sequence}-${concept}-${size}-${width}x${height}.png`), captureBeyondViewport: false });
      }
    }

    const flyers = [
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
  console.log(`Exported ${concepts.length * Object.keys(sizes).length} final social graphics and 2 PDFs.`);
}

main().catch(error => { console.error(error); process.exit(1); });
