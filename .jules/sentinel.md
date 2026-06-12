## 2026-06-08 - Added Content Security Policy to index.html
**Vulnerability:** Missing Content Security Policy (CSP) headers or meta tags, leaving the pure HTML/JS frontend exposed to Cross-Site Scripting (XSS) via potential data injection (e.g. from wbs.json).
**Learning:** For a static client-side application where no server is managing HTTP headers, a CSP can be enforced directly using a `<meta>` tag.
**Prevention:** Always add a `<meta http-equiv="Content-Security-Policy">` tag to `index.html` to establish baseline security for static apps, restricting executable scripts to 'self'.

## 2026-06-12 - Prototype Injection & Type Confusion
**Vulnerability:** Lookup maps using raw objects (`{}`) instead of `Object.create(null)` leading to prototype injection, and `.trim()` being called on raw user inputs leading to DoS crashes.
**Learning:** JavaScript raw objects inherit from Object.prototype which can be exploited when processing untrusted JSON/CSV data. String methods like `.trim()` cause type confusion errors if input is not coerced to string.
**Prevention:** Always use `Object.create(null)` for lookup maps processing untrusted keys, and rigorously enforce strict string coercion via `String(value)` before string manipulation.
