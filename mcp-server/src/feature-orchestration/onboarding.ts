import fs from "node:fs";
import path from "node:path";
import { resolveLocalDefaults, type DefaultOptions } from "./defaults.js";
import { applyConfirmedMigration, buildMigrationPreview } from "./migration.js";
import { selectOfflinePath, type CapabilityProbe } from "./offline.js";
import { FeatureStore } from "./store.js";

export type OnboardingContext = {
  project_root: string;
  capabilities?: CapabilityProbe;
  defaults?: DefaultOptions;
};
export type OnboardingResult =
  | { ok: true; command: string; delegate: string; result: unknown; next_action: string; advanced_paths: string[]; mutated_configuration: false }
  | { ok: false; command: string; diagnostics: string[]; fallback?: ReturnType<typeof selectOfflinePath>; mutated_configuration: false };

function advancedPaths(): string[] {
  return [
    ".cursor/skills/tied-yaml/scripts/tied-cli.sh",
    "TIED YAML MCP",
    "tools/agentstream",
    "tied/docs/using-tied-without-mcp.md",
  ];
}

// [IMPL-FEAT_ONBOARDING_COMMANDS] [ARCH-FEAT_ONBOARDING_BOUNDARY] [REQ-FEAT_ONBOARDING_COMMANDS] — delegate onboarding commands without duplicating orchestration.
export function dispatchOnboardingCommand(argv: string[], context: OnboardingContext): OnboardingResult {
  const command = argv.join(" ");
  const root = path.resolve(context.project_root);
  const capabilities = context.capabilities ?? {
    feature_orchestrator: fs.existsSync(path.join(root, "mcp-server", "dist", "feature-orchestration", "entry.js")),
    tied_cli: fs.existsSync(path.join(root, ".cursor", "skills", "tied-yaml", "scripts", "tied-cli.sh")),
    node: true,
    mcp: true,
  };
  const valid = argv[0] === "init" || (argv[0] === "feature" && (argv[1] === "new" || argv[1] === "build" || argv[1] === "migrate"));
  if (!valid) return { ok: false, command, diagnostics: ["Unknown onboarding command. Corrective command: tied init | tied feature new \"<title>\" | tied feature build"], mutated_configuration: false };
  const defaults = resolveLocalDefaults(context.defaults, { ...process.env, ...Object.fromEntries([]) }, root);
  if (!capabilities.node || !capabilities.mcp) {
    const fallback = selectOfflinePath(capabilities, root);
    return {
      ok: false,
      command,
      diagnostics: [`Onboarding prerequisites are unavailable; no configuration was changed. Corrective path: ${fallback.command}`],
      fallback,
      mutated_configuration: false,
    };
  }
  if (!defaults.ok && argv[0] !== "feature" && argv[1] !== "new") {
    const fallback = selectOfflinePath(capabilities, root);
    const offlineDoc = "tied/docs/using-tied-without-mcp.md";
    const correctivePath = fallback.command.includes(offlineDoc) ? fallback.command : `see ${offlineDoc}`;
    return {
      ok: false,
      command,
      diagnostics: [
        ...defaults.diagnostics,
        `Onboarding prerequisites are unavailable; no configuration was changed. Corrective path: ${correctivePath}`,
      ],
      fallback,
      mutated_configuration: false,
    };
  }
  const report = defaults.ok ? defaults.defaults : defaults.report;
  if (argv[0] === "init") {
    fs.mkdirSync(report.base_path.value, { recursive: true });
    fs.mkdirSync(report.feature_directory.value, { recursive: true });
    return {
      ok: true, command, delegate: "feature-orchestrator bootstrap boundary",
      result: { base_path: report.base_path.value, feature_directory: report.feature_directory.value, source_report: report },
      next_action: 'tied feature new "Describe the feature"',
      advanced_paths: advancedPaths(), mutated_configuration: false,
    };
  }
  if (argv[1] === "new") {
    const title = argv.slice(2).join(" ").trim();
    if (!title) return { ok: false, command, diagnostics: ["Feature title is required. Corrective command: tied feature new \"<title>\""], mutated_configuration: false };
    const store = new FeatureStore(report.feature_directory.value);
    const result = store.createIdempotently(`onboarding:${title}`, title);
    return result.ok
      ? { ok: true, command, delegate: "FeatureStore.createIdempotently", result, next_action: `tied feature build --feature ${result.manifest.feature_id}`, advanced_paths: advancedPaths(), mutated_configuration: false }
      : { ok: false, command, diagnostics: [`Feature creation delegate failed: ${result.error}`], mutated_configuration: false };
  }
  if (argv[1] === "migrate") {
    const sourceIndex = argv.indexOf("--source");
    const source = sourceIndex >= 0 ? argv[sourceIndex + 1] : undefined;
    if (!source) return { ok: false, command, diagnostics: ["Migration source is required. Corrective command: tied feature migrate --source prompts/initial-specs.yaml"], mutated_configuration: false };
    const preview = buildMigrationPreview({ feature_spec_paths: [source] });
    const confirmed = argv.includes("--confirm-migration");
    const result = confirmed ? applyConfirmedMigration(preview, { confirm_migration: true }, root) : preview;
    return {
      ok: true,
      command,
      delegate: confirmed ? "applyConfirmedMigration" : "buildMigrationPreview",
      result,
      next_action: confirmed ? "review the published feature manifests" : `re-run with --confirm-migration after reviewing ${source}`,
      advanced_paths: advancedPaths(),
      mutated_configuration: false,
    };
  }
  const feature = argv[2];
  return {
    ok: true,
    command,
    delegate: "readiness -> task graph -> generated view -> agentstream adapter",
    result: { feature: feature ?? null, feature_directory: report.feature_directory.value, source_report: report },
    next_action: "inspect readiness diagnostics, then run the existing feature-orchestrator schedule",
    advanced_paths: advancedPaths(),
    mutated_configuration: false,
  };
}

export function mainOnboarding(argv = process.argv.slice(2)): void {
  const result = dispatchOnboardingCommand(argv, { project_root: process.cwd() });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  process.exitCode = result.ok ? 0 : result.fallback ? 0 : 1;
}
