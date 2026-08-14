// [IMPL-FEAT_TASK_GRAPH_SCHEDULER] [ARCH-FEAT_TASK_GRAPH_SCHEDULER] [REQ-FEAT_TASK_GRAPH_SCHEDULING] — How: provide a stable readiness projection import for Batch 4 consumers.
export {
  projectReadiness,
  type ReadinessContext,
  type ReadinessItem,
  type ReadinessProjection,
} from "./task-graph.js";
