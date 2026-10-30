#!/usr/bin/env node
/**
 * [IMPL-TIED_CLI_MCP_JSON_BASE_PATH] [REQ-TIED_CLI_MCP_JSON_BASE_PATH]
 * How: Emit shell-safe export lines for tied-cli.sh (RESOLVE_TIED_CLI_ENV).
 */
import { resolveTiedCliEnvFromCwd } from "../../bootstrap/lib/mcp-base-path.mjs";

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\"'\"'`)}'`;
}

try {
  const resolved = resolveTiedCliEnvFromCwd(process.cwd(), process.env);
  process.stdout.write(
    `export TIED_CLIENT_PROJECT_PATH=${shellQuote(resolved.TIED_CLIENT_PROJECT_PATH)}\n`,
  );
  if (resolved.TIED_CLIENT_BUNDLE_PATH) {
    process.stdout.write(
      `export TIED_CLIENT_BUNDLE_PATH=${shellQuote(resolved.TIED_CLIENT_BUNDLE_PATH)}\n`,
    );
  }
  process.stdout.write(`export TIED_CLI_PROJECT_ROOT=${shellQuote(resolved.projectRoot)}\n`);
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`${message}\n`);
  process.exit(1);
}
