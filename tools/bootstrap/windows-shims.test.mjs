import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/** @type {Array<{ ps1: string, cmd?: string, delegate: RegExp, fixedFlags?: string, positionalClientRoot?: boolean }>} */
const SHIM_SPECS = [
  {
    ps1: "tied-install.ps1",
    cmd: "tied-install.cmd",
    delegate: /tools[\\/]bootstrap[\\/]tied-install-dispatch\.mjs/,
  },
  {
    ps1: "test-new-tied-client.ps1",
    cmd: "test-new-tied-client.cmd",
    delegate: /tools[\\/]bootstrap[\\/]new-tied-client\.mjs/,
    fixedFlags: "--disposable",
  },
  {
    ps1: "scripts/test-new-tied-client.ps1",
    cmd: "scripts/test-new-tied-client.cmd",
    delegate: /tools[\\/]bootstrap[\\/]new-tied-client\.mjs/,
    fixedFlags: "--disposable",
  },
  {
    ps1: "scripts/new-tied-client.ps1",
    cmd: "scripts/new-tied-client.cmd",
    delegate: /tools[\\/]bootstrap[\\/]new-tied-client\.mjs/,
  },
  {
    ps1: "scripts/test-new-claude-tied-client.ps1",
    cmd: "scripts/test-new-claude-tied-client.cmd",
    delegate: /tools[\\/]bootstrap[\\/]new-tied-client\.mjs/,
    fixedFlags: "--disposable --harness claude --with-agentstream-dry-run",
  },
  {
    ps1: "scripts/lint_yaml.ps1",
    cmd: "scripts/lint_yaml.cmd",
    delegate: /tools[\\/]bootstrap[\\/]lint-yaml\.mjs/,
  },
  {
    ps1: "scripts/validate-claude-tied-client.ps1",
    cmd: "scripts/validate-claude-tied-client.cmd",
    delegate: /run-tied-claude-client-validation\.mjs/,
    fixedFlags: "--with-agentstream-dry-run",
    positionalClientRoot: true,
  },
];

function readRepo(rel) {
  return fs.readFileSync(path.join(REPO_ROOT, rel), "utf8");
}

describe("windows-shims [REQ-TIED_LAYERED_CLIENT_INSTALL]", () => {
  it("tied-install.sh delegates to tied-install-dispatch.mjs", () => {
    const sh = readRepo("tied-install.sh");
    assert.match(sh, /tied-install-dispatch\.mjs/);
  });

  for (const spec of SHIM_SPECS) {
    it(`PowerShell shim ${spec.ps1} matches contract`, () => {
      const ps1 = readRepo(spec.ps1);
      assert.match(ps1, /\$PSScriptRoot/);
      assert.match(ps1, /Get-Command node/);
      if (spec.positionalClientRoot) {
        assert.match(ps1, /@extraArgs/);
      } else {
        assert.match(ps1, /@args/);
      }
      assert.match(ps1, /exit \$LASTEXITCODE/);
      assert.match(ps1, spec.delegate);
      if (spec.fixedFlags) {
        for (const flag of spec.fixedFlags.split(/\s+/)) {
          assert.match(ps1, new RegExp(flag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
        }
      }
    });

    if (spec.cmd) {
      it(`CMD shim ${spec.cmd} matches contract`, () => {
        const cmd = readRepo(spec.cmd);
        assert.match(cmd, /%~dp0/);
        assert.match(cmd, /%\*/);
        assert.match(cmd, /exit \/b %ERRORLEVEL%/);
        assert.match(cmd, spec.delegate);
        if (spec.fixedFlags) {
          for (const flag of spec.fixedFlags.split(/\s+/)) {
            assert.match(cmd, new RegExp(flag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
          }
        }
      });
    }
  }
});
