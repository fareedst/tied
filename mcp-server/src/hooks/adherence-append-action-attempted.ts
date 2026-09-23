/**
 * [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
 * Append-only bridge: active-turn marker → action_attempted ledger row. Fail-silent when marker absent.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ALLOWLIST = new Set([
  "postToolUse",
  "afterShellExecution",
  "afterMCPExecution",
]);

export type HookRecord = Record<string, unknown>;

export function callAdherenceAppendActionAttempted(
  record: HookRecord,
  options: { hookLogPath: string; hookLogLine: number },
): void {
  try {
    const hook = String(record["hook_event_name"] ?? "");
    if (!ALLOWLIST.has(hook)) return;

    const marker = readMarker(record);
    if (!marker) return;

    const ledgerPath = resolveLedgerPath(marker, record);
    if (!ledgerPath || !fs.existsSync(path.dirname(ledgerPath))) return;

    const row = buildRow(marker, record, hook, options.hookLogPath, options.hookLogLine);
    if (!row) return;

    appendRow(ledgerPath, row);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const kind = error instanceof Error ? error.constructor.name : "Error";
    console.error(`DIAGNOSTIC: adherence_append_action_attempted fail-silent: ${kind}: ${message}`);
  }
}

function readMarker(record: HookRecord): Record<string, unknown> | null {
  const workspace = workspaceRoot(record);
  if (!workspace) return null;

  let markerPath = nestedString(record, ["active_turn", "marker_path"]);
  const tokenFromTurn = nestedString(record, ["active_turn", "request_token"]);

  if (!markerPath) {
    const token = tokenFromTurn || inferRequestToken(workspace);
    if (!token) return null;
    markerPath = path.join(workspace, "working", token, "adherence", "active-turn.json");
  }

  if (!fs.existsSync(markerPath)) return null;

  try {
    return JSON.parse(fs.readFileSync(markerPath, "utf8")) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function inferRequestToken(workspace: string): string | null {
  try {
    const working = path.join(workspace, "working");
    if (!fs.existsSync(working)) return null;
    for (const entry of fs.readdirSync(working)) {
      if (!entry.startsWith("REQ-")) continue;
      const markerPath = path.join(working, entry, "adherence", "active-turn.json");
      if (!fs.existsSync(markerPath)) continue;
      const marker = JSON.parse(fs.readFileSync(markerPath, "utf8")) as Record<string, unknown>;
      const token = marker["request_token"];
      return typeof token === "string" ? token : null;
    }
  } catch {
    return null;
  }
  return null;
}

function resolveLedgerPath(marker: Record<string, unknown>, record: HookRecord): string | null {
  const raw = String(marker["adherence_ledger_path"] ?? "");
  if (!raw) return null;
  if (raw.startsWith("/")) return raw;

  let workspace = String(marker["workspace_root"] ?? "");
  if (!workspace) workspace = workspaceRoot(record) ?? "";
  return path.resolve(workspace, raw);
}

function workspaceRoot(record: HookRecord): string | null {
  const roots = record["workspace_roots"];
  if (Array.isArray(roots) && roots.length > 0) {
    return String(roots[0]);
  }

  const rel = String(record["relative_path"] ?? "");
  if (!rel) return null;
  return `/Users/fareed/Documents/dev/${rel.replace(/_/g, "/")}`;
}

function buildRow(
  marker: Record<string, unknown>,
  record: HookRecord,
  hook: string,
  hookLogPath: string,
  hookLogLine: number,
): Record<string, unknown> | null {
  const refs = evidenceRefsFor(record, hook);
  if (refs.length === 0) return null;

  const correlation: Record<string, unknown> = {
    request_token: marker["request_token"],
    run_id: marker["run_id"],
    turn_index: marker["turn_index"],
    step_slug: marker["step_slug"],
    instruction_hash: marker["instruction_hash"],
    instruction_nonce: marker["instruction_nonce"],
  };

  const toolUseId = nestedString(record, ["normalized", "details", "tool_use_id"]);
  if (toolUseId) correlation["tool_use_id"] = toolUseId;

  return {
    schema_version: "agent-adherence-event.v1",
    event_class: "action_attempted",
    correlation,
    evidence_refs: refs,
    hook_log_ref: { path: hookLogPath, line: hookLogLine },
    source: { kind: "cursor_hook", hook_event: hook },
  };
}

function evidenceRefsFor(record: HookRecord, hook: string): string[] {
  const details = (nested(record, ["normalized", "details"]) ?? {}) as Record<string, unknown>;
  switch (hook) {
    case "postToolUse": {
      const name = String(details["tool_name"] ?? "").trim();
      return name ? [`tool:${name}`] : [];
    }
    case "afterShellExecution": {
      const command = String(details["command"] ?? "");
      const normalized = command.trim().replace(/\s+/g, " ");
      if (!normalized) return [];
      const digest = crypto.createHash("sha256").update(normalized).digest("hex");
      return [`shell:sha256:${digest}`];
    }
    case "afterMCPExecution": {
      const original = (record["original"] ?? {}) as Record<string, unknown>;
      let server = String(original["mcp_server"] ?? "").trim();
      if (!server) server = String(original["server"] ?? "").trim();
      const tool = String(details["tool_name"] ?? "").trim();
      if (!server || !tool) return [];
      return [`mcp:${server}.${tool}`];
    }
    default:
      return [];
  }
}

function appendRow(ledgerPath: string, row: Record<string, unknown>): void {
  fs.mkdirSync(path.dirname(ledgerPath), { recursive: true });
  fs.appendFileSync(ledgerPath, `${JSON.stringify(row)}\n`, "utf8");
}

function nested(record: HookRecord, keys: string[]): unknown {
  let cur: unknown = record;
  for (const key of keys) {
    if (cur === null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur;
}

function nestedString(record: HookRecord, keys: string[]): string {
  const value = nested(record, keys);
  return typeof value === "string" ? value : "";
}

export function runAdherenceAppendCli(argv: string[]): number {
  try {
    const options = { hookLogPath: "/tmp/hook.yaml", hookLogLine: 1 };
    let payloadPath: string | undefined;
    let markerPath: string | undefined;
    const args = [...argv];

    while (args.length > 0) {
      const arg = args.shift();
      if (arg === undefined) break;
      switch (arg) {
        case "--marker":
          markerPath = args.shift();
          break;
        case "--hook-log-path":
          options.hookLogPath = args.shift() ?? options.hookLogPath;
          break;
        case "--hook-log-line":
          options.hookLogLine = Number(args.shift() ?? options.hookLogLine);
          break;
        case "--payload":
          payloadPath = args.shift();
          break;
        default:
          payloadPath ??= arg;
      }
    }

    let payloadText: string;
    if (payloadPath && fs.existsSync(payloadPath)) {
      payloadText = fs.readFileSync(payloadPath, "utf8");
    } else {
      payloadText = fs.readFileSync(0, "utf8");
    }

    const payload = JSON.parse(payloadText) as HookRecord;

    if (markerPath && fs.existsSync(markerPath)) {
      const marker = JSON.parse(fs.readFileSync(markerPath, "utf8")) as Record<string, unknown>;
      payload["active_turn"] = {
        marker_path: markerPath,
        request_token: marker["request_token"],
      };
      if (marker["workspace_root"] && !payload["workspace_roots"]) {
        payload["workspace_roots"] = [marker["workspace_root"]];
      }
    }

    callAdherenceAppendActionAttempted(payload, options);
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`DIAGNOSTIC: adherence_append_action_attempted cli: ${message}`);
    return 0;
  }
}
