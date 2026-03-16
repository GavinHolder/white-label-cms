import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });

async function login(browser) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/admin/login', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForSelector('#username', { timeout: 10000 });
  await page.fill('#username', 'admin');
  await page.fill('#password', 'admin2026');
  await page.click('button[type=submit]');
  await page.waitForFunction(() => !window.location.pathname.includes('/login'), { timeout: 10000 });
  return page;
}

const page = await login(browser);
await page.setViewportSize({ width: 1440, height: 1400 }); // tall viewport to see full preview
await page.goto('http://localhost:3000/admin/content/landing-page', { waitUntil: 'networkidle', timeout: 20000 });
await new Promise(r => setTimeout(r, 1500));

const allBtns = await page.locator('button').all();
await allBtns[19].click(); // About Us edit
await new Promise(r => setTimeout(r, 1500));

// Click Preview tab
await page.locator('text=Preview').first().click();
await new Promise(r => setTimeout(r, 1500));

// Screenshot Desktop preview
await page.screenshot({ path: 'D:/tmp/AFTER2-preview-desktop.png', fullPage: false });
console.log('desktop preview');

// Click Mobile
await page.locator('button:has-text("Mobile")').first().click();
await new Promise(r => setTimeout(r, 3500));

await page.screenshot({ path: 'D:/tmp/AFTER2-preview-mobile-tall.png', fullPage: false });
console.log('mobile preview tall');

// Click Tablet
await page.locator('button:has-text("Tablet")').first().click();
await new Promise(r => setTimeout(r, 3500));

await page.screenshot({ path: 'D:/tmp/AFTER2-preview-tablet.png', fullPage: false });
console.log('tablet preview');

await browser.close();
console.log('DONE');
