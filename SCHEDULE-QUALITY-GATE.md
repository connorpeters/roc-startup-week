# Schedule quality gate

The schedule is still under review. Do not generate final marketing assets or deploy until requested. Event changes belong in `collateral/data.mjs`; run `npm run sync:schedule` to update the website, content document, and schedule flyer source. Never edit generated files in `output/`.

## Outstanding event details

- [x] **Nov 2 — Rochester Founder Risk Lab:** confirmed virtual; both `detail` and `location` updated.
- [ ] **Nov 2 — Rochester Founder Risk Lab:** verify that the event registration page supplies virtual joining instructions.
- [ ] **Nov 2 — Sales for Startups:** obtain an event/registration link; Pat’s LinkedIn profile is not an attendance destination. Confirm format and specific learning outcomes. Confirmed: hosted at NextCorps, led by Pat Shreckengast, a GrowthX member; not organized directly by UVC.
- [ ] **Nov 2 — Protecting Your Startup: Intellectual Property Basics:** replace the law firm homepage with event/registration information and confirm attendance instructions.
- [ ] **Nov 2 — City Mark documentary and Mercantile reception:** confirm whether RSVP is needed; add event links where available. Both are open to everyone.
- [ ] **Nov 4 — UVC Office Hours:** confirm exact RIT building/room, and how curated meetings are assigned. Confirm whether registration requires any preparation or additional application. Registration is required and seats are limited. Confirmed format: fireside keynote with Sean Colombo, followed by curated one-on-one meetings with mentors who are typically investors or exited entrepreneurs.
- [ ] **Nov 4 — Marketing: From Startup to Standout at RIT:** obtain speaker names, session format, a substantive description, and concrete learning outcomes. Resolve headliner status after reviewing the content; it is not yet promoted to a headliner.
- [ ] **Nov 4 — Speaking from Experience:** verify that the registration page communicates required registration and limited seats. Additional AI-session detail is optional and does not block release.
- [ ] **Nov 5 — RocGrowth Creative Collisions:** verify the public event link and any RSVP instructions. Use RocGrowth consistently. Current published time: 5:30–7:30 PM; venue: Fattey Beer Co., 60 Adventure Place.
- [ ] **Nov 7 — Mark Ain:** recheck application deadline and full entry requirements against the competition page before release. Finals and reception are open to everyone; entry is restricted to eligible U of R students.
- [ ] **Nov 9 — The Good Business Tour: Rochester Premiere:** confirm end time and exact entrance/room, if needed. Keep this in the separate “After Startup Week” listing. Confirmed: 5 PM, George Eastman House, $25 tickets, hosted by David Mammano.
- [ ] **Dec 2 — Flower City AI:** confirm conference start/end times and ticket details before final collateral export. Confirmed: full-day conference at The Little Theatre, 240 East Ave; general admission $40 and student tickets $10, with coffee and lunch included.
- [ ] **Nov 6 — Stages of Platform Engineering:** confirm venue. Scheduled 2:00–3:00 PM; listed before the 3:30 PM NextCorps fundraising talk. Talk by Grant Wrazen. Description is based on the supplied summary.

## Confirmed editorial decisions

- [x] Founder panel title: **Founder Panel: What It Takes to Build a Successful Company**.
- [x] IP session title: **Protecting Your Startup: Intellectual Property Basics**.
- [x] Meetup title: **RocGrowth Creative Collisions: Meet Founders & Creatives**.
- [x] Keep **Happy Hour & Networking** unchanged.
- [x] Update fundraising and Mark Ain links to their specific event/program pages.
- [x] Explain both parts of UVC Office Hours without promising that every mentor is an investor.
- [x] Note required registration and limited seats for both UVC and Golisano events.
- [x] Campus sessions are open beyond their own students. Students under 21 can attend the networking events.
- [x] Distinguish Mark Ain spectators from competition entrants.
- [x] Surface the founder panel’s limited complimentary student tickets and approval requirement.
- [x] Keep November 2–7 as the official week; list Dave’s November 9 premiere separately.

## Content and attendance review before final export

