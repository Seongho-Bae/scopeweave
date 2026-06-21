## 2026-06-02 - Add CSP Header and secure ID Generation
**Vulnerability:** Weak randomness when creating task IDs and lack of protection against XSS exfiltration.
**Learning:** `Math.random` is an easily predictable random source, and static applications without CSP allow scripts to run from unexpected domains and exfiltrate data.
**Prevention:** Always use `crypto.randomUUID()` when available in browser environments, and provide strong Content-Security-Policy headers on the entry `index.html`.

## 2026-06-08 - Added Content Security Policy to index.html
**Vulnerability:** Missing Content Security Policy (CSP) headers or meta tags, leaving the pure HTML/JS frontend exposed to Cross-Site Scripting (XSS) via potential data injection (e.g. from wbs.json).
**Learning:** For a static client-side application where no server is managing HTTP headers, a CSP can be enforced directly using a `<meta>` tag.
**Prevention:** Always add a `<meta http-equiv="Content-Security-Policy">` tag to `index.html` to establish baseline security for static apps, restricting executable scripts to 'self'.

## 2026-06-10 - Strict Dictionary Creation & Type Sanitization
**Vulnerability:** Object map lookups via literal objects (e.g. `{}`) leave prototype properties accessible, and missing input type coercion before `trim()` exposes the app to TypeError crashes (DoS) or logic bypasses through maliciously injected properties like `__proto__`.
**Learning:** In purely client-side static apps mapping properties, creating maps with `Object.assign(Object.create(null), {...})` neutralizes prototype injection. Furthermore, relying on untyped `.trim()` calls on user input must be guarded by strict string coercion.
**Prevention:** Always use `Object.create(null)` for lookup maps processing untrusted keys, and rigorously enforce `String(value).trim()` during data sanitization to avoid DoS issues via type confusion.
## 2026-06-20 - Prevent DOM Clobbering Bypass in HTML Sanitizer
**Vulnerability:** The HTML sanitization loop in `stripUnsafeGeneratedMarkup` used `element.tagName`, `element.attributes` and `element.remove()` which are vulnerable to DOM Clobbering (e.g. `<form><input name="remove"></form>`). This caused the sanitizer to crash and skip elements/attributes filtering entirely, leading to XSS vulnerabilities.
**Learning:** In browser environments, attacker-controlled HTML elements like `<form>` can override their properties using named inputs. Using property getters (`element.tagName`) or methods (`element.remove()`) is not safe against DOM Clobbering during HTML sanitization.
**Prevention:** Always extract element tag names and attributes safely using prototype methods like `Object.getOwnPropertyDescriptor(Node.prototype, 'nodeName').get.call(element)` and `Element.prototype.getAttributeNames.call(element)`, and invoke methods like `Element.prototype.remove.call(element)`.\n
## 2026-06-25 - Prevent Prototype Injection in Lookup Maps
**Vulnerability:** Lookup maps defined as literal objects (e.g., `CSV_FIELD_LABELS` and `HTML_ESCAPE_ENTITIES`) exposed prototype properties, leaving the application vulnerable to prototype injection if an untrusted key (like `__proto__`) is looked up.
**Learning:** Even statically defined maps used for key lookups can be abused if user-controlled input determines the key.
**Prevention:** Always initialize lookup maps with `Object.assign(Object.create(null), { ... })` to ensure the maps have no prototype chain.
