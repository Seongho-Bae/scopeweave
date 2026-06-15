## 2026-06-14 - Remove emojis from ARIA labels
**Learning:** Emojis should be avoided in `aria-label` attributes as they are announced awkwardly by screen readers, leading to poor accessibility. Also, icon-only buttons need explicit `title` attributes explaining the disabled state (e.g. why they can't be clicked) to improve user experience.
**Action:** Use plain text for `aria-label` attributes. When an icon-only button is disabled, ensure the `title` attribute clearly explains the reason for it being disabled.
## 2026-06-15 - Add required field indicators to editor fields
**Learning:** Forms are difficult for screen-reader and visual users alike when required fields are unclear until submission fails. Combining a visual asterisk with a hidden (필수) text and aria-required significantly improves form accessibility.
**Action:** Use aria-required="true", visual indicators like asterisks, and placeholders for dynamically generated form fields.
