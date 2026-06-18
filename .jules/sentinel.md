## 2024-06-18 - Type confusion DoS and prototype injection
**Vulnerability:** Type confusion causing DoS via .trim() and prototype injection bypasses in lookup maps.
**Learning:** Untrusted keys can cause prototype injection, and uncoerced inputs can crash the app if they lack a .trim() method.
**Prevention:** Use Object.create(null) for lookup maps and enforce strict string coercion String(value) before calling string methods like .trim().
