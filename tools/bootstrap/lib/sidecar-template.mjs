/**
 * [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT]
 * How: Copy the canonical sidecar template into new client projects without rewriting existing files.
 */
import fs from "node:fs";
import path from "node:path";
import { copyFileWithAttributes } from "./copy-managed.mjs";
import { sayXOfYClient } from "./console.mjs";
import { resolveTiedLayout } from "./layout.mjs";
import {
  resolveStoreMethodologyTemplatePath,
  resolveStoreSidecarTemplatePath,
} from "./methodology-bundle.mjs";

/**
 * @param {string} projectRoot
 * @param {string} tiedRepoRoot
 */
export function copySidecarTemplate(projectRoot, tiedRepoRoot) {
  const src = resolveStoreSidecarTemplatePath(tiedRepoRoot);
  if (!fs.existsSync(src)) {
    throw new Error(`Missing sidecar template source: ${src}`);
  }

  const destDir = resolveTiedLayout(projectRoot).templatesDir;
  const dest = path.join(destDir, "impl-essence-pseudocode-template.md");
  fs.mkdirSync(destDir, { recursive: true });

  if (!fs.existsSync(dest)) {
    copyFileWithAttributes(src, dest);
    sayXOfYClient(1, 1, `Copied sidecar template into ${dest}.`);
    return { copied: 1, total: 1 };
  }

  sayXOfYClient(0, 1, `Preserved existing sidecar template at ${dest}.`);
  return { copied: 0, total: 1 };
}

/**
 * @param {string} projectRoot
 * @param {string} tiedRepoRoot
 * @param {string[]} basenames
 */
export function copyMethodologyTemplates(projectRoot, tiedRepoRoot, basenames) {
  if (!basenames?.length) {
    return { copied: 0, total: 0 };
  }

  const destDir = resolveTiedLayout(projectRoot).templatesDir;
  fs.mkdirSync(destDir, { recursive: true });

  let copied = 0;
  let total = 0;
  for (const basename of basenames) {
    const src = resolveStoreMethodologyTemplatePath(tiedRepoRoot, basename);
    if (!fs.existsSync(src)) {
      throw new Error(`Missing methodology template source: ${src}`);
    }
    total += 1;
    const dest = path.join(destDir, basename);
    if (!fs.existsSync(dest)) {
      copyFileWithAttributes(src, dest);
      copied += 1;
      sayXOfYClient(copied, total, `Copied methodology template into ${dest}.`);
    } else {
      sayXOfYClient(copied, total, `Preserved existing methodology template at ${dest}.`);
    }
  }

  return { copied, total };
}
