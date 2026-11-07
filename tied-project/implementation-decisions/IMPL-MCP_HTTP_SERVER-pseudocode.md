# IMPL-MCP_HTTP_SERVER essence pseudocode

<!-- [IMPL-MCP_HTTP_SERVER] [ARCH-MCP_HTTPS_REMOTE_TRANSPORT] [REQ-MCP_HTTPS_REMOTE_ACCESS] Shared factory and Streamable HTTP listener. -->

## CREATE_TIED_YAML_MCP_SERVER

```
INPUT: profile, optional server_info transport extras
OUTPUT: McpServer with profile-selected tools and resources

# Implements REQ-MCP_HTTPS_REMOTE_ACCESS dual transport tool surface
SELECT activeTools FROM selectToolsForProfile(allTools, profile)
SET server_info runtime context (transport, httpListen)
REGISTER tools and optional resources on McpServer
```

## START_MCP_HTTP_SERVER

```
PRE: mcpServer connected; bearer token when required for bind
POST: HTTP server listening on host:port/mcp

ASSERT bind policy for non-loopback
CREATE express app via createMcpExpressApp
IF bearerToken THEN middleware 401 on /mcp
CONNECT StreamableHTTPServerTransport stateful session
ROUTE GET POST DELETE /mcp -> transport.handleRequest
LISTEN httpServer
```
