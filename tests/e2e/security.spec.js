const { test, expect } = require('@playwright/test');

test.describe('Security fixes', () => {
  test('createId should throw error when crypto functions are unavailable', async ({ page }) => {
    // Intercept page errors directly
    const errors = [];
    page.on('pageerror', error => {
      errors.push(error.message);
    });

    // Replace crypto with undefined, and trigger the UI action
    await page.addInitScript(() => {
      Object.defineProperty(window, 'crypto', { value: undefined, configurable: true });
    });

    await page.goto('/');

    // Attempt to add a root task, which will call createId via openEditor -> createId
    await page.getByRole('button', { name: '최상위 작업 추가' }).click();

    // Check that we intercepted the expected error
    // In Chromium, standard Error throws get prefixed with "Error: "
    expect(errors.some(msg => msg.includes('Secure random number generation is not supported by this browser.'))).toBe(true);
  });
});
