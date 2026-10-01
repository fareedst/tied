/**
 * [IMPL-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR]
 * Opt-in Jev harness bootstrap after tiedpreflight + DAE gate (W5).
 */
import fs from "node:fs";
import path from "node:path";

import type { DryRunConfig } from "./dry-run-config.js";
import { findRepoRootFromPath } from "./repo-root.js";
import {
  formatHarnessDistMissingMessage,
  isHarnessDistBuilt,
  loadJevHarnessDistModule,
  manifestEnablesJevHarness,
  resolveProjectRootForJev,
  taskSummaryFromCfg,
} from "./jev-harness-shared.js";

export type HarnessToolEvaluation = {
  decision: string;
  reason: string;
};

export type ContextFilterAdvisory = {
  action: string;
  reason: string;
};

export type JevHarnessLiveDeps = {
  evaluateSampleTool?: () => Promise<HarnessToolEvaluation>;
  adviseSampleContext?: () => Promise<ContextFilterAdvisory>;
};

export function jevAgentstreamHarnessEnabled(workspace: string): boolean {
  if (
    process.env.AGENTSTREAM_JEV_HARNESS === "1" ||
    process.env.AGENTSTREAM_JEV_HARNESS === "true"
  ) {
    return true;
  }
  const ws = path.resolve(workspace);
  if (manifestEnablesJevHarness(ws)) {
    return true;
  }
  const root = findRepoRootFromPath(workspace);
  if (root !== "" && path.resolve(root) !== ws) {
    return manifestEnablesJevHarness(root);
  }
  return false;
}

function firstPromptSnippet(cfg: DryRunConfig): string {
  for (const p of cfg.promptFiles) {
    try {
      return fs.readFileSync(p, "utf8").slice(0, 2000);
    } catch {
      continue;
    }
  }
  return "";
}

function appendProviderDiagnostics(env: NodeJS.ProcessEnv, lines: string[]): void {
  const rawProvider = env.TIED_JEV_DECISION_PROVIDER?.trim().toLowerCase() ?? "remote";
  const provider =
    rawProvider === "local" || rawProvider === "auto" || rawProvider === "remote"
      ? rawProvider
      : "remote";
  const fallbackRaw = env.TIED_JEV_LOCAL_FALLBACK?.trim().toLowerCase() ?? "skip";
  const fallback =
    fallbackRaw === "remote" || fallbackRaw === "error" ? fallbackRaw : "skip";
  lines.push(`DEBUG: jev decision provider=${provider} local_fallback=${fallback}\n`);
  const remoteReady = (env.JEV_API_KEY ?? "").trim() !== "";
  const bridge = env.TIED_JEV_LOCAL_BRIDGE?.trim() ?? "";
  const localReady = bridge !== "" && path.isAbsolute(bridge);
  lines.push(
    `DEBUG: jev decision backend: remote_ready=${remoteReady} local_ready=${localReady}\n`,
  );
  if (provider === "auto" && fallback === "remote") {
    lines.push(
      "DIAGNOSTIC: jev auto mode may egress to remote Jev when local fails (TIED_JEV_LOCAL_FALLBACK=remote)\n",
    );
  }
  if (provider === "remote" && !remoteReady) {
    lines.push(
      "DIAGNOSTIC: jev harness: JEV_API_KEY missing — blocking tools (bash/Shell) will fail-closed per jev_unavailable_policy\n",
    );
  }
  if (provider === "local" && !localReady) {
    lines.push(
      "DIAGNOSTIC: jev local provider misconfigured — blocking harness tools fail-closed\n",
    );
  }
}

function bootstrapLines(cfg: DryRunConfig): string[] {
  const lines: string[] = [];
  lines.push("DEBUG: jev harness preflight: enabled (AGENTSTREAM_JEV_HARNESS or jev.agentstream_harness)\n");
  appendProviderDiagnostics(process.env, lines);
  if (cfg.skipTiedMcpPreflight) {
    lines.push(
      "DEBUG: jev harness: runs after static tiedpreflight; does not replace tied_checklist_gate_validate or MCP gates\n",
    );
  }
  return lines;
}

