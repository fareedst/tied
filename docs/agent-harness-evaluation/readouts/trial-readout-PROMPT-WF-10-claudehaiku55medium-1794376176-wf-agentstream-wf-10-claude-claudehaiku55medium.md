# Trial readout: PROMPT-WF-10 → Claude Haiku 5.5 (medium effort) → `1794376176-wf-agentstream-wf-10-claude-claudehaiku55medium`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-11 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-10`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-10](catalog-traditional-workflow-trial-prompts.md#prompt-wf-10) (`goal-first-soc`) |
| **Model config** | `claude-haiku-5-5` (`medium` effort) |
| **Model slug** | `claude-haiku-5-5` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794376176-wf-agentstream-wf-10-claude-claudehaiku55medium` |
| **Factory tag** | `1794376176-wf-agentstream-wf-10-claude-claudehaiku55medium` |
| **Product REQ** | `REQ-CSV_SUMMARY_CLI` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — evidence `tied-project/working/REQ-CSV_SUMMARY_CLI/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | WF-10 Haiku **medium** vs [Haiku low @ 1794371036](trial-readout-PROMPT-WF-10-claudehaiku55low-1794371036-wf-agentstream-wf-10-claude-claudehaiku55low.md) on same paste — **no implementation** despite orchestrator **`exit_code: 0`**. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a TypeScript CLI that summarizes CSV text with row count and column count. The user must choose exactly one input: a --file <path> option or an explicit stdin mode (document the flag or convention you use). Using both or neither is an error with a documented message. File mode must read via the filesystem; stdin mode must read until EOF without a path. Include automated tests. No graphical UI.
```

**Catalog stress:** thin CLI argv wiring (**TIED-DEMO-13**) — goal-first-soc paste.

---

## What was built

- **Product:** **None** — `src/` contains only `.gitkeep`; facilitator **`npm test` 0** tests.
- **TIED:** REQ scaffold + PLAN/refine handoffs; **no** ARCH/IMPL product records; CITDP draft only.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator manifest reports **`exit_code: 0`**; wall **~259s** (4.3 min).
- **Git:** bootstrap pin **`9489364`**.
- **Project size layers:** unit tests **0**; `operational_intent_hash` empty ([facilitator snapshot](../../tied-project/working/FACILITATOR-WF-10-1794376176-wf-agentstream-wf-10-claude-claudehaiku55medium/evidence/project-size-snapshot.v1.json)).
- **Proof manifest:** Scaffold-only JSON — one `files[]` row for **nonexistent** `src/cli.binding.test.ts`; binding still references template `runPipeline`.

---

## Outcome record

**Implementation outcome:** **Fail** — sponsor contract not implemented; zero executable tests.

**Workflow outcome:** **Fail** — inventory marks turn 3 **`not_run`**; close-out **`completed_blocked`** (CITDP misconfig).

**Grading outcome:** Session bands describe this cell only. **Grade mean (registry):** 1.21 · B−/F/F/F/D/C/D.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **fail** | `tied_gate_check` misconfig (`citdp-draft.md` not persisted YAML) |
| **Process contract** | **fail** | No build-plan handoff; manifest not agent-completed |
| **Orchestrator** | **split signal** | Manifest **`exit_code: 0`** while product and tests absent — min-shape gate accepts scaffold `files[]` |
| **Proof manifest** | **false pass** | Row points at missing test file; gate does not require on-disk test files |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| PLAN | `tied-project/working/REQ-CSV_SUMMARY_CLI/PLAN.md` |
| **Interaction inventory** | `tied-project/working/REQ-CSV_SUMMARY_CLI/evidence/trial-workflow-interaction-inventory.v1.json` |
| **Proof manifest (scaffold)** | `tied-project/working/proof-facet-manifest/evidence/proof-facet-manifest.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-10-1794376176-wf-agentstream-wf-10-claude-claudehaiku55medium/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ + PLAN scaffold |
| 2 | `refine-plan` | Locked stack + R1–R9 defaults in PLAN |
| 3 | `build-plan` | **`not_run`** — no tests, no `src/` modules |
| 4 | `close-out` | **Blocked** — close-out against unimplemented REQ |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `…/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** (reported) |
| **Wall time** | **259s** (~4.3 min) |

**Friction excerpts (stderr):** default-on proof manifest gate DIAGNOSTIC; scaffold seeded; four turn boundaries; **`MODEL_EFFORT=medium`**.

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Build-plan skip | Turn 3 never produced code — close-out ran on planning-only tree |
| Manifest integrity | JSON satisfies min-shape; **referenced test path missing on disk** |
| vs Haiku low @ 1794371036 | Peer cell on same prompt delivered **16** tests + filled manifest |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` (seeded `package.json`) |
| Facilitator `npm test` | **0** tests |
| Product under `src/` | **Absent** |

---

## Proof labels (manifest vs path)

| Claimed path | On disk | Manifest subtype |
| --- | --- | --- |
| `src/cli.binding.test.ts` | **missing** | `composition.wiring` |

Path receipt: **0** test files. Manifest is orchestrator template residue, not agent classification.

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **B−** | Refine locked argv and counting defaults in PLAN without sponsor redirect. |
| Traceability closure | **F** | No implementation, ARCH/IMPL, or commit. |
| Test strategy | **F** | No RED/GREEN; sponsor required automated tests. |
| Algorithm / implementation | **F** | No CSV or CLI code shipped. |
| Process adherence | **D** | Close-out attempted after skipping build-plan; CITDP still draft. |
| Workflow choreography | **C** | Four sessions ran in under five minutes but build turn empty. |
| Methodology learning readout | **D** | Orchestrator exit 0 with scaffold-only manifest exposes min-shape gate gap. |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; this cell is evidence for tightening manifest validation (existence of `files[].path`).

---

## Cross-model notes (PROMPT-WF-10)

Contrast [Claude Haiku low @ 1794371036](trial-readout-PROMPT-WF-10-claudehaiku55low-1794371036-wf-agentstream-wf-10-claude-claudehaiku55low.md) — same harness and default-on gate, **medium effort did not produce build-plan**. No ranking.

---

## Cohort comparisons vs peer WF readouts

Documents a **negative control** for post–wave-2 manifest policy: shape-valid scaffold can yield orchestrator **0** without product work.

---

## TIED version / dogfood

Session **4.2.2** on disposable bootstrap — not an effectiveness claim for medium effort.

---

## Facilitator follow-ups

- Gate enhancement: fail when `files[].path` does not resolve under `repo_root`.
- Investigate why build-plan turn produced no handoff while four-phase batch continued.
- Optional: re-run with `WF_TRIAL_STRICT_*` preflight if sponsor wants fail-closed earlier.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-10-1794376176-wf-agentstream-wf-10-claude-claudehaiku55medium/PLAN.md)
- [Haiku low readout (peer)](trial-readout-PROMPT-WF-10-claudehaiku55low-1794371036-wf-agentstream-wf-10-claude-claudehaiku55low.md)
