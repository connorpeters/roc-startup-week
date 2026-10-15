#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const puppeteer = require('puppeteer');
const QRCode = require('qrcode');

const root = path.resolve(__dirname, '..');
const speakersDir = path.join(root, 'images', 'speakers');

function download(url) {
  return new Promise((resolve, reject) => {
    const get = url.startsWith('https') ? https.get : http.get;
    get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location).then(resolve, reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function fetchWebsiteHeadshot(page, url, speakerName) {
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
  const nameParts = speakerName.toLowerCase().replace(/^dr\.?\s*/i, '').split(/\s+/);
  const photoUrl = await page.evaluate((parts) => {
    const og = document.querySelector('meta[property="og:image"]');
    if (og) {
      const url = og.getAttribute('content');
      if (url && !url.includes('favicon') && !url.includes('logo')) return url;
    }
    const imgs = [...document.querySelectorAll('img')];
    const headshot = imgs.find(img => {
      const alt = (img.alt || '').toLowerCase();
      const src = (img.src || '').toLowerCase();
      const matchesName = parts.some(p => alt.includes(p) || src.includes(p));
      const matchesRole = alt.includes('headshot') || alt.includes('portrait') || alt.includes('photo')
        || alt.includes('founder') || src.includes('headshot') || src.includes('portrait')
        || src.includes('team') || src.includes('about') || src.includes('speaker');
      return matchesName || matchesRole;
    });
    if (headshot) return headshot.src;
    return null;
  }, nameParts);
  return photoUrl;
}

async function main() {
  const { days, additionalDays } = await import('../collateral/data.mjs');
  const allEvents = [...days, ...additionalDays].flatMap(d => d.events);
  const speakers = allEvents.filter(e => e.speaker).map(e => e.speaker);

  fs.mkdirSync(speakersDir, { recursive: true });

  const forceRefresh = process.argv.includes('--force');
  const needed = speakers.filter(s => forceRefresh || !fs.existsSync(path.join(root, s.headshot)));
  if (!needed.length) {
    console.log('All speaker headshots already downloaded.');
    return;
  }

  const linkedInNeeded = needed.filter(s => s.profileUrl.includes('linkedin.com'));
  const otherNeeded = needed.filter(s => !s.profileUrl.includes('linkedin.com'));

  if (linkedInNeeded.length) {
    console.log(`\nLinkedIn requires authentication for profile photos.`);
    console.log(`Save these manually to images/speakers/:`);
    for (const s of linkedInNeeded) {
      console.log(`  ${s.name} → ${path.basename(s.headshot)}`);
      console.log(`    ${s.profileUrl}`);
    }
    console.log('');
  }

  if (otherNeeded.length) {
    console.log(`Fetching ${otherNeeded.length} headshot(s) from websites...`);
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 900 });

      for (const speaker of otherNeeded) {
        const dest = path.join(root, speaker.headshot);
        console.log(`  ${speaker.name} (${speaker.profileUrl})...`);

        try {
          let photoUrl = await fetchWebsiteHeadshot(page, speaker.profileUrl, speaker.name);

          if (!photoUrl) {
            console.log(`    ! No photo found — save manually to ${path.relative(root, dest)}`);
            continue;
          }

          if (!photoUrl.startsWith('http')) {
            photoUrl = new URL(photoUrl, speaker.profileUrl).href;
          }

          const imageData = await download(photoUrl);
          fs.writeFileSync(dest, imageData);
          console.log(`    Saved (${(imageData.length / 1024).toFixed(0)} KB)`);
        } catch (err) {
          console.log(`    ! Failed: ${err.message} — save manually to ${path.relative(root, dest)}`);
        }
      }
    } finally {
      await browser.close();
    }
  }

  let qrCount = 0;
  for (const speaker of speakers) {
    const slug = path.basename(speaker.headshot, path.extname(speaker.headshot));
    const qrDest = path.join(speakersDir, `qr-${slug}.png`);
    if (!forceRefresh && fs.existsSync(qrDest)) continue;
    await QRCode.toFile(qrDest, speaker.profileUrl, {
      width: 300, margin: 1,
      color: { dark: '#1a1a1a', light: '#f7f4f0' },
      errorCorrectionLevel: 'M'
    });
    qrCount++;
  }
  if (qrCount) console.log(`Generated ${qrCount} speaker QR code(s).`);

  const stillMissing = speakers.filter(s => !fs.existsSync(path.join(root, s.headshot)));
  if (stillMissing.length) {
    console.log(`\n${stillMissing.length} headshot(s) still missing — social graphics will render without them.`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
