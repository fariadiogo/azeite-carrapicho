// Screenshots of the running page (http://localhost:4173 by default) at one viewport.
//
//   node tools/shoot.mjs <width> <height> <outPrefix> <spec>...
//
// Each spec is label=selector@offset or label=@absoluteY. The offset is in % of the viewport height from the top
// of that element (or of its pin spacer, for pinned sections). Screens narrower than 768px are emulated as a phone
// (touch, mobile UA); MOBILE=1 forces that for wider ones, e.g. a phone on its side. The script scrolls there in
// steps, so scrubbed timelines and once-only reveals play as they would for a reader.
//
// Env: BASE_URL (default http://localhost:4173/), CHROME (path to Chrome; default the macOS app).
import puppeteer from 'puppeteer-core';

const [w, h, prefix, ...specs] = process.argv.slice(2);
if (!specs.length) {
  console.error('usage: node tools/shoot.mjs <width> <height> <outPrefix> <label=selector@offsetVh | label=@absY>...');
  process.exit(1);
}
const phone = +w < 768 || process.env.MOBILE === '1';
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true, args: ['--hide-scrollbars', '--disable-gpu', '--disable-dev-shm-usage'],
});
const page = await browser.newPage();
await page.setViewport({ width: +w, height: +h, deviceScaleFactor: 1, isMobile: phone, hasTouch: phone, isLandscape: phone && +w > +h });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto(process.env.BASE_URL || 'http://localhost:4173/', { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 1500));
for (const spec of specs) {
  const [label, target] = spec.split('=');
  const [sel, off] = target.split('@');
  const y = await page.evaluate((sel, off) => {
    if (!sel) return +off;
    const el = document.querySelector(sel);
    const top = (el.closest('.pin-spacer') || el).getBoundingClientRect().top + scrollY;
    return Math.round(top + (parseFloat(off || 0) * innerHeight) / 100);
  }, sel, off);
  await page.evaluate(async (y) => {
    const from = scrollY, steps = 12;
    for (let i = 1; i <= steps; i++) { window.scrollTo(0, from + ((y - from) * i) / steps); await new Promise((r) => setTimeout(r, 60)); }
  }, y);
  await new Promise((r) => setTimeout(r, 1600));
  await page.screenshot({ path: `${prefix}-${label}.jpg`, type: 'jpeg', quality: 72 });
  console.log(label, y);
}
// the favicon 404 is known and harmless
const real = errors.filter((e) => !/404/.test(e));
console.log('errors:', real.length ? real.join(' | ') : 'none');
await browser.close();
