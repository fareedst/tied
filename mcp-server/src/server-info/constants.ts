/**
 * [REQ-MCP_SERVER_INFO] [IMPL-MCP_SERVER_INFO] [ARCH-MCP_SERVER_INFO]
 * Response contract and tool-surface version constants.
 */

export const RESPONSE_SCHEMA_VERSION = "1.0.0";

/** Application MCP tool surface semver ([REQ-MCP_SERVER_INFO]). */
export const TOOL_CONTRACT_VERSION = "1.0.0";

export const API_SCHEMA_VERSION = "tied-yaml-canonical-v1";

export const SUPPORTED_OPERATIONS = ["read", "validate", "write", "verify"] as const;

/** MCP protocol dates this server is built to interoperate with (newest last). */
export const SUPPORTED_MCP_PROTOCOL_VERSIONS = [
  "2024-11-05",
  "2025-03-26",
  "2025-06-18",
  "2025-11-25",
] as const;

export const PROCESS_STARTED_AT = new Date();
