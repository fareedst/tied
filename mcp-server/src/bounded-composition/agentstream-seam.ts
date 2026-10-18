/**
 * [IMPL-TIED_BOUNDED_AGENTSTREAM_SEAM] [ARCH-TIED_BOUNDED_COMPOSITION] [REQ-TIED_BOUNDED_COMPOSITION]
 * [REQ-FEAT_AGENTSTREAM_ADAPTER] [REQ-GOAGENT-AGENT-EXECUTOR]
 * BIND_CLIENT_AGENT_DRIVER — injectable client-owned AgentDriver seam (built-in cursor/claude/dry_run).
 */

import {
  buildTaskTurns,
  executeSchedule,
  type AdapterOptions,
  type AgentstreamTurn,
  type ScheduleExecutor,
} from "../feature-orchestration/agentstream-adapter.js";
import type { ReadinessProjection, TaskEntry } from "../feature-orchestration/task-graph.js";
import { ExecutionStateStore } from "../feature-orchestration/execution-state.js";
import type { PilotBudgetV1 } from "./pilot-budget.js";
import { captureTrajectoryManifest, type TrajectoryManifestV1 } from "./trajectory-manifest.js";
import { stableJsonHash } from "./content-hash.js";

export type BuiltinAgentDriverProfile = "cursor" | "claude" | "dry_run";

export type AgentDriverRequest =
  | { kind: "builtin"; profile: BuiltinAgentDriverProfile; agent_path?: string }
  | {
      kind: "client_descriptor";
      adapter_id: string;
      oee_compatibility_ref: string;
      licensing_assumption?: string;
      network_assumption?: string;
      live_external_approved?: boolean;
    };

export type BoundedScheduleContext = {
  request_token: string;
  source_revision: string;
  provenance_carry_forward?: string[];
};

export type AgentDriverTurnResult = {
  exit_code: number;
  session_id: string;
  provenance_ref: string;
};

export type BoundAgentDriverSession = {
  driver_kind: BuiltinAgentDriverProfile | "client_injected";
  dry_run: boolean;
  session_id: string;
  provenance_refs: string[];
  runTurn: (argv: string[], extraEnv: string[]) => Promise<AgentDriverTurnResult>;
};

export type BindClientAgentDriverErrorCode =
  | "InvalidDriverContract"
  | "LiveExternalNotApproved"
  | "DriverLaunchFailure";

export type BindClientAgentDriverError = {
  code: BindClientAgentDriverErrorCode;
  detail: string;
};

export type BindClientAgentDriverResult =
  | { ok: true; session: BoundAgentDriverSession }
  | { ok: false; error: BindClientAgentDriverError };

export type LiveExecutorBinding = {
  driverKind: "cursor" | "claude" | "none";
  runTurn: (
    argv: string[],
    extraEnv: string[],
  ) => Promise<{ exitCode: number; result: { sessionId: string } }>;
};

export type BindClientAgentDriverDeps = {
  bindLiveExecutor?: (input: {
    harnessProfile: "cursor" | "claude";
    agentPath: string;
  }) => LiveExecutorBinding;
  clientDriverFactory?: (
    descriptor: Extract<AgentDriverRequest, { kind: "client_descriptor" }>,
  ) => Pick<BoundAgentDriverSession, "runTurn">;
  agent_path?: string;
};

const BUILTIN_PROFILES = new Set<BuiltinAgentDriverProfile>(["cursor", "claude", "dry_run"]);

function failBind(
  code: BindClientAgentDriverErrorCode,
  detail: string,
): BindClientAgentDriverResult {
  return { ok: false, error: { code, detail } };
}

function mergeProvenance(
  scheduleContext: BoundedScheduleContext,
  extra: string[],
): string[] {
  const base = scheduleContext.provenance_carry_forward ?? [];
  return [...new Set([...base, ...extra])];
}

