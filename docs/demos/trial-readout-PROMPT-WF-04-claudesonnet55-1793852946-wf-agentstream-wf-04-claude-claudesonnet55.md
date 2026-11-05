# Trial readout: PROMPT-WF-04 → Claude Sonnet 5.5 (agentstream) → `1793852946-wf-agentstream-wf-04-claude-claudesonnet55`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-04 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow-trial-agentstream wf-04`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-04](catalog-traditional-workflow-trial-prompts.md#prompt-wf-04) |
| **Model config** | `claude-sonnet-5-5` |
| **Model slug** | `claude-sonnet-5-5` |
| **Harness** | `claude-agentstream-four-phase` ([run-traditional-four-phase-agentstream.sh](../../scripts/run-traditional-four-phase-agentstream.sh) via [workflow-trial-agentstream.sh](../../scripts/workflow-trial-agentstream.sh)) |
| **Client root** | `/Users/fareed/Documents/dev/test/1793852946-wf-agentstream-wf-04-claude-claudesonnet55` |
| **Factory tag** | `wf-agentstream-wf-04-claude-claudesonnet55` |
| **Product REQ** | `REQ-FIXTURE_REQ_ID_SCAN` |
| **Cohort comparison** | Second **PROMPT-WF-04** agentstream cell. Peer: [Composer 2.5 Cursor @ 1793851888](trial-readout-PROMPT-WF-04-composer25-1793851888-wf-agentstream-wf-04-cursor-composer25.md) (**complete** close-out). |

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
| **1** | `add-feature` | **Cold session** `0a2bfc28-…`. **Scope expansion:** agent added `--json`, unreferenced index ids, non-zero exit on orphans (“no pause for approval”). **CITDP as markdown** (`citdp-draft.md`) — no YAML CITDP path for later gates. **No validation** self-reported at end of turn (stdout). |
| **2** | `refine-plan` | **New session** `7dd7b3ce-…`. **`pre_implementation` blocked** — missing adversarial-inquiry artifacts; treated as advisory, **no receipt saved**. Still no RED/product commits. |
| **3** | `build-plan` | **New session** `def69ab9-…`. RED archived (`npm-test-red.*`); **14/14 GREEN**; modular layout (`scan`, `compare`, `report`, …). **Gates skipped:** no verification gate, no pre_implementation re-run before RED. **Tracker hand-edited** (plain slugs). Product remains **uncommitted**. |
| **4** | `close-out` | **New session** `535e625c-…`. Envelope backfill fixed N/A receipt → validate **0 blocking gaps**. **`tied_gate_check` close_out failed** — no `CITDP-*.yaml` (markdown draft misconfig). **No CHANGELOG, no commit** — honest **INCOMPLETE** handoff. |

**Cross-turn harness notes:** batch `/var/folders/.../traditional-four-phase-batch.jt1yB0Aywt.yaml`; orchestrator **`exit_code: 0`**, ~3.7 min wall (`2026-11-05T04:29:06Z` → `04:32:49Z`).

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| requirement identifier | **`REQ-[A-Z0-9_]+`** in line/block comments | PLAN; `src/scan.ts` |
| fixture directory | **`src/fixtures/tree/**`** + **`allowed-ids.txt`** | PLAN; fixtures |
| fixture index | Line-oriented allowed-id list (`#` comments ignored) | `src/index-file.ts` |
| matches / orphans | Found-in-comments vs allowed set | `src/compare.ts`, CLI report |
| unreferenced (extension) | Allowed ids never found — **not in sponsor verbatim** | PLAN “accepted extension” |
| hermetic tests | Tests only under `src/fixtures/` | test files; satisfaction in REQ detail |
| stack | **`wf-trial-ts-node-test-v1`** | inventory; `package.json` |

---

## What was built

- **Modules:** `src/index-file.ts`, `scan.ts`, `compare.ts`, `report.ts`, `cli.ts` with colocated `*.test.ts`.
- **CLI:** `<root> --index <file> [--json]`; exit 0 / 1 / 2 documented in PLAN.
- **Fixtures:** `src/fixtures/` tree for hermetic scenarios.
- **TIED stack:** REQ/ARCH/IMPL created via MCP on working tree; **no** persisted `tied-project/citdp/CITDP-*.yaml`.
- **Tests:** facilitator **`npm test`** → **14/14** pass; **`npm run typecheck`** pass.
- **Git:** only bootstrap **`ace07a4`** committed; all product + TIED YAML changes **untracked/modified** (not pushed).

---

## Outcome record

**Implementation outcome:** **Partial** — behavior and tests green on disk; **not** traceably committed.

**Workflow outcome:** **Incomplete at turn 4** — machine `close_out` **blocked** (missing CITDP YAML); envelope validate passed; agent documented failure honestly.

**Grading outcome:** Dimension bands describe this session only — not methodology effectiveness or a model leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **fail** | `tied_gate_check` → `allowed: false`; inventory `close_out_gate_receipt: null` |
| **Process contract** | **not_run** | No verification manifest; tracker dual-write/sync not performed |
| **Adherence ledger** | **not_run** | No gates dir / reconcile preflight |
| **Close-out honesty** | **pass** | Handoff explicitly **INCOMPLETE**; no false completion claims |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| REQ / ARCH / IMPL | On disk under `tied-project/` (**uncommitted**) |
| PLAN | `tied-project/working/REQ-FIXTURE_REQ_ID_SCAN/PLAN.md` |
| CITDP | **`citdp-draft.md` only** — gate blocker |
| Envelope | `.../evidence/request-evidence-envelope.v1.json` (validate OK) |
| Gates | **None** — no `gates/*.json` on client |
| **Interaction inventory** | `.../evidence/trial-workflow-interaction-inventory.v1.json` — turn 4 notes gate **blocked** |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-04-1793852946-wf-agentstream-wf-04-claude-claudesonnet55/evidence/build-plan-verification-evidence.md) — `tied_validate_consistency` **`ok: true`** on uncommitted tree; REQ index **In Progress**.

