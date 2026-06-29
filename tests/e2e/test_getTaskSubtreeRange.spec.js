const { test, expect } = require('@playwright/test');
const fs = require('fs');

test.describe('getTaskSubtreeRange function tests', () => {
  test('should return correct range for root task, sub task and non-existent task', async ({ page }) => {
    const appJsContent = fs.readFileSync('app.js', 'utf8');

    const result = await page.evaluate((code) => {
      const localState = {
        tasks: [
          { id: '1', depth: 1 },
          { id: '2', depth: 2 },
          { id: '3', depth: 3 },
          { id: '4', depth: 2 },
          { id: '5', depth: 1 },
          { id: '6', depth: 2 }
        ]
      };

      const functionBodyString = code.match(/function getTaskSubtreeRange\(taskId\) \{([\s\S]*?)\n\}\n\nfunction findTask/)[1];
      const testGetTaskSubtreeRange = new Function('taskId', 'state', functionBodyString);

      return {
        rootNodeRange: testGetTaskSubtreeRange('1', localState),
        leafNodeRange: testGetTaskSubtreeRange('3', localState),
        middleNodeRange: testGetTaskSubtreeRange('2', localState),
        nonExistentNodeRange: testGetTaskSubtreeRange('99', localState)
      };
    }, appJsContent);

    expect(result.rootNodeRange).toEqual({ startIndex: 0, endIndex: 3 });
    expect(result.leafNodeRange).toEqual({ startIndex: 2, endIndex: 2 });
    expect(result.middleNodeRange).toEqual({ startIndex: 1, endIndex: 2 });
    expect(result.nonExistentNodeRange).toBeNull();
  });
});
