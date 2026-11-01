import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";

import { buildCorpusMapMarkdown, collectCorpusMapCounts } from "./corpus-map-build.js";

describe("corpus map build [REQ-TIED_META_HUB_REPRESENTATION]", () => {
  let tmp = "";

  before(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "mhr-corpus-"));
    const hub = path.join(tmp, "tied-project");
    fs.mkdirSync(path.join(hub, "working", "REQ-A"), { recursive: true });
    fs.mkdirSync(path.join(hub, "citdp"), { recursive: true });
    fs.mkdirSync(path.join(hub, "vocab"), { recursive: true });
    fs.mkdirSync(path.join(hub, "requirements"), { recursive: true });
    fs.writeFileSync(path.join(hub, "citdp", "CITDP-REQ-A.yaml"), "CITDP-REQ-A: {}\n");
    fs.writeFileSync(path.join(hub, "vocab", "routing.md"), "# routing\n");
    fs.writeFileSync(path.join(hub, "requirements", "REQ-A.yaml"), "REQ-A: {}\n");
  });

  after(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("includes required meta-hub sections", () => {
    const md = buildCorpusMapMarkdown({ projectRoot: tmp });
    assert.match(md, /## Layers/);
    assert.match(md, /## Scale \(inventory\)/);
    assert.match(md, /## Authority rules/);
    assert.match(md, /tied_verify/);
  });

  it("collectCorpusMapCounts walks hub", () => {
    const counts = collectCorpusMapCounts(tmp);
    assert.ok(counts.working_folders >= 1);
    assert.ok(counts.citdp_files >= 1);
    assert.ok(counts.vocab_md >= 1);
  });
});
