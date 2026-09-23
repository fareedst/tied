/**
 * [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
 * Atomic YAML writer for Authoritative Tracker (Go checklist atomicWriteYAML parity).
 */
import fs from "node:fs";
import path from "node:path";

import yaml from "js-yaml";

export function atomicWriteYaml(
  filePath: string,
  doc: Record<string, unknown>,
): void {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
  const body = yaml.dump(doc, { lineWidth: -1 });
  const tmp = path.join(
    dir,
    `.tracker-${process.pid}-${Date.now()}.yaml.tmp`,
  );
  try {
    fs.writeFileSync(tmp, body, { mode: 0o644 });
    fs.renameSync(tmp, filePath);
  } catch (err) {
    try {
      fs.unlinkSync(tmp);
    } catch {
      /* ignore */
    }
    throw new Error(`write_failure: ${String(err)}`);
  }
}
