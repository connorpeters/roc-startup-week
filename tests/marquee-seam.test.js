const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

assert.match(
    html,
    /<div class="logo-banner__track">\s*<div class="logo-banner__group">/,
    'The repeated logos must be wrapped as one complete group.'
);

const groupRule = css.match(/\.logo-banner__group\s*\{([^}]*)\}/);
assert.ok(groupRule, 'The logo group must define its own spacing.');

const gap = groupRule[1].match(/gap:\s*([0-9.]+rem)/)?.[1];
const trailingSpace = groupRule[1].match(/padding-right:\s*([0-9.]+rem)/)?.[1];
assert.equal(trailingSpace, gap, 'The end-to-start spacing must match the spacing between logos.');

assert.match(
    css,
    /@keyframes logo-banner-scroll[\s\S]*?transform:\s*translate3d\(-50%,\s*0,\s*0\)/,
    'The animation must end exactly one of two identical group widths from its start.'
);

assert.match(html, /const logoGroup = track\.querySelector\('\.logo-banner__group'\)/);
assert.match(html, /const clonedLogoGroup = logoGroup\.cloneNode\(true\)/);
assert.match(html, /track\.appendChild\(clonedLogoGroup\)/);
assert.doesNotMatch(html, /if \(Math\.abs\(offset\)[\s\S]*?offset = 0/);

console.log('PASS: logo marquee repeats at an identical visual boundary.');
