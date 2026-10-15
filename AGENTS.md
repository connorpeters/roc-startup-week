# Roc Startup Week Agent Guide

Read `CLAUDE.md` and `BRAND.md` before changing the website or collateral.

## Content sources

- `CONTENT.md`: long-form website and schedule source copy.
- `collateral/data.mjs`: source of truth for social graphics, their dimensions, event schedule, headliner flags, and the featured day.
- `collateral/COPY.md`: approved share copy, hashtags, event URL, and canonical headliner names.

Track unresolved details in `SCHEDULE-QUALITY-GATE.md`. Post-week additions use `additionalDays` in `collateral/data.mjs` and render separately on the website and in `CONTENT.md`; they are excluded from the six-day calendar and flyer.

Edit events only in `collateral/data.mjs`. Run `npm run sync:schedule` to regenerate the marked schedule sections in `index.html`, `CONTENT.md`, and `collateral/flyer-schedule.html`. Export/build commands run synchronization automatically. Do not hand-edit those marked sections. Keep short `detail` and full `location` aligned when changing venues. Keep event `id` stable when renaming.

## Headliners

Headliners use `headliner: true` in `collateral/data.mjs` and `schedule__event--headliner` in `index.html`. Their event titles render bold in black, followed by a primary-red (`#ed1c24`) small-radius rectangular badge labeled `HEADLINER`. Do not use a capsule-shaped pill. Current headliners are:

- RocGrowth presents: City Mark - Rochester Logo Documentary
- Reception at the Mercantile on Main
- Founder Panel: What It Takes to Build a Successful Company
- UVC Office Hours
- Marketing: From Startup to Standout
- RocGrowth Creative Collisions: Meet Founders & Creatives
- Fundraising for Your Startup
- Mark Ain Business Model Competition

## Collateral workflow

1. Edit shared content in `collateral/data.mjs`.
2. For day-specific graphics, change `featuredDay` to one of `monday` through `saturday`.
3. Run `npm install` once.
4. Run `npm run export` to regenerate exact logo variants, the QR code, 36 campaign graphics plus four social callouts per event, all TV slides, and both letter-size PDFs.
5. Review `output/social/` and `output/pdf/` before distribution.

Social filenames begin with a three-digit recommended posting sequence. Keep the
order in the `concepts` array in `scripts/export-collateral.js`. All approved
graphics render directly into `output/social/`; do not recreate experimental
variant or sign-off subdirectories.

Do not hand-edit files in `output/`; they are generated artifacts. The HTML source remains editable in `collateral/`.

TV full-week titles use medium weight consistently, including headliners; daily schedules retain bold headliner titles. Event slides export in both red and original birch versions. Red event backgrounds are an explicitly approved campaign treatment. Events are free unless a cost is listed; do not label free events.

Social event templates live in `collateral/social-event.html`. The assets page shows template previews until PNGs are exported, then shows the generated downloads. Organization searches match event callouts only; general campaign assets do not inherit event metadata.

TV templates live in `collateral/tv.html` and `collateral/tv.css`. `npm run export:tv` generates the full-week overview, daily schedules, and individual event slides in `output/tv/`.

## Dimensions

- Instagram/Facebook: 1080 x 1080
- LinkedIn: 1200 x 1200
- X/Twitter: 1600 x 900
- Email newsletter: 1200 x 628
- TV slides: 1920 x 1080 (16:9 landscape)
- Flyers: US Letter, 8.5 x 11 inches

The official URL and QR destination are `https://rocstartupweek.com`.

## Deployment targets

- `npm run deploy:dev` updates the `roc-startup-week` development Worker at `https://roc-startup-week.design-06d.workers.dev`.
- `npm run deploy:prod` updates the live `late-wildflower-6e22` production Worker serving `https://rocstartupweek.com`.
- Do not use the production command unless the user explicitly authorizes a live deployment.
