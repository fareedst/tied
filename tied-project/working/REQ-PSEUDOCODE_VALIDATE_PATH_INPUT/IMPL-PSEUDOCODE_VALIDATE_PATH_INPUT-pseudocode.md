# [IMPL-PSEUDOCODE_VALIDATE_PATH_INPUT] [ARCH-PSEUDOCODE_INPUT_RESOLUTION] [REQ-PSEUDOCODE_VALIDATE_PATH_INPUT]
# How: Resolve essence pseudocode from inline text, sandboxed path, or IMPL default sidecar, then call Layer B validate unchanged.

procedure RESOLVE_ESSENCE_PSEUDOCODE_SOURCE:
  # [IMPL-PSEUDOCODE_VALIDATE_PATH_INPUT] [ARCH-PSEUDOCODE_INPUT_RESOLUTION] [REQ-PSEUDOCODE_VALIDATE_PATH_INPUT]
  # How: Single entry for validate (and optionally analyze) to pick one read-only source under TIED_BASE_PATH.
  Contract:
    INPUT: basePath, args (token, pseudocode?, essence_pseudocode_path?, pseudocode_path?)
    OUTPUT: resolvedSource { content, sourceKind }
    PRE: basePath is absolute TIED project root
    POST: exactly one source selected OR structured input error
    EFFECTS: read-only filesystem under basePath
    FAILURE_MODES: AMBIGUOUS_INPUT, MISSING_INPUT, PATH_NOT_UNDER_TIED_BASE, read failures
  IF args.pseudocode is non-empty trimmed string THEN
    RETURN { content: args.pseudocode, sourceKind: "inline" }
  IF args.essence_pseudocode_path and args.pseudocode_path both set THEN
    RETURN error AMBIGUOUS_INPUT
  pathUser := args.essence_pseudocode_path OR args.pseudocode_path
  IF pathUser is non-empty THEN
    resolved := CALL resolvePseudocodePathUnderTiedBase(pathUser, basePath)
    IF resolved fails THEN RETURN mapped input error
    read := CALL readTextFromPseudocodePath(resolved.absolutePath)
    IF read fails THEN RETURN read error
    RETURN { content: read.content, sourceKind: "path" }
  IF args.token matches IMPL token pattern THEN
    defaultRel := "implementation-decisions/" + args.token + "-pseudocode.md"
    resolved := CALL resolvePseudocodePathUnderTiedBase(defaultRel, basePath)
    IF resolved fails THEN RETURN mapped input error
    read := CALL readTextFromPseudocodePath(resolved.absolutePath)
    IF read fails THEN RETURN read error
    RETURN { content: read.content, sourceKind: "default_sidecar" }
  RETURN error MISSING_INPUT

procedure PSEUDOCODE_VALIDATE_MCP_HANDLER:
  # [IMPL-PSEUDOCODE_VALIDATE_PATH_INPUT] [IMPL-QUALITY_PSEUDOCODE_VALIDATOR] [REQ-PSEUDOCODE_VALIDATE_PATH_INPUT]
  # How: MCP tool pseudocode_validate resolves source then delegates to validateEssencePseudocode.
  Contract:
    INPUT: MCP args (token, optional pseudocode, optional path fields, optional gate flags)
    OUTPUT: layer-b-pseudocode-validator.v1 JSON text content OR input-stage error JSON
    PRE: Zod accepts optional pseudocode and path fields
    POST: Layer B report identical to inline path when content matches
    EFFECTS: none on TIED YAML
  resolved := CALL RESOLVE_ESSENCE_PSEUDOCODE_SOURCE with getBasePath() and args
  IF resolved is error THEN RETURN { ok: false, stage: "input", error: resolved.code }
  RETURN CALL validateEssencePseudocode with { ...args, pseudocode: resolved.content }
