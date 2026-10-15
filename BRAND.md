# Roc Startup Week — Brand Guide

## Voice & Tone

**Confident. Direct. Historically grounded. Forward-looking.**

Rochester isn't a city trying to become a tech city — it's a tech city remembering what it is. The same conditions that created Kodak, Xerox, and Bausch & Lomb are producing the next wave of high-growth companies. We don't apologize, explain, or hedge. We state.

### Writing Rules

- No fluff. No filler. Every sentence earns its place.
- Never use "section labels" or category tags above headings (e.g., "The Mission", "The Lineup"). A heading speaks for itself. Redundant labels are a hallmark of template-generated content — we are not that.
- Never use marketing jargon: "synergy", "leverage", "ecosystem play", "thought leadership". Say the thing plainly.
- Active voice. Short sentences. Let the facts carry weight.
- Historical references should feel earned and specific — dates, names, products, numbers. Not vague "we have a proud history" gestures.
- Future-looking language is concrete: who is building what, not abstract "innovation is happening."

### Tagline

**"Where innovation is nothing new."**

The accent phrase ("nothing new.") is always set in **red italic** — the italic gives it a spoken, declarative quality that contrasts with the upright confidence of the rest of the heading.

Alternatives (use sparingly):
- "200 years of audacity. The next chapter starts now."
- "Built by inventors. Rebuilt by founders."

---

## Visual Identity

### Typography

- **Headings:** Abel (Google Fonts) — tall, lean, confident. No-nonsense industrial feel.
- **Body:** Montserrat — clean geometric sans. Weights 300 (body text), 400, 500, 600 (buttons/labels), 700 (emphasis).
- Headings are always `font-weight: 400` (Abel only has one weight). Let size and spacing do the work.
- Letter-spacing on headings: `-0.02em` (tight, not cramped).
- Line-height: headings `1.1`, body `1.7`.

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Primary Red | `#ed1c24` | Accent, CTAs on hover, timeline markers, the scrolling banner |
| Primary Dark | `#c41019` | Hover state on red elements |
| Black | `#1a1a1a` | Body text, primary buttons, header text |
| Dark | `#222222` | Timeline/history section background |
| Gray 900 | `#2a2a2a` | Timeline cards |
| Gray 700 | `#555555` | Secondary body text |
| Gray 500 | `#888888` | Tertiary text, credits |
| Gray 300 | `#cccccc` | Borders, leader dots |
| Gray 100 | `#e8e4df` | Subtle backgrounds |
| Birch | `#f7f4f0` | Primary page background |
| Birch Dark | `#ece8e3` | Alternate section background |
| White | `#fffdf9` | Card backgrounds, light text on dark |

The palette is warm-neutral with a single high-energy red accent. Red is never used for large fills on the main content area — it lives in the scrolling banner, small accents, and interactive states. The page should feel calm and grounded, with red as the punctuation.

### Layout Principles

- **Max content width:** 1100px. Generous whitespace. Content breathes.
- **Spacing scale:** 0.5rem → 1rem → 2rem → 4rem → 6rem → 10rem. Use consistently.
- **Border radius:** 2px everywhere. Sharp, not rounded. This isn't a playful brand.
- **Grid:** CSS Grid for structure, Flexbox for alignment. No frameworks.
- **Section padding:** `10rem` top/bottom for major sections. Sections are distinct zones.
- **Section boundaries:** Light sections are separated by 1px borders (`var(--color-gray-100)`). The dark timeline and footer create their own separation through contrast. The red banner is a hard visual break between hero and content.
- **Scroll containers:** Horizontal scroll areas use edge masks (CSS `mask-image`) to fade content at the edges, hinting at scrollability without scroll arrows or indicators.

### Image Treatment

Images use the **offset-border effect**:
- Image sits in a container with `overflow: hidden` and `border-radius: 2px`
- A dark inner border (1.5px, 20% opacity black) offsets 10px down-right
- A red outer border (2px, primary red) offsets 20px down-right
- On hover, borders expand outward (inner to 14px, outer to 28px) with a smooth cubic-bezier
- Image scales subtly on hover (1.02x) for a cinematic pull
- Images should be high-quality, Rochester-specific, and feel editorial — not stock

### Hero Illustration Treatment

The hero uses a full-width cityscape illustration as an atmospheric backdrop:
- Positioned absolute at the top of the hero section
- Opacity ~28% — enough to establish place without competing with text
- The illustration is purely decorative (empty alt text)
- Text is layered above with `z-index: 1` and centered

### Iconography

When icons are needed, use **lineal SVGs** — single-weight strokes (1.2px), round caps and joins, no fill. The look is hand-drawn technical illustration: confident single lines, not cartoon or glyph. Icons are 48x48 viewbox, stroke-only, black at rest, red on hover.

### Motion

- Transitions: `0.3s ease` for most interactions
- Image hover: `0.6s ease` for filter/transform (slower, more cinematic)
- Border expansion: `0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)` (spring-like settle)
- Logo banner scroll: `20s linear infinite` (steady, ambient)
- No bouncing, no attention-seeking animation. Motion should feel mechanical and deliberate.

---

## Page Structure (Top to Bottom)

1. **Fixed header** — Logo left, nav right (uppercase labels). Birch background with subtle bottom border. "View Schedule (PDF)" CTA as a dark button linking to the full schedule PDF.
2. **Hero** — Centered text layered over a full-width, low-opacity (≈28%) cityscape illustration. Date line in small uppercase, tagline large with the accent phrase in red italic, subtitle below. The illustration bleeds to the top of the section and fades naturally into the page background.
3. **Logo banner** — Red background, scrolling org names separated by small dots. Steady ambient animation (20s linear infinite).
4. **Split media ("200 Years of Innovation")** — Text left, Rochester skyline illustration right with offset-border effect. Provides visual rhythm and grounds the historical narrative before the schedule.
5. **Schedule** — Day-to-event connected by leader dots. Days in red (Abel), events in gray body text. Separated from sections above/below by 1px borders.
6. **About** — What is Roc Startup Week. Three cards with lineal icons (Learn, Connect, Compete), left-border accent that turns red on hover.
7. **Timeline** — Dark background. Horizontal scroll of historical cards with desaturated images, red year markers, and gradient fade at image base. Cards warm to full color on hover.
8. **CTA** — Clean, centered. Single dark button ("View Schedule (PDF)") that turns red on hover. Separated from above by a 1px border.
9. **Footer** — Dark. Three-column: brand + description, navigation, organizers. Copyright bar at bottom.

---

## Content Principles

- The split-media section establishes Rochester's historical credibility immediately — it earns the right to ask for your time.
- The schedule answers the question people came with: "What's happening?" It's high on the page, not buried.
- The about section provides context for people who need it. Most won't.
- The history timeline is the emotional hook — it's the story that makes Rochester feel inevitable, not aspirational.
- The CTA encourages attendance by inviting visitors to view the PDF schedule and choose events. It should feel like an invitation, not a sales pitch.
- Never describe Rochester as "up and coming" or "emerging." It's a city that already did it and is doing it again.

---

## Anti-Patterns (Never Do These)

- Red mustache labels above headings ("The Mission", "The Lineup", etc.)
- Stock photography or generic startup imagery
- Rounded corners larger than 2px
- Drop shadows on cards (use borders and background color for depth)
- Gradient text
- Animated counters or "stats" sections
- Testimonial carousels
- "Join the community" language (this isn't a Discord server)
- Generic startup verbiage: "disrupt", "pivot", "scale", "hustle"
