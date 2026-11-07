# IMPL-TIED_CLI_HTTP_TRANSPORT essence pseudocode

<!-- [IMPL-TIED_CLI_HTTP_TRANSPORT] [ARCH-MCP_HTTPS_REMOTE_TRANSPORT] [REQ-MCP_HTTPS_REMOTE_ACCESS] tied-cli HTTP branch. -->

## TIED_CLI_TRANSPORT_SELECT

```
IF TIED_CLI_MCP_URL set
  RUN tied-mcp-http-client.mjs
ELSE
  RUN tied-mcp-stdio-client.cjs (unchanged)
```

## HTTP_TOOL_CALL

```
PRE: valid URL and tool name
POST: tool result text on stdout

BUILD StreamableHTTPClientTransport with Authorization bearer header
Client.connect -> callTool -> close
ON failure EMIT DIAGNOSTIC TIED_CLI_HINDRANCE transport_error
```
