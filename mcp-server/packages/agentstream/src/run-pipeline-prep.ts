/**
 * [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-GOAGENT-PIPELINE] [REQ-TIED_UNIFIED_TOOLCHAIN]
 * Shared pipeline build + post-preload transforms for dry-run and live executor (Phase 4a).
 */
import type { DryRunConfig } from "./dry-run-config.js";
import type { Turn } from "./checklist-load-turns.js";
import { parseFeatureSpecOrderFilter } from "./featurespec-load-turns.js";
import { applyNonCompactHtmlToTurns } from "./htmlformat.js";
import { buildPipelineFromDryRunConfig } from "./pipeline-build.js";
import { sliceFromFirstTurn } from "./pipeline-session.js";
import { applyResumeFromTracker } from "./apply-resume-from-tracker.js";
import { shouldApplyResumeFromTracker } from "./checklist-resume-config.js";

export function buildTurnsFromConfig(cfg: DryRunConfig): {
  turns: Turn[];
  originalTotal: number;
} {
  let featureSpecOpts;
  if (cfg.orderFilterRaw.trim() !== "") {
    featureSpecOpts = {
      orderFilter: parseFeatureSpecOrderFilter(cfg.orderFilterRaw),
    };
  }
  let turns = buildPipelineFromDryRunConfig(cfg, featureSpecOpts);
  const originalTotal = turns.length;
  if (shouldApplyResumeFromTracker(cfg)) {
    const applied = applyResumeFromTracker(cfg, turns);
    if (!applied.ok) {
      throw new Error(`agentstream: resume-from-tracker failed: ${applied.error}`);
    }
  }
  turns = sliceFromFirstTurn(turns, cfg.firstTurn);
  applyNonCompactHtmlToTurns(turns, {
    enabled: cfg.nonCompactHtml,
    stableIndent: cfg.nonCompactHtmlStableIndent,
  });
  return { turns, originalTotal };
}
