# Pseudocode and CITDP (canonical)

**Scope:** Distinction between **domain vocabulary** (`tied/vocab/`) and **IMPL grammar vocabulary** (INPUT/OUTPUT/DATA/CONTROL, PRE/POST/EFFECTS/FAILURE_MODES/DATA_TRANSITION/TERMINATION); three-way alignment; pseudo-code validation; CITDP record naming; checklist per-request copy conventions. **Vocabulary only** — validation algorithms in [`../docs/pseudocode-writing-and-validation.md`](../docs/pseudocode-writing-and-validation.md) and [`../docs/processes.md`](../docs/processes.md).

**Traceability:** [PROC-PSEUDOCODE_VALIDATION](../docs/processes.md) · [PROC-CITDP](../docs/processes.md) · [PROC-IMPL_PSEUDOCODE_TOKENS](../docs/processes.md) · [PROC-IMPL_CODE_TEST_SYNC](../docs/processes.md) · [PROC-VOCABULARY_INDEX](../docs/processes.md) · [REQ-TIED_SETUP](../requirements/REQ-TIED_SETUP.yaml)

**See also:** [`routing.md`](routing.md) (PRELOAD primary entry) · [`domain-references.md`](domain-references.md) (full catalog, on-demand) · [`tied-methodology.md`](tied-methodology.md) · [`../docs/citdp-policy.md`](../docs/citdp-policy.md) · [`../docs/pseudocode-format-and-practices.md`](../docs/pseudocode-format-and-practices.md)

---

## Domain vocabulary vs IMPL grammar (critical)

| Layer | Location | Governs |
|-------|----------|---------|
| **Domain vocabulary** | `tied/vocab/*.md` | Which **name** a concept has (REQ token suffix, file path, UPPER_SNAKE block name, UI label) |
| **IMPL grammar vocabulary** | [`../docs/implementation-decisions.md`](../docs/implementation-decisions.md) § Preferred vocabulary | How a **block** is written (INPUT, OUTPUT, DATA, CONTROL, PRE, POST, EFFECTS, FAILURE_MODES, DATA_TRANSITION, TERMINATION, ON, IF, AWAIT, …) |

Checklist **`sub-vocabulary-sync`** uses **domain** vocab. Do not conflate with INPUT/OUTPUT/DATA/PRE/POST/EFFECTS keywords.

---

## Preferred terms vs synonyms

