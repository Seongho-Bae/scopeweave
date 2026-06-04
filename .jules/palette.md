## 2026-06-04 - Improve Icon Button Accessibility
**Learning:** Emojis in `aria-label` attributes on icon-only buttons (like `✏️ 편집`) provide a clunky and confusing experience for screen readers, as they announce the emoji name alongside the text. Additionally, disabled icon buttons without tooltips leave users confused about why an action is unavailable.
**Action:** Always use plain text for `aria-label`s. Provide clear `title` attributes (tooltips) for icon-only buttons, and crucially, add specific tooltip text explaining *why* a button is disabled when it is inactive.
