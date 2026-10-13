import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import yaml from "js-yaml";
import { extractYamlFrontMatter, buildSkillStubBody, writeSkillStub } from "./skills-linked.mjs";
import { TIED_REPO_ROOT } from "../constants.mjs";
import { manifestPaths } from "../constants.mjs";

test("stub front matter matches source skill", () => {
  const src = path.join(TIED_REPO_ROOT, "tools/bundled-prompt-type-skills/build-plan/SKILL.md");
  const text = fs.readFileSync(src, "utf8");
  const front = extractYamlFrontMatter(text);
  assert.match(front, /name: build-plan/);
  assert.match(front, /disable-model-invocation: true/);
});

test("stub body names existing store skill path", () => {
  const body = buildSkillStubBody({
    storeRoot: TIED_REPO_ROOT,
    skillName: "build-plan",
    storeSkillRel: path.join("tools", "bundled-prompt-type-skills", "build-plan"),
  });
  const expected = path.join(TIED_REPO_ROOT, "tools/bundled-prompt-type-skills/build-plan/SKILL.md");
  assert.ok(body.includes(expected));
  assert.ok(fs.existsSync(expected));
  assert.ok(!body.includes("tied://"));
});

test("linked stubs preserve parseable frontmatter for every prompt-type skill", () => {
  const { PROMPT_TYPE_SKILL_DIRS, promptTypeSkillsCanonical } = manifestPaths();
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tied-skill-stub-"));
  try {
    for (const skillDir of PROMPT_TYPE_SKILL_DIRS) {
      const srcSkill = path.join(promptTypeSkillsCanonical, skillDir, "SKILL.md");
      const destSkill = path.join(tmpRoot, skillDir, "SKILL.md");
      const body = buildSkillStubBody({
        storeRoot: TIED_REPO_ROOT,
        skillName: skillDir,
        storeSkillRel: path.join("tools", "bundled-prompt-type-skills", skillDir),
      });
      writeSkillStub(destSkill, srcSkill, body);
      const written = fs.readFileSync(destSkill, "utf8");
      const frontBlock = extractYamlFrontMatter(written);
      const inner = frontBlock.replace(/^---\n/, "").replace(/\n---\n$/, "");
      const parsed = yaml.load(inner);
      assert.equal(parsed.name, skillDir, `${skillDir} stub name`);
      assert.equal(typeof parsed.description, "string", `${skillDir} stub description`);
    }
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
});
