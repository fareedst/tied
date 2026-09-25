import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { buildClosureJoinReport } from "./closure-join-report.js";

// [IMPL-TIED_DAE_INCORPORATION] [ARCH-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION] — How: W3a orphan fails gate.

describe("closure join report [REQ-TIED_DAE_INCORPORATION]", () => {
  it("fails under gate_mode when an IMPL block is orphaned", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "closure-join-"));
    const testDir = path.join(tmp, "src");
    fs.mkdirSync(testDir, { recursive: true });

    const blockLead =
      "// [IMPL-FIXTURE] [ARCH-FIXTURE] [REQ-FIXTURE] — How: mapped block for closure join.";

    fs.writeFileSync(
      path.join(testDir, "mapped.test.ts"),
      `${blockLead}\ndescribe("MAPPED_BLOCK REQ_FIXTURE", () => {\n  it("runs", () => {});\n});\n`,
      "utf8",
    );
    fs.writeFileSync(
      path.join(testDir, "mapped.ts"),
      `${blockLead}\nexport function mappedBlock() { return true; }\n`,
      "utf8",
    );

    const pseudocode = `
ACTIVE PROCEDURE MAPPED_BLOCK
  // [IMPL-FIXTURE] [ARCH-FIXTURE] [REQ-FIXTURE] — How: satisfies SC-CRIT-ONE.
  // SC-CRIT-ONE
  INPUT x
  POST returns ok
END ACTIVE PROCEDURE

ACTIVE PROCEDURE ORPHAN_BLOCK
  // [IMPL-FIXTURE] [ARCH-FIXTURE] [REQ-FIXTURE] — How: no criterion, test, or code anchor.
  INPUT y
  POST orphan
END ACTIVE PROCEDURE
`;

    const report = buildClosureJoinReport({
      req_token: "REQ-FIXTURE",
      satisfaction_criteria_ids: ["SC-CRIT-ONE"],
      impl_pseudocode: [{ token: "IMPL-FIXTURE", pseudocode }],
      project_root: tmp,
      test_globs: ["**/*.test.ts"],
      code_globs: ["**/*.ts", "!**/*.test.ts"],
      gate_mode: true,
      persist: true,
    });

    assert.equal(report.ok, false);
    assert.ok(report.orphans.includes("ORPHAN_BLOCK"));
    assert.ok(report.diagnostics.some((d) => d.code === "ORPHAN_BLOCK"));
    assert.ok(
      report.diagnostics.some((d) =>
        ["ORPHAN_BLOCK", "BLOCK_MISSING_CRITERION", "BLOCK_MISSING_TEST", "BLOCK_MISSING_CODE"].includes(
          d.code,
        ),
      ),
    );
    assert.ok(typeof report.report_path === "string");
    assert.ok(fs.existsSync(report.report_path!));
    const persisted = JSON.parse(fs.readFileSync(report.report_path!, "utf8"));
    assert.equal(persisted.schema_version, "closure-join-report.v1");
  });

  it("passes when criterion, block, test, and code all join", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "closure-join-"));
    const testDir = path.join(tmp, "lib");
    fs.mkdirSync(testDir, { recursive: true });

    const blockLead =
      "// [IMPL-FIXTURE] [ARCH-FIXTURE] [REQ-FIXTURE] — How: full closure.";

    fs.writeFileSync(
      path.join(testDir, "full.test.ts"),
      `${blockLead}\ndescribe("FULL_BLOCK", () => { it("works", () => {}); });\n`,
      "utf8",
    );
    fs.writeFileSync(
      path.join(testDir, "full.ts"),
      `${blockLead}\nexport function fullBlock() {}\n`,
      "utf8",
    );

    const pseudocode = `
ACTIVE PROCEDURE FULL_BLOCK
  ${blockLead}
  // SC-CRIT-FULL
  INPUT z
  POST ok
END ACTIVE PROCEDURE
`;

    const report = buildClosureJoinReport({
      req_token: "REQ-FIXTURE",
      satisfaction_criteria_ids: ["SC-CRIT-FULL"],
      impl_pseudocode: [{ token: "IMPL-FIXTURE", pseudocode }],
      project_root: tmp,
      test_globs: ["**/*.test.ts"],
      code_globs: ["**/*.ts", "!**/*.test.ts"],
      gate_mode: true,
    });

    assert.equal(report.ok, true);
    assert.deepEqual(report.orphans, []);
    assert.equal(report.blocks.length, 1);
    assert.equal(report.blocks[0]?.ok, true);
  });
});
