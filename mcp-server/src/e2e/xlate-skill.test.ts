import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { installXlateSkill } from "../../../tools/bootstrap/lib/skills.mjs";
import { manifestPaths } from "../../../tools/bootstrap/lib/constants.mjs";

const repoRoot = path.resolve(import.meta.dirname, "../../..");

// [IMPL-TIED_XLATE_SKILL] [ARCH-TIED_XLATE_SKILL_BOUNDARY] [REQ-TIED_XLATE_SKILL] — How: bootstrap installs bundled xlate skill.
describe("xlate skill install [REQ-TIED_XLATE_SKILL]", () => {
  it("installXlateSkill copies SKILL.md mentioning /xlate and routing", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "xlate-skill-"));
    const paths = manifestPaths();
    installXlateSkill(tmp, paths, { skillsInstallDir: path.join(tmp, ".cursor", "skills") });
    const skillPath = path.join(tmp, ".cursor", "skills", "xlate", "SKILL.md");
    assert.ok(fs.existsSync(skillPath));
    const text = fs.readFileSync(skillPath, "utf8");
    assert.match(text, /\/xlate/);
    assert.match(text, /routing\.md/);
    assert.match(text, /RESOLVE charter/);
    assert.match(text, /translate-sponsor-intent/);
    const bundled = fs.readFileSync(path.join(repoRoot, "tools/bundled-xlate-skill/SKILL.md"), "utf8");
    assert.match(bundled, /name: xlate/);
    fs.rmSync(tmp, { recursive: true, force: true });
  });
});
