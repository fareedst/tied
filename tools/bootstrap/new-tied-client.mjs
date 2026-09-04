#!/usr/bin/env node
/**
 * [IMPL-TIED_FILES] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP]
 * How: CLI for RUN_NEW_TIED_CLIENT_PIPELINE / CREATE_DISPOSABLE_TIED_CLIENT.
 */
import path from "node:path";
import { pathToFileURL } from "node:url";
import { sayErr } from "./lib/console.mjs";
import {
  resolveSourceRoot,
  resolveTestRoot,
  runDisposableClient,
  runNewTiedClientPipeline,
} from "./lib/new-tied-client-pipeline.mjs";

function usage() {
  sayErr(`usage: new-tied-client.mjs [OPTIONS] [CLIENT_DIR]

Options:
  --disposable              Create under TIED_TEST_ROOT/<unix-seconds>
  --source-root PATH        TIED repo root (default: bootstrap engine repo root)
  --test-root PATH          Disposable parent (default: %USERPROFILE%\\Documents\\dev\\test)
  --skip-lint               Skip lint step
  --skip-mcp-enable         Skip Cursor agent mcp enable
  --skip-git                Skip git init/commit
  --force-mcp-enable        Run mcp enable even when stdin is not a TTY

Environment: TIED_SOURCE_ROOT, TIED_TEST_ROOT, TIED_CURSOR_AGENT_CMD (default: cursor on Windows when on PATH, else agent)`);
}

export function parseNewTiedClientArgs(argv) {
  const args = [...argv];
  const options = {
    disposable: false,
    sourceRoot: undefined,
    testRoot: undefined,
    skipLint: false,
    skipMcpEnable: false,
    skipGit: false,
    forceMcpEnable: false,
    clientDir: undefined,
  };

  while (args.length > 0 && args[0].startsWith("-")) {
    const flag = args.shift();
    switch (flag) {
      case "--disposable":
        options.disposable = true;
        break;
      case "--source-root":
        options.sourceRoot = path.resolve(args.shift() ?? "");
        break;
      case "--test-root":
        options.testRoot = path.resolve(args.shift() ?? "");
        break;
      case "--skip-lint":
        options.skipLint = true;
        break;
      case "--skip-mcp-enable":
        options.skipMcpEnable = true;
        break;
      case "--skip-git":
        options.skipGit = true;
        break;
      case "--force-mcp-enable":
        options.forceMcpEnable = true;
        break;
      case "-h":
      case "--help":
        options.help = true;
        break;
      default:
        sayErr(`Unknown option: ${flag}`);
        options.error = true;
        return options;
    }
  }

  if (args.length > 0) {
    options.clientDir = path.resolve(args[0]);
  }
  return options;
}

function main() {
  const parsed = parseNewTiedClientArgs(process.argv.slice(2));
  if (parsed.help) {
    usage();
    process.exit(0);
  }
  if (parsed.error) {
    usage();
    process.exit(1);
  }

  const env = process.env;
  const sourceRoot = parsed.sourceRoot ?? resolveSourceRoot(env);
  const common = {
    sourceRoot,
    skipLint: parsed.skipLint,
    skipMcpEnable: parsed.skipMcpEnable,
    skipGit: parsed.skipGit,
    forceMcpEnable: parsed.forceMcpEnable,
    env,
  };

  if (parsed.disposable) {
    const result = runDisposableClient({
      ...common,
      testRoot: parsed.testRoot ?? resolveTestRoot(env),
    });
    process.exit(result.ok ? 0 : result.code ?? 1);
  }

  if (!parsed.clientDir) {
    sayErr("CLIENT_DIR is required unless --disposable is set");
    usage();
    process.exit(1);
  }

  const result = runNewTiedClientPipeline({
    ...common,
    clientDir: parsed.clientDir,
  });
  process.exit(result.ok ? 0 : result.code ?? 1);
}

function isMainModule() {
  const entry = process.argv[1];
  if (!entry) return false;
  return import.meta.url === pathToFileURL(path.resolve(entry)).href;
}

if (isMainModule()) {
  main();
}
