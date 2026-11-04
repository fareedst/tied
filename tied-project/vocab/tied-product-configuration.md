# TIED product configuration (canonical)

**Scope:** First-party **TIED-the-product** configuration surfaces (stdd store): install-managed disk, MCP spawn env, CLI session keys, secrets—not [`tied-bundle/docs/ai-principles.md`](../../tied-bundle/docs/ai-principles.md) methodology.

**Traceability:** `[REQ-TIED_ENVIRONMENT_VARIABLE_POLICY]` · composes with `[REQ-TIED_RUNTIME_DISK_CONFIG]`, `[REQ-TIED_CONFIG_REPORT]`, `[REQ-TIED_CLI_MCP_JSON_BASE_PATH]`.

**See also:** [`tied-yaml-mcp.md`](tied-yaml-mcp.md) (naming bridge) · [`../working/REQ-TIED_ENVIRONMENT_VARIABLE_POLICY/PLAN-refine.md`](../working/REQ-TIED_ENVIRONMENT_VARIABLE_POLICY/PLAN-refine.md)

---

## Preferred terms

| Term | Synonyms (avoid alone) | Meaning |
|------|------------------------|---------|
| **configuration plane** | settings layer | Where effective behavior is defined: YAML on disk, MCP JSON, CLI flags, MCP tools/APIs—not ad hoc shell exports. |
| **spawn-injected env** | mcp env block | Values written by `tied-install` into `.cursor/mcp.json` for IDE MCP child process; disk-backed, not operator `export`. |
| **operator shell export** | shell env | `export TIED_*` in the parent shell; must not override install-managed global paths ([REQ-TIED_RUNTIME_DISK_CONFIG](../requirements/REQ-TIED_RUNTIME_DISK_CONFIG.yaml)). |
| **env allowlist** | env inventory | Committed catalog of permitted first-party `process.env` reads in production code paths; enforced by inventory test ([REQ-TIED_ENVIRONMENT_VARIABLE_POLICY](../working/REQ-TIED_ENVIRONMENT_VARIABLE_POLICY/PLAN-refine.md)). |
| **env class** | env category | `global_path`, `operator_toggle`, `spawn_transport`, `cli_session`, `secret`, `diagnostic`, `test_only`, `deprecated_legacy`. |
| **design test** | env review | Four-question gate before adding a new env key (see [PRINCIPLE.md](../working/REQ-TIED_ENVIRONMENT_VARIABLE_POLICY/PRINCIPLE.md)). |

---

## Distinctions

| Concept A | Concept B | Rule |
|-----------|-----------|------|
| spawn-injected env | operator shell export | RDC ignores shell global paths; spawn env comes from install refresh. |
| configuration plane | operational control | State transitions and feature toggles prefer MCP tools/CLI; env is input, not authority (rule 8). |
| env catalog | tied-yaml-mcp naming bridge | Catalog is normative for policy; vocab bridge summarizes common keys for agents. |
