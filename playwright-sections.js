const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 15000 });

  // Screenshot section 1 (hero - offsetTop 0 of the snap container)
  await page.screenshot({ path: '/tmp/sec1-hero.png' });
  console.log('Section 1 (hero) captured');

  // Scroll snap container to section 2 (offsetTop 900)
  await page.evaluate(function() {
    var container = document.getElementById('snap-container');
    container.scrollTo({ top: 900, behavior: 'instant' });
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/tmp/sec2-about.png' });
  console.log('Section 2 (about) captured');

  // Scroll to section 3 (offsetTop 1800)
  await page.evaluate(function() {
    var container = document.getElementById('snap-container');
    container.scrollTo({ top: 1800, behavior: 'instant' });
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/tmp/sec3-cta.png' });
  console.log('Section 3 (CTA) captured');

  // Get count of children in snap container
  const snapInfo = await page.evaluate(function() {
    var container = document.getElementById('snap-container');
    var children = Array.from(container.children);
    return {
      childCount: children.length,
      totalScrollHeight: container.scrollHeight,
      children: children.map(function(c, i) {
        return {
          index: i,
          tag: c.tagName,
          className: c.className.substring(0, 80),
          offsetTop: c.offsetTop,
          id: c.id || null,
        };
      }),
    };
  });
  console.log('SNAP CONTAINER CHILDREN:', JSON.stringify(snapInfo, null, 2));

  await browser.close();
})().catch(function(e) { console.error(e.message); });
