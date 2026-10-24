# External service comparison skill — refined plan (pass 2)

| Field | Value |
| --- | --- |
| **request_token** | `REQ-TIED_EXTERNAL_SERVICE_COMPARISON` |
| **working_slug** | `REQ-TIED_EXTERNAL_SERVICE_COMPARISON` |
| **Linked Cursor plan** | `/Users/fareed/.cursor/plans/external_comparison_skill_d7e5efdc.plan.md` |
| **CITDP** | [CITDP-REQ-TIED_EXTERNAL_SERVICE_COMPARISON.yaml](../../citdp/CITDP-REQ-TIED_EXTERNAL_SERVICE_COMPARISON.yaml) |
| **Tracker** | [checklist-tracker.yaml](checklist-tracker.yaml) |
| **Test strategy** | [test-strategy.md](test-strategy.md) |
| **depth_tier / gate_policy** | `integrated` / `advisory` |
| **methodology_surface_change_class** | `prompt_type_workflow` · `surface_ref: external-service-comparison` |
| **Refined** | 2026-10-23 |

---

## Refine (Touchpoint 1 — RESOLVE)

### Intent authority

Ship explicit-only global methodology-harness skill **`@external-service-comparison`** under `tools/bundled-prompt-type-skills/external-service-comparison/`. It codifies the **three-wave** sequence already documented in [external-service-three-wave-comparison-template.md](../../../tied-bundle/docs/external-service-three-wave-comparison-template.md):

1. Wave 1 — read-only capture (`docs/comparisons/{vendor}-{topic}.md`)
2. Wave 2 — TIED analysis (14 template sections + capability matrix)
3. Wave 3 — **handoff only** (doc/skill compose or `add-feature` / `build-plan` for enforced behavior)

**RESOLVE charter:** Filename and slice order may change; intent authority stays with outreach proof boundaries and checklist-owned promotion.

### Two working roots (do not conflate)

| Root | When | Purpose |
| --- | --- | --- |
| `tied-project/working/REQ-TIED_EXTERNAL_SERVICE_COMPARISON/` | Implementing **this skill** (full TIED) | PLAN, Tracker, CITDP, gates, adversarial inquiry |
| `tied-project/working/DOC-{SLUG}-COMPARISON/` | Each **@external-service-comparison** invocation | `PLAN-refine-pass1.md`, refine tracker, evidence — **no REQ mint** from comparison prose |

### RESOLVE table

| Informal | Canonical | Layer |
| --- | --- | --- |
| External comparison / vendor study | **External service comparison** (methodology harness) | Skill + template |
| Wave 1 / capture | **Service summary** (read-only) | Outreach doc |
| Wave 2 / vs TIED | **Agent-management lens analysis** | Outreach doc |
| Wave 3 | **Bounded handoff** or scoped REQ | Process |
| `non-tied-plan` for comparisons | **Defer** as default after skill ships; template points to `@external-service-comparison` | Migration |

**PRELOAD (session):** [prompt-composer.md](../../vocab/prompt-composer.md), [tied-methodology.md](../../vocab/tied-methodology.md), [quality-assurance.md](../../vocab/quality-assurance.md), [sponsor-agent-relationship.md](../../vocab/sponsor-agent-relationship.md), [pseudocode-and-citdp.md](../../vocab/pseudocode-and-citdp.md), [tied-yaml-mcp.md](../../vocab/tied-yaml-mcp.md), [working-artifact-placement.md](../../../tied-bundle/docs/working-artifact-placement.md).

### Depth split (refinement)

| Context | `depth_tier` | Notes |
| --- | --- | --- |
| **REQ implementation** (this plan) | **`integrated`** | Eligibility: workflow consumes external input; run `sub-adversarial-inquiry-pass` before RED |
| **Per comparison invocation** (`DOC-*`) | **`minimal`** outreach | No project YAML; gate_policy `outreach_doc_only`; no token mint |

**Costly choice (optional downgrade):** Packaging-only path at **`minimal`** (mirror [REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP](../../requirements/REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP.yaml)) if sponsor waives integrated inquiry on skill prose — **default remains integrated** per linked plan.

### Consequence ladder

| Decision | Class | Default |
| --- | --- | --- |
| Dedicated REQ/ARCH/IMPL trace | Reversible | Proceed |
| Wave 1 + Wave 2 default on invoke | Reversible | Proceed (sponsor confirmed) |
| Mandatory `DOC-{SLUG}-COMPARISON` per invoke | Reversible | Proceed (sponsor confirmed) |
| Fourth **methodology-harness** skill (not 14th prompt-type leaf) | Reversible | Proceed |
| `depth_tier: minimal` for REQ packaging | Costly | **Defer** unless sponsor waives integrated inquiry |
| Methodology composition matrix row | Costly | **Defer** |
| Target test execution / vendor MCP | Costly | **Defer** unless separately scoped |
| Import vendor artifacts into TIED YAML | Costly | **Defer** — future REQ |

---

## Plan (CITDP)

**Record:** [CITDP-REQ-TIED_EXTERNAL_SERVICE_COMPARISON.yaml](../../citdp/CITDP-REQ-TIED_EXTERNAL_SERVICE_COMPARISON.yaml) (analysis at refine-plan; complete after implement).

**Enrollment (advisory):** When implement CITDP declares `methodology_surface_experiment_link`, follow [methodology-surface-enrollment-advisory.md](../../../tools/bundled-prompt-type-skills/prompt-shared/methodology-surface-enrollment-advisory.md) — hypothesis, experiment upsert, `surface_ref: external-service-comparison`, typed conformance refs, outcome observation before verification claims.

