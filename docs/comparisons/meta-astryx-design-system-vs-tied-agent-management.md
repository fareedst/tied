# Meta Astryx design system × TIED — agent management lens

| Field | Value |
| --- | --- |
| **Purpose** | Map Meta **Astryx** (agent-ready design system: `AGENTS.md`, `astryx init`, knowledge records, vibe tests) to TIED as implemented in this repository — emphasis on **instruction surfaces** and **knowledge authority** vs **REQ/ARCH/IMPL gates** — not adopting Astryx UI packages as TIED core. |
| **Audience** | Sponsors, harness authors, prompt-type operators, methodology owners |
| **Source URL** | [github.com/meta/astryx](https://github.com/meta/astryx) (MIT, beta — **target-repo-observed** / **Meta-reported**) |
| **Repo capture (sibling)** | [meta-astryx-design-system.md](meta-astryx-design-system.md) — **reference only** |
| **Status / date** | Outreach / analysis snapshot, **2026-11-17** — **reference only; this document does not mint REQ/ARCH/IMPL tokens** |
| **Executable follow-up** | Wave 3 Phase 1 **Implemented** — [REQ-TIED_META_ASTRYX_DESIGN_SYSTEM_WAVE3](../../tied-project/requirements/REQ-TIED_META_ASTRYX_DESIGN_SYSTEM_WAVE3.yaml); matrix §2 row + vibe probes still **Defer** |
| **Distinct from** | [Google Agent Skills × TIED](google-agent-skills-vs-tied-agent-management.md); [Persante SDD × TIED](persante-sdd-skills-vs-tied-agent-management.md); [LangChain harness × TIED](langchain-harness-engineering-vs-tied-agent-management.md); [Cursor harness × TIED](cursor-harness-engineering-vs-tied-agent-management.md); [Open Ontologies × TIED](open-ontologies-repository-vs-tied-agent-management.md); [Furmanov harness-profiler × TIED](afurmanov-harness-profiler-vs-tied-agent-management.md) |
| **TIED anchors (reference only)** | [AGENTS.md](../../AGENTS.md), [agent-req-implementation-checklist.md](../../tied-bundle/docs/agent-req-implementation-checklist.md), [client-development-index.md](../../tied-bundle/docs/client-development-index.md), [tied-methodology-evaluation-framework.md](../tied-methodology-evaluation-framework.md), [sponsor-agent-relationship.md](../../tied-project/vocab/sponsor-agent-relationship.md), [harness-platform-taxonomy.md](../../tied-project/vocab/harness-platform-taxonomy.md) |

---

## Executive summary

**Meta Astryx** is an open **design system** positioned as **agent-ready**: predictable component APIs, CLI-backed docs, canonical **`AGENTS.md`**, `astryx init` **agent blocks**, and offline **vibe tests** that probe whether instructions help models emit correct UI code (**Meta-reported** / **target-repo-observed**). Contributor-facing **knowledge records** use explicit `authority` so only **`current`** specs govern implementation — a human-readable governance plane parallel to, but not equivalent with, a semantic token graph.

TIED’s center of gravity is **software delivery intent** in implementation repos: vocabulary RESOLVE/RECORD/VALIDATE, CITDP, REQ → ARCH → IMPL **essence_pseudocode**, checklist gates, MCP **`tied-project/`** YAML, **`tied_verify`** when enrolled, LEAP, and sponsor **consequence ladder**. TIED already ships install-managed **`AGENTS.md`** fragments and bundled **skills** via `tied-install` (**TIED-existing**); it does not ship React components or DS-specific vibe harnesses.

**Compose-don’t-replace:** Use Astryx literacy when a **product repo** adopts the design system alongside TIED — keep behavior proof and YAML writes on the TIED/checklist plane; use Astryx init/docs for the **UI layer** only.

| Center of gravity | Meta Astryx | TIED (stdd) |
| --- | --- | --- |
| Primary artifact | Components, themes, patterns | REQ/ARCH/IMPL + tests + gate receipts |
| Agent onboarding | `astryx init`, CLI docs, global skill | `tied-install`, bundled skills, MCP |
| Knowledge authority | `current` knowledge records | Token graph + detail YAML |
| Quality signal (vendor) | Vibe tests, convention docs | **`tied_verify`**, consistency validators |
| Measurement ethos | “Earned by measurement” on conventions | Evaluation charter, pilots — **not_measured** vs Astryx |
| UI delivery | npm packages, Storybook | **OutOfScope** for methodology core |

### Evaluation charter mapping (Q1–Q6)

Per [evaluation framework](../tied-methodology-evaluation-framework.md); Astryx × TIED cohorts **`not_measured`**.

| Q# | Astryx signal | TIED surface | Disposition |
| --- | --- | --- | --- |
| **Q1** | Vibe-test pass on sample prompts | Confirmed-finding / defect proxy arms | **Defer** — different denominators |
| **Q2** | Convention tests held loosely | Kaizen, methodology learning | **Composable** literacy only |
| **Q3** | `specs:for` path→record routing | PRELOAD + vocab routing | **Composable** |
| **Q4** | AGENTS.md helps codegen | Checklist adherence evidence | **Tension** — different artifacts |
| **Q5** | Short CLI output saves tokens | MCP wall-time pairing in charter | **Align** on cost discipline |
| **Q6** | More agent docs = better UI | Gate authority unchanged | **Recommendation-only** |

---

## Source summary (Meta claims only)

From sibling [capture](meta-astryx-design-system.md) and **target-repo-observed** themes (**Meta-reported** where noted).

- **Product:** Open DS with 150+ components, theming, patterns; React 19+; consumer-facing CSS + typed components (**Meta-reported**).
- **History / scale:** Grew inside Meta; claimed 13,000+ apps (**Meta-reported**).
- **Packages:** `@astryxdesign/core`, `cli`, `build`, `theme-*` on npm (**target-repo-observed**).
- **Differentiators:** Open composition, no styling lock-in for consumers, theme via CSS variables, swizzle to own source (**Meta-reported**).
- **Agent-ready:** Same reference for people and assistants; CLI and docs co-designed (**Meta-reported**).
- **`astryx init`:** Writes agent instruction blocks; remove via `init --remove-agents` (**target-repo-observed**).
- **`AGENTS.md`:** Canonical repo-wide surface; nested files for path-specific rules; CLI answers kept short (**target-repo-observed**).
- **Knowledge records:** `draft` / `current` / `archived`; `pnpm specs:for`; spec-writing rubric in PRs; `pnpm check:knowledge` (**target-repo-observed**).
- **Vibe tests:** `internal/vibe-tests` — instruction quality for component codegen (**target-repo-observed**).
- **Principles:** Guidance over enforcement; strong conventions; one system for humans and AI; earned by measurement (**Meta-reported**).

TIED effectiveness vs Astryx vibe outcomes: **`not_measured`**.

---

## Relationship to sibling comparisons

| Sibling | What it owns | This document owns |
| --- | --- | --- |
| [Google Agent Skills × TIED](google-agent-skills-vs-tied-agent-management.md) | Multi-skill catalog CI, semver, eval suites | **Single-product DS** agent init + upstream skill file |
| [Persante SDD × TIED](persante-sdd-skills-vs-tied-agent-management.md) | Wiki `spec.md` + `tasks.json` DAG | **Component API** predictability + repo `AGENTS.md` |
| [LangChain harness × TIED](langchain-harness-engineering-vs-tied-agent-management.md) | LangSmith traces, benchmark loops | **Static** instructions + offline vibe-tests |
| [Cursor harness × TIED](cursor-harness-engineering-vs-tied-agent-management.md) | Fleet harness metrics, Keep Rate | DS docs plane — not session telemetry |
| [Open Ontologies × TIED](open-ontologies-repository-vs-tied-agent-management.md) | RDF/OWL MCP lifecycle | Markdown **records** for UI specs |
| [Furmanov harness-profiler × TIED](afurmanov-harness-profiler-vs-tied-agent-management.md) | Session JSONL orchestration X-ray | **Instruction-quality** probes for UI codegen |

Methodology composition matrix **§2 new row**: **Defer** (sponsor).

---

## Harness lessons → TIED agent management

### Canonical instruction surface

| Astryx pattern | TIED surface | Notes |
| --- | --- | --- |
| Root `AGENTS.md` canonical | [AGENTS.md](../../AGENTS.md) + optional `tied-project/agent-inject/` | **Align** pattern; different content |
| Nested `AGENTS.md` | Subtree docs, `.cursor/rules`, skills | **Composable** monorepo literacy |
| Tool-specific duplication discouraged | Bundled prompt-type skills | **Align** “one canonical surface” |
| CLI output length discipline | MCP tool JSON verbosity | **Composable** — sponsor cost (Q5) |

### Agent onboarding (`init` vs install)

| Astryx pattern | TIED surface | Notes |
| --- | --- | --- |
| `astryx init` managed blocks | `tied-install.sh`, skills under `.cursor/skills/` | **Tension** — different products |
| Global computer-level skill | User-global skills store (Cursor) | **Composable** for DS-only repos |
| `init --remove-agents` | Refresh overwrites inject guides on `tied-install --refresh` | **Align** reversible install literacy |
| `npm run astryx` script wrapper | `tied-cli.sh` stable path | **Align** deterministic invocation |

### Knowledge authority vs token graph

| Astryx pattern | TIED surface | Notes |
| --- | --- | --- |
| Only `current` records govern | Approved REQ/ARCH/IMPL detail | **Tension** — parallel authority models |
| `pnpm specs:for` lookup | PRELOAD routing, `get_decisions_for_requirement` | **Composable** — different stores |
| Spec-writing rubric in PR | Pseudocode validation, CITDP | **Composable** review discipline |
| `draft` vs merged code | IMPL vs divergent tests (LEAP) | **Align** anti-infer-approval theme |

### Vibe tests vs TIED proof

| Astryx pattern | TIED surface | Notes |
| --- | --- | --- |
| `/vibe-test` on AGENTS.md | E2e on bundled skills (line limits, frontmatter) | **Composable** — partial **Align** |
| Convention measured, held loosely | Kaizen + LEAP when stack diverges | **Align** ethos |
| UI codegen samples | Unit/composition tests on shipped code | **Tension** — DS ≠ delivery intent |
| Vibe pass → ship UI | **`tied_verify`** on behavior scope | **Tension** — see anti-patterns |

---

## Touchpoint 1 — RESOLVE

| Astryx / vendor term | TIED preferred term / surface | Disposition |
| --- | --- | --- |
| **Design system** | Client product UI layer (**OutOfScope** TIED core) | **Defer** product |
| **Agent-ready** | Harness-adjacent literacy | **Composable** |
| **Agent block** (`init`) | Skill / rules injection | **Composable** |
| **Knowledge record** | REQ/ARCH/IMPL detail or client doc | **Tension** |
| **`current` authority** | Approved tokens + sponsor sign-off | **Tension** |
| **`pnpm specs:for`** | PRELOAD + impact discovery | **Composable** |
| **Vibe test** | Skill e2e, pilot harness eval | **Composable** |
| **`astryx docs`** | External vendor docs URL | **Defer** as TIED artifact |

### Disposition key

| Disposition | Meaning |
| --- | --- |
| **Align** | TIED already encodes similar intent for delivery scope. |
| **Composable** | Combine patterns without equivalence. |
| **Tension** | Parallel authorities; operator orders proof planes. |
| **Gap** | Vendor emphasis outside TIED core. |
| **Defer** | Product adoption or matrix row — sponsor choice. |

---

## Primary capability matrix

| Concern | Astryx COG | TIED COG | Disposition | Rationale |
| --- | --- | --- | --- | --- |
| UI component delivery | npm DS packages | Application code under REQ scope | **OutOfScope** TIED core |
| API predictability for agents | Conventions + docs tree | IMPL pseudo-code vocabulary | **Composable** |
| Repo instruction surface | `AGENTS.md` + init blocks | AGENTS.md + skills + MCP | **Align** pattern |
| Path-specific guidance | Nested `AGENTS.md` | Rules, vocab PRELOAD | **Composable** |
| Knowledge governance | Record `authority` | Token graph + YAML MCP | **Tension** |
| Lookup by path | `specs:for` | Traceability tools, routing | **Composable** |
| Instruction quality tests | vibe-tests | Prompt-type skill e2e | **Composable** |
| Implement-complete proof | Component/theme PRs | Gates, tests, `tied_verify` | **Align** boundary |
| Catalog-scale skill CI | N/A (single upstream skill) | Bundled skills partial gates | See Google sibling |
| Session harness telemetry | N/A | HTOL optional | See LangChain/Cursor siblings |
| Methodology effectiveness | **Meta-reported** principles | Evaluation charter | **not_measured** |
| Matrix §2 row | N/A | Existing harness rows | **Defer** |

---

## Authority boundary

```mermaid
flowchart TB
  subgraph astryxPlane [Astryx product plane]
    init[astryx init blocks]
    agentsMd[AGENTS.md nested]
    cliDocs[astryx docs CLI]
    records[current knowledge records]
    vibe[vibe-tests]
  end
  subgraph harnessAdj [TIED harness adjacent]
    skills[Bundled prompt-type skills]
    preload[PRELOAD vocab routing]
    inject[tied-project agent-inject]
  end
  subgraph tiedCore [TIED platform adjacent core]
    yamlMcp[TIED YAML MCP]
    gates[tied_checklist_gate_validate tied_verify]
    impl[IMPL pseudo-code tests]
    sponsor[sponsor consequence ladder]
  end
  operator[Operator sponsor]
  operator --> cliDocs
  operator --> skills
  init --> agentsMd
  agentsMd --> vibe
  vibe -.->|advisory| skills
  skills --> preload
  preload --> inject
  operator --> yamlMcp
  yamlMcp --> gates
  gates --> impl
  impl --> sponsor
  records -.x yamlMcp
  vibe -.x gates
```

Astryx **records** and **vibe tests** govern **UI product** semantics. TIED **gates** and **project YAML** govern **delivery intent** for scoped behavior changes. Dual-stack product repos need an explicit **authority order** (sponsor costly choice).

---

## Anti-patterns

| Anti-pattern | Symptom | TIED-oriented remedy |
| --- | --- | --- |
| Pasting vendor README/`AGENTS.md` into stdd | Policy violation; review noise | Link + paraphrase only (skill **Forbidden**) |
| Vibe pass = implement-complete | Green instruction probe, wrong behavior shipped | **`tied_verify`** + checklist gates |
| `current` record overrides REQ | UI spec wins over token graph silently | LEAP; sponsor resolves plane |
| `astryx init` without `TIED_BASE_PATH` check | YAML writes to wrong client tree | **`tied_config_get_base_path`** |
| DS adoption as methodology | Components in methodology bundle | **Explicit non-adoption** |
| Meta scale metrics as TIED proof | 13k apps narrative | Label **Meta-reported**; **`not_measured`** |
| Observation → auto REQ mint | Comparison prose creates tokens | **`add-feature`** only |
| Conflate with Google skill CI | Expect per-DS eval suite on every TIED skill PR | Use [Google × TIED](google-agent-skills-vs-tied-agent-management.md) scope |

---

## Compose-don’t-replace table

| Tune with Astryx literacy | Keep TIED authority |
| --- | --- |
| Run `astryx init` in UI product repos needing DS | **`tied_checklist_gate_validate`** for methodology work |
| Keep nested `AGENTS.md` scoped to UI packages | REQ/ARCH/IMPL via TIED MCP only |
| Use short CLI/docs answers as harness cost hygiene | Gate receipts, not chat brevity alone |
| Treat vibe-tests as instruction QA hints | Tests + verify for shipped logic |
| `specs:for` literacy before editing DS paths | CITDP + PRELOAD before reading TIED YAML |
| Pair DS work with Persante/wiki **only** when sponsor scopes product SDD | TIED stack unchanged |

---

## Bounded operator recommendations (Recommendation-only)

1. **Dual-plane product repos** — When a client ships Astryx UI and TIED methodology, document which plane owns behavior changes (tokens + tests vs component API records).
2. **Init without gate substitution** — `astryx init` composes with; does not replace, `tied-install` or checklist completion.
3. **Label Meta scale claims** — Treat 13k+ apps and vibe pass anecdotes as **Meta-reported**; do not cite as TIED effectiveness.
4. **Instruction probes ≠ verify** — Run bundled skill e2e and `tied_verify` on separate schedules; do not merge verdicts.
5. **Authority explicit on PRs** — UI record PRs vs REQ-scoped code PRs should declare governing artifacts in description (sponsor review).
6. **Sibling routing** — Catalog CI: [Google Agent Skills × TIED](google-agent-skills-vs-tied-agent-management.md); wiki SDD: [Persante × TIED](persante-sdd-skills-vs-tied-agent-management.md); session structure: [Furmanov × TIED](afurmanov-harness-profiler-vs-tied-agent-management.md).
7. **Wave 3 default** — **Defer** matrix row and REQ unless sponsor opens `add-feature`.

---

## Phased recommendations (doc-first)

| Phase | Action | Status |
| --- | --- | --- |
| **0** | Wave 1 capture + this analysis + git allowlist | **Done** (2026-11-17) |
| **1** | [harness-platform-taxonomy.md](../../tied-project/vocab/harness-platform-taxonomy.md) cross-link + [compose guide](../../tied-bundle/docs/meta-astryx-ds-agent-plane-compose.md) | **Implemented** ([REQ-TIED_META_ASTRYX_DESIGN_SYSTEM_WAVE3](../../tied-project/requirements/REQ-TIED_META_ASTRYX_DESIGN_SYSTEM_WAVE3.yaml)) |
| **2** | Methodology composition matrix §2 row | **Defer** |
| **3** | Vibe-style probes for bundled `AGENTS.md` inject | **Defer** (`add-feature`) |

---

## Explicit non-adoptions

- **@astryxdesign/\*** packages as dependencies of TIED methodology in stdd
- Astryx **vibe-test** harness as substitute for **`tied_checklist_gate_validate`** / **`tied_verify`**
- Knowledge **records** replacing REQ/ARCH/IMPL MCP writes
- Meta internal scale or convention test results as **TIED methodology effectiveness** proof
- Minting `[REQ-*]` / `[ARCH-*]` / `[IMPL-*]` from this comparison prose
- Methodology composition matrix **§2 data row** without scoped REQ

---

## Proof boundary

- Upstream themes are **Meta-reported** or **target-repo-observed** via read-only fetch **2026-11-17**; stdd did not run target `pnpm install` or vibe-tests.
- TIED surfaces cited are **TIED-existing** at authoring time; composability does not install Astryx in this repo.
- Wave 3 behavior requires **`add-feature`** / **`build-plan`** with tests — not comparison markdown alone.
- Effectiveness of Astryx agent ergonomics in TIED clients is **`not_measured`** unless enrolled in [evaluation framework](../tied-methodology-evaluation-framework.md) arms.
- This document introduces **no new** REQ/ARCH/IMPL records **in its body**.

---

## Related documents

- [Repo capture (sibling)](meta-astryx-design-system.md)
- [Google Agent Skills × TIED](google-agent-skills-vs-tied-agent-management.md)
- [Persante SDD × TIED](persante-sdd-skills-vs-tied-agent-management.md)
- [LangChain harness × TIED](langchain-harness-engineering-vs-tied-agent-management.md)
- [Cursor harness × TIED](cursor-harness-engineering-vs-tied-agent-management.md)
- [Open Ontologies × TIED](open-ontologies-repository-vs-tied-agent-management.md)
- [Furmanov harness-profiler × TIED](afurmanov-harness-profiler-vs-tied-agent-management.md)
- [External three-wave comparison template](../../tied-bundle/docs/external-service-three-wave-comparison-template.md)
- [Working DOC plan](../../tied-project/working/DOC-META-ASTRYX-DESIGN-SYSTEM-COMPARISON/PLAN-refine-pass1.md)
- [Non-tied plan](../../tied-project/non-tied-plans/meta-astryx-design-system-vs-tied/PLAN.md)
- [Methodology composition matrix](methodology-composition-matrix.md)