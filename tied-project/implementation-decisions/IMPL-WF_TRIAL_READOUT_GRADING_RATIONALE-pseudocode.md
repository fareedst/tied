# IMPL-WF_TRIAL_READOUT_GRADING_RATIONALE — essence pseudocode

```text
# [REQ-WF_TRIAL_READOUT_GRADING_RATIONALE] [ARCH-WF_TRIAL_READOUT_GRADING_RATIONALE] [IMPL-WF_TRIAL_READOUT_GRADING_RATIONALE]
# Store facilitator standard for Session grading Rationale cells in PROMPT-WF readouts.

PROCEDURE PARSE_WF_SESSION_GRADING_TABLE
  # Implements SC-GR-04 table extraction (3-column or legacy 2-column)
  PRE: markdown contains ## Session grading
  INPUT: readout markdown body
  SPLIT table rows after heading
  IF header has Rationale column THEN parse dimension, band, rationale
  ELSE split legacy band cell on em dash after bold band
  ASSERT seven dimension rows in catalog order
  OUTPUT: rows[], validation errors[]

PROCEDURE VALIDATE_WF_GRADING_RATIONALES
  # Implements D-SUB-A-FLOOR and placeholder ban
  PRE: rows from PARSE_WF_SESSION_GRADING_TABLE
  FOR each row
    IF rationale is placeholder THEN FAIL
    IF band is sub-A (not A, not N/A) AND rationale shorter than 15 chars THEN FAIL
  POST: all docs/demos/trial-readout-PROMPT-WF-*.md pass

PROCEDURE BACKFILL_WF_READOUT_RATIONALES
  # Implements D-FROZEN-BANDS: rewrite rationale only
  PRE: bands unchanged from facilitator
  INPUT: facts from Outcome record / What was built / orchestrator log
  FOR each PROMPT-WF readout
    IF placeholder, verbose, or thin sub-A rationale THEN draft one sentence from facts
    WRITE three-column Session grading table
  POST: contract test T-GR-READOUTS-01 green
```
