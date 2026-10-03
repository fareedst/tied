# [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE]
# Summary: Non-canonical LEAP proposals under leap-proposals/; JSONL audit; diff/session helpers; thin tied_leap_proposal_* handlers with safeLeapCall; never write project TIED YAML from queue lifecycle.

Grammar-Version: v2

# [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE]
# How: Module I/O boundary; independent of IMPL-MCP_FEEDBACK_TOOLS (distinct paths; no shared mutable DATA).
Contract:
  INPUT: projectRoot (default cwd); proposal id; lifecycle mutations; extract/import args with explicit_opt_in; session raw text
  OUTPUT: LeapProposal; LeapProposalQueueFile; MCP JSON { ok, ... } | { ok: false, error }; extract candidates with truncation metadata
  PRE: queue lives under projectRoot/leap-proposals/; proposals always non_canonical true
  POST: reject/approve/mark_applied/update never invoke yaml-loader or mutate tied/ indexes
  FAILURE_MODES: ProposalNotFound, InvalidStatusTransition, ExplicitOptInRequired, QueueWriteFailed, ExtractAborted
  DATA: queue.json schema leap-proposal-queue.v1; audit-log.jsonl schema leap-proposal-audit.v1
  DATA_TRANSITION: queue.json and audit append on lifecycle; no canonical YAML writes
  EFFECTS: IO, State
  TERMINATION: total

procedure GET_LEAP_PROPOSAL_DIR(projectRoot):
  # [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE]
  Contract:
    INPUT: projectRoot
    OUTPUT: path projectRoot/leap-proposals
    EFFECTS: pure
    TERMINATION: total
  RETURN join(projectRoot, "leap-proposals")

procedure LOAD_QUEUE(projectRoot):
  # [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE]
  # How: Read queue.json UTF-8; strip leading BOM before JSON.parse; invalid => empty proposals + DIAGNOSTIC.
  Contract:
    INPUT: projectRoot: string where length(projectRoot) > 0
    OUTPUT: LeapProposalQueueFile { schema_version, proposals[] }
    PRE: projectRoot is addressable
    POST: missing file => empty queue; schema mismatch or parse error => empty queue with stderr DIAGNOSTIC
    FAILURE_MODES: QueueReadCorrupt (handled — empty proposals)
    DATA_TRANSITION: read-only
    EFFECTS: IO
    TERMINATION: total
  IF queue.json missing: RETURN empty queue v1
  TRY read UTF-8, stripLeadingUtf8Bom, JSON.parse
  IF schema_version and proposals array valid: RETURN queue
  ON error: LOG DIAGNOSTIC; RETURN empty queue v1

procedure SAVE_QUEUE(projectRoot, queue):
  # [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE]
  Contract:
    INPUT: projectRoot, LeapProposalQueueFile
    OUTPUT: void (may throw to MCP safeLeapCall)
    POST: leap-proposals/ exists; queue.json written pretty JSON UTF-8
    FAILURE_MODES: QueueWriteFailed
    DATA_TRANSITION: queue.json replaced
    EFFECTS: IO, State
    TERMINATION: total
  ENSURE leap-proposals directory
  WRITE queue.json with JSON.stringify(queue, null, 2)

procedure APPEND_AUDIT(projectRoot, event):
  # [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE]
  Contract:
    INPUT: projectRoot, audit event (action, proposal_id, optional detail)
    OUTPUT: void
    POST: one JSONL line appended with schema_version and ISO timestamp
    DATA_TRANSITION: audit-log.jsonl grows by one line
    EFFECTS: IO, State
    TERMINATION: total
  ENSURE leap-proposals directory
  APPEND JSON.stringify(full audit event) + newline to audit-log.jsonl

procedure ADD_PROPOSAL(projectRoot, partial):
  # [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE]
  Contract:
    INPUT: projectRoot, partial LeapProposal fields (no id/status/timestamps)
    OUTPUT: LeapProposal with status pending
    POST: new id generated; non_canonical true; save_queue + audit action add
    DATA_TRANSITION: proposals append one pending row
    EFFECTS: IO, State
    TERMINATION: total
  queue = CALL LOAD_QUEUE(projectRoot)
  proposal = partial + generated id + pending status + timestamps + non_canonical true
  APPEND proposal to queue.proposals
  CALL SAVE_QUEUE(projectRoot, queue)
  CALL APPEND_AUDIT(projectRoot, { action: add, proposal_id, status_after: pending })
  RETURN proposal

