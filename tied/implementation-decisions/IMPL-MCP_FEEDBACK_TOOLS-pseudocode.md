# [IMPL-MCP_FEEDBACK_TOOLS] [ARCH-FEEDBACK_STORAGE] [REQ-FEEDBACK_TO_TIED]
# Summary: Pure feedback module loads, appends, and exports tied/feedback.yaml; MCP handlers stay thin JSON envelopes. Independent of IMPL-MCP_LEAP_PROPOSAL_QUEUE (feedback.yaml vs leap-proposals/).

Grammar-Version: v2

# [IMPL-MCP_FEEDBACK_TOOLS] [ARCH-FEEDBACK_STORAGE] [REQ-FEEDBACK_TO_TIED]
# How: Module boundary — INPUT/OUTPUT/DATA for all procedures below.
Contract:
  INPUT: optional basePath (TIED root); append params (type, title, description, optional context and promotion fields); export format (markdown|json)
  OUTPUT: FeedbackData; AppendEntryResult; formatted export string; MCP JSON { ok, ... } | { ok: false, error }
  PRE: FEEDBACK_TYPES are feature_request, bug_report, methodology_improvement
  POST: canonical project REQ/ARCH/IMPL YAML indexes are never mutated by this module
  FAILURE_MODES: InvalidFeedbackType, MissingTitle, MissingDescription, InvalidContextJson, FeedbackWriteFailed, FeedbackReadCorrupt
  DATA: {base}/feedback.yaml with entries[] (id, type, title, description, created_at, optional context and promotion fields)
  DATA_TRANSITION: append-only entries via writeCanonicalValueAtomic; load never creates file
  EFFECTS: IO
  TERMINATION: total

procedure GET_FEEDBACK_PATH(basePath):
  # [IMPL-MCP_FEEDBACK_TOOLS] [ARCH-FEEDBACK_STORAGE] [REQ-FEEDBACK_TO_TIED]
  # How: Resolve feedback.yaml under TIED base (getBasePath() when basePath omitted).
  Contract:
    INPUT: optional basePath override
    OUTPUT: absolute path ending in feedback.yaml
    PRE: basePath when set is a string path segment
    POST: path equals join(resolved_base, "feedback.yaml")
    EFFECTS: pure
    TERMINATION: total
  resolved_base = basePath WHEN present ELSE getBasePath()
  RETURN join(resolved_base, "feedback.yaml")

procedure LOAD_FEEDBACK(basePath):
  # [IMPL-MCP_FEEDBACK_TOOLS] [ARCH-FEEDBACK_STORAGE] [REQ-FEEDBACK_TO_TIED]
  # How: Read YAML or return { entries: [] }; corrupt/invalid file yields empty entries (feedback.test.ts locks behavior).
  Contract:
    INPUT: optional basePath
    OUTPUT: FeedbackData { entries: FeedbackEntry[] }
    PRE: none
    POST: file absent => { entries: [] }; parse failure => { entries: [] }; valid object => entries array (default [])
    FAILURE_MODES: FeedbackReadCorrupt (handled internally — empty entries)
    DATA_TRANSITION: read-only; file not created
    EFFECTS: IO
    TERMINATION: total
  filePath = CALL GET_FEEDBACK_PATH(basePath)
  IF file missing: RETURN { entries: [] }
  TRY read UTF-8 and yaml.load
  IF result is object with array entries: RETURN normalized entries
  ON parse or shape error: RETURN { entries: [] }

procedure APPEND_ENTRY(params, basePath):
  # [IMPL-MCP_FEEDBACK_TOOLS] [ARCH-FEEDBACK_STORAGE] [REQ-FEEDBACK_TO_TIED]
  # How: Validate type/title/description; generate id and created_at; append; atomic canonical write.
  Contract:
    INPUT: AppendEntryParams, optional basePath
    OUTPUT: AppendEntryResult { ok, id?, created_at?, yaml_format?, error? }
    PRE: params.type is one of FEEDBACK_TYPES
    POST: ok true => new entry persisted with unique id and ISO created_at; ok false => file unchanged
    FAILURE_MODES: InvalidFeedbackType, MissingTitle, MissingDescription, FeedbackWriteFailed
    DATA_TRANSITION: feedback.yaml entries grow by one on success
    EFFECTS: IO, State
    TERMINATION: total
  IF type not in FEEDBACK_TYPES: RETURN { ok: false, error: InvalidFeedbackType }
  IF trimmed title empty: RETURN { ok: false, error: MissingTitle }
  IF trimmed description empty: RETURN { ok: false, error: MissingDescription }
  id = generateId()
  created_at = ISO timestamp
  entry = build FeedbackEntry from params with optional promotion fields
  data = CALL LOAD_FEEDBACK(basePath)
  APPEND entry to data.entries
  TRY ensure parent dir; writeCanonicalValueAtomic(filePath, { entries })
  ON write failure: RETURN { ok: false, error: FeedbackWriteFailed }
  RETURN { ok: true, id, created_at, yaml_format }

