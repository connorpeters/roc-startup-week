# Roc Startup Week website and collateral

Static website and generated marketing collateral for the November 2-7, 2026 event.

## Repository contents

- `index.html` and `styles.css`: public website.
- `images/`: website photography, illustrations, organization logos, and generated brand assets.
- `collateral/`: editable HTML/CSS templates, schedule data, copy, and flyer layouts.
- `scripts/`: repeatable logo, QR-code, PNG, and PDF export scripts.
- `output/social/`: 36 campaign graphics plus event callouts in four dimensions, numbered in recommended posting order.
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

`npm run export` rebuilds the logo variants, website QR code, 36 campaign PNGs plus four social callouts per event, and both PDFs. Files in `output/` are generated; edit the source templates instead of editing exported files.

`npm run export:headers` exports the centered-logo LinkedIn headers from `collateral/linkedin-header.html`, using the skyline-with-flowers photo and upper-right red accent. Company (1128 × 191) and personal (1584 × 396) PNGs go directly into `output/social/`. Full exports include both headers locally; website builds exclude them from deployed assets.

## Website build

```sh
npm run build
```

This regenerates the collateral and creates a complete deployable `dist/` directory. The build includes the website, brand and collateral pages, images, SEO files, a custom 404 page, all approved social graphics under `/assets/social/`, both PDFs under `/assets/pdf/`, and a browsable `/assets/` download page.

## Cloudflare deployment

The project uses Cloudflare Workers Static Assets through `wrangler.jsonc`.

```sh
npx wrangler login
npm run deploy:dev
```

`npm run dev` builds the project and starts Wrangler's local development server.

### Development

- Worker: `roc-startup-week`
- URL: https://roc-startup-week.design-06d.workers.dev
- Deploy: `npm run deploy` or `npm run deploy:dev`
- Config: `wrangler.jsonc`

### Production

- Worker: `late-wildflower-6e22`
- URL: https://rocstartupweek.com
- [Cloudflare dashboard](https://dash.cloudflare.com/06d30c75e17a47e477fd7c75b7eec9d7/workers/services/view/late-wildflower-6e22/production)
- Deploy: `npm run deploy:prod`
- Config: `wrangler.production.jsonc`

Production deployment updates the live public website. Build and verify the development site before running it.

## Updating content

- Edit social copy, event data, dates, and the featured day in `collateral/data.mjs`.
- Edit the schedule only in `collateral/data.mjs`. `npm run sync:schedule` regenerates the marked schedule sections of `index.html`, `CONTENT.md`, and the schedule flyer. Export and build commands run this automatically.
- Each event has a stable `id` for TV previews; keep it when changing the title. `time`, `title`, `detail`, and `headliner` control collateral; `location`, `url`, `description`, `meta`, and `note` preserve website details. Update the short `detail` and full `location` together when a venue changes.
- Edit reusable social layouts in `collateral/creative.html` and `collateral/creative.css`.
- Edit flyer layouts in `collateral/flyer-schedule.html`, `collateral/flyer-qr.html`, and `collateral/flyer.css`.
- Update shareable post copy in `collateral/COPY.md`.

## TV slides

Run `npm run export:tv` to regenerate only TV slides, or `npm run export` for the entire package. PNGs are written to `output/tv/`: one full-week overview, six daily schedules, and two slides per event (red callout and original birch alternative), all at **1920 × 1080 (16:9)**. The day and event slides provide larger type for viewing across a room. Use landscape screens with overscan disabled. TV overview times sit above titles on one line; daily slides use a fixed time column. `tvSummary` and `tvAudience` explain each event to passersby. `cost`, `application`, and `registration` add explicit attendance details; events are free unless a cost is listed. Applications and registration remain explicit requirements.

Editable templates: `collateral/tv.html` and `collateral/tv.css`. Schedules use solid birch backgrounds, Abel/Montserrat typography, rectangular red headliner badges, and offset photo borders. Full-week times use smaller type with medium-weight event titles and extra space between events; daily headliners remain bold. Event callouts use the primary-red campaign treatment with a reversed white logo, white type, larger bold Montserrat event titles, and a fine inset border. Original birch event callouts remain available with `theme=birch`; red is the default for `mode=event`. Red export filenames end in `-red-1920x1080.png`, while the original birch filenames remain unchanged. Daily and event slides use `images/rochester-high-falls-drone-hero.webp`. The full-week slide has a header band (logo, title, dates, QR) above six equal day columns read left to right, with no photo. Open the TV links in `collateral/index.html` to preview. A build includes downloads under `/assets/tv/`.

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
