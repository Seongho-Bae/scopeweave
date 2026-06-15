## 2026-06-14 - Remove emojis from ARIA labels
**Learning:** Emojis should be avoided in `aria-label` attributes as they are announced awkwardly by screen readers, leading to poor accessibility. Also, icon-only buttons need explicit `title` attributes explaining the disabled state (e.g. why they can't be clicked) to improve user experience.
**Action:** Use plain text for `aria-label` attributes. When an icon-only button is disabled, ensure the `title` attribute clearly explains the reason for it being disabled.