procedure REJECT_PROPOSAL(projectRoot, id, reason):
  # [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE]
  Contract:
    INPUT: projectRoot, proposal id, optional reason
    OUTPUT: { ok, proposal? } | { ok: false, error }
    PRE: target status must be pending
    POST: ok true => status rejected, rejection_reason optional, audit reject
    FAILURE_MODES: ProposalNotFound, InvalidStatusTransition
    EFFECTS: IO, State
    TERMINATION: total
  queue = CALL LOAD_QUEUE(projectRoot)
  IF proposal missing: RETURN { ok: false, error: No proposal }
  IF status not pending: RETURN { ok: false, error: status gate }
  SET status rejected; updated_at; optional rejection_reason
  CALL SAVE_QUEUE; CALL APPEND_AUDIT reject
  RETURN { ok: true, proposal }

procedure APPROVE_PROPOSAL(projectRoot, id, note):
  # [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE]
  Contract:
    INPUT: projectRoot, proposal id, optional note
    OUTPUT: { ok, proposal? } | { ok: false, error }
    PRE: status must be pending
    POST: ok true => status approved; approval_note optional
    FAILURE_MODES: ProposalNotFound, InvalidStatusTransition
    EFFECTS: IO, State
    TERMINATION: total
  queue = CALL LOAD_QUEUE(projectRoot)
  IF proposal missing: RETURN { ok: false, error: No proposal }
  IF status not pending: RETURN { ok: false, error: Cannot approve from status }
  SET status approved; updated_at; optional approval_note
  CALL SAVE_QUEUE; CALL APPEND_AUDIT approve
  RETURN { ok: true, proposal }

procedure MARK_APPLIED(projectRoot, id):
  # [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE]
  Contract:
    INPUT: projectRoot, proposal id
    OUTPUT: { ok, proposal? } | { ok: false, error }
    PRE: status must be approved
    POST: ok true => status applied
    FAILURE_MODES: ProposalNotFound, InvalidStatusTransition
    EFFECTS: IO, State
    TERMINATION: total
  queue = CALL LOAD_QUEUE(projectRoot)
  IF proposal missing: RETURN { ok: false, error: No proposal }
  IF status not approved: RETURN { ok: false, error: mark_applied requires approved }
  SET status applied; updated_at
  CALL SAVE_QUEUE; CALL APPEND_AUDIT mark_applied
  RETURN { ok: true, proposal }

procedure UPDATE_PENDING_PROPOSAL(projectRoot, id, fields):
  # [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE]
  Contract:
    INPUT: projectRoot, id, optional title, summary, leap_hints
    OUTPUT: { ok, proposal? } | { ok: false, error }
    PRE: status must be pending
    POST: ok true => only provided fields mutated
    FAILURE_MODES: ProposalNotFound, InvalidStatusTransition
    EFFECTS: IO, State
    TERMINATION: total
  queue = CALL LOAD_QUEUE(projectRoot)
  IF proposal missing: RETURN { ok: false, error: No proposal }
  IF status not pending: RETURN { ok: false, error: Edit allowed only in pending }
  APPLY fields.title, fields.summary, fields.leap_hints when defined
  CALL SAVE_QUEUE; CALL APPEND_AUDIT update
  RETURN { ok: true, proposal }

procedure LIST_PROPOSALS(projectRoot, filter):
  # [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE]
  Contract:
    INPUT: projectRoot, optional status filter
    OUTPUT: copy of proposals array
    POST: filter.status when set restricts by LeapProposalStatus
    EFFECTS: IO on load
    TERMINATION: total
  queue = CALL LOAD_QUEUE(projectRoot)
  IF filter.status absent: RETURN copy of all proposals
  RETURN proposals where status matches filter

