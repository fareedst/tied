# Gitignore close-out hygiene — REQ-TIED_TOOL_INPUT_COMPATIBILITY

**PROC:** [PROC-GITIGNORE_CLOSE_OUT]

| Class | Path / pattern | Action |
| --- | --- | --- |
| **ignore** | `tied-bundle/working/REQ-TIED_TOOL_INPUT_COMPATIBILITY/**` (adversarial-inquiry, pseudocode-analysis) | Matches existing `# Ephemeral working/` conventions — no new `.gitignore` lines |
| **track** | `tied-project/working/REQ-TIED_TOOL_INPUT_COMPATIBILITY/**` | Committed PLAN, CITDP, gates, evidence |
| **exclude (staging)** | Unrelated dirty paths (other REQ working folders, source-graph index churn, fixture envelopes) | Not part of this REQ wave |

**N/A:** No new ephemeral artifact class requiring a new ignore pattern.
