# Trial readout: PROMPT-WF-02 → GPT-5.6 Luna low (Cursor agentstream) → `1794095569-wf-agentstream-wf-02-cursor-lunalow`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-07 |
| **Touchpoint** | Four-phase agentstream **`wf-02`** + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-02](catalog-traditional-workflow-trial-prompts.md#prompt-wf-02) |
| **Model config** | `luna-low` |
| **Model slug** | `gpt-5.6-luna-low-fast` |
| **Harness** | `cursor-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794095569-wf-agentstream-wf-02-cursor-lunalow` |
| **Factory tag** | `wf-agentstream-wf-02-cursor-lunalow` |
| **Product REQ** | `REQ-WF_TRIAL_DEDUP_STREAM` |
| **TIED methodology version (session)** | **4.2.1** — **`install_json`** on inventory |
| **Cohort comparison** | First **luna-low** WF-02 @ **4.2.1**; pairs [luna-high @ 1794075940](trial-readout-PROMPT-WF-02-luna-high-1794075940-wf-agentstream-wf-02-cursor-lunahigh.md) (**8** tests uncommitted). |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a CLI that reads lines from stdin and prints a deduplicated stream to stdout. The requirement is intentionally vague about whether duplicate lines should keep first or last occurrence. Document your chosen policy and what you do not guarantee before shipping. Include tests for at least two input orderings.
```

**Catalog stress:** ambiguity deferral — policy before implementation. **Proof boundary:** **first-occurrence** policy locked; **no** CLI or tests.

---

## Agent processing difficulties (per turn)

| Turn | Skill | Difficulties / friction |
| --- | --- | --- |
| **1** | `add-feature` | Session `e158c81f-…`. REQ + PLAN scaffold. |
| **2** | `refine-plan` | Session `0df3a825-…`. **First-occurrence** policy + non-guarantees in PLAN. |
| **3** | `build-plan` | Session `bf59e057-…`. **not_run** — no `src` beyond `.gitkeep`. |
| **4** | `close-out` | Session `7d92556f-…`. Blocked — no CITDP path for gates. |

Wall ~5.1 min; orchestrator **`exit_code: 0`**.

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| duplicate policy | **First occurrence** kept | `PLAN.md` |
| not guaranteed | No last-occurrence, sort, or non-text distinctions | PLAN |
| stdin CLI | TypeScript ESM under `src/` | PLAN scope |
| two orderings | **Planned** — not implemented | refine/build deferred |

---

## What was built

- **Product:** **None** — `npm test` **0/0**.
- **TIED:** `REQ-WF_TRIAL_DEDUP_STREAM` + PLAN with resolved ambiguity.
- **Git:** **`c1de4a1`** only.

---

## Outcome record

**Implementation outcome:** **Not started**.

**Workflow outcome:** **Incomplete** — refine complete; build/close-out blocked.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **not_run** | Inventory `close_out_gate_receipt: null` |
| **Process contract** | **partial** | Turns 1–2 complete |
| **Adherence ledger** | **not_run** | |
| **Close-out honesty** | **pass** | Handoff names `@build-plan` next |

---

## TIED db capture + workflow inventory

**Facilitator verification:** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-02-1794095569-wf-agentstream-wf-02-cursor-lunalow/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome |
| --- | --- | --- |
| 1 | `add-feature` | completed |
| 2 | `refine-plan` | completed — policy locked |
| 3 | `build-plan` | **not_run** |
| 4 | `close-out` | **blocked** |

---

## Orchestrator process log

**Exit code:** **`0`** (~5.1 min). Stderr: stack seed DIAGNOSTICs; four session ids (`e158c81f-…` through `7d92556f-…`).

---

## Phase boundary audit

No product commits; refine artifacts precede absent implementation — **pass** ordering heuristic.

---

## Stack compliance

`wf-trial-ts-node-test-v1`; **0** facilitator tests.

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A−** | Vague dedup resolved to first-occurrence |
| Traceability closure | **C+** | Decision records and code mostly align; traceability gaps remain vs full stack promotion. |
| Test strategy | **F** | No orderings tested |
| Algorithm / implementation | **N/A** | Shipped behavior matches PROMPT shape; gaps leave some fault paths lightly exercised. |
| Process adherence | **C+** | Correct refine; build omitted |
| Workflow choreography | **C** | Four turns ran with orchestrator exit ?; harness ok while facilitator work incomplete. |
| Methodology learning readout | **B** | WF-02 ambiguity stress partially satisfied |

**Feedback ingest:** N/A.

**Future-test rule:** Policy documentation without tests does not prove dedup correctness.

---

## Cross-model notes (PROMPT-WF-02)

[luna-high @ 1794075940](trial-readout-PROMPT-WF-02-luna-high-1794075940-wf-agentstream-wf-02-cursor-lunahigh.md): implemented **8** tests without close-out vs luna-low policy-only.

---

## Cohort comparisons vs peer WF readouts

Adds **luna-low** WF-02 **ambiguity-resolved / build-absent** row.

---

## TIED version / dogfood

**4.2.1** bootstrap — not effectiveness claim.

---

## Facilitator follow-ups

- build-plan retry on fresh client with same locked policy.

---

## Related links

- [Facilitator PLAN](../../tied-project/working/FACILITATOR-WF-02-1794095569-wf-agentstream-wf-02-cursor-lunalow/PLAN.md)
