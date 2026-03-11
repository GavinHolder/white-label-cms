const { chromium } = require('./node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('pageerror', e => console.error('PAGE ERR:', e.message));
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto('http://localhost:3000/volt-designer.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const svgBox = await page.locator('svg#volt-canvas').boundingBox();
  const cx = svgBox.x + svgBox.width / 2;
  const cy = svgBox.y + svgBox.height / 2;

  // Draw first rect
  await page.keyboard.press('r');
  await page.waitForTimeout(100);
  await page.mouse.move(cx - 100, cy - 60);
  await page.mouse.down();
  await page.mouse.move(cx + 10, cy + 60);
  await page.mouse.up();
  await page.waitForTimeout(300);

  // Draw second rect
  await page.keyboard.press('r');
  await page.waitForTimeout(100);
  await page.mouse.move(cx - 30, cy - 30);
  await page.mouse.down();
  await page.mouse.move(cx + 90, cy + 80);
  await page.mouse.up();
  await page.waitForTimeout(300);

  // Switch to select tool
  await page.locator('[data-tool="select"]').click();
  await page.waitForTimeout(200);

  // Click second rect (cutter)
  await page.mouse.click(cx + 40, cy + 20);
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'test-bool-01-cutter.png' });
  console.log('screenshot 1: cutter selected');

  // Shift+click first rect (base)
  await page.mouse.click(cx - 60, cy, { modifiers: ['Shift'] });
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'test-bool-02-base.png' });
  console.log('screenshot 2: base set');

  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
