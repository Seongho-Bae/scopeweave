## 2026-05-31 - Tooltips for Icon-Only Buttons and Disabled States
**Learning:** While `aria-label` makes icon-only buttons accessible to screen readers, sighted users often struggle without visual text. Furthermore, when an action is disabled (e.g., adding a child to a leaf node), users need to know *why* they cannot perform the action. Tooltips bridge this gap.
**Action:** Always provide `title` attributes on icon-only buttons for sighted users, and use tooltips to explicitly explain disabled states.
