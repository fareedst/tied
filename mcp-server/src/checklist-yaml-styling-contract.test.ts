// [REQ-TIED_YAML_STYLE_CONFIGURATION] [REQ-TIED_YAML_CANONICALIZATION] [PROC-YAML_EDIT_LOOP] [PROC-AGENT_REQ_CHECKLIST]
// How: static contract coverage for client YAML styling checklist integration.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import yaml from "js-yaml";

const REPO_ROOT = path.resolve(import.meta.dirname, "../..");
const CHECKLIST_PATH = path.join(
  REPO_ROOT,
  "tied/docs/agent-req-implementation-checklist.yaml",
);
const CHECKLIST_MD_PATH = path.join(
  REPO_ROOT,
  "tied/docs/agent-req-implementation-checklist.md",
);

type ChecklistDoc = {
  steps?: Array<{ slug?: string; tasks?: string[]; calls?: string[] }>;
  sub_procedures?: Array<{
    slug?: string;
    invoked_by?: string[];
    tasks?: string[];
  }>;
};

function loadChecklist(): ChecklistDoc {
  return yaml.load(fs.readFileSync(CHECKLIST_PATH, "utf8")) as ChecklistDoc;
}

function stepBySlug(doc: ChecklistDoc, slug: string) {
  return doc.steps?.find((step) => step.slug === slug);
}

function subBySlug(doc: ChecklistDoc, slug: string) {
  return doc.sub_procedures?.find((sub) => sub.slug === slug);
}

describe("CHECKLIST_CLIENT_YAML_STYLING [PROC-AGENT_REQ_CHECKLIST]", () => {
  it("defines sub-client-yaml-styling invoked only from sub-yaml-edit-loop", () => {
    const doc = loadChecklist();
    const styling = subBySlug(doc, "sub-client-yaml-styling");
    assert.ok(styling, "sub-client-yaml-styling must exist");
    assert.deepEqual(styling?.invoked_by, ["sub-yaml-edit-loop"]);
    const tasks = styling?.tasks ?? [];
    assert.ok(
      tasks.some((task) => task.includes("styling_status not_configured")),
      "must document not_configured default behavior",
    );
    assert.ok(
      tasks.some((task) => task.includes("yaml_semantic_compare")),
      "must require semantic equivalence when client_formatter configured",
    );
  });

  it("extends sub-yaml-edit-loop to call client styling after baseline canonical formatting", () => {
    const doc = loadChecklist();
    const editLoop = subBySlug(doc, "sub-yaml-edit-loop");
    assert.ok(editLoop, "sub-yaml-edit-loop must exist");
    const tasks = editLoop?.tasks ?? [];
    assert.ok(
      tasks.some((task) => task.includes("CALL sub-client-yaml-styling")),
      "sub-yaml-edit-loop must CALL sub-client-yaml-styling",
    );
    assert.ok(
      tasks.some((task) => task.includes("baseline canonical formatting")),
      "must order baseline canonical before client styling",
    );
    const orderTask = tasks.find((task) => task.startsWith("Per changed project-owned"));
    assert.ok(orderTask?.includes("sub-client-yaml-styling"));
    assert.ok(orderTask?.includes("tied_validate_consistency"));
  });

  it("requires YAML mutation callers to invoke sub-yaml-edit-loop", () => {
    const doc = loadChecklist();
    const requiredCallers = [
      "author-requirement",
      "author-architecture",
      "persist-implementation-records",
      "composition-integration",
      "verification-gate",
      "sync-tied-stack",
      "persist-citdp-record",
    ];
    const invokesEditLoop = (step: { calls?: string[]; tasks?: string[] } | undefined) =>
      Boolean(
        step?.calls?.includes("sub-yaml-edit-loop") ||
          (step?.tasks ?? []).some((task) => task.includes("sub-yaml-edit-loop")),
      );
    for (const slug of requiredCallers) {
      const step = stepBySlug(doc, slug);
      assert.ok(step, `missing step ${slug}`);
      assert.ok(invokesEditLoop(step), `${slug} must invoke sub-yaml-edit-loop`);
    }
    const leap = subBySlug(doc, "sub-leap-micro-cycle");
    assert.ok(
      (leap?.tasks ?? []).some((task) => task.includes("CALL sub-yaml-edit-loop")),
      "sub-leap-micro-cycle tasks must CALL sub-yaml-edit-loop",
    );
  });

  it("requires post-style evidence at verification-gate, sync-tied-stack, and traceable-commit", () => {
    const doc = loadChecklist();
    const verification = stepBySlug(doc, "verification-gate");
    const sync = stepBySlug(doc, "sync-tied-stack");
    const commit = stepBySlug(doc, "traceable-commit");
    assert.ok(
      (verification?.tasks ?? []).some((task) => task.includes("styling_status")),
    );
    assert.ok(
      (sync?.tasks ?? []).some((task) => task.includes("sub-client-yaml-styling")),
    );
    assert.ok(
      (commit?.tasks ?? []).some((task) => task.includes("client YAML styling")),
    );
  });

  it("keeps markdown mirror aligned with YAML sub-procedure slugs", () => {
    const doc = loadChecklist();
    const markdown = fs.readFileSync(CHECKLIST_MD_PATH, "utf8");
    for (const slug of ["sub-yaml-edit-loop", "sub-client-yaml-styling"]) {
      assert.ok(subBySlug(doc, slug), `${slug} missing from YAML`);
      assert.match(markdown, new RegExp(`### ${slug} \\(${slug}\\)`));
    }
  });
});