export function bindClientAgentDriver(
  scheduleContext: BoundedScheduleContext,
  driverRequest: AgentDriverRequest,
  options: { dry_run: boolean; deps?: BindClientAgentDriverDeps },
): BindClientAgentDriverResult {
  const dryRun = options.dry_run === true;

  if (driverRequest.kind === "builtin") {
    if (!BUILTIN_PROFILES.has(driverRequest.profile)) {
      return failBind("InvalidDriverContract", `unsupported built-in profile: ${driverRequest.profile}`);
    }

    const sessionId = stableJsonHash({
      profile: driverRequest.profile,
      revision: scheduleContext.source_revision,
      dry_run: dryRun,
    }).slice(0, 24);

    if (driverRequest.profile === "dry_run" || dryRun) {
      const provenanceRefs = mergeProvenance(scheduleContext, [
        `agentstream:dry_run:${scheduleContext.source_revision}`,
        `agentstream:profile:${driverRequest.profile}`,
      ]);
      return {
        ok: true,
        session: {
          driver_kind: driverRequest.profile === "dry_run" ? "dry_run" : driverRequest.profile,
          dry_run: true,
          session_id: sessionId,
          provenance_refs: provenanceRefs,
          runTurn: async () => ({
            exit_code: 0,
            session_id: sessionId,
            provenance_ref: provenanceRefs[0] ?? "agentstream:dry_run",
          }),
        },
      };
    }

    if (driverRequest.profile !== "cursor" && driverRequest.profile !== "claude") {
      return failBind("InvalidDriverContract", "live execution requires cursor or claude built-in profile");
    }
    const bindLive = options.deps?.bindLiveExecutor;
    if (!bindLive) {
      return failBind("InvalidDriverContract", "bindLiveExecutor dependency required for live built-in profile");
    }
    const binding = bindLive({
      harnessProfile: driverRequest.profile,
      agentPath: options.deps?.agent_path ?? driverRequest.agent_path ?? "",
    });
    const provenanceRefs = mergeProvenance(scheduleContext, [
      `agentstream:live:${driverRequest.profile}`,
      `agentstream:driver_kind:${binding.driverKind}`,
    ]);
    return {
      ok: true,
      session: {
        driver_kind: driverRequest.profile,
        dry_run: false,
        session_id: sessionId,
        provenance_refs: provenanceRefs,
        runTurn: async (argv, extraEnv) => {
          const out = await binding.runTurn(argv, extraEnv);
          return {
            exit_code: out.exitCode,
            session_id: out.result.sessionId || sessionId,
            provenance_ref: provenanceRefs[0] ?? `agentstream:live:${driverRequest.profile}`,
          };
        },
      },
    };
  }

  const adapterId = driverRequest.adapter_id?.trim();
  const oeeRef = driverRequest.oee_compatibility_ref?.trim();
  if (!adapterId || !oeeRef) {
    return failBind("InvalidDriverContract", "client descriptor requires adapter_id and oee_compatibility_ref");
  }
  if (!dryRun && driverRequest.live_external_approved !== true) {
    return failBind(
      "LiveExternalNotApproved",
      "live external client driver requires live_external_approved (C2: no bundled external binaries)",
    );
  }
  const factory = options.deps?.clientDriverFactory;
  if (!factory) {
    return failBind("InvalidDriverContract", "clientDriverFactory required for client descriptor binding");
  }

  const sessionId = stableJsonHash({ adapter_id: adapterId, oee: oeeRef }).slice(0, 24);
  const provenanceRefs = mergeProvenance(scheduleContext, [
    `agentstream:client:${adapterId}`,
    `oee:${oeeRef}`,
  ]);
  const clientBinding = factory(driverRequest);

  return {
    ok: true,
    session: {
      driver_kind: "client_injected",
      dry_run: dryRun,
      session_id: sessionId,
      provenance_refs: provenanceRefs,
      runTurn: clientBinding.runTurn,
    },
  };
}

export function buildScheduleExecutorFromBoundDriver(
  session: BoundAgentDriverSession,
): ScheduleExecutor {
  return async (turn: AgentstreamTurn) => {
    if (session.dry_run) {
      return {
        outcome: "passed",
        provenance: session.provenance_refs[0] ?? "agentstream:dry_run",
      };
    }
    const argv = turn.parts.length > 0 ? turn.parts : [`TASK_GROUP ${turn.task_ids.join(",")}`];
    const result = await session.runTurn(argv, []);
    return {
      outcome: result.exit_code === 0 ? "passed" : "failed",
      provenance: result.provenance_ref,
    };
  };
}

export type ExecuteBoundedScheduleToTrajectoryInput = {
  project_root: string;
  tied_base_path: string;
  request_token: string;
  pilot_budget: PilotBudgetV1;
  run_id: string;
  candidate_hash: string;
  readiness: ReadinessProjection;
  tasks: TaskEntry[];
  adapter_options?: AdapterOptions;
  schedule_context: BoundedScheduleContext;
  driver_request: AgentDriverRequest;
  dry_run: boolean;
  local_raw_payload: unknown;
  deps?: BindClientAgentDriverDeps;
  now?: string;
};

