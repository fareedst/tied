# Trial readout: PROMPT-WF-04 → Claude Haiku 5.5 (agentstream) → `1793853737-wf-agentstream-wf-04-claude-claudehaiku55`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-04 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow-trial-agentstream wf-04`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-04](catalog-traditional-workflow-trial-prompts.md#prompt-wf-04) |
| **Model config** | `claude-haiku-5-5` |
| **Model slug** | `claude-haiku-5-5` |
| **Harness** | `claude-agentstream-four-phase` ([run-traditional-four-phase-agentstream.sh](../../scripts/run-traditional-four-phase-agentstream.sh) via [workflow-trial-agentstream.sh](../../scripts/workflow-trial-agentstream.sh)) |
| **Client root** | `/Users/fareed/Documents/dev/test/1793853737-wf-agentstream-wf-04-claude-claudehaiku55` |
| **Factory tag** | `wf-agentstream-wf-04-claude-claudehaiku55` |
| **Product REQ** | `REQ-MARKER_ORPHAN_SCAN` |
| **Cohort comparison** | Third **PROMPT-WF-04** agentstream cell. Peers: [Composer @ 1793851888](trial-readout-PROMPT-WF-04-composer25-1793851888-wf-agentstream-wf-04-cursor-composer25.md) (complete close-out); [Sonnet @ 1793852946](trial-readout-PROMPT-WF-04-claudesonnet55-1793852946-wf-agentstream-wf-04-claude-claudesonnet55.md) (**incomplete** — CITDP YAML missing). |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a CLI that scans a tiny committed fixture directory of source files for comment markers that look like requirement identifiers and compares them to a fixture index file listing allowed ids. Report orphans and matches. Tests must use only the fixture tree, not live project indexes.
```

**Catalog stress:** traceability scan — YAML/MCP discipline across phases. **Proof boundary:** `traceability_structure` + workflow gate receipts on subject client + orchestrator process log.

---

## Agent processing difficulties (per turn)

| Turn | Skill | Difficulties / friction |
| --- | --- | --- |
| **1** | `add-feature` | **Cold session** `d9dd9a88-…`. Read ambiguous “comprehensive” preamble as **no scope creep**. REQ via tied-yaml MCP; full checklist template copied (~1715 lines). **JSON index** choice vs YAML peers. |
| **2** | `refine-plan` | **New session** `3730ddf0-…`. Fixed D1 bracket pattern vs prose; D5/D7 exit-code conflict. **pre_implementation blocked** initially (adversarial artifacts) — advisory, recorded in handoff. |
| **3** | `build-plan` | **New session** `e92075d7-…`. Gate workaround: `sub-adversarial-inquiry-pass` **not_applicable** + filled CITDP adversarial section. RED archived (`ERR_MODULE_NOT_FOUND`); **14/14 GREEN**; T9 guard false-positive fixed. **Verification gate allowed** but **no receipt file**; tracker `completed` empty (waiver). **No commit** until turn 4. |
| **4** | `close-out` | **New session** `41fd7413-…`. Envelope backfill for N/A receipt; **`citdp_record_write`** persisted YAML; **`tied_gate_check` allowed=true** but **`receipt_path: null`**. Stray root `working/` envelope deleted. Commit **`a01ee62`**; honest **partial** process/adherence signals. |

**Cross-turn harness notes:** batch `/var/folders/.../traditional-four-phase-batch.9TLNZGpapK.yaml`; orchestrator **`exit_code: 0`**, ~12.5 min wall (`2026-11-05T04:42:18Z` → `04:54:46Z`).

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| requirement identifier | Bracketed **`[REQ-…]`** on comment-qualified lines | PLAN D1; `src/marker-scan/scan.ts` |
| fixture directory | Committed tree under **`src/marker-scan/fixtures/`** (`.txt` sources) | PLAN D6 |
| fixture index | JSON **`{ "allowed": [...] }`** | `index-file.ts` |
| matches / orphans | Sorted file:line report; exit **1** if orphans (Q2 default) | CLI + tests |
| hermetic tests | T9 guard — tests must not reference live `tied-project` | `scan.test.ts` |
| stack | **`wf-trial-ts-node-test-v1`** | inventory; `package.json` |

---

## What was built

- **Product:** `src/marker-scan/{scan,index-file,cli}.ts` + colocated tests; fixture tree with invalid-UTF-8 case.
- **CLI:** `marker-scan <root-dir> <allowed-ids.json>` — matches/orphans text report.
- **TIED stack:** REQ/ARCH/IMPL + pseudo-code; **`tied-project/citdp/CITDP-REQ-MARKER_ORPHAN_SCAN.yaml`** persisted at close-out.
- **Tests:** facilitator **`npm test`** → **14/14** pass; **`npm run typecheck`** pass.
- **Git:** bootstrap **`9c83cd8`**; feature + TIED close-out **`a01ee62`** on **`main`** (not pushed).

---

## Outcome record

**Implementation outcome:** Successful — **14/14** tests pass on facilitator re-run; CLI behavior matches locked PLAN decisions.

**Workflow outcome:** **Machine close-out pass** with **partial** process contract and **not_run** adherence — handoff does not claim all three completion signals green.

**Grading outcome:** Dimension bands describe this session only — not methodology effectiveness or a model leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | `tied_gate_check` → `allowed: true`; envelope validate **0** blocking gaps; **no persisted gate JSON file** |
| **Process contract** | **partial** | Empty tracker `completed`; no verification manifest; PSA Layer C missing; sync-dispositions not run |
| **Adherence ledger** | **not_run** | No ledger / `gates/` dir; reconcile skipped |
| **Close-out honesty** | **pass** | Handoff explicitly lists open process/adherence items |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| REQ / ARCH / IMPL | `tied-project/requirements/`, `architecture-decisions/`, `implementation-decisions/` |
| PLAN | `tied-project/working/REQ-MARKER_ORPHAN_SCAN/PLAN.md` |
| CITDP | `tied-project/citdp/CITDP-REQ-MARKER_ORPHAN_SCAN.yaml` |
| Envelope | `.../evidence/request-evidence-envelope.v1.json` |
| Gates | **No** `gates/*.json` on disk — MCP gate allowed without receipt file |
| **Interaction inventory** | `.../evidence/trial-workflow-interaction-inventory.v1.json` — turn 4 `completed_with_open_process_items` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-04-1793853737-wf-agentstream-wf-04-claude-claudehaiku55/evidence/build-plan-verification-evidence.md) — `tied_validate_consistency` **`ok: true`**; REQ **Proposed** (no `tied_verify`).

**Proof boundary:** `facilitator_session_reconstruction` — paths, SHAs, gate narrative, orchestrator log excerpts; not full chat transcripts.

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ + PLAN + draft CITDP + inventory; tied-yaml REQ create; no product code |
| 2 | `refine-plan` | Locked D1–D9; advisory pre_implementation initially blocked |
| 3 | `build-plan` | RED/GREEN archived; gates allowed via CITDP adversarial fill; 14 tests; uncommitted |
| 4 | `close-out` | CITDP persist; envelope OK; gate allowed; commit **`a01ee62`**; partial process signals |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `/Users/fareed/Documents/dev/test/1793853737-wf-agentstream-wf-04-claude-claudehaiku55/tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | `0` |
| **Stdout / stderr** | `…/process.stdout.log`, `…/process.stderr.log` |

**Friction excerpts:**

- `DIAGNOSTIC: harness=claude model=claude-haiku-5-5` + WF trial stack seeded
- Four turn banners with distinct `session_id` values
- Stdout: pre_implementation gate iterations; close-out **`receipt_path: null`**; stray root `working/` envelope cleanup

**Cross-check:** Inventory four turns match stderr; first product commit **`a01ee62`** at close-out (no earlier `src/` commit).

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git history | **`9c83cd8`** bootstrap only until **`a01ee62`** — **pass** (no product commit before close-out turn) |
| RED evidence | **Present** — `marker-scan-red.stdout.txt` |
| Uncertainty | Per-turn SHAs not in inventory |

---

## Stack compliance

| Check | Result |
| --- | --- |
| **`implementation_stack_id`** | **`wf-trial-ts-node-test-v1`** |
| Product language | TypeScript ESM under `src/marker-scan/` |
| Facilitator verify | **`npm test`** 14/14; **`npm run typecheck`** pass |
| Waivers | None on stack skip |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A−** | Tight reading of sponsor scope; bracketed `[REQ-…]` + JSON index locked before code |
| Traceability closure | **B** | CITDP YAML persisted + commit; REQ stays **Proposed**; no `tied_verify`; no gate receipt files |
| Test strategy | **A−** | RED archived; 14 cases incl. hermetic guard; manifest deferred |
| Algorithm / implementation | **A−** | Heuristic comment scan; orphan exit code documented (Q2) |
| Process adherence | **B−** | Machine gates via MCP; tracker empty; partial process contract acknowledged |
| Workflow choreography | **A−** | Four sessions; product commit at close-out; honest three-signal table |
| Methodology learning readout | **B+** | Shows Haiku recovering Sonnet's CITDP-md failure mode via `citdp_record_write`; gate receipt persistence gap |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries. **`tied_gate_check` allowed=true** without a receipt file is a facilitator-visible gap for cohort tooling.

---

## Cross-model notes (PROMPT-WF-04)

Compared with [Claude Sonnet @ 1793852946](trial-readout-PROMPT-WF-04-claudesonnet55-1793852946-wf-agentstream-wf-04-claude-claudesonnet55.md):

- **Close-out:** Haiku **persisted CITDP YAML** and committed; Sonnet **blocked** on markdown-only CITDP.
- **Tests:** Both **14/14** on disk; Sonnet left tree uncommitted.

Compared with [Composer @ 1793851888](trial-readout-PROMPT-WF-04-composer25-1793851888-wf-agentstream-wf-04-cursor-composer25.md):

- **Gates:** Composer persisted **`gates/*.json`**; Haiku has **no** gate directory.
- **REQ status:** Composer index **Implemented** / detail drift; Haiku both **Proposed** (no verify).
- **Index format:** Haiku JSON allowed list vs Composer YAML `allowed_req_ids`.

No ranking — prose cohort context only.

---

## Cohort comparisons vs peer WF readouts

Third **PROMPT-WF-04** cell — completes the **Claude harness** pair (Haiku vs Sonnet) on traceability scan with **wf-trial-ts-node-test-v1**, contrasting **CITDP persist discipline** and **close-out completeness** on the same prompt.

---

## TIED 4.0.0 dogfood

Subject client bootstrapped at **TIED 4.0.0** (`9c83cd8`). Documents **Claude Haiku** four-phase agentstream with process logging on a traceability prompt; **not** an effectiveness claim.

---

## Facilitator follow-ups

- Run **`tied_verify`** on subject client if REQ **Implemented** promotion is desired for cohort tables.
- Investigate **`tied_gate_check` receipt_path: null`** on Claude harness close-outs.
- Optional: `@record-wf-trial` refresh after tracker sync if sponsor reruns close-out hygiene.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [PROMPT-WF-04 Composer peer](trial-readout-PROMPT-WF-04-composer25-1793851888-wf-agentstream-wf-04-cursor-composer25.md)
- [PROMPT-WF-04 Sonnet peer (incomplete)](trial-readout-PROMPT-WF-04-claudesonnet55-1793852946-wf-agentstream-wf-04-claude-claudesonnet55.md)
- [Facilitator evidence folder](../../tied-project/working/FACILITATOR-WF-04-1793853737-wf-agentstream-wf-04-claude-claudehaiku55/PLAN.md)
