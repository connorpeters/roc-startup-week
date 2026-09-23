# Roc Startup Week

## Mission

Roc Startup Week (November 2–7, 2026) is a week-long celebration of entrepreneurship and innovation across the Greater Rochester region. It brings together students, founders, investors, innovators, business leaders, and community members through workshops, networking events, founder talks, panels, and other entrepreneurial programming.

The site exists to promote the week, aggregate the schedule of events from participating organizations, and drive submissions/participation.

## Tech Stack

- Vanilla HTML/CSS/JS — no build tools, no frameworks
- Hosted as static files

## Brand & Design

All brand voice, visual identity, color palette, typography, layout rules, and anti-patterns are documented in `BRAND.md`. Read and follow it for any content or design work.

Key rules enforced:
- **Never** use small red labels/tags above section headings (e.g., "The Mission", "Our Story"). Headings stand alone.
- Design tokens live as CSS custom properties in `:root` at the top of `index.html`.
- Images use the offset-border effect described in BRAND.md.
- Icons are lineal SVGs (stroke-only, 1.2px weight, round caps).

## Key Organizations

- Ain Center for Entrepreneurship & Innovation (University of Rochester) — primary organizer
- NextCorps, UVC, RocGrowth — participating ecosystem partners

## Event Submission

Organizations submit events via Airtable form: https://airtable.com/appzNGSk0bcNRZ2if/pagiuuVoqhZy5DVc9/form

## Marketing Collateral

The repeatable collateral system lives in `collateral/`. Read `AGENTS.md` for the content model, headliner rules, exact export sizes, and regeneration workflow. Run `npm run export` to produce all 32 social graphics plus both flyer PDFs. Never edit generated files under `output/` directly.
