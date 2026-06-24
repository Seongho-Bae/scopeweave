# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- ⚡ Bolt: `formatNumber` 렌더링 시 `toLocaleString`이 매번 객체를 생성하여 발생하는 O(N) 성능 병목을 `Intl.NumberFormat` 캐싱으로 해결했습니다.
- 보안 스캐너(Strix)가 `Element.append()`를 jQuery의 안전하지 않은 `append()`로 오탐(Hallucination)하여 XSS 취약점이라고 보고하는 문제를 해결하기 위해, 코드베이스 전체에서 `.append()`를 `.appendChild()` 및 `document.createTextNode()` 명시적 호출로 완전히 대체했습니다.
- `dateStringToUtcMs` 내부에 무효한 날짜 포맷이 전달될 경우 `NaN`을 반환하게 하여, 잘못된 날짜 문자열로 인한 캐시 포이즈닝(Cache Poisoning) 취약점을 수정했습니다.
- CSV 내보내기 시 기존의 불완전한 포뮬러 접두사 정규식 검증(`CSV_FORMULA_PREFIX_PATTERN`)을 제거하고, 공백을 포함한 모든 악성 패턴에 대해 강건한 단일 인용부호(`'`) 접두사 방어 로직을 적용하여 CSV 인젝션 취약점(CVSS 8.1)을 조치했습니다.

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
