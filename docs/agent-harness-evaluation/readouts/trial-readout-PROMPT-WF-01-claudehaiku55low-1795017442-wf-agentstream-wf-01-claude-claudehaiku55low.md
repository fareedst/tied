# Trial readout: PROMPT-WF-01 → Claude Haiku 5.5 (low effort) → `1795017442-wf-agentstream-wf-01-claude-claudehaiku55low`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-18 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-01`** (`HARNESS=claude`; **interleaved** four-phase batch) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-01](../catalogs/catalog-traditional-workflow-trial-prompts.md#prompt-wf-01) |
| **Model config** | `claude-haiku-5-5` (`low` effort) |
| **Model slug** | `claude-haiku-5-5` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1795017442-wf-agentstream-wf-01-claude-claudehaiku55low` |
| **Factory tag** | `1795017442-wf-agentstream-wf-01-claude-claudehaiku55low` |
| **Product REQ** | `REQ-SEMVER_COMPARATOR` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-SEMVER_COMPARATOR/evidence/tied-methodology-version.session.v1.json` |
| **SC-DCR-06 readout label** | **`machine_complete` (Full)** — verification and close_out receipts **`allowed: true`** |
| **Cohort comparison** | Post–[CGH](../../tied-project/working/REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION/PLAN.md) + progression waiver replay class; successor to [Haiku low @ 1794981051](trial-readout-PROMPT-WF-01-claudehaiku55low-1794981051-wf-agentstream-wf-01-claude-claudehaiku55low.md) (**fail** verification). |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a small TypeScript library with one exported function that checks whether a semantic version string satisfies a simple comparator (e.g. ">=1.2.0"). Include a single script or documented command that runs all tests. No CLI required beyond test runner.
```

---

## RESOLVE (subject)

| Term | Resolution |
| --- | --- |
| Export | `satisfies(version, comparator)` in `src/semver-satisfies.ts` |
| Stack | `wf-trial-ts-node-test-v1` (locked refine) |
| Depth | CITDP `profile_depth: minimal`, `gate_policy: advisory` |

---

## What was built

- **Product:** `src/semver-satisfies.ts`, `src/semver-satisfies.test.ts`; facilitator **22/22** pass.
- **TIED:** PLAN + phase handoffs 1–4; product CITDP persisted; slim checklist tracker; verification and close_out gate receipts on disk.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **~293s** (~4.9 min).
- **Git:** bootstrap **`ba45364`** + product **`6cd7598`**.
- **Harness store wave:** Store MCP at `repo_root` **stdd** (post–CGH commit **`375131bf`**); minimal progression waiver + disposable closeout checks consumed in-session.

---

## Outcome record

**Implementation outcome:** **Pass (local)** — semver `satisfies` green at facilitator replay.

**Workflow outcome:** **Complete (machine)** — orchestrator **`exit_code: 0`**; verification and close_out **`allowed: true`**; product commit present.

**Grading outcome:** **Grade mean (registry compact):** 3.86 · A/A/A-/A/B+/A/A.

**SC-DCR-06 three-way stress (store REQ):**

| Grade row | This cell |
| --- | --- |
| **Full** | **Yes** — verification and close_out receipts **`allowed: true`**; orchestrator exit **0** without machine-closeout **ERROR** |
| **Partial (`partial_tier_b`)** | **N/A** — not used when Full criteria met |
| **Fail (`fail`)** | **Not this cell** |

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | `verification-*.json` + `close_out-*.json` both **`allowed: true`** |
| **Process contract** | **partial** | Handoffs 1–4; RED/GREEN archived; no `verification-evidence-manifest.v1.json`; dual-write present per close-out handoff |
| **Adherence ledger** | **partial** | `tied_adherence_reconcile_run` band **B**; `evidence_stale` / hash mismatch noted in phase-4 handoff (not waived) |
| **Orchestrator** | **pass** | **`exit_code: 0`**; no `wf_trial_machine_closeout_reason` / no **ERROR** in stderr log |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| PLAN | `tied-project/working/REQ-SEMVER_COMPARATOR/PLAN.md` |
| **Interaction inventory** | `tied-project/working/REQ-SEMVER_COMPARATOR/evidence/trial-workflow-interaction-inventory.v1.json` |
| **Proof manifest** | `tied-project/working/proof-facet-manifest/evidence/proof-facet-manifest.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../../tied-project/working/FACILITATOR-WF-01-1795017442-wf-agentstream-wf-01-claude-claudehaiku55low/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ + PLAN + slim tracker; session methodology **4.2.2** captured |
| 2 | `refine-plan` | Stack locked; scope table |
| 3 | `build-plan` | **22/22** GREEN; verification receipt **`allowed: true`** |
| 4 | `close-out` | Envelope blocking gaps 0; close_out receipt **`allowed: true`**; traceable-commit evidence prepared |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | wall **293s** (`15:57:23` → `16:02:16` UTC) |

