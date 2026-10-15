const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.resolve(__dirname, '..', 'styles.css'), 'utf8');

assert.match(
  css,
  /a\.schedule__event-title:hover\s*>\s*span:first-child\s*\{[^}]*text-decoration:\s*underline;/,
  'Only the event-name span should receive the hover underline.'
);
assert.match(
  css,
  /a\.schedule__event-title:hover\s+\.schedule__headliner-pill\s*\{[^}]*text-decoration:\s*none;/,
  'The headliner badge must explicitly suppress inherited link decoration.'
);

console.log('PASS: schedule hover underline excludes the headliner badge.');
