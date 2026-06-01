## 2026-06-01 - Content Security Policy (CSP) Header Missing in Static App
**Vulnerability:** A static client-side web application lacked a Content Security Policy (CSP) header, increasing susceptibility to Cross-Site Scripting (XSS) attacks.
**Learning:** Static apps delivered primarily via HTML still require CSP headers to mitigate XSS risks, since there's no server-side logic dynamically generating headers.
**Prevention:** Include a secure `<meta http-equiv="Content-Security-Policy">` tag in the `index.html` file of all static HTML applications by default.
