# IMPL-WF_TRIAL_INTERLEAVED_RESUME_CAPTURE essence pseudo-code

```text
# [IMPL-WF_TRIAL_INTERLEAVED_RESUME_CAPTURE] [ARCH-WF_TRIAL_INTERLEAVED_RESUME_CAPTURE] [REQ-WF_TRIAL_INTERLEAVED_RESUME_CAPTURE]
# Dual-stream session_id capture for interleaved WF trials.

PROCEDURE wf_trial_parse_session_id_from_turn_capture(stdout_file, stderr_file)
  PRE: paths are per-turn temp files only
  sid := PARSE session_id= FROM stdout_file
  IF sid empty: sid := PARSE session_id= FROM stderr_file
  POST: returns non-empty sid or failure
  EFFECTS: enables --resume on orders 2..4 when SC-WF-SPT-03 suppresses operator-only stdout
```