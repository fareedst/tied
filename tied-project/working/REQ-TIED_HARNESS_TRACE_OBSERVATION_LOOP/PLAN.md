# Implementation plan — Harness trace observation loop (LangChain comparison Phase 1)

| Field | Value |
| --- | --- |
| **request_token** | `REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP` |
| **working_slug** | `REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP` |
| **Primary source** | [langchain-harness-engineering-vs-tied-agent-management.md](../../../docs/comparisons/langchain-harness-engineering-vs-tied-agent-management.md) (Phase 1 + bounded recommendations #2–3) |
| **Linked Cursor plan** | `/Users/fareed/.cursor/plans/harness_trace_observation_810f5fe6.plan.md` |
| **CITDP** | [CITDP-REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP.yaml](../../citdp/CITDP-REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP.yaml) |
| **Tracker** | [checklist-tracker.yaml](checklist-tracker.yaml) |
| **Test strategy** | [test-strategy.md](test-strategy.md) |
| **depth_tier** | `minimal` |
| **gate_policy** | `advisory` |
| **methodology_surface_change_class** | `prompt_type_workflow` (new explicit-only leaf skill + methodology doc) |
| **Operator interruption budget** | No new MCP gate tools; no default behavior flips; skill is explicit-invocation only |

---

## 1. Refine (Touchpoint 1 — RESOLVE)

### Intent authority

- **Sponsor intent:** Operationalize LangChain-style **trace-driven harness review** as TIED **Loop 2 Kaizen** compose: session/transcript/adherence inputs → structured review → **`tied_feedback_capture_observation`**; plus **test-strategy executable matrix** so build–verify evidence names RED/verify commands (not model self-check prose).
- **RESOLVE charter:** Deliverable filenames and slice order may change; intent authority stays with trace→observation-not-gate and harness/platform seam discipline.

### RESOLVE table

| External / informal | TIED preferred term / surface | Notes |
| --- | --- | --- |
| LangChain **Trace Analyzer Skill** | **Harness trace observation loop** | Recipe; not a shipped product class |
| LangSmith traces | **Session / transcript / adherence inputs** | No LangSmith dependency |
| Harness failure modes | **Operational observation** + optional **Task** fan-out | Existing Kaizen MCP |
| Self-verify without tests | **test-strategy executable matrix** | Compose [pre-handoff-verification-charter.md](../../../tied-bundle/docs/pre-handoff-verification-charter.md) |

**PRELOAD:** [feedback-to-tied.md](../../vocab/feedback-to-tied.md), [agentstream.md](../../vocab/agentstream.md), [sponsor-agent-relationship.md](../../vocab/sponsor-agent-relationship.md), [authority-boundary-operator-checklist.md](../REQ-TIED_HARNESS_PLATFORM_SEAM/authority-boundary-operator-checklist.md).

### Adversarial depth and gate policy

| Field | Value | Rationale |
| --- | --- | --- |
| `depth_tier` | **minimal** | Doc + skill prose + bootstrap contract test |
| `gate_policy` | **advisory** | No checklist authority change |
| `research_profile` | **read-only** | Local comparison + operator recipes |
| `integrated_waiver` | **n/a** | No integrated inquiry at minimal depth |

### Consequence ladder

| Decision | Ladder | Default |
| --- | --- | --- |
| New bundled leaf skill `harness-trace-review` | **Reversible** | **Do** (14th leaf; update prompt-type inventory) |
| LangChain matrix §2 row | **Costly** | **Defer** |
| Phase 2 methodology learning experiment | **Costly** | **Defer** |
| LangSmith / trace store integration | **Costly** | **Defer** |

---

## 2. CITDP

**Record:** [CITDP-REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP.yaml](../../citdp/CITDP-REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP.yaml)

---

## 3. Compose-don't-replace contract

| Harness (tune here) | Platform-adjacent authority (do not replace) |
| --- | --- |
| Trace review skill and methodology guide | **`tied_checklist_gate_validate`** outcomes |
| Kaizen **`tied_feedback_capture_observation`** | Project REQ/ARCH/IMPL via **TIED MCP** |
| test-strategy executable matrix wording | **`tied_verify`**, **`pseudocode_validate`**, sponsor ladder |
| Optional Task fan-out for failure analysis | Gate receipts and Tracker dispositions |

---

## 4. Phased slices (add-feature / build-plan executes)

| Order | Slice | Primary deliverable |
| ---: | --- | --- |
| 1 | **A** | [harness-trace-observation-loop.md](../../../tied-bundle/docs/harness-trace-observation-loop.md) — proof boundary, procedure, failure-mode taxonomy, promotion path, **test-strategy executable matrix** |
| 2 | **B** | [tools/bundled-prompt-type-skills/harness-trace-review/SKILL.md](../../../tools/bundled-prompt-type-skills/harness-trace-review/SKILL.md); update [bundled README](../../../tools/bundled-prompt-type-skills/README.md) inventory (14 leaf skills); [prompt-type-skills.md](../../../tied-bundle/docs/prompt-type-skills.md) + [prompt-composer.md](../../vocab/prompt-composer.md) if required by [REQ-PROMPT_TYPE_GLOBAL_SKILLS](../../requirements/REQ-PROMPT_TYPE_GLOBAL_SKILLS.yaml) |
| 3 | **C** | Cross-links: authority checklist, LangChain comparison Phase 1 compose row, pre-handoff charter, [client-development-index.md](../../../tied-bundle/docs/client-development-index.md), [feedback-to-tied.md](../../vocab/feedback-to-tied.md) |
| 4 | **D** | RED → GREEN: [harness-trace-observation-loop-doc.test.mjs](../../../tools/bootstrap/lib/harness-trace-observation-loop-doc.test.mjs); optional skill contract test |

**Forbidden:** LangSmith adapters; new MCP gate tools; auto YAML/LEAP from trace review; Terminal Bench scores as TIED effectiveness; substituting integrated adversarial inquiry.

---

## 5. Test strategy

See [test-strategy.md](test-strategy.md). **RED first:** failing doc contract test before Slice A final text.

---

## 6. Implement handoff

Run **`/add-feature`** implement or **`/build-plan`** on this PLAN after **`pre_implementation` gate allowed**.

**Refine-plan (2026-10-21):** PLAN + CITDP + Tracker + REQ/ARCH/IMPL stubs + IMPL pseudo-code gate → pre_implementation receipt under `gates/`. **No** guide/skill/test file edits in refine pass.

---

## 7. Gate status (refine-plan)

**`pre_implementation` gate (2026-10-21):** `tied_checklist_gate_validate` → **`allowed: true`**, `depth: minimal`, `gate_policy: advisory`. Receipt: [pre_implementation-2026-10-21T05-34-27-312Z.json](gates/pre_implementation-2026-10-21T05-34-27-312Z.json).

**Implement (build-plan 2026-10-21):** Slices A–D delivered; bootstrap tests green; **`tied_validate_consistency`** ok. Verification gate receipt: [verification-2026-10-21T05-38-56-450Z.json](gates/verification-2026-10-21T05-38-56-450Z.json) (`allowed: true`). **Close-out (2026-10-21):** `run_id=htol-close-out-2026-10-21`, commit **`616b2bdd`**. Evidence: [plan-close-out-handoff.md](evidence/plan-close-out-handoff.md).
