import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import {
  agentstreamCliEntry,
  packageAnchorStoreRootForAgentstream,
  storeRootHasAgentstreamDist,
} from "../resolve-agentstream-store.js";
import {
  resolveAdherenceReconcileArgv,
  runAdherenceReconcile,
} from "./adherence-reconcile-runner.js";

function monolithicStoreRoot(): string {
  let dir = path.resolve(import.meta.dirname, "../../..");
  for (;;) {
    if (storeRootHasAgentstreamDist(dir)) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error("store root not found");
    }
    dir = parent;
  }
}

describe("resolveAdherenceReconcileArgv [REQ-TIED_CLIENT_OPERATOR_TOOLING]", () => {
  it("self-anchor resolves agentstream dist from MCP runner module", () => {
    const store = packageAnchorStoreRootForAgentstream(import.meta.url);
    assert.notEqual(store, "");
    assert.ok(fs.existsSync(agentstreamCliEntry(store)));
  });

  it("returns TS argv when workspace is linked client without local mcp-server", async () => {
    const store = monolithicStoreRoot();
    const client = fs.mkdtempSync(path.join(os.tmpdir(), "linked-client-reconcile-"));
    fs.writeFileSync(path.join(client, "AGENTS.md"), "# client\n");
    fs.mkdirSync(path.join(client, "tied-project"), { recursive: true });
    fs.writeFileSync(path.join(client, "tied-project", "requirements.yaml"), "REQ-TEST:\n");
    fs.mkdirSync(path.join(client, ".cursor"), { recursive: true });
    fs.writeFileSync(
      path.join(client, ".cursor", "mcp.json"),
      JSON.stringify({
        mcpServers: {
          "tied-yaml": {
            command: "node",
            args: [path.join(store, "mcp-server/dist/index.js")],
            env: {
              TIED_CLIENT_PROJECT_PATH: path.join(client, "tied-project"),
              TIED_STORE_ROOT: store,
            },
          },
        },
      }),
    );

    const resolved = await resolveAdherenceReconcileArgv({
      workspace: client,
      repoRoot: client,
    });
    assert.equal(resolved.cwd, client);
    assert.equal(resolved.argv[0], process.execPath);
    assert.ok(
      resolved.argv[1]!.includes("packages/agentstream/dist/index.js"),
      resolved.argv[1],
    );
    assert.equal(resolved.argv[2], "adherence-reconcile");
  });

  it("runAdherenceReconcile ok for linked client layout with minimal tracker", async () => {
    const client = fs.mkdtempSync(path.join(os.tmpdir(), "linked-client-run-"));
    const trackerPath = path.join(client, "tracker.yaml");
    fs.writeFileSync(
      trackerPath,
      "request_token: REQ-TEST\nschema_version: checklist-tracker.v1\nsteps: []\n",
    );
    const result = await runAdherenceReconcile({
      ledger_path: path.join(client, "missing.jsonl"),
      tracker_path: trackerPath,
      gates_dir: path.join(client, "gates"),
      workspace: client,
      repo_root: client,
    });
    assert.equal(result.ok, true, result.diagnostics?.join(", "));
    assert.equal(result.report?.read_only, true);
  });
});
