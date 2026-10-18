/**
 * [IMPL-TIED_BOUNDED_TRAJECTORY_EVIDENCE] [REQ-TIED_BOUNDED_COMPOSITION] [REQ-REQUEST_EVIDENCE_ENVELOPE]
 * Filename → envelope artifact kind for bounded composition evidence files.
 */

import type { ArtifactKind } from "../request-evidence-envelope/types.js";

export function classifyBoundedEvidenceFilename(filename: string): ArtifactKind | null {
  if (filename.includes("bounded-pilot-budget")) return "bounded_pilot_budget";
  if (filename.includes("bounded-trajectory-manifest")) return "bounded_trajectory_manifest";
  if (filename.includes("bounded-divergence-report")) return "bounded_divergence_report";
  if (filename.includes("bounded-lesson-draft-report")) return "bounded_lesson_draft_report";
  if (filename.includes("bounded-shadow-comparison")) return "bounded_shadow_comparison_report";
  return null;
}
