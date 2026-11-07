# PLAN — [REQ-TIED_MCP_TEST_MCP_JSON_ISOLATION]

**Context:** TIED methodology store (`/Users/fareed/Documents/dev/chatgpt/stdd`).

**Phase:** build-plan complete (close-out deferred).

**Request token:** `REQ-TIED_MCP_TEST_MCP_JSON_ISOLATION`  
**Workflow:** `add-feature` → `@refine-plan` → `@build-plan` → `@close-out`

**Trigger:** Sponsor report — `.cursor/mcp.json` repeatedly reduced to env-only `tied-yaml` stub, breaking IDE MCP and `tied-cli` (`missing args[0]`). Root cause: `bindWritableProjectCorpus()` → `writeInstallMcpJson()` on **live** `…/tied-project` (notably `mcp-http-server.test.ts`).

---

## Problem (locked)

| Mechanism | Effect |
| --- | --- |
| `writeInstallMcpJson` writes `{ mcpServers: { "tied-yaml": { env } } } }` only | No `command`/`args`/`tied-yaml-optin` |
| `bindWritableProjectCorpus(stdd/tied-project)` | **Overwrites** `stdd/.cursor/mcp.json` in the developer checkout |
| `mcp-http-server.test.ts` uses store `tied-project` path | Runs on full `npm test` / HTTP MCP suite |

Prior CHANGELOG noted env stripping in `run-mcp-tests.mjs` but did not block **disk writes** to the store tree.

---

## Scope

| In | Out |
| --- | --- |
| Fail-closed guard in `client-path-env.ts` | Changing production `refreshTiedMcpServersJson` behavior |
| Migrate `mcp-http-server.test.ts` to temp corpus (fixture loader pattern) | Cursor IDE MCP UI merge bugs |
| Composition/static test banning store-path `bindWritableProjectCorpus` | Rewriting all tests to full `tied-install` per case |
| Document hazard in test-helper JSDoc | CI wiring new mandatory job (reuse existing mcp-server tests) |

---

## Proposed implementation (build-plan)

| Step | Slug | Work |
| --- | --- | --- |
| 1 | `red-guard-refuses-store` | Test: `bindWritableProjectCorpus` throws when `projectRoot` equals `TIED_MCP_TEST_REPO_ROOT` (or marker file `.tied/store.yaml` present) |
| 2 | `green-guard-impl` | Implement guard + `TEST_FIXTURE:` error message; allow paths under `os.tmpdir()` or explicit `TIED_MCP_TEST_ALLOW_MCP_JSON_WRITE=1` for rare brownfield tests |
| 3 | `migrate-mcp-http-server-test` | Use `materializeTiedRuntimeFixtureById("linked-client")` or `mkdtemp` + `bindWritableProjectCorpus` on **temp** `tied-project` |
| 4 | `static-offender-scan` | Test (rg or AST walk) asserts no `bindWritableProjectCorpus(tiedProject)` with `storeRoot`/`repoRoot` resolution in `mcp-server/src` |
| 5 | `validate-suite` | `npm test` in `mcp-server` (or targeted files) |

**Tokens (build-plan):** `ARCH-TIED_MCP_TEST_MCP_JSON_ISOLATION`, `IMPL-TIED_MCP_TEST_MCP_JSON_ISOLATION`.

---

## depth_tier / gates

**minimal** · **advisory**

---

## Do next

`@refine-plan` then `@build-plan` for this REQ.
