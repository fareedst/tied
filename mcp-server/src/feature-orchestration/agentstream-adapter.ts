import type { ExecutionStateStore } from "./execution-state.js";
import type { ReadinessProjection, TaskEntry } from "./task-graph.js";

export interface AgentstreamTurn {
  parts: string[];
  chainFromPrevious: boolean;
  task_ids: string[];
}

export interface AdapterOptions {
  legacy_feature_spec?: boolean;
  legacy_loader?: () => AgentstreamTurn[];
  governed_sequence?: string[];
}

export type AdapterResult =
  | { ok: true; turns: AgentstreamTurn[] }
  | { ok: false; error: "UNSAFE_GROUP" | "INVALID_TASK" | "LEGACY_MODE_CONFLICT" };

// [IMPL-FEAT_AGENTSTREAM_ADAPTER] [ARCH-FEAT_AGENTSTREAM_ADAPTER] [REQ-FEAT_AGENTSTREAM_ADAPTER] — How: map one safe scheduler projection to Turns while leaving feature-spec batch loading additive.
export function buildTaskTurns(
  readiness: ReadinessProjection,
  tasks: TaskEntry[],
  options: AdapterOptions = {},
): AdapterResult {
  if (options.legacy_feature_spec) {
    if (!options.legacy_loader) return { ok: false, error: "LEGACY_MODE_CONFLICT" };
    return { ok: true, turns: options.legacy_loader() };
  }
  if (readiness.rejected_groups.length > 0) return { ok: false, error: "UNSAFE_GROUP" };
  const byId = new Map(tasks.map((task) => [task.task_id, task]));
  const turns: AgentstreamTurn[] = [];
  for (const ids of readiness.parallel_groups) {
    const selected = ids.map((id) => byId.get(id));
    if (selected.some((task) => !task)) return { ok: false, error: "INVALID_TASK" };
    const taskIds = ids.slice().sort();
    const sequence = options.governed_sequence ?? [
      "pseudo-code-before-RED", "RED-before-GREEN", "module-validation-before-composition",
      "composition-before-justified-E2E", "validation-before-close-out",
    ];
    turns.push({
      parts: [
        `TASK_GROUP ${taskIds.join(",")}`,
        `GOVERNED_SEQUENCE ${sequence.join(" -> ")}`,
        "SOURCE task_graph_projection",
      ],
      chainFromPrevious: turns.length > 0,
      task_ids: taskIds,
    });
  }
  return { ok: true, turns };
}

export interface ScheduleExecutor {
  (turn: AgentstreamTurn): Promise<{ outcome: "passed" | "failed" | "cancelled" | "timed_out" | "stale"; provenance: string }>;
}

export type ScheduleResult =
  | { ok: true; dry_run: boolean; turns: AgentstreamTurn[]; outcomes: Array<{ task_ids: string[]; outcome?: string; provenance?: string }> }
  | { ok: false; error: string; turns: AgentstreamTurn[] };

// [IMPL-FEAT_AGENTSTREAM_ADAPTER] [ARCH-FEAT_AGENTSTREAM_ADAPTER] [REQ-FEAT_AGENTSTREAM_ADAPTER] — How: use the exact same Turns for dry-run and live execution, then record outcomes through the execution-state boundary.
export async function executeSchedule(
  turns: AgentstreamTurn[],
  tasks: TaskEntry[],
  mode: "dry-run" | "live",
  executor: ScheduleExecutor | undefined,
  state: ExecutionStateStore,
  sourceRevision: string,
): Promise<ScheduleResult> {
  if (mode === "live" && !executor) return { ok: false, error: "EXECUTOR_REQUIRED", turns };
  const outcomes: Array<{ task_ids: string[]; outcome?: string; provenance?: string }> = [];
  for (const turn of turns) {
    if (mode === "dry-run") { outcomes.push({ task_ids: turn.task_ids }); continue; }
    const result = await executor!(turn);
    const selected = turn.task_ids.map((id) => tasks.find((task) => task.task_id === id)).filter((task): task is TaskEntry => Boolean(task));
    for (const task of selected) {
      const recorded = state.apply(task, sourceRevision, result.outcome, result.provenance);
      if (!recorded.ok) return { ok: false, error: recorded.error, turns };
    }
    outcomes.push({ task_ids: turn.task_ids, outcome: result.outcome, provenance: result.provenance });
    if (result.outcome !== "passed") break;
  }
  return { ok: true, dry_run: mode === "dry-run", turns, outcomes };
}