procedure EXTRACT_DIFF_PROPOSAL_CANDIDATES(args):
  # [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE]
  # How: Outer TRY — inner git line scan; type-only PlumbDiffImpactPreviewSelection import; no throw to MCP client.
  Contract:
    INPUT: ExtractDiffProposalsArgs (projectRoot, selection, paths, caps)
    OUTPUT: { candidates[], truncation, optional error }
    POST: git/IO failure => empty candidates + error string; success => deduped doc hints from '+' lines
    FAILURE_MODES: ExtractAborted
    EFFECTS: IO, Process (git exec)
    TERMINATION: total
  TRY RETURN EXTRACT_DIFF_PROPOSAL_CANDIDATES_INNER(args)
  CATCH any failure:
    LOG DIAGNOSTIC
    RETURN { candidates: [], truncation.notice, error: message }

procedure EXTRACT_DIFF_PROPOSAL_CANDIDATES_INNER(args):
  # [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE]
  Contract:
    INPUT: ExtractDiffProposalsArgs
    OUTPUT: candidates with file, line_text, title, summary; truncation flags
    PRE: caps default max_files, max_patch_bytes, max_total_patch_bytes, max_proposals
    POST: binary patches skipped; pure token-only lines skipped; dedupe by file|line
    EFFECTS: IO, Process
    TERMINATION: total
  RESOLVE projectRootAbs via git rev-parse or args.projectRoot
  ENUMERATE staged/unstaged name-only lists per selection
  FOR each candidate file within caps:
    FETCH git patch; skip binary
    FOR each '+' content line: IF lineLooksLikeAddedContent: push candidate
  RETURN { candidates, truncation metadata }

procedure PARSE_SESSION_EXPORT_SEGMENTS(raw, maxSegments):
  # [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE]
  Contract:
    INPUT: raw session text; maxSegments default 25
    OUTPUT: string[] segments
    POST: trim input; try JSON array of {content}|strings or messages split; else split on newline-triple-dash; cap count
    EFFECTS: pure
    TERMINATION: total
  trimmed = trim(raw)
  IF empty: RETURN []
  TRY JSON parse paths for array or messages object
  IF JSON segments found: RETURN capped list
  RETURN split on \n---\n trimmed filtered capped

procedure PROPOSALS_FROM_SESSION_SEGMENTS(segments, label):
  # [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE]
  Contract:
    INPUT: segment strings; optional label
    OUTPUT: array of partial LeapProposal shapes (inferred_session, no ids yet)
    POST: each summary is trimmed segment text; title includes segment index and label
    EFFECTS: pure
    TERMINATION: total
  FOR each segment index: map to kind inferred_session, title, summary, source session_export, suggested_leap_order mixed
  RETURN mapped array

procedure MCP_HANDLER_TIED_LEAP_PROPOSAL(projectRoot, toolName, args):
  # [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE]
  # How: safeLeapCall wraps handler; extract/import require explicit_opt_in true; JSON.stringify result for MCP text.
  Contract:
    INPUT: tool name tied_leap_proposal_* ; zod-validated args
    OUTPUT: JSON { ok, ... } | { ok: false, error }
    PRE: extract_diff and import_session require explicit_opt_in === true
    POST: sync throws from module become { ok: false, error }; never writes TIED YAML indexes
    FAILURE_MODES: ExplicitOptInRequired, ProposalNotFound, InvalidStatusTransition, ExtractAborted
    EFFECTS: Async wrapper; IO inside safeLeapCall
    TERMINATION: total
  Composition: tools/leap-proposal-mcp.test.ts — handler → safeLeapCall → module without MCP transport
  DISPATCH by toolName:
    list → LIST_PROPOSALS with optional status filter → { ok, count, proposals }
    add → ADD_PROPOSAL manual kind
    extract_diff → IF NOT explicit_opt_in: RETURN error; ELSE extract then ADD_PROPOSAL per candidate
    import_session → IF NOT explicit_opt_in: RETURN error; ELSE PARSE → PROPOSALS_FROM → ADD each
    reject / approve / mark_applied / update → matching lifecycle procedure
    queue_snapshot → LOAD_QUEUE raw file contents
  WRAP fn in safeLeapCall so JSON.stringify receives object or error envelope

# --- Phase H (E2E) [IMPL-MCP_LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [REQ-LEAP_PROPOSAL_QUEUE] ---
# end-to-end-ui E2E boundary: none — MCP tools are in-process async handlers; not e2e_only ([REQ-MODULE_VALIDATION] [PROC-TEST_STRATEGY]). No additional E2E test file required for UI-only behavior (there is none).
