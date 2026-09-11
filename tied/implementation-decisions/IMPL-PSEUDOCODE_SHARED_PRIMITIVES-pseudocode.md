# [IMPL-PSEUDOCODE_SHARED_PRIMITIVES] [ARCH-PSEUDOCODE_PARSER_UNIFICATION] [REQ-PSEUDOCODE_PARSER_UNIFICATION]
# Summary: Shared read-only parsing primitives consumed by Layer B validator and analysis parser without changing validator v1 output.

# [IMPL-PSEUDOCODE_SHARED_PRIMITIVES] [ARCH-PSEUDOCODE_PARSER_UNIFICATION] [REQ-PSEUDOCODE_PARSER_UNIFICATION]
# How: Export token, procedure-range, and contract-field helpers with no imports from validator or parser modules.
Contract:
  INPUT: source text or line arrays
  OUTPUT: semantic tokens, procedure ranges, contract field labels
  PRE: callers supply normalized UTF-8 text split on CRLF or LF
  POST: helpers are pure, deterministic, and use fresh regex instances per call
  EFFECTS: pure
  TERMINATION: total
  FAILURE_MODES: none fatal
  DATA_TRANSITION: none

# [IMPL-PSEUDOCODE_SHARED_PRIMITIVES] [ARCH-PSEUDOCODE_PARSER_UNIFICATION] [REQ-PSEUDOCODE_PARSER_UNIFICATION]
# How: Extract bracketed REQ/ARCH/IMPL tokens in source order or unique sorted order.
procedure EXTRACT_SEMANTIC_TOKENS(text, options):
  # [IMPL-PSEUDOCODE_SHARED_PRIMITIVES] [ARCH-PSEUDOCODE_PARSER_UNIFICATION] [REQ-PSEUDOCODE_PARSER_UNIFICATION]
  Contract:
    INPUT: pseudo-code text, optional unique flag
    OUTPUT: token id list
    PRE: text is a string
    POST: regex state does not leak between calls; unique mode returns sorted distinct tokens
    EFFECTS: pure
    TERMINATION: total
  MATCH semantic token pattern with a fresh regex instance
  IF options.unique: RETURN sorted distinct tokens
  RETURN tokens in match order

# [IMPL-PSEUDOCODE_SHARED_PRIMITIVES] [ARCH-PSEUDOCODE_PARSER_UNIFICATION] [REQ-PSEUDOCODE_PARSER_UNIFICATION] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
# How: Scan procedure/function/block headings and derive half-open [start, end) CFG ranges plus tokenScanStart/tokenScanEnd for Layer B token linkage.
procedure SCAN_PROCEDURE_BLOCKS(lines):
  # [IMPL-PSEUDOCODE_SHARED_PRIMITIVES] [ARCH-PSEUDOCODE_PARSER_UNIFICATION] [REQ-PSEUDOCODE_PARSER_UNIFICATION] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
  Contract:
    INPUT: source lines
    OUTPUT: ordered procedure ranges with kind, [start, end) CFG bounds, and [tokenScanStart, tokenScanEnd) token bounds
    PRE: lines is an array
    POST: ranges preserve source order; contiguous external `# [TOKEN]` block-leads above a heading attach to that procedure; trailing inter-procedure block-leads are excluded from the previous procedure token scan; CFG ranges remain half-open between headings
    EFFECTS: pure
    TERMINATION: total
  FOR each line: IF heading matches procedure/function/block THEN record start index
  FOR each recorded start:
    SET end to next start or line count
    WALK upward from start while lines are contiguous block-lead comments matching `# [REQ|ARCH|IMPL-` and SET tokenScanStart
    WALK backward from end while lines before end are inter-procedure block-lead comments and SET tokenScanEnd
  RETURN ranges

# [IMPL-PSEUDOCODE_SHARED_PRIMITIVES] [ARCH-PSEUDOCODE_PARSER_UNIFICATION] [REQ-PSEUDOCODE_PARSER_UNIFICATION]
# How: Collect contract field labels in first-seen order without duplicates.
procedure PARSE_CONTRACT_FIELDS(lines):
  # [IMPL-PSEUDOCODE_SHARED_PRIMITIVES] [ARCH-PSEUDOCODE_PARSER_UNIFICATION] [REQ-PSEUDOCODE_PARSER_UNIFICATION]
  Contract:
    INPUT: lines from a contract section or block body
    OUTPUT: field label list
    PRE: lines is an array
    POST: duplicate labels after first occurrence are ignored; order follows source
    EFFECTS: pure
    TERMINATION: total
  FOR each line: IF contract field label matches THEN append unseen labels
  RETURN labels
