## 2026-06-20 - Focus Management in Dynamic JS Render Cycles
**Learning:** In pure JavaScript render architectures that rebuild DOM aggressively (`renderAll()`), accessibility context like `document.activeElement` is lost when components (like inline editors or modals) are unmounted or remounted.
**Action:** Always capture `document.activeElement` before a major destructive DOM update or modal opening, and explicitly restore `.focus()` on close. When mounting forms, explicitly focus the first input inside a `requestAnimationFrame` to maintain user flow.

## 2026-06-20 - Focus Management in Dynamic JS Render Cycles
**Learning:** In pure JavaScript render architectures that rebuild DOM aggressively (`renderAll()`), accessibility context like `document.activeElement` is lost when components (like inline editors or modals) are unmounted or remounted.
**Action:** Always capture `document.activeElement` before a major destructive DOM update or modal opening, and explicitly restore `.focus()` on close. When mounting forms, explicitly focus the first input inside a `requestAnimationFrame` to maintain user flow.