**Proof boundary:** `facilitator_session_reconstruction` — paths, SHAs, gate narrative, orchestrator log excerpts; not full chat transcripts.

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ + PLAN + markdown CITDP + inventory seed; scope extensions documented |
| 2 | `refine-plan` | Locked module design; **pre_implementation blocked** (advisory) |
| 3 | `build-plan` | RED/GREEN archived; 14 tests pass; **no** verification gate; uncommitted |
| 4 | `close-out` | Envelope OK; **close_out gate fail**; **no commit** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `/Users/fareed/Documents/dev/test/1793852946-wf-agentstream-wf-04-claude-claudesonnet55/tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | `0` (orchestrator finished all four turns) |
| **Stdout log** | `…/process.stdout.log` |
| **Stderr log** | `…/process.stderr.log` |

**Friction excerpts:**

- `DIAGNOSTIC: harness=claude model=claude-sonnet-5-5 workspace=…/1793852946-wf-agentstream-wf-04-claude-claudesonnet55`
- `DIAGNOSTIC: WF trial stack seeded` + preload contract materialized
- Four turn banners with distinct `session_id` values
- Stdout: refine **pre_implementation allowed: false**; close-out **CITDP YAML missing** narrative

**Cross-check:** Orchestrator exit 0 ≠ workflow complete — inventory correctly records close_out **blocked**.

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git history | Single commit **`ace07a4`** bootstrap — **no** product commit (**pass** for early-commit heuristic; **fail** for close-out commit expectation) |
| Working tree | Full `src/` present but **uncommitted** after turn 4 |
| RED evidence | **Present** — `quality-manifest/npm-test-red.*` |
| Uncertainty | Per-turn commit SHAs absent (none exist) |

---

## Stack compliance

| Check | Result |
| --- | --- |
| **`implementation_stack_id`** | **`wf-trial-ts-node-test-v1`** in inventory |
| Product language | TypeScript ESM under `src/` |
| Facilitator verify | **`npm test`** 14/14; **`npm run typecheck`** pass |
| Waivers | None on stack skip |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **B** | Core scan/orphan intent met; sponsor scope expanded (--json, unreferenced, exit codes) without refine gate clearance |
| Traceability closure | **C+** | R+A+I on disk but **no CITDP YAML**, no commit, REQ **In Progress** |
| Test strategy | **B+** | RED archived; 14 colocated tests; verification gate/manifest missing |
| Algorithm / implementation | **A−** | Richer modular scanner than minimal prompt; behavior green |
| Process adherence | **D+** | No gate receipts; pre_implementation blocked then bypassed for RED; close_out fail |
| Workflow choreography | **C** | Four turns executed; inventory honest about failure; **no** traceable commit or CHANGELOG |
| Methodology learning readout | **B** | Contrasts with complete [Composer WF-04 @ 1793851888](trial-readout-PROMPT-WF-04-composer25-1793851888-wf-agentstream-wf-04-cursor-composer25.md); CITDP-md anti-pattern visible in logs |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries. Orchestrator **exit_code 0** must not be read as close-out success when gate receipts contradict.

---

## Cross-model notes (PROMPT-WF-04)

Compared with [Composer 2.5 Cursor @ 1793851888](trial-readout-PROMPT-WF-04-composer25-1793851888-wf-agentstream-wf-04-cursor-composer25.md):

- **Close-out:** Composer cell **complete** (commits, CITDP YAML, close_out allowed); this cell **incomplete** (CITDP markdown only).
- **Tests:** Sonnet **14** cases vs Composer **8** — broader module split + extensions.
- **Gates:** Composer persisted pre_implementation + close_out JSON; Sonnet has **no** `gates/` directory.
- **REQ token naming:** `REQ-FIXTURE_REQ_ID_SCAN` vs `REQ-FIXTURE_REQ_MARKER_AUDIT` — same prompt, different agent-chosen tokens.
- **Wall time:** ~3.7 min vs ~11.5 min orchestrator window (not a quality ranking).

No ranking — prose cohort context only.

---

## Cohort comparisons vs peer WF readouts

Documents the **first incomplete PROMPT-WF-04 close-out** in the agentstream matrix — useful for **traceability_structure** stress when CITDP persist is skipped. Pairs with the complete Cursor cell for gate-discipline contrast.

---

## TIED 4.0.0 dogfood

Subject client bootstrapped at **TIED 4.0.0** (`ace07a4`). Shows **Claude-harness** four-phase run on **wf-trial-ts-node-test-v1** with process logging; highlights **markdown-only CITDP** as close-out blocker — **not** an effectiveness claim.

---

## Facilitator follow-ups

- Persist **`citdp_record_write`** YAML on subject client and rerun close_out if sponsor wants a **complete** WF-04 Claude cell.
- Compare **`citdp-draft.md` vs `CITDP-*.yaml`** expectations in WF trial playbooks for Claude harness.
- Optional: commit or discard uncommitted tree before next trial on same host.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [PROMPT-WF-04 Composer peer (complete)](trial-readout-PROMPT-WF-04-composer25-1793851888-wf-agentstream-wf-04-cursor-composer25.md)
- [Facilitator evidence folder](../../tied-project/working/FACILITATOR-WF-04-1793852946-wf-agentstream-wf-04-claude-claudesonnet55/PLAN.md)