/** Sync bootstrap diagnostics only (dry-run path). */
export function runJevHarnessPreflight(cfg: DryRunConfig): {
  exitCode: number;
  stderr: string;
} {
  if (!jevAgentstreamHarnessEnabled(cfg.workspace)) {
    return { exitCode: 0, stderr: "" };
  }
  const lines = bootstrapLines(cfg);
  const projectRoot = resolveProjectRootForJev(cfg);
  if (!isHarnessDistBuilt(projectRoot)) {
    lines.push(formatHarnessDistMissingMessage());
    return { exitCode: 1, stderr: lines.join("") };
  }
  return { exitCode: 0, stderr: lines.join("") };
}

/** Live run: bootstrap + optional mock Jev smoke when key or deps present. */
export async function runJevHarnessPreflightLive(
  cfg: DryRunConfig,
  deps?: JevHarnessLiveDeps,
): Promise<{ exitCode: number; stderr: string }> {
  if (!jevAgentstreamHarnessEnabled(cfg.workspace)) {
    return { exitCode: 0, stderr: "" };
  }

  const hasInjectedDeps = Boolean(
    deps?.evaluateSampleTool || deps?.adviseSampleContext,
  );

  // Injected deps bypass dist hard-stop (T-CFG unit smoke only).
  const lines: string[] = [];
  const append = (s: string) => {
    if (!s.endsWith("\n")) {
      lines.push(s + "\n");
    } else {
      lines.push(s);
    }
  };
  for (const line of bootstrapLines(cfg)) {
    lines.push(line.endsWith("\n") ? line : line + "\n");
  }

  if (!hasInjectedDeps) {
    const projectRoot = resolveProjectRootForJev(cfg);
    if (!isHarnessDistBuilt(projectRoot)) {
      append(formatHarnessDistMissingMessage().trimEnd());
      return { exitCode: 1, stderr: lines.join("") };
    }
  }

  if (deps?.evaluateSampleTool) {
    const tool = await deps.evaluateSampleTool();
    append(
      `DEBUG: jev harness sample tool eval: decision=${tool.decision} reason=${tool.reason}`,
    );
  }
  if (deps?.adviseSampleContext) {
    const ctx = await deps.adviseSampleContext();
    append(
      `DEBUG: jev harness sample context filter: action=${ctx.action} reason=${ctx.reason}`,
    );
  }

  if (hasInjectedDeps) {
    return { exitCode: 0, stderr: lines.join("") };
  }

  const projectRoot = resolveProjectRootForJev(cfg);
  const mod = await loadJevHarnessDistModule(projectRoot);
  if (!mod) {
    // Belt: race between existsSync and import — still hard-stop.
    append(formatHarnessDistMissingMessage().trimEnd());
    return { exitCode: 1, stderr: lines.join("") };
  }

  const manifestFlag = manifestEnablesJevHarness(projectRoot);
  const harness = mod.resolveHarnessFromEnv(process.env, manifestFlag);
  const task = taskSummaryFromCfg(cfg);
  const snippet = firstPromptSnippet(cfg);

  if (harness.decisionBackendReady) {
    const toolEval = await mod.evaluateHarnessToolCall(
      { tool: "Shell", arguments: "echo agentstream-jev-smoke", goal: task },
      harness,
    );
    append(
      `DEBUG: jev harness sample tool eval: decision=${toolEval.decision} reason=${toolEval.reason}`,
    );
    if (snippet !== "" && mod.adviseContextFilter) {
      const ctxAdv = await mod.adviseContextFilter(task, snippet, harness);
      append(
        `DEBUG: jev harness sample context filter: action=${ctxAdv.action} reason=${ctxAdv.reason}`,
      );
    }
  }

  return { exitCode: 0, stderr: lines.join("") };
}
