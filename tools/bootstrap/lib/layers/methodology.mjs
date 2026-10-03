/**
 * [IMPL-TIED_LAYERED_CLIENT_INSTALL] [ARCH-TIED_LAYERED_CLIENT_INSTALL] [REQ-TIED_LAYERED_CLIENT_INSTALL]
 * [IMPL-TIED_TWO_FOLDER_LAYOUT] [ARCH-TIED_TWO_FOLDER_LAYOUT] [REQ-TIED_TWO_FOLDER_LAYOUT]
 * How: MATERIALIZE_METHOD_FOLDER under tied-bundle/ only (linked symlink/copy/stub; full copy).
 */
import fs from "node:fs";
import path from "node:path";
import { manifestPaths } from "../constants.mjs";
import { isSourceOnlyVocab } from "../vocab.mjs";
import { copyFileWithAttributes, warnModifiedCopyTarget } from "../copy-managed.mjs";
import { copyDocs } from "../docs.mjs";
import { copySidecarTemplate } from "../sidecar-template.mjs";
import { installClaudeMdTemplate } from "../claude-md.mjs";
import { copyHooks } from "../skills.mjs";
import { mergeClaudeAdherenceHooks } from "../claude-adherence-hooks.mjs";
import {
  refreshMethodologyVocab,
  normalizeMethodologyVocabLinks,
} from "../vocab.mjs";
import { writeDocRedirectStub } from "./skills-linked.mjs";
import { applyMethodologyClientBoundary } from "../methodology-client-boundary.mjs";
import { resolveTiedLayout } from "../layout.mjs";
import {
  materializeLinkedMethodologyBundle,
  resolveStoreDocsDir,
  resolveStoreMethodologyIndexRoot,
  resolveStoreSidecarTemplatePath,
  resolveStoreVocabDir,
} from "../methodology-bundle.mjs";

function copyDetailFiles(templateDir, destDir) {
  if (!fs.existsSync(templateDir)) return { count: 0, total: 0 };
  let count = 0;
  let total = 0;
  fs.mkdirSync(destDir, { recursive: true });
  for (const name of fs.readdirSync(templateDir)) {
    const src = path.join(templateDir, name);
    if (!fs.statSync(src).isFile()) continue;
    if (name.endsWith(".yaml") || name.endsWith("-pseudocode.md")) {
      total += 1;
      copyFileWithAttributes(src, path.join(destDir, name));
      count += 1;
    }
  }
  return { count, total };
}

/**
 * @param {string} projectRoot
 * @param {{ storeRoot: string, methodologyBundle: "live"|"pinned" }} options
 */
export function installMethodologyLinked(projectRoot, options) {
  const paths = manifestPaths();
  const layout = resolveTiedLayout(projectRoot);
  const docsDest = layout.docsDir;
  const storeDocs = resolveStoreDocsDir(options.storeRoot);
  fs.mkdirSync(docsDest, { recursive: true });

  for (const f of paths.DOCS_TO_COPY) {
    const storeDoc = path.join(storeDocs, f);
    writeDocRedirectStub(path.join(docsDest, f), storeDoc, f);
  }

  materializeLinkedMethodologyBundle(projectRoot, options.storeRoot, options.methodologyBundle ?? "live");

  const methVocabDest = layout.methodVocabDir;
  fs.mkdirSync(methVocabDest, { recursive: true });
  const storeVocab = resolveStoreVocabDir(options.storeRoot);
  if (fs.existsSync(storeVocab)) {
    for (const name of fs.readdirSync(storeVocab)) {
      if (!name.endsWith(".md")) continue;
      if (isSourceOnlyVocab(name, paths.SOURCE_ONLY_VOCAB_BASENAMES)) continue;
      const dest = path.join(methVocabDest, name);
      if (fs.existsSync(dest)) continue;
      writeDocRedirectStub(dest, path.join(storeVocab, name), name);
    }
  }

  fs.mkdirSync(layout.templatesDir, { recursive: true });
  const templateDest = path.join(layout.templatesDir, "impl-essence-pseudocode-template.md");
  const storeTemplate = resolveStoreSidecarTemplatePath(options.storeRoot);
  if (fs.existsSync(storeTemplate)) {
    if (fs.existsSync(templateDest)) {
      fs.rmSync(templateDest, { force: true });
    }
    fs.symlinkSync(storeTemplate, templateDest, "file");
  } else {
    writeDocRedirectStub(templateDest, storeTemplate, "impl-essence-pseudocode-template.md");
  }

  const hooksSource = path.join(options.storeRoot, ".cursor", "hooks.json");
  copyHooks(projectRoot, hooksSource, options.storeRoot);
  installClaudeMdTemplate(projectRoot, options.storeRoot);
  mergeClaudeAdherenceHooks(projectRoot, options.storeRoot);

  return { mode: "linked", bundleDir: layout.bundleDir };
}

/**
 * @param {string} projectRoot
 * @param {{
 *   storeRoot: string;
 *   methodologyReadonly?: boolean;
 *   installMethodologyHook?: boolean;
 *   platform?: string;
 * }} options
 */
export function installMethodologyFull(projectRoot, options) {
  const paths = manifestPaths();
  const storeRoot = options.storeRoot;
  const layout = resolveTiedLayout(projectRoot);
  const bundleDir = layout.bundleDir;
  const storeIndexRoot = resolveStoreMethodologyIndexRoot(storeRoot);
  const storeDocsRoot = path.dirname(resolveStoreDocsDir(storeRoot));
  const tiedDir = layout.tiedDir;

  warnModifiedCopyTarget(bundleDir);
  if (fs.existsSync(bundleDir)) {
    fs.rmSync(bundleDir, { recursive: true, force: true });
  }
  fs.mkdirSync(path.join(bundleDir, "requirements"), { recursive: true });
  fs.mkdirSync(path.join(bundleDir, "architecture-decisions"), { recursive: true });
  fs.mkdirSync(path.join(bundleDir, "implementation-decisions"), { recursive: true });
  fs.mkdirSync(layout.methodVocabDir, { recursive: true });

  for (const f of paths.INDEX_YAML_FILES) {
    const src = path.join(storeIndexRoot, f);
    if (!fs.existsSync(src)) {
      throw new Error(`MISSING_TEMPLATE_SOURCE: ${f}`);
    }
    copyFileWithAttributes(src, path.join(bundleDir, f));
  }

  refreshMethodologyVocab(
    resolveStoreVocabDir(storeRoot),
    layout.methodVocabDir,
    paths.SOURCE_ONLY_VOCAB_BASENAMES,
  );

  copyDocs(paths.DOCS_TO_COPY, storeDocsRoot, layout.bundleDir);
  copySidecarTemplate(projectRoot, storeRoot);

  for (const sub of ["implementation-decisions", "architecture-decisions", "requirements"]) {
    copyDetailFiles(path.join(storeIndexRoot, sub), path.join(bundleDir, sub));
  }

  normalizeMethodologyVocabLinks(layout.methodVocabDir);

  const hooksSource = path.join(storeRoot, ".cursor", "hooks.json");
  copyHooks(projectRoot, hooksSource, storeRoot);
  installClaudeMdTemplate(projectRoot, storeRoot);
  mergeClaudeAdherenceHooks(projectRoot, options.storeRoot);

  applyMethodologyClientBoundary(projectRoot, {
    methodologyReadonly: options.methodologyReadonly === true,
    installMethodologyHook: options.installMethodologyHook === true,
    platform: options.platform ?? process.platform,
    methodologyDir: bundleDir,
  });

  return { mode: "full", bundleDir, tiedDir };
}
