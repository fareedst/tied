/**
 * [REQ-ASYNC_PSEUDOCODE_CONTRACTS] [ARCH-ASYNC_CONTRACT_GRAMMAR] [IMPL-ASYNC_PSEUDOCODE_GRAMMAR]
 * T0 structural fixture corpus for optional v1 async contract rows.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { validateEssencePseudocode } from "../analysis/pseudocode-validator.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../..");
const fixtureDir = path.join(
  repoRoot,
  "working/REQ-TIED_ASYNC_METHODOLOGY/fixtures/async-contract",
);
const manifestPath = path.join(fixtureDir, "fixture-manifest.json");
const legacyConstraintFixture = path.join(
  repoRoot,
  "mcp-server/src/analysis/fixtures/constraint-language/corpus-cl-05-v1-compat-no-header.pseudocode.md",
);

const KNOWN_TOKENS = [
  "REQ-ASYNC_PSEUDOCODE_CONTRACTS",
  "ARCH-ASYNC_CONTRACT_GRAMMAR",
  "IMPL-ASYNC_PSEUDOCODE_GRAMMAR",
];

type FixtureEntry = {
  file: string;
  class: string;
  polarity: "positive" | "negative";
  required_row?: string;
  required_rows?: string[];
  insufficiency?: string;
};

type Manifest = {
  fixtures: FixtureEntry[];
  legacy: { file: string; expect_layer_b_ok: boolean };
  proof_boundary: string;
};

function loadFixture(name: string): string {
  return fs.readFileSync(path.join(fixtureDir, name), "utf8");
}

function assertNoRaceClaims(text: string, label: string): void {
  const forbidden = /race[- ]free|deadlock[- ]free|livelock|happens-before proof|fairness guarantee/i;
  assert.equal(forbidden.test(text), false, `${label} must not claim race/deadlock/liveness proof`);
}

function assertInsufficiency(source: string, entry: FixtureEntry): void {
  switch (entry.class) {
    case "await_sequencing":
      assert.match(source, /AWAIT/);
      assert.doesNotMatch(source, /SEQUENCING:|CONTROL:\s*ordering/i);
      break;
    case "message_event_delivery":
      assert.match(source, /SEND/);
      assert.doesNotMatch(source, /MESSAGE_CONTRACT:/);
      break;
    case "cancellation":
      assert.match(source, /CANCELLATION:/);
      assert.doesNotMatch(source, /CANCELLATION:[^\n]*POST:/);
      break;
    case "timeout":
      assert.match(source, /TIMEOUT:/);
      assert.doesNotMatch(source, /TIMEOUT_EXCEEDED|→/);
      break;
    case "retry_idempotency":
      assert.match(source, /RETRY:/);
      assert.doesNotMatch(source, /IDEMPOTENCY:/);
      break;
    case "shared_data":
      assert.match(source, /AWAIT/);
      assert.match(source, /DATA:/);
      assert.doesNotMatch(source, /DATA_TRANSITION:/);
      break;
    case "termination_open_wait":
      assert.match(source, /WHILE|stream|subscribe/i);
      assert.doesNotMatch(source, /TERMINATION:.*may_diverge|TERMINATION: total on|close condition/i);
      break;
    default:
      assert.fail(`Unknown class ${entry.class}`);
  }
}

describe("T0 async contract fixtures [REQ-ASYNC_PSEUDOCODE_CONTRACTS]", () => {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as Manifest;

  it("manifest covers seven classes with pos and neg fixtures", () => {
    assert.equal(manifest.fixtures.length, 14);
    const classes = new Set(manifest.fixtures.map((f) => f.class));
    assert.equal(classes.size, 7);
    for (const cls of classes) {
      const polarities = manifest.fixtures.filter((f) => f.class === cls).map((f) => f.polarity);
      assert.ok(polarities.includes("positive"));
      assert.ok(polarities.includes("negative"));
    }
    assertNoRaceClaims(manifest.proof_boundary, "manifest");
  });

  for (const entry of manifest.fixtures) {
    it(`${entry.polarity} ${entry.class} (${entry.file})`, () => {
      const source = loadFixture(entry.file);
      assertNoRaceClaims(source, entry.file);

      if (entry.polarity === "positive") {
        const rows = entry.required_rows ?? (entry.required_row ? [entry.required_row] : []);
        for (const row of rows) {
          assert.match(source, new RegExp(row.replace(":", "\\:")));
        }
        const report = validateEssencePseudocode({
          token: "IMPL-ASYNC_PSEUDOCODE_GRAMMAR",
          known_tokens: KNOWN_TOKENS,
          pseudocode: source,
        });
        assert.equal(report.ok, true, report.diagnostics.map((d) => d.message).join("; "));
      } else {
        assertInsufficiency(source, entry);
      }
    });
  }

  it("legacy no-async fixture passes Layer B (pre-async-contract compatible)", () => {
    const source = loadFixture(manifest.legacy.file);
    assert.doesNotMatch(source, /ASYNC_BOUNDARY:|TIMEOUT:|CANCELLATION:|SEQUENCING:|MESSAGE_CONTRACT:|RETRY:|IDEMPOTENCY:/);
    const report = validateEssencePseudocode({
      token: "IMPL-ASYNC_PSEUDOCODE_GRAMMAR",
      known_tokens: KNOWN_TOKENS,
      pseudocode: source,
    });
    assert.equal(report.ok, manifest.legacy.expect_layer_b_ok);
  });

  it("existing constraint-language legacy corpus remains green", () => {
    const source = fs.readFileSync(legacyConstraintFixture, "utf8");
    const report = validateEssencePseudocode({
      token: "IMPL-ASYNC_PSEUDOCODE_GRAMMAR",
      known_tokens: KNOWN_TOKENS,
      pseudocode: `# [IMPL-ASYNC_PSEUDOCODE_GRAMMAR] [ARCH-ASYNC_CONTRACT_GRAMMAR] [REQ-ASYNC_PSEUDOCODE_CONTRACTS]\nprocedure LEGACY:\n  # [IMPL-ASYNC_PSEUDOCODE_GRAMMAR] [ARCH-ASYNC_CONTRACT_GRAMMAR] [REQ-ASYNC_PSEUDOCODE_CONTRACTS]\n${source.replace(/^procedure LEGACY:\n/m, "")}`,
    });
    assert.equal(report.ok, true, report.diagnostics.map((d) => d.message).join("; "));
  });
});