**Friction excerpts (stderr):**

- `DIAGNOSTIC: WF trial interleaved phase 1/4` … `4/4`
- `DIAGNOSTIC: WF trial slim tracker reconcile: valid slim shape (no replace)`
- `DIAGNOSTIC: WF trial machine closeout exit check: default on`
- **No** `invalid_slug` on disposable checklist slugs
- **No** `wf_trial_machine_closeout_reason=*` and **no** `ERROR: WF trial machine closeout exit`

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Commits | **Bootstrap then product** — `ba45364` → `6cd7598` after build-plan work |
| Turn order | Interleaved driver completed all four skills |
| vs 1794981051 | Same prompt/stack/effort; **verification and close_out gates green** (prior cell **fail**) |
| Residual | Adherence hash staleness between gate receipt and final tracker/CITDP edits |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **22/22** |
| Product under `src/` | **Present** |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Comparator operators and malformed-input rules locked in PLAN before RED. |
| Traceability closure | **A** | Facilitator **22/22** green and product commit **`6cd7598`** after close-out path. |
| Test strategy | **A−** | Twenty-two colocated cases archived; fewer edge breadth than some Sonnet-high WF-01 peers. |
| Algorithm / implementation | **A** | `satisfies` behavior matches PLAN at facilitator replay. |
| Process adherence | **B+** | Both gate receipts **`allowed: true`** but adherence reconcile reported hash drift (not waived). |
| Workflow choreography | **A** | Interleaved **4/4** in under five minutes with machine close-out pass (no orchestrator ERROR). |
| Methodology learning readout | **A** | Documents **Full** SC-DCR-06 after disposable gate hydration wave vs prior **fail** cohort. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness; this cell is **one** post-wave datapoint — repeat before claiming sustained WF-01 Haiku-low machine completeness.

---

## Cross-model notes (PROMPT-WF-01)

Compare [1794981051](trial-readout-PROMPT-WF-01-claudehaiku55low-1794981051-wf-agentstream-wf-01-claude-claudehaiku55low.md) (verification **fail**, bootstrap-only git) and [1794975372](trial-readout-PROMPT-WF-01-claudehaiku55low-1794975372-wf-agentstream-wf-01-claude-claudehaiku55low.md) (slug registry era). **No ranking.**

---

## Cohort comparisons

Authoritative **Haiku 5.5 low** post-fix row for SC-DCR-06 **Full** alongside disposable closeout / product CITDP hydration store REQs. Supersedes **latest** flag for `(WF-01, claude, claude-haiku-5-5 low)` until a higher `client_id` is recorded.

---

## TIED version / dogfood

Session **4.2.2** captured at turn 1 (`install_json`). Store orchestrator `repo_root` pinned **stdd** during run — documents consumption of hydration/MCP fixes; not an effectiveness claim for the product REQ.

---

## Facilitator follow-ups

- Run **`@publish-wf-trial-summaries`** to refresh [runs registry](../registries/traditional-workflow-trial-runs-registry.md) (`Latest` / grades row).
- Optional: re-run adherence reconcile on client after any follow-on commits to clear `evidence_stale`.

---

## Related links

- [Facilitator evidence](../../../tied-project/working/FACILITATOR-WF-01-1795017442-wf-agentstream-wf-01-claude-claudehaiku55low/evidence/)
- [CGH PLAN](../../tied-project/working/REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION/PLAN.md)