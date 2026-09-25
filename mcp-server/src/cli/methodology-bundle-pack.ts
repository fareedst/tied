#!/usr/bin/env node
/**
 * [IMPL-TIED_METHODOLOGY_CLIENT_BOUNDARY] [ARCH-TIED_METHODOLOGY_CLIENT_BOUNDARY] [REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY]
 * CLI entry for PACK_METHODOLOGY_BUNDLE_FOR_RELEASE (release operator / CI).
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  defaultBundleLayout,
  defaultSourceMethodologyDir,
  packMethodologyBundle,
  readTiedMcpVersion,
} from "../methodology-bundle-pack.js";

function usage(): void {
  console.error(`Usage: methodology-bundle-pack [options]

Options:
  --mcp-server-root PATH   Default: directory containing this CLI (mcp-server/)
  --source PATH            Default: ../tied/methodology from repo root
  --corpus-out PATH        Default: methodology-bundle/corpus under mcp-server root
  --manifest-out PATH      Default: methodology-bundle/methodology-bundle-manifest.v1.json
  --dry-run                Print resolved paths only; do not write
  --help
`);
}

function getFlag(argv: string[], flag: string): string | undefined {
  const idx = argv.indexOf(flag);
  if (idx < 0) return undefined;
  const v = argv[idx + 1];
  if (!v || v.startsWith("--")) return undefined;
  return v;
}

function hasFlag(argv: string[], flag: string): boolean {
  return argv.includes(flag);
}

function resolveMcpServerRoot(explicit?: string): string {
  if (explicit?.trim()) {
    return path.resolve(explicit.trim());
  }
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(here, "..", "..");
}

function main(): void {
  const argv = process.argv.slice(2);
  if (hasFlag(argv, "--help") || hasFlag(argv, "-h")) {
    usage();
    process.exit(0);
  }

  const mcpServerRoot = resolveMcpServerRoot(getFlag(argv, "--mcp-server-root"));
  const layout = defaultBundleLayout(mcpServerRoot);
  const source = getFlag(argv, "--source") ?? defaultSourceMethodologyDir(mcpServerRoot);
  const corpusOut = getFlag(argv, "--corpus-out") ?? layout.corpusOutDir;
  const manifestOut = getFlag(argv, "--manifest-out") ?? layout.manifestOutPath;

  if (hasFlag(argv, "--dry-run")) {
    process.stdout.write(
      `${JSON.stringify(
        {
          mcp_server_root: mcpServerRoot,
          source_methodology_dir: path.resolve(source),
          corpus_out_dir: path.resolve(corpusOut),
          manifest_out_path: path.resolve(manifestOut),
          tied_mcp_version: readTiedMcpVersion(mcpServerRoot),
        },
        null,
        2,
      )}\n`,
    );
    process.exit(0);
  }

  const manifest = packMethodologyBundle({
    sourceMethodologyDir: path.resolve(source),
    corpusOutDir: path.resolve(corpusOut),
    manifestOutPath: path.resolve(manifestOut),
    tiedMcpVersion: readTiedMcpVersion(mcpServerRoot),
  });

  process.stdout.write(
    `${JSON.stringify(
      {
        ok: true,
        schema: manifest.schema,
        corpus_out_dir: path.resolve(corpusOut),
        manifest_out_path: path.resolve(manifestOut),
        file_count: manifest.file_count,
        corpus_sha256: manifest.corpus_sha256,
        tied_mcp_version: manifest.tied_mcp_version,
      },
      null,
      2,
    )}\n`,
  );
}

main();
