import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import siteData from './src/data/site.json' with { type: 'json' };

// Canonicals always point to the explicit public site or Vercel production alias.
// Without a known production URL, omit them rather than publish a guessed domain.
const productionUrl = siteData.canonicalUrl ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined);

export default defineConfig({
  site: productionUrl,
  output: 'static',
  vite: { plugins: [tailwindcss()] },
});
