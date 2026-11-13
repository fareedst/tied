/**
 * [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] DIAGNOSTICS_FIXTURE_COVERAGE — SC-HMEP-M1-07
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FIXTURE_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "fixtures",
  "stream-json",
);

const FIXTURE_HARNESS: Record<string, "cursor" | "claude" | "both"> = {
  "cursor-success-with-usage": "cursor",
  "cursor-success-no-usage": "cursor",
  "cursor-tool-failure": "cursor",
  "cursor-truncated-jsonl": "cursor",
  "claude-success-verbose": "claude",
  "claude-resume-cumulative": "claude",
  "claude-tool-failure": "claude",
  "duplicate-event-id": "both",
  "unknown-event-type": "both",
};

export function fixtureCoverageReport(): Record<string, string[]> {
  const byHarness: Record<string, string[]> = { cursor: [], claude: [], both: [] };
  if (!fs.existsSync(FIXTURE_DIR)) {
    return byHarness;
  }
  for (const file of fs.readdirSync(FIXTURE_DIR)) {
    if (!file.endsWith(".jsonl")) {
      continue;
    }
    const id = file.replace(/\.jsonl$/, "");
    const harness = FIXTURE_HARNESS[id] ?? "both";
    byHarness[harness].push(id);
  }
  for (const k of Object.keys(byHarness)) {
    byHarness[k].sort();
  }
  return byHarness;
}

export function formatDiagnosticsReport(storeRoot: string): string {
  const coverage = fixtureCoverageReport();
  return JSON.stringify(
    {
      store: storeRoot,
      fixture_coverage: coverage,
      TRACE: "SC-HMEP-M1-07 fixture ids by harness label",
    },
    null,
    2,
  );
}
