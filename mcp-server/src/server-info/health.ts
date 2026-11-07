/**
 * [REQ-MCP_SERVER_INFO] [IMPL-MCP_SERVER_INFO] Health checks and authoritative state.
 */

import fs from "node:fs";
import path from "node:path";
import {
  bindingStatus,
  type BindingStatus,
} from "../project-identity-write-binding.js";
import { resolveRuntimeIntrospection } from "../tied-runtime-introspection.js";
import {
  getBasePath,
  getClientProjectRoot,
  getMethodologyBasePath,
  validateIndex,
} from "../yaml-loader.js";
import { resolveTiedLayout } from "../tied-layout.js";
import type { HealthCheck, HealthCheckStatus, HealthState } from "./types.js";

function isoNow(): string {
  return new Date().toISOString();
}

function bindingToCheckStatus(status: BindingStatus): HealthCheckStatus {
  switch (status) {
    case "ok":
      return "ok";
    case "mismatch":
      return "failed";
    case "marker_missing":
      return "degraded";
    case "disabled":
      return "not_applicable";
    default:
      return "unknown";
  }
}

function bindingCode(status: BindingStatus): string | null {
  switch (status) {
    case "mismatch":
      return "BINDING_MISMATCH";
    case "marker_missing":
      return "MARKER_MISSING";
    default:
      return null;
  }
}

export type HealthProbeInput = {
  projectRoot: string;
  processEnv: NodeJS.ProcessEnv;
};

/** PRE: projectRoot resolved. POST: snapshot checks with observed_at. */
export async function assembleHealthChecks(
  input: HealthProbeInput,
): Promise<HealthCheck[]> {
  const observedAt = isoNow();
  const checks: HealthCheck[] = [];

  let basePath: string | null = null;
  let corpusError: string | null = null;
  try {
    basePath = getBasePath();
    const reqPath = path.join(basePath, "requirements.yaml");
    if (!fs.existsSync(reqPath)) {
      corpusError = "CORPUS_NOT_FOUND";
      checks.push({
        id: "writable_corpus",
        status: "failed",
        required: true,
        code: corpusError,
        message: "requirements.yaml missing under writable corpus",
        observed_at: observedAt,
      });
    } else {
      checks.push({
        id: "writable_corpus",
        status: "ok",
        required: true,
        observed_at: observedAt,
      });
    }
  } catch {
    checks.push({
      id: "writable_corpus",
      status: "unknown",
      required: true,
      code: "CORPUS_UNRESOLVED",
      observed_at: observedAt,
    });
  }

  if (basePath) {
    const bind = bindingStatus(basePath, input.processEnv);
    checks.push({
      id: "identity_binding",
      status: bindingToCheckStatus(bind),
      required: true,
      code: bindingCode(bind),
      observed_at: observedAt,
    });
  } else {
    checks.push({
      id: "identity_binding",
      status: "unknown",
      required: true,
      code: "CORPUS_UNRESOLVED",
      observed_at: observedAt,
    });
  }

  const runtime = await resolveRuntimeIntrospection(input.projectRoot, input.processEnv);
  let runtimeStatus: HealthCheckStatus = "unknown";
  if (runtime.runtime_introspection_status === "ok") {
    runtimeStatus = "ok";
  } else if (runtime.runtime_introspection_status === "unavailable") {
    runtimeStatus = "not_applicable";
  } else {
    runtimeStatus = "degraded";
  }
  checks.push({
    id: "runtime_introspection",
    status: runtimeStatus,
    required: false,
    code:
      runtime.runtime_introspection_status === "error"
        ? "RUNTIME_INTROSPECTION_ERROR"
        : null,
    observed_at: observedAt,
  });

  if (basePath && !corpusError) {
    const syntax = validateIndex("requirements");
    checks.push({
      id: "index_syntax",
      status: syntax.valid ? "ok" : "degraded",
      required: false,
      code: syntax.valid ? null : "INDEX_SYNTAX_INVALID",
      message: syntax.error ? "requirements index YAML invalid" : null,
      observed_at: observedAt,
    });
  }

  try {
    const layout = resolveTiedLayout(getClientProjectRoot());
    const bundleRoot = getMethodologyBasePath();
    const bundleOk = bundleRoot !== null && fs.existsSync(bundleRoot);
    const clientMode = fs.existsSync(layout.installConfigPath);
    checks.push({
      id: "methodology_corpus",
      status: clientMode ? (bundleOk ? "ok" : "degraded") : "not_applicable",
      required: false,
      code: clientMode && !bundleOk ? "BUNDLE_MISSING" : null,
      observed_at: observedAt,
    });
  } catch {
    checks.push({
      id: "methodology_corpus",
      status: "unknown",
      required: false,
      observed_at: observedAt,
    });
  }

  return checks;
}

export function deriveHealthState(checks: HealthCheck[]): HealthState {
  const byId = new Map(checks.map((c) => [c.id, c]));
  const corpus = byId.get("writable_corpus");
  const identity = byId.get("identity_binding");

  if (!corpus || corpus.status === "unknown") {
    return "unknown";
  }
  if (corpus.status === "failed" || identity?.status === "failed") {
    return "unavailable";
  }
  if (corpus.status !== "ok") {
    return "unavailable";
  }
  if (identity?.status === "degraded" || identity?.status === "unknown") {
    return "degraded";
  }

  const optionalImpaired = checks.some(
    (c) =>
      !c.required &&
      (c.status === "degraded" || c.status === "failed"),
  );
  const requiredDegraded = checks.some(
    (c) => c.required && c.status === "degraded",
  );
  if (optionalImpaired || requiredDegraded) {
    return "degraded";
  }
  if (identity?.status === "ok" || identity?.status === "not_applicable") {
    return "ready";
  }
  return "unknown";
}
