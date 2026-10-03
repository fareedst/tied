# [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE]
# Summary: Non-canonical LEAP proposals under leap-proposals/; JSONL audit; diff/session helpers; thin tied_leap_proposal_* handlers with safeLeapCall; never write project TIED YAML from queue lifecycle.

# [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE] — Contract (INPUT / OUTPUT / DATA)
# How: Same REQ/ARCH/IMPL as top-level summary; lines below document I/O boundary only.

# INPUT: projectRoot (default cwd); proposal id; lifecycle mutations; extract args (selection, paths, caps); explicit_opt_in for extract/import MCP tools.
# OUTPUT: LeapProposal; MCP JSON { ok, ... } | { ok: false, error }; extractDiffProposalCandidates → candidates[], truncation, optional error (no throw to client).
# DATA: queue.json schema leap-proposal-queue.v1; audit-log.jsonl schema leap-proposal-audit.v1; proposals[].non_canonical = true; no yaml-loader / TIED index mutation.

# [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE] — Composition / collision (see_also IMPL-MCP_FEEDBACK_TOOLS; no composed_with)
# How: LEAP queue ops are independent of feedback append order; no shared files. Parallel MCP tool families under tools/index.ts; pre: distinct paths (leap-proposals/ vs getBasePath()/feedback.yaml); post: each tool returns its own JSON envelope.
# How: Shared DATA: none with IMPL-MCP_FEEDBACK_TOOLS at runtime.

# LOAD_QUEUE(projectRoot)
# [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE]
# How: read queue.json as UTF-8; strip leading BOM (U+FEFF) before JSON.parse; on invalid JSON or wrong schema_version log DIAGNOSTIC and return empty proposals array so callers can still append a fresh queue.

# SAVE_QUEUE(projectRoot, queue) / APPEND_AUDIT(projectRoot, event)
# [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE]
# How: ensure leap-proposals/ exists; write queue.json; append one JSONL audit line; sync fs may throw — MCP layer uses safeLeapCall.

# ADD_PROPOSAL(projectRoot, partial)
# [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE]
# How: load_queue → append pending LeapProposal with generated id → save_queue → append_audit(add).

# REJECT_PROPOSAL / APPROVE_PROPOSAL / MARK_APPLIED / UPDATE_PENDING
# [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE]
# How: load_queue; find proposal; if missing return { ok: false, error } — unit leap-proposal-queue.test.ts
#   ("queue: reject unknown id returns ok false (No proposal branch)") [REQ-LEAP_PROPOSAL_QUEUE]
#   [ARCH-LEAP_PROPOSAL_QUEUE] [IMPL-MCP_LEAP_PROPOSAL_QUEUE]; enforce status gates (reject/update only
#   pending; approve only pending; mark_applied only approved); mutate timestamps; save_queue; append_audit
#   matching action; return { ok: true, proposal }.

# LIST_PROPOSALS(projectRoot, filter?)
# [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE]
# How: load_queue; optional filter by status; return copy of array.

# EXTRACT_DIFF_PROPOSAL_CANDIDATES(args)  [calls type-only PlumbDiffImpactPreviewSelection from plumb-diff-impact-preview]
# [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE]
# [No project IMPL token for plumb-diff module — type-only import for selection enum; algorithm family mirrors plumb-diff git line scan but procedures are local. REQ/ARCH/IMPL for this block remain IMPL-MCP_LEAP_PROPOSAL_QUEUE / ARCH-LEAP_PROPOSAL_QUEUE / REQ-LEAP_PROPOSAL_QUEUE.]
# How: outer TRY — inner EXTRACT_DIFF_INNER resolves projectRootAbs (git rev-parse or args.projectRoot), enumerates staged/unstaged name-only lists, optional path filter, per-file git patch, skip binary, scan '+' lines with heuristics and caps, dedupe; RETURN { candidates, truncation }. CATCH any failure — RETURN { candidates: [], truncation.notice, error } (no throw).

# PARSE_SESSION_EXPORT_SEGMENTS(raw, maxSegments)
# [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE]
# How: trim; try JSON array of {content}|strings or messages split; else split on newline-triple-dash; cap segment count.

# PROPOSALS_FROM_SESSION_SEGMENTS(segments, label?)
# [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE]
# How: map each segment to inferred_session proposal shape (title/summary/source) without ids; trim segment text for summary OUTPUT.

# MCP_HANDLER(tied_leap_proposal_*)
# [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE]
# How: parse zod args; for extract/import require explicit_opt_in true else { ok: false, error }; delegate to module functions; build payload; safeLeapCall(fn) wraps JSON.stringify so sync throws become { ok: false, error }.
# How: list/add → listProposals / addProposal; reject/approve/mark_applied/update → rejectProposal / approveProposal / markApplied / updatePendingProposal; queue_snapshot → loadQueue (includes LOAD_QUEUE BOM normalization).
# Composition: tools/leap-proposal-mcp.test.ts exercises handler → safeLeapCall → module without MCP transport/UI.

# --- Phase H (E2E) [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE] ---
# end-to-end-ui E2E boundary: none — no browser, IDE chrome, native OS dialog, or window server; MCP tools are async handlers invocable directly in-process; not e2e_only ([REQ-MODULE_VALIDATION] [PROC-TEST_STRATEGY] [PROC-AGENT_REQ_CHECKLIST] Phase H). No additional E2E test file required for UI-only behavior (there is none).
