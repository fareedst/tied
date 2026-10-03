import { createHash } from "node:crypto";

/** Byte-stable regression subset per plan Step 1 baseline capture fields. */
export type ReportSnapshot = {
  schema_version: string;
  ok: boolean;
  gate_mode_applied?: true;
  input_identity: { algorithm: string; hash: string; byte_length: number };
  truncated: boolean;
  diagnostic_codes: string[];
  unknown_causes: string[];
  budget_truncation: boolean;
  serialization_hash: string;
};

type ReportLike = {
  schema_version: string;
  ok: boolean;
  gate_mode_applied?: true;
  input_identity: { algorithm: string; hash: string; byte_length: number };
  truncated: boolean;
  diagnostics: Array<{ code: string }>;
  unknowns: Array<{ cause?: string }>;
  budgets_applied?: { effective?: Record<string, number> };
};

export function extractReportSnapshot(report: ReportLike): ReportSnapshot {
  const diagnostic_codes = [...new Set(report.diagnostics.map((d) => d.code))].sort();
  const unknown_causes = [
    ...new Set(report.unknowns.map((u) => u.cause ?? "unspecified")),
  ].sort();
  const budget_truncation =
    report.truncated ||
    report.diagnostics.some((d) => d.code === "budget_exceeded") ||
    false;

  const canonical = {
    schema_version: report.schema_version,
    ok: report.ok,
    gate_mode_applied: report.gate_mode_applied ?? null,
    input_identity: report.input_identity,
    truncated: report.truncated,
    diagnostic_codes,
    unknown_causes,
    budget_truncation,
  };

  const serialization_hash = createHash("sha256")
    .update(JSON.stringify(canonical), "utf8")
    .digest("hex");

  return { ...canonical, serialization_hash };
}
