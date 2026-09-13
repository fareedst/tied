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
| **fleet constraint v2 migration** | mass migration (alone) | Phased program elevating all TIED clients from header-only v2 to full constraint-language v2; see [`docs/pseudocode-constraint-v2-fleet-migration-grand-plan.md`](../../docs/pseudocode-constraint-v2-fleet-migration-grand-plan.md) |
| **legacy-v1 client sidecar** | headerless sidecar | Active sidecar without `Grammar-Version: v2`; v1-compatible parser path |
| **header-only-v2 client sidecar** | v2 header only | v2 header present; `constraint_flow` not required for this state |
| **constraint-ready-v2 client sidecar** | advisory constraint | v2 + contract precision + typed_flow; `constraint_flow` advisory with disclosed unknowns |
| **constraint-enforced-v2 client sidecar** | blocking constraint | `constraint_flow: true` with `constraint_gate_errors` per fleet policy on annotated procedures |
| **fleet-migrated-client** | migration complete (client) | All active sidecars at constraint-enforced-v2 or time-bounded waiver; auditable evidence—not header audit alone |
| **migration waiver** | constraint exception | Owner, reason, expiry, and next migration action for procedures/clients not yet enforceable |
| **annotation profile** | constraint tier target | Per-procedure target: contract-only, refinement, summary, alias/mutation, immutability |
| **constraint migration receipt** | migration receipt (alone) | Machine-readable Layer A/B/C + constraint_flow snapshot for one sidecar/fixture run; schema `constraint-migration-receipt.v1` ([Phase 2 plan](../../docs/pseudocode-constraint-v2-fleet-migration-phase-2-plan.md)) |
| **qualification green** | analyzer green (alone) | Tier A/B qualification harness pass at pinned methodology commit; does not imply fleet-migrated-client or header-only-v2 sufficiency |
| **F11 authoring burden gate** | F11 (alone) | Stop criteria on annotation load and semantic preservation before fleet-blocking constraint gates; measured via qualification annotation study |
| **pilot inventory instance** | pilots manifest (alone) | Populated `client-inventory-manifest.v1` rows for Phase 3 pilots only (e.g. `stdd-fleet-inventory-pilots-v1`); not full fleet registry |
| **migration dry-run** | dry-run migration (alone) | Planned assist-only sidecar edits with deterministic `dry_run_content_hash` before apply ([Phase 3 plan](../../docs/pseudocode-constraint-v2-fleet-migration-phase-3-plan.md)) |
| **G2 pilot receipt** | pilot receipt (alone) | `constraint-migration-receipt.v1` with `receipt_meta.gate_stage: G2` for pilot wave sidecars |
| **pilot migration wave** | sub-wave (alone) | Bounded ≤10 sidecars within one repo per OD-P3-3 before next sub-wave |

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
| Fleet client inventory manifest schema | `working/fleet-constraint-v2/client-inventory-manifest.v1.schema.json` | Phase 1 P1-D; [fleet migration phase 1 plan](../../docs/pseudocode-constraint-v2-fleet-migration-phase-1-plan.md) |
| Fleet client inventory template | `working/fleet-constraint-v2/client-inventory-manifest.v1.template.yaml` | Same; not evaluation-corpus.v1 (OD-8) |
| Fleet migration waiver schema | `working/fleet-constraint-v2/migration-waiver.v1.schema.json` | Same |
| Fleet migration waiver example | `working/fleet-constraint-v2/migration-waiver.v1.example.yaml` | P1-D fixture; not a populated registry |
| Fleet gate promotion stages | `working/fleet-constraint-v2/gate-promotion-stages.v1.yaml` | Same; OD-2 verification-first blocking |
| Constraint migration receipt schema | `working/fleet-constraint-v2/constraint-migration-receipt.v1.schema.json` | Phase 2 P2-D (2026-09-12); example + design note alongside schema |
| Constraint migration receipt example | `working/fleet-constraint-v2/constraint-migration-receipt.v1.example.json` | P2-D fixture; validates against receipt schema |
| Constraint migration receipt design note | `working/fleet-constraint-v2/constraint-migration-receipt.v1.md` | Collector semantics; inventory `last_receipt_path` in Phase 4 |
| Fleet constraint exemplars | `working/fleet-constraint-v2/exemplars/` | Phase 2 P2-E (2026-09-12); schema-valid receipts under `exemplars/receipts/` |
| F11/FP threshold record | `working/fleet-constraint-v2/f11-fp-thresholds.v1.yaml` | Phase 2 P2-G (2026-09-12); gates G2 prerequisites |
| Fleet G1 qualification summary | `working/PSEUDOCODE-CONSTRAINT-STUDY/qualification/fleet-g1/summary.json` | P2-F/P2-G harness; `qualification_green` at pin — not fleet-migrated-client |
| Rollback exercise G1 record | `working/fleet-constraint-v2/rollback-exercise-G1.v1.json` | P2-G simulated G2 → G1 advisory restoration |
| Phase 2 technical exit review | `working/fleet-constraint-v2/phase-2-exit-review.v1.json` | P2-H checklist + pointers; P2-C LEAP deferred |
| Phase 3 plan | `docs/pseudocode-constraint-v2-fleet-migration-phase-3-plan.md` | Pilot migration + tooling validation (2026-09-12) |
| Pilot inventory manifest instance | `working/fleet-constraint-v2/client-inventory-manifest.pilots.v1.yaml` | OD-P3-8; pilot repos only |
| Pilot migration workflow | `working/fleet-constraint-v2/pilots/pilot-migration-workflow.v1.md` | P3-D harness commands |
| stdd wave 1 sidecar list | `working/fleet-constraint-v2/pilots/stdd/wave-1-sidecars.yaml` | OD-P3-3 sub-wave |
| G2 pilot receipts | `working/fleet-constraint-v2/pilots/stdd/receipts/` | P3-E emit |
| G2 pilot rollback record | `working/fleet-constraint-v2/rollback-exercise-G2-pilots.v1.json` | P3-G |
| Phase 3 technical exit review | `working/fleet-constraint-v2/phase-3-exit-review.v1.json` | P3-H |
| Phase 4 plan | `docs/pseudocode-constraint-v2-fleet-migration-phase-4-plan.md` | G3 fleet waves (2026-09-12 refine) |
| Full fleet inventory manifest instance | `working/fleet-constraint-v2/client-inventory-manifest.v1.yaml` | OD-P4-2; distinct from pilots instance |
| Fleet wave partition | `working/fleet-constraint-v2/fleet-wave-partition.v1.yaml` | OD-P4-4; ordered waves + pins |
| Wave stop/go record | `working/fleet-constraint-v2/wave-stop-go.v1.json` | OD-P4-6; halt or complete per wave |
| Waiver registry instance | `working/fleet-constraint-v2/migration-waiver-registry.v1.yaml` | OD-P4-5; active waivers with expiry |
| G3 fleet receipt | `working/fleet-constraint-v2/waves/*/receipts/*.receipt.json` | `gate_stage: G3`; not G2 pilot receipts |
| Fleet dashboard aggregate | `working/fleet-constraint-v2/fleet-dashboard.v1.yaml` | Read-only inventory + receipt + waiver rollup |
| Migration tooling REQ | `tied/requirements/REQ-PSEUDOCODE_MIGRATION_TOOLING.yaml` | OD-P3-2 split |
| Migration tooling IMPL | `tied/implementation-decisions/IMPL-PSEUDOCODE_MIGRATION_TOOLING-pseudocode.md` | Harness scripts P3-D |
| Fleet migration orchestration IMPL | `tied/implementation-decisions/IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION-pseudocode.md` | [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION](../requirements/REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION.yaml) Phase 1 governance |
| Fleet migration CITDP | `tied/citdp/CITDP-REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION.yaml` | Integrated advisory pre_implementation 2026-09-12 |
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

