/**
 * [IMPL-TIED_FILES] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP]
 * How: Copy tied/docs with post-processing for tied-yaml-agent-index and prompt-type-skills.
 */
import fs from "node:fs";
import path from "node:path";
import { copyFileWithAttributes, normalizeCopiedPathTimestamps } from "./copy-managed.mjs";
import { filterClientBootstrapDoc } from "./vocab.mjs";
import { sayWarn, sayXOfYClient } from "./console.mjs";

export function postProcessTiedYamlAgentIndex(dest) {
  let text = fs.readFileSync(dest, "utf8");
  text = text.replaceAll("](../tied/docs/using-tied-without-mcp.md)", "](./using-tied-without-mcp.md)");
  text = text.replaceAll("](../tied/", "](../");
  text = text.replaceAll("](../.cursor/", "](../../.cursor/");
  text = text.replaceAll("](../AGENTS.md)", "](../../AGENTS.md)");
  text = text.replaceAll("](../mcp-server/", "](../../mcp-server/");
  fs.writeFileSync(dest, text, "utf8");
}

export function copyDocs(docsToCopy, tiedSourceDir, tiedDir) {
  const docsDest = path.join(tiedDir, "docs");
  fs.mkdirSync(docsDest, { recursive: true });
  let docsCount = 0;
  let docsTotal = 0;
  for (const f of docsToCopy) {
    const src = path.join(tiedSourceDir, "docs", f);
    const dest = path.join(docsDest, f);
    if (!fs.existsSync(src)) {
      throw new Error(`Missing methodology doc (canonical in TIED repo tied/docs/): ${src}`);
    }
    docsTotal += 1;
    if (!fs.existsSync(dest)) {
      copyFileWithAttributes(src, dest);
      if (f === "tied-yaml-agent-index.md") {
        postProcessTiedYamlAgentIndex(dest);
        normalizeCopiedPathTimestamps(src, dest);
      }
      if (f === "prompt-type-skills.md") {
        filterClientBootstrapDoc(src, dest, f);
      }
      docsCount += 1;
    }
  }
  if (docsTotal > 0) {
    sayXOfYClient(
      docsCount,
      docsTotal,
      `Copied ${docsCount} of ${docsTotal} methodology doc(s) into ${docsDest}.`
    );
    if (docsCount < docsTotal) {
      sayWarn(
        `Preserved ${docsTotal - docsCount} existing methodology document(s); compare them with ${path.join(tiedSourceDir, "docs")} and merge applicable changes.`
      );
    }
  }
  return { docsCount, docsTotal };
}

export function copyConstitutionExample(source, dest) {
  if (!fs.existsSync(source)) {
    throw new Error(`Missing feature orchestration constitution example: ${source}`);
  }
  if (!fs.existsSync(dest)) {
    copyFileWithAttributes(source, dest);
    return "created";
  }
  sayWarn(`Preserved existing client constitution example ${dest}.`);
  return "preserved";
}
