/**
 * [REQ-MCP_STDIO_CONSOLE_GUARD] [IMPL-MCP_STDIO_CONSOLE_GUARD]
 */

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import {
  installMcpStdioConsoleGuard,
  mcpDiagnosticsEnabled,
  resetMcpStdioConsoleGuardForTests,
} from "./mcp-stdio-console-guard.js";

type WriteCapture = {
  stdout: string[];
  stderr: string[];
  restore: () => void;
};

function captureProcessWrites(): WriteCapture {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const origStdout = process.stdout.write.bind(process.stdout);
  const origStderr = process.stderr.write.bind(process.stderr);
  process.stdout.write = ((chunk: string | Uint8Array) => {
    stdout.push(String(chunk));
    return true;
  }) as typeof process.stdout.write;
  process.stderr.write = ((chunk: string | Uint8Array) => {
    stderr.push(String(chunk));
    return true;
  }) as typeof process.stderr.write;
  return {
    stdout,
    stderr,
    restore: () => {
      process.stdout.write = origStdout;
      process.stderr.write = origStderr;
    },
  };
}

describe("mcpDiagnosticsEnabled [REQ-MCP_STDIO_CONSOLE_GUARD]", () => {
  const prev = process.env.TIED_MCP_DIAGNOSTICS;
  afterEach(() => {
    if (prev === undefined) delete process.env.TIED_MCP_DIAGNOSTICS;
    else process.env.TIED_MCP_DIAGNOSTICS = prev;
  });

  it("is false when env unset", () => {
    delete process.env.TIED_MCP_DIAGNOSTICS;
    assert.equal(mcpDiagnosticsEnabled(), false);
  });

  it("is true for 1 and true", () => {
    process.env.TIED_MCP_DIAGNOSTICS = "1";
    assert.equal(mcpDiagnosticsEnabled(), true);
    process.env.TIED_MCP_DIAGNOSTICS = "true";
    assert.equal(mcpDiagnosticsEnabled(), true);
  });
});

describe("installMcpStdioConsoleGuard [REQ-MCP_STDIO_CONSOLE_GUARD]", () => {
  const prevDiag = process.env.TIED_MCP_DIAGNOSTICS;

  beforeEach(() => {
    resetMcpStdioConsoleGuardForTests();
  });

  afterEach(() => {
    resetMcpStdioConsoleGuardForTests();
    if (prevDiag === undefined) delete process.env.TIED_MCP_DIAGNOSTICS;
    else process.env.TIED_MCP_DIAGNOSTICS = prevDiag;
  });

  it("does not write console.debug to stdout when diagnostics disabled", () => {
    delete process.env.TIED_MCP_DIAGNOSTICS;
    installMcpStdioConsoleGuard();
    const cap = captureProcessWrites();
    try {
      console.debug('DEBUG: [IMPL-FIXTURE] sample', { request_token: "REQ-X", phases: ["a"] });
      assert.equal(cap.stdout.join(""), "");
      assert.equal(cap.stderr.join(""), "");
    } finally {
      cap.restore();
    }
  });

  it("writes console.debug to stderr not stdout when diagnostics enabled", () => {
    process.env.TIED_MCP_DIAGNOSTICS = "1";
    installMcpStdioConsoleGuard();
    const cap = captureProcessWrites();
    try {
      console.debug("DEBUG: [IMPL-FIXTURE] line");
      assert.equal(cap.stdout.join(""), "");
      assert.ok(cap.stderr.join("").includes("DEBUG: [IMPL-FIXTURE] line"));
    } finally {
      cap.restore();
    }
  });
});
