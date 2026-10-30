/**
 * [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP]
 * How: Invoke tied-yaml MCP tools via Node (same env contract as tied-cli.sh), without bash.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { childProcessSpawnOptions } from "./child-process-win.mjs";
import { jsonSafeAbsolute } from "./paths.mjs";
import { resolveTiedCliEnvFromCwd } from "./mcp-base-path.mjs";
import {
  pickClientBundlePath,
  pickClientProjectPath,
} from "./tied-path-env.mjs";
import { validateTiedProjectLayout } from "./mcp-base-path.mjs";

/**
 * @param {string} storeRoot
 */
export function resolveTiedMcpStdioClientPath(storeRoot) {
  return path.join(storeRoot, "tools", "bundled-tied-yaml-skill", "scripts", "tied-mcp-stdio-client.cjs");
}

/**
 * @param {string} storeRoot
 */
export function resolveStoreMcpDistPath(storeRoot) {
  return path.join(storeRoot, "mcp-server", "dist", "index.js");
}

/**
 * @param {{
 *   projectRoot: string;
 *   storeRoot: string;
 *   toolName: string;
 *   argsJson?: string;
 *   env?: Record<string, string>;
 * }} options
 */
export function invokeTiedCliMcpTool(options) {
  const clientJs = resolveTiedMcpStdioClientPath(options.storeRoot);
  const mcpBin = resolveStoreMcpDistPath(options.storeRoot);
  if (!fs.existsSync(clientJs)) {
    return {
      ok: false,
      status: null,
      stderr: `TIED_CLI_CLIENT_MISSING: ${clientJs}`,
      stdout: "",
      error: null,
    };
  }
  if (!fs.existsSync(mcpBin)) {
    return {
      ok: false,
      status: null,
      stderr: `TIED_MCP_BIN_MISSING: ${mcpBin}`,
      stdout: "",
      error: null,
    };
  }
  const umbrellaCli = path.join(options.storeRoot, "mcp-server", "packages", "cli", "dist", "index.js");
  const env = {
    ...process.env,
    ...options.env,
    TIED_CLI_MCP_BIN: jsonSafeAbsolute(mcpBin),
    TIED_CLI_REQUEST_ID: "1",
    TIED_CLI_TOOL_NAME: options.toolName,
    TIED_CLI_ARGS_JSON: options.argsJson ?? "{}",
  };
  try {
    if (options.env) {
      delete env.TIED_CLIENT_PROJECT_PATH;
      delete env.TIED_BASE_PATH;
      const explicitProject = pickClientProjectPath(options.env);
      if (explicitProject) {
        env.TIED_CLIENT_PROJECT_PATH = validateTiedProjectLayout(
          jsonSafeAbsolute(explicitProject),
        );
        const explicitBundle = pickClientBundlePath(options.env);
        if (explicitBundle) {
          env.TIED_CLIENT_BUNDLE_PATH = jsonSafeAbsolute(explicitBundle);
        }
      } else {
        const resolved = resolveTiedCliEnvFromCwd(options.projectRoot, {
          ...env,
          ...options.env,
        });
        env.TIED_CLIENT_PROJECT_PATH = resolved.TIED_CLIENT_PROJECT_PATH;
        if (resolved.TIED_CLIENT_BUNDLE_PATH) {
          env.TIED_CLIENT_BUNDLE_PATH = resolved.TIED_CLIENT_BUNDLE_PATH;
        }
      }
    } else if (!pickClientProjectPath(env)) {
      const resolved = resolveTiedCliEnvFromCwd(options.projectRoot, env);
      env.TIED_CLIENT_PROJECT_PATH = resolved.TIED_CLIENT_PROJECT_PATH;
      if (resolved.TIED_CLIENT_BUNDLE_PATH) {
        env.TIED_CLIENT_BUNDLE_PATH = resolved.TIED_CLIENT_BUNDLE_PATH;
      }
    } else {
      env.TIED_CLIENT_PROJECT_PATH = validateTiedProjectLayout(
        jsonSafeAbsolute(pickClientProjectPath(env)),
      );
      delete env.TIED_BASE_PATH;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      status: null,
      stderr: message,
      stdout: "",
      error: err instanceof Error ? err : null,
    };
  }
  delete env.TIED_BASE_PATH;
  delete env.TIED_METHODOLOGY_BUNDLE_PATH;
  delete env.TIED_CLI_ARGS_FILE;
  if (fs.existsSync(umbrellaCli)) {
    env.TIED_CLI_UMBRELLA_MCP = "1";
    env.TIED_CLI_UMBRELLA_ENTRY = jsonSafeAbsolute(umbrellaCli);
  }
  const result = spawnSync(
    process.execPath,
    [clientJs],
    childProcessSpawnOptions({
      cwd: options.projectRoot,
      encoding: "utf8",
      env,
      stdio: "pipe",
    }),
  );
  const stderr = result.stderr ?? "";
  const stdout = result.stdout ?? "";
  if (result.error) {
    return {
      ok: false,
      status: result.status,
      stderr: stderr || String(result.error.message ?? result.error),
      stdout,
      error: result.error,
    };
  }
  return {
    ok: result.status === 0,
    status: result.status,
    stderr,
    stdout,
    error: null,
  };
}
