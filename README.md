# Roc Startup Week website and collateral

Static website and generated marketing collateral for the November 2-7, 2026 event.

## Repository contents

- `index.html` and `styles.css`: public website.
- `images/`: website photography, illustrations, organization logos, and generated brand assets.
- `collateral/`: editable HTML/CSS templates, schedule data, copy, and flyer layouts.
- `scripts/`: repeatable logo, QR-code, PNG, and PDF export scripts.
- `output/social/`: 36 approved social graphics in four dimensions, numbered in recommended posting order.
- `output/pdf/`: full-schedule and QR-code flyers in US Letter format.
- `brand.html`: downloadable logo and QR-code reference page.
- `BRAND.md`, `CLAUDE.md`, and `AGENTS.md`: brand and maintenance instructions.

## Requirements

- Node.js and npm
- ImageMagick (`magick`) for logo generation

## Setup and export

```sh
npm install
npm run export
```

`npm run export` rebuilds the logo variants, website QR code, all 36 social PNGs, and both PDFs. Files in `output/` are generated; edit the source templates instead of editing exported files.

## Updating content

- Edit social copy, event data, dates, and the featured day in `collateral/data.mjs`.
- Keep schedule changes synchronized with `index.html` and `CONTENT.md`.
- Edit reusable social layouts in `collateral/creative.html` and `collateral/creative.css`.
- Edit flyer layouts in `collateral/flyer-schedule.html`, `collateral/flyer-qr.html`, and `collateral/flyer.css`.
- Update shareable post copy in `collateral/COPY.md`.

## Local preview

Serve the repository root with any static file server. For example:

```sh
npx serve .
```

Then open `index.html`, `brand.html`, or `collateral/index.html` through the local server.

## Check

```sh
node tests/marquee-seam.test.js
```
