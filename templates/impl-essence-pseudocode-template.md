<!--
  Canonical template: templates/impl-essence-pseudocode-template.md (TIED methodology / client copy_files source).

  **Copy the Markdown below the `---` line** into `tied/implementation-decisions/IMPL-{TOKEN}-pseudocode.md` in your project, then replace `{…}` placeholders and run `tied_validate_consistency` (Layer A).

  **What this is (same as [pseudocode-writing-and-validation.md § Definition](../tied/docs/pseudocode-writing-and-validation.md#definition-of-impl-pseudocode)):** Language-agnostic logic grounded in IMPL/ARCH/REQ tokens; logical blocks stay **synchronized** (literal block leads, optional full-block copy per policy) to tests and code; **LEAP** applies when scope shifts (IMPL → ARCH → REQ).

  **No code chunks in IMPL pseudocode (mandatory):** `essence_pseudocode` is logic-only pseudocode. Do not paste language-specific source code, compilable fragments, or test/production code blocks.
  Keep only language-agnostic logic steps and contracts (INPUT/OUTPUT/DATA/CONTROL, PRE/POST/EFFECTS/FAILURE_MODES/DATA_TRANSITION/TERMINATION, procedures, branches, loops, error paths).

  **H1 and block-lead bracket order:** Use **IMPL, ARCH, REQ** when all three appear on one line (file-level H1 and full block leads), consistent with [implementation-decisions.md](../tied/docs/implementation-decisions.md) top-level naming.

  **Strong preference:** For non-trivial pseudo-code (multiple blocks, cross-IMPL composition, long or frequently reviewed bodies), keep the on-disk body in a **sidecar** file; avoid large inline `essence_pseudocode` in `IMPL-*.yaml` (quoting, diff, review).

  Guides: [pseudocode writing and validation](../tied/docs/pseudocode-writing-and-validation.md), [pseudocode format and practices](../tied/docs/pseudocode-format-and-practices.md), [block lead literal copy in tests and code](../tied/docs/pseudocode-writing-and-validation.md#block-lead-and-literal-copy-in-tests-and-code).

  **Block lead (per H2 / logical block):** The first token line(s) in each block (the [PROC-IMPL_PSEUDOCODE_TOKENS] **block lead**) must be **copied literally** (verbatim) into the matching test and production sites—host-language **comment** delimiters only. See the linkage doc.

  **Active contract precision:** New/changed Active procedure blocks require PRE, POST, EFFECTS (plus FAILURE_MODES / DATA_TRANSITION / TERMINATION when applicable). Template stubs may use INPUT/OUTPUT only. See implementation-decisions.md § Preferred vocabulary.

  **Authoring target vs bootstrap policy (fleet Phase 5 G4+):** This template demonstrates the **constraint-ready-v2** authoring target—Layer B contract precision plus optional Tier-3 annotations where the **annotation profile** requires them. At **G4** promotion, new-client bootstrap targets **constraint-enforced-v2** policy (contract floor plus `constraint_flow` expectation on bootstrap smoke audit—not header-only-v2). Legacy repos and headerless sidecars stay v1-compatible unchanged. Reference exemplars: `working/fleet-constraint-v2/exemplars/`.
-->

---

# [IMPL-{TOKEN}] [ARCH-{…}] [REQ-{…}] [REQ-…] — {One line: what this sidecar specifies; optional: cross-IMPL or generator note.}

Grammar-Version: v2

## {Block title — e.g. feature area, symbol group, or `mod::test_name`}

*Optional: Source: `path/to/file.ext` (lines a–b)*

- [IMPL-…] [ARCH-…] [REQ-…] {How this H2 block implements these tokens in one line.}
- *The line above (block lead) is copied **literally** as the first comment(s) in tests and in source that implement this block: [pseudocode-writing-and-validation.md § Block lead](../tied/docs/pseudocode-writing-and-validation.md#block-lead-and-literal-copy-in-tests-and-code).*
- Contract:
  - INPUT: {what enters this block}
  - PRE: {caller obligations / input predicates; avoid PRE: true unless unconstrained}
  - OUTPUT: {success shape} | { error: {ModeA} | {ModeB} }
  - POST:
    - success => {guarantees on success}
    - error {ModeA} => {guarantees on that failure}
  - FAILURE_MODES: {ModeA, ModeB — required when errors are possible; else omit / N/A}
  - DATA: {state owned / configuration / inputs from elsewhere — omit if none}
  - DATA_TRANSITION: {before→after for mutable DATA; required when DATA mutates or EFFECTS includes State}
  - EFFECTS: {pure | IO | Http | State | Async | DB | Exn | Random | Diverge | …}
  - TERMINATION: {total | may_diverge with justification — prefer total; required when recursion/WHILE/open wait}
  - CONTROL: {optional: env, feature flags, ordering constraints}
  - *Optional async contract rows (v1 — omit when N/A or pre-async-contract legacy):*
  - ASYNC_BOUNDARY: {await | send | stream | open_wait — when Async in EFFECTS or AWAIT/SEND present}
  - TIMEOUT: {deadline → FAILURE_MODE — when REQ declares timeout}
  - CANCELLATION: {actor → outcome; POST on cancel — when cancellable}
  - SEQUENCING: {local order across yields — or use CONTROL: ordering}
  - MESSAGE_CONTRACT: {delivery category; dedup/ack — for SEND/events/streams}
  - RETRY: {count; backoff; retryable failures — when retries apply}
  - IDEMPOTENCY: {dedup key; POST on duplicate — when retry or at-least-once delivery}
procedure UPPER_SNAKE_NAME:
  # [IMPL-{TOKEN}] [ARCH-{TOKEN}] [REQ-{TOKEN}] How: {one-line summary}
  Contract:
    INPUT: {inputs}
    OUTPUT: {outputs}
    PRE: {preconditions}
    POST: {postconditions}
    EFFECTS: pure
  {One action step per line — CALL OTHER(...), IF/ELSE, RETURN, etc.}
- IF {condition} THEN
  - {sub-steps}
- ELSE
  - {sub-steps}
- ON error / ON failure: RETURN { error: {Mode from FAILURE_MODES} }
- How (sub-block, same token set as above): {extra detail only—no need to repeat full token list.}

> Optional narrative in blockquote for human readers (algorithms, rationale). Keep IMPL/ARCH/REQ bracket tokens on list lines for tooling.

> LEAP drift rule: if tests or production code expose logic missing here, translate that logic into pseudocode first, then assess whether ARCH/REQ must also be updated via LEAP ([PROC-LEAP]).

## Optional — Tier-3 constraint annotations (constraint-ready-v2)

Use only when the procedure’s **annotation profile** requires refinements, summaries, alias policy, or immutability tags. Omit Tier-3 rows for **contract-only** profiles. Grammar: [pseudocode-grammar.v2.md](../tied/docs/pseudocode-grammar.v2.md). Fleet exemplars: [working/fleet-constraint-v2/exemplars/](../../working/fleet-constraint-v2/exemplars/).

- [IMPL-{TOKEN}] [ARCH-{…}] [REQ-{…}] {How: refinement profile — typed INPUT/OUTPUT refinements.}
procedure REFINEMENT_EXAMPLE:
  # [IMPL-{TOKEN}] [ARCH-{…}] [REQ-{…}] How: Prove POST from INPUT refinements under advisory constraint_flow.
  Contract:
    INPUT: value: int where value >= 0
    OUTPUT: result: int where result >= value
    PRE: true
    POST: result >= value
    EFFECTS: pure
    TERMINATION: total
  result := value + 1
  RETURN result

- [IMPL-{TOKEN}] [ARCH-{…}] [REQ-{…}] {How: alias/mutation profile — ALIAS POLICY + immutable DATA tags.}
procedure ALIAS_EXAMPLE:
  # [IMPL-{TOKEN}] [ARCH-{…}] [REQ-{…}] How: Declare alias policy when outputs may alias inputs.
  Contract:
    INPUT: source: Buffer
    OUTPUT: view: Buffer
    DATA: source (immutable): Buffer
    ALIAS POLICY:
      - view may alias source
    PRE: true
    POST: true
    EFFECTS: pure
  view := source
  RETURN view

- [IMPL-{TOKEN}] [ARCH-{…}] [REQ-{…}] {How: interprocedural profile — SUMMARY CALL/RETURN for callee effects.}
procedure SUMMARY_EXAMPLE:
  # [IMPL-{TOKEN}] [ARCH-{…}] [REQ-{…}] How: Compact callee summary at CALL sites; missing summary → unknown, not pass.
  Contract:
    INPUT: items: list of Item
    OUTPUT: count: int
    SUMMARY CALL:
      - mutates: items
    SUMMARY RETURN:
      - ensures: count >= 0
    PRE: length(items) > 0
    POST: count >= 0
    EFFECTS: State
  CALL PROCESS_ITEMS(items)
  RETURN count

## {Another block — e.g. composition with another IMPL}

- [IMPL-A] [IMPL-B] [ARCH-…] [REQ-…] {How this block composes; different IMPL set, so list all.}
- **COMPOSITION_ORDER:** {1. IMPL-A step … 2. IMPL-B step …}
- **OWNERSHIP:** {Which IMPL owns DATA vs side effects vs emission to user/API.}
- {Steps using INPUT/OUTPUT/DATA/PRE/POST/EFFECTS/CONTROL and numbered lines as above.}
