/**
 * [IMPL-TIED_FILES] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP]
 * How: BOOTSTRAP_TIED orchestration — same call order as IMPL-TIED_FILES pseudo-code.
 */
import fs from "node:fs";
import path from "node:path";
import { manifestPaths, TIED_REPO_ROOT } from "./constants.mjs";
import { sayOk, sayWarn, sayErr, sayXOfYClient } from "./console.mjs";
import {
  copyFileWithAttributes,
  copyTreeWithAttributes,
  warnModifiedCopyTarget,
} from "./copy-managed.mjs";
import { assertMcpPrerequisite, initializeTiedMcpConfig } from "./mcp-config.mjs";
import { copyHooks, installTiedYamlSkill, installPromptTypeSkills } from "./skills.mjs";
import {
  writeClientVocabHandoffs,
  refreshMethodologyVocab,
  normalizeMethodologyVocabLinks,
} from "./vocab.mjs";
import { copyDocs, copyConstitutionExample } from "./docs.mjs";
import {
  verifyFidelityMethodology,
  verifyAdversarialInquiryMethodology,
  verifyFeatureOrchestrationMethodology,
  verifyInheritedDetailFiles,
  tiedCliDestFor,
  tiedBasePathValueFor,
} from "./verify.mjs";

function resolveTemplateFile(templatesDir, scriptDir, filename) {
  const fromTemplates = path.join(templatesDir, filename);
  if (fs.existsSync(fromTemplates)) return fromTemplates;
  return path.join(scriptDir, filename);
}

function resolveTemplateDir(templatesDir, scriptDir, subdir) {
  const fromTemplates = path.join(templatesDir, subdir);
  if (fs.existsSync(fromTemplates)) return fromTemplates;
  return path.join(scriptDir, subdir);
}

function copyDetailFiles(templateDir, destDir) {
  if (!fs.existsSync(templateDir)) return { count: 0, total: 0, sidecarCount: 0 };
  let count = 0;
  let total = 0;
  let sidecarCount = 0;
  fs.mkdirSync(destDir, { recursive: true });
  for (const name of fs.readdirSync(templateDir)) {
    const src = path.join(templateDir, name);
    if (!fs.statSync(src).isFile()) continue;
    if (name.endsWith(".yaml")) {
      total += 1;
      copyFileWithAttributes(src, path.join(destDir, name));
      count += 1;
    } else if (name.endsWith("-pseudocode.md")) {
      copyFileWithAttributes(src, path.join(destDir, name));
      sidecarCount += 1;
    }
  }
  return { count, total, sidecarCount };
}

/**
 * @param {string} projectRoot absolute client project root
 * @param {{ mergeVocab?: boolean, env?: NodeJS.ProcessEnv }} options
 */
