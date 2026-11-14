# Test strategy — REQ-TIED_HARNESS_PLATFORM_TAXONOMY

**depth_tier:** `minimal`  
**gate_policy:** `advisory`

## Design (plan mode — no RED files yet)

| ID | Intent | Layer | build-plan artifact |
| --- | --- | --- | --- |
| **T-HPT-ROUTE-01** | `routing.md` contains `harness-platform-taxonomy.md` in row **2c** | Composition / doc contract | `vocab-harness-platform-taxonomy-contract.test.mjs` |
| **T-HPT-GLOSS-01** | Taxonomy file links `agentstream.md`, Traefik comparison, `harness-model-eval.md` | Same | Same test module |
| **T-HPT-XLATE-01** | Bundled xlate skill references taxonomy path for harness RESOLVE | File read assertion | Same or separate test |
| **T-HPT-CONSIST-01** | After REQ mint, `tied_validate_consistency` clean | Manual / MCP | Close-out evidence |

## Security / behavior

No runtime surface; no secrets. Contract tests read committed markdown only.

## Regression boundary

Does not assert sponsor prose wording — only link graph and routing presence.

## E2E

**N/A** — documentation and vocabulary only.