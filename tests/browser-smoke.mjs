import assert from 'node:assert/strict';
import http from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('../', import.meta.url));
const dist = resolve(root, 'dist');
const output = resolve(root, 'test-results');
await mkdir(output, { recursive: true });
const site = JSON.parse(await readFile(resolve(root, 'src/data/site.json'), 'utf8'));
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = http.createServer(async (request, response) => {
  const pathname = new URL(request.url || '/', 'http://localhost').pathname;
  const file = resolve(dist, pathname === '/' ? 'index.html' : `.${decodeURIComponent(pathname)}`);
  if (!file.startsWith(dist + sep)) { response.writeHead(403).end(); return; }
  try {
    const body = await readFile(file);
    response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' }).end(body);
  } catch { response.writeHead(404).end('Not found'); }
});
await new Promise((done) => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const browser = await chromium.launch({
  headless: true,
  ...(executablePath ? { executablePath, args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--no-zygote'] } : {}),
});
const results = [];
const problems = [];

async function check(name, run) {
  try { const details = await run(); results.push({ name, status: 'pass', details }); console.log(`PASS ${name}`); }
  catch (error) { problems.push({ name, error: error.message }); console.error(`FAIL ${name}: ${error.message}`); }
}

async function revealPage(page) {
  await page.evaluate(async () => {
    const delay = (ms) => new Promise((done) => setTimeout(done, ms));
    const original = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * .7) {
      window.scrollTo(0, y); await delay(90);
    }
    window.scrollTo(0, 0); await delay(750);
    document.documentElement.style.scrollBehavior = original;
  });
}

try {
  for (const width of [320, 375, 390, 430, 768, 1024, 1440, 1920]) {
    await check(`${width}px layout and content`, async () => {
      const context = await browser.newContext({ viewport: { width, height: width < 768 ? 844 : 1000 }, isMobile: width < 768, hasTouch: width < 768 });
      const page = await context.newPage();
      const errors = [], failed = [], remote = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('response', (response) => { if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`); });
      page.on('request', (request) => { if (!request.url().startsWith(origin) && !request.url().startsWith('data:')) remote.push(request.url()); });
      await page.goto(origin);
      await page.locator('body[data-loaded]').waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(1900);
      await revealPage(page);
      const state = await page.evaluate(() => ({
        width: innerWidth, documentWidth: document.documentElement.scrollWidth,
        h1: document.querySelectorAll('h1').length,
        images: [...document.images].filter((image) => getComputedStyle(image).display !== 'none').map((image) => ({ src: image.currentSrc, loaded: image.complete && image.naturalWidth > 0 })),
        brokenAnchors: [...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute('href')).filter((href) => !document.getElementById(href.slice(1))),
        hiddenContent: [...document.querySelectorAll('[data-reveal], .animate-on-scroll')].filter((element) => element.getClientRects().length && getComputedStyle(element).opacity === '0').map((e) => e.textContent?.trim().slice(0, 60)),
        visibleText: document.body.innerText,
        stats: [...document.querySelectorAll('.stat-number')].map((element) => element.textContent.trim()),
        invalidTargets: [...document.querySelectorAll('a[target="_blank"]')].filter((a) => !a.rel.includes('noopener')).map((a) => a.href),
        headline: [...document.querySelectorAll('.hero-headline, .hero-headline-mobile')].filter((el) => el.getClientRects().length).map((el) => {
          const range = document.createRange(); range.selectNodeContents(el); const box = range.getBoundingClientRect();
          return { text: el.textContent.trim(), left: box.left, right: box.right };
        }),
      }));
      assert(state.documentWidth <= width + 1, `Horizontal overflow: ${state.documentWidth}`);
      assert.equal(state.h1, 1);
      assert.equal(state.brokenAnchors.length, 0, JSON.stringify(state.brokenAnchors));
      await page.screenshot({ path: resolve(output, `portfolio-${width}.png`), fullPage: true });
      assert.equal(state.hiddenContent.length, 0, JSON.stringify(state.hiddenContent));
      assert.equal(state.images.filter((image) => !image.loaded).length, 0, 'Broken image');
      assert.deepEqual(state.stats, ['5+', '3+', '48HR', '1:1']);
      assert.equal(state.invalidTargets.length, 0);
      assert.equal(await page.locator('.portfolio-placeholder').count(), 5);
      assert.equal(await page.locator('a[data-video-id]').count(), 0);
      assert.equal(await page.locator('iframe, video').count(), 0, 'Media must not load before interaction');
      assert.equal(remote.length, 0, `Unexpected initial third-party requests: ${remote.join(', ')}`);
      assert.equal(errors.length, 0, errors.join('\n'));
      assert.equal(failed.length, 0, failed.join('\n'));
      for (const h of state.headline) assert(h.left >= -1 && h.right <= width + 1, `Headline clipped: ${JSON.stringify(h)}`);
      for (const link of site.social) assert(await page.locator(`footer a[href="${link.url}"]`).count(), `Missing ${link.name}`);
      assert(await page.locator(`a[href="tel:${site.contact.phone.replace(/\s/g, '')}"]`).count());
      assert(await page.locator(`a[href="mailto:${site.contact.email}"]`).count());
      await page.screenshot({ path: resolve(output, `portfolio-${width}.png`), fullPage: true });
      if ([375, 1440].includes(width)) {
        await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
        const axe = await page.evaluate(() => window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] } }));
        await writeFile(resolve(output, `accessibility-${width}.json`), JSON.stringify(axe.violations, null, 2));
        assert.equal(axe.violations.length, 0, axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join('; ')}`).join('\n'));
      }
      await context.close();
      return { width: state.width, documentWidth: state.documentWidth, errors, failed, initialRemoteRequests: remote.length };
    });
  }

  await check('Mobile navigation: touch, keyboard, outside click, Escape, anchors', async () => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    const page = await context.newPage(); await page.goto(origin); await page.evaluate(() => window.scrollTo(0, 250));
    const toggle = page.getByRole('button', { name: 'Toggle menu' });
    await toggle.tap(); assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
    await page.keyboard.press('Escape'); assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
    assert(await page.evaluate(() => document.activeElement?.id === 'mobile-menu-btn'));
    await page.keyboard.press('Enter'); assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
    await page.locator('#mobile-menu').getByRole('link', { name: 'Work', exact: true }).tap();
    assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
    await page.waitForFunction(() => Math.abs(document.getElementById('work').getBoundingClientRect().top - 100) < 5);
    await toggle.tap(); await page.mouse.click(10, 500); assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
    assert(await page.locator('#mobile-menu').evaluate((el) => el.inert));
    await context.close();
  });

  await check('Desktop carousel buttons and keyboard scrolling', async () => {
    const page = await browser.newPage({ viewport: { width: 768, height: 1000 }, reducedMotion: 'reduce' });
    await page.goto(origin);
    const track = page.locator('#track-editing'); await track.scrollIntoViewIfNeeded();
    const next = page.getByRole('button', { name: 'Next Video Editing items', exact: true });
    assert.equal(await next.isEnabled(), true);
    await next.click(); await page.waitForFunction(() => document.getElementById('track-editing').scrollLeft > 0);
    const advanced = await track.evaluate((el) => el.scrollLeft);
    await track.focus(); await page.keyboard.press('ArrowLeft');
    await page.waitForFunction(() => document.getElementById('track-editing').scrollLeft === 0);
    assert(advanced > 0); await page.close();
  });

  await check('Mobile carousel touch gesture', async () => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    const page = await context.newPage(); await page.goto(origin);
    const track = page.locator('#track-editing'); await track.scrollIntoViewIfNeeded();
    const box = await track.boundingBox();
    const session = await context.newCDPSession(page);
    const y = Math.min(600, box.y + 130);
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 330, y }] });
    for (const x of [285, 240, 195, 150, 105, 60]) {
      await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] });
      await page.waitForTimeout(20);
    }
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForFunction(() => document.getElementById('track-editing').scrollLeft > 0);
    await context.close();
  });

  await check('WhatsApp draft: recipient, form validation and encoded project brief', async () => {
    const page = await browser.newPage({ reducedMotion: 'reduce' }); await page.goto(origin);
    await page.locator('#submit-btn').scrollIntoViewIfNeeded();
    await page.locator('#submit-btn').click(); assert.equal(new URL(page.url()).origin, origin);
    await page.locator('#name').fill('Test Visitor');
    await page.locator('#email').fill('visitor@example.invalid');
    await page.locator('#phone').fill('+94 700 000 000');
    const brief = 'A cinematic edit — captions, colour & sound. Test: + ✓';
    await page.locator('#message').fill(brief);
    let destination;
    await page.route('https://wa.me/**', async (route) => { destination = new URL(route.request().url()); await route.fulfill({ body: '<title>Intercepted draft</title>' }); });
    await page.locator('#submit-btn').click(); await page.waitForURL('https://wa.me/**');
    assert.equal(destination.pathname, '/94755221163');
    const text = destination.searchParams.get('text');
    for (const content of ['Test Visitor', 'visitor@example.invalid', '+94 700 000 000', brief]) assert(text.includes(content));
    await page.close();
  });

  await check('Video lightbox: intentional embed, focus trap, Escape and cleanup', async () => {
    const page = await browser.newPage({ reducedMotion: 'reduce' }); await page.goto(origin);
    await page.route('https://www.youtube-nocookie.com/**', (route) => route.fulfill({ body: '<title>Test player</title>' }));
    await page.evaluate(() => {
      const card = document.createElement('a'); card.href = 'https://www.youtube.com/watch?v=abcdefghijk';
      card.dataset.videoId = 'browser-test-only'; card.dataset.platform = 'youtube'; card.dataset.title = 'Browser test fixture';
      card.textContent = 'Browser test fixture'; document.getElementById('work').prepend(card);
    });
    const card = page.getByRole('link', { name: 'Browser test fixture', exact: true });
    await card.click();
    assert(await page.locator('#video-lightbox').evaluate((dialog) => dialog.open));
    assert(await page.getByRole('button', { name: 'Close video' }).evaluate((button) => document.activeElement === button));
    assert.equal(await page.locator('#lightbox-video-container iframe').getAttribute('src'), 'https://www.youtube-nocookie.com/embed/abcdefghijk?autoplay=1&rel=0');
    await page.keyboard.press('Tab'); assert(await page.locator('#video-lightbox').evaluate((dialog) => dialog.contains(document.activeElement)));
    // Cross-origin players receive their own keyboard events. Return to the
    // dialog's original-link control before exercising the dialog's Escape key.
    await page.keyboard.press('Tab');
    assert(await page.locator('#media-original').evaluate((element) => document.activeElement === element));
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.getElementById('video-lightbox').open && !document.querySelector('#lightbox-video-container iframe'));
    assert.equal(await page.locator('iframe').count(), 0);
    assert(await card.evaluate((element) => document.activeElement === element));
    assert.equal(await page.locator('#video-lightbox').evaluate((dialog) => dialog.open), false);
    await card.click(); await page.getByRole('button', { name: 'Close video' }).click();
    await page.waitForFunction(() => !document.getElementById('video-lightbox').open);
    assert.equal(await page.locator('iframe').count(), 0);
    await card.click(); await page.mouse.click(1, 1);
    await page.waitForFunction(() => !document.getElementById('video-lightbox').open);
    assert.equal(await page.locator('iframe').count(), 0);
    await page.close();
  });

  await check('Reduced motion: visible content and no running CSS animations', async () => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    await page.goto(origin); await revealPage(page);
    assert.equal(await page.evaluate(() => document.getAnimations().filter((animation) => animation.playState === 'running').length), 0);
    assert.equal(await page.locator('#page-loader').count(), 0);
    await page.close();
  });

  await check('JavaScript disabled: content, portrait, links and direct WhatsApp fallback', async () => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await context.newPage(); await page.goto(origin);
    assert.equal(await page.locator('#page-loader').isVisible(), false);
    assert(await page.getByRole('heading', { name: 'WHAT I DO', exact: true }).isVisible());
    assert.equal(await page.locator('.about-image').evaluate((image) => getComputedStyle(image).clipPath), 'inset(0px)');
    assert.equal(await page.locator('#contact-form').getAttribute('action'), site.contact.whatsapp);
    assert(await page.locator(`a[href="${site.contact.whatsapp}"]`).count());
    await context.close();
  });
} finally {
  await writeFile(resolve(output, 'browser-results.json'), JSON.stringify({ results, problems }, null, 2));
  await browser.close(); await new Promise((done) => server.close(done));
}
assert.equal(problems.length, 0, JSON.stringify(problems, null, 2));
console.log(`All ${results.length} browser checks passed.`);
