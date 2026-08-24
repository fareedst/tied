# Go / non-Ruby Mode A reference fixture — REQ-ROOTJOBS

Reference normalized-input bundle for `[REQ-TIED_ADVERSARIAL_INQUIRY]` Mode A
inquiry on a Go stack. Source: client `1787507684` integrated-activation pilot
(`REQ-ROOTJOBS`, scope `IMPL-ROOTJOBS_TREE#BUILD_FOREST#165443cef52e47de`).

## Layout

| File | Role |
|---|---|
| `graph.json` | Obligation graph with criteria, block, evidence loci, adversarial cases |
| `fidelity.json` | Specification statements and bidirectional test/production evidence |
| `build-config.yaml` | Declarative inputs for `scripts/build_adversarial_inquiry_from_tied.rb` regression |
| `expected/` | Optional golden snippets for smoke comparisons |

All paths in the JSON are **repository-relative** (no absolute `/Users/...` paths).

## Scope metadata

- **Request token:** `REQ-ROOTJOBS`
- **Block id:** `IMPL-ROOTJOBS_TREE#BUILD_FOREST#165443cef52e47de`
- **Test paths:** `tools/rootjobs/internal/tree/tree_test.go`
- **Production path:** `tools/rootjobs/internal/tree/tree.go`
- **Project id:** `bd6908f862145619` (SHA256 of resolved `tied/` base path, first 16 hex)

## Builder regression

From the TIED repository root:

```bash
ruby scripts/build_adversarial_inquiry_from_tied.rb \
  --build-config mcp-server/test/fixtures/adversarial-inquiry-go-rootjobs/build-config.yaml \
  --project-root /absolute/path/to/1787507684 \
  --tied-base-path /absolute/path/to/1787507684/tied \
  --output-dir /tmp/rootjobs-built
```

Compare `/tmp/rootjobs-built/graph.json` and `fidelity.json` to this fixture.
Then assemble a Mode A envelope:

```bash
ruby scripts/build_adversarial_inquiry_from_tied.rb \
  --build-config mcp-server/test/fixtures/adversarial-inquiry-go-rootjobs/build-config.yaml \
  --project-root /absolute/path/to/1787507684 \
  --emit-mode-a \
  --scope IMPL-ROOTJOBS_TREE#BUILD_FOREST#165443cef52e47de \
  --run-id rootjobs-smoke-001 \
  --phase pre_implementation \
  --request-token REQ-ROOTJOBS \
  > /tmp/rootjobs-inquiry.json
```

## Out of scope

Native Go **Mode B** project-input adapter remains deferred (operator friction
plan §5.2). Use this fixture + Mode A builder until a future REQ ships a Go loader.
