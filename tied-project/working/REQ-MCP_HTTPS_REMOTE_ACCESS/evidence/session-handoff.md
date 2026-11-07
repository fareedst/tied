# Session handoff — REQ-MCP_HTTPS_REMOTE_ACCESS

| Field | Value |
| --- | --- |
| **handoff_kind** | `session` |
| **date** | 2026-11-07 |
| **request_token** | REQ-MCP_HTTPS_REMOTE_ACCESS |
| **prompt_type** | operator-smoke / post-close fixes (uncommitted) |

## Ledger

| Item | Value |
| --- | --- |
| **Close-out commit** | `49027f6a` — `feat(mcp): Streamable HTTP remote access for dual MCP profiles` |
| **Close-out run** | `close-out-mcp-https-2026-11-06` |
| **Evidence** | [close-out-handoff.md](./close-out-handoff.md), [manual-smoke-checklist.md](./manual-smoke-checklist.md) |

## Shipped (in `49027f6a`)

Streamable HTTP MCP (`http-entry.js`, `tied mcp serve`), dual profile (core/optin), bearer + bind policy, `TIED_CLI_MCP_URL` HTTP client, deploy compose + Caddy example, TIED REQ/ARCH/IMPL stack.

## Post-close fixes (local, not committed)

Operator smoke exposed three gaps; fixes are in the working tree:

| Issue | Root cause | Fix (paths) |
| --- | --- | --- |
| `tied-cli.sh server_info '{}'` → `Cannot read properties of undefined (reading '_zod')` | MCP SDK `validateToolOutput` requires an **object** Zod schema; `z.record()` does not normalize | `mcp-server/src/tools/index.ts` → `z.looseObject({})`; composition test in `server-info-mcp.composition.test.ts` |
| `docker compose … config` → `TIED_CLIENT_ROOT` / bearer missing | Compose interpolates only shell env, `mcp-server/deploy/.env`, or `--env-file`; repo-root `.env` is not auto-loaded | Defaults in `docker-compose.https.example.yml`; `deploy/.env.example`; README + manual-smoke copy |
| `TIED_CLI_MCP_URL=… tied-cli` → `fetch failed` | **ECONNREFUSED** — no listener on `127.0.0.1:8787`; `.env` does not start a server; compose had only `expose`, not host `ports` | Publish `127.0.0.1:8787`/`8788` in compose; manual-smoke requires starting listener; CLI ECONNREFUSED hints in `tied-mcp-http-client.mjs` |

**Suggested commit scope (when ready):** `mcp-server/src/tools/index.ts`, `server-info-mcp.composition.test.ts`, `mcp-server/deploy/*`, `mcp-server/README.md`, `tools/bundled-tied-yaml-skill/scripts/tied-mcp-http-client.mjs`, `manual-smoke-checklist.md`, `deploy/.env.example` (not `.env`).

## Operator quick path (HTTP smoke)

1. `npm run build --prefix mcp-server`
2. **Listener (pick one):**
   - Local: `cd mcp-server && TIED_MCP_HTTP_BEARER_TOKEN=devtoken node dist/http-entry.js`
   - Docker: `docker compose --env-file mcp-server/deploy/.env -f mcp-server/deploy/docker-compose.https.example.yml up -d tied-mcp-core`
3. **CLI:** `TIED_CLI_MCP_URL=http://127.0.0.1:8787/mcp TIED_CLI_MCP_BEARER=devtoken tools/bundled-tied-yaml-skill/scripts/tied-cli.sh server_info '{}'`
4. **Stdio (no HTTP):** `tools/bundled-tied-yaml-skill/scripts/tied-cli.sh server_info '{}` — works after rebuild (no `_zod` once `z.looseObject` is in dist).

**Env cheat sheet**

- Server: `TIED_MCP_HTTP_BEARER_TOKEN`, `TIED_MCP_HTTP_HOST` / `PORT`, corpus via `TIED_CLIENT_PROJECT_PATH` / install mcp.json
- CLI HTTP: `TIED_CLI_MCP_URL`, `TIED_CLI_MCP_BEARER` (or reuse server bearer env)
- Compose: put vars in `mcp-server/deploy/.env` **or** `docker compose --env-file .env` from repo root

## Do next

1. Commit post-close smoke fixes (scoped list above).
2. Optional: push `49027f6a` + follow-up commit.
3. Optional: `bootstrap-remote-template` (deferred v1).
4. Wire `tied_verify` for REQ status automation (manual **Implemented** at close-out).

## Deferred / known

- `tied-cli-http.test.cjs` still deferred in plan.
- `tied_verify` `missing_checklist_gate` at close-out — status set by hand.
- Do **not** commit root `.env` / `mcp-server/deploy/.env` (tokens).
