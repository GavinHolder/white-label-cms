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
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto('http://localhost:3000/admin/content/landing-page', { waitUntil: 'networkidle', timeout: 20000 });
await new Promise(r => setTimeout(r, 1500));

// Button 19 = About Us "Edit Section"
const allBtns = await page.locator('button').all();
await allBtns[19].click();
await new Promise(r => setTimeout(r, 2000));

// Click "Open Designer" / "Edit in Designer" button in the modal
await page.locator('button:has-text("Designer")').first().click();
await new Promise(r => setTimeout(r, 3000)); // wait for designer iframe to load + init

// Screenshot canvas at desktop
await page.screenshot({ path: 'D:/tmp/canvas-desktop.png', fullPage: false });
console.log('canvas desktop');

// Now interact with the designer iframe
const designerFrame = page.frameLocator('iframe[src="/flexible-designer.html"]');

// Switch to tablet
await designerFrame.locator('#dev-tablet').click({ timeout: 8000 });
await new Promise(r => setTimeout(r, 2000));
await page.screenshot({ path: 'D:/tmp/canvas-tablet.png', fullPage: false });
console.log('canvas tablet');

// Switch to mobile
await designerFrame.locator('#dev-mobile').click({ timeout: 8000 });
await new Promise(r => setTimeout(r, 2000));
await page.screenshot({ path: 'D:/tmp/canvas-mobile.png', fullPage: false });
console.log('canvas mobile');

await browser.close();
console.log('DONE');
