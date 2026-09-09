# PSA Mode A reference fixture — REQ-PSEUDOCODE_STATIC_ANALYSIS

Reference normalized-input bundle for `[REQ-TIED_ADVERSARIAL_INQUIRY]` Mode A
inquiry on the pseudo-code static analysis MCP pipeline. Scope:
`IMPL-PSEUDOCODE_ANALYSIS_ENGINE#ANALYZE_ESSENCE_PSEUDOCODE#ccd3592432c0cf4e`.

## Layout

| File | Role |
|---|---|
| `graph.json` | Obligation graph with criteria, block, evidence loci, adversarial cases |
| `fidelity.json` | Specification statements and bidirectional test/production evidence |
| `build-config.yaml` | Declarative inputs for `scripts/build_adversarial_inquiry_from_tied.rb` regression |
| `README.md` | Scope metadata, proof boundary, fixture provenance |

All paths in the JSON are **repository-relative** (no absolute paths).

## Scope metadata

- **Request token:** `REQ-PSEUDOCODE_STATIC_ANALYSIS`
- **Block id:** `IMPL-PSEUDOCODE_ANALYSIS_ENGINE#ANALYZE_ESSENCE_PSEUDOCODE#ccd3592432c0cf4e`
- **Test paths:** `mcp-server/src/analysis/pseudocode-analyzer.test.ts`, `mcp-server/src/tools/pseudocode-analyze-mcp.test.ts`
- **Production path:** `mcp-server/src/analysis/pseudocode-analyzer.ts`
- **Project id:** `cfd5bf6ad98024eb` (SHA256 of resolved `tied/` base path, first 16 hex)

## Proof boundary (non-runtime)

Bounded static analysis and read-only MCP composition only; not runtime execution,
test execution, or complete path coverage.

## Builder regression

From the repository root:

```bash
ruby scripts/build_adversarial_inquiry_from_tied.rb \
  --build-config mcp-server/test/fixtures/adversarial-inquiry-psa/build-config.yaml \
  --project-root /absolute/path/to/stdd \
  --tied-base-path /absolute/path/to/stdd/tied \
  --output-dir /tmp/psa-built
```

Compare `/tmp/psa-built/graph.json` and `fidelity.json` to this fixture.
