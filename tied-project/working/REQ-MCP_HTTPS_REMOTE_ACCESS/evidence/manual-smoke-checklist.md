# Manual smoke — REQ-MCP_HTTPS_REMOTE_ACCESS

1. Build: `cd mcp-server && npm run build`
2. Core HTTP (required before step 3): either (a) local `cd mcp-server && TIED_MCP_HTTP_BEARER_TOKEN=devtoken node dist/http-entry.js`, or (b) `docker compose --env-file mcp-server/deploy/.env -f mcp-server/deploy/docker-compose.https.example.yml up -d tied-mcp-core` (publishes `127.0.0.1:8787`)
3. CLI: `TIED_CLI_MCP_URL=http://127.0.0.1:8787/mcp TIED_CLI_MCP_BEARER=devtoken tied-cli.sh server_info '{}'`
4. Docker (optional): from repo root, `docker compose --env-file .env -f mcp-server/deploy/docker-compose.https.example.yml config` (root `.env` is not read automatically). Or `cp mcp-server/deploy/.env.example mcp-server/deploy/.env`. Defaults: `TIED_CLIENT_ROOT=../..`, bearer `changeme` if unset.
5. Cursor: add remote `url` entries for core and optin vhosts from `deploy/Caddyfile.example`
