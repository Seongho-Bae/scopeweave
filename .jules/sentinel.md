## 2026-06-08 - Added Content Security Policy to index.html
**Vulnerability:** Missing Content Security Policy (CSP) headers or meta tags, leaving the pure HTML/JS frontend exposed to Cross-Site Scripting (XSS) via potential data injection (e.g. from wbs.json).
**Learning:** For a static client-side application where no server is managing HTTP headers, a CSP can be enforced directly using a `<meta>` tag.
**Prevention:** Always add a `<meta http-equiv="Content-Security-Policy">` tag to `index.html` to establish baseline security for static apps, restricting executable scripts to 'self'.
## 2026-06-14 - Prevent prototype injection and DoS type confusion
**Vulnerability:** Lookup maps using plain objects can be bypassed via prototype injection (`__proto__`). Calling `.trim()` on unchecked user inputs can cause DoS crashes via type confusion.
**Learning:** Using `Object.create(null)` creates a dictionary with no prototype, safe for untrusted keys. Explicitly casting values with `String(value)` before calling string methods prevents type confusion errors.
**Prevention:** Always use `Object.create(null)` for maps handling untrusted keys and enforce strict string coercion on user inputs before processing.
