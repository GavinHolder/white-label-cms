import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto('http://localhost:3000/admin/login', { waitUntil: 'domcontentloaded', timeout: 15000 });
await page.fill('#username', 'admin');
await page.fill('#password', 'admin2026');
await page.click('button[type=submit]');
await page.waitForFunction(() => !window.location.pathname.includes('/login'), { timeout: 10000 });

// Desktop view of landing page
await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
await new Promise(r => setTimeout(r, 2000));
// Scroll to About Us section
await page.evaluate(() => {
  const all = document.querySelectorAll('[class*="flexible-section"], section, .cms-section');
  for (const s of all) {
    if (s.textContent.includes('Family-owned') || s.textContent.includes('Overberg ReadyMix')) {
      s.scrollIntoView({ behavior: 'instant' });
      break;
    }
  }
});
await new Promise(r => setTimeout(r, 800));
await page.screenshot({ path: 'D:/tmp/live-about-us-desktop.png' });
console.log('live about-us desktop');

// Now open in designer to compare
await page.goto('http://localhost:3000/admin/content/landing-page', { waitUntil: 'networkidle', timeout: 20000 });
await new Promise(r => setTimeout(r, 1500));
const allBtns = await page.locator('button').all();
await allBtns[19].click();
await new Promise(r => setTimeout(r, 2000));
await page.locator('button:has-text("Designer")').first().click();
await new Promise(r => setTimeout(r, 3000));
await page.screenshot({ path: 'D:/tmp/live-designer-desktop.png' });
console.log('designer desktop');

await browser.close();
console.log('DONE');
