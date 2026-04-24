# [IMPL-GOAGENT-LIB-TYPES] [ARCH-GOAGENT-LIB-LAYERING] [REQ-GOAGENT-LIB-MODULE]
# Summary: Exported Turn { Parts []string; ChainFromPrevious bool } and SessionID alias — shared library contract.
# How: DATA-only package — consumed by IMPL-GOAGENT-TEXT-SOURCES, IMPL-GOAGENT-FEATURESPEC, IMPL-GOAGENT-TDDLOOP, IMPL-GOAGENT-CHECKLIST, IMPL-GOAGENT-PIPELINE, IMPL-GOAGENT-EXECUTOR (cross-IMPL dependency: all import Turn/SessionID; no reverse calls).

type Turn:
  # [IMPL-GOAGENT-LIB-TYPES] [ARCH-GOAGENT-LIB-LAYERING] [REQ-GOAGENT-LIB-MODULE]
  # How: Parts hold argv tokens for agent; ChainFromPrevious encodes resume vs new session per REQ pipeline rules.
  fields Parts []string
  fields ChainFromPrevious bool
# How: Opaque handle echoed by agent CLI stderr/session_id JSON field; used across executor turns.
type SessionID string
# How: Matches verify-session sentinel used by IMPL-GOAGENT-TEXT-SOURCES VerifySessionTurn ([REQ-GOAGENT-TEXT-SOURCES]).
const VerifySessionPrompt = "what was the most recent prompt?"