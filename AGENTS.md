# AGENTS.md

## Project overview
- ScopeWeave Planner is a pure HTML/CSS/JavaScript WBS planning web app.
- Runtime dependencies are forbidden; development-only tooling is allowed.

## Defaults
- Keep the runtime static-host compatible for GitHub Pages.
- Preserve the single global `tasks` array as the source of truth.
- Use a single `renderAll()` integration path for user-visible rerenders.
- Prefer browser-native APIs only.

## Verification
- Serve locally with `python3 -m http.server 4173`.
- Run end-to-end verification with `npm run test:e2e`.
