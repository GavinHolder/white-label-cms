const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 15000 });

  // Scroll to flexible section (offsetTop 11700 in snap container)
  await page.evaluate(function() {
    var container = document.getElementById('snap-container');
    container.scrollTo({ top: 11700, behavior: 'instant' });
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: '/tmp/sec-flexible.png' });
  console.log('Flexible section captured');

  // Scroll to footer (offsetTop 12600?)
  await page.evaluate(function() {
    var container = document.getElementById('snap-container');
    container.scrollTo({ top: 12600, behavior: 'instant' });
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: '/tmp/sec-footer.png' });
  console.log('Footer section captured');

  // Also capture a DEMO section — Lower Third Wave at order 10
  // It would be around offsetTop 900 * 10 = 9000 from position within the snap container
  // But we found those sections had offsetTop 0 - they must be in a nested scrollable
  // Let's check what's at offset 2700 in snap container (section 4)
  await page.evaluate(function() {
    var container = document.getElementById('snap-container');
    container.scrollTo({ top: 2700, behavior: 'instant' });
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: '/tmp/sec4.png' });
  console.log('Section 4 captured');

  // Section 5
  await page.evaluate(function() {
    var container = document.getElementById('snap-container');
    container.scrollTo({ top: 3600, behavior: 'instant' });
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: '/tmp/sec5.png' });
  console.log('Section 5 captured');

  // Section 6
  await page.evaluate(function() {
    var container = document.getElementById('snap-container');
    container.scrollTo({ top: 4500, behavior: 'instant' });
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: '/tmp/sec6.png' });
  console.log('Section 6 captured');

  await browser.close();
})().catch(function(e) { console.error(e.message); });
