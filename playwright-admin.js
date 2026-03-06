const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  // Login
  await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle', timeout: 15000 });
  await page.fill('input[type="text"]', 'admin');
  await page.fill('input[type="password"]', 'admin2026');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  console.log('After login, URL:', page.url());

  // Admin landing page section list
  await page.goto('http://localhost:3000/admin/content/landing-page', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/tmp/admin-sections.png', fullPage: true });
  console.log('Admin sections page captured');

  await browser.close();
})().catch(function(e) { console.error(e.message); });
