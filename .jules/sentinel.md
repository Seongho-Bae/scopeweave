## 2026-06-08 - Added Content Security Policy to index.html
**Vulnerability:** Missing Content Security Policy (CSP) headers or meta tags, leaving the pure HTML/JS frontend exposed to Cross-Site Scripting (XSS) via potential data injection (e.g. from wbs.json).
**Learning:** For a static client-side application where no server is managing HTTP headers, a CSP can be enforced directly using a `<meta>` tag.
**Prevention:** Always add a `<meta http-equiv="Content-Security-Policy">` tag to `index.html` to establish baseline security for static apps, restricting executable scripts to 'self'.

## 2026-06-11 - Add Prototype Pollution and DoS mitigations to user input processing
**Vulnerability:** A static dictionary (`ACTUAL_PROGRESS_MAP`) created as a standard object was exposed to potential prototype pollution if unvalidated external keys were ever passed, and raw values from dynamic sources were calling `.trim()` without ensuring they were actually strings, presenting a Denial of Service (DoS) type confusion vector via a `TypeError`.
**Learning:** Dictionary objects acting solely as lookup maps must be created using `Object.create(null)` to detach them from the default `Object.prototype`, which closes off property injection attack surfaces. Additionally, all calls to `.trim()` on potentially dirty or dynamic user input must be defensively wrapped with a `String()` cast to prevent application crashes when non-string data (such as nulls or objects from external parsed JSON/CSV) are processed.
**Prevention:** Always use `Object.create(null)` for map lookups containing external keys, and strictly type-coerce arbitrary inputs (e.g., `String(value)`) prior to invoking string-specific methods.
