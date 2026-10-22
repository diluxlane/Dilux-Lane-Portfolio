# Dilux Lane — Video Editor

Static Astro portfolio with Tailwind CSS, GSAP and native scroll-snap carousels.
No backend, analytics, form service or environment secrets are required.

## Local development

Use Node.js 24.

```sh
npm ci
npm run dev
```

```sh
npm run check
npm run build
npm run preview
```

The production output is `dist/`. Do not commit that directory.

## Editing content

| File | Contents |
| --- | --- |
| `src/data/site.json` | Identity, hero, About, portrait, contact, socials, navigation and metadata |
| `src/data/services.json` | The four services and descriptions |
| `src/data/stats.json` | Existing owner-supplied statistics; update only with accurate information |
| `src/data/process.json` | Five workflow steps |
| `src/data/videos.json` | Portfolio introduction, categories, published videos and empty slots |
| `src/styles/global.css` | Shared design tokens, typography and interaction styles |

The original `public/dilux-portrait.jpg` is preserved. Display images use local
480px, 768px and 1080px WebP derivatives. Bebas Neue and Inter are self-hosted;
their OFL licenses are included in `public/fonts/`.

### Adding your own portfolio media

There are currently **no published project videos**. The five existing slots
are explicitly labeled placeholders. They have no play controls or fake links.

Put a thumbnail in `public/images/` and add an entry to the appropriate category's
`videos` array. Replace the example values below with your actual work:

```json
{
  "id": "my-project",
  "platform": "video",
  "url": "/videos/my-project.mp4",
  "title": "Your actual project title",
  "thumbnail": "/images/my-project.webp",
  "label": "Edit"
}
```

Supported platforms are `video` (same-origin MP4/WebM), `youtube` (watch, shorts
or youtu.be URL), and `instagram` (reel or post URL). A title and local thumbnail
are required. Use unique IDs. The `placeholderCount` is the initial number of
slots, not a claim about completed work; placeholders disappear as real entries
replace them. Set it to zero to show only published videos.

Videos and social embeds are requested only when a real project is opened.
The player provides an original-link fallback, keyboard focus containment,
Escape to close, and playback cleanup. Links still work without JavaScript.
Embedded players receive their own keyboard events; tab back to the dialog
controls before using Escape, or use the visible Close video button.

### Contact

The contact form opens a draft at the WhatsApp number in `site.json`. Visitors
review and send that draft inside WhatsApp. The page does not send messages,
store submissions, or claim that a message has been delivered. Direct phone,
email and WhatsApp links remain available.

## Browser verification

```sh
npx playwright install chromium
npm test
```

The test starts a temporary localhost server for the built `dist/` directory.
It checks 320, 375, 390, 430, 768, 1024, 1440 and 1920px widths, mobile menus,
keyboard and touch carousels, contact drafts, player behavior, reduced motion,
JavaScript-disabled fallbacks and accessibility. Screenshots and results go to
the ignored `test-results/` directory. WhatsApp navigation and player requests
are intercepted during tests; no real message is sent.

For an existing Chromium installation, set
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its executable path.

## Vercel

The repository's `vercel.json` declares:

- Framework: Astro
- Install: `npm ci`
- Build: `npm run build`
- Output: `dist`

The project is entirely static and needs no Vercel adapter. Keep `main` as the
production branch; use the migration branch's Git preview for review before
merging. The migration does not change any production project setting.

Set `canonicalUrl` in `site.json` to your verified production URL when known.
If it is empty, builds use Vercel's `VERCEL_PROJECT_PRODUCTION_URL` when
available. Without either value, canonical and absolute image metadata are
omitted instead of pointing to an invented domain. Preview builds are marked
`noindex, nofollow` when `VERCEL_ENV=preview` is provided by Vercel.

See `docs/content-migration.md` for the complete content mapping, excluded source
material and intentional adaptations.
