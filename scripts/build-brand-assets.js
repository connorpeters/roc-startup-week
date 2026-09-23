#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'images', 'RocStartupWeekLogo1.png');
const outDir = path.join(root, 'images', 'brand');
const transparent = path.join(outDir, 'roc-startup-week-full-color-transparent.png');
const fullColor = path.join(outDir, 'roc-startup-week-full-color.png');
const reversed = path.join(outDir, 'roc-startup-week-white-reversed.png');
const primaryRed = path.join(outDir, 'roc-startup-week-primary-red.png');

fs.mkdirSync(outDir, { recursive: true });
fs.copyFileSync(source, transparent);

function magick(args) {
  const result = spawnSync('magick', args, { stdio: 'inherit' });
  if (result.status !== 0) throw new Error('ImageMagick failed. Install the `magick` command and retry.');
}

// Full color on the official warm birch background.
magick([source, '-background', '#f7f4f0', '-alpha', 'remove', '-alpha', 'off', fullColor]);
// Preserve the exact mark and alpha channel while reversing all visible pixels to white.
magick([source, '-channel', 'RGB', '-fill', '#fffdf9', '-colorize', '100', reversed]);
// Preserve the approved silhouette while creating a single-color campaign mark.
magick([source, '-channel', 'RGB', '-fill', '#ed1c24', '-colorize', '100', primaryRed]);

console.log(`Brand assets written to ${path.relative(root, outDir)}`);
