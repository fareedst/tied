/**
 * MCP tool handlers for TIED YAML index operations.
 */

import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import yaml from "js-yaml";
import { textContent } from "../types.js";
import {
  loadIndex,
  getRecord,
  listTokens,
  filterByField,
  validateIndex,
  getDecisionsForRequirement,
  getRequirementsForDecision,
  insertRecord,
  updateRecord,
  upsertRecord,
  getBasePath,
  type IndexName,
} from "../yaml-loader.js";
import {
  getDetailPath,
  loadDetail,
  listDetailTokens,
  writeDetail,
  updateDetail,
  deleteDetail,
  appendImplementationApproachDetails,
} from "../detail-loader.js";
import { writeCitdpRecord } from "../citdp-writer.js";
import { validateConsistency } from "../consistency-validator.js";
import {
  loadFeedback,
  appendEntry,
  exportMarkdown,
  exportJson,
  buildReportSnippet,
  type FeedbackType,
} from "../feedback.js";
import { renameSemanticToken } from "../token-rename.js";
import { parseRecordOrYaml } from "../parse-content.js";
import {
  buildRequirementGraph,
  buildImplementationGraph,
  findCycles,
  topologicalSort,
  getBacklogView,
  getRequirementStatusAndPriority,
} from "../dependency-graph.js";
import { updateStatusFromPassedTokens } from "../verify.js";
import { applyYamlUpdates, parseYamlUpdateSteps } from "../yaml-updates-apply.js";
import { resolveRequirementListStateGuide } from "./requirement-list-state-guide.js";
import { runScopedAnalysis } from "../analysis/scoped-analysis.js";
import { runPlumbDiffImpactPreview } from "../analysis/plumb-diff-impact-preview.js";
import { readTextFromPseudocodePath, resolvePseudocodePathUnderTiedBase } from "../impl-pseudocode-input.js";
import {
  addProposal,
  approveProposal,
  extractDiffProposalCandidates,
  listProposals,
  loadQueue,
  markApplied,
  parseSessionExportSegments,
  proposalsFromSessionSegments,
  rejectProposal,
  updatePendingProposal,
} from "../analysis/leap-proposal-queue.js";

/** LEAP proposal MCP tools: JSON envelope; catch sync throws from fs/git. [REQ-LEAP_PROPOSAL_QUEUE] */
function leapMcpJson(payload: unknown) {
  return textContent(JSON.stringify(payload, null, 2));
}

function safeLeapCall<T>(fn: () => T) {
  try {
    return leapMcpJson(fn());
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return leapMcpJson({ ok: false, error: msg });
  }
}

const INDEX_ENUM = z.enum([
  "requirements",
  "architecture",
  "implementation",
  "semantic-tokens",
]);
const TOKEN_TYPE_ENUM = z.enum(["REQ", "ARCH", "IMPL", "PROC"]);
const DETAIL_TYPE_ENUM = z.enum(["requirement", "architecture", "implementation"]);

