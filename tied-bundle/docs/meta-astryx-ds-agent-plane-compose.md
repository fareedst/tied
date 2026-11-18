# Meta Astryx design system — agent plane compose guide

**Audience:** Sponsors, UI implementers, and agents working in TIED-tracked repos that also adopt (or evaluate) Meta **Astryx** after reading [Meta Astryx × TIED](../../docs/comparisons/meta-astryx-design-system-vs-tied-agent-management.md).

**Traceability:** [REQ-TIED_META_ASTRYX_DESIGN_SYSTEM_WAVE3](../../tied-project/requirements/REQ-TIED_META_ASTRYX_DESIGN_SYSTEM_WAVE3.yaml) · [ARCH-TIED_META_ASTRYX_DESIGN_SYSTEM_WAVE3](../../tied-project/architecture-decisions/ARCH-TIED_META_ASTRYX_DESIGN_SYSTEM_WAVE3.yaml) · [IMPL-TIED_META_ASTRYX_DESIGN_SYSTEM_WAVE3](../../tied-project/implementation-decisions/IMPL-TIED_META_ASTRYX_DESIGN_SYSTEM_WAVE3.yaml)

**Compose-don’t-replace:** This guide adds **dual-plane** literacy — Astryx **product** instruction (`AGENTS.md`, **`current`** knowledge records, vibe-tests) for UI codegen vs TIED **delivery** authority (REQ/ARCH/IMPL, checklist gates, `tied-project/` YAML). It does **not** mandate `@astryxdesign/*` in stdd, vibe pass as proof, or **records** replacing MCP writes (**`not_measured`** for Meta effectiveness).

---

## Proof boundary

| In scope | Out of scope |
| --- | --- |
| When to use Astryx init / component docs vs TIED PRELOAD | `@astryxdesign/*` as TIED methodology core |
| Label **`current`** records vs approved REQ detail | Knowledge records replacing YAML authority |
| Instruction QA (**vibe-tests**) as advisory | **`tied_checklist_gate_validate`** / **`tied_verify`** substitution |
| Pair-read Agent Skills + Persante catalog rows | Methodology matrix §2 row without MCM LEAP |
| harness-platform-taxonomy cross-link | Vibe e2e on bundled `agent-inject` (Defer) |

Pattern: [tests vs checker-backed claims](tests-vs-checker-backed-claims.md) — separate **UI instruction quality** from **platform proof**.

---

## Scope slice

| TIED delivery graph (implementation repo) | Design-system / Astryx plane |
| --- | --- |
| One **REQ-scoped** change per tracker slug | Component + pattern library across product repos |
| **`tied_verify`** on shipped behavior | **Vibe-test** pass on sample prompts |
| IMPL pseudo-code + gate receipts | **`current`** spec records under `docs/specs/` |
| `tied-install` **AGENTS.md** fragments | `astryx init` agent blocks in product tree |
| MCP **`tied-project/`** writes | CLI docs + theme packages (**target-repo-observed**) |

Label Meta-reported scale (13k+ apps, vibe anecdotes) **`not_measured`** unless a pilot charter exists.

---

## AGENTS.md and init vs TIED install

| Astryx / product (**target-repo-observed**) | TIED (stdd / client) | Operator action |
| --- | --- | --- |
| Root **`AGENTS.md`** canonical for UI repo | Root **`AGENTS.md`** loads **`tied-bundle/docs/ai-principles.md`** | Do not merge planes without explicit authority note |
| Nested **`AGENTS.md`** path rules | `tied-project/vocab/` glossaries | PRELOAD task glossaries before YAML/source |
| **`astryx init`** writes agent blocks | **`tied-install.sh`** bundles skills/docs | UI product may use init; methodology uses install |
| `init --remove-agents` cleanup | Uninstall is project policy | Separate rollback per plane |
| Global Astryx skill path (CLI docs) | `.cursor/skills/` from install matrix | Compose, don’t symlink without review |

---

## Knowledge records vs token graph

