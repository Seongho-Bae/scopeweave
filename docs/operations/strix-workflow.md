# Strix workflow import

## Scope

ScopeWeave imports the upstream `smart-crawling-server` Strix quick-scan
workflow as CI-only security automation for this static repository.

- Scan target: repository root `./`
- Runtime impact: none
- Required files: `.github/workflows/strix.yml`, companion SCA
  workflows, `scripts/ci/strix_*.sh`, and regression tests under
  `tests/config/`

## Adaptations from upstream

### Static-repo targeting

- `STRIX_TARGET_PATH` stays at `./` because this repo is a root-level
  HTML/CSS/JavaScript app.
- `STRIX_SOURCE_DIRS=.` is set explicitly so endpoint hallucination
  checks treat the resolved target itself as source, instead of
  assuming server-style nested `src/` layouts.
- PR scoping still excludes docs/test-only edits and keeps bounded
  changed-file scans.
- Unlike the upstream server repo, workflow and `scripts/ci/` changes
  stay scannable here because this repository's new security automation
  lives in those paths.
- Static-app source extensions were widened to include `.html` and
  `.css` in the Strix gate.

### Companion manifest verification

Strix treats manifest-only findings specially: it allows continuation
only when authoritative companion SCA workflows have completed
successfully on the same PR head.

- `.github/workflows/dependency-review.yml`
- `.github/workflows/osvscanner.yml`

For this repo, those workflows are intentionally lightweight and no-op
successfully when the PR head has no supported dependency manifest
changes.

`dependency-review.yml` also no-ops successfully when GitHub repository
dependency graph support is unavailable. That avoids a permanent red PR
caused purely by repository settings while still surfacing the external
prerequisite clearly.

The repository tracks those CI-only Python dependencies in
`requirements-strix-ci.txt` so Strix and the companion SCA workflows
reason about the same supply-chain surface.

### Secrets and fail-closed behavior

Required secrets:

- `STRIX_LLM`
- `LLM_API_KEY`

Optional secrets:

- `GCP_SA_KEY`
- `LLM_API_BASE`

Behavior:

- `pull_request`: skip if required secrets are absent
- `push` / `schedule`: fail closed if required secrets are absent
- `GCP_SA_KEY` absent: Vertex auth is unavailable, but non-GCP model
  flows can still run when the required Strix secrets exist

## Artifacts

- Local and CI runs publish `strix_runs/`
- Workflow uploads `strix-reports` as an artifact when Strix executes

## Kubernetes / IaC handling

Strix is a scan target in this repo, not a blocker entity that requires
Kubernetes manifests to exist.

- Current repo contract: static GitHub Pages-compatible app
- Current repo reality: no Kubernetes manifests, no `infra/`
  deployment surface
- Follow-up path: if container packaging or IaC is introduced later,
  add a dedicated Kubernetes/IaC security lane instead of overloading
  Strix

This matches issue #9's follow-up intent and avoids creating fake
deployment files just to satisfy CI shape.

## Warning / deprecation note

During issue-program work, default human-formatted GitHub CLI views
emitted Projects(classic) deprecation warnings. The safe workaround is:

- prefer `gh api ...`
- or use `gh issue view --json ...` / `gh pr view --json ...`

Avoid relying on default `gh issue view` / `gh pr view` output when
collecting automation evidence.
