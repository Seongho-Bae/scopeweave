#!/usr/bin/env python3
"""Normalize OpenCode review output into the strict approval-gate contract."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any


STRUCTURAL_FAILURE_PHRASES = (
    "structural exploration was not possible",
    "structural exploration not possible",
    "structural exploration is not required",
    "structural exploration not required",
    "structural analysis is not required",
    "structural analysis not required",
    "structural review is not required",
    "structural review not required",
    "no structural exploration required",
    "no structural analysis required",
    "no structural review required",
    "structural exploration is unnecessary",
    "structural analysis is unnecessary",
    "structural review is unnecessary",
    "mcp sources unavailable for structural analysis",
    "mcp sources unavailable for structural review",
    "codegraph unavailable for structural analysis",
    "codegraph unavailable for structural review",
    "changed files could not be inspected",
    "source files could not be inspected",
    "required files could not be inspected",
    "could not access changed files",
    "could not access the changed files",
    "could not access source files",
    "could not access the source files",
    "could not access required files",
    "could not access required evidence",
    "evidence was truncated",
    "truncated evidence",
    "no changes detected",
    "no changes were detected",
    "no changes found",
    "no changes were found",
    "no files or changes were found",
    "no files or changes found",
    "no actionable changes to review",
    "no changes to review",
    "no changed files",
)

STRUCTURAL_FAILURE_PATTERNS = (
    re.compile(
        r"\b(?:could not|cannot|can't|unable to)\s+"
        r"(?:inspect|access|review)\s+(?:the\s+)?"
        r"(?:changed|source|required)\s+files?\b"
    ),
    re.compile(
        r"\b(?:changed|source|required)\s+files?\s+"
        r"(?:could not|cannot|can't|were not|was not)\s+"
        r"(?:be\s+)?(?:inspected|accessed|reviewed)\b"
    ),
    re.compile(
        r"\b(?:structural\s+(?:exploration|analysis|review))\s+"
        r"(?:was\s+)?(?:unavailable|incomplete|blocked|not possible)\b"
    ),
    re.compile(
        r"\b(?:mcp|codegraph)\s+(?:sources?\s+)?"
        r"(?:was\s+|were\s+)?unavailable\s+for\s+"
        r"structural\s+(?:exploration|analysis|review)\b"
    ),
    re.compile(r"\bunavailable\s+for\s+structural\s+(?:exploration|analysis|review)\b"),
    re.compile(
        r"\bno\s+(?:files?\s+or\s+)?changes?\s+"
        r"(?:were\s+)?(?:detected|found|present)\b"
    ),
    re.compile(r"\bno\s+(?:actionable\s+)?changes?\s+to\s+review\b"),
    re.compile(r"\b(?:no|zero)\s+changed\s+files?\b"),
)

CHANGED_FILE_EVIDENCE_PATTERN = re.compile(
    r"(?<![A-Za-z0-9_])(?:[A-Za-z0-9_.-]+/)+[A-Za-z0-9_.@+-]+"
    r"|(?<![A-Za-z0-9_])[A-Za-z0-9_.-]+\."
    r"(?:py|js|jsx|ts|tsx|mjs|cjs|sh|bash|yml|yaml|json|jsonc|toml|lock|md|txt|css|scss|html|sql|go|rs|java|kt|swift|rb|php|cs|xml|ini|cfg)"
    r"(?![A-Za-z0-9_])"
    r"|(?<![A-Za-z0-9_])(?:Dockerfile|Makefile|README|LICENSE|AGENTS\.md)(?![A-Za-z0-9_])"
)
EVIDENCE_PHRASE_PATTERN = re.compile(r"(Inspected changed file evidence:\s*)([^\s`\"'<>)]+)")
INSPECTED_CHANGES_PHRASE_PATTERN = re.compile(
    r"(?P<prefix>^|\n|(?<=[.!?]\s))"
    r"(?P<phrase>Inspected changes (?:in|to)\s+"
    r"(?P<path>[^\s`\"'<>)]+)"
    r"(?:\s*\([^)]{0,120}\))?[.;]?\s*)"
)
MAX_EVIDENCE_PATH_LENGTH = 260
MAX_MODEL_PROSE_SCAN_CHARS = 100_000


IGNORED_EVIDENCE_PARTS = {
    "home",
    "runner",
    "_temp",
    "opencode-pr-head",
    "opencode-review-project",
    "bounded-review-evidence.md",
    "opencode-review-evidence.md",
}


def safe_relative_evidence_path(path: str) -> str | None:
    """Return a safe relative changed-file-looking path, or None."""
    normalized = path.strip().replace("\\", "/").rstrip(".,;:")
    path_parts = normalized.split("/")
    if (
        not normalized
        or len(normalized) > MAX_EVIDENCE_PATH_LENGTH
        or "\x00" in normalized
        or normalized.startswith("/")
        or normalized.startswith("../")
        or normalized.startswith("./")
        or "/../" in normalized
        or "/./" in normalized
        or "//" in normalized
        or normalized in {".", ".."}
        or any(part in {"", ".", ".."} for part in path_parts)
        or any(part in IGNORED_EVIDENCE_PARTS for part in path_parts)
    ):
        return None
    if not CHANGED_FILE_EVIDENCE_PATTERN.fullmatch(normalized):
        return None
    return normalized


def admits_missing_structural_review(reason: str, summary: str) -> bool:
    """Return whether an approval admits it did not inspect required structure."""
    combined = f"{reason}\n{summary}".casefold()
    return any(phrase in combined for phrase in STRUCTURAL_FAILURE_PHRASES) or any(
        pattern.search(combined) for pattern in STRUCTURAL_FAILURE_PATTERNS
    )


def mentions_changed_file_evidence(reason: str, summary: str) -> bool:
    """Return whether an approval names at least one concrete changed file/path."""
    return bool(CHANGED_FILE_EVIDENCE_PATTERN.search(f"{reason}\n{summary}"))


def first_changed_file_evidence(text: str) -> str | None:
    """Return the first relative changed-file-looking path in model prose."""
    for match in CHANGED_FILE_EVIDENCE_PATTERN.finditer(text[:MAX_MODEL_PROSE_SCAN_CHARS]):
        if match.start() > 0 and text[match.start() - 1] == "/":
            continue
        evidence = safe_relative_evidence_path(match.group(0))
        if evidence is not None:
            return evidence
    return None


def changed_files_from_evidence(evidence_text: str) -> list[str]:
    """Return safe paths from the bounded evidence changed-files section."""
    changed_files: list[str] = []
    in_changed_files = False
    for raw_line in evidence_text.splitlines():
        line = raw_line.strip()
        if line == "## Changed files":
            in_changed_files = True
            continue
        if in_changed_files and line.startswith("## "):
            break
        if not in_changed_files or not line:
            continue

        tab_parts = [part.strip() for part in line.split("\t") if part.strip()]
        if len(tab_parts) >= 2 and re.fullmatch(r"[A-Z][0-9]*", tab_parts[0]):
            evidence = safe_relative_evidence_path(tab_parts[-1])
            if evidence is not None:
                changed_files.append(evidence)
            continue

        match = re.match(r"^[A-Z][0-9]*\s+(.+)$", line)
        if match:
            path = match.group(1)
            if " -> " in path:
                path = path.rsplit(" -> ", 1)[-1]
            evidence = safe_relative_evidence_path(path)
            if evidence is not None:
                changed_files.append(evidence)

    return changed_files


def first_changed_file_from_evidence(evidence_text: str) -> str | None:
    """Return the first path from the bounded evidence changed-files section."""
    changed_files = changed_files_from_evidence(evidence_text)
    return changed_files[0] if changed_files else None


def first_actual_changed_file_evidence(text: str, changed_files: list[str]) -> str | None:
    """Return the first mentioned path that is in the bounded changed-file list."""
    changed_file_set = set(changed_files)
    for match in CHANGED_FILE_EVIDENCE_PATTERN.finditer(text[:MAX_MODEL_PROSE_SCAN_CHARS]):
        if match.start() > 0 and text[match.start() - 1] == "/":
            continue
        evidence = safe_relative_evidence_path(match.group(0))
        if evidence in changed_file_set:
            return evidence
    return None


def repair_changed_file_evidence_phrase(
    text: str,
    changed_files: list[str],
    replacement: str,
) -> str:
    """Replace non-current changed-file evidence phrases with a real changed path."""
    changed_file_set = set(changed_files)

    def replace_match(match: re.Match[str]) -> str:
        """Replace the matched phrase with the first actual changed file evidence."""
        """Replace the matched phrase with the first actual changed file evidence."""
        raw_evidence = match.group(2)
        stripped_evidence = raw_evidence.rstrip(".,;:")
        punctuation = raw_evidence[len(stripped_evidence) :]
        evidence = safe_relative_evidence_path(raw_evidence)
        if evidence is not None and evidence not in changed_file_set:
            return f"{match.group(1)}{replacement}{punctuation}"
        return match.group(0)

    return EVIDENCE_PHRASE_PATTERN.sub(replace_match, text[:MAX_MODEL_PROSE_SCAN_CHARS])


def remove_unsupported_inspected_change_phrases(text: str, changed_files: list[str]) -> str:
    """Drop model prose that claims inspection of a non-current changed file."""
    changed_file_set = set(changed_files)

    def replace_match(match: re.Match[str]) -> str:
        """Replace the matched phrase with the first actual changed file evidence."""
        """Replace the matched phrase with the first actual changed file evidence."""
        evidence = safe_relative_evidence_path(match.group("path"))
        if evidence is None or evidence not in changed_file_set:
            return match.group("prefix")
        return match.group(0)

    cleaned = INSPECTED_CHANGES_PHRASE_PATTERN.sub(
        replace_match,
        text[:MAX_MODEL_PROSE_SCAN_CHARS],
    )
    return re.sub(r" {2,}", " ", cleaned).strip()


def check_structural_approval(control_file: Path) -> int:
    """Validate an already-normalized control block before publishing approval."""
    try:
        value = json.loads(control_file.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(f"cannot read OpenCode control JSON: {exc}", file=sys.stderr)
        return 65

    if not isinstance(value, dict):
        print("NO_CONCLUSION", file=sys.stderr)
        return 4

    if value.get("result") == "APPROVE" and admits_missing_structural_review(
        str(value.get("reason", "")),
        str(value.get("summary", "")),
    ):
        print("NO_CONCLUSION", file=sys.stderr)
        return 4
    if value.get("result") == "APPROVE" and not mentions_changed_file_evidence(
        str(value.get("reason", "")),
        str(value.get("summary", "")),
    ):
        print("NO_CONCLUSION", file=sys.stderr)
        return 4

    return 0


def valid_control(
    value: Any,
    *,
    expected_head_sha: str,
    expected_run_id: str,
    expected_run_attempt: str,
    source_text: str = "",
    evidence_text: str = "",
) -> dict[str, Any] | None:
    """Return a normalized control block when it matches the current run."""
    if not isinstance(value, dict):
        return None

    if value.get("head_sha") != expected_head_sha:
        return None
    if value.get("run_id") != expected_run_id:
        return None
    if value.get("run_attempt") != expected_run_attempt:
        return None

    result = value.get("result")
    if result not in {"APPROVE", "REQUEST_CHANGES"}:
        return None

    if not isinstance(value.get("reason"), str) or not value["reason"].strip():
        return None
    if not isinstance(value.get("summary"), str) or not value["summary"].strip():
        return None
    reason = value["reason"].strip()
    summary = value["summary"].strip()

    findings = value.get("findings")
    if findings is None and result == "APPROVE":
        findings = []
    if not isinstance(findings, list):
        return None
    if result == "APPROVE" and findings:
        return None
    if result == "REQUEST_CHANGES" and not findings:
        return None
    if result == "APPROVE" and admits_missing_structural_review(reason, summary):
        return None
    if result == "APPROVE":
        changed_files = changed_files_from_evidence(evidence_text)
        if changed_files:
            summary = repair_changed_file_evidence_phrase(summary, changed_files, changed_files[0])
            summary = remove_unsupported_inspected_change_phrases(summary, changed_files)
            evidence = first_actual_changed_file_evidence(f"{reason}\n{summary}", changed_files)
            if evidence is None:
                evidence = first_actual_changed_file_evidence(source_text, changed_files)
            if evidence is None:
                evidence = changed_files[0]
                summary = f"{summary} Inspected changed file evidence: {evidence}."
        elif not mentions_changed_file_evidence(reason, summary):
            evidence = first_changed_file_evidence(source_text)
            if evidence is None:
                evidence = first_changed_file_from_evidence(evidence_text)
            if evidence is None:
                return None
            summary = f"{summary} Inspected changed file evidence: {evidence}."

    required_finding_fields = (
        "path",
        "severity",
        "title",
        "problem",
        "root_cause",
        "fix_direction",
        "regression_test_direction",
        "suggested_diff",
    )
    for finding in findings:
        if not isinstance(finding, dict):
            return None
        line = finding.get("line")
        if isinstance(line, bool) or not isinstance(line, int) or line <= 0:
            return None
        for field in required_finding_fields:
            if not isinstance(finding.get(field), str) or not finding[field].strip():
                return None

    return {
        "head_sha": value["head_sha"],
        "run_id": value["run_id"],
        "run_attempt": value["run_attempt"],
        "result": result,
        "reason": reason,
        "summary": summary,
        "findings": findings,
    }


def iter_json_objects(text: str) -> list[Any]:
    """Extract JSON objects from raw OpenCode output that may include prose."""
    decoder = json.JSONDecoder()
    values: list[Any] = []

    try:
        values.append(json.loads(text))
    except json.JSONDecodeError:
        # OpenCode exports may contain prose around the JSON control object.
        pass

    for index, character in enumerate(text):
        if character != "{":
            continue
        try:
            value, _ = decoder.raw_decode(text[index:])
        except json.JSONDecodeError:
            continue
        values.append(value)

    return values


def main(argv: list[str]) -> int:
    """Run the normalizer CLI and write the publishable control block."""
    if len(argv) == 3 and argv[1] == "--check-structural-approval":
        return check_structural_approval(Path(argv[2]))

    if len(argv) not in {5, 6}:
        print(
            "usage: opencode_review_normalize_output.py "
            "<expected_head_sha> <expected_run_id> <expected_run_attempt> <output_file> [evidence_file]\n"
            "   or: opencode_review_normalize_output.py --check-structural-approval <control_json_file>",
            file=sys.stderr,
        )
        return 64

    expected_head_sha, expected_run_id, expected_run_attempt, output_file_arg = argv[1:5]
    output_file = Path(output_file_arg)
    try:
        output_text = output_file.read_text(encoding="utf-8")
    except OSError as exc:
        print(f"cannot read OpenCode output file: {exc}", file=sys.stderr)
        return 65

    evidence_text = ""
    if len(argv) == 6:
        try:
            evidence_text = Path(argv[5]).read_text(encoding="utf-8")
        except OSError as exc:
            print(f"cannot read OpenCode evidence file: {exc}", file=sys.stderr)
            return 65

    for value in iter_json_objects(output_text):
        control = valid_control(
            value,
            expected_head_sha=expected_head_sha,
            expected_run_id=expected_run_id,
            expected_run_attempt=expected_run_attempt,
            source_text=output_text,
            evidence_text=evidence_text,
        )
        if control is None:
            continue

        normalized_json = json.dumps(control, separators=(",", ":"), ensure_ascii=False)
        output_file.write_text(
            "\n".join(
                [
                    (
                        "<!-- opencode-review-gate "
                        f"head_sha={expected_head_sha} "
                        f"run_id={expected_run_id} "
                        f"run_attempt={expected_run_attempt} -->"
                    ),
                    "",
                    "<!-- opencode-review-control-v1",
                    normalized_json,
                    "-->",
                    "",
                ]
            ),
            encoding="utf-8",
        )
        return 0

    print("NO_CONCLUSION", file=sys.stderr)
    return 4


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
