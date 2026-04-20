#!/usr/bin/env python3
"""Regression tests for Strix PR batch-size guardrails."""

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
WORKFLOW_PATH = REPO_ROOT / ".github" / "workflows" / "strix.yml"


def test_strix_workflow_overrides_pr_batch_size_to_reduce_timeout_risk() -> None:
    workflow_source = WORKFLOW_PATH.read_text(encoding="utf-8")

    assert "STRIX_PR_SCOPE_MAX_FILES_PER_BATCH: 20" in workflow_source


def test_strix_workflow_enables_pr_scoping_only_for_pull_requests() -> None:
    workflow_source = WORKFLOW_PATH.read_text(encoding="utf-8")

    assert (
        "STRIX_DISABLE_PR_SCOPING: ${{ github.event_name == 'pull_request' && '0' || '1' }}"
        in workflow_source
    )
