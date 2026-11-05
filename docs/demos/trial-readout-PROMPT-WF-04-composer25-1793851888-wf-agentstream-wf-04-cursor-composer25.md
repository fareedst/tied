# Trial readout: PROMPT-WF-04 → Composer 2.5 (Cursor agentstream) → `1793851888-wf-agentstream-wf-04-cursor-composer25`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-04 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow-trial-agentstream wf-04`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-04](catalog-traditional-workflow-trial-prompts.md#prompt-wf-04) |
| **Model config** | `composer-2.5` |
| **Model slug** | `composer-2.5-fast` |
| **Harness** | `cursor-agentstream-four-phase` ([run-traditional-four-phase-agentstream.sh](../../scripts/run-traditional-four-phase-agentstream.sh) via [workflow-trial-agentstream.sh](../../scripts/workflow-trial-agentstream.sh)) |
| **Client root** | `/Users/fareed/Documents/dev/test/1793851888-wf-agentstream-wf-04-cursor-composer25` |
| **Factory tag** | `wf-agentstream-wf-04-cursor-composer25` |
| **Product REQ** | `REQ-FIXTURE_REQ_MARKER_AUDIT` |
| **Cohort comparison** | **First** facilitator **PROMPT-WF-04** readout. Same harness family as [WF-03 Cursor @ 1793820250](trial-readout-PROMPT-WF-03-composer25-1793820250-wf-agentstream-wf-03-cursor-composer25.md) but **wf-trial-ts-node-test-v1** orchestrator stack (post [REQ-WF_TRIAL_IMPLEMENTATION_STACK](../../tied-project/working/REQ-WF_TRIAL_IMPLEMENTATION_STACK/PLAN.md)). |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a CLI that scans a tiny committed fixture directory of source files for comment markers that look like requirement identifiers and compares them to a fixture index file listing allowed ids. Report orphans and matches. Tests must use only the fixture tree, not live project indexes.
```

**Catalog stress:** traceability scan — YAML/MCP discipline across phases. **Proof boundary:** `traceability_structure` + workflow gate receipts on subject client + orchestrator process log.

---

## Agent processing difficulties (per turn)

Friction cites **orchestrator process log** (`process.stderr.log` / agent stdout tee) where available.

| Turn | Skill | Difficulties / friction |
| --- | --- | --- |
| **1** | `add-feature` | **Cold session:** `session_id=013e0fcf-…` (stderr). **Stack locked:** `DIAGNOSTIC: WF trial stack seeded` for `package.json` / `tsconfig.json`; preload contract materialized. **Scaffold only:** no `src/` product or RED (stdout). |
| **2** | `refine-plan` | **New session** `3b0c544d-…`. ARCH/IMPL + pseudo-code + test-strategy; **pre_implementation** gate **allowed** (receipt on disk). **`tied_validate_consistency` OK** at end of refine. |
| **3** | `build-plan` | **New session** `61b53083-…`. **Fixture id grammar:** stdout notes correcting REQ ids to `REQ-[A-Z0-9_]+` (no illegal hyphens in suffix). **Harness friction:** unquoted `npm test` glob + **`yaml`** dep for index parse (stdout). **RED archived:** `ERR_MODULE_NOT_FOUND` for `./audit.js`. **GREEN:** 8/8 tests; **no git commit** this turn (product left uncommitted until close-out). |
| **4** | `close-out` | **New session** `fe67177e-…`. Commits **`a6c3048`** (feature + TIED + evidence) then **`6467e04`** (traceable-commit SHA line in evidence — dual-commit hygiene). **Reconcile not_run** (agentstream dist missing). **Honest three-signal table** with process contract **partial**, adherence **not_run**. |

**Cross-turn harness notes:** batch file `/var/folders/.../traditional-four-phase-batch.Ok4V2UWA7X.yaml`; orchestrator **`exit_code: 0`**, ~11.5 min wall (`2026-11-05T04:11:29Z` → `04:22:59Z`).

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| requirement identifier | **`REQ-[A-Z0-9_]+`** in comments only (bracket, bare, `#`, `//`, block) | PLAN §1; `src/audit.ts` |
| fixture directory | **`src/fixtures/req-marker-audit/scenarios/*`** — sole scan tree for tests | PLAN; scenario fixtures |
| fixture index | YAML **`allowed_req_ids`** beside scenarios | `allowed-ids.yaml` per scenario |
| matches / orphans | Sorted intersection vs index-only ids | PLAN; CLI sections `matched:` / `orphans:` |
| unindexed | Third section for comment ids not in index | PLAN (extends sponsor “orphans” wording) |
| hermetic tests | No reads of live `tied-project/requirements.yaml` | test-strategy; satisfaction criteria |
| stack | **`wf-trial-ts-node-test-v1`** — TypeScript ESM, `node --import tsx --test` | inventory; `package.json` |

