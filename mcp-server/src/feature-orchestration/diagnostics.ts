export type ReadinessDiagnostic = {
  code: string;
  prerequisite: string;
  phase: string;
  evidence: string;
  corrective_command: string;
  severity?: "error" | "warning";
  mutating: false;
};
export type ReadinessReport = {
  ready: boolean;
  blocked: boolean;
  feature_state: unknown;
  capability_state: unknown;
  evidence: unknown;
  diagnostics: ReadinessDiagnostic[];
  proof_boundaries: string[];
  mutating: false;
};

// [IMPL-FEAT_READINESS_DIAGNOSTICS] [ARCH-FEAT_READINESS_DIAGNOSTICS] [REQ-FEAT_READINESS_DIAGNOSTICS] — adapt readiness evidence into deterministic corrective diagnostics.
export function buildReadinessReport(featureState: unknown, capabilityState: unknown, readinessEvidence: unknown): ReadinessReport {
  const source = readinessEvidence && typeof readinessEvidence === "object" ? readinessEvidence as { missing?: unknown[] } : {};
  const diagnostics = (Array.isArray(source.missing) ? source.missing : []).flatMap((entry): ReadinessDiagnostic[] => {
    if (!entry || typeof entry !== "object") return [];
    const value = entry as Record<string, unknown>;
    if (typeof value.code !== "string" || typeof value.prerequisite !== "string" || typeof value.phase !== "string" ||
        typeof value.evidence !== "string" || typeof value.corrective_command !== "string") return [];
    return [{
      code: value.code,
      prerequisite: value.prerequisite,
      phase: value.phase,
      evidence: value.evidence,
      corrective_command: value.corrective_command,
      severity: value.severity === "warning" ? "warning" : "error",
      mutating: false,
    }];
  }).sort((left, right) =>
    (["init", "new", "build", "verify", "close_out"].indexOf(left.phase) - ["init", "new", "build", "verify", "close_out"].indexOf(right.phase)) ||
    left.prerequisite.localeCompare(right.prerequisite) ||
    left.code.localeCompare(right.code) ||
    left.corrective_command.localeCompare(right.corrective_command));
  return {
    ready: diagnostics.length === 0,
    blocked: diagnostics.some((diagnostic) => diagnostic.severity === "error"),
    feature_state: featureState,
    capability_state: capabilityState,
    evidence: readinessEvidence,
    diagnostics,
    proof_boundaries: ["readiness is not TIED consistency", "readiness is not runtime correctness"],
    mutating: false,
  };
}

// [IMPL-FEAT_READINESS_DIAGNOSTICS] [ARCH-FEAT_READINESS_DIAGNOSTICS] [REQ-FEAT_READINESS_DIAGNOSTICS] — produce stable operator-facing fields without executing remediation.
export function formatReadinessDiagnostic(diagnostic: ReadinessDiagnostic): ReadinessDiagnostic {
  return { ...diagnostic, mutating: false };
}
