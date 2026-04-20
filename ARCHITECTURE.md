# ARCHITECTURE.md

## Runtime structure

- `index.html`: app shell and modal structure.
- `styles.css`: responsive layout, table, badges, gantt, and modal presentation.
- `app.js`: state, rendering, editing, validation, persistence,
  import/export, and Gantt logic.
- `wbs.json`: seed data in the user-specified JSON array format.

## CI and security structure

- `.github/workflows/strix.yml`: upstream-derived Strix quick scan
  adapted to the repository root.
- `.github/workflows/dependency-review.yml`: authoritative
  manifest-diff review workflow used by Strix manifest-only gating.
- `.github/workflows/osvscanner.yml`: authoritative OSV/SARIF workflow
  used by Strix manifest-only gating.
- `scripts/ci/strix_quick_gate.sh`: Strix wrapper with PR scoping,
  fallback/retry, and manifest-only verification logic.
- `scripts/ci/strix_model_utils.sh`: shared model normalization and
  Vertex resource-path helpers.
- `scripts/ci/test_strix_quick_gate.sh`: local regression/self-test
  harness for the Strix gate.
- `requirements-strix-ci.txt`: pinned CI-only Python dependency manifest
  for the imported Strix workflow.
- `tests/config/test_strix_*.py`: source invariants that pin key Strix
  workflow/script behaviors.

## Core decisions

- One global `tasks` array holds canonical task records.
- `renderAll()` owns all UI updates.
- Browser persistence uses `localStorage` for guaranteed autosave and
  optional File System Access API sync for `wbs.json` where supported.
- Static hosting treats repository `wbs.json` as seed data;
  export/manual save remains the portability path.
- Strix scans the static repository surface itself; it does not imply
  Kubernetes deployment ownership or block on absent IaC that this repo
  does not contain.
- Strix PR scoping intentionally includes workflow and `scripts/ci/`
  changes in this repo so security automation edits are not silently
  skipped.
- Kubernetes/IaC security coverage remains a follow-up design lane for
  any future `infra/` or container packaging surface.
