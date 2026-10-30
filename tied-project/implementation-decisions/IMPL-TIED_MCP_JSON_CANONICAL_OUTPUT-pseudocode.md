# [IMPL-TIED_MCP_JSON_CANONICAL_OUTPUT] [ARCH-TIED_MCP_JSON_CANONICAL_OUTPUT] [REQ-TIED_MCP_JSON_CANONICAL_OUTPUT]

Grammar-Version: v2

## CANONICALIZE_MCP_JSON_DOCUMENT

procedure CANONICALIZE_MCP_JSON_DOCUMENT(cfg):
  # [IMPL-TIED_MCP_JSON_CANONICAL_OUTPUT] [ARCH-TIED_MCP_JSON_CANONICAL_OUTPUT] [REQ-TIED_MCP_JSON_CANONICAL_OUTPUT]
  # How: depth-first sort object keys; sort env/headers maps; preserve args array order.
  Contract:
    PRE: cfg is a plain object or nullish (empty object returned)
    INPUT: parsed mcp.json root object
    OUTPUT: new object tree with alphabetically sorted keys at each object level
    EFFECTS: none on input (deep copy semantics via new objects)
    POST: mcpServers and env keys are localeCompare sorted; args arrays unchanged
    TERMINATION: total
  IF cfg is not a plain object THEN RETURN empty object
  RETURN canonicalizeValue(cfg, undefined)

procedure REFRESH_TIED_MCP_SERVERS_JSON_WRITE(cfg, path):
  # [IMPL-TIED_MCP_JSON_CANONICAL_OUTPUT] [ARCH-TIED_MCP_JSON_CANONICAL_OUTPUT] [REQ-TIED_MCP_JSON_CANONICAL_OUTPUT]
  # How: merge tied-yaml entries then canonicalize before JSON.stringify write.
  Contract:
    PRE: cfg contains mcpServers object after tied-yaml merge
    INPUT: cfg, mcpJsonPath
    OUTPUT: pretty-printed JSON file on disk
    EFFECTS: writes canonical key order to mcpJsonPath
    POST: on-disk file matches canonicalizeMcpJsonDocument rules
    TERMINATION: total
  cfg := CANONICALIZE_MCP_JSON_DOCUMENT(cfg)
  WRITE JSON.stringify(cfg, indent 2) to mcpJsonPath