## Phase 2 fleet constraint v2 — VALIDATE (2026-09-12)

**Touchpoint:** sub-vocabulary-sync VALIDATE at Phase 2 technical exit (P2-H).

| Term / artifact | Reconciled to |
|-----------------|---------------|
| **constraint migration receipt** | `working/fleet-constraint-v2/constraint-migration-receipt.v1.schema.json` (+ example, `.md` design note) |
| **qualification green** | `fleet-g1/summary.json` → `qualification_green: pass`; independent of **header-only-v2** and **fleet-migrated-client** |
| **F11 authoring burden gate** | `f11-fp-thresholds.v1.yaml` + metrics under `qualification/metrics/f11-fleet-20260912.yaml` |
| False-positive threshold (OD-P2-4) | `f11-fp-thresholds.v1.yaml` + `qualification/metrics/fp-fleet-20260912.json` |
| Rollback exercise (OD-P2-6) | `rollback-exercise-G1.v1.json`; per-entry receipts under `qualification/fleet-g1/rollback-exercise/` |
| Tier-3 exemplars (OD-P2-5) | `working/fleet-constraint-v2/exemplars/*.pseudocode.md` (copies, not production sidecars) |
| **fleet constraint v2 migration** (program) | Phase 2 exit = readiness to pilot only; see phase-2 plan state vs proof table |

