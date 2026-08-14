// [IMPL-FEAT_TASK_GRAPH_SCHEDULER] [ARCH-FEAT_TASK_GRAPH_SCHEDULER] [REQ-FEAT_TASK_GRAPH_SCHEDULING] — How: expose graph validation and readiness as pure scheduler boundaries.
export {
  validateTaskGraph,
  projectReadiness,
  type ReadinessContext,
  type ReadinessItem,
  type ReadinessProjection,
} from "./task-graph.js";
