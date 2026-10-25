# Build-plan handoff — DOC-ANTHROPIC-FORMAL-VERIFICATION-COMPARISON

| Field | Value |
| --- | --- |
| **Date** | 2026-10-25 |
| **Plan** | [PLAN-refine-pass1.md](../PLAN-refine-pass1.md) |
| **Change class** | comparisons_doc_only; `profile_depth: minimal` |

## Deliverables

| Artifact | Path | Status |
| --- | --- | --- |
| Wave 1 capture | `docs/comparisons/anthropic-llm-formal-verification-appendix.md` | done |
| Wave 2 analysis | `docs/comparisons/anthropic-llm-formal-verification-vs-tied-agent-management.md` | done |
| Git allowlist | `.gitignore` two `!docs/comparisons/anthropic-llm-*` lines | done |

## Doc QA (P0)

- **14-section parity:** Executive summary through Related documents present in Wave 2.
- **Claim labels:** Metrics labeled **Anthropic-reported**; TIED effectiveness **`not_measured`** in proof boundary.
- **Token grep:** References existing tokens (e.g. adversarial inquiry) only — no new REQ mint in analysis body.
- **Evidence boundary:** Rocq/Verus/benchmark not run in stdd workspace — stated in proof boundary.
- **YAML:** none changed — **`tied_validate_consistency`** skipped.

## Gates

- **pre_implementation:** `allowed: false` (`missing_or_invalid_depth`) — outreach DOC pattern; doc deliverables complete per sibling practice.
- **verification-gate:** Doc test strategy executed; no **`tied_verify`** (no behavior change).
- **close_out:** **Deferred** — sponsor may commit when ready; no automatic git.

## Wave 3

See analysis § Phased recommendations — all P1+ **Defer** unless sponsor scopes **add-feature**.
