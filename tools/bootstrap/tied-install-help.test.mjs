import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isTiedInstallHelpArgv,
  printTiedInstallHelp,
} from "./lib/tied-install-help.mjs";

describe("tied-install-help [REQ-TIED_LAYERED_CLIENT_INSTALL]", () => {
  it("isTiedInstallHelpArgv recognizes empty and sole help flags", () => {
    assert.equal(isTiedInstallHelpArgv([]), true);
    assert.equal(isTiedInstallHelpArgv(["-h"]), true);
    assert.equal(isTiedInstallHelpArgv(["--help"]), true);
    assert.equal(isTiedInstallHelpArgv(["."]), false);
    assert.equal(isTiedInstallHelpArgv(["--help", "/tmp/client"]), false);
    assert.equal(isTiedInstallHelpArgv(["--mode", "linked"]), false);
  });

  it("printTiedInstallHelp includes contract sections", () => {
    const chunks = [];
    const orig = process.stdout.write.bind(process.stdout);
    process.stdout.write = (s) => {
      chunks.push(String(s));
      return true;
    };
    try {
      printTiedInstallHelp();
    } finally {
      process.stdout.write = orig;
    }
    const out = chunks.join("");
    assert.match(out, /TIED client install/);
    assert.match(out, /build-workspace/);
    assert.match(out, /--migrate-layout/);
    assert.match(out, /Hints/);
  });

  it("printTiedInstallHelp omits ANSI when NO_COLOR is set", () => {
    const prev = process.env.NO_COLOR;
    process.env.NO_COLOR = "1";
    const chunks = [];
    const orig = process.stdout.write.bind(process.stdout);
    process.stdout.write = (s) => {
      chunks.push(String(s));
      return true;
    };
    try {
      printTiedInstallHelp();
    } finally {
      process.stdout.write = orig;
      if (prev === undefined) delete process.env.NO_COLOR;
      else process.env.NO_COLOR = prev;
    }
    assert.doesNotMatch(chunks.join(""), /\x1b\[/);
  });
});
