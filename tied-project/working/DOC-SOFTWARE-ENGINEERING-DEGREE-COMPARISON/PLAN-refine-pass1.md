# Software engineering degree × TIED — refined plan (pass 1)

| Field | Value |
| --- | --- |
| **Working token** | `DOC-SOFTWARE-ENGINEERING-DEGREE-COMPARISON` (outreach doc bundle; **no REQ mint**) |
| **Refined** | 2026-10-26 |
| **Source plan** | [cs_degree_×_tied_659eb2f8.plan.md](/Users/fareed/.cursor/plans/cs_degree_×_tied_659eb2f8.plan.md) |
| **Target evidence** | In-repo [software-engineering-degree.md](../../../docs/comparisons/software-engineering-degree.md) — **Sponsor-proposed** curriculum (16 courses, ~175 modules, bullet-level detailed coverage) |
| **Process** | [@external-service-comparison](../../../tools/bundled-prompt-type-skills/external-service-comparison/SKILL.md) + [external-service-three-wave-comparison-template.md](../../../tied-bundle/docs/external-service-three-wave-comparison-template.md) — **Wave 1 normalize + Wave 2** |
| **Tracker** | [checklist-tracker-refine.yaml](./checklist-tracker-refine.yaml) |
| **Test strategy** | [test-strategy.md](./test-strategy.md) |

**Sibling pattern:** [tied-vs-well-known-methodologies.md](../../../docs/comparisons/tied-vs-well-known-methodologies.md) (organizational methodology map, not competency grid); [ai-sdlc-atdd-software-factory-vs-tied.md](../../../docs/comparisons/ai-sdlc-atdd-software-factory-vs-tied.md) (executable-spec factory); harness comparisons (LangChain/Cursor/Traefik) — **Defer** duplicating harness seam prose.

---

## Refine (Touchpoint 1 — RESOLVE)

**PRELOAD (session):** [tied-methodology.md](../../../tied-project/vocab/tied-methodology.md), [quality-assurance.md](../../../tied-project/vocab/quality-assurance.md), [sponsor-agent-relationship.md](../../../tied-project/vocab/sponsor-agent-relationship.md), [pseudocode-and-citdp.md](../../../tied-project/vocab/pseudocode-and-citdp.md), [prompt-composer.md](../../../tied-project/vocab/prompt-composer.md).

**Sponsor thesis (resolved):** TIED should **behave like a CS graduate software engineer** — map each curriculum sub-bullet to succinct **Interpretation** (TIED lens) and **Observance** (what is enforced vs expected vs deferred), using three **observance planes**:

| Plane | Code | Meaning |
| --- | --- | --- |
| Methodology | **M** | AGENTS.md, checklists, MCP, skills, `tied-project/` traceability |
| Agent implementation | **A** | Competence expected when a TIED-guided agent writes/tests client code |
| Client infra | **C** | CI/CD, cloud, org process, labs — **Defer** unless client REQ |

| Curriculum / sponsor term | TIED canonical term | Layer | Notes |
| --- | --- | --- | --- |
| **Graduate software engineer persona** | TIED operator + agent under `[PROC-AGENT_REQ_CHECKLIST]` | Process | Outreach metaphor — **not** accreditation |
| **Conceptual / Practical / Evaluative mastery** | Pseudo-code validation, TDD, gates, evidence envelopes | Quality | Maps curriculum table at capture end to TIED proof surfaces |
| **Four scales** (algorithm → component → system → process) | Module validation, composition tests, E2E justification, CITDP/LEAP | Process | **Partial align** |
| **Course 15 agentic engineering process** | Prompt-type skills, delegation envelope, sponsor ladder | Harness | **Align** on traceability + gates |
| **Formal verification / model checking** (Course 10) | `pseudocode_validate`, claims-evidence, adversarial inquiry when enrolled | Quality | **Composable** — not full model checking in core |
| **DevOps / SRE** (Course 12) | Client CI; stdd has its own pipelines | Infra | **Defer C** |
| **Algorithms / OS / networking** (Courses 1–6) | — in methodology | Foundations | **Gap M**; **A** when implementing |
| **Requirements traceability** (Course 7 §9, Course 15 §7) | REQ → ARCH → IMPL + `tied_validate_consistency` | Methodology | **Align M** |
| **TDD / ATDD** (Course 10 §2) | `[PROC-TIED_DEV_CYCLE]` | Methodology | **Align M** |
| **MCP / tools / skills** (Course 14 §7) | TIED YAML MCP + bundled prompt-type skills | Platform | **Partial align M** |
| **Capstone** (Course 16) | CITDP + working folders + evidence — client project | Process | **Composable**; TIED is not a degree program |

**Ambiguity cleared:** Scope is **Wave 1 normalize** + **Wave 2 bullet-level analysis** + **`.gitignore` allowlist** (+ optional `examples.md` row). No TIED YAML, vocab **RECORD** (unless sponsor promotes), or Wave 3 REQ from comparison prose.

