import { executeLifecycleCommand, type CommandRequest } from "./commands.js";
import { FeatureStore } from "./store.js";
import {
  buildViewSourceProjection,
  detectStaleView,
  renderGeneratedView,
  type SourceRevision,
  type ViewKind,
  type ViewSourceInput,
} from "./views.js";

export type OrchestrationResponse =
  | { ok: true; [key: string]: unknown }
  | { ok: false; error: string; diagnostics?: string[] };

export type McpDependencies = {
  store: FeatureStore;
  delegateCanonical?: (request: Record<string, unknown>) => Promise<unknown> | unknown;
};

// [IMPL-FEAT_ORCHESTRATION_MCP] [ARCH-FEAT_ORCHESTRATION_BOUNDARY] [REQ-FEAT_ORCHESTRATION_SURFACE] — How: route requests to shared services and preserve one canonical YAML validation path.
export async function handleOrchestrationTool(
  toolName: string,
  request: Record<string, unknown>,
  dependencies: McpDependencies,
): Promise<OrchestrationResponse> {
  if (toolName === "feature_create") {
    if (typeof request.request_key !== "string" || typeof request.title !== "string") {
      return { ok: false, error: "INVALID_INPUT" };
    }
    return dependencies.store.createIdempotently(request.request_key, request.title, {
      mode: request.mode === "brownfield" ? "brownfield" : "greenfield",
    });
  }
  if (toolName === "feature_update_canonical") {
    if (!dependencies.delegateCanonical) return { ok: false, error: "DELEGATED_YAML_ERROR" };
    const delegated = await dependencies.delegateCanonical(request);
    return { ok: true, delegated };
  }
  if (toolName === "feature_view_render") {
    if (
      !request.source_input ||
      typeof request.source_input !== "object" ||
      typeof request.view_kind !== "string" ||
      !("feature_manifest" in request.source_input) ||
      !Array.isArray((request.source_input as Record<string, unknown>).canonical_record_refs) ||
      !Array.isArray((request.source_input as Record<string, unknown>).proof_boundaries)
    ) {
      return { ok: false, error: "INVALID_INPUT" };
    }
    const projection = buildViewSourceProjection(request.source_input as ViewSourceInput);
    if (!projection.ok) return projection;
    const rendered = renderGeneratedView(projection.projection, request.view_kind as ViewKind);
    return rendered.ok ? rendered : { ok: false, error: rendered.error };
  }
  if (toolName === "feature_view_check_stale") {
    if (
      typeof request.generated_view !== "string" ||
      !Array.isArray(request.current_source_revision) ||
      (request.policy !== "fail" && request.policy !== "warn")
    ) {
      return { ok: false, error: "INVALID_INPUT" };
    }
    try {
      return {
        ok: true,
        ...detectStaleView(
          request.generated_view,
          request.current_source_revision as SourceRevision[],
          request.policy,
          typeof request.view_path === "string" ? request.view_path : "generated-view",
        ),
      };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  }
  const commandMap: Record<string, string> = {
    feature_specify: "specify",
    feature_refine: "refine",
    feature_plan: "plan",
    feature_tasks: "tasks",
    feature_verify: "verify",
    feature_close_out: "close_out",
  };
  const command = commandMap[toolName];
  if (!command) return { ok: false, error: "UNKNOWN_TOOL" };
  if (typeof request.feature_identifier !== "string") return { ok: false, error: "INVALID_INPUT" };
  const result = executeLifecycleCommand(dependencies.store, {
    command,
    feature_identifier: request.feature_identifier,
    expected_revision: typeof request.expected_revision === "number" ? request.expected_revision : undefined,
    command_input: typeof request.command_input === "object" && request.command_input !== null
      ? request.command_input as Record<string, unknown>
      : {},
  } satisfies CommandRequest);
  return result;
}
