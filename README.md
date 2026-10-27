# Dilux Lane — Video Portfolio

A responsive personal portfolio for **Dilux Lane**, focused on video editing, videography and visual storytelling.

**Live website:** https://dilux-lane-portfolio.vercel.app

## Overview

This repository contains the production source for the Dilux Lane video portfolio. The site is built as a static, content-driven Astro project with smooth motion, responsive portfolio browsing and direct contact actions.

The project does not require a backend, database, analytics service or private runtime credentials.

## Highlights

- Responsive portfolio experience for desktop, tablet and mobile.
- Video/project content managed from structured data files.
- Support for local video files, YouTube links and Instagram links.
- GSAP-powered motion and interaction effects.
- Native scroll-snap portfolio carousels.
- WhatsApp contact flow that prepares a message for the visitor to review and send.
- Keyboard, reduced-motion and accessibility considerations.
- Browser smoke tests across common viewport sizes.

## Tech Stack

- **Astro 7** — static site framework
- **Tailwind CSS 4** — styling utilities
- **GSAP 3** — animation and interaction
- **TypeScript tooling** — project checks
- **Playwright + axe-core** — browser and accessibility verification
- **Vercel** — hosting and Git-based deployment

## Project Structure

```text
src/
  data/       Portfolio content, services, process, stats and site information
  styles/     Shared styling and design tokens
public/       Images, fonts and public media
tests/        Browser smoke tests
docs/         Project and content documentation
vercel.json   Vercel deployment configuration
```

Important content files include:

- `src/data/site.json` — identity, navigation, contact and metadata
- `src/data/services.json` — services and descriptions
- `src/data/process.json` — workflow/process content
- `src/data/stats.json` — owner-supplied statistics
- `src/data/videos.json` — portfolio categories and media entries

## Local Development

**Requirement:** Node.js 24.x

```bash
npm ci
npm run dev
```

Useful checks:

```bash
npm run check
npm run build
npm test
```

The production build is generated in `dist/`.

## Deployment

The repository is connected to Vercel and configured through `vercel.json`.

**Production URL:** https://dilux-lane-portfolio.vercel.app

The project is fully static and does not require server-side environment variables for normal operation.

## Media and Content

Portfolio entries are data-driven. Published media should use accurate titles, thumbnails and original links. Placeholder slots are intentionally separate from published work and should not be presented as completed projects.

The contact interface opens a WhatsApp draft; the website itself does not send or store the message.

## Credits

- Designed and maintained for **Dilux Lane**.
- Astro, Tailwind CSS, GSAP, Playwright and other dependencies remain subject to their respective upstream licenses.
- **Bebas Neue** and **Inter** are self-hosted; their OFL license files are included with the font assets.
- Third-party platforms, trademarks and embedded media remain the property of their respective owners.

## Copyright and License

No repository-wide open-source license is provided. Public visibility of this repository does not by itself grant permission to reuse the site-specific design, personal content, portfolio media or branding.

Unless a file or asset states otherwise, reuse should be authorized by the relevant rights holder. Third-party software, fonts, media and trademarks retain their original licenses and ownership.
