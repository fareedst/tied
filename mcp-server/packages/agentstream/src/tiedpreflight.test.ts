import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import {
  ErrAmbiguous,
  Status,
  analyze,
  locateMcpJson,
  run,
} from "./tiedpreflight.js";

// [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]
function writeMcp(dir: string, tiedBase: string): string {
  const cursorDir = path.join(dir, ".cursor");
  fs.mkdirSync(cursorDir, { recursive: true });
  const p = path.join(cursorDir, "mcp.json");
  const cfg = {
    mcpServers: {
      "tied-yaml": {
        command: "node",
        args: ["/srv/index.js"],
        env: { TIED_BASE_PATH: tiedBase },
      },
    },
  };
  fs.writeFileSync(p, JSON.stringify(cfg));
  return p;
}

describe("@tied/agentstream tiedpreflight [REQ-TIED_UNIFIED_TOOLCHAIN]", () => {
  it("locates root mcp.json", () => {
    const w = fs.mkdtempSync(path.join(os.tmpdir(), "tpf-"));
    const want = writeMcp(w, path.join(w, "tied"));
    assert.equal(locateMcpJson(w, ""), want);
  });

  it("locates single subproject mcp.json", () => {
    const w = fs.mkdtempSync(path.join(os.tmpdir(), "tpf-"));
    const sub = path.join(w, "proj");
    fs.mkdirSync(sub, { recursive: true });
    const tied = path.join(sub, "tied");
    fs.mkdirSync(tied, { recursive: true });
    const want = writeMcp(sub, tied);
    assert.equal(locateMcpJson(w, ""), want);
  });

  it("rejects ambiguous subprojects", () => {
    const w = fs.mkdtempSync(path.join(os.tmpdir(), "tpf-"));
    for (const name of ["a", "b"]) {
      const sub = path.join(w, name);
      fs.mkdirSync(sub, { recursive: true });
      writeMcp(sub, path.join(sub, "tied"));
    }
    assert.throws(() => locateMcpJson(w, ""), ErrAmbiguous);
  });

  it("honors --mcp-json override", () => {
    const w = fs.mkdtempSync(path.join(os.tmpdir(), "tpf-"));
    const other = fs.mkdtempSync(path.join(os.tmpdir(), "tpf-o-"));
    const p = writeMcp(other, path.join(other, "tied"));
    assert.equal(locateMcpJson(w, p), p);
  });

  it("analyze ok when requirements.yaml exists", () => {
    const w = fs.mkdtempSync(path.join(os.tmpdir(), "tpf-"));
    const tied = path.join(w, "tied");
    fs.mkdirSync(tied, { recursive: true });
    fs.writeFileSync(path.join(tied, "requirements.yaml"), "requirements: {}\n");
    const mcp = writeMcp(w, tied);
    const res = analyze(w, mcp);
    assert.equal(res.status, Status.OK);
  });

  it("blocks when TIED_BASE_PATH outside workspace", () => {
    const w = fs.mkdtempSync(path.join(os.tmpdir(), "tpf-"));
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), "tpf-out-"));
    const tied = path.join(outside, "tied");
    fs.mkdirSync(tied, { recursive: true });
    const mcp = writeMcp(w, tied);
    const res = analyze(w, mcp);
    assert.equal(res.status, Status.Blocked);
    assert.ok(res.errors.some((e) => e.includes("outside")));
  });

  it("blocks missing tied-yaml entry", () => {
    const w = fs.mkdtempSync(path.join(os.tmpdir(), "tpf-"));
    const tied = path.join(w, "tied");
    fs.mkdirSync(tied, { recursive: true });
    const mcp = writeMcp(w, tied);
    const root = JSON.parse(fs.readFileSync(mcp, "utf8")) as {
      mcpServers: Record<string, unknown>;
    };
    delete root.mcpServers["tied-yaml"];
    fs.writeFileSync(mcp, JSON.stringify(root));
    const res = analyze(w, mcp);
    assert.equal(res.status, Status.Blocked);
  });

  it("blocks relative TIED_BASE_PATH", () => {
    const w = fs.mkdtempSync(path.join(os.tmpdir(), "tpf-"));
    const cursorDir = path.join(w, ".cursor");
    fs.mkdirSync(cursorDir, { recursive: true });
    const p = path.join(cursorDir, "mcp.json");
    fs.writeFileSync(
      p,
      JSON.stringify({
        mcpServers: {
          "tied-yaml": {
            command: "node",
            args: ["/x"],
            env: { TIED_BASE_PATH: "tied" },
          },
        },
      }),
    );
    const res = analyze(w, p);
    assert.equal(res.status, Status.Blocked);
  });

  it("warns on greenfield tied without requirements.yaml", () => {
    const w = fs.mkdtempSync(path.join(os.tmpdir(), "tpf-"));
    const tied = path.join(w, "tied");
    fs.mkdirSync(tied, { recursive: true });
    const mcp = writeMcp(w, tied);
    const res = analyze(w, mcp);
    assert.equal(res.status, Status.Warning);
    assert.ok(res.warnings.length > 0);
  });

  it("run locates and analyzes", () => {
    const w = fs.mkdtempSync(path.join(os.tmpdir(), "tpf-"));
    const tied = path.join(w, "tied");
    fs.mkdirSync(tied, { recursive: true });
    fs.writeFileSync(path.join(tied, "requirements.yaml"), "requirements: {}\n");
    writeMcp(w, tied);
    const res = run(w, "");
    assert.equal(res.status, Status.OK);
  });
});
