# REA target-repo-observed receipt

**Captured:** 2026-11-08  
**Method:** GitHub raw/API read-only; no `npx rea-agents setup`, no target test execution from stdd.

| Field | Value | Label |
| --- | --- | --- |
| Repository | https://github.com/morluto/rea | target-repo-observed |
| npm package | `rea-agents` | target-repo-observed |
| package.json version | `6.8.0` | target-repo-observed |
| MCP registry name | `io.github.morluto/rea` | target-repo-observed |
| License | MIT | target-repo-observed |
| Primary skill | `.agents/skills/reverse-engineer-anything/SKILL.md` (metadata version `61` in skill front matter) | target-repo-observed |
| Other bundled skills | `rea-analysis-optimization`, `rea-changelog-update`, `rea-ci-tests-audit`, `rea-tool-design` | target-repo-observed |
| Setup entry | `npx rea-agents setup` | target-repo-observed |
| Node (README pin) | 22.x (>=22.23.4), 24.x (>=24.22.1), or 26.12.1+ | target-repo-observed |
| Cursor client id | `cursor` in supported agents table | target-repo-observed |
| Schema env vars | `REA_MCP_INPUT_SCHEMA_PROFILE`, `REA_MCP_OUTPUT_SCHEMA_PROFILE` | target-repo-observed |
| Evidence contract | `docs/reference/mcp-contracts.md` — normalized_result, evidence_id, retained bundles | target-repo-observed |

**stdd did not** run REA MCP, CLI analyze against a target binary, or vendor CI during this capture.
