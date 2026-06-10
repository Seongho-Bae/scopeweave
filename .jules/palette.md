## 2025-02-28 - Avoid Emojis in ARIA Labels
**Learning:** Using emojis in `aria-label` attributes causes them to be announced awkwardly or inconsistently by screen readers.
**Action:** Always use plain text for `aria-label`s on icon-only buttons, and provide explicit `title` attributes (tooltips) for visual users, including explanations for disabled states.
