/**
 * [IMPL-TIED_DAE_VERIFICATION_CHARTER] [REQ-TIED_DAE_VERIFICATION_CHARTER] — Charter opt-in composition.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import yaml from "js-yaml";

import { readCharterPolicy } from "../charter-policy.js";
import { validateChecklistGate } from "../checklist-validator.js";
import { parseGauntletBlock } from "../gauntlet-runner.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const charterFixture = path.join(
  repoRoot,
  "working/REQ-TIED_DAE_INCORPORATION/fixtures/charter/verification-charter-minimal.yaml",
);
const ledgerFixture = path.join(
  repoRoot,
  "working/REQ-TIED_DAE_INCORPORATION/fixtures/ledger/disjoint-verifier-mismatch.json",
);

describe("charter opt-in composition [REQ-TIED_DAE_VERIFICATION_CHARTER]", () => {
  it("loads charter fixture with verification_charter true and gauntlet probes", () => {
    const citdp = yaml.load(fs.readFileSync(charterFixture, "utf8")) as Record<string, unknown>;
    const policy = readCharterPolicy(citdp);
    assert.equal(policy.verificationCharter, true);
    assert.equal(policy.disjointVerifier, "required");
    const gauntlet = parseGauntletBlock(citdp);
    assert.equal(gauntlet.enabled, true);
    assert.ok(gauntlet.probes.length >= 1);
  });

  it("blocks verification when disjoint verifier sessions match (fixture ledger)", () => {
    const citdp = yaml.load(fs.readFileSync(charterFixture, "utf8")) as Record<string, unknown>;
    const ledger = JSON.parse(fs.readFileSync(ledgerFixture, "utf8")) as Record<string, unknown>;
    const result = validateChecklistGate({
      phase: "verification",
      tracker: {
        steps: [
          {
            slug: "sub-adversarial-inquiry-pass",
            disposition: "not_applicable",
            policy: "minimal-depth-no-inquiry",
            rationale: "Charter composition test at minimal depth.",
          },
        ],
      },
      citdp,
      evidence: {
        adherenceLedger: ledger,
        verifierSessionId: ledger.verifier_session_id as string,
      },
    });
    assert.equal(result.allowed, false);
    assert.ok(result.diagnostics.includes("disjoint_verifier_same_session"));
  });
});
