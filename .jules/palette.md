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
## 2026-06-16 - Safe CSV and LocalStorage usage
**Learning:** Sensitive data should not be stored in `localStorage`; if local persistence must protect sensitive data, use real encryption with appropriate key management instead of reversible obfuscation such as XOR or Base64. CSV exports also need protection against formula injection. For CSV generation, RFC 4180 must be followed and lines starting with special characters (`=`, `+`, `-`, `@`) must be escaped with a leading single quote to match the app's CSV export behavior.
**Action:** Keep sensitive values out of `localStorage`, or use properly designed encryption with key management when sensitive local persistence is unavoidable. When generating CSVs from user input, always sanitize values by escaping double quotes, enclosing in quotes if needed, and prefixing potentially malicious formulas with a leading single quote.
## 2026-06-16 - CI dependency resolution
**Learning:** During test runs, upstream tools like Strix Agent might occasionally fail due to unpinned or missing transitive dependencies (like `tzlocal` dropping out of `scrubadub` or `dateparser`).
**Action:** When CI pipelines fail with `ModuleNotFoundError` for packages like `tzlocal` that should be present, explicitly append them to the CI dependency requirements files (e.g. `requirements-strix-ci.txt`).
## 2026-06-17 - Disable unavailable actions instead of hiding or erroring
**Learning:** Users can be confused if actions like 'Export CSV' or 'Gantt Chart' are clickable but do nothing (or show an error) when there's no data. Disabling the buttons with a clear `title` tooltip improves the experience.
**Action:** Proactively disable buttons that require a certain state (like having tasks or browser API support) and explain the reason via a `title` tooltip.

## 2026-06-20 - Forms & Empty States
**Learning:** For a complex app like a WBS planner with inline editing, dynamic DOM mutations must communicate intent properly to screen readers. Live regions should be used for dynamic form validation messages (`aria-live="polite"`).
**Action:** When improving micro-UX in heavily dynamic apps, prefer adding appropriate ARIA attributes for existing dynamic UI. Make validation messages `aria-live="polite"`. Add explicit id-based labeling (`for="project-name"`, `id="..."`) to inputs, ensuring they are unique if dynamic. And empty states should contain actionable buttons instead of just text hints.

## 2026-06-20 - Focus Management in Dynamic JS Render Cycles
**Learning:** In pure JavaScript render architectures that rebuild DOM aggressively (`renderAll()`), accessibility context like `document.activeElement` is lost when components (like inline editors or modals) are unmounted or remounted.
**Action:** Always capture `document.activeElement` before a major destructive DOM update or modal opening, and explicitly restore `.focus()` on close. When mounting forms, explicitly focus the first input inside a `requestAnimationFrame` to maintain user flow.
## 2026-06-21 - Avoid indirect string replacements
**Learning:** When trying to edit files, it is an anti-pattern to create temporary node scripts to do string replacements on source files. It is brittle and fails code reviews.
**Action:** Always modify source files directly using standard editing tools (like `replace_with_git_merge_diff`) instead of writing separate scripts to mutate the codebase.
## 2026-06-21 - Gantt Chart Actionable Empty State
**Learning:** Generic "no data" messages in complex components (like a Gantt chart modal) create dead ends. Empty states represent an opportunity to guide users on exactly which fields (e.g., planned start/end dates) they need to fill in to see the data they expect. Reusing existing table-empty UI patterns inside modals also maintains visual consistency and reduces perceived friction.
**Action:** Always prefer structured, actionable empty states with a helpful description over basic text strings, and reuse existing empty-state CSS patterns wherever possible to guide users out of the dead end.
## 2026-06-23 - Hide raw text icons from screen readers
**Learning:** Screen readers announce exact characters such as '▼', '▶', or '✕' literally. Wrapping them in a `<span aria-hidden="true">` inside a button that already has an `aria-label` prevents redundant and confusing screen reader announcements.
**Action:** When creating icon-only buttons with raw unicode characters as text, wrap the text node in a `<span aria-hidden="true">` element and supply an `aria-label` on the parent button.
