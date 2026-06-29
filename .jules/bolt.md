## 2026-06-29 - Select template cloneNode optimization
**Learning:** Playwright E2E tests can fail when using `cloneNode` with a template `select` element because setting `select.value` immediately after cloning might not propagate the `selected` attribute correctly for Playwright's `toHaveValue` assertions, even if it updates visually.
**Action:** When cloning `select` elements as templates, explicitly iterate over the options to set `.selected = true` to ensure testing framework compatibility while retaining the performance benefits.
