import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";

import {
  evaluateStreamToolProposal,
  jevHarnessConfirmStrictEnabled,
  parseToolProposalFromStreamObject,
  shouldAbortLiveTurnOnToolGate,
} from "./jev-harness-live-tool-gate.js";
import { collectClaudeStreamFromSpawn } from "./claude-driver.js";
import { runAgent } from "./executor-run.js";

// [IMPL-TIED_JEV_TOOL_SAFETY_GATING] [REQ-TIED_JEV_TOOL_SAFETY_GATING] [REQ-TIED_JEV_DECISION_COPROCESSOR]

describe("jev harness live tool gate [REQ-TIED_JEV_TOOL_SAFETY_GATING]", () => {
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

  it("SC-D-SCOPE: passes workspace into gate evaluate", async () => {
    let seenWorkspace: string | undefined;
    await evaluateStreamToolProposal(
      {
        goal: "g",
        workspace: "/tmp/declared-ws",
        evaluate: async (input) => {
          seenWorkspace = input.workspace;
          return {
            decision: "allow",
            risk: null,
            reason: "mock",
            jev_skipped: true,
            destructive_pattern: false,
          };
        },
      },
      { tool: "Shell", arguments: "echo hi" },
    );
    assert.equal(seenWorkspace, "/tmp/declared-ws");
  });

  it("G3: aborts on block; confirm only when CI/strict env", () => {
    const localEnv = { CI: "", AGENTSTREAM_JEV_HARNESS_CONFIRM_STRICT: "" } as NodeJS.ProcessEnv;
    const ciEnv = { CI: "true" } as NodeJS.ProcessEnv;
    const evalConfirm = { decision: "confirm" as const, reason: "x" };
    assert.equal(
      shouldAbortLiveTurnOnToolGate({ decision: "block", reason: "x" }, localEnv),
      true,
    );
    assert.equal(shouldAbortLiveTurnOnToolGate(evalConfirm, localEnv), false);
    assert.equal(shouldAbortLiveTurnOnToolGate(evalConfirm, ciEnv), true);
    assert.equal(jevHarnessConfirmStrictEnabled(ciEnv), true);
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

    it("G3: CI strict aborts turn on confirm decision", async () => {
      const prevCi = process.env.CI;
      process.env.CI = "true";
      scriptPath = path.join(os.tmpdir(), `fake-shell-confirm-${Date.now()}.js`);
      fs.writeFileSync(
        scriptPath,
        `#!/usr/bin/env node
console.log(JSON.stringify({ type: "agentstream_tool_proposal", tool: "Shell", command: "echo confirm" }));
console.log(JSON.stringify({ session_id: "s-c", type: "assistant", message: { content: [{ type: "text", text: "ok" }] } }));
`,
        { mode: 0o755 },
      );

      const out = await runAgent([process.execPath, scriptPath], [], {
        jevToolGate: {
          goal: "test",
          evaluate: async () => ({ decision: "confirm", reason: "mock_confirm" }),
        },
      });
      process.env.CI = prevCi;
      assert.equal(out.exitCode, 1);
      assert.match(out.gateStderr ?? "", /decision=confirm/);
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

    it("SC-D-SCOPE: runAgent forwards declared gate workspace into evaluate", async () => {
      let seenWorkspace: string | undefined;
      scriptPath = path.join(os.tmpdir(), `fake-shell-ws-${Date.now()}.js`);
      fs.writeFileSync(
        scriptPath,
        `#!/usr/bin/env node
console.log(JSON.stringify({ type: "agentstream_tool_proposal", tool: "Shell", command: "echo ws" }));
console.log(JSON.stringify({ session_id: "s-ws", type: "assistant", message: { content: [{ type: "text", text: "ok" }] } }));
`,
        { mode: 0o755 },
      );

      const declaredWs = path.join(os.tmpdir(), "cursor-declared-ws");
      await runAgent([process.execPath, scriptPath], [], {
        jevToolGate: {
          goal: "test",
          workspace: declaredWs,
          evaluate: async (input) => {
            seenWorkspace = input.workspace;
            return { decision: "allow", reason: "mock_allow" };
          },
        },
      });
      assert.equal(seenWorkspace, declaredWs);
    });
  });

  it("G4: collectClaudeStreamFromSpawn applies jevToolGate on NDJSON", async () => {
    const scriptPath = path.join(os.tmpdir(), `fake-claude-gate-${Date.now()}.js`);
    fs.writeFileSync(
      scriptPath,
      `#!/usr/bin/env node
console.log(JSON.stringify({ type: "system", subtype: "init", session_id: "claude-gate-s" }));
console.log(JSON.stringify({ type: "agentstream_tool_proposal", tool: "Shell", command: "echo gated" }));
`,
      { mode: 0o755 },
    );
    const launched = await collectClaudeStreamFromSpawn([process.execPath, scriptPath], [], {
      jevToolGate: {
        goal: "test",
        evaluate: async () => ({ decision: "block", reason: "mock_block" }),
      },
    });
    fs.unlinkSync(scriptPath);
    assert.equal(launched.gateBlocked, true);
    assert.equal(launched.exitCode, 1);
    assert.match(launched.gateStderr ?? "", /decision=block/);
  });

  it("SC-D-SCOPE: collectClaudeStreamFromSpawn forwards declared gate workspace into evaluate", async () => {
    let seenWorkspace: string | undefined;
    const scriptPath = path.join(os.tmpdir(), `fake-claude-ws-${Date.now()}.js`);
    fs.writeFileSync(
      scriptPath,
      `#!/usr/bin/env node
console.log(JSON.stringify({ type: "system", subtype: "init", session_id: "claude-ws-s" }));
console.log(JSON.stringify({ type: "agentstream_tool_proposal", tool: "Shell", command: "echo ws" }));
`,
      { mode: 0o755 },
    );
    const declaredWs = path.join(os.tmpdir(), "claude-declared-ws");
    await collectClaudeStreamFromSpawn([process.execPath, scriptPath], [], {
      jevToolGate: {
        goal: "test",
        workspace: declaredWs,
        evaluate: async (input) => {
          seenWorkspace = input.workspace;
          return { decision: "allow", reason: "mock_allow" };
        },
      },
    });
    fs.unlinkSync(scriptPath);
    assert.equal(seenWorkspace, declaredWs);
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
