## 2026-06-08 - Added Content Security Policy to index.html
**Vulnerability:** Missing Content Security Policy (CSP) headers or meta tags, leaving the pure HTML/JS frontend exposed to Cross-Site Scripting (XSS) via potential data injection (e.g. from wbs.json).
**Learning:** For a static client-side application where no server is managing HTTP headers, a CSP can be enforced directly using a `<meta>` tag.
**Prevention:** Always add a `<meta http-equiv="Content-Security-Policy">` tag to `index.html` to establish baseline security for static apps, restricting executable scripts to 'self'.

## 2026-06-13 - Fixed Prototype Injection and Type Confusion DoS
**Vulnerability:** Prototype injection bypass possible when using object literals `{}` for lookups with untrusted keys. Denial of Service (DoS) possible via type confusion if `.trim()` is called on an unexpected type.
**Learning:** Object literals inherit from `Object.prototype`, which can be exploited. Uncoerced values can cause crashes if string methods are expected but not provided.
**Prevention:** Always use `Object.create(null)` for lookup maps processing untrusted keys. Always explicitly coerce inputs to strings (e.g., `String(value)`) before applying string operations like `.trim()`.
