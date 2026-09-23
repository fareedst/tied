import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import {
  agentstreamTsEntryFromCliModule,
  bootstrapCopyFilesEntryFromCliModule,
  bootstrapNewClientEntryFromCliModule,
  goAgentstreamModuleDirFromCliModule,
  mcpStdioEntryFromCliModule,
  onboardingEntryFromCliModule,
  workspaceRootFromCliModule,
  yamlCliEntryFromCliModule,
} from "./paths.js";

// [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN] — How: RED smoke that CLI resolves the same MCP artifact path as Cursor config.
describe("@tied/cli workspace paths [REQ-TIED_UNIFIED_TOOLCHAIN]", () => {
  it("resolves mcp-server/dist/index.js from the built CLI module", () => {
    const root = workspaceRootFromCliModule(import.meta.url);
    assert.match(root, /mcp-server$/);
    const mcpEntry = mcpStdioEntryFromCliModule(import.meta.url);
    assert.equal(mcpEntry, `${root}/dist/index.js`);
    assert.ok(
      fs.existsSync(mcpEntry),
      `expected MCP stdio entry at ${mcpEntry} (run npm run build at workspace root)`,
    );
  });

  it("preserves feature-orchestration onboarding entry beside MCP dist", () => {
    const onboarding = onboardingEntryFromCliModule(import.meta.url);
    assert.ok(
      fs.existsSync(onboarding),
      `expected onboarding entry at ${onboarding}`,
    );
  });

  it("resolves bootstrap and yaml Phase 2 dispatch targets", () => {
    assert.ok(fs.existsSync(bootstrapCopyFilesEntryFromCliModule(import.meta.url)));
    assert.ok(fs.existsSync(bootstrapNewClientEntryFromCliModule(import.meta.url)));
    const yamlCli = yamlCliEntryFromCliModule(import.meta.url);
    assert.ok(fs.existsSync(yamlCli), `expected ${yamlCli} (build yaml-cli workspace)`);
  });

  it("resolves Phase 3 agentstream dispatch targets", () => {
    const goMod = goAgentstreamModuleDirFromCliModule(import.meta.url);
    assert.ok(fs.existsSync(path.join(goMod, "go.mod")));
    const tsEntry = agentstreamTsEntryFromCliModule(import.meta.url);
    assert.ok(
      fs.existsSync(tsEntry),
      `expected ${tsEntry} (build agentstream workspace)`,
    );
  });
});
