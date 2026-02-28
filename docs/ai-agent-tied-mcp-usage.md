# AI Agent Directive: TIED Data via MCP

**Audience**: AI agents operating in TIED projects. **Do not treat this as human-facing prose.**

**Purpose**: Define how TIED directs the build, and require the TIED MCP server as the primary interface to TIED data. Direct file access remains allowed when necessary; such cases are candidates for new MCP tools.

---

## 1. TIED directs the build

- The TIED **database** (YAML indexes and detail files under `tied/` or `TIED_BASE_PATH`) **controls and directs** the creation of code and tests.
- **All code of significance is created in TIED first**: requirements (REQ), then architecture (ARCH) and implementation (IMPL) decisions, with full traceability. Only then is it implemented in source and tests using **TDD**.
- The flow is: **TIED data → tests → code**. TIED is the source of truth for intent; tests and code realize it.

---

## 2. Primary interface: TIED MCP server

- **Use the TIED MCP server as the primary way to read and write TIED data** for the project.
- Prefer **MCP tools** for:
  - Reading indexes and records: `yaml_index_read`, `yaml_index_list_tokens`, `yaml_index_filter`, `get_decisions_for_requirement`, `get_requirements_for_decision`
  - Reading/writing detail files: `yaml_detail_read`, `yaml_detail_read_many`, `yaml_detail_list`, `yaml_detail_create`, `yaml_detail_update`, `yaml_detail_delete`
  - Creating or updating index records: `yaml_index_insert`, `yaml_index_update`, `tied_token_create_with_detail`
  - Validation: `yaml_index_validate`, `tied_config_get_base_path`
  - Conversion and inspection: `convert_monolithic_*`, `convert_detail_markdown_to_yaml`, `tied_import_summary`
- Prefer **MCP resources** (e.g. `tied://requirements`, `tied://requirement/{token}/detail`) when loading TIED context for reasoning or tool input.
- Before changing TIED content, **read** the current state via MCP (tools or resources); after changing it, use the appropriate **write** or **update** tool so the on-disk TIED db stays consistent.

---

## 3. When direct file access is allowed

- **Direct read/write of TIED files** (e.g. under `tied/` or the path reported by `tied_config_get_base_path`) is **allowed only when**:
  - No MCP tool or resource exists that can perform the needed operation, or
  - The operation is one-off or exploratory and will be replaced by MCP usage once a tool exists.
- When you use direct file access:
  - Prefer the path returned by `tied_config_get_base_path` (or the configured `TIED_BASE_PATH`) so behavior matches the server.
  - Treat the case as a **candidate for a new MCP tool**: the gap should be noted (e.g. in implementation decisions or a short note) so maintainers can extend the MCP server to cover it and eventually provide full support via tools.

---

## 4. Agent workflow summary

| Action | Use |
|--------|-----|
| Discover or confirm TIED base path | `tied_config_get_base_path` |
| Read requirements, architecture, implementation, or semantic-tokens index | `yaml_index_read` or resources `tied://requirements`, etc. |
| Read/write a single REQ/ARCH/IMPL detail | `yaml_detail_read`, `yaml_detail_create`, `yaml_detail_update`, `yaml_detail_delete` |
| Traceability (REQ ↔ ARCH/IMPL) | `get_decisions_for_requirement`, `get_requirements_for_decision` |
| Create new token with index + detail | `tied_token_create_with_detail` |
| Validate index YAML | `yaml_index_validate` |
| Migrate monolithic docs or detail markdown | `convert_monolithic_*`, `convert_detail_markdown_to_yaml` |
| Operation not covered by any tool | Direct file access; document the gap for future tooling |

---

## 5. References

- **Tool and resource list**: [mcp-server/README.md](../mcp-server/README.md)
- **Setup and passes**: [adding-tied-mcp-and-invoking-passes.md](adding-tied-mcp-and-invoking-passes.md)
- **Agent operating guide**: [AGENTS.md](../AGENTS.md); **principles**: [ai-principles.md](../ai-principles.md)
