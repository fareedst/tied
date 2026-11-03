#!/usr/bin/env node
/**
 * Emit shell-safe export lines for tied-cli.sh (install mcp.json + store runtime config).
 */
import { resolveTiedCliEnvFromCwd } from "../../bootstrap/lib/mcp-base-path.mjs";
import { resolveTiedRuntimeConfig } from "../../bootstrap/lib/tied-runtime-config.mjs";

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\"'\"'`)}'`;
}

try {
  const cwd = process.cwd();
  const runtime = resolveTiedRuntimeConfig({
    cwd,
    processEnv: {},
    requireDistExists: true,
  });
  const cliEnv = resolveTiedCliEnvFromCwd(cwd, {});

  process.stdout.write(
    `export TIED_CLIENT_PROJECT_PATH=${shellQuote(cliEnv.TIED_CLIENT_PROJECT_PATH)}\n`,
  );
  if (cliEnv.TIED_CLIENT_BUNDLE_PATH) {
    process.stdout.write(
      `export TIED_CLIENT_BUNDLE_PATH=${shellQuote(cliEnv.TIED_CLIENT_BUNDLE_PATH)}\n`,
    );
  }
  process.stdout.write(`export TIED_CLI_PROJECT_ROOT=${shellQuote(cliEnv.projectRoot)}\n`);
  process.stdout.write(`export TIED_MCP_BIN=${shellQuote(runtime.mcpDistPath)}\n`);
  process.stdout.write(`export TIED_STORE_ROOT=${shellQuote(runtime.storeRoot)}\n`);
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`${message}\n`);
  process.exit(1);
}
