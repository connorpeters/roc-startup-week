#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const siteUrl = 'https://rocstartupweek.com';

function copy(relativeSource, relativeDestination = relativeSource) {
  const source = path.join(root, relativeSource);
  const destination = path.join(dist, relativeDestination);
  if (!fs.existsSync(source)) throw new Error(`Missing build input: ${relativeSource}`);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.cpSync(source, destination, {
    recursive: true,
    filter: file => relativeSource !== 'output/social' || !path.basename(file).includes('-linkedin-header-')
  });
}

function escapeHtml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function titleFromFilename(filename) {
  return filename
    .replace(/\.(png|pdf)$/i, '')
    .replace(/^\d{3}-/, '')
    .replace(/-(instagram|linkedin|twitter|email)-\d+x\d+$/, ' — $1')
    .replaceAll('-', ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase());
}

function removeBuildMetadata(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.name === '.DS_Store' || entry.name === 'Thumbs.db') {
      fs.rmSync(target, { force: true });
    } else if (entry.isDirectory()) {
      removeBuildMetadata(target);
    }
  }
}

function buildAssetIndex(imageNames, pdfNames, tvNames, days, additionalDays, sizes) {
  const allEvents = [...days, ...additionalDays].flatMap(day => day.events);
  const eventText = event => [event.title, event.id, event.detail, event.location,
    event.description, event.speaker?.name, ...Object.values(event.meta || {})].filter(Boolean).join(' ');
  function searchText(filename, format) {
    const event = allEvents.find(event => filename.includes(`-${event.id}-`));
    const relevant = event ? [event] : [];
    let text = [filename, titleFromFilename(filename), format, ...relevant.map(eventText)].join(' ');
    if (/\bRIT\b/i.test(text)) text += ' Rochester Institute of Technology Simone Center';
    if (/University of Rochester/i.test(text)) text += ' U of R UR Ain Center';
    if (/Upstate Venture Connect|\bUVC\b/i.test(text)) text += ' UVC Upstate Venture Connect';
    return escapeHtml(text);
  }
  function displayTitle(filename) {
    const event = allEvents.find(event => filename.includes(`-${event.id}-`));
    if (!event) return titleFromFilename(filename);
    const format = Object.entries(sizes).find(([key]) => filename.includes(`-${key}-`));
    return event.title + (format ? ` — ${format[1].label}` : '');
  }
  const imageCards = imageNames.map(filename => {
    const encoded = encodeURIComponent(filename);
    const title = escapeHtml(displayTitle(filename));
    return `<article class="asset" data-asset data-search="${searchText(filename, 'Social graphics')}"><a href="social/${encoded}"><img src="social/${encoded}" alt="${title}"></a><div><strong>${title}</strong><a href="social/${encoded}" download>Download PNG</a></div></article>`;
  }).join('\n');
  const socialPreviews = [...days, ...additionalDays].flatMap(day => day.events.flatMap(event =>
    Object.entries(sizes).filter(([size]) => !imageNames.some(name => name.includes(`-event-${event.id}-${size}-`))).map(([size, dimensions]) => {
      const filename = `event-${event.id}-${size}-${dimensions.width}x${dimensions.height}.png`;
      const url = `../collateral/social-event.html?event=${encodeURIComponent(event.id)}&size=${size}`;
      return `<article class="asset" data-asset data-search="${searchText('-' + filename, 'Social event callout ' + dimensions.label)}"><iframe class="event-preview" loading="lazy" src="${url}" title="${escapeHtml(event.title)} — ${escapeHtml(dimensions.label)}" style="aspect-ratio:${dimensions.width}/${dimensions.height}"></iframe><div><span><strong>${escapeHtml(event.title)}</strong><span class="asset-format">${escapeHtml(dimensions.label)} · ${dimensions.width} × ${dimensions.height}</span></span><a href="${url}" target="_blank" rel="noopener">Open template</a></div><p class="asset-format">Preview · PNG export pending</p></article>`;
    })
  )).join('\n');
  const pdfLinks = pdfNames.map(filename => `<li data-asset data-search="${searchText(filename, 'Print PDF flyer')}"><a href="pdf/${encodeURIComponent(filename)}">${escapeHtml(titleFromFilename(filename))} (PDF)</a></li>`).join('\n');
  function tvCards(names, variant) {
    return names.map(filename => {
      const encoded = encodeURIComponent(filename);
      const title = escapeHtml(displayTitle(filename.replace(/-red-1920x1080/, '-1920x1080')).replace(/ 1920x1080$/, ''));
      return `<article class="asset tv-asset" data-asset data-search="${searchText(filename, `TV ${variant}`)}"><a href="tv/${encoded}" aria-label="View ${title} — ${variant}"><img src="tv/${encoded}" alt="${title} — ${variant}" loading="lazy" width="1920" height="1080"></a><div><span class="asset-caption"><strong>${title}</strong><span class="asset-format">${variant} · 1920 × 1080</span></span><a href="tv/${encoded}" download>Download PNG</a></div></article>`;
    }).join('\n');
  }
  const isEvent = filename => Number(filename.slice(0, 3)) >= 8;
  const schedules = tvNames.filter(filename => !isEvent(filename));
  const redEvents = tvNames.filter(filename => isEvent(filename) && filename.includes('-red-1920x1080'));
  const birchEvents = tvNames.filter(filename => isEvent(filename) && !filename.includes('-red-1920x1080'));
  const tvSections = `<section data-asset-group id="tv-schedules"><h2>TV schedules · 1920 × 1080</h2><div class="grid tv-grid">${tvCards(schedules, 'Schedule')}</div></section><section data-asset-group id="tv-red"><h2>TV event callouts · Red</h2><div class="grid tv-grid">${tvCards(redEvents, 'Red')}</div></section><section data-asset-group id="tv-birch"><h2>TV event callouts · Birch</h2><div class="grid tv-grid">${tvCards(birchEvents, 'Birch alternative')}</div></section>`;

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Roc Startup Week Assets</title><meta name="description" content="Download approved Roc Startup Week social graphics and print flyers.">
<meta name="robots" content="index, follow"><link rel="canonical" href="${siteUrl}/assets/">
<style>:root{--red:#ed1c24;--ink:#1a1a1a;--paper:#f7f4f0;--line:#d8d2cb}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:Arial,sans-serif}.wrap{max-width:1240px;margin:auto;padding:56px 24px 96px}h1{font-size:clamp(2.6rem,7vw,5rem);margin:0 0 12px}.lede{max-width:720px;line-height:1.6;margin-bottom:24px}.nav{display:flex;gap:20px;margin-bottom:24px}.toc{display:flex;flex-wrap:wrap;gap:12px 24px;margin:0 0 24px}.toc a{color:var(--ink);font-weight:700;text-underline-offset:4px}.search{max-width:640px}.search label{display:block;font-weight:700;margin-bottom:8px}.search input{box-sizing:border-box;width:100%;padding:12px;font:inherit;border:1px solid var(--line);border-radius:2px;background:#fffdf9;color:var(--ink)}.search input:focus-visible,a:focus-visible{outline:2px solid var(--red);outline-offset:3px}#search-status{font-size:.9rem;color:#555;min-height:1.2em}[hidden]{display:none!important}[data-asset-group]{scroll-margin-top:24px}.nav a,.asset a,li a{color:var(--ink);font-weight:700;text-underline-offset:4px}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px}.asset{background:#fff;border:1px solid var(--line);padding:14px}.event-preview{display:block;width:100%;border:0;background:var(--paper)}.asset img{display:block;width:100%;aspect-ratio:1;object-fit:contain;background:#ddd}.asset div{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:14px 2px 2px;font-size:.78rem}.asset div a{color:var(--red);white-space:nowrap}.tv-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.tv-asset img{height:auto;aspect-ratio:16/9;background:var(--paper)}.asset-format{display:block;font-size:.75rem;font-weight:400;color:#555;margin-top:6px}h3{font-size:1.25rem;margin:40px 0 20px}h2{margin-top:64px;font-size:2rem}li{margin:.8rem 0}@media(max-width:850px){.grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:560px){.grid,.tv-grid{grid-template-columns:1fr}.asset div{display:block}.asset div a{display:block;margin-top:10px}}</style></head>
<body><main class="wrap"><h1>Marketing assets</h1><nav class="toc" aria-label="Asset types"><a href="#social">Social graphics</a><a href="#print">Print files</a><a href="#tv-schedules">TV schedules</a><a href="#tv-red">TV events · Red</a><a href="#tv-birch">TV events · Birch</a></nav><p class="lede">Social graphics, TV slides, and print-ready flyers. Social filenames begin with their recommended posting order.</p><nav class="nav" aria-label="Website links"><a href="/">Website</a><a href="/brand.html">Brand assets</a></nav><div class="search"><label for="asset-search">Find marketing files</label><input id="asset-search" type="search" placeholder="Search speaker, organization, event, or format — e.g. Carolyn Spencer" aria-describedby="search-status"><p id="search-status" role="status" aria-live="polite"></p></div><p id="no-results" hidden>No matching files. Try another speaker, organization, or event name.</p><section data-asset-group id="social"><h2>Social graphics</h2><div class="grid">${imageCards}${socialPreviews}</div></section><section data-asset-group id="print"><h2>Print files</h2><ul>${pdfLinks}</ul></section>${tvSections}</main><script>
const search = document.querySelector('#asset-search');
const assets = [...document.querySelectorAll('[data-asset]')];
const groups = [...document.querySelectorAll('[data-asset-group]')];
const normalize = value => value.toLowerCase().normalize('NFKD').replace(/[\\u0300-\\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const searchable = new Map(assets.map(asset => [asset, normalize(asset.dataset.search)]));
function filterAssets() {
  const terms = normalize(search.value).split(' ').filter(Boolean);
  let count = 0;
  for (const asset of assets) {
    asset.hidden = !terms.every(term => searchable.get(asset).includes(term));
    if (!asset.hidden) count++;
  }
  for (const group of groups) {
    group.hidden = ![...group.querySelectorAll('[data-asset]')].some(asset => !asset.hidden);
    document.querySelector('.toc a[href="#' + group.id + '"]').hidden = group.hidden;
  }
  document.querySelector('#search-status').textContent = count + ' of ' + assets.length + ' files shown' + '.';
  document.querySelector('#no-results').hidden = count !== 0;
}
search.addEventListener('input', filterAssets);
filterAssets();
</script></body></html>`;
}

async function build() {
const { days, additionalDays, sizes } = await import('../collateral/data.mjs');
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

for (const file of ['index.html', 'styles.css', 'brand.html', 'reminders.html', 'reminders.css', 'reminders.js', 'reminders-config.json', 'signup-inline.js']) copy(file);
copy('images');
copy('collateral');
copy('output/social', 'assets/social');
copy('output/pdf', 'assets/pdf');
copy('output/tv', 'assets/tv');
removeBuildMetadata(dist);

const socialDir = path.join(dist, 'assets', 'social');
const pdfDir = path.join(dist, 'assets', 'pdf');
const imageNames = fs.readdirSync(socialDir).filter(name => name.endsWith('.png')).sort();
const pdfNames = fs.readdirSync(pdfDir).filter(name => name.endsWith('.pdf')).sort();
const tvNames = fs.readdirSync(path.join(dist, 'assets/tv')).filter(name => name.endsWith('.png')).sort();
if (imageNames.filter(name => !name.includes('-event-') && !name.includes('-linkedin-header-')).length !== 36) throw new Error('Expected 36 campaign social PNGs');
if (pdfNames.length !== 2) throw new Error(`Expected 2 PDFs, found ${pdfNames.length}`);

fs.writeFileSync(path.join(dist, 'assets', 'index.html'), buildAssetIndex(imageNames, pdfNames, tvNames, days, additionalDays, sizes));
fs.writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
fs.writeFileSync(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${siteUrl}/</loc></url><url><loc>${siteUrl}/brand.html</loc></url><url><loc>${siteUrl}/collateral/</loc></url><url><loc>${siteUrl}/assets/</loc></url></urlset>\n`);
fs.writeFileSync(path.join(dist, '404.html'), '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Page not found</title></head><body style="font-family:Arial,sans-serif;margin:10%;color:#1a1a1a"><h1>Page not found</h1><p><a href="/">Return to the website</a></p></body></html>');

console.log(`Built dist with ${imageNames.length} social graphics and ${pdfNames.length} PDFs.`);

}
build().catch(error => { console.error(error); process.exitCode = 1; });
