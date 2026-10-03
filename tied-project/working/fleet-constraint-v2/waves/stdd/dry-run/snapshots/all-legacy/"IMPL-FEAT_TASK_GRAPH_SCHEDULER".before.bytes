# [IMPL-FEAT_TASK_GRAPH_SCHEDULER] [ARCH-FEAT_TASK_GRAPH_SCHEDULER] [REQ-FEAT_TASK_GRAPH_SCHEDULING]
# How: validate the task graph and compute deterministic readiness and safe parallel groups.

## VALIDATE_TASK_GRAPH
# How: reject invalid references and cycles before scheduling.
Contract:
  INPUT: task entries
  PRE: task entries have stable task_id and explicit dependency fields
  OUTPUT: validated_graph | graph_error
  POST: graph is acyclic and every dependency resolves
  FAILURE_MODES: UNKNOWN_DEPENDENCY; CYCLE_DETECTED; DUPLICATE_TASK_ID
  EFFECTS: pure
  TERMINATION: total
1. CHECK task_id uniqueness
2. CHECK every dependency resolves
3. RUN deterministic cycle detection
4. RETURN topologically valid graph or stable error

## PROJECT_READINESS
# How: expose structured reasons for ready, blocked, and parallelizable task entries.
Contract:
  INPUT: validated graph; execution state; clarification readiness; constitution compliance; module evidence
  PRE: graph is acyclic and projections are current
  OUTPUT: readiness_projection
  POST: only tasks with all dependency and evidence predicates satisfied are ready
  EFFECTS: pure
  TERMINATION: total
1. FOR each task in stable topological order
2. COLLECT dependency, gate, stale-input, and evidence reasons
3. MARK ready only when all required predicates pass
4. GROUP ready tasks by explicit parallel_group
5. REJECT groups with dependency overlap, shared mutable deliverables, or missing module-validation evidence
6. RETURN sorted readiness reasons and groups