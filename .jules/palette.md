## 2026-06-13 - Plain text aria-labels for accessible tooltips
**Learning:** Avoid using emojis in `aria-label` attributes as they are announced awkwardly by screen readers. Additionally, icon-only buttons need explicit `title` attributes (tooltips), including clear reasons for disabled states.
**Action:** Always use plain text for `aria-label`s and ensure disabled states have descriptive `title` attributes to guide the user.
