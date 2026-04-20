# ScopeWeave Planner Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build and ship the ScopeWeave Planner static WBS web application.

**Architecture:** Create one build-free static app composed of `index.html`, `styles.css`, `app.js`, and `wbs.json`, with development-only verification via Playwright.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript ES6+, GitHub Pages, Playwright.

---

### Task 1: Bootstrap repository artifacts

**Files:**
- Create: `.gitignore`
- Create: `README.md`
- Create: `AGENTS.md`
- Create: `ARCHITECTURE.md`
- Create: `docs/plans/2026-04-20-scopeweave-design.md`
- Create: `docs/plans/2026-04-20-scopeweave-implementation.md`

1. Create repository docs and ignore rules.
2. Verify files exist with `git status --short`.
3. Commit bootstrap artifacts.

### Task 2: Create initial default-branch baseline

**Files:**
- Modify: repository root bootstrap files only

1. Commit the bootstrap state on `main`.
2. Create an isolated worktree branch from the default branch reference.
3. Continue all feature work inside that worktree.

### Task 3: Implement production UI and behavior

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `app.js`
- Create: `wbs.json`
- Create: `404.html`

1. Write failing browser tests for seed rendering and editing flows.
2. Implement app shell, responsive table, computed columns, edit/add/delete, drag/drop, persistence, CSV, and Gantt.
3. Re-run tests until green.

### Task 4: Add delivery assets

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `playwright.config.js`
- Create: `tests/e2e/scopeweave.spec.js`
- Create: `.github/workflows/pages.yml`
- Create: `docs/user-guide.md`

1. Add verification tooling and Pages deployment workflow.
2. Document usage and known static-hosting persistence behavior.
3. Verify locally and in CI-ready form.

### Task 5: Repository delivery loop

**Files:**
- Modify: changelog/docs/issues metadata as needed

1. Create GitHub repository, milestone, canonical issue hierarchy, and draft PR.
2. Push branch, gather review/check evidence, merge when allowed.
3. Confirm deployed site and create follow-up issues for non-blocking enhancements.
