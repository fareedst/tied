# Mode B adversarial case fixture

This deterministic mini-project exercises the project-input inquiry boundary
for `[REQ-TIED_ADVERSARIAL_INQUIRY]`,
`[ARCH-TIED_ADVERSARIAL_INQUIRY]`, and
`[IMPL-TIED_ADVERSARIAL_INQUIRY]`. Each case supplies an explicit project
root, Ruby Minitest source path, production-source locus, and structured
production evidence. Production source is never parsed for behavior.

The three cases are:

- `case-good`: supported assertions and one matching structured production
  observation. It is expected to be `RELIABLE_INCOMPLETE` because the fixture
  deliberately omits the failure observation from the production manifest.
- `case-missing-failure`: the test omits the required failure assertion and the
  production manifest is partial. It must remain `RELIABLE_INCOMPLETE` with a
  Direction B completeness finding.
- `case-unsupported-assertion`: the test uses `assert_in_delta`. It must be
  `UNRESOLVED` with an `unsupported_adapter` diagnostic.

The `mode-b-input.json` files use `__PROJECT_ROOT__` as a placeholder. Tests
replace it with the absolute `mini-project` path. The nested
`mini-project/production-evidence/` directory is used so every declared path
stays within the validated project boundary; the sibling
`production-evidence/` files mirror the manifests for fixture inspection.

`BUILD_PROJECT_INQUIRY_INPUT` reads canonical records and source text
read-only, parses only the supported Minitest assertions, and accepts
production behavior only from the structured manifests.
