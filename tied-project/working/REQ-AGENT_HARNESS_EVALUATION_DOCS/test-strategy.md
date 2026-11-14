# Test strategy — REQ-AGENT_HARNESS_EVALUATION_DOCS

**depth_tier:** `minimal`  
**gate_policy:** `advisory`

## Design (plan mode — RED at build-plan)

| ID | Intent | Layer | build-plan artifact |
| --- | --- | --- | --- |
| **T-AHE-PATH-01** | `AHE_*` constants match on-disk layout under `docs/agent-harness-evaluation/` | Unit / contract | `agent-harness-eval-docs-paths.contract.test.mjs` |
| **T-AHE-CATALOG-01** | Catalog readout link parser resolves paths via `AHE_WF_CATALOG` | Unit | Update `wf-trial-catalog-readout-links` tests |
| **T-AHE-REGISTRY-01** | Registry refresh reads readouts from `AHE_READOUTS_DIR` | Unit | `wf-trial-registry-refresh.test.mjs` |
| **T-AHE-GRADES-01** | `buildTrialReadoutGradesIndex` scans `readouts/` not `docs/demos` | Unit | `project-size-comparison-render.test.mjs` |
| **T-AHE-METER-01** | Metering catalog contract paths | Contract | `wf-trial-metering-catalog-contract.test.mjs` |
| **T-AHE-HMEP-01** | Harness-eval suite/baseline/replay paths under AHE | Contract | `mcp-server/contracts/harness-eval/*.mjs` |
| **T-AHE-VOCAB-01** | Taxonomy markdown links to AHE catalog + model YAML (post-RECORD) | Contract | Extend `vocab-harness-platform-taxonomy-contract.test.mjs` |
| **T-AHE-VOCAB-02** | **`agentstream.md`** has no markdown links under `docs/demos/` for moved config YAML (`traditional-four-phase-agentstream`, `wf-trial-model-catalog`, `wf-trial-model-specs`) | Contract / gate | `vocab-agentstream-ahe-config-links.contract.test.mjs` (**implemented**) + `ruby scripts/validate_vocab_index.rb .` at close-out |
| **T-AHE-PUBLISH-01** | Publish skill contract mentions comparison-table under AHE | Contract | `wf-trial-summaries-publish-skill-contract.test.mjs` |
| **T-AHE-CONSIST-01** | `tied_validate_consistency` after token mint | MCP | Close-out evidence |

## Composition

| ID | Intent |
| --- | --- |
| **T-AHE-PUBLISH-CHECK-01** | `wf-trial-summaries-publish.mjs --check` exits 0 after mv + wire (facilitator gate) |

## Security / behavior

Path module only; no secrets. `--check` must not mutate disposable clients.

## Regression boundary

Tests assert **paths and link graph**, not readout prose or grades.

## E2E

**N/A** — documentation relocation + path resolution; no UI.