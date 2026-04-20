# ARCHITECTURE.md

## Runtime structure
- `index.html`: app shell and modal structure.
- `styles.css`: responsive layout, table, badges, gantt, and modal presentation.
- `app.js`: state, rendering, editing, validation, persistence, import/export, and Gantt logic.
- `wbs.json`: seed data in the user-specified JSON array format.

## Core decisions
- One global `tasks` array holds canonical task records.
- `renderAll()` owns all UI updates.
- Browser persistence uses `localStorage` for guaranteed autosave and optional File System Access API sync for `wbs.json` where supported.
- Static hosting treats repository `wbs.json` as seed data; export/manual save remains the portability path.
- Imported flat JSON may synthesize hierarchy wrapper nodes internally, but external `wbs.json` sync strips synthetic rows so the saved array stays in the requested user schema.
- Same-level drag-and-drop moves the whole subtree block, not a single row, to preserve tree-table integrity.
