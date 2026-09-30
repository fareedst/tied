import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";

import {
  parseToolResultBodyFromStreamObject,
} from "./jev-context-log-pruning-stream.js";
import { runAgent } from "./executor-run.js";

// [REQ-TIED_JEV_CONTEXT_LOG_PRUNING] [IMPL-TIED_JEV_CONTEXT_LOG_PRUNING]

describe("jev context log pruning stream [REQ-TIED_JEV_CONTEXT_LOG_PRUNING]", () => {
  it("parses agentstream_tool_result extension", () => {
    const p = parseToolResultBodyFromStreamObject({
      type: "agentstream_tool_result",
      tool: "Shell",
      body: "line1\nline2\n",
    });
    assert.ok(p);
    assert.equal(p!.tool, "Shell");
    assert.match(p!.body, /line1/);
  });

  describe("runAgent composition", () => {
    let scriptPath = "";

    afterEach(() => {
      if (scriptPath) {
        fs.unlinkSync(scriptPath);
        scriptPath = "";
      }
    });

    it("invokes prune hook on tool result stream line", async () => {
      scriptPath = path.join(os.tmpdir(), `fake-tool-result-${Date.now()}.js`);
      const longBody = `${"progress\n".repeat(40)}FAIL: assertion\n`;
      fs.writeFileSync(
        scriptPath,
        `#!/usr/bin/env node
console.log(JSON.stringify({
  type: "agentstream_tool_result",
  tool: "Shell",
  body: ${JSON.stringify(longBody)},
}));
console.log(JSON.stringify({ session_id: "s-prune", type: "assistant", message: { content: [{ type: "text", text: "ok" }] } }));
`,
        { mode: 0o755 },
      );

      let seenLen = 0;
      const out = await runAgent([process.execPath, scriptPath], [], {
        contextLogPrune: {
          prune: async (body) => {
            seenLen = body.length;
            return {
              text: body.slice(0, 20),
              diagnostic: "DIAGNOSTIC: context log prune: mocked\n",
            };
          },
        },
      });
      assert.equal(out.exitCode, 0);
      assert.ok(seenLen > 100);
      assert.match(out.gateStderr ?? "", /context log prune/);
    });
  });
});
