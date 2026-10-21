# Sponsor witness baseline — `pseudocode_validate` path-only JSON

**Working REQ:** [REQ-PSEUDOCODE_VALIDATE_PATH_INPUT](../PLAN.md) (tokens mint at `@build-plan`)  
**Role:** Sponsor **witness** on a **TIED client** (user observed operator failure; not the executing agent).  
**Touchpoint 1:** `/xlate` sponsor feedback → Kaizen point-of-work capture · 2026-10-21 (UTC-7).

## Observation

Operator ran Layer B validate with token + sidecar path (HTOL runbook IMPL), matching PLAN **sponsor replay acceptance**:

```bash
.cursor/skills/tied-yaml/scripts/tied-cli.sh pseudocode_validate \
  '{"token":"IMPL-TIED_HTOL_PILOT_COHORT_RUNBOOK","gate_mode":true,"pseudocode_path":"implementation-decisions/IMPL-TIED_HTOL_PILOT_COHORT_RUNBOOK-pseudocode.md"}' \
  2>&1 | tail -20
```

**Failure (witnessed by sponsor; replayed in stdd store — same output):**

```text
DIAGNOSTIC: TIED_CLI_HINDRANCE {"failure_kind":"invalid_arguments","jsonrpc_code":-32602,"tool_name":"pseudocode_validate","recovery_hint":"Fix tools/call arguments per tool schema; record fields accept native objects or legacy JSON strings."}
MCP error -32602: Input validation error: Invalid arguments for tool pseudocode_validate: Required at pseudocode
```

## Sponsor intent

- Treat witness as **Kaizen / QMM** baseline for the planned **countermeasure** (essence pseudocode source resolution on `pseudocode_validate`).
- **No new scope** — existing initiative continues at `@build-plan` per [PLAN.md](../PLAN.md).

## Capture receipt

| Field | Value |
| --- | --- |
| MCP tool | `tied_feedback_capture_observation` |
| `feedback_id` | `fb-mvia5ie8-837apk` |
| Idempotency key | `sponsor-witness-pseudocode-validate-path-htol-20261021` |
| Store | `{TIED_BASE_PATH}/feedback.yaml` (`operator_local`) |
| Machine receipt | [kaizen-capture-receipt.json](./kaizen-capture-receipt.json) |

Capture-time `evidence_refs` used repo-relative paths and were **rejected** by `classifyEvidenceRef`; baseline narrative and PLAN/CITDP links in this file satisfy working evidence.

## Workaround before countermeasure

- Pass inline `pseudocode` text, or use **`pseudocode_analyze`** with **`essence_pseudocode_path`** for path-based sidecar reads today.
