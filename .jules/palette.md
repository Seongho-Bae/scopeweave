## 2026-06-14 - Remove emojis from ARIA labels
**Learning:** Emojis should be avoided in `aria-label` attributes as they are announced awkwardly by screen readers, leading to poor accessibility. Also, icon-only buttons need explicit `title` attributes explaining the disabled state (e.g. why they can't be clicked) to improve user experience.
**Action:** Use plain text for `aria-label` attributes. When an icon-only button is disabled, ensure the `title` attribute clearly explains the reason for it being disabled.
## 2026-06-15 - Add required field indicators to editor fields
**Learning:** Forms are difficult for screen-reader and visual users alike when required fields are unclear until submission fails. Combining a visual asterisk with a hidden (필수) text and aria-required significantly improves form accessibility.
**Action:** Use aria-required="true", visual indicators like asterisks, and placeholders for dynamically generated form fields.
## 2026-06-16 - Inline Styles vs Existing Classes
**Learning:** Adding new UI states (like empty states) often tempts the use of inline styles when existing classes don't quite fit the new elements. However, this violates the strict rule against custom CSS and inline styles.
**Action:** Always search the existing CSS files (`styles.css`) for utility classes before writing inline styles. If custom styling is absolutely necessary, add it directly to `styles.css` instead of using inline style attributes.

## 2026-06-16 - Package Lock Drift during Testing
**Learning:** Running `npm install` to set up the local testing environment (Playwright) can accidentally modify `package-lock.json`, which should not be committed unless dependencies were explicitly changed as part of the task.
**Action:** Always run `git checkout package-lock.json` or `git restore package-lock.json` before creating a pull request if the task did not involve dependency updates.
## 2026-06-16 - Safe HTML Rendering in UX Improvements
**Learning:** Adding new UI elements or templates often requires building HTML strings and inserting them via `innerHTML`. However, if these templates include user-controllable data without escaping, it creates a Stored XSS vulnerability, which can be flagged by security scanners (like Strix) or exploited by attackers.
**Action:** When improving UX with new layouts or lists, always use safe rendering methods: use `textContent` when updating pure text, and pass any dynamic user input through `escapeHtml()` when building larger template strings before injecting them into the DOM.
