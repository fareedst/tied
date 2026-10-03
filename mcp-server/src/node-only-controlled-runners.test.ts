import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import fg from "fast-glob";

// [IMPL-TIED_NODE_TOOLCHAIN_DEFAULT] [ARCH-TIED_NODE_TOOLCHAIN_DEFAULT] [REQ-TIED_NODE_TOOLCHAIN_DEFAULT] How: Contract test fails on Bun shebang or bun install/run/test spawns in controlled files.
describe("node-only controlled runners [REQ-TIED_NODE_TOOLCHAIN_DEFAULT]", () => {
  const repoRoot = path.resolve(import.meta.dirname, "../..");

  const controlledPaths = [
    "mcp-server/package.json",
    "scripts/build-commands.sh",
    "mcp-server/scripts/run-mcp-tests.mjs",
    ...fg.sync("mcp-server/scripts/replay-jev-*.ts", { cwd: repoRoot, onlyFiles: true }),
  ].sort();

  const forbiddenPatterns: Array<{ label: string; re: RegExp }> = [
    { label: "bun shebang", re: /^#![^\n]*\benv\s+bun\b/m },
    { label: "bun install", re: /\bbun\s+install\b/ },
    { label: "bun run", re: /\bbun\s+run\b/ },
    { label: "bun test", re: /\bbun\s+test\b/ },
    { label: "spawn bun", re: /(?:spawnSync|spawn)\(\s*["']bun["']/ },
    { label: "run(bun)", re: /\brun\(\s*["']bun["']/ },
  ];

  for (const relative of controlledPaths) {
    it(`controlled path has no Bun invocations: ${relative}`, () => {
      const absolute = path.join(repoRoot, relative);
      assert.ok(fs.existsSync(absolute), `missing controlled file ${relative}`);
      const content = fs.readFileSync(absolute, "utf8");
      for (const { label, re } of forbiddenPatterns) {
        const match = content.match(re);
        assert.equal(
          match,
          null,
          `${relative} must not contain ${label}; found ${match?.[0] ?? ""}`,
        );
      }
    });
  }
});
