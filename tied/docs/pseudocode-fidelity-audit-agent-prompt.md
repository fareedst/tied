# IMPL Pseudo-Code Fidelity & Completeness Audit — Agent Prompt

**Process tokens:** `[PROC-PSEUDOCODE_VALIDATION]`, `[PROC-IMPL_PSEUDOCODE_TOKENS]`, `[PROC-IMPL_CODE_TEST_SYNC]`, `[PROC-LEAP]`.

**When to use:** A TIED **client** project already has **IMPL `essence_pseudocode`**, **production code**, and **automated tests**, and you want to **measure how faithfully each pseudo-code block describes the implemented behavior**. The audit answers one question per block: *is this block a **reliable** and **complete** transform of the tests and code built from it?* It produces a **report** first (Stages 0–4, read-only), then applies **LEAP** fixes for confirmed gaps (Stage 5).

- **Reliable transform** = every statement in the block (INPUT/OUTPUT/DATA, each PROCEDURE step, each branch, each error path, each delegation) is **true** of the code that implements it and the tests that assert it — no contradictions, no stale or removed steps, no mis-ordered control flow.
- **Complete transform** = every behavior actually present in the **code** (branches, early returns, returned/thrown errors, side effects, delegated calls) and every assertion/edge case present in the **tests** is **represented** by a statement in the block — nothing is missing.

**When not to use:** Greenfield REQ work (pseudo-code before tests) → [agent-req-implementation-checklist.md](agent-req-implementation-checklist.md) Track A. Authoring or refreshing missing/stale sidecars *from* code → [impl-pseudocode-from-code-agent-prompt.md](impl-pseudocode-from-code-agent-prompt.md) (Track C). This audit assumes pseudo-code **exists** and asks how good it is; the retrofit prompt assumes it is **absent** and writes it.

**Canonical references:** [pseudocode-writing-and-validation.md](pseudocode-writing-and-validation.md) (definition, block leads, three-way alignment, phases A–I, validation layers), [pseudocode-validation-checklist.yaml](pseudocode-validation-checklist.yaml) (Layer B; profile **`agent_req_checklist_post_test`** because executable tests exist), [templates/impl-essence-pseudocode-template.md](../../templates/impl-essence-pseudocode-template.md), [processes.md](processes.md) (`[PROC-LEAP]`, `[PROC-IMPL_CODE_TEST_SYNC]`).

---

## Copy-paste prompt (give this block to the agent)

The series runs in **stages**. Each stage emits a named artifact. **Stages 0–4 are read-only analysis** and end in a report; **Stage 5 applies LEAP fixes** and must not start until the Stage 4 report is reviewed/confirmed. If the operator only wants the analysis, stop after Stage 4.

