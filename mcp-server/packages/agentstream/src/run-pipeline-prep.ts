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
  turns = sliceFromFirstTurn(turns, cfg.firstTurn);
  applyNonCompactHtmlToTurns(turns, {
    enabled: cfg.nonCompactHtml,
    stableIndent: cfg.nonCompactHtmlStableIndent,
  });
  return { turns, originalTotal };
}
