# [IMPL-TIED_JEV_CONTEXT_LOG_PRUNING] [ARCH-TIED_JEV_CONTEXT_LOG_PRUNING] [REQ-TIED_JEV_CONTEXT_LOG_PRUNING] — Blueprint A semantic log pruner (chunk, noul disposition, benchmark arms).

Grammar-Version: v2

## Configuration and opt-in

- [IMPL-TIED_JEV_CONTEXT_LOG_PRUNING] [ARCH-TIED_JEV_CONTEXT_LOG_PRUNING] [REQ-TIED_JEV_CONTEXT_LOG_PRUNING] Resolve opt-in flag and thresholds from env; default off preserves prior behavior.
- Contract:
  - INPUT: process env map, optional manifest boolean
  - PRE: env keys are strings or undefined
  - OUTPUT: ContextLogPruningConfig { enabled, passThroughLines, chunkLines, fatalThreshold, boilerplateThreshold, surroundLines }
  - POST: on success, enabled is false when TIED_JEV_CONTEXT_LOG_PRUNING unset or not truthy
  - EFFECTS: pure
  - TERMINATION: total
procedure RESOLVE_CONTEXT_LOG_PRUNING_CONFIG:
  # [IMPL-TIED_JEV_CONTEXT_LOG_PRUNING] [ARCH-TIED_JEV_CONTEXT_LOG_PRUNING] [REQ-TIED_JEV_CONTEXT_LOG_PRUNING] How: map sponsor defaults 30/10/0.40/0.60/±2 and opt-in env.
  Contract:
    INPUT: env, manifestFlag
    OUTPUT: ContextLogPruningConfig
    PRE: true
    POST: on success, passThroughLines=30, chunkLines=10, fatalThreshold=0.40, boilerplateThreshold=0.60, surroundLines=2
    EFFECTS: pure
  SET enabled FROM env TIED_JEV_CONTEXT_LOG_PRUNING equals 1 or true OR manifestFlag
  RETURN config with pinned defaults

## Pass-through and chunking

- [IMPL-TIED_JEV_CONTEXT_LOG_PRUNING] [ARCH-TIED_JEV_CONTEXT_LOG_PRUNING] [REQ-TIED_JEV_CONTEXT_LOG_PRUNING] Split log into lines and chunks; short logs skip Jev entirely.
procedure COUNT_LINES_AND_PASS_THROUGH:
  # [IMPL-TIED_JEV_CONTEXT_LOG_PRUNING] [ARCH-TIED_JEV_CONTEXT_LOG_PRUNING] [REQ-TIED_JEV_CONTEXT_LOG_PRUNING] How: ≤30 lines return input byte-for-byte (SC-PASS-THROUGH).
  Contract:
    INPUT: log text, passThroughLines
    OUTPUT: { passThrough: boolean, lines: string[] }
    PRE: log is string
    POST: when passThrough, output equals input exactly
    EFFECTS: pure
    TERMINATION: total
  SPLIT log BY newline preserving empty trailing semantics
  IF line count <= passThroughLines THEN RETURN passThrough true with lines
  ELSE RETURN passThrough false with lines

procedure SPLIT_INTO_CHUNKS:
  # [IMPL-TIED_JEV_CONTEXT_LOG_PRUNING] [ARCH-TIED_JEV_CONTEXT_LOG_PRUNING] [REQ-TIED_JEV_CONTEXT_LOG_PRUNING] How: contiguous chunkLines slices; last chunk may be shorter.
  Contract:
    INPUT: lines[], chunkLines
    OUTPUT: ChunkDescriptor[] { startIndex, endIndexExclusive, text }
    PRE: chunkLines > 0
    POST: chunks cover all indices exactly once in order
    EFFECTS: pure
    TERMINATION: total
  FOR each window of chunkLines lines EMIT chunk with joined text

## Disposition (deterministic and Jev)

- [IMPL-TIED_JEV_CONTEXT_LOG_PRUNING] [ARCH-TIED_JEV_CONTEXT_LOG_PRUNING] [REQ-TIED_JEV_CONTEXT_LOG_PRUNING] Keep chunk when fatal signal high and boilerplate low; deterministic heuristics for pruner_jev_off arm.
procedure DETERMINISTIC_CHUNK_DISPOSITION:
  # [IMPL-TIED_JEV_CONTEXT_LOG_PRUNING] [ARCH-TIED_JEV_CONTEXT_LOG_PRUNING] [REQ-TIED_JEV_CONTEXT_LOG_PRUNING] How: regex/heuristic fatal and boilerplate scores in [0,1] without vendor.
  Contract:
    INPUT: chunk text
    OUTPUT: { fatal_noul, boilerplate_noul }
    PRE: chunk is non-empty string allowed
    POST: both scores in [0,1]
    FAILURE_MODES: N/A
    EFFECTS: pure
    TERMINATION: total
  SCAN for fatal/diagnostic patterns (error, FAIL, assertion, diagnostic codes)
  SCAN for boilerplate patterns (progress ticks, repeated dots, "Running tests")
  MAP match strength to fatal_noul and boilerplate_noul
  RETURN scores

