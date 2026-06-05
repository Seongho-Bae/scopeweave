## 2026-06-05 - Remove Emojis from ARIA Labels and Add Tooltips
**Learning:** Screen readers announce emojis awkwardly when they are included in `aria-label` attributes.
**Action:** Always use plain text for `aria-label` attributes to ensure clarity for screen reader users. Additionally, provide explicit `title` attributes as tooltips to assist sighted users, especially for disabled states, explaining why an element is disabled.
