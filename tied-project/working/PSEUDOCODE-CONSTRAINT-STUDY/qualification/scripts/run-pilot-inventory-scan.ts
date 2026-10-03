#!/usr/bin/env node
/**
 * [REQ-PSEUDOCODE_MIGRATION_TOOLING] Phase 3 — pilot inventory scan + dry-run diff (OD-P3-5).
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { METHODOLOGY_PIN_LABEL, REPO_ROOT } from "./lib/constants.ts";
import { readStddWave1 } from "./lib/pilot-wave.ts";

const DRY_RUN_DIR = join(
  REPO_ROOT,
  "working/fleet-constraint-v2/pilots/stdd/dry-run",
);

type PlannedAction = {
  sidecar_path: string;
  impl_token: string;
  action: "insert_grammar_v2_header" | "none";
  classification_before: string;
};

function classifySidecar(text: string): string {
  if (!/Grammar-Version:\s*v2/i.test(text)) return "legacy-v1";
  if (/refinement|@refines|alias mut/i.test(text)) return "constraint-ready-v2";
  return "header-only-v2";
}

function planActions(
  sidecars: Awaited<ReturnType<typeof readStddWave1>>["sidecars"],
): PlannedAction[] {
  return sidecars.map((row) => ({
    sidecar_path: row.sidecar_path,
    impl_token: row.impl_token,
    action: "none" as const,
    classification_before: "unknown-or-mixed",
  }));
}

async function main(): Promise<void> {
  const apply = process.argv.includes("--apply");
  const wave = await readStddWave1();
  const actions: PlannedAction[] = [];

  for (const row of wave.sidecars) {
    const abs = join(REPO_ROOT, row.sidecar_path);
    const text = await readFile(abs, "utf8");
    const classification_before = classifySidecar(text);
    let action: PlannedAction["action"] = "none";
    if (classification_before === "legacy-v1") {
      action = "insert_grammar_v2_header";
      if (apply) {
        const lines = text.split("\n");
        const insertAt = lines.findIndex((l) => l.startsWith("## ") || l.startsWith("procedure "));
        const idx = insertAt > 0 ? insertAt : Math.min(3, lines.length);
        lines.splice(idx, 0, "", "Grammar-Version: v2", "");
        await writeFile(abs, lines.join("\n"), "utf8");
        console.log(`DEBUG: applied v2 header ${row.impl_token}`);
      }
    }
    actions.push({
      sidecar_path: row.sidecar_path,
      impl_token: row.impl_token,
      action,
      classification_before,
    });
  }

  const normalized = JSON.stringify(
    actions.map((a) => ({
      sidecar_path: a.sidecar_path,
      action: a.action,
      classification_before: a.classification_before,
    })),
  );
  const dry_run_content_hash = createHash("sha256").update(normalized).digest("hex");

  await mkdir(DRY_RUN_DIR, { recursive: true });
  const diff = {
    schema_version: "inventory-diff.v1",
    generated_at: new Date().toISOString(),
    client_id: wave.client_id,
    wave_id: wave.wave_id,
    methodology_pin: METHODOLOGY_PIN_LABEL,
    apply_mode: apply,
    planned_actions: actions,
    dry_run_content_hash,
  };
  await writeFile(
    join(DRY_RUN_DIR, "inventory-diff.v1.json"),
    `${JSON.stringify(diff, null, 2)}\n`,
    "utf8",
  );
  console.log(`TRACE: pilot inventory scan complete hash=${dry_run_content_hash} apply=${apply}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