**Exit record:** `working/fleet-constraint-v2/phase-2-exit-review.v1.json`.

## Phase 2 fleet constraint v2 — VALIDATE P2-C (2026-09-12)

**Touchpoint:** sub-vocabulary-sync VALIDATE after P2-C TIED persist.

| Token / criterion | Reconciled to |
|-------------------|---------------|
| **SC-FLEET-P2-001** | ARCH `governance_artifacts.constraint_migration_receipt_*`; receipt Layer A/B/C, `typed_flow`, `constraint_flow`, `unknown_summary` in schema |
| **SC-FLEET-P2-002** | `templates/impl-essence-pseudocode-template.md`; `working/fleet-constraint-v2/exemplars/` (≥3 profiles) |
| **SC-FLEET-P2-003** | `qualification/fleet-g1/summary.json`; manifest pin `48d1fbb+` |
| **SC-FLEET-P2-004** | `f11-fp-thresholds.v1.yaml`; `gate-promotion-stages.v1.yaml` G1 `prerequisites` |
| **SC-FLEET-P2-005** | `rollback-exercise-G1.v1.json`; config/receipt-only G1 restoration |
| **SC-GRAMMAR-V2-FLEET-AUTHORING-TARGET** | REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT satisfaction criterion; bootstrap Implemented unchanged until Phase 5 |

## Phase 3 fleet constraint v2 — VALIDATE (2026-09-12)

**Touchpoint:** sub-vocabulary-sync VALIDATE at Phase 3 technical exit (P3-H).

| Term / artifact | Reconciled to |
|-----------------|---------------|
| **pilot inventory instance** | `client-inventory-manifest.pilots.v1.yaml` (`stdd-fleet-inventory-pilots-v1`) |
| **migration dry-run** | `pilots/stdd/dry-run/inventory-diff.v1.json` + `dry_run_content_hash` |
| **G2 pilot receipt** | `pilots/stdd/receipts/*.receipt.json` with `gate_stage: G2` |
| **pilot migration wave** | `pilots/stdd/wave-1-sidecars.yaml` (≤10 sidecars) |
| **SC-FLEET-P3-001..006** | REQ satisfaction criteria; ARCH `governance_artifacts` Phase 3 paths |
| **REQ-PSEUDOCODE_MIGRATION_TOOLING** | `tied/requirements/REQ-PSEUDOCODE_MIGRATION_TOOLING.yaml` + harness scripts |
| **fleet constraint v2 migration** (program) | Phase 3 exit = pilot workflow validated; not fleet-migrated-client for all repos |

**Exit record:** `working/fleet-constraint-v2/phase-3-exit-review.v1.json`.

---

## Phase 4 fleet constraint v2 — RECORD (2026-09-12 P4-C)

**Touchpoint:** sub-vocabulary-sync RECORD at P4-C TIED persist.

| Term / artifact | Preferred definition |
|-----------------|----------------------|
| **fleet wave partition** | `working/fleet-constraint-v2/fleet-wave-partition.v1.yaml` — ordered waves with gate_stage G3 |
| **full fleet inventory instance** | `client-inventory-manifest.v1.yaml` (`stdd-fleet-inventory-v1`) distinct from pilots instance |
| **phase_4_enrollment** | `enrolled_phase_4` \| `not_enrolled_phase_4` on inventory rows; OD-P4-3 five-repo exit set |
| **wave stop/go** | Append-only `wave-stop-go.v1.json` per OD-P4-6 |
| **G3 fleet receipt** | `gate_stage: G3`, `constraint_flow: true` under `working/fleet-constraint-v2/waves/` |
| **SC-FLEET-P4-001..006** | REQ satisfaction criteria; ARCH `governance_artifacts` Phase 4 paths |
| **dual track (Phase 4/5)** | Legacy clients G3 until fleet-migrated-client (Track A **done** for OD-P4-3); **non-enrolled tranche** + **new-client bootstrap enforcement** (Track B/C) — Phase 5 plan |

