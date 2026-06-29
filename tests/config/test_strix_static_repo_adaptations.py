#!/usr/bin/env python3
"""Regression tests for ScopeWeave-specific Strix adaptations."""

import subprocess
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
STRIX_GATE = REPO_ROOT / "scripts" / "ci" / "strix_quick_gate.sh"
OPENCODE_FALLBACK_FINDINGS = REPO_ROOT / "scripts" / "ci" / "emit_opencode_failed_check_fallback_findings.sh"
STRIX_WORKFLOW = REPO_ROOT / ".github" / "workflows" / "strix.yml"
OPENCODE_WORKFLOW = REPO_ROOT / ".github" / "workflows" / "opencode-review.yml"
DEPENDENCY_REVIEW_WORKFLOW = REPO_ROOT / ".github" / "workflows" / "dependency-review.yml"
OSV_WORKFLOW = REPO_ROOT / ".github" / "workflows" / "osvscanner.yml"
K8S_DEPLOYMENT = REPO_ROOT / "infra" / "k8s" / "deployment.yaml"
K8S_SERVICE = REPO_ROOT / "infra" / "k8s" / "service.yaml"


def test_strix_gate_keeps_workflow_and_script_changes_scannable() -> None:
    source = STRIX_GATE.read_text(encoding="utf-8")

    assert 'if [[ "$changed_file" == .github/workflows/* || "$changed_file" == scripts/ci/* ]]; then' not in source
    assert '*.html | *.css' in source


def test_strix_ci_dependencies_are_pinned_in_repo_manifest() -> None:
    workflow_source = STRIX_WORKFLOW.read_text(encoding="utf-8")
    requirements_source = (REPO_ROOT / "requirements-strix-ci.txt").read_text(encoding="utf-8")

    assert 'python3 -m pip install --disable-pip-version-check --no-cache-dir --require-hashes -r requirements-strix-ci-hashes.txt' in workflow_source
    assert 'Gate Strix secrets' in workflow_source
    assert 'STRIX_FALLBACK_MODELS:' in workflow_source
    assert 'STRIX_FAIL_ON_PROVIDER_SIGNAL: "1"' in workflow_source
    assert 'strix-agent==1.0.4' in requirements_source
    assert 'google-cloud-aiplatform==1.133.0' in requirements_source


def test_strix_tracks_all_reported_vulnerability_severities() -> None:
    workflow_source = STRIX_WORKFLOW.read_text(encoding="utf-8")
    gate_source = STRIX_GATE.read_text(encoding="utf-8")
    opencode_source = OPENCODE_WORKFLOW.read_text(encoding="utf-8")

    assert 'branches: [main, develop, master]' in workflow_source
    assert 'STRIX_FAIL_ON_MIN_SEVERITY: MEDIUM' in workflow_source
    assert 'STRIX_FAIL_ON_MIN_SEVERITY="${STRIX_FAIL_ON_MIN_SEVERITY:-MEDIUM}"' in gate_source
    assert 'include every model-reported vulnerability' in opencode_source
    assert 'One Strix model vulnerability report requires one distinct finding' in opencode_source


def test_opencode_fallback_helper_emits_low_strix_reports(tmp_path: Path) -> None:
    evidence_file = tmp_path / "failed-check-evidence.md"
    evidence_file.write_text(
        "\n".join(
            [
                "# Failed GitHub Check Evidence",
                "",
                "## Failed check: Strix Security Scan",
                "",
                "### Strix vulnerability report window 1 (log lines 1-80)",
                "",
                "```text",
                "Model deepseek/deepseek-v3-0324",
                "Vulnerability Report",
                "Title: Low severity issue still needs tracking",
                "Severity: LOW",
                "Target: /workspace/strix-pr-scope.test/app.js",
                "Endpoint: app.js",
                "Code Locations",
                "Location 1: app.js:1847-1851",
                "```",
                "",
            ]
        ),
        encoding="utf-8",
    )

    result = subprocess.run(
        ["bash", str(OPENCODE_FALLBACK_FINDINGS), str(evidence_file), str(REPO_ROOT)],
        check=True,
        capture_output=True,
        text=True,
    )

    assert "LOW app.js:1847 - Strix report" in result.stdout
    assert "Low severity issue still needs tracking" in result.stdout


def test_opencode_review_workflow_has_runner_hardening() -> None:
    workflow_source = OPENCODE_WORKFLOW.read_text(encoding="utf-8")

    assert 'timeout-minutes: 60' in workflow_source


def test_kubernetes_deployment_uses_non_root_versioned_runtime() -> None:
    deployment_source = K8S_DEPLOYMENT.read_text(encoding="utf-8")
    service_source = K8S_SERVICE.read_text(encoding="utf-8")

    assert 'image: scopeweave:latest' not in deployment_source
    assert 'image: scopeweave:1.0.0' in deployment_source
    assert 'runAsNonRoot: true' in deployment_source
    assert 'runAsUser: 101' in deployment_source
    assert 'allowPrivilegeEscalation: false' in deployment_source
    assert 'readOnlyRootFilesystem: true' in deployment_source
    assert 'drop:' in deployment_source
    assert '- ALL' in deployment_source
    assert 'seccompProfile:' in deployment_source
    assert 'livenessProbe:' in deployment_source
    assert 'readinessProbe:' in deployment_source
    assert 'kind: PodDisruptionBudget' in deployment_source
    assert 'targetPort: 8080' in service_source


def test_companion_workflows_cover_named_requirements_manifests_and_full_history() -> None:
    dependency_review_source = DEPENDENCY_REVIEW_WORKFLOW.read_text(encoding="utf-8")
    osv_source = OSV_WORKFLOW.read_text(encoding="utf-8")

    assert 'fetch-depth: 0' in dependency_review_source
    assert 'dependency_graph?.status || \'unknown\'' in dependency_review_source
    assert 'requirements(-[A-Za-z0-9._-]+)?\\.txt' in dependency_review_source
    assert 'requirements(-[A-Za-z0-9._-]+)?\\.txt' in osv_source
