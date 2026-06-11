## 2026-06-11 - Removed emojis from ARIA labels for accessibility
**Learning:** Screen readers announce emojis in `aria-label` attributes awkwardly (e.g., "wastebasket 삭제"), which degrades the accessibility experience. ARIA labels should use plain text to be as clear as possible.
**Action:** Remove emojis from `aria-label`s on icon-only buttons while keeping plain text, and rely on explicit `title` attributes for tooltips or visual hints if needed. For disabled state, ensure it's clear.
