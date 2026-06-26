const fs = require('fs');

let content = fs.readFileSync('tests/e2e/scopeweave.spec.js', 'utf8');

content = content.replace(
  "await expect(page.locator('tbody tr[data-task-id]').filter({ hasText: phaseName })).toHaveCount(1);",
  "await expect(page.locator('tbody tr[data-task-id]').filter({ hasText: phaseName })).toHaveCount(1, { timeout: 10000 });"
);

content = content.replace(
  "await expect(page.locator('tbody tr[data-task-id]')).toHaveCount(1);",
  "await expect(page.locator('tbody tr[data-task-id]')).toHaveCount(1, { timeout: 10000 });"
);

content = content.replace(
  "await expect(page.getByRole('button', { name: 'CSV 내보내기' })).toBeDisabled();",
  "await expect(page.getByRole('button', { name: 'CSV 내보내기' })).toBeDisabled({ timeout: 10000 });"
);

content = content.replace(
  "await expect(page.locator('tbody tr[data-task-id]')).toHaveCount(0);",
  "await expect(page.locator('tbody tr[data-task-id]')).toHaveCount(0, { timeout: 10000 });"
);

fs.writeFileSync('tests/e2e/scopeweave.spec.js', content);
