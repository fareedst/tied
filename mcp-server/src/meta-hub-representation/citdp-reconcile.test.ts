import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import yaml from "js-yaml";

import { parseDivergentWorkingPathsFromDedupeLog } from "./dedupe-log-paths.js";
import { buildReconcileLedger } from "./citdp-reconcile.js";

describe("citdp reconcile [REQ-TIED_META_HUB_REPRESENTATION]", () => {
  it("parseDivergentWorkingPathsFromDedupeLog extracts kept rows", () => {
    const md = `
## Kept (divergent)
| Path | Basename |
| --- | --- |
| \`tied-project/working/FOO/CITDP-FOO.yaml\` | CITDP-FOO.yaml |
`;
    const paths = parseDivergentWorkingPathsFromDedupeLog(md);
    assert.deepEqual(paths, ["tied-project/working/FOO/CITDP-FOO.yaml"]);
  });

  describe("fixture tree", () => {
    let tmp = "";
    before(() => {
      tmp = fs.mkdtempSync(path.join(os.tmpdir(), "mhr-reconcile-"));
      const hub = path.join(tmp, "tied-project");
      fs.mkdirSync(path.join(hub, "citdp"), { recursive: true });
      fs.mkdirSync(path.join(hub, "working", "REQ-X"), { recursive: true });
      const citdpBody = { change_definition: { desired_behavior: "canonical" } };
      fs.writeFileSync(
        path.join(hub, "citdp", "CITDP-REQ-X.yaml"),
        yaml.dump({ "CITDP-REQ-X": citdpBody }),
      );
      const workingBody = { change_definition: { desired_behavior: "working newer" } };
      const workingFile = path.join(hub, "working", "REQ-X", "CITDP-REQ-X.yaml");
      fs.writeFileSync(workingFile, yaml.dump({ "CITDP-REQ-X": workingBody }));
      const wStat = fs.statSync(workingFile);
      fs.utimesSync(workingFile, wStat.atime, new Date(Date.now() + 60_000));
    });

    after(() => {
      fs.rmSync(tmp, { recursive: true, force: true });
    });

    it("classifies working_newer when mtime ahead", () => {
      const ledger = buildReconcileLedger({
        projectRoot: tmp,
        workingPaths: ["tied-project/working/REQ-X/CITDP-REQ-X.yaml"],
        dryRun: true,
      });
      assert.equal(ledger.rows[0]?.classification, "working_newer");
      assert.equal(ledger.unresolved_conflicts, 0);
    });
  });
});
