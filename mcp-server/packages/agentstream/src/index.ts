#!/usr/bin/env node
/**
 * [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]
 * TS agentstream entry (strangler). Phase 3b: TS-native --checklist-tracker-preview; other argv may forward to Go.
 */
import { spawnGoAgentstream } from "./dispatch-go.js";
import {
  encodePreviewReport,
  previewTrackerMigration,
} from "./tracker-migration-preview.js";
import { extractChecklistTrackerPreview } from "./ts-native-args.js";

function printHelp(): void {
  console.error(`Usage: tied agentstream [agentstream options...]

Phase 3b TS-native: --checklist-tracker-preview (with -c / --lead-checklist-yaml).
Other flags may forward to Go when TIED_AGENTSTREAM_IMPL=ts (see stderr DIAGNOSTIC).

Set TIED_AGENTSTREAM_IMPL=go (default) to invoke Go from \`tied agentstream\`; set ts for this entry.

See tools/agentstream/README.md for flags.
`);
}

function runChecklistTrackerPreview(args: string[]): void {
  const parsed = extractChecklistTrackerPreview(args);
  if (!parsed) {
    console.error("agentstream: internal preview parse failed");
    process.exit(2);
  }
  try {
    const report = previewTrackerMigration(
      parsed.leadChecklistYaml,
      parsed.trackerPreviewPath,
    );
    process.stdout.write(encodePreviewReport(report));
    process.exit(0);
  } catch (err) {
    console.error(`agentstream: ${String(err)}`);
    process.exit(1);
  }
}

function main(): void {
  const args = process.argv.slice(2);
  if (
    args.length === 0 ||
    args[0] === "-h" ||
    args[0] === "--help" ||
    args[0] === "help"
  ) {
    printHelp();
    process.exit(args.length === 0 ? 1 : 0);
  }

  try {
    const preview = extractChecklistTrackerPreview(args);
    if (preview) {
      runChecklistTrackerPreview(args);
      return;
    }
  } catch (err) {
    console.error(`agentstream: ${String(err)}`);
    process.exit(2);
  }

  console.error(
    "DIAGNOSTIC: TIED_AGENTSTREAM_IMPL=ts; subcommand not implemented in TS — forwarding to Go agentstream",
  );
  spawnGoAgentstream(args, import.meta.url);
}

main();
