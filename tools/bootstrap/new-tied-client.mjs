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
import { parseBootstrapToolFlags } from "./lib/client-tool-use-bootstrap.mjs";
import { parseInstallPassthroughFlags } from "./lib/install-options.mjs";

function usage() {
  sayErr(`usage: new-tied-client.mjs [OPTIONS] [CLIENT_DIR]

Options:
  --disposable              Create under TIED_TEST_ROOT/<unix-seconds>
  --source-root PATH        TIED repo root (default: bootstrap engine repo root)
  --test-root PATH          Disposable parent (default: %USERPROFILE%\\Documents\\dev\\test)
  --skip-lint               Skip lint step
  --skip-onboarding-audit   Skip G4 new-client onboarding audit (see TIED_SKIP_NEW_CLIENT_AUDIT)
  --skip-mcp-enable         Skip Cursor agent mcp enable
  --skip-git                Skip git init/commit
  --force-mcp-enable        Run mcp enable even when stdin is not a TTY
  --harness cursor|claude   Harness profile (default: cursor)
  --claude-first            Alias for --harness claude
  --skip-claude-validation  Skip post-audit Claude validation (claude harness only)
  --with-consistency        Run tied_validate_consistency during Claude validation
  --with-agentstream-dry-run  Run agentstream dry-run during Claude validation (default on for claude)
  --no-agentstream-dry-run    Skip agentstream dry-run during Claude validation
  --with-live-claude        Reserved; live Claude not run in v1 factory
  --full-tools              Enable Jev + DAE starter config + BBCE analysis files
  --with-jev                Seed jev.plan_skills: true in tied-project/config.yaml (create or --force-tool-config)
  --with-dae                Seed dae.crap_threshold: 30 only (create or --force-tool-config)
  --with-bbce               Copy tied/analysis/ starter files into the client
  --tools jev,dae,bbce      Comma-separated tool flags (same as granular flags)
  --force-tool-config       Merge tool keys into an existing tied-project/config.yaml

Environment: TIED_REPO_ROOT, TIED_TEST_ROOT, CURSOR_CLI_NAME (default agent),
  TIED_CURSOR_AGENT_CMD (full override; wins over CURSOR_CLI_NAME),
  TIED_BOOTSTRAP_FULL_TOOLS, TIED_BOOTSTRAP_WITH_JEV, TIED_BOOTSTRAP_WITH_DAE,
  TIED_BOOTSTRAP_WITH_BBCE, TIED_BOOTSTRAP_FORCE_TOOL_CONFIG (CLI overrides env),
  TIED_CLAUDE_CLIENT_WITH_CONSISTENCY=1 (same as --with-consistency for Claude validation)

Install passthrough (forwarded to tied-install):
  --install-mode linked|full       (env: TIED_INSTALL_MODE)
  --install-layers db,mcp,...      (env: TIED_INSTALL_LAYERS)
  --install-harness cursor|claude|both (env: TIED_INSTALL_HARNESS)
  --methodology-bundle live|pinned (env: TIED_METHODOLOGY_BUNDLE)
  --doctor-after                   Run tied-install --doctor after install (env: TIED_INSTALL_DOCTOR_AFTER=1)`);
}

export function parseNewTiedClientArgs(argv, env = process.env) {
  const { profile: toolUseProfile, argv: afterToolFlags } = parseBootstrapToolFlags(argv, env);
  const { options: installOptions, remainingArgv } = parseInstallPassthroughFlags(afterToolFlags, env);
  const args = [...remainingArgv];
  const options = {
    toolUseProfile,
    installOptions,
    disposable: false,
    sourceRoot: undefined,
    testRoot: undefined,
    skipLint: false,
    skipOnboardingAudit: false,
    skipMcpEnable: false,
    skipGit: false,
    forceMcpEnable: false,
    harnessProfile: "cursor",
    skipClaudeValidation: false,
    withConsistency: false,
    withAgentstreamDryRun: undefined,
    withLiveClaude: false,
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
      case "--skip-onboarding-audit":
        options.skipOnboardingAudit = true;
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
      case "--harness": {
        const value = (args.shift() ?? "").toLowerCase();
        if (value !== "cursor" && value !== "claude") {
          sayErr(`Invalid --harness value: ${value}`);
          options.error = true;
          return options;
        }
        options.harnessProfile = value;
        break;
      }
      case "--claude-first":
        options.harnessProfile = "claude";
        break;
      case "--skip-claude-validation":
        options.skipClaudeValidation = true;
        break;
      case "--with-consistency":
        options.withConsistency = true;
        break;
      case "--with-agentstream-dry-run":
        options.withAgentstreamDryRun = true;
        break;
      case "--no-agentstream-dry-run":
        options.withAgentstreamDryRun = false;
        break;
      case "--with-live-claude":
        options.withLiveClaude = true;
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
  const harnessProfile = parsed.harnessProfile ?? "cursor";
  const withConsistency =
    parsed.withConsistency || env.TIED_CLAUDE_CLIENT_WITH_CONSISTENCY === "1";
  const withAgentstreamDryRun =
    parsed.withAgentstreamDryRun ??
    (harnessProfile === "claude" ? true : false);
  const common = {
    sourceRoot,
    skipLint: parsed.skipLint,
    skipOnboardingAudit: parsed.skipOnboardingAudit,
    skipMcpEnable: harnessProfile === "claude" ? true : parsed.skipMcpEnable,
    skipGit: parsed.skipGit,
    forceMcpEnable: parsed.forceMcpEnable,
    harnessProfile,
    skipClaudeValidation: parsed.skipClaudeValidation,
    claudeValidation: {
      withConsistency,
      withAgentstreamDryRun,
      withLiveClaude: parsed.withLiveClaude,
    },
    env,
    toolUseProfile: parsed.toolUseProfile,
    installOptions: parsed.installOptions,
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
