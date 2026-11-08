# Plan: Google EGM (Elephant–Goldfish) × TIED — agent management

**Slug:** `google-egm-elephant-goldfish-vs-tied`  
**Track:** `non-tied-plan` (implicit) → **`non-tied-refine`** (this revision) → `@non-tied-build` → optional `@non-tied-close`  
**Source:** [google/elephant-goldfish-model](https://github.com/google/elephant-goldfish-model); upstream [architecture.md](https://github.com/google/elephant-goldfish-model/blob/main/docs/designs/architecture.md)  
**Evaluation charter:** [`docs/tied-methodology-evaluation-framework.md`](../../../docs/tied-methodology-evaluation-framework.md) — Q1–Q6 **literacy** only until Phase 3 `comparable-arms.v1`  
**Template:** Harness × TIED sibling pattern ([`cursor-harness-engineering-vs-tied-agent-management.md`](../../../docs/comparisons/cursor-harness-engineering-vs-tied-agent-management.md), [`persante-sdd-skills-vs-tied-agent-management.md`](../../../docs/comparisons/persante-sdd-skills-vs-tied-agent-management.md)); **not** the 14-section external-service Wave-2 template (no Wave-1 capture slug).

---

## Scope

Doc-only comparison: map Google’s **Elephant–Goldfish Model (EGM)** OSS plugin (SDD skills, fresh Goldfish reviewers, living `docs/designs/`) to TIED **harness vs platform** surfaces in this repo—not shipping EGM as TIED core or claiming evaluation outcomes.

| Boundary | Choice |
| --- | --- |
| **Primary deliverable** | `docs/comparisons/google-egm-elephant-goldfish-vs-tied-agent-management.md` |
| **Publish** | Local under `docs/comparisons/*` (gitignored unless sponsor runs **publish-allowlist** in `@non-tied-close`) |
| **Committed cross-edits** | **Defer by default** — `methodology-composition-matrix.md` row 19 + `REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX` row-count amend; optional evaluation-framework narrative row (sponsor opt-in in build) |
| **Upstream read** | README + `docs/designs/architecture.md` on GitHub; no frozen capture sibling unless build finds drift risk |

---

## Refine outcomes (Touchpoint 1 — RESOLVE)

**PRELOAD (read-only):** client [`tied-project/vocab/routing.md`](../../vocab/routing.md) → [`tied-methodology.md`](../../vocab/tied-methodology.md), [`quality-assurance.md`](../../vocab/quality-assurance.md), [`sponsor-agent-relationship.md`](../../vocab/sponsor-agent-relationship.md). **No vocab RECORD** on non-tied refine track.

| Term | Resolved meaning |
| --- | --- |
| **EGM** | Google OSS **Spec-Driven Development** plugin: Elephant (deep context) explores/drafts; Goldfish (isolated subagents) review against `document_standards/` rubrics; artifacts in `concepts_brief.md`, `design_draft.md`, `docs/designs/*.md`, review reports |
| **Harness-adjacent SDD** | EGM skills install on the coding agent; compose with TIED like matrix §2 row **5** (Spec Kit) and row **13** (harness/platform seam)—skills do not replace REQ/ARCH/IMPL authority |
| **Compose-don’t-replace** | Document centers of gravity; **no** claim that Goldfish approval equals `tied_verify` or TIED cohort superiority |
| **Dual spec authority (Tension)** | EGM `docs/designs/FEATURE.md` vs TIED IMPL/YAML — sponsor **costly choice** on single SoT; default in TIED clients: **TIED stack authoritative**, EGM upstream for brainstorm/review only |
| **Evaluation literacy** | EGM multi-stage review pass ≠ Q1 confirmed-finding arm; ≠ historical defect proxy; future Phase 3 static tags (`methodology_family: sdd_egm`) are **not** implemented in this build |

**Gate:** Ambiguity cleared for slug, template, defer matrix REQ bump, and publish boundary.

---

## Center-of-gravity (compose-don’t-replace)

**EGM (upstream design + README):** **Living checked-in specifications** and **context-isolated review** to fight hallucination cascades, weeds syndrome, chat dump fatigue, and documentation drift. Human owns trade-offs and merge.

**TIED (stdd):** **Tokenized intent stack** REQ → ARCH → IMPL, checklist gates, MCP project YAML, strict TDD order, evidence-chain **proof boundaries**, optional integrated adversarial inquiry, evaluation charter **separate arms**.

**Compose:** Use EGM for **artifact-first** design/review and **drift-report** literacy; translate approved intent into TIED REQ scope + IMPL pseudo-code; keep **gate authority**, **`tied_config_get_base_path`**, and **LEAP** on the platform plane.

---

## Deliverables (`@non-tied-build`)

| Artifact | Path | Build default |
| --- | --- | --- |
| Wave comparison | `docs/comparisons/google-egm-elephant-goldfish-vs-tied-agent-management.md` | **Required** |
| Plan folder | `tied-project/non-tied-plans/google-egm-elephant-goldfish-vs-tied/` | **Required** (this plan + test-strategy + CITDP draft) |
| Evaluation charter § narrative | `docs/tied-methodology-evaluation-framework.md` External narrative control table | **Optional** (sponsor message or build checklist opt-in) |
| Composition matrix §2 row 19 | `docs/comparisons/methodology-composition-matrix.md` | **Defer** (requires REQ row-count contract 18→19) |
| Improvement roadmap Spec Kit pointer | `docs/tied-improvement-roadmap.md` | **Defer** |

---

## Analysis contract (harness × TIED)

1. **Metadata table** — Purpose, Source URL, Status **reference only; no new REQ/ARCH/IMPL from this doc**, Distinct from, TIED anchors (same spirit as Cursor/LangChain harness docs).
2. **Executive summary** — Center-of-gravity table + compose-don’t-replace paragraph.
3. **Executive material must include Q1–Q6 table** mapping each evaluation question to **disposition** (literacy / Composable / Defer / not_measured) per evaluation framework—**not** fabricated cohort stats.
4. **Source summary** — Four failure modes, lifecycle phases 1–5, five-stage Goldfish pipeline, artifact-first UX, Phase 5 file-boundary convention; label **EGM-reported** or **upstream architecture doc**.
5. **Failure modes ↔ TIED** — Map context pollution, weeds, chat dump, doc drift to AGENTS.md bootstrap, IMPL-before-code, working folders, LEAP.
6. **Skill/persona inventory** — Table: `egm-brainstorm` … `egm-drift-report` → TIED analogues (`feature_*`, pseudocode validate, adversarial inquiry, scoped analysis).
7. **Harness vs platform seam** — Traefik row 13 vocabulary; authority-boundary checklist link; EGM phases 1–4 must not silently write platform YAML.
8. **§ Touchpoint 1 — RESOLVE** — EGM artifact/phase → TIED analogue (**non-1:1** rows for rubric review vs `tied_verify`).
9. **Capability matrix** — **12–15 rows**; dispositions only: Align / Composable / Tension / Gap / Defer.
10. **Mermaid** — Harness EGM loop → translate intent → TIED core (valid node IDs, no spaces in node ids).
11. **Composition playbook** — Minimal path: brainstorm → sponsor SoT choice → REQ-scoped TIED checklist implement.
12. **Related documents** — Spec Kit matrix row 5, Traefik 13, Cursor 14, LangChain 15, LangWatch 18, Persante SDD sibling, evaluation framework, matrix row pointer (**planned Defer** if row 19 not shipped).

---

## Distinct from (scope ownership)

| Sibling | EGM owns |
| --- | --- |
| Persante SDD × TIED | Wiki `spec.md` / task DAG contract (client path) |
| GitHub Spec Kit / SDD (matrix row 5) | `feature_*` MCP orchestration shell |
| Cursor harness × TIED | Online evals, Keep Rate, tool-reliability ops |
| LangChain harness × TIED | Benchmark trace middleware loop |
| LangWatch × TIED | Repo-scale refactor + lint cage + owed-ports |
| Traefik × TIED | Fleet egress / Triple Gate **Defer** detail |

---

## Forbidden

- Mint REQ/ARCH/IMPL in analysis body or plan-folder CITDP `tied_tokens_new` entries.
- Claim Goldfish Step 9 or drift-report green = Q1 defect rate or evidence-chain integrated profile.
- Universal maturity score; conflating design-review findings with **confirmed finding**.
- Install EGM plugin or mutate product code in this track.
- Matrix row 19 + REQ amend without explicit sponsor opt-in during build/close.

---

## Verification

See [test-strategy.md](test-strategy.md). Handoff: [evidence/session-handoff.md](evidence/session-handoff.md).

## Handoff

Proceed to **`@non-tied-build`** with slug `google-egm-elephant-goldfish-vs-tied`. Chat lists paths only; do not paste full comparison body.
