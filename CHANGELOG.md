# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Imported the upstream Strix quick-scan workflow, helper scripts, and
  source-regression tests for this repository.
- Added companion dependency-review and OSV workflows so Strix
  manifest-only findings can be verified against authoritative PR-head
  checks.
- Added operator documentation for Strix workflow behavior and reusable
  warning/deprecation root-cause triage guidance.
- Added `requirements-strix-ci.txt` so Strix CI dependencies are pinned
  and reviewable by companion SCA workflows.

### Changed

- ⚡ Bolt: `formatNumber` 렌더링 시 `toLocaleString`이 매번 객체를 생성하여 발생하는 O(N) 성능 병목을 `Intl.NumberFormat` 캐싱으로 해결했습니다.
- 데이터 테이블의 반복되는 액션 버튼에 컨텍스트 정보(작업명)를 포함한 명시적인 ARIA 레이블을 추가하고, 유효성 검사 에러를 폼 필드에 연결하여 접근성을 개선했습니다.
- Adapted Strix scanning to the static ScopeWeave repository root and
  documented Kubernetes/IaC as follow-up work rather than a current
  blocker.
- Kept workflow and `scripts/ci/` changes in Strix PR scope so security
  automation changes are not silently skipped.

## [1.0.0] - 2026-04-20

<!-- markdownlint-disable-next-line MD024 -->
### Added

- Initial ScopeWeave Planner release with tree-table editing,
  cumulative metrics, CSV import/export, and Gantt modal.
- `wbs.json` seed loading plus browser autosave and optional file sync.
- Playwright E2E coverage for add/edit hierarchy flows, delete
  confirmation, subtree drag-and-drop, and JSON sync shape.
- GitHub Pages deployment workflow and operator documentation.
