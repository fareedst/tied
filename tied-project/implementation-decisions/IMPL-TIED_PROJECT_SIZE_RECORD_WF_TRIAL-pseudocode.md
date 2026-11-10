# [IMPL-TIED_PROJECT_SIZE_RECORD_WF_TRIAL] [ARCH-TIED_PROJECT_SIZE_SNAPSHOT] [REQ-TIED_PROJECT_SIZE_LAYERS] — Facilitator readout appendix for size layers.

Grammar-Version: v2

## Record WF trial size appendix

- [IMPL-TIED_PROJECT_SIZE_RECORD_WF_TRIAL] [ARCH-TIED_PROJECT_SIZE_SNAPSHOT] [REQ-TIED_PROJECT_SIZE_LAYERS] Document MCP snapshot path and readout table; no leaderboard language.
procedure RECORD_WF_TRIAL_SIZE_APPENDIX:
  # [IMPL-TIED_PROJECT_SIZE_RECORD_WF_TRIAL] [ARCH-TIED_PROJECT_SIZE_SNAPSHOT] [REQ-TIED_PROJECT_SIZE_LAYERS] Facilitator readout size appendix.
  Contract:
    INPUT: subject client repo_root, store repo_root
    OUTPUT: readout markdown section + optional evidence JSON path
    PRE: facilitator workspace is store tied-project base
    POST: readout cites project-size-snapshot-receipt.v1 layers and proof_boundary
    EFFECTS: IO (read subject; write store readout)
  CALL tied_project_size_snapshot WITH subject repo_root
  WRITE facilitator evidence project-size-snapshot.v1.json when sponsor captures
  APPEND readout section Project size layers with atoms, operational_intent, proof_facets summary
  DOCUMENT JSONL cohort path tied-bundle/reports/wf-trial-cohort/runs.jsonl
