# Trial readout: PROMPT-WF-02 → Claude Sonnet 5.5 (Claude agentstream) → `1794101881-wf-agentstream-wf-02-claude-sonnet55`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-08 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow-trial-agentstream wf-02`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-02](catalog-traditional-workflow-trial-prompts.md#prompt-wf-02) |
| **Model config** | `sonnet55` |
| **Model slug** | `claude-sonnet-5-5` |
| **Harness** | `claude-agentstream-four-phase` ([run-traditional-four-phase-agentstream.sh](../../scripts/run-traditional-four-phase-agentstream.sh) via [workflow-trial-agentstream.sh](../../scripts/workflow-trial-agentstream.sh)) |
| **Client root** | `/Users/fareed/Documents/dev/test/1794101881-wf-agentstream-wf-02-claude-sonnet55` |
| **Factory tag** | `wf-agentstream-wf-02-claude-sonnet55` |
| **Product REQ** | `REQ-DEDUP_LINES_CLI` |
| **TIED methodology version (session)** | **4.2.1** — source **`install_json`** on session file (`capture_path: mcp_server_info` turn 1); evidence `…/REQ-DEDUP_LINES_CLI/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | First **PROMPT-WF-02** Claude Sonnet **4.2.1** batch row (split/incomplete). |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a CLI that reads lines from stdin and prints a deduplicated stream to stdout. The requirement is intentionally vague about whether duplicate lines should keep first or last occurrence. Document your chosen policy and what you do not guarantee before shipping. Include tests for at least two input orderings.
```

**Catalog stress:** ambiguity deferral — interpretation documented before implementation. **Proof boundary:** `human_decision + executable_behavior` + orchestrator process log + facilitator git replay.

---

## Agent processing difficulties (per turn)

| Turn | Skill | Difficulties / friction |
| --- | --- | --- |
| **1** | `add-feature` | Session `fd91398a-…`. keep-first default + `--keep=last` RESOLVE; PLAN-only discipline. |
| **2** | `refine-plan` | Session `35d81762-…`. Module boundaries + non-guarantees table; advisory gate notes. |
| **3** | `build-plan` | Session `b2790d25-…`. GREEN **18/18**; `sub-adversarial-inquiry-pass` left **pending**; no commit. |
| **4** | `close-out` | Session `1e308b50-…`. Gate **`allowed: false`** (`pending_required_step:sub-adversarial-inquiry-pass`); envelope **0** blocking; commit skipped. |

**Cross-turn harness notes:** batch under `/var/folders/.../traditional-four-phase-batch.*.yaml`; ~~4.2 min wall (`2026-11-08T01:38:02Z` → `2026-11-08T01:42:11Z`).

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| deduplicated stream | Each distinct line content once in output | PLAN refine |
| duplicate | Exact string equality (no trim/normalize) | `src/dedupe.ts` |
| vague keep-first vs keep-last | Default **keep-first** (streaming); `--keep=last` buffered at EOF | README + CLI |
| two input orderings | ≥2 orderings tested per policy in `dedupe.test.ts` | Tests |
| documented non-guarantees | Memory unbounded, LF output only, no UTF-8 byte preservation | README |

---

## What was built

- **Product:** `src/dedupe.ts`, `src/cli.ts`, tests, `README.md` — facilitator **18/18**; **no product git commit**.
- **TIED:** `REQ-DEDUP_LINES_CLI` + ARCH/IMPL detail files; CITDP under `tied-project/citdp/` when close-out completed (WF-02: draft only on disk).
- **Stack:** `wf-trial-ts-node-test-v1`; RED/GREEN archives under `evidence/quality-manifest/` where build-plan ran.
- **Git:** bootstrap **`5a0ffef`** + product/close-out **`(bootstrap only)`** (5a0ffef — TIED 4.2.1; product tree uncommitted).
- **Orchestrator:** `MODEL_SLUG=claude-sonnet-5-5` `HARNESS=claude` `workflow_trial_agentstream wf-02`.

---

## Outcome record

**Implementation outcome:** **Delivered (disk)** — facilitator `npm test` **18/18**; typecheck pass.

**Workflow outcome:** **Incomplete** — four orchestrator turns; inventory + handoffs aligned with machine/process signals below.

