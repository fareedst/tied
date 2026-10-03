#!/usr/bin/env node
/**
 * [REQ-PSEUDOCODE_MIGRATION_TOOLING] Phase 4 P4-F — read-only external client scan (OD-P3-7).
 */
import { access, mkdir, writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { REPO_ROOT } from "./lib/constants.ts";
import {
  buildInventoryDiffV1,
  findManifestClient,
  renderWaveSidecarListYaml,
  scanExternalClientSidecars,
  splitSidecarBatches,
  type InventoryManifestFile,
} from "./lib/external-client-scan.ts";
import { yaml } from "./lib/yaml-io.ts";

const DEFAULT_MANIFEST = join(
  REPO_ROOT,
  "working/fleet-constraint-v2/client-inventory-manifest.v1.yaml",
);

function argValue(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx === -1 || idx + 1 >= process.argv.length) return undefined;
  return process.argv[idx + 1];
}

async function main(): Promise<void> {
  const clientId = argValue("--client-id");
  if (!clientId) {
    console.error(
      "Usage: run-fleet-external-client-scan.ts --client-id ID [--manifest PATH] [--wave-id W-ext-ID-1] [--max-sidecars N]",
    );
    process.exit(1);
  }
  const manifestPath = argValue("--manifest") ?? DEFAULT_MANIFEST;
  const waveId = argValue("--wave-id") ?? `W-ext-${clientId}-1`;
  const maxSidecars = Number(argValue("--max-sidecars") ?? "10");

  const raw = await readFile(manifestPath, "utf8");
  const manifest = yaml.load(raw) as InventoryManifestFile;
  const row = findManifestClient(manifest, clientId);
  const repositoryRoot = row.repository_root;
  if (!repositoryRoot) {
    throw new Error(`DIAGNOSTIC: manifest row ${clientId} missing repository_root`);
  }

  try {
    await access(repositoryRoot);
  } catch {
    console.error(`DIAGNOSTIC: external client root missing: ${repositoryRoot}`);
    process.exit(2);
  }

  const rows = await scanExternalClientSidecars(repositoryRoot);
  const diff = buildInventoryDiffV1(clientId, repositoryRoot, rows);
  const outBase = join(REPO_ROOT, "working/fleet-constraint-v2/waves", clientId);
  const dryRunDir = join(outBase, "dry-run");
  await mkdir(dryRunDir, { recursive: true });
  await writeFile(
    join(dryRunDir, "inventory-diff.v1.json"),
    `${JSON.stringify(diff, null, 2)}\n`,
    "utf8",
  );

  const batches = splitSidecarBatches(rows, maxSidecars);
  if (batches.length > 1) {
    console.error(
      `DIAGNOSTIC: ${clientId} has ${rows.length} sidecars; only wave-1-sidecars.yaml written (batch 1/${batches.length}) — add partition waves for remaining batches`,
    );
  }
  const sidecarListRel = `working/fleet-constraint-v2/waves/${clientId}/wave-1-sidecars.yaml`;
  const sidecarYaml = renderWaveSidecarListYaml({
    client_id: clientId,
    methodology_pin: row.methodology_pin ?? "48d1fbb+",
    wave_id: waveId,
    notes: `P4-F read-only scan; ${rows.length} project IMPL sidecars (header-only classify).`,
    sidecars: batches[0].map((r) => ({
      impl_token: r.impl_token,
      sidecar_path: r.sidecar_path,
    })),
  });
  await mkdir(outBase, { recursive: true });
  await writeFile(join(REPO_ROOT, sidecarListRel), sidecarYaml, "utf8");

  console.log(
    `TRACE: external fleet scan client=${clientId} sidecars=${rows.length} hash=${diff.dry_run_content_hash}`,
  );
  console.log(`TRACE: inventory-diff ${dryRunDir}/inventory-diff.v1.json`);
  console.log(`TRACE: sidecar list ${sidecarListRel}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
