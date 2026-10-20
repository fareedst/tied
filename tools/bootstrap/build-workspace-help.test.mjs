import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isBuildWorkspaceHelpArgv,
  printBuildWorkspaceHelp,
} from "./lib/build-workspace-help.mjs";

describe("build-workspace-help [REQ-TIED_UNIFIED_TOOLCHAIN]", () => {
  it("isBuildWorkspaceHelpArgv recognizes sole help flags only", () => {
    assert.equal(isBuildWorkspaceHelpArgv(["-h"]), true);
    assert.equal(isBuildWorkspaceHelpArgv(["--help"]), true);
    assert.equal(isBuildWorkspaceHelpArgv([]), false);
    assert.equal(isBuildWorkspaceHelpArgv(["--help", "x"]), false);
    assert.equal(isBuildWorkspaceHelpArgv(["--verbose"]), false);
  });

  it("printBuildWorkspaceHelp includes contract sections", () => {
    const chunks = [];
    const orig = process.stdout.write.bind(process.stdout);
    process.stdout.write = (s) => {
      chunks.push(String(s));
      return true;
    };
    try {
      printBuildWorkspaceHelp();
    } finally {
      process.stdout.write = orig;
    }
    const out = chunks.join("");
    assert.match(out, /TIED workspace build/);
    assert.match(out, /mcp-server/);
    assert.match(out, /tied-install/);
    assert.match(out, /Hints/);
  });

  it("printBuildWorkspaceHelp omits ANSI when NO_COLOR is set", () => {
    const prev = process.env.NO_COLOR;
    process.env.NO_COLOR = "1";
    const chunks = [];
    const orig = process.stdout.write.bind(process.stdout);
    process.stdout.write = (s) => {
      chunks.push(String(s));
      return true;
    };
    try {
      printBuildWorkspaceHelp();
    } finally {
      process.stdout.write = orig;
      if (prev === undefined) delete process.env.NO_COLOR;
      else process.env.NO_COLOR = prev;
    }
    assert.doesNotMatch(chunks.join(""), /\x1b\[/);
  });
});