---

## What was built

- **Library:** `src/audit.ts` — `runFixtureReqMarkerAudit(scanRoot, indexPath)` with sorted `matched` / `orphans` / `unindexed`.
- **CLI:** `src/cli.ts` — `--scan-root`, `--index`; exit 0 / 1 per IMPL.
- **Fixtures:** eight hermetic scenarios under `src/fixtures/req-marker-audit/scenarios/` (includes sample `.ts` and one `.py` grammar file inside fixture tree only).
- **Tests:** `src/audit.test.ts` — facilitator **`npm test`** → **8/8** pass; **`npm run typecheck`** pass.
- **TIED stack:** REQ/ARCH/IMPL on disk; CITDP persisted under `tied-project/citdp/`; four-turn inventory with close_out gate receipt path.
- **Git:** bootstrap **`ef203aa`**; feature + TIED scope **`a6c3048`**; evidence SHA follow-up **`6467e04`** on **`main`** (not pushed).

---

## Outcome record

**Implementation outcome:** Successful — **8/8** tests pass on facilitator re-run; behavior matches PROMPT-WF-04 fixture-bound traceability stress.

**Workflow outcome:** **Complete at turn 4** — machine `close_out` **allowed**, envelope validate **0** blocking gaps, traceable commits; handoff labels process contract **partial** and adherence **not_run** under strict three-signal wording.

**Grading outcome:** Dimension bands describe this session only — not methodology effectiveness or a model leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | `close_out-2026-11-05T04-20-56-276Z.json` → `allowed: true`; envelope `blocking_gaps=0` with `fail_on_error_gaps: true` |
| **Process contract** | **partial** | Verification manifest present; advisory `tracker_dual_write` / `tracker_sparse`; `--sync-dispositions` waived at minimal WF depth |
| **Adherence ledger** | **not_run** | Reconcile skipped — `@tied/agentstream` dist absent; thin-ledger warn only |
| **Close-out honesty** | **pass** | Handoff explicitly marks partial/not_run while machine gate passed |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| REQ / ARCH / IMPL | `tied-project/requirements/`, `architecture-decisions/`, `implementation-decisions/` |
| PLAN | `tied-project/working/REQ-FIXTURE_REQ_MARKER_AUDIT/PLAN.md` |
| Envelope | `.../evidence/request-evidence-envelope.v1.json` |
| Gates | `.../gates/pre_implementation-*.json`, `.../gates/close_out-*.json` |
| **Interaction inventory** | `.../evidence/trial-workflow-interaction-inventory.v1.json` — **`implementation_stack_id`: `wf-trial-ts-node-test-v1`** |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-04-1793851888-wf-agentstream-wf-04-cursor-composer25/evidence/build-plan-verification-evidence.md) — `tied_validate_consistency` **`ok: true`**; REQ index **Implemented** vs detail **Planned** drift noted.

