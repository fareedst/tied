/**
 * [REQ-TIED_PROJECT_INDEX_WRITE_ISOLATION] [REQ-TIED_TWO_FOLDER_LAYOUT]
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import {
  checkDocsVocabLinks,
  DOC_LINK_SCAN_ROOTS,
  markdownTextForLinkScan,
} from "./check-docs-vocab-links.mjs";

describe("checkDocsVocabLinks [REQ-TIED_PROJECT_INDEX_WRITE_ISOLATION]", () => {
  it("includes live agent doc surfaces in scan roots", () => {
    assert.ok(DOC_LINK_SCAN_ROOTS.includes("tied-project/vocab"));
    assert.ok(DOC_LINK_SCAN_ROOTS.includes("tied-bundle/docs"));
    assert.ok(DOC_LINK_SCAN_ROOTS.includes(".cursor/agents"));
    assert.ok(DOC_LINK_SCAN_ROOTS.includes("tools/bundled-tied-yaml-skill"));
    assert.ok(DOC_LINK_SCAN_ROOTS.includes("AGENTS.md"));
  });

  it("flags broken link under tied-bundle/docs", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "doc-links-red-"));
    fs.mkdirSync(path.join(root, "tied-bundle", "docs"), { recursive: true });
    fs.writeFileSync(
      path.join(root, "tied-bundle", "docs", "broken.md"),
      "See [missing](missing-target.md)\n",
      "utf8",
    );
    const result = checkDocsVocabLinks(root);
    assert.equal(result.ok, false);
    assert.ok(result.broken.some((b) => b.file.includes("tied-bundle/docs/broken.md")));
  });

  it("ignores markdown links inside fenced code blocks (operator templates)", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "doc-links-fence-"));
    fs.mkdirSync(path.join(root, "tied-bundle", "docs"), { recursive: true });
    fs.writeFileSync(path.join(root, "tied-bundle", "docs", "target.md"), "# ok\n", "utf8");
    fs.writeFileSync(
      path.join(root, "tied-bundle", "docs", "template.md"),
      [
        "```markdown",
        "| **Source** | [{Vendor}]({canonical URL}) |",
        "```",
        "",
        "See [target](target.md)",
        "",
      ].join("\n"),
      "utf8",
    );
    const result = checkDocsVocabLinks(root);
    assert.equal(result.ok, true);
  });

  it("markdownTextForLinkScan drops fenced regions only", () => {
    const stripped = markdownTextForLinkScan("```\n[inside](nope.md)\n```\n[outside](ok.md)\n");
    assert.match(stripped, /\[outside\]/);
    assert.doesNotMatch(stripped, /inside/);
  });

  it("accepts resolvable relative link under tied-bundle/docs", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "doc-links-green-"));
    fs.mkdirSync(path.join(root, "tied-bundle", "docs"), { recursive: true });
    fs.writeFileSync(path.join(root, "tied-bundle", "docs", "target.md"), "# ok\n", "utf8");
    fs.writeFileSync(
      path.join(root, "tied-bundle", "docs", "good.md"),
      "See [target](target.md)\n",
      "utf8",
    );
    const result = checkDocsVocabLinks(root);
    assert.equal(result.ok, true);
  });
});
