import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

// [IMPL-TIED_CHECKLIST_GATE_OPERATOR_PATH] [ARCH-TIED_CHECKLIST_GATE_OPERATOR_PATH] [REQ-TIED_CHECKLIST_GATE_OPERATOR_PATH]

describe("checklist gate operator skill surface [REQ-TIED_CHECKLIST_GATE_OPERATOR_PATH]", () => {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
  const skillPath = path.join(repoRoot, "tools/bundled-tied-yaml-skill/SKILL.md");

  it("documents forbidden pipe anti-pattern and preferred tied_gate_check path", () => {
    const text = fs.readFileSync(skillPath, "utf8");
    assert.match(text, /Checklist gate operator path/i);
    assert.match(text, /tied_checklist_gate_validate/);
    assert.match(text, /tied_gate_check/);
    assert.match(text, /node -e/);
    assert.ok(
      text.includes("pipe") || text.includes("stdin"),
      "skill must mention pipe or stdin anti-pattern",
    );
    assert.ok(
      text.includes("citdp_path") || text.includes("--citdp"),
      "skill must show path-based gate invocation",
    );
  });
});
