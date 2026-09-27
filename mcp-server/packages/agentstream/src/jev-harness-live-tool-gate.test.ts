import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";

import {
  evaluateStreamToolProposal,
  parseToolProposalFromStreamObject,
  shouldAbortLiveTurnOnToolGate,
} from "./jev-harness-live-tool-gate.js";
import { runAgent } from "./executor-run.js";

// [IMPL-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR]

describe("jev harness live tool gate [REQ-TIED_JEV_DECISION_COPROCESSOR]", () => {
  it("parses agentstream_tool_proposal stream extension", () => {
    const p = parseToolProposalFromStreamObject({
      type: "agentstream_tool_proposal",
      tool: "Shell",
      command: "rm -rf /tmp/x",
    });
    assert.ok(p);
    assert.equal(p!.tool, "Shell");
    assert.match(p!.arguments, /rm -rf/);
  });

  it("parses assistant tool_use blocks", () => {
    const p = parseToolProposalFromStreamObject({
      type: "assistant",
      message: {
        content: [
          { type: "tool_use", name: "bash", input: { command: "echo hi" } },
        ],
      },
    });
    assert.ok(p);
    assert.equal(p!.tool, "bash");
    assert.equal(p!.arguments, "echo hi");
  });

  it("aborts only on block decision", () => {
    assert.equal(shouldAbortLiveTurnOnToolGate({ decision: "block", reason: "x" }), true);
    assert.equal(shouldAbortLiveTurnOnToolGate({ decision: "confirm", reason: "x" }), false);
    assert.equal(shouldAbortLiveTurnOnToolGate({ decision: "allow", reason: "x" }), false);
  });

  describe("runAgent composition", () => {
    let scriptPath = "";
    let prevHarness = "";

    afterEach(() => {
      if (scriptPath) {
        fs.unlinkSync(scriptPath);
        scriptPath = "";
      }
      if (prevHarness === "") {
        delete process.env.AGENTSTREAM_JEV_HARNESS;
      } else {
        process.env.AGENTSTREAM_JEV_HARNESS = prevHarness;
      }
    });

    it("terminates turn when gate blocks Shell proposal in stream", async () => {
      scriptPath = path.join(os.tmpdir(), `fake-shell-gate-${Date.now()}.js`);
      fs.writeFileSync(
        scriptPath,
        `#!/usr/bin/env node
const lines = [
  JSON.stringify({ type: "agentstream_tool_proposal", tool: "Shell", command: "echo blocked" }),
  JSON.stringify({ session_id: "s1", type: "assistant", message: { content: [{ type: "text", text: "done" }] } }),
];
for (const l of lines) console.log(l);
`,
        { mode: 0o755 },
      );

      const out = await runAgent([process.execPath, scriptPath], [], {
        jevToolGate: {
          goal: "test",
          evaluate: async () => ({ decision: "block", reason: "mock_block" }),
        },
      });
      assert.equal(out.exitCode, 1);
      assert.match(out.gateStderr ?? "", /decision=block/);
    });

    it("allows turn when gate allows Shell proposal", async () => {
      scriptPath = path.join(os.tmpdir(), `fake-shell-allow-${Date.now()}.js`);
      fs.writeFileSync(
        scriptPath,
        `#!/usr/bin/env node
console.log(JSON.stringify({ type: "agentstream_tool_proposal", tool: "Shell", command: "echo ok" }));
console.log(JSON.stringify({ session_id: "s-allow", type: "assistant", message: { content: [{ type: "text", text: "ok" }] } }));
`,
        { mode: 0o755 },
      );

      const out = await runAgent([process.execPath, scriptPath], [], {
        jevToolGate: {
          goal: "test",
          evaluate: async () => ({ decision: "allow", reason: "mock_allow" }),
        },
      });
      assert.equal(out.exitCode, 0);
      assert.equal(out.result.sessionId, "s-allow");
    });
  });

  it("evaluateStreamToolProposal returns diagnostic", async () => {
    const r = await evaluateStreamToolProposal(
      {
        goal: "g",
        evaluate: async () => ({ decision: "confirm", reason: "mock" }),
      },
      { tool: "Shell", arguments: "ls" },
    );
    assert.match(r.diagnostic, /decision=confirm/);
    assert.equal(r.abort, false);
  });
});
