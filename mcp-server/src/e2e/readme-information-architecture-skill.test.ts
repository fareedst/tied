import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import {
  installStoreFacilitatorSkillsCopy,
  loadStoreFacilitatorSkills,
} from "../../../tools/bootstrap/lib/store-facilitator-skills.mjs";

const repoRoot = path.resolve(import.meta.dirname, "../../..");

// [IMPL-TIED_STORE_README_IA_SKILL] [ARCH-TIED_STORE_README_IA_SKILL_BOUNDARY] [REQ-TIED_STORE_README_IA_SKILL]
describe("readme-information-architecture skill install [REQ-TIED_STORE_README_IA_SKILL]", () => {
  it("loadStoreFacilitatorSkills includes readme-information-architecture", () => {
    const entries = loadStoreFacilitatorSkills(repoRoot);
    const names = entries.map((e) => e.skillName).sort();
    assert.ok(names.includes("readme-information-architecture"), names.join(","));
  });

  it("installStoreFacilitatorSkillsCopy places SKILL.md with contract markers", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "readme-ia-skill-"));
    const skillsDir = path.join(tmp, ".cursor", "skills");
    installStoreFacilitatorSkillsCopy(repoRoot, skillsDir);
    const skillPath = path.join(skillsDir, "readme-information-architecture", "SKILL.md");
    assert.ok(fs.existsSync(skillPath));
    const text = fs.readFileSync(skillPath, "utf8");
    assert.match(text, /\/readme-information-architecture/);
    assert.match(text, /STORE_FACILITATOR_SKILLS/);
    assert.match(text, /Not methodology/i);
    assert.match(text, /reference\.md/);
    const refPath = path.join(
      repoRoot,
      "tools/bundled-readme-information-architecture-skill/reference.md",
    );
    const ref = fs.readFileSync(refPath, "utf8");
    assert.match(ref, /Nonnegotiable invariants/i);
    assert.match(ref, /Content fidelity/i);
    const bundled = fs.readFileSync(
      path.join(repoRoot, "tools/bundled-readme-information-architecture-skill/SKILL.md"),
      "utf8",
    );
    assert.match(bundled, /name: readme-information-architecture/);
    assert.equal(bundled.match(/disable-model-invocation:\s*true/)?.length, 1);
    fs.rmSync(tmp, { recursive: true, force: true });
  });
});
