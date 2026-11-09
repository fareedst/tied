/**
 * [REQ-WF_TRIAL_READOUT_GRADING_RATIONALE] [IMPL-WF_TRIAL_READOUT_GRADING_RATIONALE]
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { TIED_REPO_ROOT } from "./constants.mjs";
import {
  bandToScore,
  isSubABand,
  meanCompactGrades,
  normalizeBand,
  parseSessionGradingTable,
  validateSessionGradingRationales,
} from "./read-trial-readout-session-grading.mjs";

const WF_REF = path.join(TIED_REPO_ROOT, "tools/bundled-record-wf-trial-skill/reference.md");
const WF_SKILL = path.join(TIED_REPO_ROOT, "tools/bundled-record-wf-trial-skill/SKILL.md");
const CATALOG = path.join(
  TIED_REPO_ROOT,
  "docs/demos/catalog-traditional-workflow-trial-prompts.md",
);
const DEMOS = path.join(TIED_REPO_ROOT, "docs/demos");

describe("trial readout grading rationale [REQ-WF_TRIAL_READOUT_GRADING_RATIONALE]", () => {
  it("T-GR-REF-01 reference documents Session grading rationale rules and examples", () => {
    const body = fs.readFileSync(WF_REF, "utf8");
    assert.match(body, /Session grading rationale/i);
    assert.match(body, /\*\*A\*\*.*example|example.*\*\*A\*\*/is);
    assert.match(body, /A−|A\u2212/);
    assert.match(body, /maturity_score.*[Ff]orbidden|[Ff]orbidden.*maturity_score/is);
  });

  it("T-GR-SKILL-01 Grade step references rationale subsection", () => {
    const body = fs.readFileSync(WF_SKILL, "utf8");
    assert.match(body, /Session grading rationale|reference\.md.*[Rr]ationale/);
  });

  it("T-GR-CAT-01 catalog facilitator grading documents Rationale column", () => {
    const body = fs.readFileSync(CATALOG, "utf8");
    const section = body.split("## Facilitator grading readout")[1] ?? "";
    assert.match(section, /Rationale/);
    assert.match(section, /one sentence|12|30|concise/i);
  });

  it("T-GR-PARSER-01 normalizeBand handles B+ and Unicode minus", () => {
    assert.equal(normalizeBand("**A**"), "A");
    assert.equal(normalizeBand("**A−**"), "A-");
    assert.ok(isSubABand("A-"));
    assert.ok(isSubABand("B+"));
    assert.equal(isSubABand("A"), false);
  });

  it("T-GR-SCORE-01 band ladder orders B+ above B above B-", () => {
    assert.ok(bandToScore("B+") > bandToScore("B"));
    assert.ok(bandToScore("B") > bandToScore("B-"));
    assert.equal(bandToScore("A"), 4.0);
    assert.equal(bandToScore("F"), 0.0);
    assert.equal(bandToScore("N/A"), null);
  });

  it("T-GR-SCORE-02 meanCompactGrades skips N/A and prefixes sortable mean", () => {
    const { mean, display } = meanCompactGrades("A/A−/B+/A/A−/A/N/A");
    assert.ok(mean > 3.7 && mean <= 4.0);
    assert.match(display, /^\d+\.\d{2} · A\/A−\/B\+\/A\/A−\/A\/N\/A$/);
    const u = meanCompactGrades("A/A−/B+/A/A−/A−/N/A");
    assert.match(u.display, / · A\/A−\/B\+\/A\/A−\/A−\/N\/A$/);
    assert.equal(meanCompactGrades("—").display, "—");
  });

  it("T-GR-READOUTS-01 all PROMPT-WF readouts pass rationale contract", () => {
    const files = fs
      .readdirSync(DEMOS)
      .filter((f) => f.startsWith("trial-readout-PROMPT-WF-") && f.endsWith(".md"))
      .sort();

    assert.ok(files.length >= 84, `expected at least 84 readouts, got ${files.length}`);

    const failures = [];
    for (const file of files) {
      const body = fs.readFileSync(path.join(DEMOS, file), "utf8");
      const violations = validateSessionGradingRationales(body);
      if (violations.length) {
        failures.push({ file, violations });
      }
    }

    if (failures.length) {
      const sample = failures
        .slice(0, 5)
        .map((f) => `${f.file}: ${f.violations.join("; ")}`)
        .join("\n");
      assert.fail(`${failures.length} readout(s) failed:\n${sample}`);
    }
  });
});

describe("parseSessionGradingTable unit", () => {
  it("parses seven rows from fixture", () => {
    const md = `## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Locked comparator before code. |
| Traceability closure | **A−** | REQ status lagged behind green tests. |
| Test strategy | **A** | RED then GREEN archived. |
| Algorithm / implementation | **A** | Clear parse and compare. |
| Process adherence | **A−** | Thin adherence ledger only. |
| Workflow choreography | **A** | Four turns; exit_code 0. |
| Methodology learning readout | **A−** | Notes harness vs close-out split. |

**Future-test rule:** ok
`;
    const { rows, errors } = parseSessionGradingTable(md);
    assert.deepEqual(errors, []);
    assert.equal(rows.length, 7);
  });
});