procedure JEV_CHUNK_FANOUT:
  # [IMPL-TIED_JEV_CONTEXT_LOG_PRUNING] [ARCH-TIED_JEV_CONTEXT_LOG_PRUNING] [REQ-TIED_JEV_CONTEXT_LOG_PRUNING] How: one jevDecide per chunk with fatal_or_diagnostic and pure_boilerplate nouls; fallback keeps chunk on skip/error.
  Contract:
    INPUT: chunk text, jevConfig, forceUnavailable flag
    OUTPUT: { fatal_noul, boilerplate_noul, jev_skipped, latencyMs, usage }
    PRE: chunk length bounded for state policy
    POST: on skip or error, treat as keep chunk (fatal high, boilerplate low sentinel OR explicit keepOriginalChunk)
    FAILURE_MODES: no_credentials, state_too_large, http_error, malformed_answer
    EFFECTS: Http | Async
    TERMINATION: total
  IF forceUnavailable OR jevDecide not ok THEN RETURN fallback keep disposition with jev_skipped true
  ELSE PARSE answers fatal_or_diagnostic and pure_boilerplate nouls
  RETURN scores and telemetry

procedure SHOULD_KEEP_CHUNK:
  # [IMPL-TIED_JEV_CONTEXT_LOG_PRUNING] [ARCH-TIED_JEV_CONTEXT_LOG_PRUNING] [REQ-TIED_JEV_CONTEXT_LOG_PRUNING] How: keep if fatal_noul >= fatalThreshold AND boilerplate_noul < boilerplateThreshold.
  Contract:
    INPUT: fatal_noul, boilerplate_noul, thresholds, arm mode (keep_all for deterministic_only)
    OUTPUT: boolean keep
    PRE: thresholds pinned
    EFFECTS: pure
  IF arm is keep_all THEN RETURN true
  IF fallback keepOriginalChunk THEN RETURN true
  RETURN fatal_noul >= fatalThreshold AND boilerplate_noul < boilerplateThreshold

## Merge with surrounding context

procedure MERGE_KEPT_REGIONS_WITH_SURROUND:
  # [IMPL-TIED_JEV_CONTEXT_LOG_PRUNING] [ARCH-TIED_JEV_CONTEXT_LOG_PRUNING] [REQ-TIED_JEV_CONTEXT_LOG_PRUNING] How: expand kept chunk indices by ±surroundLines; merge overlaps; emit pruned line array deterministically.
  Contract:
    INPUT: lines[], kept chunk index ranges, surroundLines
    OUTPUT: pruned lines[] joined as text
    PRE: surroundLines >= 0
    POST: every kept fatal line from input still present when disposition kept
    EFFECTS: pure
    TERMINATION: total
  FOR each kept chunk EXPAND index range by surroundLines clamped to array bounds
  MERGE overlapping ranges sorted
  EMIT lines in original order for merged ranges
  JOIN with newlines

## Pipeline entry

procedure PRUNE_CONTEXT_LOG:
  # [IMPL-TIED_JEV_CONTEXT_LOG_PRUNING] [ARCH-TIED_JEV_CONTEXT_LOG_PRUNING] [REQ-TIED_JEV_CONTEXT_LOG_PRUNING] How: orchestrate arms raw_before (no op), deterministic_only, pruner_jev_off/on/unavailable via BenchmarkArm parameter.
  Contract:
    INPUT: log, PruneContextLogOptions { arm, config, jevConfig, mockDecide }
    OUTPUT: { text, metrics: ContextLogPruneMetrics }
    PRE: log is string
    POST: raw_before arm yields text equals log; unavailable arm never reduces below input on safety fixtures when fallback applies
    EFFECTS: pure | Http depending on arm
    TERMINATION: total
  IF arm is raw_before THEN RETURN log unchanged with baseline metrics
  RUN pass-through guard; IF passThrough RETURN log
  SPLIT chunks
  FOR each chunk RESOLVE disposition per arm
  COLLECT kept regions
  MERGE and RETURN pruned text plus metrics (bytes/lines/jev calls/latency)