**Reuse (do not fork):** [REQ-PROMPT_TYPE_GLOBAL_SKILLS](../../requirements/REQ-PROMPT_TYPE_GLOBAL_SKILLS.yaml), [ARCH-PROMPT_TYPE_GLOBAL_SKILLS](../../architecture-decisions/ARCH-PROMPT_TYPE_GLOBAL_SKILLS.yaml), [IMPL-PROMPT_TYPE_GLOBAL_SKILLS](../../implementation-decisions/IMPL-PROMPT_TYPE_GLOBAL_SKILLS.yaml) for bundle install and `tied-install.sh`.

---

## Compose-don't-replace

| Harness (tune here) | Platform authority (unchanged) |
| --- | --- |
| Comparison procedure, claim labels, DOC working folder | **`tied_checklist_gate_validate`**, **`tied_verify`**, **`pseudocode_validate`** |
| Wave 1–2 outreach under `docs/comparisons/` | Project REQ/ARCH/IMPL via **TIED MCP** / **`tied-cli.sh`** after **`tied_config_get_base_path`** |
| Template + `@external-service-comparison` | Sponsor **consequence ladder** and **RESOLVE charter** |
| `examples.md` pointers to Open Ontologies + AI-SDLC pairs | Methodology YAML in **`tied-bundle/`** (read-only in clients) |

---

## Implementation contract

### Skill package (pattern: `harness-trace-review`)

| File | Role |
| --- | --- |
| `SKILL.md` | Normative procedure (<500 lines), explicit-only frontmatter, inputs/outputs/forbidden, **minimal** TIED applicability on invoke |
| `reference.md` | DOC folder layout, RESOLVE map, Wave 1 repo vs URL branches, **14 sections** list, verification grep checks, Wave 3 handoff block |
| `examples.md` | [open-ontologies-repository](../../../docs/comparisons/open-ontologies-repository.md) pair, [ai-sdlc-atdd-software-factory](../../../docs/comparisons/ai-sdlc-atdd-software-factory-vs-tied.md) pair, optional Heimsbakk DOC working pattern |

**Do not** wire `prompt-shared/tied-refine.md` into this harness leaf (same as other methodology-harness skills). **Do** reference the bundle template as canonical methodology law.

### Normative invocation (summary)

1. Validate HTTPS URL and/or absolute local path; derive kebab-case `{SLUG}`; ask when missing.
2. Session bootstrap + PRELOAD routed glossaries; read comparison template.
3. Create `tied-project/working/DOC-{SLUG}-COMPARISON/` with plan + refine tracker + `evidence/` **before** comparison markdown.
4. **Distinct from** sibling comparisons (Traefik, LangChain, Cursor, Open Ontologies, AI-SDLC, …).
5. Read-only evidence gathering (README, CI, skills; URL fetch; GitHub read-only checkout/API — record source identity).
6. Wave 1 + Wave 2 paths; `.gitignore` allowlist per file.
7. Verify labels, links, 14-section parity; **no** `tied_validate_consistency` when no project YAML changed.
8. Wave 3 handoff block only.

### TDD slices (after `pre_implementation` allowed)

| Order | Slice | Deliverable |
| ---: | --- | --- |
| 0 | **Spec** | `tied_config_get_base_path` → REQ/ARCH/IMPL via TIED tools; [IMPL-TIED_EXTERNAL_SERVICE_COMPARISON-pseudocode.md](../../implementation-decisions/IMPL-TIED_EXTERNAL_SERVICE_COMPARISON-pseudocode.md) with block token comments; `pseudocode_validate` |
| 1 | **RED** | `tools/bootstrap/lib/external-service-comparison-skill.test.mjs`; extend `METHODOLOGY_HARNESS_SKILLS` in `prompt-type-skills.test.ts` |
| 2 | **GREEN** | Skill trio under `tools/bundled-prompt-type-skills/external-service-comparison/` |
| 3 | **RED/GREEN wiring** | `tools/bootstrap/manifest.json`, `PROMPT_TYPE_LEAF_IDS` in [constants.ts](../../../mcp-server/src/methodology-production-system-enrollment/constants.ts), enrollment tests |
| 4 | **Docs/vocab** | Template Wave table → `@external-service-comparison`; [prompt-type-skills.md](../../../tied-bundle/docs/prompt-type-skills.md), [client-development-index.md](../../../tied-bundle/docs/client-development-index.md), [prompt-composer.md](../../vocab/prompt-composer.md), bundled [README](../../../tools/bundled-prompt-type-skills/README.md) (**13 + 4 harness + router**) |
| 5 | **Verify** | test-strategy commands, `tied_validate_consistency`, vocabulary VALIDATE, close-out envelope |

**Inventory rule:** Add to `METHODOLOGY_HARNESS_SKILLS`, `ALL_MANAGED_SKILL_DIRS`, `manifest.json` managed list, and `PROMPT_TYPE_LEAF_IDS` — **not** to `LEAF_SKILLS` (13) or `prompt-type-router` dispatch.

---

## Verification and handoff

See [test-strategy.md](test-strategy.md).

**Refine-plan boundary:** This pass writes PLAN, CITDP, Tracker, and test strategy only — **no** skill files, token indexes, or RED tests until **`/build-plan`**.

**Next step:** Run **`/build-plan`** on the linked Cursor plan (or this PLAN). First implement steps: integrated adversarial inquiry → REQ/ARCH/IMPL → pseudo-code gate → RED tests.

**Forbidden:** `pbpaste`/`pbcopy`, automatic git, direct project YAML when MCP available, methodology YAML edits, vendor-truth-as-proof, token mint from comparison prose.

---

## Gate note (refine pass)

`pre_implementation` at **integrated** depth expects adversarial inquiry artifacts and completed pseudo-code/REQ stubs. Refine-plan may record **`allowed: false`** until **`build-plan`** completes those steps — that is normal and **not** authorization to skip gates during implement.
