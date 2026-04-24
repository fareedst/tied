# [IMPL-MCP_FEEDBACK_TOOLS] [ARCH-FEEDBACK_STORAGE] [REQ-FEEDBACK_TO_TIED]
# Summary: Pure feedback module loads/appends/exports feedback.yaml; MCP handlers stay thin JSON envelopes.

# How: INPUT/OUTPUT/DATA contract for feedback module (same IMPL/ARCH/REQ). Composition: independent of IMPL-MCP_LEAP_PROPOSAL_QUEUE — distinct paths (feedback.yaml vs leap-proposals/); no shared mutable DATA at runtime.

# INPUT: optional basePath (TIED root); append params (type, title, description, optional context); export format (markdown|json).
# OUTPUT: structured entries; add returns ok, id, created_at, optional report_snippet; export returns formatted string; file on disk under {base}/feedback.yaml.
# DATA: feedback.yaml schema with entries[]; ids and timestamps.

# procedure loadFeedback(basePath):
# [IMPL-MCP_FEEDBACK_TOOLS] [ARCH-FEEDBACK_STORAGE] [REQ-FEEDBACK_TO_TIED]
# How: Resolve path via getFeedbackPath; read YAML or default { entries: [] }.
# How: Corrupt YAML — deterministic recovery per feedback.ts tests.
ON parse error: return safe empty structure or surface error per module policy (tests lock behavior)

# procedure appendEntry(params):
# [IMPL-MCP_FEEDBACK_TOOLS] [ARCH-FEEDBACK_STORAGE] [REQ-FEEDBACK_TO_TIED]
# How: Validate type/title/description; generate id; set created_at; append; write file.
# How: IO/validation failure surfaces to MCP handler envelope.
ON IO or validation error: propagate to caller for MCP { ok: false, error }

# procedure MCP_HANDLER tied_feedback_add / tied_feedback_export:
# [IMPL-MCP_FEEDBACK_TOOLS] [ARCH-FEEDBACK_STORAGE] [REQ-FEEDBACK_TO_TIED]
# How: Parse tool args; delegate to module; return JSON payload (thin wrapper over loadFeedback/appendEntry/export* only).