## 2026-05-31 - Missing Security Headers (CSP)
**Vulnerability:** The static client-side application was missing fundamental security headers like Content Security Policy (CSP). Without a backend to inject HTTP headers, the app was susceptible to potential XSS attacks.
**Learning:** Pure HTML/CSS/JS client-side applications still need defense-in-depth security protections. Security headers can and should be added as HTML `<meta>` tags when no backend server is available.
**Prevention:** Always include standard security meta tags (like `Content-Security-Policy`) within the `<head>` of HTML files for static sites.