| Preferred | Avoid | Notes |
|-----------|-------|-------|
| **essence_pseudocode** | pseudocode body, impl code | Canonical behavior spec; sidecar preferred |
| **pseudo-code sidecar** | md detail | `tied/implementation-decisions/IMPL-*-pseudocode.md` |
| **block lead comment** | header comment | First comment on each block; literal-copy to tests/code |
| **three-way alignment** | sync | IMPL block lead ↔ test comment ↔ code comment |
| **UPPER_SNAKE block name** | procedure name (ambiguous) | Preferred **domain** term becomes block identifier |
| **CITDP record** | citdp file | `tied/citdp/CITDP-*.yaml` |
| **per-request checklist copy** | checklist yaml | Never run completion against canonical checklist in `tied/docs/` |
| **vocabulary layer** | glossary-only documentation, terminology notes (alone) | Peer agent-control layer that resolves, preloads, records, and validates canonical domain terms; see [`tied-methodology.md`](tied-methodology.md) |
| **agent-control layer** | agent guidance (alone), vocabulary policy (alone) | Vocabulary control layer alongside semantic tokens and IMPL pseudo-code; owned by [PROC-VOCABULARY_INDEX](../docs/processes.md) |
| **LEAP** | stack update | Reverse order IMPL → ARCH → REQ when scope changes |
| **block-lead bracket format** | token comment line | Exact pattern: `[IMPL-*] [ARCH-*] [REQ-*]` then `How: …` (IMPL, ARCH, REQ order when all three appear) |
| **contract precision** | precise contracts, extended contract | Active-block PRE/POST/EFFECTS (+ FAILURE_MODES/DATA_TRANSITION/TERMINATION when applicable); Layer B SHAPE-003..006 |
| **binding inventory** | glue list (alone) | Trigger→callee→arguments→effect table; see [`../docs/composition-coverage.md`](../docs/composition-coverage.md) and [`tied-methodology.md`](tied-methodology.md) |
| **composition evidence** | E2E covers wiring | UI-free composition test proving a binding before integration |
| **SHAPE-003** | — | Schema check: Active procedure blocks declare PRE, POST, EFFECTS |
| **SHAPE-004** | — | Schema check: FAILURE_MODES closed set when errors are possible |
| **SHAPE-005** | — | Schema check: DATA_TRANSITION when mutable DATA or State effects |
| **SHAPE-006** | — | Schema check: TERMINATION when recursion / WHILE / open-ended wait |
| **sub-vocabulary-sync RESOLVE** | lookup vocab | Before naming/writing: map fuzzy terms to one preferred term in `tied/vocab/*.md` |
| **sub-vocabulary-sync PRELOAD** | read full catalog at bootstrap | Before reading TIED/docs/code: read [`routing.md`](routing.md), match keywords, open only matched glossaries ([PROC-VOCABULARY_INDEX] Touchpoint 2) |
| **sub-vocabulary-sync RECORD** | update vocab | After artifacts change: add preferred-term rows, naming bridges, alphabetical index entries |
| **sub-vocabulary-sync VALIDATE** | skip vocab audit | Before commit: audit names in docs/tokens/code against `tied/vocab/` ([PROC-VOCABULARY_INDEX] Touchpoint 3) |
| **pseudo-code static analysis** | static analysis (alone), deep validator | Deterministic read-only CFG/call-graph/abstract pipeline via `pseudocode_analyze`; distinct from Layer B `pseudocode_validate` ([REQ-PSEUDOCODE_STATIC_ANALYSIS]) |
| **analysis report** | analyze output (alone) | Versioned `pseudocode-analysis-report.v1` from `pseudocode_analyze` |
| **Layer C static analysis gate** | PSA gate, mandatory static analysis | Mandatory `pseudocode_analyze` invocation with `gate_mode: true` after Layers A and B and before RED tests |
| **gate_mode** | strict analysis mode | Analyzer control that makes error diagnostics and truncation fail the report; it does not change parse/input fatal shapes |
| **pre-psa-grammar** | PSA grammar waiver | N/A disposition for unchanged legacy procedure blocks; it is not a waiver for a changed file submitted to the file-scoped gate |
| **file-scoped analysis input** | block-only gate input | Current Layer C submits a complete sidecar per changed IMPL; deterministic block extraction is a separate follow-on |
| **grammar version** | parser version (alone) | Declared closed subset key e.g. `pseudocode-grammar.v1` |
| **program CFG** | CFG (alone) | Per-procedure control-flow graph from pseudo-code IR; not TIED dependency graph |
| **pseudo-code call graph** | call graph (alone) | CALL/RUN edges between pseudo-code procedures; distinct from TIED dep graph and GRAPH-001 checklist row |
| **proof boundary** | proof limit (alone) | Explicit claim limit per report section; mandatory on analysis reports |
| **unknown policy** | unknown handling (alone) | First-class unknown/truncation disclosure with cause and span; never implicit success |
| **evidence-chain analyze opt-in** | analyze structural row (alone) | `invoke_pseudocode_analyze` on `evidence_chain_profile_generate` adds bounded `pseudocode_analyze` rows for scoped `IMPL-*` tokens when `invoke_structural_validators` is true; default false preserves prior structural snapshots |
| **shared parser primitives** | parser unification (alone) | `pseudocode-shared.ts` owns token/procedure/contract scan helpers consumed by Layer B validator and analysis parser ([REQ-PSEUDOCODE_PARSER_UNIFICATION]) |
| **typed-flow** | type checking pass (alone) | Optional Layer C pass after abstract analysis when `typed_flow: true`; emits `sections.typed_flow` ([REQ-PSEUDOCODE_TYPED_FLOW]) |
| **type environment** | type map (alone) | Per-procedure map of names to `TypeFact` during typed-flow transfer |
| **CFG join** | merge at join point (alone) | Typed-flow merge of predecessor type facts at control-flow join points |
| **shape tag** | record shape (alone) | Tier-2 structural tag on DATA/contract values (record fields, `list of T`) |
| **typed diagnostic** | type error (alone) | Codes in `sections.typed_flow.diagnostics`; warning by default, error when Phase 3 promotion applies |
| **typed gate error** | typed blocking diagnostic (alone) | Error-severity typed diagnostic that fails `gate_mode` on an annotated procedure only |
| **annotated procedure** | typed procedure (alone) | Procedure with ≥1 Tier-2 contract TypeTag or structured typed expression in body |
| **typed_gate_errors flag** | typed blocking flag (alone) | Analyzer/MCP flag: defaults **effective true** when `gate_mode && typed_flow`; explicit `false` opts out to warnings-only |
| **severity promotion** | typed error promotion (alone) | Warning→error for proven TYPE_MISMATCH/NULL_FLOW/SHAPE_MISMATCH/CALL_TYPE_MISMATCH/JOIN_INCOMPATIBLE on annotated procedures |
| **prose-only guard** | unannotated guard (alone) | Prose-only procedures never emit typed gate errors; warnings and unknowns only |
| **pilot corpus** | typed fixtures (alone) | Labeled cases 1–17 under `mcp-server/src/analysis/fixtures/typed-flow/` |
| **Tier-1 behavioral** | behavioral contract (alone) | Authoritative PRE/POST/EFFECTS/control flow; typed-flow never replaces |
| **Tier-2 optional types** | type annotation (alone) | Additive `: type` clauses on contract values; prose-only rows valid |
| **qualification manifest** | client cohort registry (alone) | `working/PSEUDOCODE-CONSTRAINT-STUDY/qualification/manifest.yaml` read-only client panel |
| **input_identity** | sidecar hash (alone) | SHA-256 of sidecar bytes in analysis report and qualification manifest |
| **annotation burden gate** | F11 gate (alone) | Stop criteria on annotation lines/decisions and semantic preservation (SP-1..SP-7) |
| **constraint-language** | full constraints (alone) | Design class B pass after typed-flow; refinements, summaries, alias/mut policy, solver ([REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]) |
| **grammar v2** | pseudocode v2 (alone) | Opt-in surface syntax in `pseudocode-grammar.v2.md`; header `Grammar-Version: v2` |
| **grammar version boundary** | v2 opt-in (alone) | Declarative header selects v2 parser; v1 default when absent |
| **refinement predicate** | refinement (alone) | Boolean constraint on types/values; case 12 unlock |
| **procedure summary** | interproc summary (alone) | Compact CALL/RETURN effect description for fixed-point solver |
| **constraint solver** | fixed-point solver (alone) | Interprocedural iteration with `ConstraintAnalysisBudgets` and truncation disclosure |
| **alias policy** | aliasing policy (alone) | Declared reference-equality rules; unknown when absent (case 11) |
| **immutability policy** | mutation policy (alone) | `(immutable)` / `(mutable)` on DATA rows; case 8 |
| **constraint_flow flag** | constraint analyze flag (alone) | Analyzer/MCP opt-in; requires `typed_flow: true` (Q7) |
| **constraint_gate_errors flag** | constraint blocking flag (alone) | Phased 3a–3d promotion; defaults **effective true** when `gate_mode && typed_flow && constraint_flow`; explicit `false` opts out (Slice 8 close-out) |
| **constraint-annotated procedure** | constraint procedure (alone) | Procedure with refinement/summary/alias/immutability/predicate annotations |
| **solver truncation unknown** | solver budget unknown (alone) | Budget-exceeded disclosure in `sections.constraint_language.solver_metadata` |
| **constraint corpus** | CL fixtures (alone) | ≥40 labeled fixtures under `fixtures/constraint-language/` |
| **new-project grammar v2 default** | grammar v2 everywhere | Policy that newly generated TIED sidecars include `Grammar-Version: v2`; legacy sidecars remain v1-compatible |
| **grammar_v2_header audit dimension** | header check | Independent cohort/audit result for generated header presence; not proof of Layer B, Layer C, or runtime behavior |
| **sidecar block-lead sweep** | comment cleanup (alone) | Phased normalization of procedure block-lead comments to internal placement across `tied/implementation-decisions/` ([REQ-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP]) |
| **external block-lead** | pre-procedure comment | `# [IMPL\|ARCH\|REQ` lines immediately above a `procedure` heading; invisible to naive block scanners |
| **inter-procedure block-lead leak** | between-procedure comment | Trailing `# [IMPL\|ARCH\|REQ` in the gap before the next procedure; attaches to wrong body under half-open scan |
| **block-lead inventory** | placement audit JSON | Machine-readable `--check` output from `normalize-sidecar-block-leads.mjs` listing `external_only` and `inter_procedure` counts per file |
| **internal block-lead placement** | in-body comment rule | Block-lead must appear inside the procedure body after the heading and before `Contract:` |
| **combined hygiene close-out** | multi-track close-out (alone) | Step 7 process orchestration closing Tracks A/C/B under one proposed commit; no new product REQ ([docs/pseudocode-grammar-v2-and-hygiene-plan.md](../../docs/pseudocode-grammar-v2-and-hygiene-plan.md) §Step 7) |
| **capstone envelope** | integrated envelope (alone) | Track B `request-evidence-envelope.v1.json` after verification + close_out inquiry runs; `--envelope-blocking` unified runner target |
| **single combined commit** | one feat commit (alone) | Sponsor policy: one proposed commit message spanning grammar-v2 default, validator hardening, and sidecar sweep; `commit_deferred` in close-out handoff |

