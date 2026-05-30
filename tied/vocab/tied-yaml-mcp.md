# TIED YAML MCP (canonical)

**Scope:** TIED YAML MCP server tools, `tied-cli.sh`, bundled tied-yaml skill, merge/read/write boundaries, validation, verify, cycles, backlog, scoped analysis, and traceability helpers. **Vocabulary only** — handler algorithms live in `mcp-server/src/` and IMPL pseudo-code where present.

**Traceability:** [REQ-TIED_SETUP](../requirements/REQ-TIED_SETUP.yaml) · [ARCH-TIED_STRUCTURE](../architecture-decisions/ARCH-TIED_STRUCTURE.yaml) · [IMPL-TIED_FILES](../implementation-decisions/IMPL-TIED_FILES.yaml) · [PROC-YAML_DB_OPERATIONS](../docs/processes.md) · [PROC-TIED_VERIFICATION_GATED](../docs/processes.md)

**See also:** [`domain-references.md`](domain-references.md) · [`tied-methodology.md`](tied-methodology.md) · [`feedback-to-tied.md`](feedback-to-tied.md) · [`leap-proposal-queue.md`](leap-proposal-queue.md) · [`../../docs/vocabulary-index-analysis-and-standards.md`](../../docs/vocabulary-index-analysis-and-standards.md)

---

## Preferred terms vs synonyms

| Preferred | Avoid | Notes |
|-----------|-------|-------|
| **TIED YAML MCP** | yaml mcp, project-0-stdd-tied-yaml (alone) | IDE may show project-specific label; same tool surface |
| **tied-cli** | mcp curl, raw node invoke | Shell wrapper: `.cursor/skills/tied-yaml/scripts/tied-cli.sh` |
| **TIED base path** | repo root, workspace | Absolute path to **`tied/`** directory; `tied_config_get_base_path` confirms |
| **project YAML write** | any yaml under tied | MCP writes **only** project indexes/detail dirs; never `tied/methodology/` |
| **merged view** | full yaml read | Methodology + project for read/validate; writes target project only |
| **consistency validation** | lint only | `tied_validate_consistency` — graph + schema, not just YAML syntax |
| **essence_pseudocode sidecar** | inline yaml pseudocode | Prefer `IMPL-*-pseudocode.md` or `impl_detail_set_essence_pseudocode` |
| **TIED methodology repository** | TIED repo, source repo | Git checkout that ships `mcp-server/`, `copy_files.sh`, `tools/bundled-tied-yaml-skill/`; distinct from **client project root** |
| **bundled skill** | .cursor skill source | Git-tracked canonical: `tools/bundled-tied-yaml-skill/`; installed to client `.cursor/skills/tied-yaml/` |

---

## Naming bridge: environment and paths

| Concept | Doc label | Storage | Env / flag | Code |
|---------|-----------|---------|------------|------|
| TIED root | TIED base | `tied/` | `TIED_BASE_PATH` | `getBasePath()` in `yaml-loader.ts` |
| MCP server binary | dist index | `mcp-server/dist/index.js` | `TIED_MCP_BIN` | stdio MCP entry |
| Bundled skill (source) | bundled skill | `tools/bundled-tied-yaml-skill/` | — | copied to `.cursor/skills/tied-yaml/` |
| TIED source root | TIED methodology repo | — | `TIED_REPO_ROOT` (baked by `copy_files.sh` into installed tied-cli) | default for `TIED_MCP_BIN` |
| Client project root | client repo | — | derived in tied-cli (`REPO_ROOT`) | default for `TIED_BASE_PATH` |
| IDE MCP config | mcp.json | `.cursor/mcp.json` | `env.TIED_BASE_PATH` | Cursor Settings → MCP |
| Large CLI args | args file | temp file | `TIED_CLI_ARGS_FILE` | `@/path/to/payload.json` |
| IMPL body from file | essence file | `IMPL-*-pseudocode.md` | `TIED_CLI_IMPL_ESSENCE_FILE` | `impl_detail_set_essence_pseudocode` |

---

## MCP tool catalog (`yaml_*` and `tied_*`)

Exact tool names registered in `mcp-server/src/tools/index.ts`:

### Index operations

| Tool | Purpose |
|------|---------|
| `yaml_index_read` | Read one index row |
| `yaml_index_list_tokens` | List tokens in an index |
| `yaml_index_filter` | Filter index rows |
| `yaml_index_validate` | Validate index file |
| `yaml_index_insert` | Insert index row |
| `yaml_index_update` | Update index row |

### Detail operations

| Tool | Purpose |
|------|---------|
| `yaml_detail_read` | Read one detail file |
| `yaml_detail_read_many` | Batch read details |
| `yaml_detail_list` | List detail files for token type |
| `yaml_detail_create` | Create detail file |
| `yaml_detail_update` | Update detail file |
| `yaml_detail_delete` | Delete detail file |
| `yaml_detail_append_implementation_approach_details` | Append approach detail section |
| `impl_detail_set_essence_pseudocode` | Set `essence_pseudocode` (inline or path) |

### Traceability and tokens

| Tool | Purpose |
|------|---------|
| `get_decisions_for_requirement` | REQ → ARCH/IMPL |
| `get_requirements_for_decision` | ARCH/IMPL → REQ |
| `tied_token_create_with_detail` | Create token + detail + registry |
| `tied_token_rename` | Rename token across tree |
| `tied_import_summary` | Import/summary helper |

### Validation and verification

| Tool | Purpose |
|------|---------|
| `tied_validate_consistency` | Full consistency check |
| `tied_verify` | Verification-gated status update |
| `tied_config_get_base_path` | Confirm effective `TIED_BASE_PATH` |

### Analysis and planning

| Tool | Purpose |
|------|---------|
| `tied_cycles` | Dependency cycle report |
| `tied_backlog` | Backlog view |
| `tied_scoped_analysis_run` | Scoped analysis pass |
| `tied_plumb_diff_impact_preview` | Diff impact preview |
| `requirement_list_state_guide` | REQ state guide |
| `citdp_record_write` | Write CITDP YAML record |

### Batch updates

| Tool | Purpose |
|------|---------|
| `yaml_updates_apply` | Apply batched YAML mutations |

Feedback and LEAP proposal tools are documented in sibling glossaries ([`feedback-to-tied.md`](feedback-to-tied.md), [`leap-proposal-queue.md`](leap-proposal-queue.md)).

---

## Index file names (exact)

| Index key | File under `tied/` |
|-----------|-------------------|
| `requirements` | `requirements.yaml` |
| `architecture` | `architecture-decisions.yaml` |
| `implementation` | `implementation-decisions.yaml` |
| `semantic-tokens` | `semantic-tokens.yaml` |

---

## Pseudo-code block names

| Preferred term | UPPER_SNAKE block | Owning IMPL |
|----------------|-------------------|-------------|
| (MCP core has no dedicated essence_pseudocode blocks in project IMPLs; behavior in TypeScript modules) | — | — |

---

## Alphabetical index

| Term | Section |
|------|---------|
| bundled skill | Preferred terms |
| citdp_record_write | MCP catalog |
| impl_detail_set_essence_pseudocode | MCP catalog |
| merged view | Preferred terms |
| TIED base path | Preferred terms |
| TIED methodology repository | Preferred terms |
| TIED_REPO_ROOT | Naming bridge |
| tied-cli | Preferred terms |
| tied_validate_consistency | MCP catalog |
| tied_verify | MCP catalog |
| TIED_MCP_BIN | Naming bridge |
| TIED_YAML MCP | Preferred terms |
| yaml_detail_update | MCP catalog |
| yaml_index_insert | MCP catalog |
