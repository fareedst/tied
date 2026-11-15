# Trial readout: PROMPT-WF-06 → Claude Sonnet 5.5 (high effort) → `1794757449-wf-agentstream-wf-06-claude-claudesonnet55high`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-15 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-06`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-06](catalog-traditional-workflow-trial-prompts.md#prompt-wf-06) |
| **Model config** | `claude-sonnet-5-5 (high effort)` |
| **Model slug** | `claude-sonnet-5-5` |
| **Model effort** | `high` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794757449-wf-agentstream-wf-06-claude-claudesonnet55high` |
| **Factory tag** | `1794757449-wf-agentstream-wf-06-claude-claudesonnet55high` |
| **Product REQ** | `REQ-TOKEN_BUCKET_RATE_LIMITER` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-TOKEN_BUCKET_RATE_LIMITER/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | First Sonnet **`@high`** WF-06 on session **4.2.2**; fills empty matrix column. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build an in-memory token-bucket rate limiter library with configurable rate and burst. Keep scope minimal. Document what happens when limits are exceeded. Include unit tests; no network I/O.
```

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| **limit exceeded** | `tryConsume` deny + `retryAfterMs`, no throw | PLAN § Refine decisions 1–4 |
| **rate / burst** | `ratePerSecond`, capacity `burst`, bucket starts full | PLAN + `TokenBucket` |
| Product scope | `REQ-TOKEN_BUCKET_RATE_LIMITER` | PLAN under `tied-project/working/REQ-TOKEN_BUCKET_RATE_LIMITER/` |

---

## What was built

- **Product:** `src/token-bucket.ts` in-memory limiter with injectable clock; facilitator **31/31** green tests.
- **TIED:** REQ/ARCH/IMPL stack, CITDP at close-out, proof facet manifest validated.
- **Git:** **`fe80244`** product commit after TIED scaffold **`33ab882`**.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator wall **728s** (~12 min).

---

## Outcome record

**Implementation outcome:** **Complete** — facilitator replay **31/31**; `tied_validate_consistency` **`ok: true`**.

**Workflow outcome:** **Complete (machine)** — close_out **allowed**; orchestrator **`exit_code: 0`**.

**Grading outcome:** **Grade mean (registry compact):** 3.96 · A/A/A/A/A/A-/A.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | `close_out-2026-11-15T15-54-58-654Z.json` **allowed: true** |
| **Process contract** | **pass** | Four-turn inventory + phase handoffs |
| **Adherence ledger** | **partial** | Minimal depth |
| **Close-out honesty** | **pass** | HEAD matches facilitator replay |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| **Interaction inventory** | `tied-project/working/REQ-TOKEN_BUCKET_RATE_LIMITER/evidence/trial-workflow-interaction-inventory.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-06-1794757449-wf-agentstream-wf-06-claude-claudesonnet55high/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | completed — REQ + PLAN with exceed-limit decisions |
| 2 | `refine-plan` | completed — locked stack; tracker slugs fixed |
| 3 | `build-plan` | completed — RED then GREEN **31/31**; verification **allowed** |
| 4 | `close-out` | completed — close_out **allowed**; traceable commit **`fe80244`** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Exit code** | **`0`** |
| **Wall** | **728s** |
| **Sessions** | `91962048…`, `0335e35a…`, `516c11d1…`, `d848f2f6…` |

**Friction:** stderr shows standard WF stack seed, proof manifest gate, `model_effort=high`, slim checklist path present.

---

## Phase boundary audit

Product commit **`fe80244`** follows TIED scaffold **`33ab882`**. Inventory turn order matches git history.

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **31** pass |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Eight exceed-limit decisions locked in PLAN before RED tests. |
| Traceability closure | **A** | close_out allowed with traceable product commit `fe80244`. |
| Test strategy | **A** | Thirty-one cases cover refill, deny, and invalid-input paths. |
| Algorithm / implementation | **A** | Injectable clock limiter matches documented deny semantics. |
| Process adherence | **A** | Verification and close_out gates allowed with envelope clear. |
| Workflow choreography | **A−** | Four turns green; twelve-minute wall longer than medium batch peers. |
| Methodology learning readout | **A** | Contrasts Sonnet medium split where close_out was not_run. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-06)

Compare [Sonnet medium split @ 1794618721](trial-readout-PROMPT-WF-06-claudesonnet55medium-1794618721-wf-agentstream-wf-06-claude-claudesonnet55medium.md) (**7/7**, close_out **not_run**) and [Haiku medium complete @ 1794603724](trial-readout-PROMPT-WF-06-claudehaiku55medium-1794603724-wf-agentstream-wf-06-claude-claudehaiku55medium.md). **No ranking.**

---

## TIED version / dogfood

Session **4.2.2** captured at turn 1 — not an effectiveness claim.

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-06-1794757449-wf-agentstream-wf-06-claude-claudesonnet55high/evidence/)