---

## Naming bridge: artifacts

| Concept | Storage path | Process token |
|---------|--------------|---------------|
| Canonical checklist | `tied/docs/agent-req-implementation-checklist.yaml` | [PROC-AGENT_REQ_CHECKLIST](../docs/processes.md) |
| Per-request checklist | `<working_folder>/REQ-{TOKEN}_{timestamp}.yaml` | same |
| IMPL sidecar | `tied/implementation-decisions/IMPL-{TOKEN}-pseudocode.md` | [PROC-IMPL_PSEUDOCODE_TOKENS](../docs/processes.md) |
| Pseudo-code template | `templates/impl-essence-pseudocode-template.md` | [PROC-PSEUDOCODE_VALIDATION](../docs/processes.md) |
| CITDP record | `tied/citdp/CITDP-REQ-{TOKEN}.yaml` (pattern) | [PROC-CITDP](../docs/processes.md) |
| Validation checklist | `tied/docs/pseudocode-validation-checklist.yaml` | [PROC-PSEUDOCODE_VALIDATION](../docs/processes.md) |
| Static analysis checklist | `tied/docs/pseudocode-static-analysis-checklist.yaml` | [PROC-PSEUDOCODE_VALIDATION](../docs/processes.md) |
| Grammar v1 guide | `tied/docs/pseudocode-grammar.v1.md` | [REQ-PSEUDOCODE_STATIC_ANALYSIS](../requirements/REQ-PSEUDOCODE_STATIC_ANALYSIS.yaml) |
| Grammar v2 default requirement | `REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT` | [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT](../requirements/REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT.yaml) |
| Grammar v2 default sidecar | `tied/implementation-decisions/IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT-pseudocode.md` | [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT](../implementation-decisions/IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT.yaml) |
| Sidecar block-lead sweep requirement | `REQ-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP` | [REQ-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP](../requirements/REQ-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP.yaml) |
| Block-lead sweep sidecar | `tied/implementation-decisions/IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP-pseudocode.md` | [IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP](../implementation-decisions/IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP.yaml) |
| Normalize sidecar block-leads script | `scripts/normalize-sidecar-block-leads.mjs` | [IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP](../implementation-decisions/IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP.yaml) |
| Combined hygiene close-out orchestration | `working/pseudocode-hygiene-closeout/agent-req-implementation-checklist.yaml` | Process-only; [PROC-AGENT_REQ_CHECKLIST](../docs/processes.md) |
| Combined close-out CITDP addendum (draft) | `working/pseudocode-hygiene-closeout/CITDP-combined-hygiene-close-out.yaml` | Non-product process record; not `tied/citdp/CITDP-REQ-*` |
| Composition coverage guide | `tied/docs/composition-coverage.md` | [REQ-MODULE_VALIDATION](../requirements/REQ-MODULE_VALIDATION.yaml) / [PROC-TEST_STRATEGY](../docs/processes.md) |
| Domain vocab index | `tied/vocab/*.md` | [PROC-VOCABULARY_INDEX](../docs/processes.md) |
| Vocab routing index (PRELOAD) | `tied/vocab/routing.md` | [PROC-VOCABULARY_INDEX](../docs/processes.md) |

