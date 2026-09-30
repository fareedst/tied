/**
 * [IMPL-TIED_JEV_CONTEXT_LOG_PRUNING] [ARCH-TIED_JEV_CONTEXT_LOG_PRUNING] [REQ-TIED_JEV_CONTEXT_LOG_PRUNING]
 * Stream-json hook for voluminous tool/shell output when TIED_JEV_CONTEXT_LOG_PRUNING is opt-in.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import type { DryRunConfig } from "./dry-run-config.js";
import {
  manifestEnablesJevHarness,
  readRepoTiedYaml,
  resolveProjectRootForJev,
} from "./jev-harness-shared.js";

export type StreamToolResultBody = {
  tool: string;
  body: string;
};

export type ContextLogPruneHook = {
  prune: (body: string) => Promise<{ text: string; diagnostic: string }>;
};

export type ContextLogPruneStreamState = {
  chain: Promise<void>;
  stderrLines: string[];
};

export function createContextLogPruneStreamState(): ContextLogPruneStreamState {
  return { chain: Promise.resolve(), stderrLines: [] };
}

/** Parse tool-result bodies from agent stream-json NDJSON (composition + common shapes). */
export function parseToolResultBodyFromStreamObject(
  obj: Record<string, unknown>,
): StreamToolResultBody | null {
  const typ = String(obj.type ?? "");
  if (typ === "agentstream_tool_result") {
    const tool = String(obj.tool ?? obj.tool_name ?? "tool").trim();
    const body =
      typeof obj.body === "string"
        ? obj.body
        : typeof obj.output === "string"
          ? obj.output
          : typeof obj.result === "string"
            ? obj.result
            : "";
    if (body === "") {
      return null;
    }
    return { tool, body };
  }
  if (typ === "tool_result") {
    const tool = String(obj.tool_name ?? obj.name ?? "tool").trim();
    const content = obj.content;
    const body =
      typeof content === "string"
        ? content
        : Array.isArray(content)
          ? content
              .map((c) => {
                const row = c as Record<string, unknown>;
                return typeof row.text === "string" ? row.text : "";
              })
              .filter(Boolean)
              .join("\n")
          : typeof obj.output === "string"
            ? obj.output
            : "";
    if (body === "") {
      return null;
    }
    return { tool, body };
  }
  return null;
}

export function contextLogPruningEnabled(
  env: NodeJS.ProcessEnv = process.env,
  projectRoot?: string,
): boolean {
  if (env.TIED_JEV_CONTEXT_LOG_PRUNING === "1" || env.TIED_JEV_CONTEXT_LOG_PRUNING === "true") {
    return true;
  }
  if (projectRoot) {
    const repo = readRepoTiedYaml(projectRoot);
    const jev = repo?.jev as Record<string, unknown> | undefined;
    if (jev?.context_log_pruning === true) {
      return true;
    }
  }
  return false;
}

function contextLogPrunerDistPath(projectRoot: string): string {
  return path.join(projectRoot, "mcp-server", "dist", "jev", "context-log-pruner.js");
}

function resolveJevApiKeyDistPath(projectRoot: string): string {
  return path.join(projectRoot, "mcp-server", "dist", "jev", "resolve-jev-api-key.js");
}

export async function createContextLogPruneHook(
  cfg: DryRunConfig,
  deps?: { prune?: ContextLogPruneHook["prune"] },
): Promise<ContextLogPruneHook | null> {
  const projectRoot = resolveProjectRootForJev(cfg);
  if (!contextLogPruningEnabled(process.env, projectRoot)) {
    return null;
  }
  if (deps?.prune) {
    return { prune: deps.prune };
  }
  const modPath = contextLogPrunerDistPath(projectRoot);
  if (!fs.existsSync(modPath)) {
    process.stderr.write(
      "DIAGNOSTIC: context log pruning enabled but mcp-server/dist/jev/context-log-pruner.js missing — run: cd mcp-server && npm run build\n",
    );
    return null;
  }
  const mod = await import(pathToFileURL(modPath).href);
  const keyModPath = resolveJevApiKeyDistPath(projectRoot);
  let apiKey: string | undefined;
  if (fs.existsSync(keyModPath)) {
    const keyMod = await import(pathToFileURL(keyModPath).href);
    apiKey = keyMod.resolveJevApiKey(process.env, { repoRoot: projectRoot });
  } else {
    apiKey = process.env.JEV_API_KEY?.trim();
  }
  return {
    prune: async (body: string) => {
      const { text, metrics } = await mod.pruneContextLog(body, {
        arm: "pruner_jev_on",
        jevConfig: { apiKey },
      });
      const diagnostic =
        `DIAGNOSTIC: context log prune: tool output lines ${metrics.input_lines}→${metrics.output_lines} ` +
        `bytes ${metrics.input_bytes}→${metrics.output_bytes}\n`;
      return { text, diagnostic };
    },
  };
}

/** Apply context log pruning to one stream-json NDJSON line (non-blocking; logs to stderr). */
export function enqueueContextLogPruneLineCheck(
  state: ContextLogPruneStreamState,
  hook: ContextLogPruneHook,
  line: string,
): void {
  const trimmed = line.trim();
  if (trimmed === "") {
    return;
  }
  let obj: Record<string, unknown>;
  try {
    obj = JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    return;
  }
  const parsed = parseToolResultBodyFromStreamObject(obj);
  if (!parsed) {
    return;
  }
  state.chain = state.chain.then(async () => {
    const out = await hook.prune(parsed.body);
    state.stderrLines.push(out.diagnostic);
    process.stderr.write(out.diagnostic);
  });
}
