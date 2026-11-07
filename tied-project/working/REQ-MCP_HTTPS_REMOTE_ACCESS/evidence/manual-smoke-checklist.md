# Manual smoke — REQ-MCP_HTTPS_REMOTE_ACCESS

1. Build: `cd mcp-server && npm run build`
2. Core HTTP: `TIED_MCP_HTTP_BEARER_TOKEN=devtoken TIED_MCP_TOOL_PROFILE=core node dist/http-entry.js`
3. CLI: `TIED_CLI_MCP_URL=http://127.0.0.1:8787/mcp TIED_CLI_MCP_BEARER=devtoken tied-cli.sh server_info '{}'`
4. Docker (optional): set `TIED_CLIENT_ROOT` and bearer in `.env`, `docker compose -f mcp-server/deploy/docker-compose.https.example.yml config`
5. Cursor: add remote `url` entries for core and optin vhosts from `deploy/Caddyfile.example`
