# Code ↔ token map (sample) — stdd store

**Baseline:** `cf321c96` · **Tier:** `toolchain_readonly` · **Proof boundary:** Sample rows only; not exhaustive REQ coverage.

| Code / module | Primary REQ / ARCH tokens | Evidence |
| --- | --- | --- |
| `mcp-server/src/yaml-loader.ts` | `[REQ-TIED_TWO_FOLDER_LAYOUT]`, `[REQ-TIED_PROJECT_IDENTITY_WRITE_BINDING]`, `[REQ-TIED_PROJECT_IDENTITY_MARKER_ROUTING]` | Source-graph trace on `getBasePath` |
| `mcp-server/src/edpc/*` | `[REQ-TIED_EDPC_COMPREHENSION]` | Prior slice-c dogfood + static inventory |
| `mcp-server/src/brownfield-intent-evidence/*` | `[REQ-TIED_BROWNFIELD_INTENT_ELEVATION]` | Module dir + composition tests |
| `mcp-server/src/source-graph/*` | `[REQ-TIED_SOURCE_GRAPH_COMPREHENSION]` | `tied_source_graph_refresh` receipt |
| `mcp-server/src/request-evidence-envelope/*` | `[REQ-REQUEST_EVIDENCE_ENVELOPE]` | Envelope batch + trace callers |
| `mcp-server/src/tools/index.ts` | MCP surface for EDPC, verify, gates, YAML | Scoped analysis root |
| `tools/bootstrap/*`, `tied-install.sh` | `[REQ-TIED_LAYERED_CLIENT_INSTALL]`, `[REQ-TIED_CLIENT_BOOTSTRAP_SKILLS]` | Install manifest + README |
| `tools/bundled-*-skill/` | `[REQ-PROMPT_TYPE_GLOBAL_SKILLS]`, skill-specific REQs | client-skills-catalog tests |
| `tied-project/working/{REQ}/` | Per-REQ process evidence | [working-artifact-placement.md](../../../tied-bundle/docs/working-artifact-placement.md) |
| `tied-project/citdp/CITDP-*.yaml` | CITDP analysis persist | Draft vs canonical per dedupe log |

**Refresh:** Re-run source graph + scoped analysis when MCP tool registration or install layout changes materially.