| Astryx knowledge plane | TIED token plane | Authority rule |
| --- | --- | --- |
| Record `authority: draft \| **current** \| archived` | REQ index + detail YAML | **Only `current`** records govern UI implementation in product repo |
| `pnpm specs:for` path → record | PRELOAD + impact discovery | Maps discovery, not gate receipts |
| `pnpm check:knowledge` in product CI | `tied_validate_consistency` | Different validators — both may run |
| Spec PR rubric (human review) | CITDP + checklist gates | UI spec PR ≠ REQ-scoped delivery PR |
| Paraphrase in comparisons only | MCP writes to **`tied-project/`** | Never paste vendor spec bodies into stdd core |

**Tension (explicit):** A **`current`** UI record is authoritative for **components** in that product; **`REQ-TIED_*`** detail is authoritative for **tracked delivery** in the TIED client.

---

## Vibe tests vs gates

| Surface | Proves | Does not prove |
| --- | --- | --- |
| Astryx **vibe-test** pass (internal harness) | Instruction helps sample codegen | Implement-complete on REQ |
| Convention / eslint plugins in DS repo | Style consistency in product | `tied_verify` enrollment |
| Storybook / docs examples | Human + agent reference | Checklist progression |
| **`tied_verify`** (when enrolled) | Tests vs REQ | UI vibe pass rates |
| Gate JSON receipts | Checklist progression | Meta convention test outcomes |

Use **`tied_checklist_gate_validate`** and enrolled **`tied_verify`** on separate schedules from vibe probes.

---

## Pair-read

1. [Meta Astryx design system × TIED](../../docs/comparisons/meta-astryx-design-system-vs-tied-agent-management.md) — primary Wave 2 analysis.
2. [Google Agent Skills × TIED](../../docs/comparisons/google-agent-skills-vs-tied-agent-management.md) — multi-skill catalog CI (distinct COG).
3. [Persante SDD × TIED](../../docs/comparisons/persante-sdd-skills-vs-tied-agent-management.md) — wiki feature specs (distinct COG).
4. [HPS authority-boundary operator checklist](../../tied-project/working/REQ-TIED_HARNESS_PLATFORM_SEAM/authority-boundary-operator-checklist.md).
5. [Harness platform taxonomy](../../tied-project/vocab/harness-platform-taxonomy.md) — design-system agent plane vs harness seam.

---

## CITDP prompt

Sponsor-facing bullets (paraphrase only; no vendor paste):

- Which plane owns this PR — **UI spec / record** vs **REQ-scoped code**?
- Are Astryx **`current`** records cited only in the product repo, not as TIED YAML substitutes?
- Where do **vibe-test** outcomes stop (instruction QA) vs **`tied_verify`** (delivery proof)?
- Is **`tied_config_get_base_path`** confirmed before project YAML writes?
- Are Meta scale / vibe anecdotes labeled **`not_measured`**?
- Is implement-complete backed by checklist gates — not vibe pass alone?

**Operator checklist:** [ds agent plane operator checklist](../../tied-project/working/REQ-TIED_META_ASTRYX_DESIGN_SYSTEM_WAVE3/ds-agent-plane-operator-checklist.md).

---

## Anti-patterns

| Anti-pattern | Why it fails | Remedy |
| --- | --- | --- |
| **Vibe pass = shipped** | Different proof class | `tied_verify` + gates |
| **`current` record = REQ** | No token graph | MCP REQ detail for delivery |
| **Astryx mandatory in stdd** | OutOfScope dependency | Compose in product repos only |
| **Meta scale as TIED proof** | Vendor marketing | **`not_measured`** |
| **init blocks overwrite `AGENTS.md` loader** | Breaks TIED bootstrap | Authority order in PR description |
| **Comparison prose mints tokens** | Policy violation | `add-feature` + MCP |

---

## Related documents

- [Client development index](client-development-index.md) — Quick reads row
- [Meta Astryx stub capture](../../docs/comparisons/meta-astryx-design-system.md)
- [AGENTS.md](../../AGENTS.md)