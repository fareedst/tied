# DAE mechanisms worth incorporating into TIED

**Role:** **Full-project coordinator guide** for multi-wave DAE→TIED adoption. This file holds status vocabulary, adoption snapshot, mechanism narratives, priority matrix, and “what not to copy.” **Executable waves, acceptance, and Tracker/CITDP** live in the linked plan [`working/REQ-TIED_DAE_INCORPORATION/PLAN.md`](../../working/REQ-TIED_DAE_INCORPORATION/PLAN.md) (**[REQ-TIED_DAE_INCORPORATION]**).

**Audience:** TIED methodology maintainers, MCP/agentstream implementers, and client project leads.

**Prerequisite:** Side-by-side methodology comparison in [`tied-vs-disciplined-agentic-engineering.md`](tied-vs-disciplined-agentic-engineering.md) (refreshed **2026-09-24** for all-Node suite, Claude harness, expanded MCP gates).

**Sources (TIED):** [`tied/docs/agent-req-implementation-checklist.md`](../../tied/docs/agent-req-implementation-checklist.md), [`tied/docs/pseudocode-writing-and-validation.md`](../../tied/docs/pseudocode-writing-and-validation.md), [`tied/docs/request-evidence-envelope.md`](../../tied/docs/request-evidence-envelope.md), [`docs/checklist-adherence-improvement-plan.md`](../checklist-adherence-improvement-plan.md), [`docs/integrated-activation-checklist-enforcement-plan.md`](../integrated-activation-checklist-enforcement-plan.md), [`claude-code-tied-multi-harness-plan.md`](claude-code-tied-multi-harness-plan.md), [`working/REQ-TIED_UNIFIED_TOOLCHAIN/PLAN.md`](../../working/REQ-TIED_UNIFIED_TOOLCHAIN/PLAN.md).

