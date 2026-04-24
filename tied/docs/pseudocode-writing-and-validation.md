# Writing and Validating IMPL Pseudo-Code

**Audience**: Humans and AI agents. Process token: `[PROC-PSEUDOCODE_VALIDATION]`.

**Purpose**: This document is the single place for how to **write** and how to **validate** the logical `essence_pseudocode` for IMPL decisions in TIED projects. The **on-disk** body is the sidecar **Markdown** file; tooling merges it into the detail record. The doc ties together writing rules (`implementation-decisions.md`), **TIED** data validation, and the **application** pseudo-code validation checklist (`pseudocode-validation-checklist.yaml`).

---

## 1. How to Write IMPL Pseudo-Code

The **logical** field is `essence_pseudocode` on the IMPL detail record. For project IMPLs, the **on-disk** source of that string is **`tied/implementation-decisions/IMPL-{TOKEN}-pseudocode.md`**, not an inline YAML block in `IMPL-{TOKEN}.yaml`. Tools merge the sidecar when present. Do not add new inline `essence_pseudocode` in the detail YAML in normal workflows. The file is available to any editor or process (see [impl-essence-pseudocode-mcp-workflow.md](impl-essence-pseudocode-mcp-workflow.md)).

The merged field is the **source of consistent logic** for the implementation; tests and code are derived from it and must stay aligned ([PROC-IMPL_PSEUDOCODE_TOKENS], [PROC-LEAP]).

### IMPL sidecar as readable Markdown (Comrak / extract-generated)

In this repository, the script **[`script/extract_test_pseudocode_to_impl_sidecars.py`](../../script/extract_test_pseudocode_to_impl_sidecars.py)** builds the sidecar from `//` and `///` (and optional `/*` … `*/`, see below) in DOMAIN-mapped test sources. The on-disk file is **normal Markdown** so it renders in editors and on hosting sites:

