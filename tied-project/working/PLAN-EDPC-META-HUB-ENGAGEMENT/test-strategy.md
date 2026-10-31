# Test strategy — PLAN-EDPC-META-HUB-ENGAGEMENT

**Change class:** Methodology template + docs · **profile_depth:** minimal · **no REQ mint**

| Check | Command / action | Pass criteria |
| --- | --- | --- |
| MCP base path | `tied_config_get_base_path` | `base_path` ends with `stdd/tied-project` |
| Reference charter validates | `tied_edpc_access_validate`, `tied_edpc_engagement_validate` on DOC paths | Same pass criteria as DOC build-plan (no new blocking errors) |
| Template shape | Manual + diff review | New example YAML includes `engagement_pattern: meta_hub`, `hub_path`, `bounded_path`, `workflows_planned` |
| Doc links | Manual | `edpc-meta-hub-engagement.md` links `[PROC-EDPC_COMPREHENSION]`, working-artifact-placement, DOC corpus map |
| EDPC main doc | Manual | Pointer from `EDPC_Methodology_and_Workflows.md` resolves |
| Index hygiene | `git diff` review | No changes under `tied-project/requirements.yaml`, detail indexes, `semantic-tokens.yaml` |
| MCP unit regressions | Only if template fields require code changes (deferred) | `npm test` under `mcp-server` scoped to `edpc` — **not_applicable** for pass 1 |
| Publish gap smoke (optional) | Republish DOC SCM after template lands | Sponsor documents whether `methodology:meta_hub_edpc_template_deferred` auto-clears |

**RED command(s):** not_applicable (documentation-first deliverables).

**Proof boundary:** Template documents choreography; it does not certify any target repository’s implementation status.
