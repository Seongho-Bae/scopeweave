from playwright.sync_api import sync_playwright

def run_cuj(page):
    page.goto("http://localhost:4173")
    page.wait_for_timeout(500)

    # 1. Test Editor Focus
    page.get_by_role("button", name="최상위 작업 추가").focus()
    page.wait_for_timeout(500)
    page.get_by_role("button", name="최상위 작업 추가").click()
    page.wait_for_timeout(500)

    # Fill editor to have some visual state
    page.locator('[data-testid="editor-phase"]').fill('P5000.포커스단계')
    page.wait_for_timeout(500)

    # Save to close and restore focus
    page.get_by_role("button", name="저장", exact=True).click()
    page.wait_for_timeout(500)

    # Take screenshot at the key moment showing focus restored to the button
    page.screenshot(path="/home/jules/verification/screenshots/verification.png")
    page.wait_for_timeout(500)

    # 2. Test Gantt Modal Focus
    page.get_by_role("button", name="간트차트보기").focus()
    page.wait_for_timeout(500)
    page.get_by_role("button", name="간트차트보기").click()
    page.wait_for_timeout(500)

    # Close Gantt modal via keyboard
    page.keyboard.press('Escape')
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()  # MUST close context to save the video
            browser.close()