- **File header**: a single top-level line `# [REQ-…] [ARCH-…] [IMPL-…]` plus a one-line description of the sidecar’s role.
- **Per test (or per harness block)**: a level-2 heading whose title is the test id in backticks (e.g. ``## `mymod::test_name` `` in the sidecar), a short *Source: `file.rs` (lines a–b)* line in italics, then a body of list items derived from NORM `//` lines, `///` **doc** lines as Markdown blockquotes (`> …`), and nested list items for Rust lines that used extra indentation after `//` (e.g. `GATE:`, `TEST:`, `INPUT:`, `OUTPUT:`, and steps).

**Hand-edited vs machine-regenerated:** If you use the extract path, the script **overwrites** the whole `IMPL-{TOKEN}-pseudocode.md` when you re-run it. Durable changes go in the **Rust** NORM comments, then re-run the extract script; do not rely on hand-edits to the generated catalog unless your project has opted out of that pipeline. Other TIED projects may hand-author Markdown in the same spirit without the extract step.

**Machine wiring:** Exact line mapping rules and integration-harness layout live in the extract script’s module docstring; treat that as the **source of truth** for extract-generated sidecars.

### Optional `/* */` in Rust (Markdown preface)

A well-formed `/*` … `*/` block in the same **pre–`#[test]` / pre–ntest `fn` span** the extractor already scans (nested `/*` / `*/` per Rust) can provide **narrative** text: the **last** such block in that span is dedented and emitted as a Markdown **preface** before the list from `//` / `///`. **Prefer** leaving REQ/ARCH/IMPL **bracket tokens** and structured lines such as `FILE:`, `TEST:`, and contract fields on **`//`** so Layer A and tooling see a stable shape; a block can add rich prose. An exception is block-only or mixed forms where the combined text still contains the required `IMPL-` / `ARCH-` / `REQ-` references and your extractor policy allows resolution from the block. **Caveats:** `rustfmt` can reflow block comments; do not use raw `*/` inside prose; nested block comments follow Rust’s rules.

### Writing rules (summary)

- **Mandatory structure**: Every IMPL with a decision detail must have **essence** content in the place your project uses (here: the **sidecar** + merge). Address all logical and flow issues there **before** writing tests or code.
- **Contract block**: Use explicit `INPUT:`, `OUTPUT:`, `DATA:` (and `CONTROL:` when relevant). Procedure names in UPPER_SNAKE or camelCase.
- **One action per step**: Each logical step should express one clear action or decision; avoid long prose that mixes multiple actions.
- **Token comments in every block** ([PROC-IMPL_PSEUDOCODE_TOKENS]): Every block must have a comment that (1) names all REQ, ARCH, and IMPL reflected in that block and (2) states how the block implements them. The **“top-level”** line in Markdown is a **file** heading: `# [IMPL-X] [ARCH-Y] [REQ-Z]` (an H1 in the sidecar), **not** a per-line `//` paste. In extract-generated sidecars, each per-test *section* usually repeats a full bracket line as a **list item** (first `//` line in Rust); more-indented `//` lines map to nested list items. Sub-blocks with the same token set: state only the *how*. Sub-blocks with a different set: open with the full token list and how the sub-block implements them. TIED sees tokens as **plain text** in the merged string, regardless of list vs. heading.
- **Preferred vocabulary**: INPUT, OUTPUT, DATA, CONTROL; ON, WHEN; SEND, BROADCAST, RETURN; IF, ELSE; FOR … IN; ON error, RETURN error; AWAIT, Promise. See the full list in `implementation-decisions.md`.
- **Collision detection**: When IMPLs are composed or share code paths, document ordering, shared data, and pre/post conditions so overlapping steps and conflicting assumptions are visible.

**Full writing guide**: See `tied/docs/implementation-decisions.md` (or root `implementation-decisions.md`) for:

- Mandatory essence_pseudocode
- Preferred vocabulary for essence_pseudocode
- Expressing sequence and structure
- Template and stub pseudo-code
- Managed code and block token rules (REQ/ARCH/IMPL in pseudo-code)
- Collision detection using essence_pseudocode

---

## 2. How to Validate IMPL Pseudo-Code

### Validation layers

Validation is **two layers**. They are **complementary**: Layer A (TIED) enforces **repository and traceability** rules on the **same** merged pseudo-code string TIED exposes; Layer B (application checklist) enforces **shape, contracts, coverage, and generation** expectations for projects that use this methodology.

**Order**: Run **Layer A** when the sidecar or logical essence changes, then run **Layer B** (or your tailored subset) for application-level gating, unless your process defers part of B until tests exist (see the checklist’s `tailoring`).

**Layer A — TIED data validation** — After editing **`IMPL-{TOKEN}-pseudocode.md`**, calling **`impl_detail_set_essence_pseudocode`**, or any change that updates merged essence, run **`tied_validate_consistency`**. Use default options so **`include_pseudocode`** runs (MCP/CLI: see the **mcp-server** [README](../mcp-server/README.md)). TIED **loads the sidecar** via `loadDetail` and validates the merged `essence_pseudocode` for presence, **token comment** requirements (`[REQ-*]`, `[ARCH-*]`, `[IMPL-*]` where applicable) on **any** line of the merged Markdown, and **cross-reference** integrity. No particular prefix (such as a fake heading on every line) is required, as long as the bracketed tokens appear where the project’s rules and generators expect. The report’s **`pseudocode`** section qualifies external/sidecar text as consistent with TIED indexes and detail files. This is **not** a substitute for parsing the pseudo-code into execution or test cases.

**Layer B — Application pseudo-code validation checklist** — The checklist in [pseudocode-validation-checklist.yaml](pseudocode-validation-checklist.yaml) is for **parse, schema, contracts, graph, behavioral coverage, traceability to tests**, and related categories. **Apply it to the same string** the project uses as `essence_pseudocode` for the IMPL: read **`IMPL-{TOKEN}-pseudocode.md`**, or use the merged value from `yaml_detail_read` (equivalent when the sidecar is the source). Use Layer B to ensure pseudo-code is parseable, well-shaped, consistent with contracts and architecture, and covered by tests (when that phase applies) before or alongside code. Optional checklist item **TIED-POE-001** explicitly ties this layer to a passing TIED run.

The **application pseudo-code validation checklist** is the structured definition for Layer B. The sections below (intended use, how to apply, order, tailoring) focus on that checklist; remember Layer A runs first in typical IMPL workflows in this repository.

### Intended use

- Projects where pseudo-code is the **primary application specification**.
- Projects where pseudo-code **drives unit-test and integration-test definitions**.
- Projects that require **requirement, architecture, and implementation traceability**.

### How to apply

1. Parse each pseudo-code block into a normalized internal representation (or treat the block as the unit if no parser exists).
2. Run each validation pass in the **recommended order** (see below).
3. Record findings with **severity** and **source location** (block identifier, line/column when available).
4. Treat **required checks as gating** unless explicitly waived and documented.

### Result severities

- **error** — Must be fixed before proceeding; gating.
- **warning** — Should be addressed; may be waived with justification.
- **info** — Informational; no gate.

### Recommended validation order

Run categories in this order (matches [pseudocode-validation-checklist.yaml](pseudocode-validation-checklist.yaml) `recommended_validation_order`):

0. **tied_data** — TIED-POE-001: `tied_validate_consistency` includes pseudo-code; merged essence from the sidecar qualifies (Layer A; see [Validation layers](#validation-layers)).
1. **parsing** — Blocks parse successfully; source locations preserved.
2. **schema** — Required sections exist; inputs/outputs/data declarations consistent.
3. **symbol_resolution** — Every referenced symbol resolves uniquely; duplicate identifiers controlled.
4. **contract_validation** — Test inputs/outputs and errors conform to target block contracts; safety/invariants testable where required.
5. **dependency_graph** — Application dependency graph valid; unit tests do not silently depend on undeclared collaborators.
6. **behavioral_coverage** — Each implementation block has success-path coverage; failure-path coverage when failure is possible; optionally boundary/edge cases.
7. **traceability** — Every requirement tag has at least one test; every implementation tag has validation coverage; optionally architecture reflected in integration tests.
8. **linting** — Optional: precise verbs, explicit fixtures/mocks.
9. **semantic_simulation** — Optional: setup satisfies preconditions, assertions reachable.
10. **generation_readiness** — Optional: steps map to test framework primitives.
11. **reporting** — Findings emitted with severity, message, and source location.

### Minimum gating rules

Do not proceed to writing tests or code until:

- All **required** checks pass (or are explicitly waived and documented).
- No **unresolved symbols** remain.
- Every **requirement tag** is covered by at least one test.
- Every **implementation block** has success-path coverage.
- Every **declared failure mode** has coverage when failure is possible.
- **Diagnostics** include source locations where available.

### Tailoring

Projects may:

- Add **project-specific block kinds** under the schema category.
- Add **domain-specific safety rules** under contract_validation.
- Add **project architecture constraints** under dependency_graph.
- Add **custom coverage thresholds** per block kind.
- Add **generation backend constraints** if pseudo-code drives test generation directly.

See the `tailoring` section in [pseudocode-validation-checklist.yaml](pseudocode-validation-checklist.yaml).

### If no parser or tool exists

Perform a **manual pass** over the checklist categories in the recommended order. For each category, walk the checklist items (by `id`) and document results (pass / fail / waived) with severity and, where possible, block or file location. Treat required checks as gating; fix or waive before proceeding.

---

## 3. When to Run Validation

- **Layer A (TIED)** — After any change to **`tied/implementation-decisions/IMPL-*-pseudocode.md`**, to merged essence through the API, or when preparing to commit TIED data: run **`tied_validate_consistency`**. See also [impl-essence-pseudocode-mcp-workflow.md](impl-essence-pseudocode-mcp-workflow.md).
- **Layer B (application checklist)** — As required by your phase (pre-RED vs post-test per `tailoring` in the checklist).
- **Before any tests or code (agent flow)** — Align with S06 of the agent checklist ([PROC-AGENT_REQ_CHECKLIST]): after authoring or updating IMPL pseudo-code and applying block token comments, run Layer A, then layer B (or the agreed subset) before persisting and before risk-assessment–traceable-commit.
- **After any change to logical `essence_pseudocode`** (including direct sidecar edits) — Re-run **Layer A**; when aiming for generation-ready or full traceability, re-run **Layer B** as applicable so the checklist remains satisfied.

---

## 4. References

| Document | What it provides |
|----------|------------------|
| [`script/extract_test_pseudocode_to_impl_sidecars.py`](../../script/extract_test_pseudocode_to_impl_sidecars.py) | Comrak: regenerates `IMPL-*-pseudocode.md` from NORM `//`/`///` (and optional `/*`…`*/`) in `src/tests`; **mechanical** mapping to Markdown. |
| `tied_validate_consistency` (MCP/CLI) | **Layer A**: TIED data validation; with default `include_pseudocode`, qualifies merged `essence_pseudocode` (from sidecar when present). See [mcp-server README](../mcp-server/README.md). |
| [pseudocode-validation-checklist.yaml](pseudocode-validation-checklist.yaml) | **Layer B**: Canonical application checklist (categories, required/optional checks, order, gating rules, tailoring) |
| [impl-pseudocode-rust-block-comment-guide.md](impl-pseudocode-rust-block-comment-guide.md) | Placing **verbatim** IMPL `##` sections as `/* */` in production **Rust** (placement vs `///`, H2 naming, TIED) |
| [detail-files-schema.md](detail-files-schema.md) | Field shapes, sidecar + merge description for `essence_pseudocode` |
| [impl-essence-pseudocode-mcp-workflow.md](impl-essence-pseudocode-mcp-workflow.md) | Direct edit vs MCP+CLI, policy split, `tied_validate_consistency` after sidecar edits |
| `tied/docs/implementation-decisions.md` | Full writing rules: mandatory logical essence, vocabulary, sequence, token comments, collision detection |
| `tied/docs/agent-req-implementation-checklist.md` | gate-pseudocode-validation and sub-pseudocode-validation-pass: where validation runs in the agent flow |
| `tied/docs/impl-code-test-linkage.md` | Phase B (B5) and Phase C (C4): validation in the IMPL-to-code-and-tests linkage |
| `tied/docs/processes.md` | [PROC-PSEUDOCODE_VALIDATION], [PROC-IMPL_PSEUDOCODE_TOKENS], [PROC-IMPL_CODE_TEST_SYNC] |
