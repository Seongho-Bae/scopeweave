const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:4173');

  // Wait for initial render
  await page.waitForTimeout(1000);

  // Take screenshot
  await page.screenshot({ path: 'frontend_screenshot.png', fullPage: true });

  await browser.close();
})();
