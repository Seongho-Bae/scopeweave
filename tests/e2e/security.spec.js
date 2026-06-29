const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('Security tests', () => {
  test('createId should throw error when crypto is unavailable', async ({ page }) => {
    const appJsContent = fs.readFileSync(path.join(process.cwd(), 'app.js'), 'utf-8');

    const errorMsg = await page.evaluate((code) => {
      try {
        const evalContext = `
          let crypto = undefined;
          let window = { crypto: undefined };
          ${code}
          return createId();
        `;

        const func = new Function(evalContext);
        func();

        return null;
      } catch (err) {
        return err.message;
      }
    }, appJsContent);

    expect(errorMsg).toContain('Secure random number generation is not supported');
  });
});
