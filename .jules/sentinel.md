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
