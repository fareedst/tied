# Software engineering degree × TIED — refined plan (pass 2)

| Field | Value |
| --- | --- |
| **Working token** | `DOC-SOFTWARE-ENGINEERING-DEGREE-COMPARISON` — outreach doc bundle; **no REQ mint** |
| **Refined** | 2026-10-26 |
| **Prior pass** | [PLAN-refine-pass1.md](./PLAN-refine-pass1.md) |
| **Source** | [software-engineering-degree.md](../../../docs/comparisons/software-engineering-degree.md) — **Sponsor-proposed** in-repo curriculum |
| **Process** | [@external-service-comparison](../../../tools/bundled-prompt-type-skills/external-service-comparison/SKILL.md) + [external-service-three-wave-comparison-template.md](../../../tied-bundle/docs/external-service-three-wave-comparison-template.md) |
| **Tracker** | [checklist-tracker-refine.yaml](./checklist-tracker-refine.yaml) |
| **Test strategy** | [test-strategy.md](./test-strategy.md) |

## Pass 2 reconciliation

The sponsor intent is unchanged:

> TIED should behave like a CS graduate software engineer.

The deliverable must therefore distinguish:

| Plane | Code | Observance |
| --- | --- | --- |
| TIED methodology | **M** | What AGENTS.md, checklists, MCP, skills, vocabulary, and traceability artifacts require |
| Agent implementation | **A** | What a TIED-guided agent is expected to understand and apply when implementing client software |
| Client infrastructure | **C** | CI/CD, cloud, runtime, labs, organization, and deployment capabilities; **Defer** unless client scope explicitly includes them |

The exact source inventory is now recorded:

- **16 courses**
- **167 numbered modules** (`1.` through `13.` within each course)
- **887 hyphenated detail points** under those modules
- Three mastery dimensions: **Conceptual**, **Practical**, and **Evaluative**
- Four scales: **algorithm**, **component**, **complete system**, and **engineering process**

“Point-by-point” means one analysis row for each of the **887 hyphenated detail points**. Module titles and module objectives remain contextual headings, not additional rows. The final Wave 2 deliverable remains one document, as requested; authoring and verification are batched by Parts I–IV to control review size.

## Resolved vocabulary and boundaries

| Sponsor/source term | TIED interpretation | Disposition |
| --- | --- | --- |
| **CS graduate software engineer** | Competency persona for a TIED-guided agent and its sponsor/reviewer relationship | **Recommendation-only**; not accreditation |
| **Interpretation** | Why the curriculum point matters to engineering judgment under TIED | Document-local explanatory field |
| **Observance** | What is required by methodology, expected of the implementing agent, or deferred to the client | Document-local explanatory field |
| **Conceptual / Practical / Evaluative** | Explanation, implementation, and evidence dimensions crosswalked to TIED | **Composable** |
| **TIED-existing** | Capability documented or implemented in this repository | Claim label, not a new token |
| **Sponsor-proposed** | A curriculum statement supplied by the sponsor | Source claim label |
| **not_measured** | No effectiveness or educational-outcome measurement was performed | Mandatory proof-boundary label where relevant |

No project vocabulary RECORD, semantic token, REQ, ARCH, or IMPL is created by this comparison. The Wave 3 promotion path remains **Defer**.

## Required final document structure

Create [software-engineering-degree-vs-tied.md](../../../docs/comparisons/software-engineering-degree-vs-tied.md) with the template’s 14 sections in this exact order:

1. Metadata
2. Executive summary
3. Source summary
4. Relationship to sibling comparisons
5. Competency themes → TIED surfaces
6. Touchpoint 1 — RESOLVE
7. Primary capability matrix
8. Authority boundary
9. Anti-patterns
10. Compose-don’t-replace
11. Bounded operator recommendations (**Recommendation-only**)
12. Phased recommendations (Phase 0 document; Phase 1+ **Defer**)
13. Explicit non-adoptions
14. Proof boundary
15. Related documents