**Proof boundary:** `facilitator_session_reconstruction` — paths, SHAs, gate narrative, orchestrator log excerpts; not full chat transcripts.

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold, CITDP draft, tracker, PLAN, inventory seed; WF stack seeded; no product code |
| 2 | `refine-plan` | Locked RESOLVE; ARCH/IMPL + pseudo-code; pre_implementation **allowed**; still no committed `src/` |
| 3 | `build-plan` | RED archived; fixtures + audit + CLI GREEN (8 tests); working tree only — no commit |
| 4 | `close-out` | Envelope, close_out gate, CITDP persist, commits **`a6c3048`** + **`6467e04`**; reconcile **not_run** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `/Users/fareed/Documents/dev/test/1793851888-wf-agentstream-wf-04-cursor-composer25/tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | `0` |
| **Stdout log** | `…/evidence/process.stdout.log` (agent turn summaries tee’d) |
| **Stderr log** | `…/evidence/process.stderr.log` (orchestrator DEBUG/DIAGNOSTIC, turn boundaries) |

**Friction excerpts (stderr / manifest):**

- `DIAGNOSTIC: WF trial stack seeded: …/package.json` (and tsconfig, `src/.gitkeep`)
- `DIAGNOSTIC: materialized WF trial preload contract: …/agent-preload-contract.yaml`
- `DIAGNOSTIC: harness=cursor model=composer-2.5-fast workspace=…/1793851888-wf-agentstream-wf-04-cursor-composer25 dry_run=0`
- Turn banners `--- turn N/4 (new session) ---` with four distinct `session_id` values
- `DIAGNOSTIC: batch=/var/folders/.../traditional-four-phase-batch.Ok4V2UWA7X.yaml`
- Final `DIAGNOSTIC: wf-trial process log manifest=…/wf-trial-orchestrator-run.v1.json`

**Stdout (build-plan):** fixture REQ-id correction loop; RED `ERR_MODULE_NOT_FOUND`; GREEN 8/8; npm script glob fix.

**Cross-check:** Inventory lists four turns; stderr turn count matches; first product commit **`a6c3048`** appears only after build-plan turn (close-out).

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git history | **`ef203aa`** bootstrap only until **`a6c3048`** — **no** committed `src/` before close-out turn (**pass** heuristic) |
| Inventory vs git | Turns 1–2 claim no production code; turn 3 build-plan without commit — consistent |
| RED evidence | **Present** — Pattern A `ERR_MODULE_NOT_FOUND` in `red-test-run.stdout.txt` |
| Uncertainty | Per-turn SHAs not in inventory; dual commit at close-out (`6467e04` evidence-only) |

---

## Stack compliance

| Check | Result |
| --- | --- |
| **`implementation_stack_id`** | **`wf-trial-ts-node-test-v1`** in interaction inventory |
| Product language | TypeScript under `src/` (`audit.ts`, `cli.ts`, colocated tests) |
| Facilitator verify | **`npm test`** 8/8; **`npm run typecheck`** pass |
| Waivers | None — orchestrator stack not skipped (`WF_TRIAL_SKIP_IMPLEMENTATION_STACK` not set) |
| Notes | Fixture tree includes sample `.py` for comment grammar only — not alternate product stack |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Bidirectional report (`unindexed`) locked at refine; comment-only and index-exclusion rules explicit before code |
| Traceability closure | **B+** | Full R+A+I + CITDP on disk; **index Implemented / detail Planned** drift despite close-out `tied_verify` claim |
| Test strategy | **A** | RED archived; eight hermetic scenarios cover grammar, literals, invalid index, three report sections |
| Algorithm / implementation | **A−** | Solid scanner + sorted outputs; minor build-plan friction on token regex and npm glob |
| Process adherence | **B** | Envelope pass; tracker dual-write advisory; reconcile **not_run**; partial process contract |
| Workflow choreography | **A** | Four isolated sessions; inventory updated; product commit deferred to close-out; honest completion table |
| Methodology learning readout | **B+** | First WF-04 cell with default process log + **WF trial TS stack**; contrasts with pre-stack WF-03 Cursor runs |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries. Process logs improve **operator reproducibility** and facilitator friction analysis; they do not replace subject-client gate receipts or prove Composer 2.5 beats other models on PROMPT-WF-04 until paired cells exist.

---

## Cross-model notes (PROMPT-WF-04)

No peer **PROMPT-WF-04** readouts yet — this cell establishes baseline for traceability-scan stress on **`wf-trial-ts-node-test-v1`**.

Compared with [PROMPT-WF-03 Cursor @ 1793820250](trial-readout-PROMPT-WF-03-composer25-1793820250-wf-agentstream-wf-03-cursor-composer25.md) (same harness, earlier prompt):

- **Stack:** WF-04 run uses orchestrator-seeded TypeScript stack; WF-03 Cursor cell predates uniform **wf-trial-ts-node-test-v1** seeding.
- **Prompt stress:** WF-04 emphasizes **fixture-only** tests and YAML index discipline vs WF-03 **composition seam** wiring.
- **Close-out pattern:** Both document reconcile **not_run** and partial process contract at minimal advisory depth.

No ranking — prose cohort context only.

---

## Cohort comparisons vs peer WF readouts

First **PROMPT-WF-04** publication — extends the agentstream matrix beyond WF-01–03 catalog rows. Pilot intent ([catalog](catalog-traditional-workflow-trial-prompts.md#recommended-trial-sequences)): add Luna/Claude WF-04 cells before cross-harness traceability claims.

---

## TIED 4.0.0 dogfood

Subject client bootstrapped at **TIED 4.0.0** (`ef203aa`). Documents **Cursor-harness** four-phase agentstream on a **traceability_structure** prompt with **WF trial implementation stack** + **orchestrator process logging**; **not** an effectiveness claim for TIED 4.0.0 or Composer 2.5.

---

## Facilitator follow-ups

- Align **`requirements/REQ-FIXTURE_REQ_MARKER_AUDIT.yaml`** detail **status** with index **Implemented** if sponsor wants zero index/detail drift.
- Rebuild **`mcp-server/packages/agentstream`** before expecting **`tied_adherence_reconcile_run`** on trial clients.
- Optional: second commit at close-out (`6467e04`) — prefer single traceable commit replay in future runs.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [WF-03 Cursor peer (harness)](trial-readout-PROMPT-WF-03-composer25-1793820250-wf-agentstream-wf-03-cursor-composer25.md)
- [Facilitator evidence folder](../../tied-project/working/FACILITATOR-WF-04-1793851888-wf-agentstream-wf-04-cursor-composer25/PLAN.md)