**Exit record (machinery):** `working/fleet-constraint-v2/phase-4-exit-review.v1.json` (P4-H 2026-09-12).

---

## Phase 4 fleet constraint v2 — VALIDATE (2026-09-12 P4-H)

**Touchpoint:** sub-vocabulary-sync VALIDATE at Phase 4 machinery exit (P4-H) and M4 closeout (seq 9, 2026-09-13); five-repo **fleet-migrated-client** program exit complete — Phase 5 refine next.

| Term / artifact | Reconciliation |
|-----------------|----------------|
| **fleet wave partition** | Matches `fleet-wave-partition.v1.yaml` (14 waves; 6 complete per dashboard) |
| **full fleet inventory instance** | `stdd-fleet-inventory-v1`; `phase_4_enrollment` on five clients; aggregates honest (no fleet-migrated-client on enrolled rows) |
| **phase_4_enrollment** | stdd + 1789177584 + 1789069630 + 1789136889 + 1789147101 enrolled; manifest remainder `not_enrolled_phase_4` |
| **wave stop/go** | Six `go` records in `wave-stop-go.v1.json` (W-stdd-1 G2 + W-stdd-2 + four W-ext-*) |
| **G3 fleet receipt** | Under `waves/stdd/` and `waves/{client_id}/`; distinct from `pilots/` G2 paths — no drift |
| **fleet dashboard** | `fleet-dashboard.v1.yaml` rollups align with inventory + partition pending wave count |
| **SC-FLEET-P4-001..006** | Present in REQ/ARCH; SC satisfaction for **machinery** not equated to fleet-migrated-client |

**Drift notes:** None material — RECORD terms match code (`run-fleet-g3-wave.ts`, `run-fleet-p4-g-closeout.ts`) and working artifacts. **M4 closeout (2026-09-13):** enrolled OD-P4-3 set at `fleet-migrated-client`; CITDP `phase_4_closeout_module` run_id `fleet-migration-phase4-closeout-20260913`. **Proof boundary:** G3 receipt + stop/go ≠ `fleet-migrated-client` until sidecar states and waivers say so (still true for non-enrolled manifest rows).

---

## Phase 5 fleet constraint v2 — RECORD (2026-09-13 P5-A refine)

**Touchpoint:** sub-vocabulary-sync RECORD at Phase 5 grand-plan refine.

