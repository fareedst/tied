/**
 * [IMPL-TIED_EDPC_CLIENT_ASSESSMENT] [REQ-TIED_EDPC_CLIENT_ASSESSMENT]
 */

import type { ClientAssessmentModel } from "./client-assessment-compose.js";

const DECISIONS = ["Understand", "Trust", "Protect", "Change", "Decide"] as const;

function hasBlanketHealthyLanguage(cam: ClientAssessmentModel): boolean {
  for (const f of cam.findings) {
    const text = `${f.assertion ?? ""} ${f.significance ?? ""}`.toLowerCase();
    if (text.includes("fully healthy") || text.includes("fully trustworthy")) {
      if (f.evidence_refs.length === 0) return true;
    }
  }
  return false;
}

// [IMPL-TIED_EDPC_CLIENT_ASSESSMENT] [REQ-TIED_EDPC_CLIENT_ASSESSMENT] — SC-CAM-RENDER
export function renderEdpcClientAssessmentMarkdown(cam: ClientAssessmentModel): {
  ok: boolean;
  diagnostics: string[];
  markdown?: string;
} {
  const diagnostics: string[] = [];
  if (cam.schema_version !== "client-assessment-model.v1") {
    diagnostics.push("invalid_cam_schema");
  }
  if (cam.domains.length !== 20) {
    diagnostics.push("invalid_domain_count");
  }
  if (hasBlanketHealthyLanguage(cam)) {
    diagnostics.push("blanket_health_language_without_evidence");
  }
  if (diagnostics.length > 0) {
    return { ok: false, diagnostics: [...new Set(diagnostics)].sort() };
  }

  const lines: string[] = [];
  lines.push("# Client assessment report");
  lines.push("");
  lines.push(`- **baseline_revision:** ${cam.baseline_revision}`);
  lines.push(`- **tier:** ${cam.tier}`);
  lines.push("");

  for (const decision of DECISIONS) {
    lines.push(`## ${decision}`);
    lines.push("");
    lines.push("_Evidence-backed conclusions are separated from consultant decisions in CAM findings._");
    lines.push("");
  }

  lines.push("## Domains (20)");
  lines.push("");
  for (const d of cam.domains) {
    lines.push(`- **${d.domain_id}** — \`${d.status}\`${d.rationale ? `: ${d.rationale}` : ""}`);
  }
  lines.push("");

  lines.push("## Findings register");
  lines.push("");
  for (const f of cam.findings) {
    lines.push(
      `- **${f.finding_id}** — refs: ${f.evidence_refs.join(", ") || "none"}${f.consultant_required ? " (consultant required)" : ""}`,
    );
  }
  lines.push("");

  lines.push("## Meta-assessment");
  lines.push("");
  lines.push(`- publish_gaps: ${cam.publish_gaps.length}`);
  lines.push("");

  lines.push("## Implementation status boundary");
  lines.push("");
  lines.push(
    "REQ and IMPL **status** in `tied-project/` indexes are authoritative only after **`tied_verify`** (or the project verification-gated update step). This report and EDPC claims do not sign off **Implemented** or **Complete** unless a `tied_verify` receipt appears in the traceability appendix.",
  );
  lines.push("");

  lines.push("## Traceability appendix");
  lines.push("");
  for (const [key, ref] of Object.entries(cam.receipt_refs).sort(([a], [b]) => a.localeCompare(b))) {
    lines.push(`- ${key}: ${ref ?? "null"}`);
  }
  lines.push("");

  return { ok: true, diagnostics: [], markdown: lines.join("\n") };
}
