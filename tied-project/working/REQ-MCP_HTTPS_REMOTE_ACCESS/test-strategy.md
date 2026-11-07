# Test strategy — REQ-MCP_HTTPS_REMOTE_ACCESS

**Gate:** RED files authored in `@build-plan` before production implementation.  
**Profile:** minimal depth; no new adversarial activation.

---

## Unit — server factory

| Test file | RED assertion |
| --- | --- |
| `mcp-server/src/tied-mcp-server-factory.test.ts` | Factory returns `McpServer` with tool count matching profile (`core` / `optin` / invalid throws). |
| Refactor guard | Existing `tool-profile-stdio.test.ts` and `server-info.test.ts` remain green after `index.ts` thinning. |

---

## Unit — HTTP bearer and bind

| Case | Expected |
| --- | --- |
| `GET /mcp` without `Authorization` | **401** |
| Bearer wrong secret | **401** |
| Bearer correct | **200** on MCP initialize handshake (Streamable HTTP POST body) |
| `TIED_MCP_HTTP_HOST=0.0.0.0` and empty token at startup | **exit 1** + stderr `DIAGNOSTIC` |
| Loopback bind without token | **Allowed** (dev ergonomics; document LAN risk) |

**File:** `mcp-server/src/mcp-http-server.test.ts` (supertest + ephemeral port).

---

## Composition — MCP protocol

| Case | Expected |
| --- | --- |
| Core HTTP: `tools/list` | Count matches `selectToolsForProfile(..., 'core')` |
| Optin HTTP: `tools/list` | Count matches optin profile |
| `server_info` over HTTP tool call | `structuredContent.transport === 'streamable_http'` |

Reuse temp corpus pattern from `yaml-loader.test.ts` / `bindWritableProjectCorpus()` where writes are not needed.

---

## CLI / CJS

| Test file | Case |
| --- | --- |
| `mcp-server/test/tied-cli-http.test.cjs` | Spawn local HTTP server fixture; `TIED_CLI_MCP_URL` + `TIED_CLI_MCP_BEARER`; `tied-cli.sh yaml_index_list_tokens` returns tokens. |
| Regression | Without `TIED_CLI_MCP_URL`, existing stdio `tied-cli` tests unchanged. |

---

## Bootstrap / policy

| Test | Change |
| --- | --- |
| `tools/bootstrap/lib/tied-env-allowlist-inventory.test.mjs` | New keys: `TIED_MCP_HTTP_HOST`, `TIED_MCP_HTTP_PORT`, `TIED_MCP_HTTP_BEARER_TOKEN`, `TIED_MCP_HTTP_ALLOWED_HOSTS`, `TIED_CLI_MCP_URL`, `TIED_CLI_MCP_BEARER`. |

---

## Contract

| Artifact | Change |
| --- | --- |
| `mcp-server/contracts/server_info/*.json` | Optional `transport`, `http_listen` summary; bump only if schema requires. |
| `server-info.test.ts` | Golden update for stdio default `transport: stdio`. |

---

## Manual evidence (working folder)

Document in `evidence/manual-smoke-checklist.md` (author during build-plan close):

1. `docker compose -f mcp-server/deploy/docker-compose.https.yml up` — core + optin healthy.
2. `curl -k -H "Authorization: Bearer …" https://localhost/mcp` — MCP session (or documented MCP client).
3. Cursor: add `tied-yaml-remote` + optin remote entries; run `tied_config_get_base_path`.
4. Container `tied-cli.sh` with `host.docker.internal` URL (platform note).

---

## Command sequence (verification gate)

```text
cd mcp-server && npm run build && npm test
node --test tools/bootstrap/lib/tied-env-allowlist-inventory.test.mjs
```
