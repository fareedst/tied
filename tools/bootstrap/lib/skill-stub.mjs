/**
 * [IMPL-TIED_LAYERED_CLIENT_INSTALL] [IMPL-TIED_CLIENT_BOOTSTRAP_SKILLS]
 * How: linked skill stub body helpers shared by skills-linked and client-skills-catalog.
 */
import fs from "node:fs";
import path from "node:path";

/**
 * @param {string} text
 */
export function extractYamlFrontMatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return "";
  return `---\n${match[1].trimEnd()}\n---\n`;
}

/**
 * @param {string} storeRoot
 * @param {string} relativePath
 */
export function storeAbsPath(storeRoot, relativePath) {
  return path.join(storeRoot, relativePath);
}

/**
 * @param {{ storeRoot: string, skillName: string, storeSkillRel: string, sharedHint?: string }} opts
 */
export function buildSkillStubBody(opts) {
  const skillPath = storeAbsPath(opts.storeRoot, opts.storeSkillRel);
  const lines = [
    "",
    `# ${opts.skillName}`,
    "",
    "Read and follow the canonical skill at:",
    "",
    `\`${skillPath}/SKILL.md\``,
    "",
  ];
  if (opts.sharedHint) {
    lines.push(opts.sharedHint, "");
  }
  lines.push(
    "If that store path is missing, re-run `tied-install.sh --refresh` from your TIED store or use `--mode full`.",
    "",
  );
  return lines.join("\n");
}

/**
 * @param {string} destSkillMd
 * @param {string} sourceSkillMd
 * @param {string} stubBody
 */
export function writeSkillStub(destSkillMd, sourceSkillMd, stubBody) {
  const source = fs.readFileSync(sourceSkillMd, "utf8");
  const front = extractYamlFrontMatter(source);
  fs.mkdirSync(path.dirname(destSkillMd), { recursive: true });
  fs.writeFileSync(destSkillMd, `${front}${stubBody}`, "utf8");
}
