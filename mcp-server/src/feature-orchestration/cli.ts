import path from "node:path";
import { executeLifecycleCommand, type CommandResult } from "./commands.js";
import { FeatureStore } from "./store.js";
import { buildViewSourceProjection, renderGeneratedView, type ViewKind, type ViewSourceInput } from "./views.js";

export type CliResult = { status: number; result: CommandResult | { ok: false; error: string; diagnostics?: string[] } | { ok: true; markdown: string; view_kind: string } };

// [IMPL-FEAT_ORCHESTRATION_CLI] [ARCH-FEAT_ORCHESTRATION_BOUNDARY] [REQ-FEAT_ORCHESTRATION_SURFACE] — How: expose the standalone feature-orchestrator binary as a thin adapter over shared orchestration services.
export function runFeatureOrchestrator(argv: string[], injectedStore?: FeatureStore): CliResult {
  const command = argv[0];
  const validCommands = new Set(["specify", "refine", "plan", "tasks", "verify", "close_out", "view"]);
  if (!command || !validCommands.has(command)) return { status: 2, result: { ok: false, error: "INVALID_ARGUMENTS" } };
  if (command === "view") {
    const kindIndex = argv.indexOf("--kind");
    const sourceIndex = argv.indexOf("--source");
    if (kindIndex < 0 || !argv[kindIndex + 1] || sourceIndex < 0 || !argv[sourceIndex + 1]) {
      return { status: 2, result: { ok: false, error: "INVALID_ARGUMENTS" } };
    }
    try {
      const projection = buildViewSourceProjection(JSON.parse(argv[sourceIndex + 1]!) as ViewSourceInput);
      if (!projection.ok) return { status: 1, result: projection };
      const rendered = renderGeneratedView(projection.projection, argv[kindIndex + 1] as ViewKind);
      return { status: rendered.ok ? 0 : 1, result: rendered };
    } catch {
      return { status: 2, result: { ok: false, error: "INVALID_ARGUMENTS" } };
    }
  }
  const featureIndex = argv.indexOf("--feature");
  const revisionIndex = argv.indexOf("--revision");
  if (featureIndex < 0 || !argv[featureIndex + 1] || revisionIndex < 0 || !/^\d+$/.test(argv[revisionIndex + 1] ?? "")) {
    return { status: 2, result: { ok: false, error: "INVALID_ARGUMENTS" } };
  }
  const tiedIndex = argv.indexOf("--tied");
  const tiedRoot = tiedIndex >= 0 && argv[tiedIndex + 1] ? argv[tiedIndex + 1] : process.env.TIED_BASE_PATH ?? path.join(process.cwd(), "tied");
  const store = injectedStore ?? new FeatureStore(path.join(tiedRoot, "features"));
  const result = executeLifecycleCommand(store, {
    command,
    feature_identifier: argv[featureIndex + 1],
    expected_revision: Number(argv[revisionIndex + 1]),
  });
  return { status: result.ok ? 0 : result.error === "STALE_REVISION" ? 3 : 1, result };
}

export function main(argv = process.argv.slice(2)): void {
  const output = runFeatureOrchestrator(argv);
  process.stdout.write(`${JSON.stringify(output.result, null, 2)}\n`);
  process.exitCode = output.status;
}