export type ExecuteBoundedScheduleToTrajectoryResult =
  | {
      ok: true;
      session: BoundAgentDriverSession;
      schedule: { turns: AgentstreamTurn[]; dry_run: boolean; outcomes: unknown[] };
      manifest: TrajectoryManifestV1;
    }
  | {
      ok: false;
      error: BindClientAgentDriverError;
      schedule_outcomes: unknown[];
      turns: AgentstreamTurn[];
    };

export async function executeBoundedScheduleToTrajectory(
  input: ExecuteBoundedScheduleToTrajectoryInput,
): Promise<ExecuteBoundedScheduleToTrajectoryResult> {
  const bound = bindClientAgentDriver(input.schedule_context, input.driver_request, {
    dry_run: input.dry_run,
    deps: input.deps,
  });
  if (!bound.ok) {
    return { ok: false, error: bound.error, schedule_outcomes: [], turns: [] };
  }

  const built = buildTaskTurns(input.readiness, input.tasks, input.adapter_options ?? {});
  if (!built.ok) {
    return {
      ok: false,
      error: { code: "InvalidDriverContract", detail: built.error },
      schedule_outcomes: [],
      turns: [],
    };
  }

  const state = new ExecutionStateStore();
  const executor = input.dry_run ? undefined : buildScheduleExecutorFromBoundDriver(bound.session);
  const mode = input.dry_run ? "dry-run" : "live";
  const executedSchedule = await executeSchedule(
    built.turns,
    input.tasks,
    mode,
    executor,
    state,
    input.schedule_context.source_revision,
  );

  if (!executedSchedule.ok) {
    return {
      ok: false,
      error: { code: "DriverLaunchFailure", detail: executedSchedule.error },
      schedule_outcomes: [],
      turns: executedSchedule.turns,
    };
  }

  const failedLiveOutcome = executedSchedule.outcomes.some(
    (outcome) =>
      "outcome" in outcome &&
      typeof outcome.outcome === "string" &&
      outcome.outcome !== "passed",
  );
  if (!input.dry_run && failedLiveOutcome) {
    return {
      ok: false,
      error: {
        code: "DriverLaunchFailure",
        detail: "schedule stopped on failed, cancelled, timed_out, or stale driver outcome",
      },
      schedule_outcomes: executedSchedule.outcomes,
      turns: executedSchedule.turns,
    };
  }

  const lastOutcome = executedSchedule.outcomes.at(-1);
  const provenanceFromOutcome =
    lastOutcome && "provenance" in lastOutcome && typeof lastOutcome.provenance === "string"
      ? lastOutcome.provenance
      : undefined;
  const provenanceRef =
    provenanceFromOutcome ??
    bound.session.provenance_refs.find((ref) => ref.startsWith("agentstream:")) ??
    bound.session.provenance_refs[0] ??
    "agentstream:schedule";

  const exitCode =
    lastOutcome && "outcome" in lastOutcome && lastOutcome.outcome !== "passed" ? 1 : 0;

  const captured = captureTrajectoryManifest(
    {
      project_root: input.project_root,
      tied_base_path: input.tied_base_path,
      request_token: input.request_token,
      pilot_budget: input.pilot_budget,
      run_id: input.run_id,
      adapter_id:
        input.driver_request.kind === "client_descriptor"
          ? input.driver_request.adapter_id
          : input.driver_request.profile,
      candidate_hash: input.candidate_hash,
      provenance_ref: provenanceRef,
      run_outcome: {
        exit_code: exitCode,
        outcome_hash: stableJsonHash({
          turns: executedSchedule.turns,
          outcomes: executedSchedule.outcomes,
          session_id: bound.session.session_id,
        }),
        tool_sequence_hashes: executedSchedule.turns.map((turn) =>
          stableJsonHash({ task_ids: turn.task_ids, parts: turn.parts }),
        ),
      },
      local_raw_payload: {
        schedule: { turns: executedSchedule.turns, outcomes: executedSchedule.outcomes },
        session: {
          driver_kind: bound.session.driver_kind,
          session_id: bound.session.session_id,
          provenance_refs: bound.session.provenance_refs,
        },
        payload: input.local_raw_payload,
      },
    },
    { now: input.now },
  );

  if (!captured.ok) {
    return {
      ok: false,
      error: { code: "DriverLaunchFailure", detail: captured.error.detail },
      schedule_outcomes: executedSchedule.outcomes,
      turns: executedSchedule.turns,
    };
  }

  return {
    ok: true,
    session: bound.session,
    schedule: {
      turns: executedSchedule.turns,
      dry_run: executedSchedule.dry_run,
      outcomes: executedSchedule.outcomes,
    },
    manifest: captured.manifest,
  };
}
