// [IMPL-TIED_SPONSOR_AGENT_RELATIONSHIP] [REQ-TIED_SPONSOR_AGENT_RELATIONSHIP]
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const REPO_ROOT = path.resolve(import.meta.dirname, "../../..");

function read(rel: string): string {
  return fs.readFileSync(path.join(REPO_ROOT, rel), "utf8");
}

describe("AUDIT_RELATIONSHIP_LAYER_CONTRACT [REQ-TIED_SPONSOR_AGENT_RELATIONSHIP]", () => {
  it("glossary, routing, principles, AGENTS, citdp-policy, manifest, prompt-shared, templates", () => {
    const glossary = read("tied-project/vocab/sponsor-agent-relationship.md");
    assert.match(glossary, /\(canonical\)/);
    assert.match(glossary, /\*\*Scope:\*\*/);
    assert.match(glossary, /\*\*Traceability:\*\*/);
    assert.match(glossary, /\*\*See also:\*\*/);
    assert.match(glossary, /## Alphabetical index/);
    for (const term of [
      "agent",
      "sponsor",
      "reviewer",
      "delegated work envelope",
      "instrument branch",
      "person branch",
      "agency boundary condition",
      "reversible choice",
      "costly choice",
      "hinge field",
      "consequence ladder",
      "sponsor-vs-TIED disagreement",
      "over-asking",
      "instrumentalizing the sponsor",
      "RESOLVE charter",
    ]) {
      assert.match(glossary, new RegExp(term, "i"), `glossary missing ${term}`);
    }

    const routing = read("tied-project/vocab/routing.md");
    assert.match(routing, /sponsor-agent-relationship\.md/);

    const domainRefs = read("tied-project/vocab/domain-references.md");
    assert.match(domainRefs, /sponsor-agent-relationship\.md/);

    const principles = read("tied-bundle/docs/ai-principles.md");
    for (const marker of [
      "RESOLVE charter",
      "reversible choice",
      "costly choice",
      "consequence ladder",
      "agency boundary condition",
    ]) {
      assert.match(principles, new RegExp(marker, "i"), `ai-principles missing ${marker}`);
    }

    const agents = read("AGENTS.md");
    assert.match(agents, /Sponsor–agent relationship/i);

    const citdpPolicy = read("tied-bundle/docs/citdp-policy.md");
    assert.match(citdpPolicy, /## Hinge fields/);
    assert.match(citdpPolicy, /hinge_field_incomplete/);

    const relDoc = read("tied-bundle/docs/sponsor-agent-relationship.md");
    assert.match(relDoc, /```mermaid/);
    assert.match(relDoc, /RP-1/);
    assert.match(relDoc, /RP-2/);

    const manifest = JSON.parse(read("tools/bootstrap/manifest.json")) as { DOCS_TO_COPY: string[] };
    assert.ok(manifest.DOCS_TO_COPY.includes("sponsor-agent-relationship.md"));

    const refine = read("tools/bundled-prompt-type-skills/prompt-shared/tied-refine.md");
    assert.match(refine, /RESOLVE charter/i);

    const planCitdp = read("tools/bundled-prompt-type-skills/prompt-shared/tied-plan-citdp.md");
    assert.match(planCitdp, /consequence ladder/i);

    assert.ok(fs.existsSync(path.join(REPO_ROOT, "tied-bundle/requirements/REQ-TIED_SPONSOR_AGENT_RELATIONSHIP.yaml")));
    assert.ok(fs.existsSync(path.join(REPO_ROOT, "tied-bundle/architecture-decisions/ARCH-TIED_SPONSOR_AGENT_RELATIONSHIP.yaml")));
    assert.ok(fs.existsSync(path.join(REPO_ROOT, "tied-bundle/implementation-decisions/IMPL-TIED_SPONSOR_AGENT_RELATIONSHIP.yaml")));
  });
});