| Term / artifact | Preferred definition |
|-----------------|----------------------|
| **G4 (gate stage)** | [`gate-promotion-stages.v1.yaml`](../../working/fleet-constraint-v2/gate-promotion-stages.v1.yaml) stage `G4` — default enforcement: `ci_expectations` (`header_and_contract_defaults_for_new_clients`, `stale_waiver_checks`); `constraint_gate_errors.pre_red` blocking on qualifying paths; CI wiring Phase 5 build |
| **bootstrap enforcement** | New TIED clients via `copy_files.sh` + template default to **constraint-enforced-v2** after G4 LEAP amend [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT](../requirements/REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT.yaml); distinct from Track A header-only Implemented behavior until promotion |
| **non-enrolled tranche** | **18** manifest `client_id` rows with `phase_4_enrollment: not_enrolled_phase_4` in [`client-inventory-manifest.v1.yaml`](../../working/fleet-constraint-v2/client-inventory-manifest.v1.yaml); optional Phase 5b G3 program (OD-P5-2); not G4 bootstrap scope |
| **dual track (Phase 5)** | **A** enrolled legacy (5 repos, fleet-migrated-client) → G4 governance; **B** non-enrolled tranche; **C** new-client bootstrap |
| **phase_5_module** | CITDP append on [`CITDP-REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION.yaml`](../citdp/CITDP-REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION.yaml) run_id `fleet-migration-phase5-p5c-20260913` — G4 CI scope, continuous audit, FEAT envelope policy, dual-track falsification |
| **SC-FLEET-P5-001..002** | Forward-looking program SC on closed orchestrator REQ (doc falsification + CITDP persist); bootstrap SC on **REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT** as **SC-GRAMMAR-V2-PHASE5-CONSTRAINT-ENFORCED-BOOTSTRAP** |
| **FEAT-spawned REQ envelope** | Integrated request evidence envelope on feature REQs (OD-P5-4); checklist template `templates/agent-req-checklist-feat-spawned-phase5.v1.yaml`; validator under `scripts/validate-feat-spawned-envelope-policy*`; **not** fleet migration receipt |
| **fleet program doc** | Canonical methodology doc [`pseudocode-constraint-v2-fleet-program.md`](../../docs/pseudocode-constraint-v2-fleet-program.md) — policy, status, maintenance, NB-1; per-phase narrative plans removed from tree (2026-09-13) |
| **program-status.v1.yaml** | Rolling counts and next batch gate under `working/fleet-constraint-v2/` — not client migration history |
| **NB-1 (Track B tranche zero)** | First sponsor-gated batch on `not_enrolled_phase_4` clients; plan [`pseudocode-constraint-v2-fleet-nb1-plan.md`](../../docs/pseudocode-constraint-v2-fleet-nb1-plan.md) |
| **OD-P5-2 acceptance JSON** | `working/fleet-constraint-v2/od-p5-2-acceptance.v1.json` — amends deferred tranche decision; schema `od-p5-2-acceptance.v1.schema.json` |
| **phase 5 program exit** | stdd methodology slice complete (G4, bootstrap, enrolled regression) — **not** full fleet migration |

**VALIDATE (2026-09-13 doc prune):** Fleet terms align with [`pseudocode-constraint-v2-fleet-program.md`](../../docs/pseudocode-constraint-v2-fleet-program.md) and TIED SC rows. Track B (**18** rows) not fleet-migrated. Client migration evidence belongs in **client repos**, not stdd `working/`.

## NB-1 Track B tranche zero — RECORD (2026-09-13 refine)

**Touchpoint:** sub-vocabulary-sync RECORD at NB-1 refine pass.

| Term / artifact | Preferred definition |
|-----------------|----------------------|
| **Track B tranche zero** | Synonym **NB-1** — max five `not_enrolled_phase_4` clients per OD-P5-2 acceptance |
| **OD-P5-2 acceptance JSON** | Sponsor gate; `orchestrator_reverify` must be **false** |
| **wave-1 client selection** | Manifest-driven; prefer single **header-only-v2** sidecar rows |
| **nb1_tranche_zero_module** | CITDP module on closed orchestrator CITDP — not a new REQ token |
| **phase 5 complete vs fleet complete** | Exit report `phase_5_program_exit` vs 18 remaining Track B rows |
| **NB-1-C..E** | Client-repo migration lifecycle: REQ spawn → execute → close_out/receipt export (stdd does not hold durable client archives) |
| **OD-NB1-1..3** | Sponsor open decisions in NB-1 plan §1.4 (wave IDs, tooling row, tranche size) |

**VALIDATE (2026-09-13 refine v2):** Terms match NB-1 plan §1.3–§4, acceptance schema/template, and tracker `nb1_executable_steps`.

---

## Alphabetical index

| Term | Section |
|------|---------|
| annotation profile | Preferred terms |
| binding inventory | Preferred terms |
| constraint-enforced-v2 client sidecar | Preferred terms |
| constraint migration receipt | Preferred terms |
| constraint-ready-v2 client sidecar | Preferred terms |
| F11 authoring burden gate | Preferred terms |
| G2 pilot receipt | Preferred terms |
| migration dry-run | Preferred terms |
| pilot inventory instance | Preferred terms |
| pilot migration wave | Preferred terms |
| fleet constraint v2 migration | Preferred terms |
| qualification green | Preferred terms |
| fleet-migrated-client | Preferred terms |
| header-only-v2 client sidecar | Preferred terms |
| legacy-v1 client sidecar | Preferred terms |
| migration waiver | Preferred terms |
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
