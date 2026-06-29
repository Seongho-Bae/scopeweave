from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto('http://127.0.0.1:4173')

    # Wait for the page to render
    page.wait_for_selector('.wbs-table')

    # Try creating a task
    page.click('#add-root-task')
    page.fill('[data-testid="editor-phase"]', 'Test Phase')
    page.click('text=저장')

    # Wait to ensure task is added and rendered
    page.wait_for_selector('tbody tr')

    page.screenshot(path='frontend_verification.png')
    print("Screenshot saved to frontend_verification.png")

    browser.close()
