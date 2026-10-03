import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { extractYamlFrontMatter, buildSkillStubBody } from "./skills-linked.mjs";
import { TIED_REPO_ROOT } from "../constants.mjs";

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
