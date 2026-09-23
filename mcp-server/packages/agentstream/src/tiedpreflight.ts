/**
 * [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-GOAGENT-CLI-CONFIG]
 * Static tied-yaml MCP preflight — TS port of tools/agentstream/tiedpreflight.
 */
import fs from "node:fs";
import path from "node:path";

export const ERR_NOT_FOUND = "tiedpreflight: no .cursor/mcp.json found under workspace";

export class ErrAmbiguous extends Error {
  readonly paths: string[];

  constructor(paths: string[]) {
    super(
      `tiedpreflight: multiple .cursor/mcp.json files under workspace; pass --mcp-json PATH:\n  ${paths.join("\n  ")}`,
    );
    this.name = "ErrAmbiguous";
    this.paths = paths;
  }
}

export const Status = {
  OK: 0,
  Warning: 1,
  Blocked: 2,
} as const;

export type Status = (typeof Status)[keyof typeof Status];

export const RuntimeMCPNotice =
  "agentstream cannot verify that Cursor exposes the tied-yaml MCP server for this workspace; enable tied-yaml in Cursor if agents should edit project TIED YAML via MCP.";

export type PreflightResult = {
  mcpJsonPath: string;
  tiedBasePath: string;
  status: Status;
  errors: string[];
  warnings: string[];
  runtimeNotice: string;
};

type McpFile = {
  mcpServers?: Record<string, unknown>;
};

type TiedYamlServer = {
  env?: Record<string, string>;
  args?: string[];
};

export function locateMcpJson(workspace: string, override: string): string {
  const ws = path.resolve(workspace);
  if (override.trim() !== "") {
    const p = path.resolve(override);
    let st: fs.Stats;
    try {
      st = fs.statSync(p);
    } catch (err) {
      throw new Error(`tiedpreflight: --mcp-json not readable: ${String(err)}`);
    }
    if (st.isDirectory()) {
      throw new Error(
        `tiedpreflight: --mcp-json is a directory, expected a file: ${p}`,
      );
    }
    return p;
  }

  const root = path.join(ws, ".cursor", "mcp.json");
  try {
    const st = fs.statSync(root);
    if (!st.isDirectory()) {
      return root;
    }
  } catch {
    // fall through
  }

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(ws, { withFileTypes: true });
  } catch (err) {
    throw err;
  }

  const matches: string[] = [];
  for (const ent of entries) {
    if (!ent.isDirectory()) {
      continue;
    }
    const candidate = path.join(ws, ent.name, ".cursor", "mcp.json");
    try {
      const st = fs.statSync(candidate);
      if (!st.isDirectory()) {
        matches.push(candidate);
      }
    } catch {
      // skip
    }
  }

  if (matches.length === 0) {
    throw new Error(ERR_NOT_FOUND);
  }
  if (matches.length === 1) {
    return matches[0]!;
  }
  throw new ErrAmbiguous(matches.sort());
}

function resolveSymlinkSafe(p: string): string {
  try {
    return fs.realpathSync.native(p);
  } catch {
    return path.resolve(p);
  }
}

function isOutsideWorkspace(workspaceAbs: string, targetAbs: string): boolean {
  const rel = path.relative(workspaceAbs, targetAbs);
  return rel === ".." || rel.startsWith(`..${path.sep}`);
}

export function analyze(workspace: string, mcpJsonPath: string): PreflightResult {
  const ws = path.resolve(workspace);
  const res: PreflightResult = {
    mcpJsonPath,
    tiedBasePath: "",
    status: Status.OK,
    errors: [],
    warnings: [],
    runtimeNotice: RuntimeMCPNotice,
  };

  let data: string;
  try {
    data = fs.readFileSync(mcpJsonPath, "utf8");
  } catch (err) {
    res.status = Status.Blocked;
    res.errors.push(`read mcp.json: ${String(err)}`);
    return res;
  }

  let root: McpFile;
  try {
    root = JSON.parse(data) as McpFile;
  } catch (err) {
    res.status = Status.Blocked;
    res.errors.push(`parse mcp.json: ${String(err)}`);
    return res;
  }

  if (!root.mcpServers || typeof root.mcpServers !== "object") {
    res.status = Status.Blocked;
    res.errors.push("mcp.json has no mcpServers object");
    return res;
  }

  const raw = root.mcpServers["tied-yaml"];
  if (raw === undefined || raw === null) {
    res.status = Status.Blocked;
    res.errors.push(
      'mcpServers["tied-yaml"] is missing; add it in .cursor/mcp.json (copy_files.sh installs .cursor/skills/tied-yaml only; it does not create mcp.json)',
    );
    return res;
  }

  let srv: TiedYamlServer;
  try {
    srv = raw as TiedYamlServer;
    if (typeof srv !== "object") {
      throw new Error("not an object");
    }
  } catch (err) {
    res.status = Status.Blocked;
    res.errors.push(`parse tied-yaml server entry: ${String(err)}`);
    return res;
  }

  const base = (srv.env?.TIED_BASE_PATH ?? "").trim();
  if (base === "") {
    res.status = Status.Blocked;
    res.errors.push("tied-yaml env.TIED_BASE_PATH is missing or empty");
    return res;
  }

  res.tiedBasePath = base;

  if (!path.isAbsolute(base)) {
    res.status = Status.Blocked;
    res.errors.push(
      `TIED_BASE_PATH must be absolute (got ${JSON.stringify(base)}); see TIED docs for .cursor/mcp.json`,
    );
    return res;
  }

  const wAbs = resolveSymlinkSafe(ws);
  let tAbs: string;
  try {
    tAbs = resolveSymlinkSafe(path.resolve(base));
  } catch (err) {
    res.status = Status.Blocked;
    res.errors.push(`TIED_BASE_PATH does not resolve: ${String(err)}`);
    return res;
  }

  if (isOutsideWorkspace(wAbs, tAbs)) {
    res.status = Status.Blocked;
    res.errors.push(
      `TIED_BASE_PATH (${tAbs}) is outside --workspace (${wAbs}); MCP writes may target the wrong repo`,
    );
    return res;
  }

  const req = path.join(tAbs, "requirements.yaml");
  try {
    const st = fs.statSync(req);
    if (st.isDirectory()) {
      throw new Error("is directory");
    }
  } catch {
    res.warnings.push(
      "no readable tied/requirements.yaml at TIED_BASE_PATH (greenfield or partial bootstrap)",
    );
    if (res.status === Status.OK) {
      res.status = Status.Warning;
    }
  }

  if (res.status === Status.OK && res.warnings.length > 0) {
    res.status = Status.Warning;
  }

  return res;
}

export function run(
  workspace: string,
  mcpJsonOverride: string,
): PreflightResult {
  const mcpPath = locateMcpJson(workspace, mcpJsonOverride);
  return analyze(workspace, mcpPath);
}
