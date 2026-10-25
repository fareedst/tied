/**
 * [IMPL-MCP_STDIO_CONSOLE_GUARD] Side-effect import: install guard before other MCP server modules load.
 */
import { installMcpStdioConsoleGuard } from "./mcp-stdio-console-guard.js";

installMcpStdioConsoleGuard();
