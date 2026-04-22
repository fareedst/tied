/**
 * appendImplementationApproachDetails and safeDumpTiedDetailDoc integration. [IMPL]
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import yaml from "js-yaml";
import { clearBasePathCache } from "./yaml-loader.js";
import { insertRecord } from "./yaml-loader.js";
import {
  writeDetail,
  appendImplementationApproachDetails,
  loadDetail,
} from "./detail-loader.js";

beforeEach(() => {
  clearBasePathCache();
});

describe("appendImplementationApproachDetails", () => {
  it("appends lines without dropping existing implementation_approach.details", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-append-"));
    try {
      process.env.TIED_BASE_PATH = dir;
      clearBasePathCache();
      const token = "IMPL-APPEND-TST";
      const ins = insertRecord("implementation", token, {
        name: "Append test",
        status: "Draft",
        cross_references: [],
        rationale: { why: "test" },
        implementation_approach: { summary: "s", details: ["first bullet"] },
        detail_file: `implementation-decisions/${token}.yaml`,
      });
      assert.strictEqual(ins.ok, true);
      const wr = writeDetail(
        token,
        {
          name: "Append test",
          status: "Draft",
          cross_references: [],
          rationale: { why: "test" },
          implementation_approach: { summary: "s", details: ["first bullet"] },
          traceability: { architecture: [], requirements: [], tests: [], code_annotations: [] },
          related_decisions: { depends_on: [], supersedes: [], see_also: [] },
          detail_file: `implementation-decisions/${token}.yaml`,
          metadata: { created: { date: "2026-04-22", author: "test" } },
        },
        { syncIndex: false }
      );
      assert.strictEqual(wr.ok, true);
      const ap = appendImplementationApproachDetails(token, ["  second  ", "", "third"]);
      assert.strictEqual(ap.ok, true);
      const detail = loadDetail(token);
      assert.ok(detail);
      const ia = detail!.implementation_approach as Record<string, unknown>;
      assert.deepStrictEqual(ia.details, ["first bullet", "second", "third"]);
    } finally {
      delete process.env.TIED_BASE_PATH;
      clearBasePathCache();
      fs.rmSync(dir, { recursive: true });
    }
  });
});

describe("safeDumpTiedDetailDoc (via writeDetail)", () => {
  it("writes essence_pseudocode as a literal block", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-dump-"));
    try {
      process.env.TIED_BASE_PATH = dir;
      clearBasePathCache();
      const token = "IMPL-BLOCK-DUMP";
      const ins = insertRecord("implementation", token, {
        name: "Block dump",
        status: "Draft",
        cross_references: [],
        rationale: { why: "t" },
        implementation_approach: { summary: "s", details: [] },
        detail_file: `implementation-decisions/${token}.yaml`,
      });
      assert.strictEqual(ins.ok, true);
      const ep = "# line1\n# line2\nMAIN:\n  RETURN 0\n";
      const wr = writeDetail(
        token,
        {
          name: "Block dump",
          status: "Draft",
          cross_references: [],
          rationale: { why: "t" },
          implementation_approach: { summary: "s", details: [] },
          essence_pseudocode: ep,
          traceability: { architecture: [], requirements: [], tests: [], code_annotations: [] },
          related_decisions: { depends_on: [], supersedes: [], see_also: [] },
          detail_file: `implementation-decisions/${token}.yaml`,
          metadata: { created: { date: "2026-04-22", author: "test" } },
        },
        { syncIndex: false }
      );
      assert.strictEqual(wr.ok, true);
      const raw = fs.readFileSync(
        path.join(dir, "implementation-decisions", `${token}.yaml`),
        "utf8"
      );
      assert.ok(raw.includes("essence_pseudocode: |-"), raw.slice(0, 400));
      const docs = yaml.loadAll(raw) as unknown[];
      const doc = docs[0] as Record<string, unknown>;
      const rec = doc[token] as Record<string, unknown>;
      // YAML literal block `|-` strips the single trailing newline on load.
      const loaded = String(rec.essence_pseudocode);
      const expected = ep.endsWith("\n") ? ep.slice(0, -1) : ep;
      assert.strictEqual(loaded, expected);
    } finally {
      delete process.env.TIED_BASE_PATH;
      clearBasePathCache();
      fs.rmSync(dir, { recursive: true });
    }
  });
});
