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
## 2026-06-20 - Container Hardening and Privilege Escalation
**Vulnerability:** The Docker container was running as the root user, and the Kubernetes deployment allowed privilege escalation. This could allow attackers who compromise the container to gain elevated permissions on the host system or cluster.
**Learning:** Containers must be run as non-root users by explicitly defining a `USER` instruction in the Dockerfile. Furthermore, in Kubernetes deployments, the `securityContext` should explicitly set `allowPrivilegeEscalation: false` and `runAsNonRoot: true`, alongside dropping all unused capabilities to restrict attackers if the container is breached.
**Prevention:** Always add a `USER` directive (e.g. `USER 1000`) before `CMD` or `ENTRYPOINT` in a Dockerfile. In Kubernetes, routinely implement the least-privilege principle by enforcing `securityContext` blocks on all containers.

## 2026-06-20 - Prevent DOM Clobbering Bypass in HTML Sanitizer
**Vulnerability:** The HTML sanitization loop in `stripUnsafeGeneratedMarkup` used `element.tagName`, `element.attributes` and `element.remove()` which are vulnerable to DOM Clobbering (e.g. `<form><input name="remove"></form>`). This caused the sanitizer to crash and skip elements/attributes filtering entirely, leading to XSS vulnerabilities.
**Learning:** In browser environments, attacker-controlled HTML elements like `<form>` can override their properties using named inputs. Using property getters (`element.tagName`) or methods (`element.remove()`) is not safe against DOM Clobbering during HTML sanitization.
**Prevention:** Always extract element tag names and attributes safely using prototype methods like `Object.getOwnPropertyDescriptor(Node.prototype, 'nodeName').get.call(element)` and `Element.prototype.getAttributeNames.call(element)`, and invoke methods like `Element.prototype.remove.call(element)`.\n

## 2026-06-21 - Hardcoded Secrets
**Vulnerability:** A test script contained a hardcoded API key (`sk-test...`). Even though it was for testing purposes, hardcoding secrets is a bad practice and can lead to exposure if the script is deployed or shared.
**Learning:** Never hardcode secrets in source code, including test scripts. Always use environment variables or a secure configuration management system to manage sensitive data.
**Prevention:** Replace hardcoded strings with environment variable references (e.g., `os.getenv("TEST_API_KEY")` or `{env:TEST_API_KEY}`) and manage secrets externally.

## 2026-06-21 - Prevent Prototype Injection in Lookup Maps
**Vulnerability:** Lookup maps defined as literal objects (e.g., `CSV_FIELD_LABELS` and `HTML_ESCAPE_ENTITIES`) exposed prototype properties, leaving the application vulnerable to prototype injection if an untrusted key (like `__proto__`) is looked up.
**Learning:** Even statically defined maps used for key lookups can be abused if user-controlled input determines the key.
**Prevention:** Always initialize lookup maps with `Object.assign(Object.create(null), { ... })` to ensure the maps have no prototype chain.

## 2026-06-21 - [MEDIUM] Add input length and file size limits to prevent DoS
**Vulnerability:** Missing file size limits during CSV import and missing length limits on text fields.
**Learning:** Browser memory can be exhausted resulting in Denial of Service (DoS) attacks if large files or strings are imported and parsed into memory.
**Prevention:** Enforce client-side file size limits (e.g. 5MB) before processing imports, add `maxLength` attributes to text inputs, and strictly truncate fields on submission to prevent bypassing client-side constraints.
