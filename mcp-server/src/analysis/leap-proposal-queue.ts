/**
 * Optional inferred LEAP proposal queue: non-canonical suggestions with stable ids.
 * Stored under project root (not under tied/). Reject/approve never writes TIED YAML;
 * apply LEAP updates only via explicit MCP yaml tools after human/agent approval.
 * [REQ-LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [IMPL-MCP_LEAP_PROPOSAL_QUEUE]
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

import type { PlumbDiffImpactPreviewSelection } from "./plumb-diff-impact-preview.js";

export const LEAP_PROPOSAL_QUEUE_SCHEMA = "leap-proposal-queue.v1";
export const LEAP_PROPOSAL_AUDIT_SCHEMA = "leap-proposal-audit.v1";

export type LeapProposalKind = "inferred_diff" | "inferred_session" | "manual";
export type LeapProposalStatus = "pending" | "rejected" | "approved" | "applied";

export type LeapProposalSource =
  | { type: "git_diff"; selection: PlumbDiffImpactPreviewSelection; paths?: string[] }
  | { type: "session_export"; label?: string }
  | { type: "manual" };

export interface LeapProposal {
  id: string;
  kind: LeapProposalKind;
  status: LeapProposalStatus;
  /** Always true: proposals are not canonical REQ/ARCH/IMPL records. */
  non_canonical: true;
  title: string;
  summary: string;
  source: LeapProposalSource;
  suggested_leap_order?: "impl" | "arch" | "req" | "mixed";
  created_at: string;
  updated_at: string;
  rejection_reason?: string;
  approval_note?: string;
  /** Optional structured hints for a human/agent applying LEAP via MCP (never auto-applied). */
  leap_hints?: Record<string, unknown>;
}

export interface LeapProposalQueueFile {
  schema_version: typeof LEAP_PROPOSAL_QUEUE_SCHEMA;
  proposals: LeapProposal[];
}

export type LeapProposalAuditEvent =
  | {
      schema_version: typeof LEAP_PROPOSAL_AUDIT_SCHEMA;
      timestamp: string;
      action: "add" | "reject" | "approve" | "mark_applied" | "update" | "extract_batch";
      proposal_id: string;
      status_after?: LeapProposalStatus;
      detail?: Record<string, unknown>;
    };

// --- paths

export function getLeapProposalDir(projectRoot: string): string {
  return path.join(projectRoot, "leap-proposals");
}

export function getQueuePath(projectRoot: string): string {
  return path.join(getLeapProposalDir(projectRoot), "queue.json");
}

