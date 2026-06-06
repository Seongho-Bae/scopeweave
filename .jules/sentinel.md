## 2026-06-06 - Content Security Policy (CSP) Header Added
**Vulnerability:** Missing Content Security Policy (CSP) headers, which increases the risk of Cross-Site Scripting (XSS) attacks by allowing execution of unauthorized scripts.
**Learning:** Pure HTML/CSS/JS applications heavily relying on DOM manipulation (like `innerHTML` in `app.js`) are particularly susceptible to XSS if an attacker can inject malicious content.
**Prevention:** Implement a strict Content Security Policy to restrict the sources from which scripts, styles, and other resources can be loaded.