**Sources (DAE):** [swingerman/engineer](https://github.com/swingerman/engineer) — `dae_handoff.py`, `dae_branch.py`, `dae_ontology.py`, `dae_mutmap.py`, `dae_arch.py`, and references `handoff-summary.md`, `ontology.md`, `gate-profile.md`, `express-lane.md`, `gauntlet.md`, `two-paths.md`, `review-panel.md`, `handoff-dispatch.md`.

**Last updated:** 2026-09-24 (refine-plan pass 3 — W0–3 as-built status refresh)

### Status vocabulary (this document)

| Label | Meaning |
| --- | --- |
| **Current** | Shipped in this repo with tests or documented operator path |
| **Partial** | Some DAE-shaped behavior exists; gaps called out in subsection |
| **Gap** | Recommendation only — not evidenced as product behavior |

Primary traceability for **Current** adherence gates: `[REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]`, `[REQ-TIED_ADVERSARIAL_INQUIRY]`, stages G–O in [`checklist-adherence-improvement-plan.md`](../checklist-adherence-improvement-plan.md). Operator stack: **`tied`** umbrella CLI + TIED YAML MCP on **Node ≥18** (Go/Ruby checklist drivers retired).

---

## Core complementarity

| Center of gravity | TIED | DAE |
| --- | --- | --- |
| Primary asset | MCP-addressable **semantic DB** (REQ / ARCH / IMPL + vocab + LEAP) | **Deterministic gates** (stdlib scripts, handoffs, dual-stream ATDD, mutation) |
| Agent contract | Long checklist + MCP validation + token discipline + **machine gate receipts** | Non-zero exit codes the agent cannot argue with |

Incorporating DAE patterns into TIED should **add enforcement scaffolding** without replacing the token graph, pseudo-code sidecars, or CITDP. LEAP and IMPL remain the logical source of truth; DAE-style tools make it harder to skip steps or self-certify in prose.

**2026-09 note:** TIED now ports **contracts** (gates, ledger, envelopes) through **`tied mcp`**, **`tied-cli.sh`**, and **`tied agentstream`** on **Cursor and Claude**—not only Cursor slash skills. That does not replace DAE’s per-feature `dae_*.py`; it centralizes enforcement on the **Authoritative Tracker** and phase gate JSON under `working/{REQ}/`.

---

## Adoption snapshot (DAE mechanism → TIED today)

Shipped **Current** rows below are methodology-maintained (Wave 0 regression ownership in [`PLAN.md` § Artifacts](../../working/REQ-TIED_DAE_INCORPORATION/PLAN.md)). **Partial** / **Gap** rows are DAE-shaped targets for Waves 1–5 in the same plan.

| DAE mechanism | Status | TIED anchor |
| --- | --- | --- |
| Checklist phase gates (Node MCP) | **Current** | [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — `tied_checklist_gate_validate`, `tied_checklist_activation_collect`, `tied_adherence_reconcile_run` |
| Request evidence envelope (close-out) | **Current** | [REQ-REQUEST_EVIDENCE_ENVELOPE] — `request_evidence_envelope_build` / `validate` / `patch` / `batch_collect` |
| Dual harness + unified `tied` CLI | **Current** | [REQ-TIED_CLAUDE_HARNESS], [REQ-TIED_UNIFIED_TOOLCHAIN] — same TIED YAML MCP on Cursor + Claude |
| `tied agentstream` checklist driver | **Current** | `@tied/agentstream`, static `tiedpreflight` before live turns when enabled |
| Checkpoint exit blocked on script failure | **Current** | MCP gate (above) + **`tied gate check`** CLI composing `tied_checklist_gate_validate` ([REQ-TIED_DAE_INCORPORATION] W1a) |
| Handoff tool evidence | **Partial** | Gate JSON receipts; envelope v1; `RESOLVE_EVIDENCE_REFS`; **`tied handoff validate`** for additive `working/{REQ}/handoffs/*.yaml` (W1c) — envelope remains close-out authority |
| Branch at every step | **Current** | **`tied branch check`** + `tied gate check --check-branch` (hard fail on mismatch; W2a) |
| `autonomy_level` + external-write hard rules | **Partial** | AGENTS / user rules for push; no CITDP `autonomy_level` field yet |
| AC ↔ scenario closure join | **Partial** | **`pseudocode_analyze`** + `closure_join_report: true` four-way join (W3a); three-way checklist slugs remain |
| Leakage guardian | **Current** | **`pseudocode_validate`** `leakage_lint` (default on; W2b) |
| Ontology on artifact graph | **Current** | `tied_validate_consistency` + `ontology_rules: true` (W5a) |
| Express / size-dialed profiles | **Current** | CITDP `size` / `gate_profile` / `express_lane` validation (W2c) |
| Mutation + change-risk (CP7) + arch-check | **Partial** | Diff-scoped change-risk report **library** + checklist docs (W2d, default off; upstream CRAP metric); mutation/gauntlet — Wave 4 charter |
| Disjoint verifier | **Partial** | `agentstream_new_session` on checklist steps; ledger identity fields |
| Review panel | **Partial** | Adversarial inquiry + CITDP; not DAE `panel_findings` shape |
| `/engineer.next` | **Current** | **`tied next`** CLI (W1b) |
| Host-specific skills only | **Superseded** | Dual harness + same MCP; see §5 |

---

## 1. Agentic adherence to process

TIED invests in checklist gates (`tied_checklist_gate_validate`, `tied_checklist_activation_collect`, Tracker dispositions, adherence ledger, `tied_adherence_reconcile_run`). Documented gaps include sparse Trackers, vague evidence refs, and agents claiming completion without machine receipts ([`checklist-adherence-improvement-plan.md`](../checklist-adherence-improvement-plan.md)).

**Claude harness (Current):** [`REQ-TIED_CLAUDE_ADHERENCE_HOOKS`](../../tied/requirements/REQ-TIED_CLAUDE_ADHERENCE_HOOKS.yaml) bridges PostToolUse → `action_attempted` ledger rows (marker-gated)—DAE-like **tool attempt** telemetry, not full checkpoint handoffs.

### A. Step 0 entry gate (DAE pattern)

Every DAE checkpoint skill starts with:

```text
dae_handoff.py <feature-dir> --through N
dae_branch.py <feature-dir>
```

Non-zero exit → stop; do not proceed.

| | |
| --- | --- |
| **Status** | **Current** |
| **Current** | Run **`tied_checklist_gate_validate`** (MCP) or **`tied gate check`** (CLI) with Tracker + CITDP before advancing checklist work; optional **`--slug`** prior-step disposition + **`--check-branch`** (W2a). At integrated depth use **`tied_checklist_activation_collect`** when phase inquiry dirs exist. Reconcile ledger vs Tracker with **`tied_adherence_reconcile_run`** when policy requires. |
| **Gap** | Optional MCP mirror **`tied_gate_check`** and agentstream DAE pre-turn hook (IMPL tail — not shipped). |

Agents should treat gate **`allowed: false`** like DAE Step 0: **no next checklist step until exit 0**.

### B. Handoff-as-gate with tool evidence

DAE handoffs require `exit_criteria[]` with `verified_by: tool` and **raw command output** in `evidence`, parsed by `dae_handoff.py`.

| | |
| --- | --- |
| **Status** | **Partial** |
| **Current** | Phase **gate JSON** under `working/{REQ}/gates/`; Tracker **`evidence_refs[]`** with **`RESOLVE_EVIDENCE_REFS`** (denylist for generic prose); **`request_evidence_envelope_build` / `validate` / `patch`** for close-out packaging ([`request-evidence-envelope.md`](../../tied/docs/request-evidence-envelope.md)); verification manifests in evidence refs. |
| **Gap** | Automated population of handoff YAML from Tracker gate contracts (schema validate ships via **`tied handoff validate`**; operators still author criteria). |

### C. Branch hygiene (`dae_branch.py`)

DAE enforces feature branch at every checkpoint entry.

| | |
| --- | --- |
| **Status** | **Current** |
| **Shipped** | **`tied branch check`** and **`tied gate check --check-branch`** compare `git rev-parse --abbrev-ref HEAD` to CITDP `branch:` or Tracker `execution_evidence.branch`; opt-out via `.tied-yaml.yaml` `dae.branch_check: false` or CITDP `branch_check: skip`. |

### D. Tunable autonomy and dispatch (`handoff-dispatch.md`)

DAE: `autonomy_level` (`low` | `medium` | `high`) plus **hard rules** for push, merge, PR, prod writes.

| | |
| --- | --- |
| **Status** | **Partial** |
| **Current** | **`tied agentstream`** auto-advances checklist slugs per driver policy; **AGENTS.md** and user rules block auto-push/merge (DAE external-write analogue). |
| **Gap** | Optional **`autonomy_level`** on CITDP or feature orchestration mapping to confirm-vs-auto between slugs until `verification-gate`. |

---

## 2. Pseudocode validation and alignment

TIED’s strength is [`essence_pseudocode`](../../tied/docs/pseudocode-writing-and-validation.md) with Layer A/B/C validation ([`pseudocode-validation-checklist.yaml`](../../tied/docs/pseudocode-validation-checklist.yaml)). DAE adds **deterministic joins** and **leakage** discipline that translate well.

### A. Closure joins (from `dae_ontology.py`)

DAE computes set difference: AC headings in `acs.md` vs `@AC-N` tags in Gherkin.

| | |
| --- | --- |
| **Status** | **Partial** |
| **Current** | MCP **`pseudocode_validate`** / **`pseudocode_analyze`** (Layer C with `gate_mode`); checklist **`three-way-alignment-*`** slugs; binding inventory validators where adopted. |
| **Gap** | Richer REQ criterion id coverage in join reports for legacy REQs; core four-way join ships via **`pseudocode_analyze`** + `closure_join_report: true` (W3a). Reference join table: |

**TIED recommendation (extend PSA or consistency sibling):**

| Set A | Set B | Rule |
| --- | --- | --- |
| REQ `satisfaction_criteria` (or stable criterion ids) | IMPL `##` block names / token comments | Every criterion maps to ≥1 block |
| IMPL blocks | Test describe/it labels or block-lead copies | Every block has test anchor |
| IMPL blocks | Code block-lead comments | Every block has code anchor |
| Orphan blocks | — | Error |

Partial adoption: warn once if a project skips block-lead convention (mirrors DAE “zero `@AC-N` tags” warning).

### B. Implementation leakage guardian (from ATDD `spec-guardian`)

DAE Golden Rule: specs state *what* in domain language, not *how* (no routes, table names, internal classes).

| | |
| --- | --- |
| **Status** | **Current** |
| **Shipped** | MCP **`pseudocode_validate`** with **`leakage_lint`** (default on) flags host-syntax tokens in sidecars unless `DATA` example or `// leakage-ok:` (W2b). Judgment (“is this block complete?”) stays LLM/checklist. |

### C. Mechanical vs judgment split (`ontology.md`)

DAE runs enumerations, inverses, closure, disjoint roles in `dae_ontology.py`; domain-language quality stays in `consistency-check`.

| | |
| --- | --- |
| **Status** | **Partial** |
| **Current** | Layer B/C tooling and **`tied_validate_consistency`** for graph mechanics; domain vocab **VALIDATE** at commit. |
| **Gap** | — (W3b shipped: **`pseudocode-writing-and-validation.md`** § Mechanical checks vs LLM judgment) |

---

## 3. TIED database and relational modeling

### A. Ontology-style constraints on the token graph

DAE constraint vocabulary: enumeration, functional (at-most-one), inverse, transitive (no cycles), disjoint, closure.

| | |
| --- | --- |
| **Status** | **Current** |
| **Current** | **`tied_validate_consistency`** with optional **`ontology_rules: true`** (W5a): cycles, duplicate detail paths, inverse REQ advisories, disjoint ledger when supplied. |
| **Gap** | — (v1 rules shipped; further closure rules remain policy-driven) |

**TIED recommendation:**

- **Inverse:** `related_requirements.depends_on` ↔ reverse links where policy requires symmetry.
- **Transitive:** Tarjan SCC on ARCH/IMPL `depends_on` / `related_decisions` to flag cycles.
- **Functional:** one detail file per token; one pseudocode sidecar per IMPL.
- **Disjoint:** verification-gate runner identity ≠ implementer session id when adherence ledger records both (extends Principle 7).

No RDF store required—same rationale as DAE ontology doc.

### B. Size-dialed gate profiles and express lane (`gate-profile.md`, `express-lane.md`)

DAE `size` (XS–XL) drives `gate_profile.front` / `verify` and **express** one-pass lane for XS.

| | |
| --- | --- |
| **Status** | **Gap** |
| **TIED recommendation:** | Add `size` and optional `gate_profile` to CITDP template: |

| Size | TIED behavior (proposed) |
| --- | --- |
| **XS** | Express lane: minimal new tokens; inline CITDP diff; skip full ARCH churn if charter allows; still run `verification-gate` + consistency |
| **S–M** | Standard checklist; bundled human review at persist-implementation-records |
| **L–XL** | Full CITDP + integrated adversarial depth where policy requires; stricter evidence chain |

Charter-flagged paths (security, billing) never default to express—mirror DAE safety override.

### C. Charter check and amendment ADRs

DAE `plan.md` Charter Check: deviations require inline amendment ADR before CP5.

| | |
| --- | --- |
| **Status** | **Current** |
| **TIED recommendation:** | At `author-architecture` or CITDP risk-assessment, run a **compliance table** against immutable REQ category and project ARCH tokens. Touching immutable scope without a new ARCH record + human approval blocks `gate-pseudocode-validation` when `evidence.charterCompliance` is supplied to `tied_checklist_gate_validate` (W5b). |

---

## 4. Testing and verification

### A. Differential mutation testing (`dae_mutmap.py`, CP8)

| | |
| --- | --- |
| **Status** | **Gap** |
| **TIED recommendation:** | Optional **`verification-gate`** step (or project charter flag): diff-scoped mutation after unit/composition green; cache manifest per repo. Distinct from IR-level acceptance mutator in DAE—TIED would start with **unit** mutation unless Gherkin acceptance is adopted per REQ. Complements evidence chain profiles and adversarial inquiry. |

### B. Diff-scoped change-risk report (DAE CP7 / `crap-analyzer`)

| | |
| --- | --- |
| **Status** | **Partial** (library + checklist; default off) |
| **TIED recommendation:** | Preferred term **diff-scoped change-risk report** ([`tied/vocab/tied-methodology.md`](../../tied/vocab/tied-methodology.md)). Upstream **CRAP** = Change Risk Anti-Pattern score (complexity × coverage gap). Invoke before `traceable-commit` on behavior-changing PRs; warn or block above threshold per CITDP. |

### C. Architecture fitness (`dae_arch.py`)

| | |
| --- | --- |
| **Status** | **Gap** |
| **TIED recommendation:** | Map `ARCH-*` boundary decisions to machine-readable rules in client manifest; run at `verification-gate` when rules exist. |

### D. Gauntlet loop (`gauntlet.md`)

| | |
| --- | --- |
| **Status** | **Gap** |
| **TIED recommendation:** | Optional `gauntlet:` block on CITDP or IMPL detail; run after composition green, before E2E justification. |

### E. Dual acceptance stream (DAE ATDD)

| | |
| --- | --- |
| **Status** | **Gap** (optional per REQ) |
| **TIED recommendation:** | Gherkin + acceptance tests under a REQ token with traceability in `validation_criteria`; IMPL pseudo-code remains internal logic spec. |

---

## 5. Workflow, UX, and multi-agent ergonomics

### A. Verification independence (disjoint verifier)

DAE ontology: verifier handoff `agent_id` ≠ implementer.

| | |
| --- | --- |
| **Status** | **Partial** |
| **Current** | Checklist YAML **`agentstream_new_session`** on selected steps; adherence ledger session/event classes; **`tied_verify`** for verification-gated projects. |
| **Gap** | Hard gate failure when verification-gate runner id equals implementer id without waiver (policy + ledger check in `tied_checklist_gate_validate`). |

### B. Review panel before code (`review-panel.md`)

| | |
| --- | --- |
| **Status** | **Partial** |
| **Current** | CITDP + optional **adversarial inquiry** (integrated depth); non-canonical artifacts under `working/{REQ}/adversarial-inquiry/`. |
| **Gap** | Lightweight **panel_findings** block at `author-architecture` / pre-RED without full inquiry obligation graph. |

### C. Prototype-first pivot (`two-paths.md`)

| | |
| --- | --- |
| **Status** | **Gap** |
| **TIED recommendation:** | Document **Track D (prototype)** in client-development-index: spike → LEAP reverse into REQ/ARCH/IMPL; disposition `in-place` vs `rebuild` by CITDP `size`. |

### D. Single entry “what next” (`/engineer.next`)

| | |
| --- | --- |
| **Status** | **Current** |
| **Shipped** | **`tied next`** CLI: discovers Authoritative Tracker(s), prints **one** pending checklist **slug** in YAML order, open REQ tokens, CITDP draft phases, informational `current_branch` (W1b). |

### E. Multi-harness without forking gates (2026-09)

| | |
| --- | --- |
| **Status** | **Current** |
| **Shipped** | Same TIED YAML MCP and checklist vocabulary on **Cursor** and **Claude Code**; **`tied agentstream --harness claude`** for automated turns; interactive Prompt Composer on both. DAE-style **stdlib scripts per repo** remain complementary—TIED gates are **centralized on Tracker + MCP**, not duplicated as `.claude/` vs `.cursor/` Python. |

See [`claude-code-tied-multi-harness-plan.md`](claude-code-tied-multi-harness-plan.md) and client-development-index **multi-harness entry matrix**.

---

## Summary matrix: incorporation priorities

| DAE mechanism | Target TIED layer | Status | Expected benefit | Effort (remaining) |
| --- | --- | --- | --- | --- |
| Step 0 entry gates (handoff-style) | `[PROC-AGENT_REQ_CHECKLIST]`, MCP | **Current** | Stops checklist drift | Maintain |
| Evidence-shaped handoffs | Tracker, gate receipts, envelope | **Partial** | Kills generic prose refs | Low (auto handoff populate) |
| Branch hygiene | session-bootstrap, TDD slugs | **Current** | Fewer wrong-branch commits | Maintain |
| Autonomy + external-write gate | CITDP, agentstream | **Partial** | Predictable auto vs human pause | Low (policy + fields) |
| Pseudocode/REQ/test closure join | `[PROC-PSEUDOCODE_VALIDATION]`, PSA | **Partial** | Four-way join shipped (W3a); legacy REQ coverage | Low |
| Leakage lint on pseudo-code | `sub-pseudocode-validation-pass` | **Current** | Keeps IMPL language-agnostic | Maintain |
| Ontology checks on YAML graph | `tied_validate_consistency` | **Current** | Safer token graph | Maintain |
| Express lane (XS) | `[PROC-CITDP]` | **Current** | Less ceremony on tiny changes | Maintain |
| Charter compliance table | CITDP / author-architecture | **Current** | Protects immutable ARCH/REQ | Maintain |
| Differential mutation | `verification-gate` | **Gap** | Proves tests catch bugs | Medium–high |
| Diff-scoped change-risk report | pre-commit / verification-gate | **Partial** | Library + docs (W2d); auto hook after quality manifest not shipped | Medium (W4 or ops runbook) |
| `dae_arch`-style fitness | verification-gate | **Gap** | ARCH decisions enforced on imports | Medium |
| Gauntlet | composition / E2E slugs | **Gap** | Subjective quality without constant human grading | Medium |
| Disjoint verifier | verification-gate, adherence ledger | **Partial** | Less self-grading bias | Medium |
| Review panel (optional) | author-architecture, pre-RED | **Partial** | Catch bad plans early | Low |
| Prototype-first track | change-definition | **Gap** | Fuzzy features without over-spec | Medium |
| `tied next` | `tied` CLI / MCP | **Current** | Operational UX | Maintain |
| Dual harness, one gate surface | bootstrap, agentstream | **Current** | Same discipline on Cursor + Claude | — (maintain) |
| Claude tool-attempt bridge | adherence ledger | **Current** | DAE-like attempt telemetry | — (extend policy) |

---

## What not to copy blindly

| DAE artifact | Why partial adoption |
| --- | --- |
| Gherkin as **only** behavior IR | Conflicts with IMPL-as-logic; use as optional acceptance layer under REQ |
| Feature folder as **only** unit of work | TIED needs cross-cutting tokens; bind folders to REQ via CITDP/orchestration |
| Replace CITDP with handoffs only | TIED audit and LEAP feedback need persisted `CITDP-*.yaml` |
| Skip composition-before-wiring | DAE emphasizes dual streams; TIED composition evidence remains differentiator |
| **Claude Code–only** delivery | TIED now ships **dual harness** skills + MCP; still port **gate contracts** via MCP/`tied-cli`, not parallel slash-only taxonomies |
| Per-feature **stdlib Python only** | Valid for client apps; TIED **methodology repo** standardizes on **Node MCP** for gates—do not require every client to run Python DAE scripts to get checklist enforcement |

---

## Implementation sequence (waves 0–5)

Wave themes are unchanged from the **2026-09-24** revision; **slice IDs, dependencies, acceptance, and disposition log** are maintained only in the linked plan (do not duplicate here):

| Wave | Theme (summary) |
| --- | --- |
| **0** | Maintain shipped gates (checklist gate validate, envelope, dual harness, all-Node agentstream) |
| **1** | Adherence ergonomics (`gate check`, `tied next`, handoff-shaped phase YAML) |
| **2** | Quick wins (branch, leakage lint, change-risk on diff, express lane on CITDP) |
| **3** | Validation depth (four-way closure join, mechanical vs judgment doc split) |
| **4** | Verification charter optional (mutation, disjoint verifier, gauntlet) |
| **5** | Graph integrity (ontology-style consistency, charter compliance table) |

**Linked plan:** [`working/REQ-TIED_DAE_INCORPORATION/PLAN.md`](../../working/REQ-TIED_DAE_INCORPORATION/PLAN.md) · **REQ:** [REQ-TIED_DAE_INCORPORATION](../../tied/requirements/REQ-TIED_DAE_INCORPORATION.yaml)

**Build-plan entry:** W0–3 **closed** (as-built tables in PLAN). Remaining work: **W4–5** via `build-plan` — see PLAN § **Ready for `build-plan`** (refine-plan pass 3, 2026-09-24)—not duplicated here.

---

## Related documents

| Document | Role |
| --- | --- |
| [`working/REQ-TIED_DAE_INCORPORATION/PLAN.md`](../../working/REQ-TIED_DAE_INCORPORATION/PLAN.md) | **Executable** multi-wave program (Tracker, CITDP, wave acceptance) |
| [`tied-vs-disciplined-agentic-engineering.md`](tied-vs-disciplined-agentic-engineering.md) | Side-by-side methodology comparison (2026-09-24) — not the execution plan |
| [`claude-code-tied-multi-harness-plan.md`](claude-code-tied-multi-harness-plan.md) | Dual harness closure; operator smoke (separate program) |
| [`../checklist-adherence-improvement-plan.md`](../checklist-adherence-improvement-plan.md) | Shipped adherence investments (G–O) |
| [`../../tied/docs/LEAP.md`](../../tied/docs/LEAP.md) | Why IMPL stays authoritative when adopting DAE gates |
| [`../../working/REQ-TIED_UNIFIED_TOOLCHAIN/PLAN.md`](../../working/REQ-TIED_UNIFIED_TOOLCHAIN/PLAN.md) | All-Node operator suite |

---

*Local analysis under `docs/comparisons/` (gitignored). Update when DAE or TIED gate tooling changes materially.*
