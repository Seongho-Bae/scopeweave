# Warning / deprecation / lint / security triage

Use this checklist when CI or local verification reports warnings,
deprecated usage, lint failures, or security findings.

## Goal

Fix the root cause, not the symptom or the log line.

## Checklist

1. **Capture the exact evidence**
   - Save the exact command, warning text, exit code, and affected file/path.
   - Distinguish between hard failure, soft warning, and
     flaky/environmental noise.
2. **Classify the source**
   - Tooling deprecation
   - Lint/style violation
   - Security finding
   - Dependency/config drift
   - Repository-shape mismatch (for example server-oriented automation
     imported into a static repo)
3. **Find the first producer**
   - Prefer the first emitting command/file rather than downstream
     wrappers.
   - For workflows, inspect the exact step and action version before
     changing surrounding jobs.
4. **Check whether the warning is actionable or informational**
   - If actionable, patch the producing code/config.
   - If informational but intentional, document the reason and the
     safe operator response.
5. **Prefer durable fixes**
   - Update pinned actions, workflow flags, or script logic.
   - Add regression tests/source assertions when a subtle invariant
     mattered.
   - Avoid hiding warnings with broad ignores unless the warning is a
     verified false positive.
6. **Re-run the narrowest verification first**
   - Reproduce with the smallest relevant command.
   - Then rerun the broader repo-level verification.
7. **Record operator guidance**
   - Document the root cause, fix, and any safe workaround in repo docs
     when future operators are likely to hit it again.

## GitHub CLI deprecation example

### Symptom

`gh issue view` or `gh pr view` default output may emit
Projects(classic) deprecation warnings.

### Root cause

The default human-formatted view requests legacy presentation fields
that include deprecated Projects(classic) metadata.

### Safe workaround

- Prefer `gh api repos/<owner>/<repo>/issues/<n>` or other explicit REST
  calls.
- Or use explicit JSON field selection, for example `gh issue view 6
  --json title,body,labels`.

### Anti-pattern

- Do not suppress or ignore the warning while continuing to use the
  default view in automation.

## Exit criteria

- Root cause identified
- Minimal fix or explicit documented rationale applied
- Relevant narrow verification rerun
- Broader verification rerun when the change touches shared CI/scripts/docs