---

## IMPL grammar keywords (catalog)

Prefer in `essence_pseudocode` (not domain terms):

| Keyword | Use |
|---------|-----|
| `INPUT` / `OUTPUT` / `DATA` / `CONTROL` | Block I/O and optional env/ordering (`CONTROL` = flags/env/ordering — **not** the contract keyword `EFFECTS`) |
| `PRE` / `POST` | Preconditions / postconditions (required on new/changed Active procedure blocks) |
| `EFFECTS` | Contract effect row: `pure` or named (`IO`, `Http`, `State`, `Async`, `DB`, `Exn`, `Random`, `Diverge`, …). Distinct from step-level SEND/BROADCAST/RETURN and from `CONTROL`. |
| `FAILURE_MODES` | Closed set of named error variants (when errors are possible) |
| `DATA_TRANSITION` | Before→after rules for mutable DATA / State |
| `TERMINATION` | `total` or `may_diverge` (loops/recursion/open wait) |
| `ON` / `WHEN` | Event/trigger |
| `IF` / `ELSE` | Branch |
| `FOR` / `WHILE` | Iteration |
| `RETURN` / `ON error` | Step-level outcomes (names must match `FAILURE_MODES` when required) |
| `AWAIT` / `Promise` | Async boundary (also reflect `Async` in `EFFECTS` when awaiting) |
| `procedure NAME` | Named procedure heading (`procedure` / `function` / `block` + `UPPER_SNAKE:`) — **not** list-item `PROCEDURE:` |
| `SWITCH` / `CASE` | Multi-way branch (`SWITCH expr:` / `CASE label:`) |
| `CALL UPPER_SNAKE(...)` | Internal pseudo-code call; callee must resolve for Layer C gate pass |
| `RUN external_target` | External target invocation (not resolved to internal procedures) |
| `target := value` | Assignment step |
| `Layer C static analysis checklist` | [pseudocode-static-analysis-checklist.yaml](../docs/pseudocode-static-analysis-checklist.yaml) — PSA-GATE-001..004 |
| `grammar v1 author guide` | [pseudocode-grammar.v1.md](../docs/pseudocode-grammar.v1.md) |

