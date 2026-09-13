import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** [REQ-PSEUDOCODE_TYPED_FLOW] qualification harness — read-only corpus constants. */
/** OD-P2-1 fleet pin (full SHA); README uses shorthand `48d1fbb+`. */
export const BASELINE_ANCHOR_COMMIT =
  "48d1fbbbd1c26dfdb3ac6d74b4cb36c60372dcd7" as const;
export const METHODOLOGY_PIN_LABEL = "48d1fbb+";
export const MANIFEST_SCHEMA_VERSION = "qualification-manifest.v1";
export const EXTERNAL_CORPUS_ROOT = "/Users/fareed/Documents/dev/test";

export const PRODUCTION_PANEL_IDS = [
  "1788547701",
  "1787626480",
  "1787691672",
  "1787507684",
  "1787638699",
  "1787416567",
  "1787495576",
  "1787603099",
  "1787461685",
  "1787421852",
] as const;

export const STRESS_CLIENT_ID = "tied-win-diff";
export const TIER_C_SMOKE_COUNT = 6;

const scriptDir = dirname(fileURLToPath(import.meta.url));
export const QUALIFICATION_ROOT = resolve(scriptDir, "../..");
export const REPO_ROOT = resolve(QUALIFICATION_ROOT, "../../..");
export const MCP_SERVER_ROOT = join(REPO_ROOT, "mcp-server");
export const STDD_PROJECT_SIDECARS_ROOT = join(
  REPO_ROOT,
  "tied/implementation-decisions",
);

export const PATHS = {
  manifest: join(QUALIFICATION_ROOT, "manifest.yaml"),
  baseline: join(QUALIFICATION_ROOT, "baseline"),
  pilot: join(QUALIFICATION_ROOT, "pilot"),
  snapshots: join(QUALIFICATION_ROOT, "snapshots"),
  metrics: join(QUALIFICATION_ROOT, "metrics"),
  expectations: join(QUALIFICATION_ROOT, "expectations"),
} as const;
