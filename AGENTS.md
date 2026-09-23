# Roc Startup Week Agent Guide

Read `CLAUDE.md` and `BRAND.md` before changing the website or collateral.

## Content sources

- `CONTENT.md`: long-form website and schedule source copy.
- `collateral/data.mjs`: source of truth for social graphics, their dimensions, event schedule, headliner flags, and the featured day.
- `collateral/COPY.md`: approved share copy, hashtags, event URL, and canonical headliner names.

Keep the website schedule in `index.html`, `CONTENT.md`, and `collateral/data.mjs` aligned when an event changes.

## Headliners

Headliners use `headliner: true` in `collateral/data.mjs` and `schedule__event--headliner` in `index.html`. Their event titles render bold in black, followed by a primary-red (`#ed1c24`) small-radius rectangular badge labeled `HEADLINER`. Do not use a capsule-shaped pill. Current headliners are:

- City Mark Documentary Screening
- Reception at the Mercantile on Main
- Connected Ideas x Startup Grind Investor Panel for Rochester Startup Week
- UVC Office Hours
- Fundraising for Your Startup
- Mark Ain Business Model Competition

## Collateral workflow

1. Edit shared content in `collateral/data.mjs`.
2. For day-specific graphics, change `featuredDay` to one of `monday` through `saturday`.
3. Run `npm install` once.
4. Run `npm run export` to regenerate exact logo variants, the QR code, all 36 final social graphics, and both letter-size PDFs.
5. Review `output/social/` and `output/pdf/` before distribution.

Social filenames begin with a three-digit recommended posting sequence. Keep the
order in the `concepts` array in `scripts/export-collateral.js`. All approved
graphics render directly into `output/social/`; do not recreate experimental
variant or sign-off subdirectories.

Do not hand-edit files in `output/`; they are generated artifacts. The HTML source remains editable in `collateral/`.

## Dimensions

- Instagram/Facebook: 1080 x 1080
- LinkedIn: 1200 x 1200
- X/Twitter: 1600 x 900
- Email newsletter: 1200 x 628
- Flyers: US Letter, 8.5 x 11 inches

The official URL and QR destination are `https://rocstartupweek.com`.