**Migration:** Untouched legacy Active blocks may omit precision keywords with Layer B N/A `pre-contract-grammar` until next edit. See [`../docs/implementation-decisions.md`](../docs/implementation-decisions.md) and [`../docs/pseudocode-validation-checklist.yaml`](../docs/pseudocode-validation-checklist.yaml).

---

## CITDP naming

| Element | Convention |
|---------|------------|
| File prefix | `CITDP-` |
| REQ linkage | Include primary `REQ-*` token in filename or record body |
| Write tool | `citdp_record_write` when MCP available |
| Policy | See [`../docs/citdp-policy.md`](../docs/citdp-policy.md) |

---

## Pseudo-code block names

| Preferred term | UPPER_SNAKE block | Owning PROC/IMPL |
|----------------|-------------------|------------------|
| Vocabulary resolve | `sub-vocabulary-sync` (checklist sub-procedure slug) | [PROC-VOCABULARY_INDEX](../docs/processes.md) |
| New-project grammar default selection | `SELECT_NEW_PROJECT_GRAMMAR_DEFAULT` | [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT](../implementation-decisions/IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT.yaml) |
| Sidecar version classification | `CLASSIFY_SIDECAR_VERSION` | [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT](../implementation-decisions/IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT.yaml) |
| New-client grammar audit | `AUDIT_NEW_CLIENT_GRAMMAR` | [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT](../implementation-decisions/IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT.yaml) |
| Block-lead placement inventory | `SCAN_BLOCK_LEAD_PLACEMENT` | [IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP](../implementation-decisions/IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP.yaml) |
| External block-lead normalization | `NORMALIZE_EXTERNAL_BLOCK_LEAD` | [IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP](../implementation-decisions/IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP.yaml) |
| Inter-procedure block-lead normalization | `NORMALIZE_INTER_PROCEDURE_BLOCK_LEAD` | [IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP](../implementation-decisions/IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP.yaml) |
| Wave sweep orchestration | `APPLY_WAVE_SWEEP` | [IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP](../implementation-decisions/IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP.yaml) |
| Authoring guidance sync | `SYNC_AUTHORING_GUIDANCE` | [IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP](../implementation-decisions/IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP.yaml) |
| (domain-specific blocks live in sibling glossaries) | — | — |

---

## Alphabetical index