**Granularity (sponsor-selected):** **One table row per curriculum sub-bullet** under each numbered module (not module-summary-only).

**Adversarial / depth:** `profile_depth: **minimal**` — doc-only outreach; in-repo source only; no stdd behavior change. Integrated inquiry **Defer**.

**Consequence ladder:**

| Decision | Class | Default |
| --- | --- | --- |
| Publish Wave 1 + Wave 2 + git allowlist | Reversible | Proceed at **build-plan** |
| Monolithic single Wave 2 file (~400+ rows) | Reversible | **Proceed** (sponsor choice) |
| Split Wave 2 into part files I–IV | Reversible | **Defer** unless review pain |
| Cross-link [client-development-index.md](../../../tied-bundle/docs/client-development-index.md) | Reversible | **Recommendation-only** in Wave 2 §10 |
| [methodology-composition-matrix.md](../../../docs/comparisons/methodology-composition-matrix.md) row | Costly | **Defer** |
| REQ “TIED graduate competency profile” | Costly | **Defer** |
| Project vocab RECORD (`graduate_engineer_persona`, `observance_plane`) | Costly | **Defer** unless sponsor asks |

**Distinct from well-known methodologies doc:** That sibling maps Agile/XP/QMM **organizational** frames. This bundle owns **sponsor-proposed CS curriculum** → TIED **competency observance** grid (bullet-level).

**Gate (refine-plan):** Record `pre_implementation` with [checklist-tracker-refine.yaml](./checklist-tracker-refine.yaml); refine pass does **not** write comparison deliverables — **build-plan** executes Implement section.

**Gate state (2026-10-26):** `tied_checklist_gate_validate` → `allowed: false` (sparse outreach tracker; missing integrated adversarial slugs). Same honest limitation as [DOC-OPEN-ONTOLOGIES-COMPARISON](../DOC-OPEN-ONTOLOGIES-COMPARISON/PLAN-refine-pass1.md) — **not** a signal to add integrated inquiry to doc-only outreach. Do not claim gate success; **build-plan** for comparison markdown remains the sponsor next step. Details: [evidence/refine-pass1-gate-note.md](./evidence/refine-pass1-gate-note.md).

---

## Plan (CITDP-lite)

**Change class:** Methodology outreach — **two comparison markdown files** under `docs/comparisons/` (**no** project REQ/ARCH/IMPL index mutation).

**Impact:**

| Area | Blast radius |
| --- | --- |
| `docs/comparisons/software-engineering-degree.md` | Wave 1 normalize (metadata, TL;DR, Notes; body preserved) |
| `docs/comparisons/software-engineering-degree-vs-tied.md` | New Wave 2: 14 sections + Parts I–IV bullet tables |
| `.gitignore` | Two new `!docs/comparisons/software-engineering-degree*.md` lines |
| `tools/bundled-prompt-type-skills/external-service-comparison/examples.md` | Optional one row |
| `tied-project/` YAML, vocab, methodology | **Unchanged** |

**Risk:** (1) Implying `tied_validate_consistency` proves algorithms/OS competence — mitigated by planes + anti-patterns. (2) Treating chat as requirements — mitigated by Course 7/15 crosswalk to REQ/ARCH/IMPL. (3) Doc size / review fatigue — mitigated by TOC, observance shorthand, bullet-count receipt. (4) Confusing TIED methodology with CS degree accreditation — mitigated by explicit non-adoptions.

**LEAP / CITDP persist:** **Defer** — no `tied-project/citdp/CITDP-*.yaml` until Wave 3 behavior.

---

## Test strategy (doc-only)

See [test-strategy.md](./test-strategy.md).

---

## Implement (execution order — sponsor runs **build-plan**)

### Phase 0 — Git allowlist

Add to [`.gitignore`](../../../.gitignore) after the NDTP allowlist lines:

```gitignore
!docs/comparisons/software-engineering-degree.md
!docs/comparisons/software-engineering-degree-vs-tied.md
```

### Phase 1 — Wave 1 normalize capture

Edit [docs/comparisons/software-engineering-degree.md](../../../docs/comparisons/software-engineering-degree.md):

| Block | Content |
| --- | --- |
| Metadata table | **Source** in-repo sponsor-proposed; **Purpose** read-only curriculum capture; **Captured** 2026-10-26; **Analysis (sibling)** → `software-engineering-degree-vs-tied.md` |
| TL;DR | 5 bullets: 16 courses, agentic SE integrated, mastery dimensions, four scales, defining principle |
| Notes for stdd readers | Proof boundary; **Sponsor-proposed** label; link Wave 2 |
| Body | Keep existing course/module/bullet hierarchy |

### Phase 2 — Wave 2 analysis (framework + inventory)

