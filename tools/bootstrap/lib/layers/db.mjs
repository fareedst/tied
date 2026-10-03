/**
 * [IMPL-TIED_LAYERED_CLIENT_INSTALL] [ARCH-TIED_LAYERED_CLIENT_INSTALL] [REQ-TIED_LAYERED_CLIENT_INSTALL]
 * How: INSTALL_DB_LAYER — project indexes, vocab handoffs, gitignore block, MCP examples.
 */
import fs from "node:fs";
import path from "node:path";
import { manifestPaths } from "../constants.mjs";
import { copyFileWithAttributes } from "../copy-managed.mjs";
import { sayOk, sayXOfYClient } from "../console.mjs";
import { writeClientVocabHandoffs } from "../vocab.mjs";
import { copyConstitutionExample } from "../docs.mjs";
import { writeGitignoreBlock } from "./gitignore-block.mjs";
import { resolveTiedLayout } from "../layout.mjs";

function resolveTemplateFile(templatesDir, scriptDir, filename) {
  const fromTemplates = path.join(templatesDir, filename);
  if (fs.existsSync(fromTemplates)) return fromTemplates;
  return path.join(scriptDir, filename);
}

/**
 * @param {string} projectRoot
 * @param {{ storeRoot: string }} ctx
 */
export function installDbLayer(projectRoot, ctx) {
  const paths = manifestPaths();
  paths.tiedRepoRoot = ctx.storeRoot;
  const layout = resolveTiedLayout(projectRoot);
  const tiedDir = layout.tiedDir;
  const templatesDir = paths.templatesDir;
  const tiedSourceDir = paths.tiedSourceDir;

  fs.mkdirSync(tiedDir, { recursive: true });
  fs.mkdirSync(path.join(tiedDir, "implementation-decisions"), { recursive: true });
  fs.mkdirSync(path.join(tiedDir, "architecture-decisions"), { recursive: true });
  fs.mkdirSync(path.join(tiedDir, "requirements"), { recursive: true });
  fs.mkdirSync(path.join(projectRoot, ".cursor", "logs"), { recursive: true });

  writeClientVocabHandoffs(path.join(tiedDir, "vocab"));

  let baseCopied = 0;
  for (const template of paths.BASE_FILES) {
    const src = resolveTemplateFile(templatesDir, ctx.storeRoot, template);
    const dest = path.join(projectRoot, template);
    if (!fs.existsSync(src)) {
      throw new Error(`MISSING_TEMPLATE_SOURCE: ${src}`);
    }
    if (!fs.existsSync(dest)) {
      copyFileWithAttributes(src, dest);
      baseCopied += 1;
    }
  }
  sayXOfYClient(baseCopied, paths.BASE_FILES.length, `Copied ${baseCopied} of ${paths.BASE_FILES.length} base files.`);

  let projectCreated = 0;
  for (const f of paths.INDEX_YAML_FILES) {
    const dest = path.join(tiedDir, f);
    if (!fs.existsSync(dest)) {
      fs.writeFileSync(dest, `# Project ${f} - add project-specific tokens here. Do not edit tied-bundle/.\n{}\n`, "utf8");
      sayOk(`Created project index ${dest} (empty).`);
      projectCreated += 1;
    }
  }
  sayXOfYClient(projectCreated, paths.INDEX_YAML_FILES.length, `Created ${projectCreated} project index file(s).`);

  const constitutionResult = copyConstitutionExample(
    path.join(tiedSourceDir, "constitution.example.yaml"),
    path.join(tiedDir, "constitution.example.yaml"),
  );
  if (constitutionResult === "created") {
    sayOk(`Created client constitution example.`);
  }

  writeGitignoreBlock(projectRoot);

  return { tiedDir, baseCopied, projectCreated };
}
