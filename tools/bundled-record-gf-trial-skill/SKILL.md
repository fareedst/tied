---
name: record-gf-trial
description: Facilitator workflow from the TIED store — inspect a disposable greenfield client, grade vs GF catalog dimensions, publish docs/demos trial readout + catalog links, optional Kaizen feedback ingest. Use when the sponsor invokes /record-gf-trial or @record-gf-trial with a client path or numeric id. Store workspace only; not @feedback witness intake, not @plan-new-feature on the client.
disable-model-invocation: true
---

# record-gf-trial

**Audience:** facilitator in the **TIED methodology store** repo; subject disposable client is **read-only** unless the sponsor scopes repair.

**When:** After `@plan-new-feature` (and optional `@build-plan`) on a `test-new-tied-client` disposable client, the facilitator wants a **trial readout** recorded for longitudinal GF sampling and optional **feedback cycle** ingest into the store.

Explicit invocation only (`/record-gf-trial`, `@record-gf-trial`).

## Prerequisites

- Cursor workspace is the **TIED store** (not the disposable client alone).
- Store **`tied-yaml`** MCP available; subject client has `tied-project/` and completed product work to inspect.

## Procedure

1. **Strip prefix** — Remove `/record-gf-trial` or `@record-gf-trial`; remainder is client locator and optional flags (see [reference.md](./reference.md): `--force`, `--skip-feedback-ingest`, `--prompt PROMPT-GF-NN`).

2. **Workspace gate (required before writes)** — Call `tied_config_get_base_path`. Resolved path must be **`{store}/tied-project/`**, not the subject client's `tied-project/`. Present path to sponsor; wrong destination is a **costly choice**.

3. **Resolve client root** — Absolute path with `{root}/tied-project/`, or numeric id via `TIED_GF_TRIAL_CLIENTS_ROOT` (see reference). Fail closed if not a TIED client layout.

4. **PRELOAD** — [feedback-to-tied.md](../../tied-project/vocab/feedback-to-tied.md), [quality-assurance.md](../../tied-project/vocab/quality-assurance.md); [greenfield prompt catalog](../../docs/demos/catalog-greenfield-plan-new-feature-prompts.md); [TIED compact demo catalog](../../docs/demos/catalog-tied-compact-tools.md) grading guardrails.

5. **Idempotency** — Glob `docs/demos/trial-readout-*-{clientId}.md` under the store. If a match exists and **`--force`** is absent, **stop** and report existing readout path; do not duplicate catalog rows.

6. **Discover trial identity (read-only on client)** — Scan `tied-project/working/*/PLAN.md` for `PROMPT-GF-XX` or custom header; map facilitator index row → `TIED-DEMO-*`, exercise bridge, **proof_boundary**. Create store working folder `tied-project/working/FACILITATOR-{slug}-{clientId}/` with PLAN/CITDP/tracker per [FACILITATOR-GF-04 precedent](../../tied-project/working/FACILITATOR-GF-04-1792857852/PLAN.md) when publishing a **new** readout.

7. **Facilitator verification** — With client-scoped env (reference matrix): `git log -1`, project tests, lint/typecheck if present, `tied-cli.sh tied_validate_consistency`. Capture full JSON and stdout to `evidence/build-plan-verification-evidence.md`. **Do not** re-run subject `close_out` unless sponsor asks.

8. **Inspect completion signals** — Three-way table: machine close_out, process contract, adherence ledger (GF-04 §2.3). Note client `feedback.yaml` and `trial-prompt-interaction-inventory.v1.json` when present.

9. **Grade** — Six weighted dimensions from [facilitator grading readout](../../docs/demos/catalog-greenfield-plan-new-feature-prompts.md#facilitator-grading-readout); letter bands + rationale. **Forbidden:** `maturity_score`, universal scores, CMMI levels, leaderboard-as-maturity. Include **future-test rule** paragraph.

10. **Publish store deliverables** — Author readout per [reference.md § Readout contract](./reference.md); update **Recorded trials** in greenfield catalog and [docs/demos/README.md](../../docs/demos/README.md); add **CHANGELOG** Unreleased row. **Do not** mint store `[REQ-*]` for the subject product.

11. **Feedback cycle (optional)** — If client `feedback.yaml` has rows to upstream: sponsor-confirmed `tied_feedback_add` into **store** `tied-project/feedback.yaml` with `context` linking readout (**proxy store row** — distinct from client-originated **`/feedback`** receipt). Skip when `--skip-feedback-ingest`; readout must document ingest **N/A** and not imply client capture (see [reference.md § Feedback ingest modes](./reference.md)). Never auto `tied_feedback_promote`.

12. **Close-out** — Return paths to readout and evidence. **Git commit is sponsor-only** unless explicitly requested.

## Boundaries

| Surface | Role |
| --- | --- |
| **`@record-gf-trial`** | Facilitator ingest + trial readout from disposable client |
| **`@feedback`** | Sponsor witness point-of-work capture |
| **`@non-tied-plan`** | Generic non-TIED client planning |
| **`BUNDLED_STANDALONE_CLIENT_SKILLS`** | Does **not** include this skill; install via store self-install only |

## Related

- [reference.md](./reference.md) — env vars, verification matrix, readout section contract
- [examples.md](./examples.md) — sample invocations
- [README.md](./README.md) — operator install
