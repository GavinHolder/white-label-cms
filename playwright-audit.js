const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 15000 });

  // Find snap scroll container
  const info = await page.evaluate(function() {
    var scrollers = [];
    var allEls = document.querySelectorAll('*');
    allEls.forEach(function(el) {
      var style = window.getComputedStyle(el);
      var snapType = style.scrollSnapType;
      if (snapType && snapType !== 'none') {
        scrollers.push({
          tag: el.tagName,
          id: el.id,
          className: el.className.substring(0, 60),
          scrollHeight: el.scrollHeight,
          clientHeight: el.clientHeight,
          snapType: snapType,
          overflowY: style.overflowY,
        });
      }
    });
    return scrollers;
  });
  console.log('SNAP CONTAINERS:', JSON.stringify(info, null, 2));

  // Get page structure - how many total sections
  const sections = await page.evaluate(function() {
    var mainSections = document.querySelectorAll('.cms-section');
    return Array.from(mainSections).map(function(s, i) {
      var h = s.querySelector('h1, h2, h3');
      var bg = window.getComputedStyle(s).background;
      return {
        index: i,
        offsetTop: s.offsetTop,
        classes: s.className.substring(0, 80),
        headingText: h ? h.textContent.trim().substring(0, 60) : null,
        bgColor: window.getComputedStyle(s).backgroundColor,
      };
    });
  });
  console.log('SECTIONS:', JSON.stringify(sections, null, 2));

  await browser.close();
})().catch(function(e) { console.error(e.message); });
