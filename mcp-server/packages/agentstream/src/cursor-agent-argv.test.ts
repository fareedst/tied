/**
 * [REQ-WF_TRIAL_MODEL_EFFORT] Cursor agent argv extras.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { agentArgv } from "./executor-dry-run.js";
import {
  cursorApproveMcpsArgs,
  cursorLiveArgvExtras,
} from "./cursor-agent-argv.js";

function writeLinkedClientMcp(client: string, store: string): void {
  const dist = path.join(store, "mcp-server/dist/index.js");
  fs.mkdirSync(path.dirname(dist), { recursive: true });
  fs.writeFileSync(dist, "// test dist\n");
  const tiedProject = path.join(client, "tied-project");
  fs.mkdirSync(tiedProject, { recursive: true });
  fs.writeFileSync(path.join(tiedProject, "requirements.yaml"), "REQ-TEST: {}\n");
  fs.mkdirSync(path.join(client, ".cursor"), { recursive: true });
  fs.writeFileSync(
    path.join(client, ".cursor", "mcp.json"),
    JSON.stringify({
      mcpServers: {
        "tied-yaml": {
          command: "node",
          args: [dist],
          env: {
            TIED_CLIENT_PROJECT_PATH: tiedProject,
            TIED_CLIENT_BUNDLE_PATH: path.join(client, "tied-bundle"),
            TIED_STORE_ROOT: store,
          },
        },
      },
    }),
  );
}

describe("cursor-agent-argv [REQ-WF_TRIAL_MODEL_EFFORT]", () => {
  it("cursorApproveMcpsArgs includes --approve-mcps by default", () => {
    const prev = process.env.AGENTSTREAM_CURSOR_KEEP_MCPS;
    delete process.env.AGENTSTREAM_CURSOR_KEEP_MCPS;
    assert.deepEqual(cursorApproveMcpsArgs(), ["--approve-mcps"]);
    process.env.AGENTSTREAM_CURSOR_KEEP_MCPS = "1";
    assert.deepEqual(cursorApproveMcpsArgs(), []);
    if (prev === undefined) {
      delete process.env.AGENTSTREAM_CURSOR_KEEP_MCPS;
    } else {
      process.env.AGENTSTREAM_CURSOR_KEEP_MCPS = prev;
    }
  });

  it("agentArgv cursor includes approve-mcps and effort bracket [SC-CURSOR-BRACKET]", () => {
    const prevBracket = process.env.AGENTSTREAM_CURSOR_MODEL_BRACKET_EFFORT;
    delete process.env.AGENTSTREAM_CURSOR_MODEL_BRACKET_EFFORT;
    const argv = agentArgv(
      "",
      "/tmp/ws",
      "composer-2.5-fast",
      "",
      ["hi"],
      "cursor",
      "medium",
    );
    assert.ok(argv.includes("--approve-mcps"));
    const modelIdx = argv.indexOf("--model");
    assert.ok(modelIdx >= 0);
    assert.match(argv[modelIdx + 1] ?? "", /\[effort=medium\]/);
    assert.equal(argv.includes("--effort"), false);
    if (prevBracket === undefined) {
      delete process.env.AGENTSTREAM_CURSOR_MODEL_BRACKET_EFFORT;
    } else {
      process.env.AGENTSTREAM_CURSOR_MODEL_BRACKET_EFFORT = prevBracket;
    }
  });

  it("cursorLiveArgvExtras adds --add-dir when store resolves [SC-CURSOR-ADD-DIR]", () => {
    const client = fs.mkdtempSync(path.join(os.tmpdir(), "cursor-add-dir-"));
    const store = fs.mkdtempSync(path.join(os.tmpdir(), "tied-store-"));
    writeLinkedClientMcp(client, store);
    const extras = cursorLiveArgvExtras(client);
    assert.ok(extras.includes("--add-dir"));
    assert.ok(extras.includes(path.resolve(store)));
  });
});
