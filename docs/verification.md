# Migration verification

Verified 23 October 2026. See `content-migration.md` for the pre-migration
inventory and source mapping.

## Build and dependencies

| Check | Result |
| --- | --- |
| Clean `npm ci --offline` from the resolved lockfile and cached packages | Passed; 294 packages installed, lifecycle scripts enabled |
| `npm run check` | Passed; 0 errors, 0 warnings, 0 hints |
| `npm run build` | Passed; one static page in `dist/` |
| `npm test` | All 15 browser checks passed |
| Dependency advisory audit | 0 known vulnerabilities in the audit response |

Node.js 24 was used. The site has no server routes, database, form backend,
API keys or runtime secrets.

## Rendered site

Chromium browser checks passed at 320, 375, 390, 430, 768, 1024, 1440 and
1920 pixels. At each width:

- Document width matches the viewport without horizontal page overflow.
- Visible headlines fit within the screen; all section anchors resolve.
- Portraits load, footer text reveals and existing statistics render correctly.
- All five empty portfolio slots are labeled as placeholders and are not playable.
- No project video or embed is requested on initial load.
- No third-party request, page script error or failed local asset request occurs.

Additional checks cover touch and keyboard menu operation, Escape/outside-click
menu dismissal, anchor scrolling, desktop carousel buttons, keyboard scrolling,
an actual browser touch swipe, form validation and a correctly encoded WhatsApp
draft for the existing recipient. WhatsApp navigation is intercepted during tests;
the tests do not send messages.

The player interface is tested with an intercepted video embed fixture: focus
containment, close button, backdrop dismissal, Escape from the dialog controls,
focus restoration and removing the player to stop playback. Embedded players
receive their own keyboard events, so visitors tab back to the dialog controls
before using Escape. Actual project footage cannot be playback-tested until
Dilux adds his own video URLs and thumbnails.

Reduced motion leaves content visible and disables running CSS animations.
With JavaScript disabled, content and the portrait remain visible and contact
links and the WhatsApp form fallback remain usable.

Automated axe scans at 375 and 1440 pixels returned **zero violations** for the
configured WCAG A/AA, WCAG 2.1 AA and best-practice checks. This records the
automated checks performed, rather than claiming a complete accessibility audit.

## Design comparison

The authorized implementation and the finished site were rendered and compared.
The source's invalid footer closing tag was corrected only in a temporary
comparison copy so the current compiler could build it.

| Detail | 390px: source / result | 1440px: source / result |
| --- | --- | --- |
| Body font | Inter / Inter | Inter / Inter |
| Display font | Bebas Neue / Bebas Neue | Bebas Neue / Bebas Neue |
| Background | #0A0A0A / #0A0A0A | #0A0A0A / #0A0A0A |
| Accent | #C8A96B / #C8A96B | #C8A96B / #C8A96B |
| Hero headline size | 78px / 78px | 176px / 176px |
| About top padding | 64px / 64px | 80px / 80px |
| Services top padding | 64px / 64px | 96px / 96px |
| Service card radius | 16px / 16px | 16px / 16px |
| Portfolio card width | 260px / 260px | 300px / 300px |
| Portfolio aspect ratio | 9:16 / 9:16 | 9:16 / 9:16 |

The desktop hero retains its 55/45 composition, and mobile retains the source's
separate full-height layout. Navigation, section order, framed About image,
process layouts, contact partition, footer structure and motion use the source
implementation. The four legitimate services use a balanced two-column desktop
grid. Portraits, text lengths and honest empty states necessarily differ.

Defects repaired include the footer's invalid closing tag, a reveal threshold
that could hide the last footer line, hidden-menu tab stops, duplicate touch
handling, no-JavaScript visibility and image sizing. Muted text is raised from
#7A7A7A to #808080 and dimmed readable labels use full opacity to pass contrast
checks. These are focused quality corrections within the existing visual system.

## Content, media and security

- All useful Dilux content maps to the new components; the original portrait
  file is preserved byte-for-byte.
- Existing owner-supplied statistics are retained without increasing them;
  they were not independently verified.
- Two portfolio categories, four services and five process steps are preserved.
- No reference-owner identity, contact endpoint, project URL, client claim,
  testimonial, image or thumbnail is present in the finished source.
- No other creator's portfolio footage, AI-generated client work or fabricated
  social proof has been added.
- The original 19 project thumbnails and hero/profile/stock photos are excluded.
- Secret-pattern and reference-identity scans returned no matches. Product code
  contains no console logging or debugging calls.
- No source repository agent/editor metadata, thumbnail scraper or Pages
  deployment workflow was imported. Unused Swiper is excluded.
- Existing Instagram, TikTok and YouTube redirect URLs returned HTTP 200. The
  WhatsApp link returned HTTP 200 and redirected to the existing phone number.
  Those HTTP checks do not assert ownership of the destination profiles.

## Vercel status and remaining inputs

The build is static and `vercel.json` specifies Astro, `npm ci`, `npm run build`
and `dist`. A preview-build check confirmed preview `noindex` behavior, canonical
URLs derived from the production URL and social metadata using Dilux's portrait.
No production deployment or project setting has been changed.

The target project was not visible among the connected Vercel account's
projects. Its actual preview deployment and production configuration therefore
remain unverified; inspect the PR's deployment checks or connect the existing
Vercel project to this repository and review the branch preview before merging.

The remaining content inputs are Dilux's own project videos and thumbnails for
the five existing slots. No other useful Dilux content was left unmapped. The
testimonial section is intentionally absent because this repository supplies
no legitimate video-editing testimonials.