```text
Observing AI principles!

You are auditing the FIDELITY of existing TIED IMPL essence_pseudocode against the tests and production code built from it. Tests and code are the behavioral evidence (ground truth of what the system does); the IMPL pseudo-code is the language-agnostic specification whose quality you are measuring. For each logical pseudo-code block you decide whether it is a RELIABLE and COMPLETE transform of the tests and code:

- RELIABLE  = every pseudo-code statement is true of the code/tests (no contradiction, no stale step, no wrong branch/order/delegation).
- COMPLETE  = every code behavior and every test assertion is represented by a pseudo-code statement (no missing branch, error path, side effect, delegation, or edge case).

A block PASSES only when it is both reliable AND complete. Stages 0-4 produce a report and change nothing. Stage 5 applies LEAP fixes for confirmed gaps; do not begin Stage 5 until the Stage 4 report is reviewed.

## Stage 0 — Preflight & scope (read-only)

1. Call tied_config_get_base_path (or tied-cli equivalent) and confirm TIED_BASE_PATH points at THIS repository's tied/ directory. If wrong, stop and report.
2. Read AGENTS.md obligations: [PROC-IMPL_PSEUDOCODE_TOKENS], MCP-first reads for indexes/detail, do not edit tied/methodology/.
3. Choose audit scope: an IMPL token set, a module boundary, or a change request. Keep scope small enough that inventory tables stay accurate (one IMPL set or module per session).
4. Rule of evidence: passing tests and shipped code are authoritative over stale pseudo-code. Never "confirm" a pseudo-code statement that the code/tests contradict — flag it instead.

Emit: scope statement (IMPL tokens in scope) and confirmed base path.

## Stage 1 — Inventory & block decomposition (read-only)

For each in-scope IMPL token:
- Read IMPL-{TOKEN}.yaml (traceability.tests, code_locations, cross_references, related_decisions) via yaml_detail_read.
- Read the sidecar tied/implementation-decisions/IMPL-{TOKEN}-pseudocode.md (or merged essence_pseudocode).
- Split the sidecar into logical blocks (typically one Markdown ## section = one block). Record each block's lead line(s) ([PROC-IMPL_PSEUDOCODE_TOKENS]).
- Locate the test locus (describe/it, test function, fixture) and the production locus (function/module/region) for each block. Grep [IMPL-*], [REQ-*], [ARCH-*] in tests and code to anchor loci.

Emit the INVENTORY TABLE (one row per block):

  | IMPL | Block (## heading) | Block lead tokens | Test locus (file:region) | Code locus (file:region) | Loci found? |

Stop Stage 1 when every in-scope block has a mapped test locus and code locus (or an explicit "not found", which is itself a finding).

## Stage 2 — Reliability audit: no false statements (read-only)

For EACH block, walk every statement and verify it against the code/tests:
- Contract: do pseudo-code INPUT/OUTPUT/DATA match the actual function signature, return shape, and shared data? (Layer B CONTRACT-001, CONTRACT-002)
- Procedure steps: does each step correspond to a real action in the code, in the same order? Flag steps describing logic that no longer exists (stale) or that runs in a different order.
- Branches: does each IF/ELSE / WHEN map to a real branch with the same condition meaning? Flag inverted or wrong conditions.
- Errors: does each "ON error / RETURN error" describe an error the code actually produces and a test actually asserts?
- Delegations: does each delegated call (e.g. "delegates to IMPL-X") match a real call site and the right collaborator? (GRAPH-001)
- Symbolic coherence: do the stated pre/postconditions hold under the code's actual behavior? (SIM-001)

For each false/contradictory/stale statement, record a finding: { block, pseudo-code line, claimed behavior, actual code/test behavior, severity }. Use checklist severity_on_failure (CONTRACT/GRAPH = error; SIM = warning).

Emit: RELIABILITY FINDINGS list.

## Stage 3 — Completeness audit: nothing missing (read-only)

This is the reverse direction. For EACH block:
- Enumerate behaviors PRESENT IN CODE: every branch/early return, every returned or thrown error, every observable side effect, every delegated/collaborator call.
- Enumerate behaviors PRESENT IN TESTS: every assertion (success path), every failure-path test, every boundary/edge case (empty, minimal, malformed/extreme inputs).
- For each enumerated behavior, confirm a corresponding pseudo-code statement exists. If none exists, record a GAP finding (the pseudo-code is incomplete).
- Apply Layer B coverage/traceability lenses: COVER-001 (success path represented), COVER-002 (each possible failure mode represented), COVER-003 (edge cases), TRACE-001 (each REQ tag has a test), TRACE-002 (each IMPL block has validating tests).

Emit the BIDIRECTIONAL COVERAGE MATRIX per block (two directions):

  Direction A (pseudo-code -> evidence): | Pseudo-code statement | Code evidence (file:line) | Test evidence (file:line) | status (matched / unmatched=Stage2 reliability gap) |
  Direction B (evidence -> pseudo-code): | Code behavior or test assertion | Source (file:line) | Covered by pseudo-code statement? | status (covered / MISSING=completeness gap) |

Emit: COMPLETENESS FINDINGS list (every MISSING row).

## Stage 4 — Scoring & report (read-only) — PRIMARY OUTPUT

1. Run Layer A: tied_validate_consistency (include_pseudocode default) for the in-scope IMPLs; record TIED-POE-001 result.
2. Run the project test suite for the in-scope areas to confirm tests pass (passing tests are the reliability/completeness baseline). Note any failures as blocking context.
3. Per block, assign a VERDICT:
   - PASS (reliable + complete): no error-severity reliability or completeness finding.
   - RELIABLE-INCOMPLETE: no false statements, but >=1 missing behavior (completeness gap).
   - UNRELIABLE: >=1 false/contradictory/stale statement.
4. Per IMPL and overall, compute a simple scorecard (count of PASS / RELIABLE-INCOMPLETE / UNRELIABLE blocks; count of findings by severity).
5. Gating verdict using profile agent_req_checklist_post_test minimum_gating_rules: list which gating rules pass/fail (every REQ tag covered, every block has success-path coverage, every failure mode covered, no unresolved symbols, diagnostics carry source locations).

Emit the AUDIT REPORT:
- Scope + base path (from Stage 0).
- Inventory table (Stage 1).
- Per-block coverage matrices (Stage 3).
- Consolidated findings list, each with: id, severity (error/warning/info), block, source location, reliable-vs-complete dimension, short explanation (DIAG-001).
- Scorecard + per-block verdicts.
- Layer A result + gating verdict.
- Prioritized gap list (errors first) recommending a LEAP action per finding.

STOP HERE if only analysis was requested. Otherwise proceed to Stage 5 after the report is reviewed.

## Stage 5 — LEAP remediation (mutating; gated on Stage 4 review)

For each confirmed gap, apply fixes in LEAP reverse order ([PROC-LEAP]; IMPL -> ARCH -> REQ), then re-validate:
1. Update tied/implementation-decisions/IMPL-{TOKEN}-pseudocode.md FIRST so the block becomes reliable and complete:
   - UNRELIABLE finding: correct the false/stale statement to match real behavior.
   - COMPLETENESS gap: add the missing branch/error/side-effect/delegation/edge-case statement with its block lead.
2. If a fix changes requirement or architecture scope (new behavior, new touchpoint), propagate up: update ARCH, then REQ, in the same work item. Do not leave IMPL ahead of ARCH/REQ.
3. Align comments: copy the (possibly updated) block lead literally to the test locus and the production locus; full-block copy where project policy requires (source-file-impl-traceability.md). Host comment syntax only; no paraphrase.
4. Do NOT rewrite passing tests or change product logic unless you found a definite bug; in that case fix code/tests and document the LEAP.
5. Re-validate: lint_yaml on touched IMPL/ARCH/REQ YAML; tied_validate_consistency; Layer B with profile agent_req_checklist_post_test; run the project test suite. Failures mean pseudo-code or comments still diverge — reconcile.

Emit: REMEDIATION LOG (finding -> fix applied -> files touched -> re-validation result) and a re-run of the Stage 4 scorecard showing residual findings (ideally none).

## Forbidden

- Confirming a pseudo-code statement that the code or tests contradict (must be flagged, not excused).
- Pasting host-language source into essence_pseudocode during remediation.
- Paraphrasing or re-ordering block-lead tokens in tests or code without updating the sidecar first (LEAP).
- Editing tied/methodology/ (read-only).
- Starting Stage 5 before the Stage 4 report is produced and reviewed.
- Skipping tied_validate_consistency after any sidecar/YAML edit.

## Done when

- Every in-scope block has an inventory row, a bidirectional coverage matrix, and a verdict.
- The audit report lists all findings with severity and source location and a scorecard + gating verdict.
- (If Stage 5 ran) every error-severity finding is remediated via LEAP; tied_validate_consistency ok; Layer B post_test gating rules pass or carry documented waivers; the test suite passes.
```

