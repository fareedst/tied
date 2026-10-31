---
name: record-wf-trial
description: Facilitator workflow from the TIED store — inspect a disposable client that ran add-feature → refine-plan → build-plan → close-out, grade vs workflow catalog dimensions (including workflow choreography), publish docs/demos trial readout + catalog links, optional Kaizen feedback ingest. Use when the sponsor invokes /record-wf-trial or @record-wf-trial with a client path or numeric id. Store workspace only; not @record-gf-trial, not @feedback witness intake.
disable-model-invocation: true
---

# record-wf-trial

**Audience:** facilitator in the **TIED methodology store** repo; subject disposable client is **read-only** unless the sponsor scopes repair.

**When:** After **four-phase** workflow trials ([workflow prompt catalog](../../docs/demos/catalog-traditional-workflow-trial-prompts.md)) on a `test-new-tied-client` disposable client, the facilitator wants a **trial readout** for LLM/workflow comparison and optional **feedback cycle** ingest into the store.

Explicit invocation only (`/record-wf-trial`, `@record-wf-trial`).

## Prerequisites

- Cursor workspace is the **TIED store** (not the disposable client alone).
- Store **`tied-yaml`** MCP available; subject client has `tied-project/` and completed product work to inspect.

## Procedure

1. **Strip prefix** — Remove `/record-wf-trial` or `@record-wf-trial`; remainder is client locator and optional flags (see [reference.md](./reference.md): `--force`, `--skip-feedback-ingest`, `--prompt PROMPT-WF-NN`, `--model-config`).

2. **Workspace gate (required before writes)** — Call `tied_config_get_base_path`. Resolved path must be **`{store}/tied-project/`**, not the subject client's `tied-project/`. Present path to sponsor; wrong destination is a **costly choice**.

3. **Resolve client root** — Absolute path with `{root}/tied-project/`, or numeric id via `TIED_GF_TRIAL_CLIENTS_ROOT` or `TIED_WF_TRIAL_CLIENTS_ROOT` (see reference). Fail closed if not a TIED client layout.

4. **PRELOAD** — [feedback-to-tied.md](../../tied-project/vocab/feedback-to-tied.md), [quality-assurance.md](../../tied-project/vocab/quality-assurance.md); [traditional workflow prompt catalog](../../docs/demos/catalog-traditional-workflow-trial-prompts.md); [TIED compact demo catalog](../../docs/demos/catalog-tied-compact-tools.md) grading guardrails.

5. **Idempotency** — Glob `docs/demos/trial-readout-PROMPT-WF-*-{clientId}.md` under the store. If a match exists and **`--force`** is absent, **stop** and report existing readout path; do not duplicate catalog rows.

6. **Discover trial identity (read-only on client)** — Scan `tied-project/working/*/PLAN.md` for `PROMPT-WF-XX`, model config, and model slug; map facilitator index row → **proof_boundary** and workflow stress. Create store working folder `tied-project/working/FACILITATOR-WF-{slug}-{clientId}/` with PLAN/CITDP/tracker per [FACILITATOR-GF-04 precedent](../../tied-project/working/FACILITATOR-GF-04-1792857852/PLAN.md) when publishing a **new** readout.

7. **Facilitator verification** — With client-scoped env (reference matrix): `git log -1`, project tests, lint/typecheck if present, `tied-cli.sh tied_validate_consistency`. Capture full JSON and stdout to `evidence/build-plan-verification-evidence.md`. **Do not** re-run subject `close_out` unless sponsor asks.

8. **Inspect completion signals** — Three-way table: machine close_out, process contract, adherence ledger (GF-04 §2.3). Require or flag missing `trial-workflow-interaction-inventory.v1.json`. **Phase boundary audit:** compare git history to inventory turn order; note if product commits precede build-plan turn. **Four-turn table:** skill, outcome (plan updated / tests red / green / close-out signals).

9. **Grade** — Seven weighted dimensions from [facilitator grading readout](../../docs/demos/catalog-traditional-workflow-trial-prompts.md#facilitator-grading-readout); letter bands + rationale. **Cross-model notes:** prose comparison to other readouts for the same PROMPT-WF when they exist — no ranking. **Forbidden:** `maturity_score`, universal scores, CMMI levels, leaderboard-as-maturity. Include **future-test rule** paragraph.

10. **Publish store deliverables** — Author readout per [reference.md § Readout contract](./reference.md); update **Recorded trials** in workflow catalog and [docs/demos/README.md](../../docs/demos/README.md) workflow readouts table; add **CHANGELOG** Unreleased row. **Do not** mint store `[REQ-*]` for the subject product.

11. **Feedback cycle (optional)** — Same modes as [record-gf-trial reference § Feedback ingest](../../tools/bundled-record-gf-trial-skill/reference.md#feedback-ingest-modes-facilitator). Skip when `--skip-feedback-ingest`; readout must document ingest **N/A**. Never auto `tied_feedback_promote`.

12. **Close-out** — Return paths to readout and evidence. **Git commit is sponsor-only** unless explicitly requested.

## Boundaries

| Surface | Role |
| --- | --- |
| **`@record-wf-trial`** | Four-phase workflow trial readout |
| **`@record-gf-trial`** | Greenfield / single-session trial readout |
| **`@feedback`** | Sponsor witness point-of-work capture |
| **`BUNDLED_STANDALONE_CLIENT_SKILLS`** | Does **not** include this skill; install via store self-install only |

## Related

- [reference.md](./reference.md) — env vars, verification matrix, readout section contract
- [examples.md](./examples.md) — sample invocations
- [README.md](./README.md) — operator install
