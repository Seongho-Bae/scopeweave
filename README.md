# ScopeWeave Planner

Production-grade pure HTML/CSS/JavaScript WBS planner with tree editing,
CSV import/export, local autosave, and Gantt view.

## Repository contract

- Runtime stays static-host compatible for GitHub Pages.
- Runtime dependencies are forbidden; CI/dev-only automation under
  `.github/`, `scripts/`, `tests/`, and `docs/` is allowed.
- Strix security scanning is imported as a repository scan workflow,
  not as a runtime blocker entity.

## Strix security workflow

- `.github/workflows/strix.yml` runs the upstream-derived Strix quick
  scan against the repository root (`./`).
- Pull requests without `STRIX_LLM` and `LLM_API_KEY` skip cleanly;
  `push`/`schedule` runs fail closed if those required secrets are
  missing.
- CI-only Python dependencies are pinned in `requirements-strix-ci.txt`
  so companion supply-chain workflows can review the same dependency
  surface that Strix installs.
- Companion workflows `.github/workflows/dependency-review.yml` and
  `.github/workflows/osvscanner.yml` provide the authoritative
  manifest-only verification lane that the Strix gate expects.
- Workflow and `scripts/ci/` changes remain inside the Strix scannable
  PR scope for this repo; they are not silently skipped.
- Kubernetes/IaC coverage is documented as follow-up work; this static
  repo intentionally does not add deployment manifests just to satisfy
  Strix.

See `docs/operations/strix-workflow.md` for workflow behavior, secrets,
artifacts, and adaptation notes.
