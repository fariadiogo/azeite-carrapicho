// Loads the page with prefers-reduced-motion and checks the static fallback: <html class="no-motion">, the
// stones quote fully lit, and no script errors.
//
//   node tools/reduced-motion.mjs
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true, args: ['--disable-gpu'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(process.env.BASE_URL || 'http://localhost:4173/', { waitUntil: 'networkidle0' });
const r = await page.evaluate(() => ({
  noMotion: document.documentElement.classList.contains('no-motion'),
  quoteLit: getComputedStyle(document.querySelector('.stones__quote .w')).opacity === '1',
  height: document.documentElement.scrollHeight,
}));
console.log(JSON.stringify({ ...r, errors }));
await browser.close();
process.exit(r.noMotion && r.quoteLit && !errors.length ? 0 : 1);
