# [IMPL-METHODOLOGY-LEARNING-EXPERIMENT] [ARCH-METHODOLOGY-LEARNING-EXPERIMENT] [REQ-METHODOLOGY-LEARNING-EXPERIMENT]

Grammar-Version: v2

## Summary contract
INPUT: methodology learning experiment record or MCP tool arguments
PRE: TIED base path resolved for store operations
OUTPUT: validation report, upsert result, or experiment list
POST: invalid records never persist; valid records round-trip through methodology-experiments.yaml
FAILURE_MODES: VALIDATION_FAILED, INVALID_YAML, INVALID_INPUT, IO_ERROR
EFFECTS: validate is pure; upsert writes project YAML under base path
TERMINATION: total

## VALIDATE_METHODOLOGY_LEARNING_EXPERIMENT
# [IMPL-METHODOLOGY-LEARNING-EXPERIMENT] [ARCH-METHODOLOGY-LEARNING-EXPERIMENT] [REQ-METHODOLOGY-LEARNING-EXPERIMENT] — Structural validation for methodology-learning-experiment.v1.
Contract:
  INPUT: record object OR yaml_text string (exactly one)
  PRE: when yaml_text provided it must parse to a mapping
  OUTPUT: MethodologyExperimentValidationReport
  POST: ok true iff diagnostics empty
  EFFECTS: none
  FAILURE_MODES: INVALID_YAML, INVALID_ROOT, WRONG_SCHEMA_VERSION, MISSING_FIELD, INVALID_ENUM, INVALID_INPUT
  TERMINATION: total
  IF both or neither of record and yaml_text: RETURN INVALID_INPUT
  IF yaml_text: parse and validate object
  ELSE validate record object
  ENFORCE schema_version methodology-learning-experiment.v1
  ENFORCE required fields and closed enums

## UPSERT_METHODOLOGY_LEARNING_EXPERIMENT
# [IMPL-METHODOLOGY-LEARNING-EXPERIMENT] [ARCH-METHODOLOGY-LEARNING-EXPERIMENT] [REQ-METHODOLOGY-LEARNING-EXPERIMENT] — Validates then persists under methodology-experiments.yaml.
Contract:
  INPUT: record, optional base_path
  OUTPUT: UpsertMethodologyLearningExperimentResult
  PRE: CALL VALIDATE_METHODOLOGY_LEARNING_EXPERIMENT yields ok
  POST: file contains experiment_id entry after success
  EFFECTS: atomic write to methodology-experiments.yaml
  FAILURE_MODES: VALIDATION_FAILED, IO_ERROR
  TERMINATION: total
  report := VALIDATE_METHODOLOGY_LEARNING_EXPERIMENT(record)
  IF NOT report.ok: RETURN VALIDATION_FAILED
  load store, replace or append by experiment_id, writeCanonicalAtomic

## LIST_METHODOLOGY_LEARNING_EXPERIMENTS
# [IMPL-METHODOLOGY-LEARNING-EXPERIMENT] [ARCH-METHODOLOGY-LEARNING-EXPERIMENT] [REQ-METHODOLOGY-LEARNING-EXPERIMENT] — Read-only list.
Contract:
  INPUT: optional base_path
  OUTPUT: { experiments: Experiment[] }
  PRE: none
  POST: returns loaded entries (may be empty)
  EFFECTS: none
  TERMINATION: total
  RETURN loadMethodologyExperiments(base_path)

## MCP_TOOL_SURFACE
# [IMPL-METHODOLOGY-LEARNING-EXPERIMENT] [REQ-METHODOLOGY-LEARNING-EXPERIMENT] — MCP tool bindings.
Contract:
  INPUT: MCP tool name and arguments
  OUTPUT: JSON text content
  PRE: tool name registered in mcp-server tools index
  POST: validate/upsert/list delegate to procedures above
  EFFECTS: upsert path mutates methodology-experiments.yaml
  FAILURE_MODES: VALIDATION_FAILED, IO_ERROR
  TERMINATION: total
  tied_methodology_learning_experiment_validate -> VALIDATE_METHODOLOGY_LEARNING_EXPERIMENT
  tied_methodology_learning_experiment_upsert -> UPSERT_METHODOLOGY_LEARNING_EXPERIMENT
  tied_methodology_learning_experiment_list -> LIST_METHODOLOGY_LEARNING_EXPERIMENTS
