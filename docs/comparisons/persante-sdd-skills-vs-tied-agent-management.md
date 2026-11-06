# Persante SDD skills × TIED agent management — comparison

| Field | Value |
| --- | --- |
| **Purpose** | Map **Persante**’s wiki/spec-driven skills (external clone) to **TIED** as implemented in this repository; state **alignments**, **composable** overlays, **tensions**, **gaps**, and **deferrals**; recommend **compose-don’t-replace**. Does **not** mint REQ/ARCH/IMPL. |
| **Audience** | Sponsors, methodology owners, plan authors, agent operators |
| **Source study** | Developer clone: `/Users/fareed/Documents/persante/repos/ticketing-platform/.claude/skills/persante-*/` · [artifact-contract.md](file:///Users/fareed/Documents/persante/repos/ticketing-platform/.claude/skills/persante-sdd-workflow/references/artifact-contract.md) · Persante summary: [persante-sdd-skills.md](persante-sdd-skills.md) |
| **TIED anchors** | [LEAP](../../tied-bundle/docs/LEAP.md), [processes](../../tied-bundle/docs/processes.md), [AGENTS.md](../../AGENTS.md) |
| **Status** | Analysis document; does not mint REQ/ARCH/IMPL tokens |
| **Last updated** | 2026-11-06 |

**Sibling docs:** [Methodology composition matrix](methodology-composition-matrix.md), [TIED × well-known methodologies](tied-vs-well-known-methodologies.md), [Persante SDD skills summary](persante-sdd-skills.md)

---

## Executive summary

**Persante SDD** optimizes **repo-local feature folders** (`wiki/specs/NNN-<slug>/`), a **developer-interviewed** specification, a concrete **solution + task DAG**, **bounded alignment and review loops**, and a **hosted-Git handoff** (in the reference skills: a **Bitbucket** pull request plus API-backed **`verify-pr`**) as the delivery record. **TIED** optimizes a **semantic registry** of **REQ/ARCH/IMPL** with **[PROC-LEAP]** and **[PROC-TIED_DEV_CYCLE]** discipline, **IMPL `essence_pseudocode`** as the implementation contract anchor, **MCP-first** project YAML where applicable, and methodology-wide **gates** and **consistency** checks (`tied_validate_consistency` / checklist machinery) defined in [AGENTS.md](../../AGENTS.md).

**Compose-don’t-replace:** You can run Persante-shaped **wiki traceability** inside a product repo **and** keep TIED’s **intent stack** as the system of record, but they answer different questions. Persante does not provide TIED’s merged **methodology ∪ project** YAML model or IMP pseudo-code token discipline; TIED does not ship **Persante’s** `workflow.py`, host-specific **`verify-pr`** automation, or **Azure dev deploy** scripts as core methodology. For **provider-agnostic** hosted Git **env identity** and PR/MR **compose** with [client-pr-handoff-fields.v1](../../tied-bundle/templates/client-pr-handoff-fields.v1.example.yaml), see [client-hosted-git-extension-appendix.md](../../tied-bundle/docs/client-hosted-git-extension-appendix.md) (Bitbucket is one example stack, not the default TIED remote).

**Proof boundary:** This comparison is anchored to a **developer machine path** for Persante skills. Neither methodology “wins” here; the matrices record honest fit, not effectiveness rankings.

---

## Complementarity

| Center of gravity | Persante SDD (external skills) | TIED (this repo) |
| --- | --- | --- |
| **Primary artifact** | `wiki/specs/…` markdown + `tasks.json` under version control | **REQ/ARCH/IMPL** indexes + detail files + optional IMP pseudo-code sidecars |
| **Requirements capture** | **`persante-spec`** interview → **`spec.md`** with stable `FR-*` / `AC-*` | Sponsor-facing REQ tokens; CITDP/plan skills; **[PROC-VOCABULARY_INDEX]** RESOLVE/PRELOAD |
| **Design & planning** | **`solution.md`** + **`V-*`** verification plan | **ARCH-* decisions**; IMP approach fields; **contract vocabulary** in active procedures ([implementation-decisions guide](../../tied-bundle/docs/implementation-decisions.md)) |
| **Pre-code alignment** | **`persante-align`** reports + cap on attempts | Checklist **pre_implementation** / pseudo-code validation / MCP gates (where enabled) |
| **Implementation order** | Task graph + optional parallel **worktrees**; evidence in `evidence/` | **[PROC-TIED_DEV_CYCLE]**: unit tests first, composition tests before wiring, E2E when justified |
| **Review model** | Mandatory **independent** reviewer agent (`persante-validate`) | Depth-gated **adversarial inquiry**, optional tools (e.g. review skills); human **sponsor** accountability ([sponsor-agent-relationship](../../tied-project/vocab/sponsor-agent-relationship.md)) |
| **Delivery record** | **Hosted Git** PR/MR + API-style **verify** summary (Persante reference: Bitbucket) | Client CI and git host are **defer** by default ([tied-vs-well-known-methodologies](tied-vs-well-known-methodologies.md)); TIED adds traceability **proof**; optional compose: [client-hosted-git-extension-appendix.md](../../tied-bundle/docs/client-hosted-git-extension-appendix.md) |
| **Methodology learning** | Repo wiki ingest + decisions pages | **[PROC-LEAP]**, Kaizen loop, LEAP proposals, evidence-chain / pilot machinery (where project enables) |

---

## Touchpoint 1 — RESOLVE (Persante → TIED vocabulary)

| Persante term / artifact | TIED preferred analogue | Notes |
| --- | --- | --- |
| **`spec.md` / `FR-*` / `AC-*`** | **REQ** slice + acceptance-oriented statements | Persante IDs are **markdown-local**; TIED uses **`REQ-*`** registry entries and detail YAML — not automatically the same namespace |
| **`solution.md` / `V-*`** | **ARCH-* / IMPL** detail + verification story | TIED’s strongest pre-code contract for **logic** is often **IMPL `essence_pseudocode`** — **not 1:1** with Persante’s solution headings |
| **`tasks.json` / `T###`** | Plan artifacts, checklist steps, or working-folder task lists | TIED does not mandate a single `tasks.json` schema project-wide |
| **`persante-align` report** | **Pre-implementation** gate + traceability check | TIED may use MCP/checklist tools; different receipts |
| **`RF-*` findings** | Review/triage findings, inquiry obligations | Persante encodes severity/disposition in **repo JSON**; TIED may use different storage ([fidelity-research](../../tied-project/vocab/fidelity-research.md)) |
| **`verify-pr` (hosted Git; Bitbucket in Persante reference)** | **Defer** to client DevOps + CI | TIED’s comparative stance keeps the **host** client-owned unless a REQ scopes it; generic compose notes in [client-hosted-git-extension-appendix.md](../../tied-bundle/docs/client-hosted-git-extension-appendix.md) |
| **`persante-ship`** orchestration | **`build-plan`** / agent checklist tracks (full TIED) vs **non-tied** sequences | Different authority boundaries and forbidden actions |

### Disposition key (this document)

| Disposition | Meaning |
| --- | --- |
| **Align** | Same intent is already a first-class TIED concern (possibly different mechanics). |
| **Composable** | Side-by-side without claiming equivalence. |
| **Tension** | Both partly true; operator must choose an authority order. |
| **Gap** | Persante emphasizes something TIED core does not fully automate. |
| **Defer** | Intentionally out of TIED core (client host, cloud tenancy, etc.). |

---

## Primary phase matrix (Persante spine × TIED loop)

Rough **loop** mapping: **L1** product correctness/traceability, **L2** human process and review, **L3** methodology learning. Rows reference [Persante SDD skills summary](persante-sdd-skills.md).

| Persante phase | Loop | TIED center of gravity | Disposition | One-line rationale |
| --- | --- | --- | --- | --- |
| **persante-spec** (interview → `spec.md`) | L1–L2 | **REQ** capture; **[PROC-VOCABULARY_INDEX]**; sponsor intent | **Composable** | Same “confirm intent before build” idea; different storage and token rules |
| **persante-solution** (`solution.md`, `V-*`, tasks) | L1 | **ARCH/IMPL** planning; IMP approach; pseudo-code entry criteria | **Tension** | Persante solution doc ≠ TIED **IMPL `essence_pseudocode`** obligation |
| **persante-align** | L1 | **Pre_implementation** gate; pseudo-code validation; traceability | **Composable** | Both block silent drift; different evidence shape |
| **persante-implement** | L1 | **[PROC-TIED_DEV_CYCLE]** test ordering; module validation mandate | **Align** (intent) **Tension** (parallelism rules) | TDD discipline matches; Persante adds optional **multi-agent worktrees** |
| **persante-validate** (independent reviewer) | L1–L2 | **Adversarial inquiry** (depth-gated); sponsor/reviewer roles | **Composable** | Both seek independent challenge; mechanisms differ |
| **persante-triage** | L2 | Finding disposition; costly vs reversible choices | **Composable** | Persante encodes deferral rules in workflow JSON |
| **Wiki ingest** (post-pass) | L2–L3 | **Working artifact placement**; committed vs local evidence ([working-artifact-placement](../../tied-bundle/docs/working-artifact-placement.md)) | **Tension** | Persante freezes spec folder after ingest; TIED has broader **tied-project/working** norms |
| **persante-ship** + `verify-pr` | L2 | Client CI / PR host (**Defer**); traceability proof via tests + YAML gates | **Defer** (host) + **Composable** (evidence idea) | TIED does not mandate a specific host or `verify-pr`; see hosted Git extension appendix |
| **persante-sdd-workflow** (`workflow.py`) | L1 | **`tied-cli` / TIED YAML MCP** for deterministic mutations | **Gap** (host-specific helpers) | Both automate checks; different substrates (wiki vs YAML DB) |
| **Infra skills** (lint / what-if / dev deploy) | L2 | **Defer** infra; **[REQ-TIED_ENVIRONMENT_VARIABLE_POLICY]**-class concerns in clients | **Defer** | Tenancy and cloud operations are client-owned |

---

## Honest gaps (what neither side should pretend)

| Topic | Persante emphasis | TIED emphasis |
| --- | --- | --- |
| **Intent registry** | Markdown + JSON in `wiki/specs/` | **Merged** methodology ∪ project **YAML**; MCP writes scoped to **`tied-project/`** ([AGENTS.md](../../AGENTS.md)) |
| **Implementation contract** | `solution.md` + `V-*` + tasks | **IMPL `essence_pseudocode`** with **[PROC-IMPL_PSEUDOCODE_TOKENS]** comment discipline |
| **Consistency proof** | `workflow.py validate`, graph invariants | **`tied_validate_consistency`**, `lint_yaml`, checklist receipts |
| **Review independence** | **Mandatory** second agent for `persante-validate` | **Optional** tooling; depth-gated **adversarial inquiry** when REQ applies |
| **Delivery surface** | **Hosted Git** PR/MR + API-backed **verify** (Bitbucket in Persante) | Host-agnostic; [client-hosted-git extension](../../tied-bundle/docs/client-hosted-git-extension-appendix.md); compare [Claude Code review × TIED](claude-code-team-code-review-vs-tied.md) **Defer** rows |
| **Fork / portability** | Persante `persante-sdd-workflow` forked **99063e7** (2026-10-31) | TIED **`tied-install.sh`** refreshes **read-only** `tied-bundle/` |

---

## Suggested compose stance (non-binding)

- Use **Persante** skills when the **product repo** already centers on **`wiki/specs/`** and you want **PR-local** traceability with **hosted-Git** verification (the reference skills use **Bitbucket**). For TIED-shaped **compose** without adopting Persante, use [client-hosted-git-extension-appendix.md](../../tied-bundle/docs/client-hosted-git-extension-appendix.md) + [client-devops-integration-appendix.md](../../tied-bundle/docs/client-devops-integration-appendix.md).
- Use **TIED** when you need **cross-repository** methodology inheritance, **REQ/ARCH/IMPL** as the **authority graph**, and **deterministic** YAML evolution via MCP.
- If both apply, **pick a single authority** for “what must be true before merge” (TIED tokens vs Persante artifacts) and mirror identifiers only where it pays the carrying cost.
