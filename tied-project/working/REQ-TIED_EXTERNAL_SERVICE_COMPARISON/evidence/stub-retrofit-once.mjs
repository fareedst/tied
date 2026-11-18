/**
 * One-off stub retrofit for article captures (build-plan 2026-11-17).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = "/Users/fareed/Documents/dev/chatgpt/stdd";
const dir = path.join(repoRoot, "docs", "comparisons");

const STUB_MARKER =
  /Why this file has no article body|does not reproduce the article body|full article text is \*\*not\*\* stored/i;

const files = [
  "langchain-improving-deep-agents-harness-engineering.md",
  "traefik-harness-engineering-vs-platform-engineering.md",
  "netflix-ontology-driven-observability.md",
  "cursor-continually-improving-agent-harness.md",
  "google-agent-skills-ship-like-products.md",
  "anthropic-llm-formal-verification-appendix.md",
  "persante-sdd-skills.md",
  "langwatch-rebuilding-langwatch-in-51-days.md",
  "alibaba-open-code-review.md",
  "open-specter-legal-workspace.md",
  "onono-foundation-progressive-ai.md",
  "onono-essence-of-understanding-and-language.md",
  "onono-core-manifesto-autonomous-subject.md",
  "onono-mind-ontology-beyond-ai-memory.md",
  "onono-beyond-the-model-continual-learning.md",
  "onono-scientific-foundations-digital-mind.md",
  "onono-world-models-time-journalistic-research.md",
];

function extractTldrBlock(text) {
  const m = text.match(/(?:^##\s+TL;?DR\s*\n)([\s\S]*?)(?=\n## [^#]|\n---\n## |\n---\n\n## |\Z)/im);
  return m ? m[1].trimEnd() : null;
}

function extractTable(text) {
  const lines = text.split("\n");
  const title = lines.find((l) => l.startsWith("# ")) || "# Capture";
  const start = lines.findIndex((l) => l.startsWith("| Field |"));
  if (start < 0) return { title, table: "" };
  const tableLines = [];
  for (let i = start; i < lines.length; i++) {
    if (lines[i].startsWith("|")) tableLines.push(lines[i]);
    else if (tableLines.length > 0) break;
  }
  return { title, table: tableLines.join("\n") };
}

function patchPurpose(table) {
  return table
    .replace(
      /\|\s*\*\*Purpose\*\*\s*\|[^|]+\|/,
      "| **Purpose** | External reference index for Wave 2 comparison — **link + summary only**; does not mint REQ/ARCH/IMPL tokens and does **not** reproduce the article body. |",
    )
    .replace(/\|\s*\*\*Local extract\*\*\s*\|[^|]+\|\n?/g, "");
}

for (const name of files) {
  const fp = path.join(dir, name);
  const text = fs.readFileSync(fp, "utf8");
  if (STUB_MARKER.test(text)) {
    console.log("skip already stub", name);
    continue;
  }
  let tldr = extractTldrBlock(text);
  if (!tldr) {
    const introEnd = text.indexOf("---", text.indexOf("---") + 3);
    const afterMeta = introEnd > 0 ? text.slice(introEnd) : text;
    const firstPara = afterMeta
      .split("\n\n")
      .map((p) => p.trim())
      .find((p) => p && !p.startsWith("#") && !p.startsWith("!") && !p.startsWith("|"));
    tldr = firstPara
      ? `Summarizes themes used in the sibling analysis (read off-repo for wording).\n\n- ${firstPara.slice(0, 500)}`
      : null;
  }
  if (!tldr) {
    console.error("NO_TLDR", name);
    continue;
  }
  const { title, table } = extractTable(text);
  const patchedTable = patchPurpose(table);
  const vendor = name.split("-")[0];
  const body = `${title}

${patchedTable}

---

## Why this file has no article body

The source was used to author the sibling analysis, but the **full text is not kept in-repo**. This stub retains metadata, **TL;DR**, and pointers. Read at the **Source** link; do not paste vendor prose back into this repository.

---

## TL;DR

${tldr}

---

## Notes for stdd readers

- Claims above are **summary-only** for comparison traceability (${vendor}-reported / target-repo-observed as labeled).
- Wave 2 sibling analysis holds the TIED mapping — **reference only**; effectiveness not_measured unless enrolled.
`;
  fs.writeFileSync(fp, body);
  console.log("stubbed", name, body.split("\n").length);
}