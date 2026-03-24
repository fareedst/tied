import { describe, it } from "node:test";
import assert from "node:assert";
import { allTools } from "./index.js";
import {
  resolveRequirementListStateGuide,
  encodeContinuation,
  decodeContinuation,
  type RequirementListItem,
} from "./requirement-list-state-guide.js";

function req(id: string, name: string): RequirementListItem {
  return {
    id,
    name,
    depends_on: [],
    summary: `summary ${id}`,
    rationale: "rationale",
    inputs: ["in"],
    outputs: ["out"],
    functional_requirements: ["shall"],
    acceptance_criteria: ["crit"],
    test_scope: { unit: ["t1"] },
  };
}

type ReqListTool = {
  config: {
    inputSchema: {
      parse: (input: unknown) => unknown;
    };
  };
  handler: (args: {
    requirements?: unknown[];
    current_state?: string;
  }) => Promise<{ content: Array<{ type: "text"; text: string }> }>;
};

const reqListTool = allTools.find(
  (tool) => tool.name === "requirement_list_state_guide"
) as ReqListTool | undefined;

if (!reqListTool) {
  throw new Error("requirement_list_state_guide tool not found");
}

describe("requirement_list_state_guide schema", () => {
  it("accepts requirements and current_state", () => {
    assert.doesNotThrow(() => {
      reqListTool.config.inputSchema.parse({
        requirements: [req("R1", "a")],
      });
      reqListTool.config.inputSchema.parse({
        current_state: "x",
      });
    });
  });
});

describe("encodeContinuation / decodeContinuation", () => {
  it("round-trips", () => {
    const p = { v: 1 as const, items: [req("A", "a")], next: 0 };
    const t = encodeContinuation(p);
    assert.deepStrictEqual(decodeContinuation(t), p);
  });
});

describe("resolveRequirementListStateGuide", () => {
  it("errors on empty initial requirements", () => {
    const a = resolveRequirementListStateGuide({});
    const b = resolveRequirementListStateGuide({ requirements: [] });
    assert.strictEqual(a.state, "error");
    assert.strictEqual(b.state, "error");
    assert.strictEqual(a.is_end, true);
  });

  it("errors on invalid requirement shape", () => {
    const r = resolveRequirementListStateGuide({
      requirements: [{ id: "R1" }],
    });
    assert.strictEqual(r.state, "error");
    assert.ok("guidance" in r && String(r.guidance).includes("validation"));
  });

  it("single item: first then end", () => {
    const first = resolveRequirementListStateGuide({
      requirements: [req("R001", "solved_grid_validation")],
    }) as Record<string, unknown>;
    assert.strictEqual(first.state, "R001");
    assert.strictEqual(first.id, "R001");
    assert.strictEqual(first.is_end, false);
    assert.ok(typeof first.continuation_state === "string");

    const end = resolveRequirementListStateGuide({
      current_state: first.continuation_state as string,
    }) as Record<string, unknown>;
    assert.strictEqual(end.state, "end_requirement_list");
    assert.strictEqual(end.is_end, true);
    assert.ok(!("continuation_state" in end && end.continuation_state));
  });

  it("multi-item walk then idempotent end", () => {
    const items = [req("R001", "a"), req("R002", "b"), req("R003", "c")];
    let step = resolveRequirementListStateGuide({ requirements: items }) as Record<
      string,
      unknown
    >;
    assert.strictEqual(step.state, "R001");
    let token = step.continuation_state as string;

    step = resolveRequirementListStateGuide({ current_state: token }) as Record<
      string,
      unknown
    >;
    assert.strictEqual(step.state, "R002");
    token = step.continuation_state as string;

    step = resolveRequirementListStateGuide({ current_state: token }) as Record<
      string,
      unknown
    >;
    assert.strictEqual(step.state, "R003");
    token = step.continuation_state as string;

    step = resolveRequirementListStateGuide({ current_state: token }) as Record<
      string,
      unknown
    >;
    assert.strictEqual(step.state, "end_requirement_list");
    const endToken = encodeContinuation({
      v: 1,
      items,
      next: items.length,
    });

    const again = resolveRequirementListStateGuide({ current_state: endToken });
    assert.strictEqual(again.state, "end_requirement_list");
    assert.strictEqual(again.is_end, true);
  });

  it("errors on bad token", () => {
    const r = resolveRequirementListStateGuide({ current_state: "not-valid!!!" });
    assert.deepStrictEqual(r, {
      state: "error",
      guidance:
        "Invalid or corrupted continuation state. Restart with a fresh requirements array (omit current_state).",
      is_end: true,
    });
  });

  it("ignores requirements when current_state is set", () => {
    const t = encodeContinuation({
      v: 1,
      items: [req("X", "x")],
      next: 1,
    });
    const r = resolveRequirementListStateGuide({
      requirements: [req("Y", "y")],
      current_state: t,
    });
    assert.strictEqual(r.state, "end_requirement_list");
  });
});

describe("requirement_list_state_guide handler", () => {
  it("returns JSON with first requirement", async () => {
    const out = await reqListTool.handler({
      requirements: [req("R001", "solved_grid_validation")],
    });
    const parsed = JSON.parse(out.content[0].text) as Record<string, unknown>;
    assert.strictEqual(parsed.state, "R001");
    assert.strictEqual(parsed.name, "solved_grid_validation");
  });
});
