<!--
  Canonical template: templates/impl-essence-pseudocode-template.md (TIED methodology / client copy_files source).

  **Copy the Markdown below the `---` line** into `tied/implementation-decisions/IMPL-{TOKEN}-pseudocode.md` in your project, then replace `{…}` placeholders and run `tied_validate_consistency` (Layer A).

  **No code chunks in IMPL pseudocode (mandatory):** `essence_pseudocode` is logic-only pseudocode. Do not paste language-specific source code, compilable fragments, or test/production code blocks.
  Keep only language-agnostic logic steps and contracts (INPUT/OUTPUT/DATA/CONTROL, procedures, branches, loops, error paths).

  **H1 line:** TIED does not require a fixed order of `[REQ-*]`, `[ARCH-*]`, and `[IMPL-*]` in the heading; pick one convention per project and stay consistent.

  **Strong preference:** For non-trivial pseudo-code (multiple blocks, cross-IMPL composition, long or frequently reviewed bodies), keep the on-disk body in a **sidecar** file; avoid large inline `essence_pseudocode` in `IMPL-*.yaml` (quoting, diff, review).

  Guides: [pseudocode writing and validation](../tied/docs/pseudocode-writing-and-validation.md), [pseudocode format and practices](../docs/pseudocode-format-and-practices.md).
-->

---

# [IMPL-{TOKEN}] [ARCH-{…}] [REQ-{…}] [REQ-…] — {One line: what this sidecar specifies; optional: cross-IMPL or generator note.}

## {Block title — e.g. feature area, symbol group, or `mod::test_name`}

*Optional: Source: `path/to/file.ext` (lines a–b)*

- [REQ-…] [ARCH-…] [IMPL-…] {How this H2 block implements these tokens in one line.}
- Contract:
  - DATA: {state owned / configuration / inputs from elsewhere}
  - INPUT: {what enters this block}
  - OUTPUT: {what leaves this block}
  - CONTROL: {optional: env, feature flags, ordering constraints}
- PROCEDURE: UPPER_SNAKE_NAME
  - 1. {One action.}
  - 2. {One action.}
- IF {condition} THEN
  - {sub-steps}
- ELSE
  - {sub-steps}
- ON error / ON failure: {one consistent policy}
- How (sub-block, same token set as above): {extra detail only—no need to repeat full token list.}

> Optional narrative in blockquote for human readers (algorithms, rationale). Keep REQ/ARCH/IMPL on list lines for tooling.

> LEAP drift rule: if tests or production code expose logic missing here, translate that logic into pseudocode first, then assess whether ARCH/REQ must also be updated via LEAP.

## {Another block — e.g. composition with another IMPL}

- [REQ-…] [ARCH-…] [IMPL-A] [IMPL-B] {How this block composes; different IMPL set, so list all.}
- **COMPOSITION_ORDER:** {1. IMPL-A step … 2. IMPL-B step …}
- **OWNERSHIP:** {Which IMPL owns DATA vs side effects vs emission to user/API.}
- {Steps using INPUT/OUTPUT/DATA/CONTROL and numbered lines as above.}