export const allTools = [
  {
    name: "yaml_index_read",
    config: {
      description:
        "Read an entire YAML index or a specific record by token. Use index to choose which file (requirements, architecture, implementation, semantic-tokens). Optionally pass token to get a single record. Index rows do not include IMPL essence_pseudocode (detail-only field); use yaml_detail_read for pseudo-code bodies. Use with MCP write tools to update TIED data instead of editing YAML files by hand.",
      inputSchema: z.object({
        index: INDEX_ENUM.describe(
          "Which YAML index: requirements, architecture, implementation, or semantic-tokens"
        ),
        token: z
          .string()
          .optional()
          .describe("Optional token ID (e.g. REQ-TIED_SETUP) to fetch a single record"),
      }),
    },
    handler: async ({
      index,
      token,
    }: {
      index: string;
      token?: string;
    }) => {
      const idx = index as IndexName;
      if (token) {
        const record = getRecord(idx, token);
        if (record == null) return textContent(`No record found for token: ${token}`);
        return textContent(JSON.stringify(record, null, 2));
      }
      const data = loadIndex(idx);
      if (!data) return textContent(`Could not load index: ${index}`);
      return textContent(JSON.stringify(data, null, 2));
    },
  },
  {
    name: "yaml_index_list_tokens",
    config: {
      description:
        "List all tokens in a YAML index. For semantic-tokens index, optionally filter by type (REQ, ARCH, IMPL, PROC).",
      inputSchema: z.object({
        index: INDEX_ENUM.describe("Which YAML index to list tokens from"),
        type: TOKEN_TYPE_ENUM.optional().describe(
          "For semantic-tokens only: filter by token type (REQ, ARCH, IMPL, PROC)"
        ),
      }),
    },
    handler: async ({
      index,
      type,
    }: {
      index: string;
      type?: string;
    }) => {
      const idx = index as IndexName;
      let tokens = listTokens(idx);
      if (idx === "semantic-tokens" && type) {
        const data = loadIndex("semantic-tokens");
        if (data)
          tokens = Object.entries(data)
            .filter(
              ([, r]) =>
                typeof r === "object" &&
                r !== null &&
                (r as Record<string, unknown>).type === type
            )
            .map(([k]) => k);
      }
      return textContent(JSON.stringify(tokens, null, 2));
    },
  },
  {
    name: "yaml_index_filter",
    config: {
      description:
        "Filter records in a YAML index by a top-level field value (e.g. status, type).",
      inputSchema: z.object({
        index: INDEX_ENUM.describe("Which YAML index to filter"),
        field: z.string().describe("Field name (e.g. status, type)"),
        value: z.string().describe("Value to match (e.g. Active, Implemented)"),
      }),
    },
    handler: async ({
      index,
      field,
      value,
    }: { index: string; field: string; value: string }) => {
      const idx = index as IndexName;
      const filtered = filterByField(idx, field, value);
      return textContent(JSON.stringify(filtered, null, 2));
    },
  },
  {
    name: "yaml_index_validate",
    config: {
      description:
        "Validate YAML syntax of TIED index files. Returns valid/invalid per file.",
      inputSchema: z.object({}),
    },
    handler: async () => {
      const results: Record<string, { valid: boolean; error?: string }> = {};
      for (const name of [
        "requirements",
        "architecture",
        "implementation",
        "semantic-tokens",
      ] as const) {
        results[name] = validateIndex(name);
      }
      return textContent(JSON.stringify(results, null, 2));
    },
  },
  {
    name: "tied_validate_consistency",
    config: {
      description:
        "Validate TIED index and detail YAML consistency: token existence, REQ→ARCH→IMPL traceability, detail file content, and IMPL essence_pseudocode token refs. When include_pseudocode is true, non-empty essence_pseudocode without any [REQ-], [ARCH-], or [IMPL-] token comments is reported as missing_token_comments and fails the report ([PROC-IMPL_PSEUDOCODE_TOKENS]). Returns a structured report with index syntax, index_tokens, token_references, traceability, detail_files, and pseudocode sections. Use before marking work complete to ensure every referenced token has an existing record and IMPL pseudo-code has token comments.",
      inputSchema: z.object({
        include_detail_files: z
          .boolean()
          .optional()
          .default(true)
          .describe("Validate detail YAML existence and content (token refs)"),
        include_pseudocode: z
          .boolean()
          .optional()
          .default(true)
          .describe("Validate IMPL essence_pseudocode presence and token refs inside it"),
        require_detail_record: z
          .boolean()
          .optional()
          .default(true)
          .describe("Treat referenced tokens as invalid when they lack an index record (and optionally a detail file)"),
      }),
    },
    handler: async ({
      include_detail_files,
      include_pseudocode,
      require_detail_record,
    }: {
      include_detail_files?: boolean;
      include_pseudocode?: boolean;
      require_detail_record?: boolean;
    }) => {
      const report = validateConsistency({
        include_detail_files,
        include_pseudocode,
        require_detail_record,
      });
      return textContent(JSON.stringify(report, null, 2));
    },
  },
  {
    name: "tied_config_get_base_path",
    config: {
      description:
        "Return the effective TIED base path used by the server (resolved from TIED_BASE_PATH env or default 'tied'). Use to inspect current configuration.",
      inputSchema: z.object({}),
    },
    handler: async () => {
      const base_path = getBasePath();
      const env_TIED_BASE_PATH = process.env.TIED_BASE_PATH ?? null;
      return textContent(
        JSON.stringify({ base_path, env_TIED_BASE_PATH }, null, 2)
      );
    },
  },
  {
    name: "get_decisions_for_requirement",
    config: {
      description:
        "Get all architecture and implementation decisions that reference a requirement token (e.g. REQ-TIED_SETUP). Returns ARCH and IMPL records.",
      inputSchema: z.object({
        requirement_token: z
          .string()
          .describe("Requirement token (e.g. REQ-TIED_SETUP)"),
      }),
    },
    handler: async ({
      requirement_token,
    }: { requirement_token: string }) => {
      const result = getDecisionsForRequirement(requirement_token);
      return textContent(JSON.stringify(result, null, 2));
    },
  },
  {
    name: "get_requirements_for_decision",
    config: {
      description:
        "Get all requirement tokens and full requirement records that an architecture or implementation decision references (e.g. ARCH-TIED_STRUCTURE or IMPL-MODULE_VALIDATION).",
      inputSchema: z.object({
        decision_token: z
          .string()
          .describe(
            "Architecture or implementation token (e.g. ARCH-TIED_STRUCTURE, IMPL-MODULE_VALIDATION)"
          ),
      }),
    },
    handler: async ({ decision_token }: { decision_token: string }) => {
      const result = getRequirementsForDecision(decision_token);
      return textContent(JSON.stringify(result, null, 2));
    },
  },
  {
    name: "yaml_index_insert",
    config: {
      description:
        "Insert a new record into a YAML index. Fails if the token already exists. Record must be a JSON object (nested allowed). Writes to the index file (e.g. tied/requirements.yaml). Prefer this over editing tied/*.yaml directly; the server emits valid YAML (e.g. quoting values with colons).",
      inputSchema: z.object({
        index: INDEX_ENUM.describe(
          "Which YAML index: requirements, architecture, implementation, or semantic-tokens"
        ),
        token: z.string().describe("Token ID for the new record (e.g. REQ-NEW_FEATURE)"),
        record: z
          .string()
          .describe("JSON or YAML string of the record object (e.g. {\"name\": \"...\", \"status\": \"Planned\"})"),
      }),
    },
    handler: async ({
      index,
      token,
      record: recordJson,
    }: {
      index: string;
      token: string;
      record: string;
    }) => {
      const parsed = parseRecordOrYaml(recordJson);
      if (!parsed.ok) return textContent(JSON.stringify({ ok: false, error: parsed.error }));
      const result = insertRecord(index as IndexName, token, parsed.value);
      return textContent(JSON.stringify(result, null, 2));
    },
  },
  {
    name: "yaml_index_update",
    config: {
      description:
        "Update an existing record in a YAML index by merging the given fields into the token row. Top-level keys replace scalars/arrays as usual; nested objects metadata, traceability, related_requirements, related_decisions, rationale, and implementation_approach are merged one level with the existing row (partial metadata preserves metadata.created; when metadata.last_updated is an object on both sides, its sub-keys merge one level). Fails if the token does not exist. Prefer this over editing tied/*.yaml directly; the server emits valid YAML (e.g. quoting values with colons).",
      inputSchema: z.object({
        index: INDEX_ENUM.describe(
          "Which YAML index: requirements, architecture, implementation, or semantic-tokens"
        ),
        token: z.string().describe("Token ID of the record to update"),
        updates: z
          .string()
          .describe("JSON or YAML string of key-value pairs to merge into the record (e.g. {\"status\": \"Implemented\"})"),
      }),
    },
    handler: async ({
      index,
      token,
      updates: updatesJson,
    }: {
      index: string;
      token: string;
      updates: string;
    }) => {
      const parsed = parseRecordOrYaml(updatesJson);
      if (!parsed.ok) return textContent(JSON.stringify({ ok: false, error: parsed.error }));
      const result = updateRecord(index as IndexName, token, parsed.value);
      return textContent(JSON.stringify(result, null, 2));
    },
  },
  {
    name: "yaml_updates_apply",
    config: {
      description:
        "Apply an ordered list of index/detail merges in one Node process using the same merge rules as yaml_index_update and yaml_detail_update. Each step is { kind: \"detail\", token, updates } or { kind: \"index\", index, token, updates } (updates are objects, not JSON strings). Use dry_run: true to get merged_preview per step without writing. On write path, stops on first error (applied_steps is count completed before failure). When dry_run is false, run_validate_consistency defaults true: after all writes, runs tied_validate_consistency and returns ok: false if that report is not ok (writes are not rolled back—re-read and fix). Prefer small step lists and impl_detail_set_essence_pseudocode for large IMPL pseudo-code only.",
      inputSchema: z.object({
        steps: z
          .array(z.record(z.string(), z.unknown()))
          .describe(
            "Ordered steps: { kind: \"detail\", token: \"REQ-X\", updates: { ... } } or { kind: \"index\", index: \"requirements\", token: \"REQ-X\", updates: { ... } }"
          ),
        dry_run: z
          .boolean()
          .optional()
          .default(false)
          .describe("If true, compute merged_preview per step only; no file writes"),
        run_validate_consistency: z
          .boolean()
          .optional()
          .default(true)
          .describe("If true and dry_run is false, run tied_validate_consistency after all steps (default true)"),
      }),
    },
    handler: async (args: {
      steps: Record<string, unknown>[];
      dry_run?: boolean;
      run_validate_consistency?: boolean;
    }) => {
      const parsed = parseYamlUpdateSteps(args.steps);
      if (!parsed.ok) return textContent(JSON.stringify({ ok: false, error: parsed.error }, null, 2));
      const result = applyYamlUpdates({
        steps: parsed.steps,
        dry_run: args.dry_run ?? false,
        run_validate_consistency: args.run_validate_consistency ?? true,
      });
      return textContent(JSON.stringify(result, null, 2));
    },
  },
  {
    name: "yaml_detail_read",
    config: {
      description:
        "Read a single detail YAML file by token (REQ-*, ARCH-*, or IMPL-*). Returns the detail record (the content under the token key). For IMPL-*, essence_pseudocode is null only when absent. Fails if token format is invalid or no detail file exists. Use with MCP write tools to update TIED data instead of editing YAML files by hand.",
      inputSchema: z.object({
        token: z.string().min(1).describe("Token ID (e.g. REQ-TIED_SETUP, ARCH-MODULE_VALIDATION, IMPL-MODULE_VALIDATION)"),
      }),
    },
    handler: async ({ token }: { token: string }) => {
      const record = loadDetail(token);
      if (record == null) {
        const path = getDetailPath(token);
        if (path === null)
          return textContent(JSON.stringify({ error: `Invalid token: ${token}. Must be REQ-*, ARCH-*, or IMPL-*` }, null, 2));
        return textContent(JSON.stringify({ error: `No detail file found for token: ${token}` }, null, 2));
      }
      return textContent(JSON.stringify(record, null, 2));
    },
  },
  {
    name: "yaml_detail_read_many",
    config: {
      description:
        "Read detail YAML for multiple tokens or all tokens of a type. Pass tokens (array of REQ-*, ARCH-*, IMPL-*) and/or type (requirement | architecture | implementation). If only type is passed, returns details for all tokens that have a detail file for that type. Output is keyed by token: each value is either the detail record or { error: string }.",
      inputSchema: z.object({
        tokens: z
          .array(z.string())
          .optional()
          .describe("Optional list of token IDs to load. If omitted, type must be provided."),
        type: DETAIL_TYPE_ENUM.optional().describe(
          "If tokens omitted, load all detail files for this type (requirement, architecture, or implementation)."
        ),
      }),
    },
    handler: async ({
      tokens: tokensParam,
      type,
    }: {
      tokens?: string[];
      type?: string;
    }) => {
      let tokens: string[];
      if (tokensParam != null && tokensParam.length > 0) {
        tokens = tokensParam;
      } else if (type) {
        tokens = listDetailTokens(type as "requirement" | "architecture" | "implementation");
      } else {
        return textContent(
          JSON.stringify({ error: "Provide tokens (array) or type (requirement | architecture | implementation)." }, null, 2)
        );
      }
      const result: Record<string, Record<string, unknown> | { error: string }> = {};
      for (const token of tokens) {
        const record = loadDetail(token);
        if (record != null) {
          result[token] = record;
        } else {
          const path = getDetailPath(token);
          if (path === null) {
            result[token] = { error: `Invalid token: ${token}. Must be REQ-*, ARCH-*, or IMPL-*` };
          } else {
            result[token] = { error: `No detail file found for token: ${token}` };
          }
        }
      }
      return textContent(JSON.stringify(result, null, 2));
    },
  },
  {
    name: "yaml_detail_list",
    config: {
      description:
        "List tokens that have a detail YAML file for the given type (requirement, architecture, or implementation).",
      inputSchema: z.object({
        type: DETAIL_TYPE_ENUM.describe("Which detail type: requirement (REQ-*), architecture (ARCH-*), or implementation (IMPL-*)"),
      }),
    },
    handler: async ({ type }: { type: string }) => {
      const tokens = listDetailTokens(type as "requirement" | "architecture" | "implementation");
      return textContent(JSON.stringify(tokens, null, 2));
    },
  },
  {
    name: "yaml_detail_create",
    config: {
      description:
        "Create a new detail YAML file. Token must be REQ-*, ARCH-*, or IMPL-*. Record is the JSON object for the single top-level key. Fails if file already exists or token invalid. Optionally syncs index detail_file (sync_index: true). Prefer this over editing tied/*.yaml directly; the server emits valid YAML (e.g. quoting values with colons).",
      inputSchema: z.object({
        token: z.string().min(1).describe("Token ID (e.g. REQ-NEW_FEATURE)"),
        record: z.string().describe("JSON or YAML string of the detail record object"),
        sync_index: z.boolean().optional().describe("If true, set detail_file on the corresponding index record (default: true)"),
      }),
    },
    handler: async ({
      token,
      record: recordJson,
      sync_index,
    }: {
      token: string;
      record: string;
      sync_index?: boolean;
    }) => {
      const parsed = parseRecordOrYaml(recordJson);
      if (!parsed.ok) return textContent(JSON.stringify({ ok: false, error: parsed.error }));
      const result = writeDetail(token, parsed.value, { syncIndex: sync_index !== false });
      return textContent(JSON.stringify(result, null, 2));
    },
  },
  {
    name: "yaml_detail_update",
    config: {
      description:
        "Update an existing REQ/ARCH/IMPL detail YAML by merging updates into the record under the token key. Top-level keys replace scalars/arrays as usual; nested objects metadata, traceability, related_requirements, related_decisions, rationale, and implementation_approach are merged one level with existing values (partial metadata preserves metadata.created; when metadata.last_updated is an object on both sides, its sub-keys merge one level). Fails if no detail file exists. Prefer this over editing tied/*.yaml directly; the server emits valid YAML (e.g. quoting values with colons). For IMPL-only essence_pseudocode churn, consider impl_detail_set_essence_pseudocode.",
      inputSchema: z.object({
        token: z.string().min(1).describe("Token ID of the detail file to update"),
        updates: z.string().describe("JSON or YAML string of key-value pairs to merge into the detail record"),
      }),
    },
    handler: async ({
      token,
      updates: updatesJson,
    }: {
      token: string;
      updates: string;
    }) => {
      const parsed = parseRecordOrYaml(updatesJson);
      if (!parsed.ok) return textContent(JSON.stringify({ ok: false, error: parsed.error }));
      const result = updateDetail(token, parsed.value);
      return textContent(JSON.stringify(result, null, 2));
    },
  },
  {
    name: "impl_detail_set_essence_pseudocode",
    config: {
      description:
        "Update only IMPL-* detail essence_pseudocode (plus optional metadata.last_updated). The pseudo-code body is written to `tied/implementation-decisions/IMPL-{TOKEN}-pseudocode.md` (not embedded in the detail YAML). Safer than a broad yaml_detail_update for large blobs. Rejects non-IMPL tokens. Provide exactly one of: `essence_pseudocode` (inline string) or `essence_pseudocode_path` (UTF-8 file under TIED_BASE_PATH). Nested metadata follows the same rules as yaml_detail_update (metadata.created preserved; when existing and new metadata.last_updated are both objects, date/author/reason fields merge without clobbering siblings).",
      inputSchema: z.object({
        token: z
          .string()
          .min(1)
          .describe("IMPL-* token whose detail file will be updated"),
        essence_pseudocode: z
          .string()
          .optional()
          .describe("Full essence_pseudocode string (persists to IMPL-TOKEN-pseudocode.md)"),
        essence_pseudocode_path: z
          .string()
          .min(1)
          .optional()
          .describe("Path to a UTF-8 file under TIED_BASE_PATH; file contents are used as essence_pseudocode. Mutually exclusive with essence_pseudocode (provide exactly one)."),
        metadata_last_updated: z
          .object({
            date: z.string().optional(),
            author: z.string().optional(),
            reason: z.string().optional(),
          })
          .optional()
          .describe("If set, merged under metadata.last_updated without dropping other metadata keys"),
      }),
    },
    handler: async (args: {
      token: string;
      essence_pseudocode?: string;
      essence_pseudocode_path?: string;
      metadata_last_updated?: { date?: string; author?: string; reason?: string };
    }) => {
      const { token, essence_pseudocode, essence_pseudocode_path, metadata_last_updated } = args;
      const hasPath = typeof essence_pseudocode_path === "string" && essence_pseudocode_path.length > 0;
      const hasInline = typeof essence_pseudocode === "string";
      if (!hasPath && !hasInline) {
        return textContent(
          JSON.stringify(
            { ok: false, error: "Provide exactly one of essence_pseudocode (string) or essence_pseudocode_path" },
            null,
            2
          )
        );
      }
      if (hasPath && hasInline) {
        return textContent(
          JSON.stringify(
            { ok: false, error: "Provide exactly one of essence_pseudocode or essence_pseudocode_path, not both" },
            null,
            2
          )
        );
      }
      if (!token.startsWith("IMPL-")) {
        return textContent(
          JSON.stringify({ ok: false, error: `Token must be IMPL-* (got ${token})` }, null, 2)
        );
      }
      let body: string;
      if (hasPath) {
        const base = getBasePath();
        const resolved = resolvePseudocodePathUnderTiedBase(essence_pseudocode_path!, base);
        if (!resolved.ok) {
          return textContent(JSON.stringify({ ok: false, error: resolved.error }, null, 2));
        }
        const read = readTextFromPseudocodePath(resolved.absolutePath);
        if (!read.ok) {
          return textContent(JSON.stringify({ ok: false, error: read.error }, null, 2));
        }
        body = read.content;
      } else {
        body = essence_pseudocode as string;
      }
      const updates: Record<string, unknown> = { essence_pseudocode: body };
      if (metadata_last_updated && Object.keys(metadata_last_updated).length > 0) {
        updates.metadata = { last_updated: metadata_last_updated };
      }
      const result = updateDetail(token, updates);
      return textContent(JSON.stringify(result, null, 2));
    },
  },
  {
    name: "yaml_detail_append_implementation_approach_details",
    config: {
      description:
        "Append one or more bullet strings to implementation_approach.details on an existing REQ, ARCH, or IMPL detail file without replacing prior lines. Safer than yaml_detail_update when you only want to add notes (e.g. Phase G/H). Fails if detail is missing or markdown.",
      inputSchema: z.object({
        token: z
          .string()
          .min(1)
          .describe("REQ-*, ARCH-*, or IMPL-* token whose detail YAML will be updated"),
        details_lines: z
          .array(z.string())
          .min(1)
          .describe("Non-empty lines to append (trimmed; empty strings skipped)"),
      }),
    },
    handler: async ({
      token,
      details_lines,
    }: {
      token: string;
      details_lines: string[];
    }) => {
      const result = appendImplementationApproachDetails(token, details_lines);
      return textContent(JSON.stringify(result, null, 2));
    },
  },
  {
    name: "citdp_record_write",
    config: {
      description:
        "Write a CITDP record YAML file under tied/citdp/ (basename CITDP-*.yaml only). record is the inner object (value under the top-level key). Use for persist-citdp-record without direct-editing tied/citdp/.",
      inputSchema: z.object({
        filename: z
          .string()
          .min(1)
          .describe("Basename only, e.g. CITDP-REQ-MY_FEATURE.yaml"),
        record: z.string().describe("JSON or YAML string of the document body (fields under the top-level key)"),
        top_level_key: z
          .string()
          .optional()
          .describe("YAML map key (default: filename stem without .yaml)"),
      }),
    },
    handler: async ({
      filename,
      record: recordJson,
      top_level_key,
    }: {
      filename: string;
      record: string;
      top_level_key?: string;
    }) => {
      const parsed = parseRecordOrYaml(recordJson);
      if (!parsed.ok) return textContent(JSON.stringify({ ok: false, error: parsed.error }));
      const rec = parsed.value as Record<string, unknown>;
      const result = writeCitdpRecord({
        filename,
        record: rec,
        top_level_key,
      });
      return textContent(JSON.stringify(result, null, 2));
    },
  },
  {
    name: "yaml_detail_delete",
    config: {
      description:
        "Delete a detail YAML file. Optionally clear detail_file on the corresponding index record (sync_index: true).",
      inputSchema: z.object({
        token: z.string().min(1).describe("Token ID of the detail file to delete"),
        sync_index: z.boolean().optional().describe("If true, set detail_file to null in the index (default: true)"),
      }),
    },
    handler: async ({
      token,
      sync_index,
    }: {
      token: string;
      sync_index?: boolean;
    }) => {
      const result = deleteDetail(token, { syncIndex: sync_index !== false });
      return textContent(JSON.stringify(result, null, 2));
    },
  },
  {
    name: "tied_token_create_with_detail",
    config: {
      description:
        "Create a new REQ, ARCH, or IMPL token with both index record and detail YAML in one step. Writes the index (requirements, architecture-decisions, or implementation-decisions) and the corresponding detail file. Fails if detail file already exists. Set upsert_index true to merge into existing index record. For IMPL tokens, detail_record should follow the TIED v2.2.0 canonical schema (see implementation-decisions.md). Prefer this over editing tied/*.yaml directly; the server emits valid YAML (e.g. quoting values with colons).",
      inputSchema: z.object({
        token: z.string().min(1).describe("Token ID (REQ-*, ARCH-*, or IMPL-*)"),
        index_record: z.string().describe("JSON or YAML string of the index record (e.g. name, status, cross_references). detail_file is set automatically."),
        detail_record: z.string().describe("JSON or YAML string of the detail record body (per detail-files-schema.md; for IMPL use TIED v2.2.0 schema from implementation-decisions.md)."),
        upsert_index: z.boolean().optional().describe("If true, merge index_record into existing index entry; if false, fail when token already exists (default: false)"),
      }),
    },
    handler: async ({
      token,
      index_record: indexRecordJson,
      detail_record: detailRecordJson,
      upsert_index,
    }: {
      token: string;
      index_record: string;
      detail_record: string;
      upsert_index?: boolean;
    }) => {
      const indexName: IndexName | null =
        token.startsWith("REQ-") ? "requirements"
        : token.startsWith("ARCH-") ? "architecture"
        : token.startsWith("IMPL-") ? "implementation"
        : null;
      if (indexName === null) {
        return textContent(
          JSON.stringify({ ok: false, error: `Invalid token: ${token}. Must be REQ-*, ARCH-*, or IMPL-*` }, null, 2)
        );
      }
      const detailFile =
        indexName === "requirements" ? `requirements/${token}.yaml`
        : indexName === "architecture" ? `architecture-decisions/${token}.yaml`
        : `implementation-decisions/${token}.yaml`;

      const indexParsed = parseRecordOrYaml(indexRecordJson);
      if (!indexParsed.ok)
        return textContent(JSON.stringify({ ok: false, error: indexParsed.error }, null, 2));
      const indexRecord = { ...indexParsed.value, detail_file: detailFile };

      const detailParsed = parseRecordOrYaml(detailRecordJson);
      if (!detailParsed.ok)
        return textContent(JSON.stringify({ ok: false, error: detailParsed.error }, null, 2));
      const detailRecord = detailParsed.value;

      if (upsert_index) {
        const res = upsertRecord(indexName, token, indexRecord);
        if (!res.ok) return textContent(JSON.stringify(res, null, 2));
      } else {
        const res = insertRecord(indexName, token, indexRecord);
        if (!res.ok) return textContent(JSON.stringify(res, null, 2));
      }

      const writeRes = writeDetail(token, detailRecord, { syncIndex: false });
      if (!writeRes.ok) return textContent(JSON.stringify(writeRes, null, 2));

      return textContent(
        JSON.stringify({ ok: true, index: indexName, token, detail_path: detailFile }, null, 2)
      );
    },
  },
  {
    name: "tied_token_rename",
    config: {
      description:
        "Rename a single semantic token across the TIED tree. Replaces the token in YAML indexes (semantic-tokens, requirements, architecture, implementation), detail files (keys, values, list items), and renames the detail file when present. Validates and pretty-prints modified YAML with yq -i -P when yq is available (one file per yq invocation; never pass multiple paths to one command); otherwise YAML is left as-written. Use dry_run to list files and renames that would be performed.",
      inputSchema: z.object({
        old_token: z.string().min(1).describe("Current token ID (e.g. REQ-TIED_SETUP)"),
        new_token: z.string().min(1).describe("New token ID; must not already exist; must have same prefix (REQ-/ARCH-/IMPL-/PROC-)"),
        dry_run: z.boolean().optional().describe("If true, return files_modified and file_renamed that would be changed without writing"),
        include_markdown: z.boolean().optional().describe("If true, also replace token in tied/docs/processes.md"),
      }),
    },
    handler: async ({
      old_token,
      new_token,
      dry_run,
      include_markdown,
    }: {
      old_token: string;
      new_token: string;
      dry_run?: boolean;
      include_markdown?: boolean;
    }) => {
      const result = renameSemanticToken(old_token, new_token, {
        dryRun: dry_run,
        includeMarkdown: include_markdown,
      });
      return textContent(JSON.stringify(result, null, 2));
    },
  },
  {
    name: "tied_import_summary",
    config: {
      description:
        "Import/inspect an existing TIED directory: read YAML indexes and report tokens plus detail file presence (hybrid .md and .yaml). Use to validate a reference TIED layout or list what would be loaded from base_path.",
      inputSchema: z.object({
        base_path: z
          .string()
          .optional()
          .describe("Path to tied/ directory (cwd-relative unless absolute). Default: TIED_BASE_PATH or tied"),
      }),
    },
    handler: async (args: { base_path?: string }) => {
      const base = args.base_path
        ? path.isAbsolute(args.base_path)
          ? args.base_path
          : path.resolve(process.cwd(), args.base_path)
        : getBasePath();
      const indexFiles: Array<{ name: IndexName; file: string }> = [
        { name: "requirements", file: "requirements.yaml" },
        { name: "architecture", file: "architecture-decisions.yaml" },
        { name: "implementation", file: "implementation-decisions.yaml" },
      ];
      const summary: Record<string, unknown> = { base_path: base, indexes: {} as Record<string, unknown> };
      for (const { name, file } of indexFiles) {
        const indexPath = path.join(base, file);
        let tokenCount = 0;
        const details: Array<{ token: string; detail_file: string; exists: boolean }> = [];
        if (fs.existsSync(indexPath)) {
          try {
            const raw = fs.readFileSync(indexPath, "utf8");
            const data = yaml.load(raw) as Record<string, unknown> | null;
            if (data && typeof data === "object" && !Array.isArray(data)) {
              for (const [token, record] of Object.entries(data)) {
                if (token.startsWith("#") || typeof record !== "object" || record === null) continue;
                tokenCount++;
                const detailFile = (record as Record<string, unknown>).detail_file;
                if (typeof detailFile === "string" && detailFile.trim()) {
                  const resolved = path.join(base, detailFile);
                  details.push({ token, detail_file: detailFile, exists: fs.existsSync(resolved) });
                }
              }
            }
          } catch {
            // ignore parse errors
          }
        }
        (summary.indexes as Record<string, unknown>)[name] = { token_count: tokenCount, details };
      }
      return textContent(JSON.stringify(summary, null, 2));
    },
  },
  {
    name: "tied_feedback_add",
    config: {
      description:
        "Add a feedback entry (feature request, bug report, or methodology improvement). Creates or appends to tied/feedback.yaml. Returns ok, id, created_at, and optionally a copy-paste-ready markdown snippet for reporting to the TIED project.",
      inputSchema: z.object({
        type: z
          .enum(["feature_request", "bug_report", "methodology_improvement"])
          .describe("Type of feedback"),
        title: z.string().min(1).describe("Short title for the feedback"),
        description: z.string().min(1).describe("Description or body of the feedback"),
        context: z
          .string()
          .optional()
          .describe("Optional JSON string of context (e.g. project_id, tied_version)"),
        include_report_snippet: z
          .boolean()
          .optional()
          .default(true)
          .describe("If true, include report_snippet (markdown) for pasting into TIED issue"),
        base_path: z.string().optional().describe("Override TIED base path (default: TIED_BASE_PATH or tied)"),
      }),
    },
    handler: async (args: {
      type: FeedbackType;
      title: string;
      description: string;
      context?: string;
      include_report_snippet?: boolean;
      base_path?: string;
    }) => {
      let contextObj: Record<string, unknown> | undefined;
      if (args.context) {
        try {
          const parsed = JSON.parse(args.context) as unknown;
          if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
            contextObj = parsed as Record<string, unknown>;
          }
        } catch {
          return textContent(
            JSON.stringify({ ok: false, error: "context must be valid JSON object" }, null, 2)
          );
        }
      }
      const result = appendEntry(
        {
          type: args.type,
          title: args.title,
          description: args.description,
          context: contextObj,
        },
        args.base_path
      );
      if (!result.ok) {
        return textContent(JSON.stringify(result, null, 2));
      }
      const out: Record<string, unknown> = { ok: true, id: result.id, created_at: result.created_at };
      if (args.include_report_snippet !== false) {
        const data = loadFeedback(args.base_path);
        const entry = data.entries.find((e) => e.id === result.id);
        if (entry) out.report_snippet = buildReportSnippet(entry);
      }
      return textContent(JSON.stringify(out, null, 2));
    },
  },
  {
    name: "tied_feedback_export",
    config: {
      description:
        "Export all feedback entries in a format suitable for reporting to the TIED project. Returns markdown or JSON string for copy-paste into an issue or report.",
      inputSchema: z.object({
        format: z.enum(["markdown", "json"]).describe("Output format: markdown or json"),
        base_path: z.string().optional().describe("Override TIED base path (default: TIED_BASE_PATH or tied)"),
      }),
    },
    handler: async (args: { format: "markdown" | "json"; base_path?: string }) => {
      const data = loadFeedback(args.base_path);
      const output =
        args.format === "json" ? exportJson(data.entries) : exportMarkdown(data.entries);
      return textContent(output);
    },
  },
  {
    name: "tied_verify",
    config: {
      description:
        "Update requirement and optionally implementation index status from test results (verification-gated, [PROC-TIED_VERIFICATION_GATED]). Pass REQ/IMPL tokens that have passing tests; their status is set to Implemented / Active. Safe default: set_unpassed_reqs_to_planned and set_unpassed_impl_to_planned are false, so other tokens are not demoted. Set dry_run true to return would_update (planned index changes) without writing: would_update lists only rows whose status would change—tokens already at the target status are omitted (empty would_update means a no-op write path). Run after the test suite; use with tied_validate_consistency in CI.",
      inputSchema: z.object({
        passed_requirement_tokens: z
          .array(z.string())
          .optional()
          .default([])
          .describe("REQ tokens that have passing tests; status set to Implemented"),
        passed_impl_tokens: z
          .array(z.string())
          .optional()
          .default([])
          .describe("IMPL tokens that have passing tests; status set to Active"),
        set_unpassed_reqs_to_planned: z
          .boolean()
          .optional()
          .default(false)
          .describe("If true, REQs not in passed_requirement_tokens set to Planned (default false — safe)"),
        set_unpassed_impl_to_planned: z
          .boolean()
          .optional()
          .default(false)
          .describe("If true, IMPLs not in passed_impl_tokens set to Planned (default false — safe)"),
        dry_run: z
          .boolean()
          .optional()
          .default(false)
          .describe("If true, no writes; returns would_update with index/token/previous_status/next_status for each row that would change"),
      }),
    },
    handler: async (args: {
      passed_requirement_tokens?: string[];
      passed_impl_tokens?: string[];
      set_unpassed_reqs_to_planned?: boolean;
      set_unpassed_impl_to_planned?: boolean;
      dry_run?: boolean;
    }) => {
      const result = updateStatusFromPassedTokens({
        passed_requirement_tokens: args.passed_requirement_tokens ?? [],
        passed_impl_tokens: args.passed_impl_tokens ?? [],
        set_unpassed_reqs_to_planned: args.set_unpassed_reqs_to_planned ?? false,
        set_unpassed_impl_to_planned: args.set_unpassed_impl_to_planned ?? false,
        dry_run: args.dry_run ?? false,
      });
      return textContent(JSON.stringify(result, null, 2));
    },
  },
  {
    name: "tied_cycles",
    config: {
      description:
        "Detect cycles in the requirement dependency graph (related_requirements.depends_on). Returns list of cycles; resolve before using dependency order for planning ([PROC-TIED_DEPENDENCY_GRAPH]).",
      inputSchema: z.object({
        graph: z
          .enum(["requirements", "implementation"])
          .optional()
          .default("requirements")
          .describe("Which index to build the graph from"),
      }),
    },
    handler: async (args: { graph?: "requirements" | "implementation" }) => {
      const g =
        args.graph === "implementation"
          ? buildImplementationGraph()
          : buildRequirementGraph();
      const cycles = findCycles(g);
      return textContent(
        JSON.stringify({ cycles, has_cycles: cycles.length > 0 }, null, 2)
      );
    },
  },
  {
    name: "tied_backlog",
    config: {
      description:
        "Backlog views from requirement dependency graph: topological order, quick-wins (roots), blockers (unmet deps), or critical (high priority) ([PROC-TIED_DEPENDENCY_GRAPH]).",
      inputSchema: z.object({
        view: z
          .enum(["order", "quick-wins", "blockers", "critical"])
          .describe("View: order = topological order (roots first), quick-wins = roots, blockers = have unmet deps, critical = P0/P1 in order"),
      }),
    },
    handler: async (args: { view: "order" | "quick-wins" | "blockers" | "critical" }) => {
      const g = buildRequirementGraph();
      const { statusByToken, priorityByToken } = getRequirementStatusAndPriority();
      if (args.view === "order") {
        const order = topologicalSort(g);
        return textContent(JSON.stringify({ order, has_cycles: order.length === 0 && g.size > 0 }, null, 2));
      }
      const kind =
        args.view === "quick-wins"
          ? "quick-wins"
          : args.view === "blockers"
            ? "blockers"
            : "critical";
      const tokens = getBacklogView(g, kind, { statusByToken, priorityByToken });
      return textContent(JSON.stringify({ view: args.view, tokens }, null, 2));
    },
  },
  {
    name: "requirement_list_state_guide",
    config: {
      description:
        "Client-supplied requirement list in array order. First call MUST pass non-empty requirements; omit current_state. Later calls: current_state = continuation_state from prior response only. Presents one requirement record per step until id end_requirement_list (is_end) or error. For each item, follow the agent REQ checklist in documentation (e.g. agent-req-implementation-checklist.md, session-bootstrap–traceable-commit) and strict TDD. Terminal: id end_requirement_list. Error: empty list, bad token, validation failure.",
      inputSchema: z.object({
        requirements: z
          .array(z.unknown())
          .optional()
          .describe(
            "Requirement objects in walk order. Required on first call when current_state is omitted or empty."
          ),
        current_state: z
          .string()
          .optional()
          .describe(
            "Opaque continuation from the previous response (continuation_state). When set, requirements is ignored."
          ),
      }),
    },
    handler: async (args: { requirements?: unknown[]; current_state?: string }) => {
      const next = resolveRequirementListStateGuide(args);
      return textContent(JSON.stringify(next, null, 2));
    },
  },
  {
    name: "tied_scoped_analysis_run",
    config: {
      description:
        "Run scoped TIED analysis over explicit roots while excluding ignored paths via gitignore-style patterns. Returns an effective summary (roots used, ignore source, skipped paths count) plus optional token discovery, registry gap report, traceability gap report (REQ↔tests, REQ↔production markers, optional IMPL↔tests), or impact preview.",
      inputSchema: z.object({
        mode: z
          .enum([
            "walk_summary",
            "token_scan",
            "gap_report",
            "impact_preview",
            "traceability_gap_report",
          ])
          .optional()
          .describe(
            "What to compute: walk_summary, token_scan, gap_report (tokens in scan but not in semantic-tokens), impact_preview, or traceability_gap_report (index REQ/IMPL vs scoped tests/production markers; see .tiedanalysis.yaml traceability_gap)."
          ),
        roots: z
          .array(z.string())
          .optional()
          .describe("Explicit analysis roots. If omitted, uses config/default roots. If provided as an empty array, falls back to default roots."),
        config_path: z
          .string()
          .optional()
          .describe("Path to .tiedanalysis.yaml (cwd-relative unless absolute). Default: .tiedanalysis.yaml"),
        ignore_file: z
          .string()
          .optional()
          .describe("Path to .tiedignore (cwd-relative unless absolute). Default: .tiedignore"),
        ignore_patterns: z
          .array(z.string())
          .optional()
          .describe("Inline gitignore-style patterns appended to ignore file patterns."),
        follow_symlinks: z
          .boolean()
          .optional()
          .describe("If false, skip symlinked roots/entries; if true, follow symlinks."),
        include_extensions: z
          .array(z.string())
          .optional()
          .describe("Token scan file extensions to include, e.g. [.ts, .md]."),
        max_file_bytes: z
          .number()
          .optional()
          .describe("Max bytes per file to scan for tokens."),
        max_files: z
          .number()
          .optional()
          .describe("Max number of eligible files to scan for tokens."),
        traceability_strict: z
          .boolean()
          .optional()
          .describe(
            "When mode is traceability_gap_report: if true, exit_policy.suggested_exit_code is 1 when any traceability dimension reports gaps (overrides traceability_gap.strict from config)."
          ),
        traceability_requirement_tokens: z
          .array(z.string())
          .optional()
          .describe(
            "Optional explicit REQ-* token list to evaluate (traceability_gap_report only). When set and non-empty, only these tokens are checked for traceability dimensions."
          ),
        traceability_implementation_tokens: z
          .array(z.string())
          .optional()
          .describe(
            "Optional explicit IMPL-* token list to evaluate (traceability_gap_report only). When set and non-empty, only these tokens are checked for traceability dimensions."
          ),
      }),
    },
    handler: async (args: any) => {
      try {
        const result = runScopedAnalysis(args);
        return textContent(JSON.stringify(result, null, 2));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return textContent(JSON.stringify({ ok: false, error: msg }, null, 2));
      }
    },
  },
  {
    name: "tied_plumb_diff_impact_preview",
    config: {
      description:
        "Deterministic plumb diff-style impact preview over git diffs. Scans staged/unstaged diff hunks for [REQ-*]/[ARCH-*]/[IMPL-*] tokens, maps impacted tokens to TIED decisions, and returns a versioned JSON report plus a human summary. No network/LLM calls.",
      inputSchema: z.object({
        selection: z
          .enum(["staged", "unstaged", "both"])
          .optional()
          .describe("Which git diff to scan."),
        paths: z
          .array(z.string())
          .optional()
          .describe(
            "Optional explicit file path list to restrict scanning (cwd-relative or absolute)."
          ),
        include_removed: z
          .boolean()
          .optional()
          .default(true)
          .describe("Include tokens found on removed (-) diff lines."),
        max_files: z
          .number()
          .optional()
          .default(200)
          .describe(
            "Max candidate files scanned before deterministic truncation."
          ),
        max_patch_bytes: z
          .number()
          .optional()
          .default(250000)
          .describe(
            "Max patch bytes per file before token extraction truncates for that file."
          ),
        max_total_patch_bytes: z
          .number()
          .optional()
          .default(2000000)
          .describe(
            "Max total patch bytes scanned across all files."
          ),
      }),
    },
    handler: async (args: {
      selection?: "staged" | "unstaged" | "both";
      paths?: string[];
      include_removed?: boolean;
      max_files?: number;
      max_patch_bytes?: number;
      max_total_patch_bytes?: number;
    }) => {
      const report = runPlumbDiffImpactPreview({
        selection: args.selection ?? "both",
        paths: args.paths,
        include_removed: args.include_removed ?? true,
        max_files: args.max_files ?? 200,
        max_patch_bytes: args.max_patch_bytes ?? 250000,
        max_total_patch_bytes: args.max_total_patch_bytes ?? 2000000,
      });
      return textContent(JSON.stringify(report, null, 2));
    },
  },
  {
    name: "tied_leap_proposal_list",
    config: {
      description:
        "List optional LEAP documentation proposals (non-canonical; not REQ/ARCH/IMPL). Stored under project_root/leap-proposals/queue.json. Use after approval to drive IMPL→ARCH→REQ updates via yaml MCP tools; this tool never writes TIED YAML.",
      inputSchema: z.object({
        project_root: z
          .string()
          .optional()
          .describe("Repo root containing leap-proposals/ (default: process.cwd())"),
        status: z
          .enum(["pending", "rejected", "approved", "applied"])
          .optional()
          .describe("Filter by proposal status"),
      }),
    },
    handler: async (args: { project_root?: string; status?: string }) => {
      return safeLeapCall(() => {
        const root = args.project_root ?? process.cwd();
        const list = listProposals(
          root,
          args.status ? { status: args.status as "pending" | "rejected" | "approved" | "applied" } : undefined
        );
        return { ok: true, count: list.length, proposals: list };
      });
    },
  },
  {
    name: "tied_leap_proposal_add",
    config: {
      description:
        "Add a manual LEAP documentation proposal (pending). Proposals are non-canonical until you apply changes through yaml MCP tools after explicit approval.",
      inputSchema: z.object({
        project_root: z.string().optional().describe("Repo root (default: process.cwd())"),
        title: z.string().min(1).describe("Short title"),
        summary: z.string().min(1).describe("Proposal body (markdown/plain)"),
        suggested_leap_order: z.enum(["impl", "arch", "req", "mixed"]).optional(),
        leap_hints: z.record(z.unknown()).optional().describe("Optional structured hints for the approver"),
      }),
    },
    handler: async (args: {
      project_root?: string;
      title: string;
      summary: string;
      suggested_leap_order?: "impl" | "arch" | "req" | "mixed";
      leap_hints?: Record<string, unknown>;
    }) => {
      return safeLeapCall(() => {
        const p = addProposal(args.project_root ?? process.cwd(), {
          kind: "manual",
          title: args.title,
          summary: args.summary,
          source: { type: "manual" },
          suggested_leap_order: args.suggested_leap_order,
          leap_hints: args.leap_hints,
        });
        return { ok: true, proposal: p };
      });
    },
  },
  {
    name: "tied_leap_proposal_extract_diff",
    config: {
      description:
        "OPT-IN deterministic extraction from git diffs: suggests documentation hints from added (+) lines. No LLM/network. Requires explicit_opt_in=true. Appends proposals to the queue (pending). Does not write TIED YAML.",
      inputSchema: z.object({
        explicit_opt_in: z
          .boolean()
          .describe("Must be true to run extraction (off by default at the tool boundary)."),
        project_root: z.string().optional(),
        selection: z.enum(["staged", "unstaged", "both"]).optional(),
        paths: z.array(z.string()).optional(),
        max_proposals: z.number().optional(),
      }),
    },
    handler: async (args: {
      explicit_opt_in: boolean;
      project_root?: string;
      selection?: "staged" | "unstaged" | "both";
      paths?: string[];
      max_proposals?: number;
    }) => {
      return safeLeapCall(() => {
        if (!args.explicit_opt_in) {
          return {
            ok: false,
            error: "explicit_opt_in must be true to run diff extraction (optional feature; off by default).",
          };
        }
        const root = args.project_root ?? process.cwd();
        const extracted = extractDiffProposalCandidates({
          projectRoot: root,
          selection: args.selection ?? "staged",
          paths: args.paths,
          max_proposals: args.max_proposals ?? 40,
        });
        if (extracted.error) {
          return { ok: false, error: extracted.error, extraction: extracted };
        }
        const created: unknown[] = [];
        for (const c of extracted.candidates) {
          created.push(
            addProposal(root, {
              kind: "inferred_diff",
              title: c.title,
              summary: c.summary,
              source: {
                type: "git_diff",
                selection: args.selection ?? "staged",
                paths: args.paths,
              },
              suggested_leap_order: "impl",
              leap_hints: { file: c.file, line_text: c.line_text },
            })
          );
        }
        return {
          ok: true,
          created_count: created.length,
          created,
          extraction: extracted,
        };
      });
    },
  },
  {
    name: "tied_leap_proposal_import_session",
    config: {
      description:
        "OPT-IN: split session export text (or JSON array of {content}) into pending proposals. No LLM. Requires explicit_opt_in=true. Does not write TIED YAML.",
      inputSchema: z.object({
        explicit_opt_in: z.boolean().describe("Must be true to import."),
        project_root: z.string().optional(),
        raw_text: z.string().describe("Session export or transcript text"),
        label: z.string().optional().describe("Optional label for proposal titles"),
        max_segments: z.number().optional().default(25),
      }),
    },
    handler: async (args: {
      explicit_opt_in: boolean;
      project_root?: string;
      raw_text: string;
      label?: string;
      max_segments?: number;
    }) => {
      return safeLeapCall(() => {
        if (!args.explicit_opt_in) {
          return { ok: false, error: "explicit_opt_in must be true to import session segments." };
        }
        const root = args.project_root ?? process.cwd();
        const segments = parseSessionExportSegments(args.raw_text, args.max_segments ?? 25);
        const shaped = proposalsFromSessionSegments(segments, args.label);
        const created: unknown[] = [];
        for (const s of shaped) {
          created.push(addProposal(root, s));
        }
        return { ok: true, created_count: created.length, created, segment_count: segments.length };
      });
    },
  },
  {
    name: "tied_leap_proposal_reject",
    config: {
      description:
        "Reject a proposal by id. Records status in queue + audit log; does not mutate TIED YAML.",
      inputSchema: z.object({
        project_root: z.string().optional(),
        proposal_id: z.string().min(1),
        reason: z.string().optional(),
      }),
    },
    handler: async (args: { project_root?: string; proposal_id: string; reason?: string }) => {
      return safeLeapCall(() => {
        const r = rejectProposal(args.project_root ?? process.cwd(), args.proposal_id, args.reason);
        return r.ok ? { ok: true, proposal: r.proposal } : { ok: false, error: r.error };
      });
    },
  },
  {
    name: "tied_leap_proposal_approve",
    config: {
      description:
        "Approve a pending proposal (ready for LEAP updates). Does not write project TIED YAML; apply changes with yaml_index_* MCP tools, then tied_leap_proposal_mark_applied. Run lint_yaml and tied_validate_consistency after YAML edits.",
      inputSchema: z.object({
        project_root: z.string().optional(),
        proposal_id: z.string().min(1),
        note: z.string().optional(),
      }),
    },
    handler: async (args: { project_root?: string; proposal_id: string; note?: string }) => {
      return safeLeapCall(() => {
        const r = approveProposal(args.project_root ?? process.cwd(), args.proposal_id, args.note);
        return r.ok ? { ok: true, proposal: r.proposal } : { ok: false, error: r.error };
      });
    },
  },
  {
    name: "tied_leap_proposal_mark_applied",
    config: {
      description:
        "Mark an approved proposal as applied after LEAP updates were written via MCP yaml tools. Does not perform YAML writes itself.",
      inputSchema: z.object({
        project_root: z.string().optional(),
        proposal_id: z.string().min(1),
      }),
    },
    handler: async (args: { project_root?: string; proposal_id: string }) => {
      return safeLeapCall(() => {
        const r = markApplied(args.project_root ?? process.cwd(), args.proposal_id);
        return r.ok ? { ok: true, proposal: r.proposal } : { ok: false, error: r.error };
      });
    },
  },
  {
    name: "tied_leap_proposal_update",
    config: {
      description:
        "Edit title/summary/leap_hints for a proposal in pending status only.",
      inputSchema: z.object({
        project_root: z.string().optional(),
        proposal_id: z.string().min(1),
        title: z.string().optional(),
        summary: z.string().optional(),
        leap_hints: z.record(z.unknown()).optional(),
      }),
    },
    handler: async (args: {
      project_root?: string;
      proposal_id: string;
      title?: string;
      summary?: string;
      leap_hints?: Record<string, unknown>;
    }) => {
      return safeLeapCall(() => {
        const r = updatePendingProposal(args.project_root ?? process.cwd(), args.proposal_id, {
          title: args.title,
          summary: args.summary,
          leap_hints: args.leap_hints,
        });
        return r.ok ? { ok: true, proposal: r.proposal } : { ok: false, error: r.error };
      });
    },
  },
  {
    name: "tied_leap_proposal_queue_snapshot",
    config: {
      description:
        "Return raw queue.json contents for backup or inspection (non-canonical proposals).",
      inputSchema: z.object({
        project_root: z.string().optional(),
      }),
    },
    handler: async (args: { project_root?: string }) => {
      return safeLeapCall(() => loadQueue(args.project_root ?? process.cwd()));
    },
  },
];