Create [docs/comparisons/software-engineering-degree-vs-tied.md](../../../docs/comparisons/software-engineering-degree-vs-tied.md):

**Sections 1–14 (competency-persona adaptation):**

1. Metadata table — Purpose (graduate engineer persona × TIED), Audience, **Curriculum capture (sibling)**, Status, Distinct from siblings, TIED anchors
2. Executive summary — Curriculum COG vs TIED COG; mastery-dimension table; compose-don’t-replace
3. Source summary — **Sponsor-proposed** bullets from capture
4. Relationship to sibling comparisons — ownership table
5. **Competency themes → TIED surfaces** — Course 7–12, 14–15 thematic mapping tables
6. Touchpoint 1 — RESOLVE disposition table (`graduate_engineer_persona`, `observance_plane`, …); **Defer RECORD**
7. Primary capability matrix — ~12–15 **course-level** rows (disposition + primary plane)
8. Authority boundary — Mermaid: curriculum competence → **A** vs TIED **M** (gates, MCP, sponsor ladder)
9. Anti-patterns
10. Compose-don’t-replace
11. Recommendation-only
12. Phased recommendations (Phase 0 = this doc; Phase 1+ **Defer**)
13. Explicit non-adoptions (not a university, not replacing labs 1–6, not certifying agents)
14. Proof boundary + Related documents

**Document TOC** — anchor links to Courses 1–16.

**Parts I–IV bullet inventory** — for each module, markdown table:

| Curriculum point | Interpretation | Observance | Disposition | Plane |

**Observance shorthand (reuse):**

- `M: [PROC-TIED_DEV_CYCLE]; A: client implementation discipline`
- `M: REQ/ARCH/IMPL + tied_validate_consistency; A: —`
- `M: —; A: expected in code review/TDD; C: Defer CI/cloud`
- `M: sponsor consequence ladder; A: tool boundary`

**Authoring order (recommended):** Sections 1–14 + course matrix → Part III (13–15) → Part II (7–12) → Part I (1–6) → Part IV (16) — highest methodology density first for pattern reuse.

### Phase 3 — Verification

Run [test-strategy.md](./test-strategy.md); write [evidence/bullet-count-receipt.md](./evidence/bullet-count-receipt.md) and [evidence/build-plan-handoff.md](./evidence/build-plan-handoff.md).

**Skip:** `tied_validate_consistency` (no project YAML). **Skip:** any external fetch.

### Phase 4 — Optional

Add row to [examples.md](../../../tools/bundled-prompt-type-skills/external-service-comparison/examples.md).

---

## Wave 2 — Primary capability matrix (draft rows)

| Course (concise) | TIED COG | Disposition | Primary plane |
| --- | --- | --- | --- |
| 1 Programming construction | IMPL contracts, TDD in clients | **Composable** | A |
| 2 Algorithms / complexity | — | **Gap M** | A |
| 3 Languages / compilers | pseudo-code grammar, lint | **Tension** | M/A |
| 4 Architecture / OS | DEBUG/TRACE in AGENTS.md | **Composable** | A/C |
| 5 Networking / distributed | async vocab, module boundaries | **Partial align** | A |
| 6 Databases / data eng | — | **Defer C** | A/C |
| 7 Requirements / domain | vocab RESOLVE, REQ tokens | **Align** | M |
| 8 Software architecture | ARCH decisions, module validation | **Align** | M |
| 9 Maintenance / comprehension | CITDP, source graph tools | **Composable** | M/A |
| 10 V&V / quality | PROC-TIED_DEV_CYCLE, tied_verify | **Align** | M |
| 11 Security / safety | proof boundary, tool safety refs | **Partial align** | M/A |
| 12 DevOps / SRE | stdd CI exists; not methodology core | **Defer** | C |
| 13 AI / LLM engineering | — product LLM course | **Gap M** | A |
| 14 Agentic programming | MCP, skills, delegation | **Partial align** | M |
| 15 Process / evidence / agentic dev | checklist, envelopes, sponsor ladder | **Align** | M |
| 16 Capstone | working folders + client project | **Composable** | M/A |

---

## Proof boundary (unchanged)

The curriculum describes **graduate competence** for humans and agents in the large. TIED documents **how agent-assisted software change is traced and proven in client repos** — not whether an operator passed Course 2. Wave 3 behavior change requires scoped **add-feature** / **build-plan** with REQ/ARCH/IMPL, tests, and gates — not comparison prose alone.

---

## Sponsor next step

| Action | When |
| --- | --- |
| **build-plan** on this working folder | Write deliverables + Phase 3 verification |
| **git commit** | Sponsor-owned after review |
| **close-out** | Optional; expect blocked machine gate for DOC outreach |
| Promote competency profile to YAML/MCP | Scoped TIED workflow (**costly**) |

**Refine-plan status:** Complete (pass 1, 2026-10-26). **Build-plan status:** Pending.
