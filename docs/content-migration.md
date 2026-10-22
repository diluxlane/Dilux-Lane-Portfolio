# Content inventory and migration

Inventory completed before replacing the original single-file implementation.
Target baseline: `ed576d53323016818dd7fcf0403716328e1c5a1e`.
Authorized implementation baseline: `b82c05d26da6929f563095a307cae36aa8cb49ff`.

| Existing Dilux content | New location |
| --- | --- |
| Dilux Lane; Video Editor; Videographer & Editor | Site data, metadata, hero, navigation, footer |
| CINEMATIC / EDITS. | Hero, using the authorized split composition |
| Video editing for creators and businesses — pacing, colour, sound, and captions that make raw footage feel finished. | Hero description and SEO description |
| Available for Projects; View Work; Let's Talk | Hero, portfolio anchor, fixed contact CTA |
| VIDEOGRAPHY · EDITING · BRANDING | Rotating hero text |
| FROM ROUGH CUT TO SHIPPED. | About heading |
| I transform ideas into cinematic visuals through clean, modern video editing. From short-form content and promotional videos to cinematic edits, I focus on storytelling, smooth pacing, and eye-catching visuals that leave a lasting impression. | About paragraph |
| Every project is crafted with creativity, precision, and attention to detail. | About paragraph |
| Edited on DaVinci Resolve | About badge |
| Video Editing; Colour Grading; Sound Design; Social Cuts | About marquee |
| Video Editing — Short-form, long-form, and social cuts — pacing, sound, colour, captions. | Services |
| Colour Grading — A consistent, polished look across every shot — from raw footage to final grade. | Services |
| Sound Design — Clean audio, music syncing, and sound effects that make an edit feel finished. | Services |
| Social Media Cuts — Reels, shorts, and platform-ready edits sized and paced for how people actually watch. | Services |
| 5+ Projects Edited; 3+ Years Experience; 48HR Avg Turnaround; 1:1 Direct Contact | Services statistics; existing owner-supplied claims retained without increasing them |
| Brief & Discovery — We start with a conversation about your goals, audience, and the story you want told. | Process step 01 |
| Concept & Plan — A clear plan — storyboard, shot selection, and pacing mapped out before editing begins. | Process step 02 |
| Production — Editing and assembly — with regular check-ins so nothing goes off track. | Process step 03 |
| Refinement — Colour grading and sound design, refined based on your feedback. | Process step 04 |
| Delivery — Final edited files handed over, ready to publish. | Process step 05 |
| SELECTED WORK; A few pieces will go here once they're organised — reels, brand videos, and cinematic edits. | Portfolio heading and description |
| Video Editing (three empty Edit cards) | First carousel; explicitly marked awaiting media |
| Talking Head / Reels (two empty Reel cards) | Second carousel; explicitly marked awaiting media |
| Currently Accepting Projects; LET'S BUILD SOMETHING GOOD | Contact heading and badge |
| Got footage that needs a story, or a channel that needs consistent edits? Send a note and let's talk it through. | Contact description |
| Badulla District, Uva Province, Sri Lanka | Contact location |
| +94 75 522 1163; tel:+94755221163 | Central contact data; contact phone link |
| diluxlane@gmail.com | Central contact data; email links |
| https://wa.me/94755221163; WhatsApp Me | Hero and contact; message composer opens a draft for the same number |
| https://insta.oia.bio/diluxln | Instagram link, retained exactly |
| https://tiktok.openinapp.link/diluxln | TikTok footer link, retained exactly |
| https://yt.oia.bio/diluxln | YouTube footer link, retained exactly |
| dilux-portrait.jpg | Original preserved in public; optimized WebP derivatives for display |
| © 2026 Dilux Lane. All rights reserved. | Footer |
| #work | Preserved as the portfolio section ID so existing links continue working |

## Design and media audit

Adopt the authorized implementation's Astro section architecture, Tailwind theme,
Bebas Neue / Inter typography, 55/45 desktop hero, full-height mobile hero,
floating pill navigation after 80px, circular mobile menu reveal, framed About
portrait, service surfaces and stats bar, native scroll-snap 9:16 carousels,
responsive process timeline, contact partition, footer, loader, grain, GSAP
parallax and entrance motion. Fix accessibility and resilience defects while
preserving their visual intent.

The source has 19 local project thumbnails. Each maps by video ID through its
video data to VideoCarousel, across three source categories (5 / 10 / 4 items).
The square hero image maps only to Hero. It has a PNG extension but JPEG bytes.
The remote profile photograph maps to About and social metadata; two remote
stock images map to About and Contact backgrounds. The source favicon is used
by the layout. LogoFull is used by Navbar and Footer. The other two logo
components and the two public logo SVGs are unused by the rendered page.
None of these photographs, thumbnails, monograms, or logos are imported.

The source testimonial data contains six testimonials; the target has none.
Omit that section entirely. The source Brands component is not used by its
homepage and is not carried across. Omit all source-owner statistics, social
proof, biography, contact endpoints, publishing services and influencer claims.

Swiper is an unused source dependency. Retain actual native carousel behavior
without it. Remove the build-time thumbnail scraper, duplicate scratch scripts,
editor metadata, agent metadata, unrelated documentation, and Pages workflow.
The target remains static, builds to dist, and uses Vercel Git previews.

## Honest gaps and intentional adaptations

- No actual project video URLs or thumbnails exist in the target baseline.
  Preserve all five slots as clearly labeled, non-playable placeholders. They
  are not five published projects; the displayed project count starts at zero.
- No legitimate video-editing testimonials exist in this repository.
- The existing numerical claims are owner-supplied, not independently verified.
- The original form CSS is unused; there is no working form in the old page.
  The new reference-shaped form opens a WhatsApp draft and never claims delivery.
- Replace source photography with the existing Dilux portrait. Preserve the
  original square file; use object-fit and responsive derivatives for layout.
- No canonical deployment URL exists in the target repository. Configure a
  canonical only from an explicit site URL or Vercel's production URL at build.
- The old custom cursor and manual reveal/timeline scripts are superseded by
  the authorized implementation's interaction system, rather than mixed in.
