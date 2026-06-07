## 2026-06-07 - Content Security Policy missing
**Vulnerability:** The application was missing a Content-Security-Policy meta tag, making it more vulnerable to XSS and data injection attacks.
**Learning:** Pure client-side apps still need CSP to restrict where scripts and styles can be loaded from.
**Prevention:** Always include a restrictive CSP in the main HTML file.