export function bootstrapTied(projectRoot, options = {}) {
  const env = options.env ?? process.env;
  const paths = manifestPaths();
  paths.tiedRepoRoot = TIED_REPO_ROOT;
  paths.hooksSource = path.join(TIED_REPO_ROOT, ".cursor", "hooks.json");

  if (!fs.existsSync(projectRoot) || !fs.statSync(projectRoot).isDirectory()) {
    sayErr(`Target project directory does not exist: ${projectRoot}`);
    throw new Error("UNWRITABLE_DESTINATION");
  }

  assertMcpPrerequisite(TIED_REPO_ROOT);

  const cursorDir = path.join(projectRoot, ".cursor");
  const tiedDir = path.join(projectRoot, "tied");
  const methodologyDir = path.join(tiedDir, "methodology");
  const templatesDir = paths.templatesDir;
  const tiedSourceDir = paths.tiedSourceDir;

  fs.mkdirSync(tiedDir, { recursive: true });
  fs.mkdirSync(path.join(tiedDir, "implementation-decisions"), { recursive: true });
  fs.mkdirSync(path.join(tiedDir, "architecture-decisions"), { recursive: true });
  fs.mkdirSync(path.join(tiedDir, "requirements"), { recursive: true });
  fs.mkdirSync(path.join(cursorDir, "logs"), { recursive: true });

  copyHooks(projectRoot, paths.hooksSource, TIED_REPO_ROOT);

  fs.mkdirSync(cursorDir, { recursive: true });
  initializeTiedMcpConfig(projectRoot, TIED_REPO_ROOT, env);

  installTiedYamlSkill(projectRoot, paths);
  installPromptTypeSkills(projectRoot, paths);

  writeClientVocabHandoffs(path.join(tiedDir, "vocab"));

  let baseCopied = 0;
  for (const template of paths.BASE_FILES) {
    const src = path.join(TIED_REPO_ROOT, template);
    const dest = path.join(projectRoot, template);
    if (!fs.existsSync(src)) {
      sayErr(`Missing base file: ${src}`);
      throw new Error("MISSING_TEMPLATE_SOURCE");
    }
    if (!fs.existsSync(dest)) {
      copyFileWithAttributes(src, dest);
      baseCopied += 1;
    }
  }
  sayXOfYClient(
    baseCopied,
    paths.BASE_FILES.length,
    `Copied ${baseCopied} of ${paths.BASE_FILES.length} base files into ${projectRoot}.`
  );

  warnModifiedCopyTarget(methodologyDir);
  if (fs.existsSync(methodologyDir)) {
    fs.rmSync(methodologyDir, { recursive: true, force: true });
  }
  fs.mkdirSync(path.join(methodologyDir, "requirements"), { recursive: true });
  fs.mkdirSync(path.join(methodologyDir, "architecture-decisions"), { recursive: true });
  fs.mkdirSync(path.join(methodologyDir, "implementation-decisions"), { recursive: true });
  fs.mkdirSync(path.join(methodologyDir, "vocab"), { recursive: true });

  let indexYamlCopied = 0;
  for (const f of paths.INDEX_YAML_FILES) {
    const src = resolveTemplateFile(templatesDir, TIED_REPO_ROOT, f);
    if (!fs.existsSync(src)) {
      sayErr(`Missing index file: ${src}`);
      throw new Error("MISSING_TEMPLATE_SOURCE");
    }
    copyFileWithAttributes(src, path.join(methodologyDir, f));
    indexYamlCopied += 1;
  }
  sayWarn(
    `Copied ${indexYamlCopied} of ${paths.INDEX_YAML_FILES.length} methodology index YAMLs into ${methodologyDir} (overwritten).`
  );

  refreshMethodologyVocab(paths.vocabSrc, path.join(methodologyDir, "vocab"), paths.SOURCE_ONLY_VOCAB_BASENAMES);

  let projectCreated = 0;
  for (const f of paths.INDEX_YAML_FILES) {
    const dest = path.join(tiedDir, f);
    if (!fs.existsSync(dest)) {
      fs.writeFileSync(dest, `# Project ${f} - add project-specific tokens here. Do not edit tied/methodology/.\n{}\n`, "utf8");
      sayOk(`Created project index ${dest} (empty).`);
      projectCreated += 1;
    }
  }
  sayXOfYClient(
    projectCreated,
    paths.INDEX_YAML_FILES.length,
    `Created ${projectCreated} of ${paths.INDEX_YAML_FILES.length} project index file(s) (rest already existed).`
  );

  const constitutionResult = copyConstitutionExample(
    path.join(tiedSourceDir, "constitution.example.yaml"),
    path.join(tiedDir, "constitution.example.yaml")
  );
  if (constitutionResult === "created") {
    sayOk(`Created client constitution example ${path.join(tiedDir, "constitution.example.yaml")}.`);
  }

  copyDocs(paths.DOCS_TO_COPY, tiedSourceDir, tiedDir);

  const implTemplateDir = resolveTemplateDir(templatesDir, TIED_REPO_ROOT, "implementation-decisions");
  const implResult = copyDetailFiles(
    implTemplateDir,
    path.join(methodologyDir, "implementation-decisions")
  );
  if (implResult.total > 0) {
    sayWarn(
      `Copied ${implResult.count} of ${implResult.total} methodology implementation decision(s) into ${path.join(methodologyDir, "implementation-decisions")} (overwritten).`
    );
  }
  if (implResult.sidecarCount > 0) {
    sayWarn(
      `Copied ${implResult.sidecarCount} methodology implementation pseudo-code sidecar(s) into ${path.join(methodologyDir, "implementation-decisions")} (overwritten).`
    );
  }

  const archTemplateDir = resolveTemplateDir(templatesDir, TIED_REPO_ROOT, "architecture-decisions");
  const archResult = copyDetailFiles(
    archTemplateDir,
    path.join(methodologyDir, "architecture-decisions")
  );
  if (archResult.total > 0) {
    sayWarn(
      `Copied ${archResult.count} of ${archResult.total} methodology architecture decision(s) into ${path.join(methodologyDir, "architecture-decisions")} (overwritten).`
    );
  }

  const reqTemplateDir = resolveTemplateDir(templatesDir, TIED_REPO_ROOT, "requirements");
  const reqResult = copyDetailFiles(reqTemplateDir, path.join(methodologyDir, "requirements"));
  if (reqResult.total > 0) {
    sayWarn(
      `Copied ${reqResult.count} of ${reqResult.total} methodology requirement(s) into ${path.join(methodologyDir, "requirements")} (overwritten).`
    );
  }

  normalizeMethodologyVocabLinks(path.join(methodologyDir, "vocab"));

  const tiedBasePathValue = tiedBasePathValueFor(projectRoot);
  const tiedCliDest = tiedCliDestFor(projectRoot);

  verifyFidelityMethodology(tiedDir, tiedBasePathValue, tiedCliDest);
  verifyAdversarialInquiryMethodology(tiedDir);
  verifyFeatureOrchestrationMethodology(projectRoot, tiedDir, tiedBasePathValue, tiedCliDest);
  verifyInheritedDetailFiles(tiedDir, paths.INHERITED_DETAIL_REQUIRED);

  return { projectRoot, tiedDir, tiedBasePathValue };
}

/**
 * [IMPL-TIED_FILES] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP]
 * How: RUN_BOOTSTRAP_ENTRYPOINT — platform entry resolves to shared Node engine.
 */
export function runBootstrapEntrypoint(platform, projectRoot, options = {}) {
  if (platform === "node" || platform === "bash") {
    return bootstrapTied(projectRoot, options);
  }
  throw new Error(`Unsupported bootstrap platform: ${platform}`);
}
