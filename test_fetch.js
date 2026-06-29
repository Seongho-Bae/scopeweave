const { test, expect } = require('@playwright/test');
test('fetch timeout', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173');
});
