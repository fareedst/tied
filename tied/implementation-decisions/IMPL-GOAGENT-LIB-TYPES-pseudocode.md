# [IMPL-GOAGENT-LIB-TYPES] [ARCH-GOAGENT-LIB-LAYERING] [REQ-GOAGENT-LIB-MODULE]
# Summary: Exported Turn { Parts []string; ChainFromPrevious bool } and SessionID alias — shared library contract.
# How: DATA-only package — consumed by IMPL-GOAGENT-TEXT-SOURCES, IMPL-GOAGENT-FEATURESPEC, IMPL-GOAGENT-TDDLOOP, IMPL-GOAGENT-CHECKLIST, IMPL-GOAGENT-PIPELINE, IMPL-GOAGENT-EXECUTOR (cross-IMPL dependency: all import Turn/SessionID; no reverse calls).

Grammar-Version: v2

## Summary contract
# [IMPL-GOAGENT-LIB-TYPES] [ARCH-GOAGENT-LIB-LAYERING] [REQ-GOAGENT-LIB-MODULE] — Shared Turn and SessionID exports for goagent library consumers.
Contract:
  INPUT: package_root: string where length(package_root) > 0
  OUTPUT: Turn type, SessionID alias, VerifySessionPrompt constant
  PRE: package is the goagent shared library layer
  POST: exported symbols match pipeline and executor contracts; no reverse imports from consumers
  EFFECTS: pure
  FAILURE_MODES: none
  TERMINATION: total

procedure DEFINE_TURN:
  # [IMPL-GOAGENT-LIB-TYPES] [ARCH-GOAGENT-LIB-LAYERING] [REQ-GOAGENT-LIB-MODULE] — How: Parts hold argv tokens for agent; ChainFromPrevious encodes resume vs new session per REQ pipeline rules.
  Contract:
    INPUT: none
    OUTPUT: Turn type definition
    PRE: package is goagent/lib
    POST: Turn exposes Parts []string and ChainFromPrevious bool
    EFFECTS: pure
    TERMINATION: total
  EXPORT type Turn with field Parts []string
  EXPORT type Turn with field ChainFromPrevious bool

procedure DEFINE_SESSION_ID:
  # [IMPL-GOAGENT-LIB-TYPES] [ARCH-GOAGENT-LIB-LAYERING] [REQ-GOAGENT-LIB-MODULE] — How: Opaque handle echoed by agent CLI stderr/session_id JSON field; used across executor turns.
  Contract:
    INPUT: none
    OUTPUT: SessionID string alias
    PRE: package is goagent/lib
    POST: SessionID is opaque string alias for session handles
    EFFECTS: pure
    TERMINATION: total
  EXPORT type SessionID as string alias

procedure DEFINE_VERIFY_SESSION_PROMPT:
  # [IMPL-GOAGENT-LIB-TYPES] [ARCH-GOAGENT-LIB-LAYERING] [REQ-GOAGENT-LIB-MODULE] — How: Matches verify-session sentinel used by IMPL-GOAGENT-TEXT-SOURCES VerifySessionTurn ([REQ-GOAGENT-TEXT-SOURCES]).
  Contract:
    INPUT: none
    OUTPUT: VerifySessionPrompt constant string
    PRE: package is goagent/lib
    POST: constant equals verify-session prompt sentinel expected by text-sources
    EFFECTS: pure
    TERMINATION: total
  EXPORT const VerifySessionPrompt = "what was the most recent prompt?"