**Grading outcome:** Dimension bands describe this session only — not methodology effectiveness or a model leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **fail** | See close-out handoff + gate receipt paths in working folder |
| **Process contract** | **partial** | Verification manifest often skipped (`no_citdp_commands`); tracker dual-write gaps noted in handoffs |
| **Adherence ledger** | **not_run** | `legacy_no_adherence_chain` / thin ledger warns on several turns |
| **Close-out honesty** | **pass** | Handoffs document gate blocks and waivers without fabricating evidence |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| REQ / ARCH / IMPL | `tied-project/requirements/`, `architecture-decisions/`, `implementation-decisions/` |
| PLAN | `tied-project/working/REQ-DEDUP_LINES_CLI/PLAN.md` |
| CITDP | `tied-project/citdp/CITDP-REQ-DEDUP_LINES_CLI.yaml` (if close-out completed) |
| **Interaction inventory** | `…/evidence/trial-workflow-interaction-inventory.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-02-1794101881-wf-agentstream-wf-02-claude-sonnet55/evidence/build-plan-verification-evidence.md) — `tied_validate_consistency` **`ok: true`** on subject client.

**Proof boundary:** `facilitator_session_reconstruction` — paths, gate diagnostics, orchestrator log excerpts; not full chat transcripts.

**Feedback ingest:** N/A (`--skip-feedback-ingest`; no store `tied_feedback_add` this pass).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ + keep-first/last policy in PLAN |
| 2 | `refine-plan` | Locked streaming vs buffered semantics |
| 3 | `build-plan` | RED → GREEN **18**; CLI + unit tests |
| 4 | `close-out` | **FAIL** — adversarial inquiry stub pending; honest handoff |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `/Users/fareed/Documents/dev/test/1794101881-wf-agentstream-wf-02-claude-sonnet55/tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | ~4.2 min |
| **Stdout log** | `…/evidence/process.stdout.log` |
| **Stderr log** | `…/evidence/process.stderr.log` |

**Friction excerpts (stderr / manifest):**

- `DIAGNOSTIC: tied_methodology_version=4.2.1 source=orchestrator_resolver (secondary; session evidence file canonical)`
- `DIAGNOSTIC: WF trial stack seeded: …/package.json` (and `tsconfig.json`, `src/.gitkeep`)
- `DIAGNOSTIC: materialized WF trial preload contract: …/agent-preload-contract.yaml`
- `DIAGNOSTIC: harness=claude model=claude-sonnet-5-5 … dry_run=0`
- `--- turn 1/4 (new session) ---` / `session_id=fd91398a-3aaa-43ec-956b-3b73f717ca98`
- `--- turn 2/4 (new session) ---` / `session_id=35d81762-42f3-4800-84a3-9aa8e2ae88b0`
- `--- turn 3/4 (new session) ---` / `session_id=b2790d25-8270-4004-8a45-a1fceddd022b`
- `--- turn 4/4 (new session) ---` / `session_id=1e308b50-a1c3-46b3-bcb8-90462e5bd201`
- `DIAGNOSTIC: wf-trial process log manifest=…` — **`exit_code: 0`**

**Cross-check:** Harness **`0`** vs git/traceable state documented in outcome record.

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git history | **Only bootstrap commit** — product exists uncommitted (split signal) |
| Inventory vs git | Sponsor_turns recorded in `trial-workflow-interaction-inventory.v1.json` |
| RED evidence | Archived under `evidence/quality-manifest/` when build-plan ran |
| Uncertainty | REQ index **`Planned`** despite green delivery where applicable; `tied_verify` not run |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` in inventory + PLAN |
| Facilitator `npm test` | **18** pass |
| `npm run typecheck` | **pass** |
| Deviation | None on stack |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Vague keep-first/last resolved with documented non-guarantees |
| Traceability closure | **B+** | ARCH/IMPL on disk; CITDP not in `citdp/`; all product **uncommitted** |
| Test strategy | **A** | **18** cases incl. two orderings per policy + CLI spawn tests |
| Algorithm / implementation | **A** | Streaming keep-first + buffered keep-last |
| Process adherence | **C+** | Build deferred adversarial step; close-out blocked despite envelope pass |
| Workflow choreography | **B** | Harness **`0`** but machine close_out **fail** — split signal |
| Methodology learning readout | **B** | Shows gate honesty when tracker step not waived at minimal depth |

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries. The **`workflow-trial-agentstream`** path documents **operator reproducibility**, not that agentstream beats manual IDE skills.

---

## Cross-model notes (PROMPT-WF-02)

Pairs [luna-high @ 1794075940](trial-readout-PROMPT-WF-02-luna-high-1794075940-wf-agentstream-wf-02-cursor-lunahigh.md): both **green tests uncommitted** + close-out blocked; Sonnet richer **18** tests vs luna **8**.

Contrasts nine-model IDE cohort in [wf-02 comparison](wf-02-nine-model-implementation-comparison.md) (human-in-IDE; not agentstream).

No ranking — prose cohort context only.

---

## Cohort comparisons vs peer WF readouts

Documents **PROMPT-WF-02** Sonnet **4.2.1** **split signal**: orchestrator **`0`**, executable **18/18**, workflow **incomplete** on adversarial gate.

---

## TIED version / dogfood

Session evidence cites **TIED 4.2.1** (turn-1 `install_json` / `mcp_server_info`). Records **PROMPT-WF-02** Sonnet batch on the **4.2.1** bootstrap line; **not** an effectiveness claim for TIED 4.2.1 or Claude Sonnet 5.5.

---

## Facilitator follow-ups

- Sponsor: waive `sub-adversarial-inquiry-pass` or author minimal adversarial evidence, then re-run close-out + commit.
- Replay commit hygiene after gate pass.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [WF trial orchestrator process log REQ](../../tied-project/requirements/REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG.yaml)
- [Facilitator evidence folder](../../tied-project/working/FACILITATOR-WF-02-1794101881-wf-agentstream-wf-02-claude-sonnet55/PLAN.md)
