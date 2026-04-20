const { test, expect } = require('@playwright/test');

const addTopLevelTask = async (page, values) => {
  await page.getByRole('button', { name: '최상위 작업 추가' }).click();
  await page.locator('[data-testid="editor-phase"]').fill(values.phase);
  await page.locator('[data-testid="editor-category-large"]').fill(values.categoryLarge);
  await page.locator('[data-testid="editor-owner"]').fill(values.owner);
  await page.locator('[data-testid="editor-planned-start"]').fill(values.plannedStartDate);
  await page.locator('[data-testid="editor-planned-end"]').fill(values.plannedEndDate);
  await page.getByRole('button', { name: '저장', exact: true }).click();
};

const readHierarchySnapshot = async (page) => page.locator('tbody tr[data-task-id]').evaluateAll((rows) => rows.map((row) => ({
  phase: row.children[1]?.innerText.trim() || '',
  activity: row.children[2]?.innerText.trim() || '',
  task: row.children[3]?.innerText.trim() || ''
})));

test.describe('ScopeWeave Planner', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.__savedWbsJson = null;
      window.showSaveFilePicker = async () => ({
        async createWritable() {
          return {
            async write(content) {
              window.__savedWbsJson = content;
            },
            async close() {}
          };
        }
      });
    });
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders seeded rows and summary metrics', async ({ page }) => {
    await expect(page.getByRole('button', { name: '최상위 작업 추가' })).toBeVisible();
    await expect(page.locator('tbody tr[data-task-id]')).toHaveCount(4);
    await expect(page.getByTestId('project-name-input')).toHaveValue(/ScopeWeave/i);
    await expect(page.getByTestId('summary-total-days')).not.toHaveText('0일');
    await expect(page.getByTestId('summary-planned-progress')).toContainText('%');
    await expect(page.getByTestId('summary-actual-progress')).toContainText('%');
  });

  test('adds a top-level task and restores it after reload', async ({ page }) => {
    const phaseName = 'P1000.분석단계';

    await addTopLevelTask(page, {
      phase: phaseName,
      categoryLarge: '요구사항분석',
      owner: '홍길동',
      plannedStartDate: '2026-05-18',
      plannedEndDate: '2026-05-20'
    });

    await expect(page.locator('tbody tr[data-task-id]').filter({ hasText: phaseName })).toHaveCount(1);
    await page.reload();
    await expect(page.locator('tbody tr[data-task-id]').filter({ hasText: phaseName })).toHaveCount(1);
  });

  test('adds child row with copied parent values and blocks fourth depth', async ({ page }) => {
    await page.locator('tbody tr[data-task-id]').first().getByRole('button', { name: '+ 하위 추가' }).click();
    await expect(page.locator('[data-testid="editor-phase"]')).toHaveValue('P0000.준비단계');
    await page.locator('[data-testid="editor-activity"]').fill('프로젝트준비 하위');
    await page.getByRole('button', { name: '저장', exact: true }).click();

    const childRow = page.locator('tbody tr[data-task-id]').filter({ hasText: '프로젝트준비 하위' });
    await expect(childRow).toHaveCount(1);
    await childRow.getByRole('button', { name: '+ 하위 추가' }).click();
    await page.locator('[data-testid="editor-task"]').fill('세부업무');
    await page.getByRole('button', { name: '저장', exact: true }).click();

    const leafRow = page.locator('tbody tr[data-task-id]').filter({ hasText: '세부업무' });
    await expect(leafRow).toHaveCount(1);
    await expect(leafRow.getByRole('button', { name: '+ 하위 추가' })).toBeDisabled();
  });

  test('opens gantt modal and renders chart bars', async ({ page }) => {
    await page.getByRole('button', { name: '간트차트보기' }).click();
    await expect(page.getByRole('dialog', { name: '간트 차트' })).toBeVisible();
    await expect(page.locator('.gantt-bar.plan')).toHaveCount(2);
  });

  test('keeps descendant rows attached when reordering an activity subtree', async ({ page }) => {
    await page.locator('tbody tr[data-task-id]').first().getByRole('button', { name: '+ 하위 추가' }).click();
    await page.locator('[data-testid="editor-activity"]').fill('테스트 활동');
    await page.getByRole('button', { name: '저장', exact: true }).click();

    const secondActivityRow = page.locator('tbody tr[data-task-id].depth-2').filter({ has: page.locator('td:nth-child(3)', { hasText: /^테스트 활동$/ }) });
    await secondActivityRow.getByRole('button', { name: '+ 하위 추가' }).click();
    await page.locator('[data-testid="editor-task"]').fill('테스트 태스크');
    await page.getByRole('button', { name: '저장', exact: true }).click();

    const firstActivityRow = page.locator('tbody tr[data-task-id].depth-2').filter({ has: page.locator('td:nth-child(3)', { hasText: /^프로젝트준비$/ }) }).first();
    const secondActivityBox = await secondActivityRow.boundingBox();
    await firstActivityRow.dragTo(secondActivityRow, {
      targetPosition: { x: 20, y: Math.max(4, Math.round((secondActivityBox?.height || 40) - 4)) }
    });

    const snapshot = await readHierarchySnapshot(page);
    const activityIndex = snapshot.findIndex((row) => row.activity === '테스트 활동');
    expect(snapshot[activityIndex + 1].task).toBe('테스트 태스크');
    expect(snapshot[activityIndex + 2].activity).toBe('프로젝트준비');
  });

  test('can move a later activity subtree before an earlier sibling', async ({ page }) => {
    await page.locator('tbody tr[data-task-id]').first().getByRole('button', { name: '+ 하위 추가' }).click();
    await page.locator('[data-testid="editor-activity"]').fill('테스트 활동');
    await page.getByRole('button', { name: '저장', exact: true }).click();

    const secondActivityRow = page.locator('tbody tr[data-task-id].depth-2').filter({ has: page.locator('td:nth-child(3)', { hasText: /^테스트 활동$/ }) });
    await secondActivityRow.getByRole('button', { name: '+ 하위 추가' }).click();
    await page.locator('[data-testid="editor-task"]').fill('테스트 태스크');
    await page.getByRole('button', { name: '저장', exact: true }).click();

    const firstActivityRow = page.locator('tbody tr[data-task-id].depth-2').filter({ has: page.locator('td:nth-child(3)', { hasText: /^프로젝트준비$/ }) }).first();
    await secondActivityRow.dragTo(firstActivityRow, { targetPosition: { x: 20, y: 4 } });

    const snapshot = await readHierarchySnapshot(page);
    const firstMovedActivityIndex = snapshot.findIndex((row) => row.activity === '테스트 활동');
    expect(firstMovedActivityIndex).toBe(1);
    expect(snapshot[firstMovedActivityIndex + 1].task).toBe('테스트 태스크');
  });

  test('confirms before deleting a row', async ({ page }) => {
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      await dialog.accept();
    });

    await page.locator('tbody tr[data-task-id]').filter({ hasText: '단계작업계획' }).first().getByRole('button', { name: '🗑️ 삭제' }).click();

    await expect(page.locator('tbody tr[data-task-id]').filter({ hasText: '단계작업계획' })).toHaveCount(0);
  });

  test('writes autosaved wbs.json in the requested external shape', async ({ page }) => {
    await page.getByRole('button', { name: 'wbs.json 자동저장 연결' }).click();

    const savedPayload = await page.evaluate(() => JSON.parse(window.__savedWbsJson));
    expect(savedPayload).toHaveLength(2);
    expect(savedPayload[0]).not.toHaveProperty('__id');
    expect(savedPayload[0]).not.toHaveProperty('__parentId');
    expect(savedPayload[0]).not.toHaveProperty('__depth');
    expect(savedPayload[0].task).toBe('사업수행계획');
    expect(savedPayload[1].task).toBe('단계작업계획');
  });
});
