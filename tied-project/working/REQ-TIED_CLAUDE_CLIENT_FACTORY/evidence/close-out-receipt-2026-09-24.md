# Close-out receipt — REQ-TIED_CLAUDE_CLIENT_FACTORY (working id)

**Date:** 2026-09-24  
**Plans:** `claude-first_tied_client_050d8b12.plan.md`, `claude_factory_close-out_143f245d.plan.md`

## Three completion signals

| Signal | Status |
| --- | --- |
| **1. Machine close-out** | **Pass** — `close_out` `merged_decision.allowed: true`; gate JSON: `working/REQ-TIED_CLAUDE_CLIENT_FACTORY/gates/close-out-REQ-TIED_CLAUDE_CLIENT_FACTORY-20260924T195129Z.json` |
| **2. Envelope blocking gaps** | **Pass** — `blocking_gap_count: 0` on `working/REQ-TIED_CLAUDE_CLIENT_FACTORY/evidence/request-evidence-envelope.v1.json` |
| **3. Process contract** | **Pass** — Factory code + tests + minimal tracker/CITDP; no new REQ in `semantic-tokens.yaml` |

## Machine signals

| Check | Result |
| --- | --- |
| `pre_implementation` gate | **allowed: true** — `gates/pre-impl-REQ-TIED_CLAUDE_CLIENT_FACTORY-20260924T195055Z.stdout.txt` |
| `close_out` gate | **allowed: true**, envelope **blocking_gap_count: 0** |
| Validation unit tests | **6/6** — `evidence/claude-client-validation-test-stdout.txt` |
| new-tied-client e2e | **pass** — `evidence/new-tied-client-e2e-stdout.txt` |
| `tied_validate_consistency` | **ok** — `evidence/tied-validate-consistency-summary.json` |
| Reconcile note | `gitignore-close-out-hygiene` cited this receipt before file existed; receipt written post-gate |

## Git staging (factory-only)

**Stage:** bootstrap/scripts/e2e/IMPL sidecar/comparison doc/CHANGELOG + `working/REQ-TIED_CLAUDE_CLIENT_FACTORY/**` (factory paths per close-out plan).

**Exclude:** adversarial-inquiry fixture envelopes; `working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/fixture-*/regression-manifest.json`; `working/REQ-TIED_CLAUDE_SKILLS_REROOT/create-*.json`.

## Gitignore hygiene

**N/A** — no new recurring ephemeral pattern; exclude list documented above.

## Residual

- Optional `TIED_RUN_CLAUDE_CLIENT_FACTORY_E2E=1` full disposable smoke not run.
- Interactive onboarding + live one-turn documented in unified receipt (2026-09-24 replay).
- Full IMPL sidecar `pseudocode_validate` may still warn on pre-existing tokens; new `RUN_CLAUDE_*` blocks added in IMPL-TIED_CLAUDE_BOOTSTRAP_OPS sidecar.
- **RISK-BOOT-005** — no Claude adherence hooks.

## Proposed commit message

```
Add Claude-first disposable TIED client factory and validation receipt.

Operators get test-new-claude-tied-client and tied-cli MCP smoke without
Cursor mcp enable; close-out evidence under working/REQ-TIED_CLAUDE_CLIENT_FACTORY/.
```

**Not committed** per plan-close-out policy.
