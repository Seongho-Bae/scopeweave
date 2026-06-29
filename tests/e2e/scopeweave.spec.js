const { test, expect } = require('@playwright/test');
const fs = require('fs');

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

const importCsv = async (page, csvText) => {
  await page.locator('#csv-file-input').setInputFiles({
    name: 'wbs_export_20260420.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(csvText, 'utf8')
  });
};

const createActivitySubtree = async (page, activityName, taskName) => {
  await page.locator('tbody tr[data-task-id]').first().getByRole('button', { name: '하위 추가' }).click();
  await page.locator('[data-testid="editor-activity"]').fill(activityName);
  await page.getByRole('button', { name: '저장', exact: true }).click();

  const activityRow = page.locator('tbody tr[data-task-id].depth-2').filter({ has: page.locator('td:nth-child(3)', { hasText: new RegExp(`^${activityName}$`) }) });
  await activityRow.getByRole('button', { name: '하위 추가' }).click();
  await page.locator('[data-testid="editor-task"]').fill(taskName);
  await page.getByRole('button', { name: '저장', exact: true }).click();

  return activityRow;
};

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
    await page.goto('./');
  });

  test('renders seeded rows and summary metrics', async ({ page }) => {
    await expect(page.getByRole('button', { name: '최상위 작업 추가' })).toBeVisible();
    await expect(page.locator('tbody tr[data-task-id]')).toHaveCount(4);
    await expect(page.getByTestId('project-name-input')).toHaveValue(/ScopeWeave/i);
    await expect(page.getByTestId('summary-total-days')).not.toHaveText('0일');
    await expect(page.getByTestId('summary-planned-progress')).toContainText('%');
    await expect(page.getByTestId('summary-actual-progress')).toContainText('%');
  });

  test('disables export and gantt actions when there are no tasks', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('scopeweave:planner-state:v1', JSON.stringify({
        projectName: 'Empty Scope',
        baseDate: '2026-04-20',
        tasks: []
      }));
    });
    await page.reload();

    await expect(page.locator('tbody tr[data-task-id]')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'CSV 내보내기' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'CSV 내보내기' })).toHaveAttribute('title', '내보낼 작업이 없습니다. 하단의 버튼을 통해 작업을 추가해주세요.');
    await expect(page.getByRole('button', { name: '간트차트보기' })).toBeDisabled();
    await expect(page.getByRole('button', { name: '간트차트보기' })).toHaveAttribute('title', '간트 차트로 표시할 작업이 없습니다. 작업을 먼저 추가해주세요.');
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
    await page.locator('tbody tr[data-task-id]').first().getByRole('button', { name: '하위 추가' }).click();
    await expect(page.locator('[data-testid="editor-phase"]')).toHaveValue('P0000.준비단계');
    await page.locator('[data-testid="editor-activity"]').fill('프로젝트준비 하위');
    await page.getByRole('button', { name: '저장', exact: true }).click();

    const childRow = page.locator('tbody tr[data-task-id]').filter({ hasText: '프로젝트준비 하위' });
    await expect(childRow).toHaveCount(1);
    await childRow.getByRole('button', { name: '하위 추가' }).click();
    await page.locator('[data-testid="editor-task"]').fill('세부업무');
    await page.getByRole('button', { name: '저장', exact: true }).click();

    const leafRow = page.locator('tbody tr[data-task-id]').filter({ hasText: '세부업무' });
    await expect(leafRow).toHaveCount(1);
    await expect(leafRow.getByRole('button', { name: '하위 추가' })).toBeDisabled();
  });

  test('opens gantt modal and renders chart bars with correct inline styles', async ({ page }) => {
    await page.getByRole('button', { name: '간트차트보기' }).click();
    await expect(page.getByRole('dialog', { name: '간트 차트' })).toBeVisible();
    await expect(page.locator('.gantt-bar.plan')).toHaveCount(2);
    
    const firstBar = page.locator('.gantt-bar.plan').first();
    await expect(firstBar).toHaveAttribute('style', /width:\s*\d+px/);
    await expect(firstBar).toHaveAttribute('style', /left:\s*\d+px/);
  });

  test('does not create HTML elements from manual text in the gantt chart', async ({ page }) => {
    let dialogOpened = false;
    page.on('dialog', async (dialog) => {
      dialogOpened = true;
      await dialog.dismiss();
    });

    await addTopLevelTask(page, {
      phase: '<svg/onload=alert(1)>',
      categoryLarge: '간트검증',
      owner: '담당자A',
      plannedStartDate: '2026-05-18',
      plannedEndDate: '2026-05-20'
    });

    await page.getByRole('button', { name: '간트차트보기' }).click();
    await expect(page.getByRole('dialog', { name: '간트 차트' })).toBeVisible();
    await expect(page.locator('#gantt-content img, #gantt-content svg')).toHaveCount(0);
    await page.waitForTimeout(100);
    expect(dialogOpened).toBe(false);
  });

  test('does not expose generated gantt rendering as a global XSS gadget', async ({ page }) => {
    let dialogOpened = false;
    page.on('dialog', async (dialog) => {
      dialogOpened = true;
      await dialog.dismiss();
    });

    await page.getByRole('button', { name: '간트차트보기' }).click();
    await expect(page.getByRole('dialog', { name: '간트 차트' })).toBeVisible();

    await expect.poll(async () => page.evaluate(() => typeof window.setGanttContent)).toBe('undefined');
    await expect(page.locator('#gantt-content img, #gantt-content svg, #gantt-content script, #gantt-content iframe, #gantt-content object')).toHaveCount(0);
    await expect(page.locator('#gantt-content [onclick], #gantt-content [onerror], #gantt-content [onload], #gantt-content [onmouseover]')).toHaveCount(0);
    await expect(page.locator('#gantt-content [style*="javascript"]')).toHaveCount(0);
    await page.waitForTimeout(100);
    expect(dialogOpened).toBe(false);
  });

  test('escapes quotes from manual text before rendering editor attributes', async ({ page }) => {
    const ownerPayload = '" onmouseover="alert(1)';

    await addTopLevelTask(page, {
      phase: '속성검증',
      categoryLarge: '보안검증',
      owner: ownerPayload,
      plannedStartDate: '2026-05-18',
      plannedEndDate: '2026-05-20'
    });

    const taskRow = page.locator('tbody tr[data-task-id]').filter({ hasText: '속성검증' }).first();
    await taskRow.getByRole('button', { name: '편집' }).click();

    const ownerInput = page.locator('[data-testid="editor-owner"]');
    await expect(ownerInput).toHaveValue(ownerPayload);
    await expect(ownerInput).not.toHaveAttribute('onmouseover', /alert/);
  });

  test('keeps descendant rows attached when reordering an activity subtree', async ({ page }) => {
    const secondActivityRow = await createActivitySubtree(page, '테스트 활동', '테스트 태스크');

    const firstActivityRow = page.locator('tbody tr[data-task-id].depth-2').filter({ has: page.locator('td:nth-child(3)', { hasText: /^프로젝트준비$/ }) }).first();
    const secondActivityBox = await secondActivityRow.boundingBox();
    await firstActivityRow.dragTo(secondActivityRow, {
      targetPosition: { x: 20, y: Math.max(4, Math.round((secondActivityBox?.height || 40) - 4)) }
    });

    const snapshot = await readHierarchySnapshot(page);
    const activityIndex = snapshot.findIndex((row) => row.activity === '테스트 활동');
    expect(activityIndex).toBeGreaterThan(-1);
    expect(snapshot[activityIndex + 1].task).toBe('테스트 태스크');
    expect(snapshot[activityIndex + 2].activity).toBe('프로젝트준비');
  });

  test('can move a later activity subtree before an earlier sibling', async ({ page }) => {
    const secondActivityRow = await createActivitySubtree(page, '테스트 활동', '테스트 태스크');

    const firstActivityRow = page.locator('tbody tr[data-task-id].depth-2').filter({ has: page.locator('td:nth-child(3)', { hasText: /^프로젝트준비$/ }) }).first();
    await secondActivityRow.dragTo(firstActivityRow, { targetPosition: { x: 20, y: 4 } });

    const snapshot = await readHierarchySnapshot(page);
    const firstMovedActivityIndex = snapshot.findIndex((row) => row.activity === '테스트 활동');
    expect(firstMovedActivityIndex).toBeGreaterThan(-1);
    expect(firstMovedActivityIndex).toBe(1);
    expect(snapshot[firstMovedActivityIndex + 1].task).toBe('테스트 태스크');
  });

  test('keeps the row when delete confirmation is cancelled', async ({ page }) => {
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      await dialog.dismiss();
    });

    await page.locator('tbody tr[data-task-id]').filter({ hasText: '단계작업계획' }).first().getByRole('button', { name: '삭제' }).click();

    await expect(page.locator('tbody tr[data-task-id]').filter({ hasText: '단계작업계획' })).toHaveCount(1);
  });

  test('confirms before deleting a row', async ({ page }) => {
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      await dialog.accept();
    });

    await page.locator('tbody tr[data-task-id]').filter({ hasText: '단계작업계획' }).first().getByRole('button', { name: '삭제' }).click();

    await expect(page.locator('tbody tr[data-task-id]').filter({ hasText: '단계작업계획' })).toHaveCount(0);
  });

  test('writes autosaved wbs.json in the requested external shape', async ({ page }) => {
    await page.getByRole('button', { name: 'wbs.json 자동저장 연결' }).click();

    await expect.poll(async () => page.evaluate(() => window.__savedWbsJson)).not.toBeNull();
    const savedPayload = await page.evaluate(() => JSON.parse(window.__savedWbsJson));
    expect(savedPayload).toHaveLength(2);
    expect(savedPayload[0]).not.toHaveProperty('__id');
    expect(savedPayload[0]).not.toHaveProperty('__parentId');
    expect(savedPayload[0]).not.toHaveProperty('__depth');
    expect(savedPayload[0]).toHaveProperty('plannedEndDate');
    expect(savedPayload[0]).toHaveProperty('plannedEnd' + 'Ddate', savedPayload[0].plannedEndDate);
    expect(savedPayload[0].task).toBe('사업수행계획');
    expect(savedPayload[1].task).toBe('단계작업계획');
  });

  test('restores legacy planned end dates from local storage', async ({ page }) => {
    await page.evaluate(() => {
      const legacyPlannedEndField = 'plannedEnd' + 'Ddate';
      localStorage.setItem('scopeweave:planner-state:v1', JSON.stringify({
        projectName: 'Legacy Project',
        baseDate: '2026-05-10',
        tasks: [
          null,
          'corrupt-task',
          {
            id: 'legacy-1',
            parentId: null,
            depth: 1,
            expanded: true,
            phase: 'P1000.레거시',
            activity: '',
            task: '레거시 작업',
            categoryLarge: '분석',
            categoryMedium: '',
            documentName: '',
            owner: '담당자',
            supportTeam: '',
            plannedStartDate: '2026-05-01',
            [legacyPlannedEndField]: '2026-05-20',
            actualProgressStatus: '미착수(0%)',
            actualStartDate: '',
            actualEndDate: ''
          }
        ]
      }));
    });
    await page.reload();

    await expect(page.locator('tbody tr[data-task-id]')).toHaveCount(1);
    const firstRow = page.locator('tbody tr[data-task-id]').first();
    await expect(firstRow).toContainText('2026-05-20');

    await page.getByRole('button', { name: 'wbs.json 자동저장 연결' }).click();
    await expect.poll(async () => page.evaluate(() => window.__savedWbsJson)).not.toBeNull();
    const savedPayload = await page.evaluate(() => JSON.parse(window.__savedWbsJson));
    expect(savedPayload[0]).toHaveProperty('plannedEndDate', '2026-05-20');
    expect(savedPayload[0]).toHaveProperty('plannedEnd' + 'Ddate', '2026-05-20');
  });

  test('counts same-day work as one day for totals and weights', async ({ page }) => {
    await addTopLevelTask(page, {
      phase: 'P2000.검증단계',
      categoryLarge: '동일일자검증',
      owner: '담당자A',
      plannedStartDate: '2026-05-20',
      plannedEndDate: '2026-05-20'
    });

    await expect(page.getByTestId('summary-total-days')).toHaveText('12일');
    const taskRow = page.locator('tbody tr[data-task-id]').filter({ hasText: '동일일자검증' });
    await expect(taskRow.locator('[data-testid="task-duration-days"]')).toContainText('1');
    await expect(taskRow.locator('[data-testid="task-weight-ratio"]')).not.toContainText('0.000');
  });

  test('rejects planned end dates before start dates in the editor', async ({ page }) => {
    await page.getByRole('button', { name: '최상위 작업 추가' }).click();
    await page.locator('[data-testid="editor-phase"]').fill('P3000.검증단계');
    await page.locator('[data-testid="editor-category-large"]').fill('일정검증');
    await page.locator('[data-testid="editor-owner"]').fill('담당자A');
    await page.locator('[data-testid="editor-planned-start"]').fill('2026-05-20');
    await page.locator('[data-testid="editor-planned-end"]').fill('2026-05-19');
    await page.getByRole('button', { name: '저장', exact: true }).click();

    await expect(page.locator('#editor-errors')).toContainText('계획종료일은 계획시작일보다 빠를 수 없습니다');
    await expect(page.locator('tbody tr[data-task-id]')).toHaveCount(4);
    await expect(page.locator('.editor-panel')).toBeVisible();
  });

  test('rejects invalid calendar dates in the editor', async ({ page }) => {
    await page.getByRole('button', { name: '최상위 작업 추가' }).click();
    await page.locator('[data-testid="editor-phase"]').fill('P3000.검증단계');
    await page.locator('[data-testid="editor-planned-start"]').evaluate((input) => {
      input.setAttribute('type', 'text');
    });

    await page.locator('[data-testid="editor-planned-start"]').fill('2026-02-31');
    await page.getByRole('button', { name: '저장', exact: true }).click();

    await expect(page.locator('#editor-errors')).toContainText('계획시작일은 YYYY-MM-DD 형식의 실제 달력 날짜여야 합니다');
    await expect(page.locator('tbody tr[data-task-id]')).toHaveCount(4);
    await expect(page.locator('.editor-panel')).toBeVisible();
  });

  test('rejects invalid calendar dates from imported CSV', async ({ page }) => {
    await importCsv(page, ['단계,Activity,Task,대분류,중분류,산출물,담당자,지원팀,진행상태,계획시작일,계획종료일,일수,계획진척률,가중치,가중치진척률,실적진척상태,실적진척률,실적시작일,실적종료일,가중치실적진척률', 'P3000.검증단계,,잘못된날짜,검증,,,담당자A,,,2026-02-31,2026-03-02,,,미착수(0%),,,'].join('\n'));

    await expect(page.locator('#toast')).toContainText('CSV 가져오기에 실패했습니다');
    await expect(page.locator('tbody tr[data-task-id]')).toHaveCount(4);
  });

  test('rejects imported CSV rows with planned end dates before start dates', async ({ page }) => {
    await importCsv(page, ['단계,Activity,Task,대분류,중분류,산출물,담당자,지원팀,진행상태,계획시작일,계획종료일,일수,계획진척률,가중치,가중치진척률,실적진척상태,실적진척률,실적시작일,실적종료일,가중치실적진척률', 'P3000.검증단계,,역전일정,검증,,,담당자A,,,2026-03-05,2026-03-02,,,미착수(0%),,,'].join('\n'));

    await expect(page.locator('#toast')).toContainText('계획종료일은 계획시작일보다 빠를 수 없습니다');
    await expect(page.locator('tbody tr[data-task-id]')).toHaveCount(4);
  });

  test('rejects HTML payloads from imported CSV', async ({ page }) => {
    await importCsv(page, ['단계,Activity,Task,대분류,중분류,산출물,담당자,지원팀,진행상태,계획시작일,계획종료일,일수,계획진척률,가중치,가중치진척률,실적진척상태,실적진척률,실적시작일,실적종료일,가중치실적진척률', 'P3000.검증단계,,<img src=x onerror=alert(1)>,검증,,,담당자A,,,2026-03-01,2026-03-02,,,미착수(0%),,,'].join('\n'));

    await expect(page.locator('#toast')).toContainText('HTML 태그 문자를 사용할 수 없습니다');
    await expect(page.locator('tbody tr[data-task-id]')).toHaveCount(4);
    await expect(page.locator('tbody')).not.toContainText('onerror');
  });

  test('rejects HTML payloads from imported CSV internal columns', async ({ page }) => {
    const header = ['단계', 'Activity', 'Task', '대분류', '중분류', '산출물', '담당자', '지원팀', '진행상태', '계획시작일', '계획종료일', '일수', '계획진척률', '가중치', '가중치진척률', '실적진척상태', '실적진척률', '실적시작일', '실적종료일', '가중치실적진척률', '__id', '__parentId', '__depth'];
    const row = ['P3000.검증단계', '', '내부컬럼검증', '검증', '', '', '담당자A', '', '', '2026-03-01', '2026-03-02', '', '', '', '', '미착수(0%)', '', '', '', '', '<img src=x onerror=alert(1)>', '', '3'];

    await importCsv(page, [header.join(','), row.join(',')].join('\n'));

    await expect(page.locator('#toast')).toContainText('HTML 태그 문자를 사용할 수 없습니다');
    await expect(page.locator('tbody tr[data-task-id]')).toHaveCount(4);
    await expect(page.locator('tbody')).not.toContainText('onerror');
  });

  test('rejects overlong imported CSV cells without truncating', async ({ page }) => {
    const overlongTaskName = 'A'.repeat(1001);

    await importCsv(page, ['단계,Activity,Task,대분류,중분류,산출물,담당자,지원팀,진행상태,계획시작일,계획종료일,일수,계획진척률,가중치,가중치진척률,실적진척상태,실적진척률,실적시작일,실적종료일,가중치실적진척률', `P3000.검증단계,,${overlongTaskName},검증,,,담당자A,,,2026-03-01,2026-03-02,,,미착수(0%),,,`].join('\n'));

    await expect(page.locator('#toast')).toContainText('Task 컬럼은 1000자 이하로 입력해야 합니다');
    await expect(page.locator('tbody tr[data-task-id]')).toHaveCount(4);
    await expect(page.locator('tbody')).not.toContainText(overlongTaskName.substring(0, 1000));
  });

  test('normalizes imported task rows into a full phase-activity-task hierarchy', async ({ page }) => {
    await importCsv(page, ['단계,Activity,Task,대분류,중분류,산출물,담당자,지원팀,진행상태,계획시작일,계획종료일,일수,계획진척률,가중치,가중치진척률,실적진척상태,실적진척률,실적시작일,실적종료일,가중치실적진척률', 'P4000.이행단계,,고아Task,이행,,,담당자A,,,2026-06-01,2026-06-03,,,미착수(0%),,,'].join('\n'));

    const snapshot = await readHierarchySnapshot(page);
    expect(snapshot).toHaveLength(3);
    expect(snapshot[0].phase).toBe('P4000.이행단계');
    expect(snapshot[1].activity).toBe('-');
    expect(snapshot[2].task).toBe('고아Task');
  });

  test('can edit an existing row and cancel the edit', async ({ page }) => {
    const targetRow = page.locator('tbody tr[data-task-id]').filter({ hasText: '사업수행계획' }).first();
    const originalOwner = await targetRow.locator('.owner-badge').innerText();
    await targetRow.getByRole('button', { name: '편집' }).click();
    await expect(page.locator('.editor-panel')).toBeVisible();

    await page.locator('[data-testid="editor-owner"]').fill('임시담당자');
    await page.getByRole('button', { name: '취소' }).click();

    await expect(page.locator('.editor-panel')).toBeHidden();
    await expect(targetRow).not.toContainText('임시담당자');
    await expect(targetRow.locator('.owner-badge')).toHaveText(originalOwner);
  });

  test('can trigger CSV export download', async ({ page }, testInfo) => {
    await addTopLevelTask(page, {
      phase: '=HYPERLINK("http://evil.test","Click")',
      categoryLarge: 'CSV검증',
      owner: '담당자A',
      plannedStartDate: '2026-05-18',
      plannedEndDate: '2026-05-20'
    });
    await createActivitySubtree(page, 'CSV 활동', '@SUM(1,1)');

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'CSV 내보내기' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^wbs_export_\d{8}\.csv$/);
    const downloadPath = await download.path();
    const csvPath = downloadPath || testInfo.outputPath(download.suggestedFilename());
    if (!downloadPath) {
      await download.saveAs(csvPath);
    }
    const csvText = fs.readFileSync(csvPath, 'utf8');
    expect(csvText).toContain(`"'=HYPERLINK(""http://evil.test"",""Click"")"`);
    expect(csvText).toContain(`"'@SUM(1,1)"`);
  });

  test('can trigger CSV import file chooser', async ({ page }) => {
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'CSV 가져오기' }).click();
    const fileChooser = await fileChooserPromise;
    expect(fileChooser.isMultiple()).toBe(false);
  });
  test('renders placeholder text for form inputs to improve usability', async ({ page }) => {
    await expect(page.getByTestId('project-name-input')).toHaveAttribute('placeholder', '프로젝트명을 입력하세요');

    await page.getByRole('button', { name: '최상위 작업 추가' }).click();
    await expect(page.getByTestId('editor-category-large')).toHaveAttribute('placeholder', '예: 설계');
    await expect(page.getByTestId('editor-category-medium')).toHaveAttribute('placeholder', '예: 화면설계');
    await expect(page.getByTestId('editor-document-name')).toHaveAttribute('placeholder', '예: 화면설계서');
    await expect(page.getByTestId('editor-owner')).toHaveAttribute('placeholder', '예: 홍길동');
    await expect(page.getByTestId('editor-support-team')).toHaveAttribute('placeholder', '예: 디자인팀');
  });

  test('wraps text icons in aria-hidden span for screen reader accessibility', async ({ page }) => {
    await page.getByRole('button', { name: '최상위 작업 추가' }).click();
    await page.locator('[data-testid="editor-phase"]').fill('A11y Test');
    await page.getByRole('button', { name: '저장', exact: true }).click();

    // Check Gantt Close Button
    const closeBtnSpan = page.locator('#close-gantt span');
    await expect(closeBtnSpan).toHaveAttribute('aria-hidden', 'true');
    await expect(closeBtnSpan).toHaveText('✕');

    // Check Row Action Buttons
    const row = page.locator('tr.task-row').first();
    const toggleBtnSpan = row.locator('button[data-action="toggle"] span');
    await expect(toggleBtnSpan).toHaveAttribute('aria-hidden', 'true');
    await expect(toggleBtnSpan).toHaveText('▼');

    const addChildBtnSpan = row.locator('button[data-action="add-child"] span');
    await expect(addChildBtnSpan).toHaveAttribute('aria-hidden', 'true');
    await expect(addChildBtnSpan).toHaveText('＋');
  });
});
