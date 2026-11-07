# Session handoff — REQ-MCP_HTTPS_REMOTE_ACCESS

| Field | Value |
| --- | --- |
| **handoff_kind** | `session` |
| **date** | 2026-11-06 |
| **request_token** | REQ-MCP_HTTPS_REMOTE_ACCESS |
| **prompt_type** | close-out |

## Plan spine

- **Canonical plan:** [../PLAN-refine.md](../PLAN-refine.md)
- **Phase:** Pre-implementation (plan refined; no product code)
- **CITDP:** [../CITDP-REQ-MCP_HTTPS_REMOTE_ACCESS.yaml](../CITDP-REQ-MCP_HTTPS_REMOTE_ACCESS.yaml)
- **Tracker:** [../agent-req-implementation-checklist.yaml](../agent-req-implementation-checklist.yaml)

## Plan execution steps

### Required

- [x] **author-tied-stack** — Create REQ/ARCH/IMPL records, semantic tokens, IMPL pseudocode sidecars (`pseudocode_validate` gating).
- [x] **red-http-tests** — `mcp-http-server.test.ts`, `mcp-http-auth.test.ts` (tied-cli-http.test.cjs deferred).
- [x] **green-server-factory** — Extract `createTiedYamlMcpServer`; thin stdio `index.ts`.
- [x] **green-http-serve** — `mcp-http-server.ts`, `http-entry.ts`, `tied mcp serve`.
- [x] **green-cli-http** — `TIED_CLI_MCP_URL` branch in bundled client (`tied-mcp-http-client.mjs`).
- [x] **deploy-and-docs** — `mcp-server/deploy/` compose + Caddy; `mcp-server/README.md`; env allowlist; vocab RECORD.
- [x] **leap-server-info** — `extensions.tied.transport` in builder.
- [x] **persist-citdp-and-validate** — `tied-project/citdp/CITDP-REQ-MCP_HTTPS_REMOTE_ACCESS.yaml`; run `tied_validate_consistency` before close-out; [manual-smoke-checklist.md](./manual-smoke-checklist.md).

### Optional

- [ ] **bootstrap-remote-template** — Separate follow-on REQ for opt-in `tied-install --mcp-remote-url` generator (deferred from v1).

### Recommendations

- **Costly:** Treat any public exposure as production incident surface — rotate bearer, restrict proxy to VPN, never commit tokens in compose overrides checked into git (use `.env.example` only).
- Use **two vhosts** at proxy for core vs optin so IDE enablement matches today’s two stdio servers.

### Changelog (this REQ)

| Date | Prompt type | Summary |
| --- | --- | --- |
| 2026-11-06 | add-feature | Initial plan — dual MCP HTTPS via proxy TLS + bearer. |
| 2026-11-06 | refine-plan | Locked defaults (stateful HTTP, `tied mcp serve`, vhosts, module map); CITDP + test strategy + tracker. |
| 2026-11-06 | close-out | Gate `close-out-mcp-https-2026-11-06` allowed; commit `4f7bda90`. |

## Do next

Manual HTTPS smoke optional ([manual-smoke-checklist.md](./manual-smoke-checklist.md)).

## Close-out signals

- **Machine:** [request-evidence-envelope.v1.json](./request-evidence-envelope.v1.json) — `blocking_gap_count: 0`
- **Process:** [checklist-tracker.yaml](../checklist-tracker.yaml); `tied_validate_consistency` ok
- **Ledger:** [close-out-handoff.md](./close-out-handoff.md); commit **`4f7bda90`**
