# Trial readout: PROMPT-WF-04 → Composer 2.5 (Cursor agentstream) → `1794170303-wf-agentstream-wf-04-cursor-composer25`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-08 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-04`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-04](catalog-traditional-workflow-trial-prompts.md#prompt-wf-04) |
| **Model config** | `composer-2.5` |
| **Model slug** | `composer-2.5-fast` |
| **Harness** | `cursor-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794170303-wf-agentstream-wf-04-cursor-composer25` |
| **Factory tag** | `wf-agentstream-wf-04-cursor-composer25` |
| **Product REQ** | `REQ-REQID_MARKER_SCAN_CLI` |
| **TIED methodology version (session)** | **4.2.1** — source **`install_json`**; evidence `…/REQ-REQID_MARKER_SCAN_CLI/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | **Isolated re-run** after chained batch **1794165*** harness abort [1794167373](trial-readout-PROMPT-WF-04-composer25-1794167373-wf-agentstream-wf-04-cursor-composer25.md); pairs [gold @ 1793851888](trial-readout-PROMPT-WF-04-composer25-1793851888-wf-agentstream-wf-04-cursor-composer25.md). |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a CLI that scans a tiny committed fixture directory of source files for comment markers that look like requirement identifiers and compares them to a fixture index file listing allowed ids. Report orphans and matches. Tests must use only the fixture tree, not live project indexes.
```

**Catalog stress:** traceability scan. **Proof boundary:** `traceability_structure` + orchestrator log + facilitator verification.

---

## Outcome record

**Implementation outcome:** Delivered — **`src/reqid-scan/`** scanner, index loader, compare, report, CLI; facilitator **`npm test` 16/16**.

**Workflow outcome:** **Complete** — orchestrator **`exit_code: 0`**; four sessions with four `session_id` lines; machine **`close_out` `allowed: true`**.

**Grading outcome:** Dimension bands describe this session only — not methodology effectiveness or a model leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | `close_out-2026-11-08T20-48-26-036Z.json` → `allowed: true` |
| **Process contract** | **partial** | Envelope + verification manifest; minimal-depth advisories |
| **Adherence ledger** | **not_run** | Typical minimal WF trial |
| **Close-out honesty** | **pass** | Handoff matches machine gate |

---

## Four-turn table

| Turn | Skill | Outcome |
| --- | --- | --- |
| 1 | `add-feature` | REQ/PLAN/CITDP; stack seeded; no product code |
| 2 | `refine-plan` | ARCH/IMPL + pseudo-code; `pre_implementation` receipt |
| 3 | `build-plan` | RED archived; GREEN **16** tests; `src/reqid-scan/` |
| 4 | `close-out` | CITDP persist; envelope; commit **`b437ba0`** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `…/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall** | ~11.8 min (`2026-11-08T20:38:24Z` → `20:50:11Z`) |

**Friction excerpts:**

- `DIAGNOSTIC: WF trial stack seeded` (package.json, tsconfig, `.gitkeep`)
- Four turn banners each with **`session_id`** (`98b7d09f-…` through `0bf67082-…`)
- **No** `RetriableError: WritableIterable is closed` (contrast batch [1794167373](trial-readout-PROMPT-WF-04-composer25-1794167373-wf-agentstream-wf-04-cursor-composer25.md))

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git | Bootstrap **`5fc375e`** then feature **`b437ba0`** — product commit at close-out boundary |
| RED | Archived per `evidence/red-unit-test-archive.md` |
| Inventory | Four turns **complete** with `close_out_gate_receipt` |

---

## Stack compliance

| Check | Result |
| --- | --- |
| **`implementation_stack_id`** | `wf-trial-ts-node-test-v1` |
| Facilitator | **16/16** tests; typecheck pass |

**Facilitator verification:** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-04-1794170303-wf-agentstream-wf-04-cursor-composer25/evidence/build-plan-verification-evidence.md)

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | matches/orphans/unreferenced + exit 0/1/2 locked before code |
| Traceability closure | **A** | REQ index **Implemented**; CITDP persisted |
| Test strategy | **A** | RED archive; sixteen hermetic fixture tests |
| Algorithm / implementation | **A−** | Comprehensive scanner + CLI vs prior gold eight-test slice |
| Process adherence | **A−** | Gates + envelope; minimal-depth advisories only |
| Workflow choreography | **A** | Isolated four-turn run; **`exit_code: 0`**; no WritableIterable |
| Methodology learning readout | **B+** | Documents recovery from batch harness abort without ranking models |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness; isolated rerun restores **workflow complete** evidence for the **(PROMPT-WF-04, cursor, composer-2.5)** cell but does not erase prior **split-signal** batch rows — both remain part of the record.

---

## Cross-model notes

- [Batch split @ 1794167373](trial-readout-PROMPT-WF-04-composer25-1794167373-wf-agentstream-wf-04-cursor-composer25.md): same REQ token, **11/11** uncommitted, harness **`exit_code: 1`**.
- [Earlier gold @ 1793851888](trial-readout-PROMPT-WF-04-composer25-1793851888-wf-agentstream-wf-04-cursor-composer25.md): complete with **8/8** and traceable commits.

No ranking.