The template calls these “14 sections” because metadata is the document preamble; sections 1–14 above are the required analytical sections after metadata. Keep **Proof boundary** and **Related documents** as separate headings so section parity is unambiguous.

After the analytical sections, include:

- A TOC linking to Courses 1–16.
- Parts I–IV matching the source’s four divisions.
- One table per numbered module with these columns:

| Curriculum point | Interpretation | Observance | Disposition | Plane |
| --- | --- | --- | --- | --- |

Each table must preserve the source point or a faithful short paraphrase, identify whether observance is **M**, **A**, or **C**, and use only the dispositions **Align**, **Composable**, **Tension**, **Gap**, **Defer**, or **N/A**.

## Implementation batches

The final output is one markdown file; no separate Part I–IV comparison files are introduced.

1. **Wave 1 capture normalization**
   - Add metadata, TL;DR, captured date, sibling analysis link, and Notes for stdd readers to the existing source file.
   - Keep all course, module, objective, and detail-point content structurally unchanged.
2. **Wave 2 analytical scaffold**
   - Add metadata through Related documents.
   - State the authority boundary clearly: curriculum competence informs the agent implementation plane; TIED gates, project-YAML authority, verification, and sponsor choices remain authoritative.
3. **Parts III and II**
   - Author Courses 13–15 first for the densest TIED mapping.
   - Author Courses 7–12 next for requirements, architecture, maintenance, quality, security, and operations.
4. **Parts I and IV**
   - Author Courses 1–6 as agent/client engineering competence, with methodology gaps explicitly labeled rather than implied away.
   - Author Course 16 as a composable client capstone pattern, not a TIED degree or product requirement.
5. **Verification**
   - Record expected source and output counts in `evidence/bullet-count-receipt.md`.
   - Verify all 887 source points are represented exactly once in the final point tables.
   - Verify labels, dispositions, planes, section order, links, and proof boundaries.

## TIED authority boundary

The comparison must not imply that:

- `tied_validate_consistency` demonstrates competence in algorithms, operating systems, networking, databases, or AI;
- a TIED process artifact is a university credential;
- an agent’s plausible explanation is evidence of implementation correctness;
- a curriculum point changes TIED gates or project YAML;
- client CI, cloud, deployment, or production operations are supplied by TIED methodology;
- TIED replaces practical laboratories, runtime execution, or independent human judgment.

Use existing TIED anchors by reference only: `[PROC-AGENT_REQ_CHECKLIST]`, `[PROC-TIED_DEV_CYCLE]`, `[PROC-VOCABULARY_INDEX]`, `[PROC-IMPL_PSEUDOCODE_TOKENS]`, `pseudocode_validate`, `tied_verify`, evidence provenance, and the sponsor consequence ladder. Do not mint new tokens in the comparison body.

## Plan and gate state

| Field | Value |
| --- | --- |
| **Change class** | `comparisons_doc_only` |
| **Depth** | `profile_depth: minimal` |
| **Gate policy** | `outreach_doc_only` |
| **TIED YAML** | Unchanged |
| **Machine gate** | `tied_checklist_gate_validate` `pre_implementation` returned `allowed: false` for the sparse DOC tracker; see [refine-pass1-gate-note.md](./evidence/refine-pass1-gate-note.md) |
| **Interpretation** | Expected outreach-tracker limitation; not REQ implementation authorization and not a reason to force integrated adversarial inquiry into this doc-only comparison |

The optional Jev plan-skill shadow was locally unavailable and is advisory only; it does not affect the checklist result or the plan’s authority.

## Sponsor next step

Run **build-plan** against this refined plan. It will write the two comparison documents, the `.gitignore` allowlist, the bullet-count receipt, and build handoff evidence. `tied_validate_consistency` remains skipped unless project TIED YAML is changed.

**Refine-plan status:** Superseded for execution by [PLAN-refine-pass3.md](./PLAN-refine-pass3.md) (pass 2, 2026-10-26).  
**Build-plan status:** Pending — link build-plan to pass 3.