---

## Operator notes (human or lead agent)

### Relationship to other pseudo-code tracks

| Track / prompt | Situation | Direction |
|----------------|-----------|-----------|
| **A** — [agent-req-implementation-checklist.md](agent-req-implementation-checklist.md) | New REQ, no implementation | Pseudo-code → RED tests → code |
| **B** — [pseudocode-writing-and-validation.md § Track B](pseudocode-writing-and-validation.md#track-b-fix-implemented-drift) | Fix merged without IMPL update | IMPL → tests → code (recovery) |
| **C** — [impl-pseudocode-from-code-agent-prompt.md](impl-pseudocode-from-code-agent-prompt.md) | Code + tests exist; pseudo-code absent/stale | Read tests/code → **write** IMPL → align comments |
| **This prompt** | Code + tests + pseudo-code all exist | Read all three → **measure** IMPL fidelity → report → LEAP-fix gaps |

Track C **creates** pseudo-code where there is none; this audit **grades** pseudo-code that already exists and only edits it (Stage 5) to close measured gaps. The two are complementary: run Track C first if sidecars are missing, then this audit to verify quality.

### Read-only stop point

Stages 0–4 never mutate TIED or source — they only read and report. A run can legitimately end at the Stage 4 report ("report the desired analysis"). Stage 5 is opt-in and gated on the report being reviewed, so the same prompt serves both "audit only" and "audit and fix" operators.

### Mapping to existing validation infrastructure

This prompt deliberately reuses, rather than reinvents, the checks defined in [pseudocode-validation-checklist.yaml](pseudocode-validation-checklist.yaml):

| Stage | Dimension | Layer B / Layer A checks |
|-------|-----------|--------------------------|
| 2 — Reliability | pseudo-code statements are true | `CONTRACT-001`, `CONTRACT-002`, `CONTRACT-003`, `GRAPH-001`, `SIM-001` |
| 3 — Completeness | nothing missing | `COVER-001`, `COVER-002`, `COVER-003`, `TRACE-001`, `TRACE-002`, `TRACE-003`, `GRAPH-002` |
| 4 — Report | findings + gating | `DIAG-001`, `TIED-POE-001` (Layer A `tied_validate_consistency`), profile `agent_req_checklist_post_test` `minimum_gating_rules` |
| 5 — Remediation | fix + re-validate | Layer A re-run, Layer B post_test profile, `[PROC-LEAP]` |

Three-way alignment definitions (block lead, literal copy, IMPL→test→code authority) come from [pseudocode-writing-and-validation.md](pseudocode-writing-and-validation.md#block-lead-and-literal-copy-in-tests-and-code).

### Reporting format the agent must emit

1. **Inventory table** — IMPL | block | block-lead tokens | test locus | code locus | loci found.
2. **Bidirectional coverage matrix** per block — Direction A (pseudo-code statement → code/test evidence) and Direction B (code behavior / test assertion → covering pseudo-code statement). Direction A unmatched rows = reliability gaps; Direction B MISSING rows = completeness gaps.
3. **Findings list** — id, severity (error/warning/info), block, source location, dimension (reliable vs complete), explanation.
4. **Scorecard + gating verdict** — per-block verdict (PASS / RELIABLE-INCOMPLETE / UNRELIABLE), per-IMPL and overall counts, Layer A result, post_test gating pass/fail, prioritized gap list with recommended LEAP action.
5. **Remediation log** (Stage 5 only) — finding → fix → files touched → re-validation result, plus a re-scored scorecard.

### Session scope

Audit one IMPL token set or one module boundary per session so inventory tables and coverage matrices stay accurate and reviewable. Run the project's test suite for touched/in-scope areas before reporting (Stage 4) and after remediation (Stage 5).

---

## Quick verification checklist

- [ ] `tied_config_get_base_path` matches this repo's `tied/`
- [ ] Every in-scope block has an inventory row with test + code loci
- [ ] Stage 2 flagged (not excused) any pseudo-code statement contradicted by code/tests
- [ ] Stage 3 produced a two-direction coverage matrix; every MISSING row is a recorded completeness gap
- [ ] Each block has a verdict (PASS / RELIABLE-INCOMPLETE / UNRELIABLE) with severity and source location
- [ ] Layer A `tied_validate_consistency` result recorded; `agent_req_checklist_post_test` gating verdict stated
- [ ] Report produced before any Stage 5 edit
- [ ] (Stage 5) LEAP order IMPL → ARCH → REQ; block leads re-synced to tests/code verbatim
- [ ] (Stage 5) `lint_yaml` clean, `tied_validate_consistency` → ok, Layer B post_test satisfied, test suite passes
