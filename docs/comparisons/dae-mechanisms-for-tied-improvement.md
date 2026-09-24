# DAE mechanisms worth incorporating into TIED

**Audience:** TIED methodology maintainers, MCP/agentstream implementers, and client project leads.

**Prerequisite:** High-level comparison in [`tied-vs-disciplined-agentic-engineering.md`](tied-vs-disciplined-agentic-engineering.md).

**Sources (TIED):** [`tied/docs/agent-req-implementation-checklist.md`](../../tied/docs/agent-req-implementation-checklist.md), [`tied/docs/pseudocode-writing-and-validation.md`](../../tied/docs/pseudocode-writing-and-validation.md), [`docs/checklist-adherence-improvement-plan.md`](../checklist-adherence-improvement-plan.md), [`docs/integrated-activation-checklist-enforcement-plan.md`](../integrated-activation-checklist-enforcement-plan.md).

**Sources (DAE):** [swingerman/engineer](https://github.com/swingerman/engineer) — `dae_handoff.py`, `dae_branch.py`, `dae_ontology.py`, `dae_mutmap.py`, `dae_arch.py`, and references `handoff-summary.md`, `ontology.md`, `gate-profile.md`, `express-lane.md`, `gauntlet.md`, `two-paths.md`, `review-panel.md`, `handoff-dispatch.md`.

**Last updated:** 2026-09-22

---

## Core complementarity

| Center of gravity | TIED | DAE |
| --- | --- | --- |
| Primary asset | MCP-addressable **semantic DB** (REQ / ARCH / IMPL + vocab + LEAP) | **Deterministic gates** (stdlib scripts, handoffs, dual-stream ATDD, mutation) |
| Agent contract | Long checklist + MCP validation + token discipline | Non-zero exit codes the agent cannot argue with |

Incorporating DAE patterns into TIED should **add enforcement scaffolding** without replacing the token graph, pseudo-code sidecars, or CITDP. LEAP and IMPL remain the logical source of truth; DAE-style tools make it harder to skip steps or self-certify in prose.

---

## 1. Agentic adherence to process

TIED already invests heavily in checklist gates (`tied_checklist_gate_validate`, Tracker dispositions, adherence ledger). Documented gaps include sparse Trackers, vague evidence refs, and agents claiming completion without machine receipts ([`checklist-adherence-improvement-plan.md`](../checklist-adherence-improvement-plan.md)).

### A. Step 0 entry gate (DAE pattern)

Every DAE checkpoint skill starts with:

```text
dae_handoff.py <feature-dir> --through N
dae_branch.py <feature-dir>
```

Non-zero exit → stop; do not proceed.

**TIED recommendation:** Expose a single CLI/MCP surface (e.g. `tied-cli.sh gate check --slug <checklist-slug> --phase <phase>`) that verifies:

- Prior slug disposition is `completed` or valid `waived` / `not_applicable` with contract evidence.
- Required receipts exist (gate JSON, adversarial pairing when depth requires it).
- Optional: branch name matches a CITDP or working-folder convention.

Agents should treat this like DAE Step 0: **no next checklist step until exit 0**.

### B. Handoff-as-gate with tool evidence

DAE handoffs require `exit_criteria[]` with `verified_by: tool` and **raw command output** in `evidence`, parsed by `dae_handoff.py`.

**TIED recommendation:** Align Tracker `evidence_refs[]` and gate receipts with a **handoff-shaped artifact** per phase (`pre_implementation`, `verification`, `close_out`): YAML frontmatter + list of criteria, each tied to a command and captured stdout/stderr hash. Reduces “tests passed” generic prose refs (already targeted by `RESOLVE_EVIDENCE_REFS` in Stage H).

### C. Branch hygiene (`dae_branch.py`)

DAE enforces feature branch at every checkpoint entry.

**TIED recommendation:** For REQ-scoped work, record `branch:` on CITDP or per-request Tracker; run a lightweight `git rev-parse` check at session-bootstrap and before `unit-test-red` / `verification-gate`. Honor a manifest-style opt-out for repos with manual git policy.

### D. Tunable autonomy and dispatch (`handoff-dispatch.md`)

DAE: `autonomy_level` (`low` | `medium` | `high`) plus **hard rules** for push, merge, PR, prod writes.

**TIED recommendation:** Add optional `autonomy_level` on CITDP or feature orchestration records. Map to agentstream behavior: `low` = confirm before next slug; `medium` = auto-advance with one-line notice; `high` = auto-advance until verification-gate. Never auto-push or auto-merge without explicit user rule (same as DAE external-write gate).

---

## 2. Pseudocode validation and alignment

TIED’s strength is [`essence_pseudocode`](../../tied/docs/pseudocode-writing-and-validation.md) with Layer A/B/C validation ([`pseudocode-validation-checklist.yaml`](../../tied/docs/pseudocode-validation-checklist.yaml)). DAE adds **deterministic joins** and **leakage** discipline that translate well.

### A. Closure joins (from `dae_ontology.py`)

DAE computes set difference: AC headings in `acs.md` vs `@AC-N` tags in Gherkin.

**TIED recommendation:** Extend PSA or `tied_validate_consistency` with a **four-way closure join** (mechanical, not LLM):

| Set A | Set B | Rule |
| --- | --- | --- |
| REQ `satisfaction_criteria` (or stable criterion ids) | IMPL `##` block names / token comments | Every criterion maps to ≥1 block |
| IMPL blocks | Test describe/it labels or block-lead copies | Every block has test anchor |
| IMPL blocks | Code block-lead comments | Every block has code anchor |
| Orphan blocks | — | Error |

Partial adoption: warn once if a project skips block-lead convention (mirrors DAE “zero `@AC-N` tags” warning).

### B. Implementation leakage guardian (from ATDD `spec-guardian`)

DAE Golden Rule: specs state *what* in domain language, not *how* (no routes, table names, internal classes).

**TIED recommendation:** Add a **pseudocode leakage** pass in `sub-pseudocode-validation-pass`: flag host-language syntax, framework types, SQL, HTTP paths, and file paths inside `essence_pseudocode` unless explicitly marked as DATA examples. Keep judgment (“is this block complete?”) in the agent; keep leakage in a script or MCP lint.

### C. Mechanical vs judgment split (`ontology.md`)

DAE runs enumerations, inverses, closure, disjoint roles in `dae_ontology.py`; domain-language quality stays in `consistency-check`.

**TIED recommendation:** Move Layer B **syntax and token-comment presence** checks into deterministic tooling; reserve agent/LLM passes for semantic completeness and collision detection between blocks.

---

## 3. TIED database and relational modeling

### A. Ontology-style constraints on the token graph

DAE constraint vocabulary: enumeration, functional (at-most-one), inverse, transitive (no cycles), disjoint, closure.

**TIED recommendation:** Extend `tied_validate_consistency` (or a sibling `tied_validate_ontology`):

- **Inverse:** `related_requirements.depends_on` ↔ reverse links where policy requires symmetry.
- **Transitive:** Tarjan SCC on ARCH/IMPL `depends_on` / `related_decisions` to flag cycles.
- **Functional:** one detail file per token; one pseudocode sidecar per IMPL.
- **Disjoint:** verification-gate runner identity ≠ implementer session id when adherence ledger records both (extends Principle 7).

No RDF store required—same rationale as DAE ontology doc.

### B. Size-dialed gate profiles and express lane (`gate-profile.md`, `express-lane.md`)

DAE `size` (XS–XL) drives `gate_profile.front` / `verify` and **express** one-pass lane for XS.

**TIED recommendation:** Add `size` and optional `gate_profile` to CITDP template:

| Size | TIED behavior (proposed) |
| --- | --- |
| **XS** | Express lane: minimal new tokens; inline CITDP diff; skip full ARCH churn if charter allows; still run `verification-gate` + consistency |
| **S–M** | Standard checklist; bundled human review at persist-implementation-records |
| **L–XL** | Full CITDP + integrated adversarial depth where policy requires; stricter evidence chain |

Charter-flagged paths (security, billing) never default to express—mirror DAE safety override.

### C. Charter check and amendment ADRs

DAE `plan.md` Charter Check: deviations require inline amendment ADR before CP5.

**TIED recommendation:** At `author-architecture` or CITDP risk-assessment, run a **compliance table** against immutable REQ category and project ARCH tokens. Touching immutable scope without a new ARCH record + human approval blocks `gate-pseudocode-validation`.

---

## 4. Testing and verification

### A. Differential mutation testing (`dae_mutmap.py`, CP8)

DAE: mutate source; tests must fail; cache keyed by function + covering tests + operator set.

**TIED recommendation:** Optional **`verification-gate`** step (or project charter flag):

- Run diff-scoped mutation on changed functions after unit/composition green.
- Commit cache manifest per repo (like `dae_mutmap`) for CI and agent loops.
- Distinct from IR-level acceptance mutator in DAE—TIED would start with **unit** mutation unless Gherkin acceptance is adopted per REQ.

Complements—not replaces—evidence chain profiles and adversarial inquiry.

### B. Diff-scoped CRAP (`crap-analyzer`)

CRAP score highlights complex, under-covered methods in the **diff**.

**TIED recommendation:** Invoke before `traceable-commit` on behavior-changing PRs; warn or block above threshold per CITDP. Suggest test stubs aligned to IMPL blocks and token comments.

### C. Architecture fitness (`dae_arch.py`)

Layering, import cycles, file size, naming vs manifest `architecture:` rules.

**TIED recommendation:** Map `ARCH-*` boundary decisions to machine-readable rules in client manifest (or `agent-preload-contract.yaml`); run `dae_arch`-style check at `verification-gate` when rules exist.

### D. Gauntlet loop (`gauntlet.md`)

Builder vs fresh critic against an **inspectable bar** (screenshot, golden file, reference module)—for qualities tests cannot assert.

**TIED recommendation:** Optional `gauntlet:` block on CITDP or IMPL detail for UI/CLI/report features; run after composition green, before E2E justification. Fits TIED’s “minimize E2E” stance by grading subjective fit without human-in-the-loop every round.

### E. Dual acceptance stream (DAE ATDD)

DAE requires acceptance + unit both green.

**TIED recommendation:** Where product needs domain-language acceptance, attach Gherkin + generated or hand-written acceptance tests **under a REQ token**, with traceability in REQ `validation_criteria`. Keep IMPL pseudo-code as internal logic spec; acceptance proves external behavior—reduces duplication if scenarios map to satisfaction criteria ids.

---

## 5. Workflow, UX, and multi-agent ergonomics

### A. Verification independence (disjoint verifier)

DAE ontology: verifier handoff `agent_id` ≠ implementer.

**TIED recommendation:** `verification-gate` and `tied_verify` runs should prefer **fresh subagent/session** (`agentstream_new_session: true` already hints this). Record both ids in adherence ledger; fail gate if same id without waiver.

### B. Review panel before code (`review-panel.md`)

Adviser + devil’s advocate on ACs and plan before implementation.

**TIED recommendation:** Optional integrated pass at **`author-architecture`** and **`gate-pseudocode-validation`**: short panel findings stored in CITDP or working folder—not canonical YAML—mirroring DAE `panel_findings`. Complements adversarial inquiry without replacing obligation graph.

### C. Prototype-first pivot (`two-paths.md`)

DAE: converge prototype → reverse-engineer ACs/spec/plan → in-place harden or rebuild.

**TIED recommendation:** Document **Track D (prototype)** in client-development-index: spike in code → LEAP reverse into REQ/ARCH/IMPL when converged; disposition `in-place` vs `rebuild` by CITDP `size`. Does not replace spec-first; adds funnel choice at `change-definition`.

### D. Single entry “what next” (`/engineer.next`)

DAE surveys tracker, handoffs, branches.

**TIED recommendation:** `tied-cli.sh next` (or MCP `tied_work_next`): given repo state, open CITDP, Tracker slug, and git branch, print **one** recommended checklist slug + REQ tokens. Reduces bootstrap friction vs cross-reading index + checklist copy.

---

## Summary matrix: incorporation priorities

| DAE mechanism | Target TIED layer | Expected benefit | Effort |
| --- | --- | --- | --- |
| Step 0 entry gates (handoff-style) | `[PROC-AGENT_REQ_CHECKLIST]`, MCP | Stops checklist drift; requires machine evidence | Low |
| Evidence-shaped handoffs | Tracker, gate receipts | Kills generic prose refs | Low–medium |
| Branch hygiene | session-bootstrap, TDD slugs | Fewer wrong-branch commits | Low |
| Autonomy + external-write gate | CITDP, agentstream | Predictable auto vs human pause | Low (policy + fields) |
| Pseudocode/REQ/test closure join | `[PROC-PSEUDOCODE_VALIDATION]`, PSA | Deterministic three-way alignment | Medium |
| Leakage lint on pseudo-code | `sub-pseudocode-validation-pass` | Keeps IMPL language-agnostic | Low |
| Ontology checks on YAML graph | `tied_validate_consistency` | Safer token graph | Medium |
| Express lane (XS) | `[PROC-CITDP]` | Less ceremony on tiny changes | Low (branching rules) |
| Charter compliance table | CITDP / author-architecture | Protects immutable ARCH/REQ | Low |
| Differential mutation | `verification-gate` | Proves tests catch bugs | Medium–high |
| Diff-scoped CRAP | pre-commit / verification-gate | Blocks complex untested diffs | Low (integrate tool) |
| `dae_arch`-style fitness | verification-gate | ARCH decisions enforced on imports | Medium |
| Gauntlet | composition / E2E slugs | Subjective quality without constant human grading | Medium |
| Disjoint verifier | verification-gate, adherence ledger | Less self-grading bias | Medium |
| Review panel (optional) | author-architecture, pre-RED | Catch bad plans early | Low (process) |
| Prototype-first track | change-definition | Fuzzy features without over-spec | Medium (docs + LEAP) |
| `tied next` | tied-cli / MCP | Operational UX | Medium |

---

## What not to copy blindly

| DAE artifact | Why partial adoption |
| --- | --- |
| Gherkin as **only** behavior IR | Conflicts with IMPL-as-logic; use as optional acceptance layer under REQ |
| Feature folder as **only** unit of work | TIED needs cross-cutting tokens; bind folders to REQ via CITDP/orchestration |
| Replace CITDP with handoffs only | TIED audit and LEAP feedback need persisted `CITDP-*.yaml` |
| Skip composition-before-wiring | DAE emphasizes dual streams; TIED composition evidence remains differentiator |
| Claude Code–only skills | Port **contracts** (handoff schema, gate scripts) via `tied-cli` and MCP, not slash commands |

---

## Suggested implementation sequence

1. **Quick wins:** branch check, leakage lint, CRAP on diff, express lane rules in CITDP template, `tied next` sketch.
2. **Adherence hardening:** Step 0 gate CLI aligned with existing `tied_checklist_gate_validate`; handoff-shaped exit criteria on phase receipts.
3. **Validation depth:** closure joins in PSA; mechanical/judgment split in pseudo-code validation docs + tooling.
4. **Verification:** optional mutation cache + disjoint verifier policy; gauntlet for UI/CLI REQ classes.
5. **Graph integrity:** ontology-style consistency checks; charter compliance at architecture authoring.

---

## Related documents

| Document | Role |
| --- | --- |
| [`tied-vs-disciplined-agentic-engineering.md`](tied-vs-disciplined-agentic-engineering.md) | Side-by-side methodology comparison |
| [`../checklist-adherence-improvement-plan.md`](../checklist-adherence-improvement-plan.md) | Current TIED adherence investments |
| [`../../tied/docs/LEAP.md`](../../tied/docs/LEAP.md) | Why IMPL stays authoritative when adopting DAE gates |

---

*Local analysis under `docs/comparisons/` (gitignored). Update when DAE or TIED gate tooling changes materially.*
