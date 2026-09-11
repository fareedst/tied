/**
 * [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT]
 * How: Copy the canonical sidecar template into new client projects without rewriting existing files.
 */
import fs from "node:fs";
import path from "node:path";
import { copyFileWithAttributes } from "./copy-managed.mjs";
import { sayXOfYClient } from "./console.mjs";

const SIDECAR_TEMPLATE_REL = path.join("templates", "impl-essence-pseudocode-template.md");

/**
 * @param {string} projectRoot
 * @param {string} tiedRepoRoot
 */
export function copySidecarTemplate(projectRoot, tiedRepoRoot) {
  const src = path.join(tiedRepoRoot, SIDECAR_TEMPLATE_REL);
  if (!fs.existsSync(src)) {
    throw new Error(`Missing sidecar template source: ${src}`);
  }

  const destDir = path.join(projectRoot, "templates");
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
