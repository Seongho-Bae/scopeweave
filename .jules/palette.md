## 2026-06-07 - Icon Button Accessibility
**Learning:** Avoid emojis in `aria-label` attributes as they can be read awkwardly by screen readers. Explicit `title` attributes should be used for icon-only buttons to act as tooltips, and these `title` attributes should clearly explain any disabled state reasons.
**Action:** Always provide explicit plain-text `aria-label` and `title` attributes for icon-only buttons. Ensure dynamic disabled reasons are communicated via the `title` attribute.