- [ ] Every event has a confirmed date, start/end time, exact venue/room or virtual access, and attendance instructions.
- [ ] Every description explains what happens and why it is useful; learning outcomes reflect confirmed programming.
- [ ] Every link leads to relevant event details or registration; profile and organization homepage links are not presented as registration.
- [ ] Verify RSVP requirements, capacity limits, application deadlines, paid ticket costs, and student ticket offers. Do not label free events.
- [ ] Clearly distinguish open attendance from restricted competition entry and curated mentoring slots.
- [ ] Review the week as a student founder: testing an idea, sales, IP, visibility, mentoring, connections, funding, and student pitches should feel complementary.
- [ ] Differentiate sales, SEO, and marketing descriptions; avoid promising the same generic benefit for all three.
- [ ] Check overlaps and travel time, especially Golisano → virtual SEO → RIT on Wednesday and Monday’s downtown sequence.
- [ ] Confirm titles and headliner flags match `collateral/COPY.md` and `AGENTS.md`; retain stable event IDs when renaming.
- [ ] Review the website at desktop and mobile widths, including the separate November 9 listing.
- [x] Add November 9 social event callout templates; keep the premiere outside the six-day calendar and flyer.
- [ ] Review the four social event callout formats for every event after final export. Exported October 8, 2026: 68 event social PNGs plus 36 campaign PNGs; template previews have been replaced by downloads.

## Only after final asset generation is requested

- [x] Run `npm run export` from the shared source (October 8, 2026).
- [x] Review social contact sheets, both rendered PDFs, and TV schedules/event slides; exporter layout checks and PNG dimension checks pass (October 8, 2026).
- [ ] Verify QR destination is `https://rocstartupweek.com` and all dates/titles/locations match the approved source.
- [ ] Confirm generated assets reflect the final schedule before distribution.
- [ ] Deploy only when requested; production requires explicit live-deployment authorization.

## Deployment preparation — October 8, 2026

- [x] Build `dist/` with 104 social PNGs, 39 TV PNGs, and two US Letter PDFs.
- [x] Verify UVC search returns four social PNGs and two TV variants; all six images load when the assets page is opened from disk.
- [x] Run existing checks and the production configuration deployment dry run.
- [x] Deployed to production at https://rocstartupweek.com on October 8, 2026, after explicit user authorization. Version: `afdcc1d6-6b10-4e09-a086-f0504a3f5fa6`.
- [x] Verified the live assets page: 145 files, UVC filtering returns four social PNGs and two TV variants, all six images load, mobile layout and filter reset pass.

Remaining schedule questions above still apply; successful exports do not confirm unresolved event logistics.

## Schedule view and time audit — October 9, 2026

- [x] Add Detailed / Simplified controls to the website, including the separate after-week listing. Simplified retains titles, times, locations, costs, and registration requirements; detailed restores descriptions, notes, and speaker/organizer metadata.
- [x] City Mark: published range 5:30–7:00 PM, per [TechRochester event listing](https://www.techrochester.org/tr-and-community-events/rocgrowth-presents-city-mark-rochester-logo-documentary).
- [x] UVC Office Hours: 1:00–4:00 PM confirmed by the organizer in this session; this supersedes the 1:00–3:00 PM TechRochester listing.
- [x] Organizer confirmed Sales for Startups: 3:00–4:00 PM; Speaking from Experience + AI: 9:00–11:00 AM; City Mark: 5:30–7:00 PM.
- [x] Mercantile reception: 7:00 PM–late, per organizer. No fixed end time is advertised.
- [ ] The Good Business Tour: starts at 5:00 PM; end time is not defined yet, per organizer. Display “end time TBD” until confirmed.
- [x] Regenerated PDF/social/TV assets for the October 9 deployment using the organizer-confirmed times, “late” reception end, and explicit premiere end-time TBD.

## Production deployment — October 9, 2026

- [x] User authorized deployment; LinkedIn header PNGs excluded from deployed `/assets` files and index, retained locally.
- [x] Regenerated 104 deployed social graphics, 39 TV slides, and both letter-size PDFs. Reviewed both rendered PDFs and an updated UVC social callout; exporter layout checks passed.
- [x] Desktop/mobile schedule toggle, keyboard controls, and no-JavaScript fallback passed.
- [x] Deployed production Worker `late-wildflower-6e22`; version `0e74ad55-c0ab-4729-b292-2290dc5b2852`.
- [x] Verified live homepage, assets index, and schedule PDF exactly match the build. Excluded company-header PNG returns 404.

Outstanding logistics above remain as listed; deployment does not resolve those details.
