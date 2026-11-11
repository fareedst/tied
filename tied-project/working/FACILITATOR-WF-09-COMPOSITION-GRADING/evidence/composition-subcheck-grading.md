# WF-09 Claude batch — Composition evidence sub-check

**Recorded:** 2026-11-11  
**Scope:** Six disposable clients (`1794350349` … `1794353174`) · **PROMPT-WF-09** · goal-first paste · **TIED 4.2.1**  
**Normative rubric:** [catalog-traditional-workflow-trial-prompts.md § Composition evidence](../../../docs/demos/catalog-traditional-workflow-trial-prompts.md#test-strategy-sub-check--composition-evidence-wf-0912) and [Composition contract](../../../docs/demos/catalog-traditional-workflow-trial-prompts.md#composition-contract-normative-for-prompts-09-12)

**Fail signal (verbatim):** Only unit tests on isolated modules; no automated test exercising module binding/wiring named in PLAN or test files.

**Per-client readouts:** `@record-wf-trial` published under `docs/demos/trial-readout-PROMPT-WF-09-*.md`.

---

## Inspection method (not `comp` column alone)

1. List non-test `src/**/*.ts` implementation files (exclude `.gitkeep`).
2. Read `tied-project/working/*/PLAN.md` module layout section.
3. List `src/**/*.test.ts` imports — flag **binding** only when tests wire **two or more implementation modules** (not a lone `index.ts` re-export).
4. Cross-check [project-size receipts](../../non-tied-plans/project-size-batch-discover-compare/evidence/receipts/) (`composition_tests` facet; path heuristic in `mcp-server/src/project-size/snapshot-builder.ts`).

---

## Sub-check results

| Client ID | Effort | Impl modules (excl. `index.ts`) | Test entrypoint | Binding test? | Receipt `comp` | **Sub-check** |
| --- | --- | --- | --- | --- | --- | --- |
| 1794350349 | haiku medium | 1 (`ordered-map.ts`) | imports core directly | no | 0 | **Fail** |
| 1794350685 | haiku high | 1 (`ordered-map.ts`) | imports core directly | no | 0 | **Fail** |
| 1794351557 | haiku low | 1 (`map-ordered.ts`) | imports core directly | no | 0 | **Fail** |
| 1794352390 | sonnet low | 1 (`mapConcurrent.ts`) | imports `./index.js` (re-export only) | no | 0 | **Fail** |
| 1794352615 | sonnet medium | 1 (`ordered-map.ts`) | imports `./index.js` (re-export only) | no | 0 | **Fail** |
| 1794353174 | sonnet high | 1 (`ordered-concurrent-map.ts`) | imports core directly; PLAN states deliberate monolith | no | 0 | **Fail** |

**Cohort:** **6 / 6 Fail** on Composition evidence. Behavior proofs (completion order ≠ input order, peak in-flight) live in **unit** files only.

---

## Architecture note (why Fail is not a classifier bug)

Sonnet high PLAN explicitly rejects a worker/ordering split: one implementation module ~100 lines; splitting would add import ceremony without a testable boundary. That is **consistent with TIED composition-test rules when no bindings exist**, but **does not satisfy** the WF-09…12 **facilitator contract**, which expects at least one binding/wiring test when grading the composition cohort (and treats god-module unit-only as insufficient).

---

## Alignment with published Test strategy bands

| Client | Readout Test strategy | Consistent with sub-check Fail? |
| --- | --- | --- |
| 1794350349 | **B** | yes — strong unit coverage, composition gap |
| 1794350685 | **B** | yes |
| 1794351557 | **B−** | yes |
| 1794352390 | **C+** | yes — thin TIED stack + composition gap |
| 1794352615 | **B** | yes |
| 1794353174 | **B** | yes |

---

## Proof boundary

This artifact grades **Composition evidence** only. It does not change orchestrator `exit_code`, size receipt totals, or other dimension bands unless a sponsor requests a LEAP/readout revision.

**Primary grading lens:** **WF-09…12 facilitator contract** (`wf-cohort`) — see [sponsor-lens-decision.md](./sponsor-lens-decision.md).
