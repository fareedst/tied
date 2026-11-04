# PLAN — REQ-TIED_GIT_HYGIENE (test-all-hygiene close-out wave)

| Field | Value |
| --- | --- |
| **Request** | [REQ-TIED_GIT_HYGIENE](../../requirements/REQ-TIED_GIT_HYGIENE.yaml) |
| **Wave** | Store operator `test-all-hygiene` shell companion to existing `tied_git_hygiene` MCP |
| **Depth** | `minimal` / gate_policy `default` |

## Goal

After `test-all` / `test-mcp`, operators can run `test-all-hygiene` (or `--dry-run`) to restore tracked regenerable paths and delete known untracked gate-test CITDP litter without MCP apply.

## Deliverables

- `scripts/build-commands.sh` — `test_all_hygiene` + alias
- `tools/bootstrap/build-commands-test-all-hygiene.test.mjs`
- LEAP: REQ/ARCH/IMPL + pseudo-code `RUN_STORE_TEST_ALL_HYGIENE`
- CITDP persist on close-out

## Verification

```bash
node --test tools/bootstrap/build-commands-test-all-hygiene.test.mjs
cd mcp-server && npm test -- project-operations/git-hygiene.test.ts
```
