import { describe, it } from "node:test";
import assert from "node:assert";

import {
  parseChangeImpactProfile,
  computeImpactLegs,
  ChangeImpactProfileSchema,
} from "./change-impact-profile.js";

describe("change-impact-profile.v1", () => {
  it("parses_valid_profile", () => {
    const raw = {
      schema_version: "change-impact-profile.v1",
      proof_boundary: "path/glob touch only — not semantic or REQ satisfaction",
      legs: [
        {
          leg_id: "src_tree",
          label: "Source tree",
          path_globs: ["src/**"],
        },
      ],
    };
    const profile = parseChangeImpactProfile(raw);
    assert.strictEqual(profile.schema_version, "change-impact-profile.v1");
    assert.strictEqual(profile.legs.length, 1);
  });

  it("rejects_missing_proof_boundary", () => {
    const raw = {
      schema_version: "change-impact-profile.v1",
      legs: [{ leg_id: "x", label: "X", path_globs: ["**"] }],
    };
    const parsed = ChangeImpactProfileSchema.safeParse(raw);
    assert.strictEqual(parsed.success, false);
    if (!parsed.success) {
      assert.ok(parsed.error.issues.some((i) => i.path.join(".") === "proof_boundary"));
    }
  });

  it("computeImpactLegs_matches_globs", () => {
    const profile = parseChangeImpactProfile({
      schema_version: "change-impact-profile.v1",
      proof_boundary: "touch only",
      legs: [
        { leg_id: "src", label: "Src", path_globs: ["src/**"] },
        { leg_id: "ontology", label: "Onto", path_globs: ["ontology/**"] },
      ],
    });
    const legs = computeImpactLegs(profile, ["src/a.ts", "docs/readme.md"]);
    const srcLeg = legs.find((l) => l.leg_id === "src");
    const ontoLeg = legs.find((l) => l.leg_id === "ontology");
    assert.ok(srcLeg);
    assert.deepStrictEqual(srcLeg?.matched_touched_paths, ["src/a.ts"]);
    assert.strictEqual(ontoLeg?.matched_count, 0);
  });

  it("computeImpactLegs_deterministic_order", () => {
    const profile = parseChangeImpactProfile({
      schema_version: "change-impact-profile.v1",
      proof_boundary: "touch only",
      legs: [{ leg_id: "all", label: "All", path_globs: ["*.ts"] }],
    });
    const touched = ["z.ts", "a.ts", "m.ts"];
    const a = computeImpactLegs(profile, touched);
    const b = computeImpactLegs(profile, [...touched].reverse());
    assert.deepStrictEqual(a[0].matched_touched_paths, ["a.ts", "m.ts", "z.ts"]);
    assert.deepStrictEqual(b[0].matched_touched_paths, a[0].matched_touched_paths);
  });
});