| Term | Section |
|------|---------|
| binding inventory | Preferred terms |
| agent-control layer | Preferred terms |
| block lead comment | Preferred terms |
| block-lead bracket format | Preferred terms |
| CITDP record | Preferred terms |
| composition evidence | Preferred terms |
| composition-coverage.md | Naming bridge |
| contract precision | Preferred terms |
| CONTROL | IMPL grammar keywords |
| DATA_TRANSITION | IMPL grammar keywords |
| domain vocabulary | Domain vs grammar |
| EFFECTS | IMPL grammar keywords |
| essence_pseudocode | Preferred terms |
| FAILURE_MODES | IMPL grammar keywords |
| IMPL grammar vocabulary | Domain vs grammar |
| LEAP | Preferred terms |
| per-request checklist copy | Preferred terms |
| POST | IMPL grammar keywords |
| PRE | IMPL grammar keywords |
| pre-contract-grammar | IMPL grammar keywords |
| pseudo-code sidecar | Preferred terms |
| routing.md | Naming bridge |
| SHAPE-003 | Preferred terms |
| SHAPE-004 | Preferred terms |
| SHAPE-005 | Preferred terms |
| SHAPE-006 | Preferred terms |
| sub-vocabulary-sync | Pseudo-code blocks |
| sub-vocabulary-sync PRELOAD | Preferred terms |
| sub-vocabulary-sync RECORD | Preferred terms |
| sub-vocabulary-sync RESOLVE | Preferred terms |
| sub-vocabulary-sync VALIDATE | Preferred terms |
| TERMINATION | IMPL grammar keywords |
| three-way alignment | Preferred terms |
| UPPER_SNAKE block name | Preferred terms |
| analysis report | Preferred terms |
| grammar version | Preferred terms |
| program CFG | Preferred terms |
| proof boundary | Preferred terms |
| pseudo-code call graph | Preferred terms |
| pseudo-code static analysis | Preferred terms |
| unknown policy | Preferred terms |
| Layer C static analysis gate | Preferred terms |
| gate_mode | Preferred terms |
| pre-psa-grammar | Preferred terms |
| file-scoped analysis input | Preferred terms |
| typed-flow | Preferred terms |
| type environment | Preferred terms |
| CFG join | Preferred terms |
| shape tag | Preferred terms |
| typed diagnostic | Preferred terms |
| pilot corpus | Preferred terms |
| Tier-1 behavioral | Preferred terms |
| Tier-2 optional types | Preferred terms |
| qualification manifest | Preferred terms |
| input_identity | Preferred terms |
| annotation burden gate | Preferred terms |
| AUDIT_NEW_CLIENT_GRAMMAR | Pseudo-code blocks |
| alias policy | Preferred terms |
| constraint corpus | Preferred terms |
| constraint solver | Preferred terms |
| constraint-annotated procedure | Preferred terms |
| constraint_flow flag | Preferred terms |
| constraint_gate_errors flag | Preferred terms |
| constraint-language | Preferred terms |
| grammar v2 | Preferred terms |
| grammar version boundary | Preferred terms |
| grammar_v2_header audit dimension | Preferred terms |
| immutability policy | Preferred terms |
| new-project grammar v2 default | Preferred terms |
| procedure summary | Preferred terms |
| refinement predicate | Preferred terms |
| solver truncation unknown | Preferred terms |
| SELECT_NEW_PROJECT_GRAMMAR_DEFAULT | Pseudo-code blocks |
| CLASSIFY_SIDECAR_VERSION | Pseudo-code blocks |
| APPLY_WAVE_SWEEP | Pseudo-code blocks |
| capstone envelope | Preferred terms |
| combined hygiene close-out | Preferred terms |
| block-lead inventory | Preferred terms |
| external block-lead | Preferred terms |
| inter-procedure block-lead leak | Preferred terms |
| internal block-lead placement | Preferred terms |
| NORMALIZE_EXTERNAL_BLOCK_LEAD | Pseudo-code blocks |
| NORMALIZE_INTER_PROCEDURE_BLOCK_LEAD | Pseudo-code blocks |
| SCAN_BLOCK_LEAD_PLACEMENT | Pseudo-code blocks |
| sidecar block-lead sweep | Preferred terms |
| single combined commit | Preferred terms |
| SYNC_AUTHORING_GUIDANCE | Pseudo-code blocks |
| Vocab routing index | Naming bridge |
| vocabulary layer | Preferred terms |
