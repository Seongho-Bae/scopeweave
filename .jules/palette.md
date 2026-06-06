## 2026-06-06 - Improve accessibility of icon-only buttons
**Learning:** Using emojis in `aria-label` attributes causes them to be announced awkwardly by screen readers. Furthermore, disabled icon-only buttons need tooltips to explicitly communicate the reason for their disabled state to the user.
**Action:** Always use plain text `aria-label`s for icon-only buttons. Add `title` attributes for explicit tooltips, including clear explanations for why a button might be disabled.
