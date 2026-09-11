/**
 * [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT]
 * Summary: Unit tests for new-project grammar v2 default selection and bootstrap template emission.
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { detectGrammarVersion } from "./pseudocode-grammar-v2.js";
import { GRAMMAR_VERSION, GRAMMAR_VERSION_V2 } from "./pseudocode-ir.js";
import {
  GRAMMAR_V2_HEADER_LINE,
  auditNewClientGrammar,
  classifySidecarVersion,
  evaluateGrammarV2HeaderDimension,
  extractCopyableSidecarTemplate,
  firstNonCommentPreambleLine,
  selectNewProjectGrammarDefault,
} from "./pseudocode-grammar-v2-default.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const canonicalTemplatePath = path.join(repoRoot, "templates", "impl-essence-pseudocode-template.md");

const LEGACY_TEMPLATE_BODY = `# [IMPL-{TOKEN}] [ARCH-{…}] [REQ-{…}]
## Example block
- [IMPL-{TOKEN}] [ARCH-{…}] [REQ-{…}] How: sample block lead.
procedure SAMPLE_PROCEDURE:
  # [IMPL-{TOKEN}] [ARCH-{TOKEN}] [REQ-{TOKEN}] How: sample procedure lead.
  Contract:
    INPUT: sample input
    OUTPUT: sample output
    PRE: true
    POST: success => unchanged
    EFFECTS: pure
  RETURN sample output
`;

describe("selectNewProjectGrammarDefault [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT]", () => {
  it("returns TemplateUnavailable when template body is missing [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT]", () => {
    // [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT] How: Fail closed when generation input is absent.
    assert.deepEqual(selectNewProjectGrammarDefault(undefined, "new_client"), {
      ok: false,
      error: "TemplateUnavailable",
    });
    assert.deepEqual(selectNewProjectGrammarDefault("   ", "new_client"), {
      ok: false,
      error: "TemplateUnavailable",
    });
  });

  it("inserts Grammar-Version: v2 after H1 for new_client bootstrap [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT]", () => {
    // [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT] How: Emit the exact v2 header as the first non-comment preamble line while preserving the v1-compatible body.
    const result = selectNewProjectGrammarDefault(LEGACY_TEMPLATE_BODY, "new_client");
    assert.equal(result.ok, true);
    if (!result.ok) return;

    assert.equal(firstNonCommentPreambleLine(result.body), GRAMMAR_V2_HEADER_LINE);
    assert.match(result.body, /^# \[IMPL-\{TOKEN\}\]/m);
    assert.match(result.body, /procedure SAMPLE_PROCEDURE:/);
    assert.match(result.body, /# \[IMPL-\{TOKEN\}\] \[ARCH-\{TOKEN\}\] \[REQ-\{TOKEN\}\] How: sample procedure lead\./);
    assert.equal(detectGrammarVersion(result.body), GRAMMAR_VERSION_V2);
  });

  it("does not duplicate an existing v2 header [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT]", () => {
    // [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT] How: Idempotent generation when the template already declares grammar v2.
    const withHeader = selectNewProjectGrammarDefault(LEGACY_TEMPLATE_BODY, "new_client");
    assert.equal(withHeader.ok, true);
    if (!withHeader.ok) return;

    const again = selectNewProjectGrammarDefault(withHeader.body, "new_client");
    assert.equal(again.ok, true);
    if (!again.ok) return;
    assert.equal(again.body, withHeader.body);
    assert.equal(
      (again.body.match(/Grammar-Version:\s*v2/gi) ?? []).length,
      1,
      "expected a single v2 header",
    );
  });

  it("returns legacy template unchanged outside new_client bootstrap [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT]", () => {
    // [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT] How: Preserve existing legacy sidecars without rewriting solely to add the header.
    const legacy = selectNewProjectGrammarDefault(LEGACY_TEMPLATE_BODY, "legacy_refresh");
    assert.deepEqual(legacy, { ok: true, body: LEGACY_TEMPLATE_BODY });
    assert.equal(detectGrammarVersion(LEGACY_TEMPLATE_BODY), GRAMMAR_VERSION);
  });
});

describe("canonical sidecar template [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT]", () => {
  it("declares Grammar-Version: v2 as the first non-comment preamble line after H1 [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT]", () => {
    // [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT] How: Canonical template is the authoritative generation source for new projects.
    const template = fs.readFileSync(canonicalTemplatePath, "utf8");
    const copyable = template.split("\n---\n").slice(1).join("\n---\n").trimStart();
    assert.equal(firstNonCommentPreambleLine(copyable), GRAMMAR_V2_HEADER_LINE);
    assert.equal(detectGrammarVersion(copyable), GRAMMAR_VERSION_V2);
  });
});

describe("classifySidecarVersion [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT]", () => {
  it("returns explicit_v2 when the preamble declares Grammar-Version: v2 [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT]", () => {
    // [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT] How: Select the v2 parser boundary only when the exact header is present in the preamble.
    const body = `# [IMPL-X] [ARCH-Y] [REQ-Z]
Grammar-Version: v2
procedure SAMPLE:
  Contract:
    INPUT: x
    OUTPUT: y
    PRE: true
    POST: success => unchanged
    EFFECTS: pure
  RETURN y
`;
    assert.deepEqual(classifySidecarVersion(body), { ok: true, classification: "explicit_v2" });
    assert.equal(detectGrammarVersion(body), GRAMMAR_VERSION_V2);
  });

  it("returns legacy_v1 when the header is absent [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT]", () => {
    // [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT] How: Preserve v1 compatibility for existing headerless sidecars.
    assert.deepEqual(classifySidecarVersion(LEGACY_TEMPLATE_BODY), {
      ok: true,
      classification: "legacy_v1",
    });
    assert.equal(detectGrammarVersion(LEGACY_TEMPLATE_BODY), GRAMMAR_VERSION);
  });

  it("returns InvalidVersionHeader for unsupported grammar headers [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT]", () => {
    // [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT] How: Fail closed on malformed or unsupported version declarations.
    const body = `# [IMPL-X] [ARCH-Y] [REQ-Z]
Grammar-Version: v3
procedure SAMPLE:
  RETURN sample
`;
    assert.deepEqual(classifySidecarVersion(body), { ok: false, error: "InvalidVersionHeader" });
  });
});

describe("auditNewClientGrammar [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT]", () => {
  const generatedWithHeader = `# [IMPL-X] [ARCH-Y] [REQ-Z]
Grammar-Version: v2
procedure SAMPLE:
  Contract:
    INPUT: x
    OUTPUT: y
    PRE: true
    POST: success => unchanged
    EFFECTS: pure
  RETURN y
`;

  it("reports independent dimensions when all inputs pass [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT]", () => {
    // [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT] How: Keep header, Layer B, Layer C, constraint_flow, and legacy evidence separate.
    const result = auditNewClientGrammar({
      generatedSidecarBody: generatedWithHeader,
      layerB: { ok: true },
      layerC: { ok: true, gate_mode_applied: true },
      constraintFlow: false,
      legacyV1: { compatible: true, classification: "legacy_v1" },
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.dimensions.grammar_v2_header, "pass");
    assert.equal(result.dimensions.layer_b.ok, true);
    assert.equal(result.dimensions.layer_c.gate_mode_applied, true);
    assert.equal(result.dimensions.constraint_flow, false);
    assert.equal(result.dimensions.legacy_v1_compatibility, "pass");
  });

  it("fails header dimension independently from Layer B/C [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT]", () => {
    // [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT] How: Prevent header checks from masquerading as structural or runtime proof.
    const result = auditNewClientGrammar({
      generatedSidecarBody: LEGACY_TEMPLATE_BODY,
      layerB: { ok: true },
      layerC: { ok: true, gate_mode_applied: true },
      constraintFlow: false,
      legacyV1: { compatible: true, classification: "legacy_v1" },
    });
    assert.deepEqual(result, { ok: false, error: "GeneratedHeaderMissing" });
    assert.equal(evaluateGrammarV2HeaderDimension(LEGACY_TEMPLATE_BODY), "fail");
  });
});

describe("extractCopyableSidecarTemplate [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT]", () => {
  it("returns the post-front-matter body used by bootstrap and audit [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT]", () => {
    // [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT] How: Share one extraction path between template inspection and disposable-client audit.
    const template = fs.readFileSync(canonicalTemplatePath, "utf8");
    const copyable = extractCopyableSidecarTemplate(template);
    assert.equal(firstNonCommentPreambleLine(copyable), GRAMMAR_V2_HEADER_LINE);
  });
});

describe("copy_files bootstrap sidecar template [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT]", () => {
  it("copies the canonical template with the v2 header into new client projects [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT]", () => {
    // [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT] How: Fresh-client bootstrap emits the grammar v2 default without rewriting existing client templates.
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-grammar-v2-default-"));
    const copyScript = path.join(repoRoot, "copy_files.sh");
    try {
      execFileSync("bash", [copyScript, tempDir], { cwd: repoRoot, stdio: "pipe" });

      const clientTemplate = path.join(tempDir, "templates", "impl-essence-pseudocode-template.md");
      assert.ok(fs.existsSync(clientTemplate), "bootstrap should install the sidecar template");
      const body = fs.readFileSync(clientTemplate, "utf8");
      const copyable = body.split("\n---\n").slice(1).join("\n---\n").trimStart();
      assert.equal(firstNonCommentPreambleLine(copyable), GRAMMAR_V2_HEADER_LINE);

      execFileSync("bash", [copyScript, tempDir], { cwd: repoRoot, stdio: "pipe" });
      assert.equal(fs.readFileSync(clientTemplate, "utf8"), body, "existing client template must be preserved");
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