procedure EXPORT_MARKDOWN(entries):
  # [IMPL-MCP_FEEDBACK_TOOLS] [ARCH-FEEDBACK_STORAGE] [REQ-FEEDBACK_TO_TIED]
  # How: Human-readable markdown sections per entry for TIED issue paste.
  Contract:
    INPUT: entries: list of FeedbackEntry where length(entries) > 0
    OUTPUT: markdown string
    PRE: entries is an array
    POST: empty array => "(No feedback entries)"; each entry includes type, title, description, optional context block, id and created_at footer
    EFFECTS: pure
    TERMINATION: total
  FOR each entry: emit ## heading, body, optional JSON context fence, id line, separator
  RETURN joined markdown trimmed

procedure EXPORT_JSON(entries):
  # [IMPL-MCP_FEEDBACK_TOOLS] [ARCH-FEEDBACK_STORAGE] [REQ-FEEDBACK_TO_TIED]
  # How: JSON.stringify entries with pretty print for machine export.
  Contract:
    INPUT: FeedbackEntry[]
    OUTPUT: JSON string
    PRE: entries is an array
    POST: output is valid JSON array of entries
    EFFECTS: pure
    TERMINATION: total
  RETURN JSON.stringify(entries, null, 2)

procedure BUILD_REPORT_SNIPPET(entry):
  # [IMPL-MCP_FEEDBACK_TOOLS] [ARCH-FEEDBACK_STORAGE] [REQ-FEEDBACK_TO_TIED]
  # How: Single-entry markdown snippet for tied_feedback_add optional report_snippet.
  Contract:
    INPUT: one FeedbackEntry
    OUTPUT: markdown snippet string
    PRE: entry has type, title, description, id, created_at
    POST: snippet includes heading, description, optional context, reported-at footer
    EFFECTS: pure
    TERMINATION: total
  BUILD compact markdown from entry fields
  RETURN snippet

procedure MCP_HANDLER_TIED_FEEDBACK_ADD(args):
  # [IMPL-MCP_FEEDBACK_TOOLS] [ARCH-FEEDBACK_STORAGE] [REQ-FEEDBACK_TO_TIED]
  # How: Parse optional context JSON; delegate appendEntry; optionally attach report_snippet from buildReportSnippet.
  Contract:
    INPUT: MCP args { type, title, description, context?, include_report_snippet?, base_path? }
    OUTPUT: JSON text content { ok, id?, created_at?, report_snippet?, error? }
    PRE: zod validates type enum and non-empty title/description at MCP boundary
    POST: append failure => { ok: false, error }; success => { ok: true, id, created_at } and report_snippet when include_report_snippet !== false
    FAILURE_MODES: InvalidContextJson, InvalidFeedbackType, MissingTitle, MissingDescription, FeedbackWriteFailed
    EFFECTS: Async — awaits append path; IO when writing
    TERMINATION: total
  IF context string present AND JSON.parse fails: RETURN { ok: false, error: InvalidContextJson }
  result = AWAIT APPEND_ENTRY(mapped params, args.base_path)
  IF NOT result.ok: RETURN result as JSON
  out = { ok: true, id: result.id, created_at: result.created_at }
  IF include_report_snippet not false:
    entry = find entry by id in LOAD_FEEDBACK(args.base_path)
    IF entry: out.report_snippet = BUILD_REPORT_SNIPPET(entry)
  RETURN JSON text content out

procedure MCP_HANDLER_TIED_FEEDBACK_EXPORT(args):
  # [IMPL-MCP_FEEDBACK_TOOLS] [ARCH-FEEDBACK_STORAGE] [REQ-FEEDBACK_TO_TIED]
  # How: loadFeedback then exportMarkdown or exportJson per format enum.
  Contract:
    INPUT: MCP args { format: markdown|json, base_path? }
    OUTPUT: JSON text (json format) or raw markdown text content
    PRE: format is markdown or json
    POST: output reflects all entries currently in feedback.yaml
    EFFECTS: Async; IO on load
    TERMINATION: total
  data = CALL LOAD_FEEDBACK(args.base_path)
  IF format is json: RETURN textContent(EXPORT_JSON(data.entries))
  RETURN textContent(EXPORT_MARKDOWN(data.entries))
