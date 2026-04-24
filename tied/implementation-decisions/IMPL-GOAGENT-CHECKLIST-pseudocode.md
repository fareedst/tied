# [IMPL-GOAGENT-CHECKLIST] [ARCH-GOAGENT-YAML-STEPS] [REQ-GOAGENT-YAML-STEP-RENDER]
# Summary: Render main steps then optional sub_procedures; each Turn chains from previous session.

# How: Contract I/O (same IMPL/ARCH/REQ). Cross-IMPL — callee of IMPL-GOAGENT-PIPELINE; YAML shape follows [PROC-AGENT_REQ_CHECKLIST] agent checklist schema. Turn from IMPL-GOAGENT-LIB-TYPES.

# INPUT: checklist YAML path; Options.IncludeSubProcedures (inverse of --lead-checklist-skip-sub); optional Options.StepFromID and StepToID (trimmed strings, step id or YAML slug) for inclusive slice of main steps in YAML order ([REQ-GOAGENT-YAML-STEP-RENDER] [REQ-GOAGENT-CLI-CONFIG]).
# OUTPUT: messages or []Turn with ChainFromPrevious true.

procedure checklist_messages(path, opts):
  # [IMPL-GOAGENT-CHECKLIST] [ARCH-GOAGENT-YAML-STEPS] [REQ-GOAGENT-YAML-STEP-RENDER]
  # How: sliceMainSteps applies optional bounds by step id (fmt.Sprint) or slug (id checked first); reject duplicate slugs across main steps; ON missing key or start>end return error with path; subs appended after sliced mains when IncludeSubProcedures.
  # How: formatMainStep uses YAML slug as primary step label when present; formatSubProcedure slug-first heading; flow and references sections when present.
  ON YAML or structure error: return error
  return messages