export function getAuditLogPath(projectRoot: string): string {
  return path.join(getLeapProposalDir(projectRoot), "audit-log.jsonl");
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// --- ids (stable within queue; globally unique via random suffix)

export function generateProposalId(): string {
  const t = new Date().toISOString().replace(/[:.]/g, "-");
  const r = crypto.randomBytes(6).toString("hex");
  return `lp-${t}-${r}`;
}

// --- queue load/save

export function loadQueue(projectRoot: string): LeapProposalQueueFile {
  const p = getQueuePath(projectRoot);
  if (!fs.existsSync(p)) {
    return { schema_version: LEAP_PROPOSAL_QUEUE_SCHEMA, proposals: [] };
  }
  try {
    const raw = fs.readFileSync(p, "utf8");
    const data = JSON.parse(raw) as unknown;
    if (
      data !== null &&
      typeof data === "object" &&
      !Array.isArray(data) &&
      (data as LeapProposalQueueFile).schema_version === LEAP_PROPOSAL_QUEUE_SCHEMA &&
      Array.isArray((data as LeapProposalQueueFile).proposals)
    ) {
      return data as LeapProposalQueueFile;
    }
  } catch (e) {
    console.error(
      "DIAGNOSTIC: leap-proposals queue.json parse or schema mismatch; using empty queue.",
      e instanceof Error ? e.message : e
    );
  }
  return { schema_version: LEAP_PROPOSAL_QUEUE_SCHEMA, proposals: [] };
}

export function saveQueue(projectRoot: string, queue: LeapProposalQueueFile): void {
  ensureDir(getLeapProposalDir(projectRoot));
  const p = getQueuePath(projectRoot);
  fs.writeFileSync(p, JSON.stringify(queue, null, 2), "utf8");
}

export function appendAudit(projectRoot: string, event: Omit<LeapProposalAuditEvent, "schema_version" | "timestamp"> & { timestamp?: string }): void {
  ensureDir(getLeapProposalDir(projectRoot));
  const line: LeapProposalAuditEvent = {
    schema_version: LEAP_PROPOSAL_AUDIT_SCHEMA,
    timestamp: event.timestamp ?? new Date().toISOString(),
    ...event,
  };
  fs.appendFileSync(getAuditLogPath(projectRoot), `${JSON.stringify(line)}\n`, "utf8");
}

function nowIso(): string {
  return new Date().toISOString();
}

export function findProposal(queue: LeapProposalQueueFile, id: string): LeapProposal | undefined {
  return queue.proposals.find((p) => p.id === id);
}

export function addProposal(
  projectRoot: string,
  partial: Omit<LeapProposal, "id" | "status" | "created_at" | "updated_at" | "non_canonical">
): LeapProposal {
  const queue = loadQueue(projectRoot);
  const id = generateProposalId();
  const ts = nowIso();
  const proposal: LeapProposal = {
    ...partial,
    id,
    status: "pending",
    non_canonical: true,
    created_at: ts,
    updated_at: ts,
  };
  queue.proposals.push(proposal);
  saveQueue(projectRoot, queue);
  appendAudit(projectRoot, { action: "add", proposal_id: id, status_after: "pending", detail: { kind: proposal.kind } });
  return proposal;
}

export function rejectProposal(projectRoot: string, id: string, reason?: string): { ok: boolean; error?: string; proposal?: LeapProposal } {
  const queue = loadQueue(projectRoot);
  const p = findProposal(queue, id);
  if (!p) return { ok: false, error: `No proposal: ${id}` };
  if (p.status !== "pending") {
    return { ok: false, error: `Reject allowed only for pending proposals; status is ${p.status}` };
  }
  p.status = "rejected";
  p.updated_at = nowIso();
  if (reason !== undefined) p.rejection_reason = reason;
  saveQueue(projectRoot, queue);
  appendAudit(projectRoot, {
    action: "reject",
    proposal_id: id,
    status_after: "rejected",
    detail: reason ? { reason } : undefined,
  });
  return { ok: true, proposal: p };
}

export function approveProposal(projectRoot: string, id: string, note?: string): { ok: boolean; error?: string; proposal?: LeapProposal } {
  const queue = loadQueue(projectRoot);
  const p = findProposal(queue, id);
  if (!p) return { ok: false, error: `No proposal: ${id}` };
  if (p.status !== "pending") {
    return { ok: false, error: `Cannot approve from status ${p.status}` };
  }
  p.status = "approved";
  p.updated_at = nowIso();
  if (note !== undefined) p.approval_note = note;
  saveQueue(projectRoot, queue);
  appendAudit(projectRoot, {
    action: "approve",
    proposal_id: id,
    status_after: "approved",
    detail: note ? { note } : undefined,
  });
  return { ok: true, proposal: p };
}

export function markApplied(projectRoot: string, id: string): { ok: boolean; error?: string; proposal?: LeapProposal } {
  const queue = loadQueue(projectRoot);
  const p = findProposal(queue, id);
  if (!p) return { ok: false, error: `No proposal: ${id}` };
  if (p.status !== "approved") {
    return { ok: false, error: `mark_applied requires status approved, got ${p.status}` };
  }
  p.status = "applied";
  p.updated_at = nowIso();
  saveQueue(projectRoot, queue);
  appendAudit(projectRoot, { action: "mark_applied", proposal_id: id, status_after: "applied" });
  return { ok: true, proposal: p };
}

export function updatePendingProposal(
  projectRoot: string,
  id: string,
  fields: { title?: string; summary?: string; leap_hints?: Record<string, unknown> }
): { ok: boolean; error?: string; proposal?: LeapProposal } {
  const queue = loadQueue(projectRoot);
  const p = findProposal(queue, id);
  if (!p) return { ok: false, error: `No proposal: ${id}` };
  if (p.status !== "pending") {
    return { ok: false, error: `Edit allowed only in pending status, got ${p.status}` };
  }
  if (fields.title !== undefined) p.title = fields.title;
  if (fields.summary !== undefined) p.summary = fields.summary;
  if (fields.leap_hints !== undefined) p.leap_hints = fields.leap_hints;
  p.updated_at = nowIso();
  saveQueue(projectRoot, queue);
  appendAudit(projectRoot, {
    action: "update",
    proposal_id: id,
    status_after: "pending",
    detail: { fields: Object.keys(fields) },
  });
  return { ok: true, proposal: p };
}

export function listProposals(projectRoot: string, filter?: { status?: LeapProposalStatus }): LeapProposal[] {
  const q = loadQueue(projectRoot);
  if (!filter?.status) return [...q.proposals];
  return q.proposals.filter((p) => p.status === filter.status);
}

// --- deterministic git diff line extraction (no LLM / no network)

function gitTopLevel(projectCwd: string): string {
  try {
    const raw = execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd: projectCwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return raw.trim();
  } catch {
    return projectCwd;
  }
}

function gitNameOnly(args: { staged: boolean; cwd: string }): string[] {
  const diffArgs = args.staged
    ? ["diff", "--cached", "--name-only", "--diff-filter=ACMRTUB", "--no-renames"]
    : ["diff", "--name-only", "--diff-filter=ACMRTUB", "--no-renames"];
  const raw = execFileSync("git", diffArgs, {
    cwd: args.cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  return raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .sort();
}

function gitPatchForFile(args: { staged: boolean; cwd: string; fileRel: string }): string {
  const baseArgs = args.staged
    ? ["diff", "--cached", "--no-color", "--unified=3", "--", args.fileRel]
    : ["diff", "--no-color", "--unified=3", "--", args.fileRel];
  return execFileSync("git", baseArgs, {
    cwd: args.cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
}

function isBinaryDiffPatch(patch: string): boolean {
  return patch.includes("GIT binary patch") || patch.includes("Binary files");
}

function gitRelativePath(projectRootAbs: string, filePath: string): string | null {
  const abs = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
  const rel = path.relative(projectRootAbs, abs);
  if (rel.startsWith("..") || path.isAbsolute(rel)) return null;
  return rel.split(path.sep).join("/");
}

function lineLooksLikeAddedContent(line: string): boolean {
  const t = line.trim();
  if (t.length < 4) return false;
  // Skip pure token reference lines (documentation tokens only — still not canonical proposals)
  if (/^\[(REQ-|ARCH-|IMPL-)[^\]]+\]\s*$/.test(t)) return false;
  return true;
}

export type ExtractDiffProposalsArgs = {
  projectRoot?: string;
  selection?: PlumbDiffImpactPreviewSelection;
  paths?: string[];
  max_files?: number;
  max_patch_bytes?: number;
  max_total_patch_bytes?: number;
  max_proposals?: number;
};

export type ExtractDiffProposalsResult = {
  candidates: Array<{
    file: string;
    line_text: string;
    title: string;
    summary: string;
  }>;
  truncation: { files_truncated: boolean; patch_bytes_truncated: boolean; notice?: string };
  /** Set when git or IO fails; candidates empty and no proposals should be inferred from this run. */
  error?: string;
};

/**
 * Deterministic extraction: added (+) diff lines as documentation proposal candidates.
 * Does not persist; caller may add via addProposal.
 * On git/IO failure returns empty candidates and `error` (no throw).
 */
export function extractDiffProposalCandidates(args: ExtractDiffProposalsArgs): ExtractDiffProposalsResult {
  try {
    return extractDiffProposalCandidatesInner(args);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("DIAGNOSTIC: extractDiffProposalCandidates failed:", msg);
    return {
      candidates: [],
      truncation: {
        files_truncated: false,
        patch_bytes_truncated: false,
        notice: `extraction aborted: ${msg}`,
      },
      error: msg,
    };
  }
}

function extractDiffProposalCandidatesInner(args: ExtractDiffProposalsArgs): ExtractDiffProposalsResult {
  const projectRootAbs = args.projectRoot ? path.resolve(args.projectRoot) : gitTopLevel(process.cwd());
  const selection = args.selection ?? "both";
  const maxFiles = args.max_files ?? 200;
  const maxPatchBytes = args.max_patch_bytes ?? 250_000;
  const maxTotalPatchBytes = args.max_total_patch_bytes ?? 2_000_000;
  const maxProposals = args.max_proposals ?? 40;

  const stagedHit = selection === "staged" || selection === "both";
  const unstagedHit = selection === "unstaged" || selection === "both";
  const stagedFiles = stagedHit ? gitNameOnly({ staged: true, cwd: projectRootAbs }) : [];
  const unstagedFiles = unstagedHit ? gitNameOnly({ staged: false, cwd: projectRootAbs }) : [];
  const stagedSet = new Set(stagedFiles);
  const unstagedSet = new Set(unstagedFiles);
  const allDiffFiles = Array.from(new Set([...stagedFiles, ...unstagedFiles])).sort();

  let explicitRelPaths: string[] | null = null;
  if (args.paths && args.paths.length > 0) {
    explicitRelPaths = args.paths
      .map((p) => gitRelativePath(projectRootAbs, p))
      .filter((p): p is string => p !== null);
  }

  const candidateFiles = explicitRelPaths ?? allDiffFiles;
  const filesTruncated = candidateFiles.length > maxFiles;
  const truncatedCandidateFiles = filesTruncated ? candidateFiles.slice(0, maxFiles) : candidateFiles;

  const candidates: ExtractDiffProposalsResult["candidates"] = [];
  const seen = new Set<string>();
  let totalPatchBytes = 0;
  let patchBytesTruncated = false;

  outer: for (const fileRel of truncatedCandidateFiles) {
    if (candidates.length >= maxProposals) break;

    const selectionHit: Array<"staged" | "unstaged"> = [];
    if (stagedSet.has(fileRel)) selectionHit.push("staged");
    if (unstagedSet.has(fileRel)) selectionHit.push("unstaged");

    for (const mode of selectionHit) {
      if (candidates.length >= maxProposals) break outer;
      const patch = gitPatchForFile({ staged: mode === "staged", cwd: projectRootAbs, fileRel });
      if (patch.trim().length === 0) continue;
      if (isBinaryDiffPatch(patch)) continue;

      const pb = Buffer.byteLength(patch, "utf8");
      totalPatchBytes += pb;
      if (totalPatchBytes > maxTotalPatchBytes) {
        patchBytesTruncated = true;
        break outer;
      }

      const patchSlice = pb > maxPatchBytes ? patch.slice(0, maxPatchBytes) : patch;
      if (pb > maxPatchBytes) patchBytesTruncated = true;

      const lines = patchSlice.split(/\r?\n/);
      for (const line of lines) {
        if (candidates.length >= maxProposals) break outer;
        if (!line.startsWith("+") || line.startsWith("+++")) continue;
        const content = line.slice(1);
        const trimmed = content.replace(/\s+$/, "");
        if (!lineLooksLikeAddedContent(trimmed)) continue;

        const dedupeKey = `${fileRel}|${trimmed}`;
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);

        const title =
          trimmed.length > 120 ? `${trimmed.slice(0, 117)}...` : trimmed;
        const summary = [
          `Added line in \`${fileRel}\` (${mode}).`,
          "",
          "Consider documenting this behavior in IMPL → ARCH → REQ order if it changes traceability.",
          "",
          "```text",
          trimmed,
          "```",
        ].join("\n");

        candidates.push({
          file: fileRel,
          line_text: trimmed,
          title: `Doc hint: ${title}`,
          summary,
        });
      }
    }
  }

  const noticeParts: string[] = [];
  if (filesTruncated) noticeParts.push(`File list truncated at ${maxFiles} files.`);
  if (patchBytesTruncated) noticeParts.push("Patch byte budget exceeded; extraction stopped early.");

  return {
    candidates,
    truncation: {
      files_truncated: filesTruncated,
      patch_bytes_truncated: patchBytesTruncated,
      notice: noticeParts.length ? noticeParts.join(" ") : undefined,
    },
  };
}


/**
 * Split session export text into proposal-shaped segments (deterministic, no LLM).
 */
export function parseSessionExportSegments(raw: string, maxSegments: number = 25): string[] {
  const t = raw.trim();
  if (!t) return [];

  const tryJson = (): string[] | null => {
    try {
      const v = JSON.parse(t) as unknown;
      if (Array.isArray(v)) {
        const out: string[] = [];
        for (const item of v) {
          if (out.length >= maxSegments) break;
          if (item !== null && typeof item === "object" && !Array.isArray(item)) {
            const o = item as Record<string, unknown>;
            const content =
              typeof o.content === "string"
                ? o.content
                : typeof o.text === "string"
                  ? o.text
                  : JSON.stringify(o);
            if (content.trim()) out.push(content.trim());
          } else if (typeof item === "string" && item.trim()) {
            out.push(item.trim());
          }
        }
        return out.length ? out : null;
      }
      if (v !== null && typeof v === "object" && !Array.isArray(v)) {
        const o = v as Record<string, unknown>;
        if (typeof o.messages === "string") {
          return o.messages.split(/\n---\n/).map((s) => s.trim()).filter(Boolean).slice(0, maxSegments);
        }
      }
    } catch {
      /* not JSON */
    }
    return null;
  };

  const fromJson = tryJson();
  if (fromJson && fromJson.length) return fromJson;

  return t
    .split(/\n---\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2)
    .slice(0, maxSegments);
}

/**
 * PROPOSALS_FROM_SESSION_SEGMENTS — [REQ-LEAP_PROPOSAL_QUEUE] [ARCH-LEAP_PROPOSAL_QUEUE] [IMPL-MCP_LEAP_PROPOSAL_QUEUE]
 * Maps each segment to inferred_session proposal; trims segment text for summary (aligned with PARSE_SESSION_EXPORT_SEGMENTS trimming).
 */
export function proposalsFromSessionSegments(
  segments: string[],
  label?: string
): Array<Omit<LeapProposal, "id" | "status" | "created_at" | "updated_at" | "non_canonical">> {
  return segments.map((text, i) => {
    const summary = text.trim();
    return {
      kind: "inferred_session" as const,
      title: `Session segment ${i + 1}${label ? ` (${label})` : ""}`,
      summary,
      source: { type: "session_export" as const, label },
      suggested_leap_order: "mixed",
      leap_hints: { segment_index: i },
    };
  });
}
