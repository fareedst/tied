# [IMPL-GOAGENT-FEATURESPEC] [ARCH-GOAGENT-YAML-FEATURESPEC] [REQ-GOAGENT-FEATURESPEC-BATCH]
# Summary: Normalize root; validate records; sort by order; filter; render markdown; LoadTurns sets ChainFromPrevious=false.

# How: Contract I/O (same IMPL/ARCH/REQ). Cross-IMPL — callee of IMPL-GOAGENT-PIPELINE and IMPL-GOAGENT-CLI-CMD Preview; Turn from IMPL-GOAGENT-LIB-TYPES. Ruby parity: FeatureSpecBatchPrompts (not a separate IMPL token).

# INPUT: YAML path; Options (order filter, etc.).
# OUTPUT: messages []string; LoadTurns yields Turn per record with ChainFromPrevious false.
# DATA: yaml.Node or typed structs per implementation.


Grammar-Version: v2

procedure featurespec_from_yaml(path, opts):
  Contract:
    INPUT: path: string where length(path) > 0; Options (order filter)
    PRE: path readable
    OUTPUT: []string messages; LoadTurns yields Turn per record with ChainFromPrevious false
    POST:
      - success => records normalized, sorted, filtered, rendered to markdown messages
      - failure => parse or validation error returned to caller
    FAILURE_MODES: YAML_PARSE_ERROR, VALIDATION_ERROR
    EFFECTS: IO

  # [IMPL-GOAGENT-FEATURESPEC] [ARCH-GOAGENT-YAML-FEATURESPEC] [REQ-GOAGENT-FEATURESPEC-BATCH]
  # How: Parse YAML to nodes; mappingHasKey detects sort need; selectByOrder skips nil order; messageForRecord builds sections.
  ON parse or validation error: return error to caller
  return []string messages

procedure featurespec_Preview(path, opts, writer):
  Contract:
    INPUT: path: string where length(path) > 0; Options; writer: io.Writer where writer != nil
    PRE: path readable; writer non-nil
    OUTPUT: preview markdown written to writer
    POST:
      - success => === headers and record sections written
      - failure => parse or validation error returned to caller
    FAILURE_MODES: YAML_PARSE_ERROR, VALIDATION_ERROR, WRITE_ERROR
    EFFECTS: IO

  # [IMPL-GOAGENT-FEATURESPEC] [ARCH-GOAGENT-YAML-FEATURESPEC] [REQ-GOAGENT-FEATURESPEC-BATCH]
  # How: Preview writes === headers to io.Writer.
  CALL featurespec_from_yaml WITH path and opts
  WRITE preview sections TO writer