/**
 * MCP tool handlers for TIED YAML index operations and monolithic conversion.
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
} from "../detail-loader.js";
import {
  convertMonolithicRequirements,
  convertMonolithicArchitecture,
  convertMonolithicImplementation,
  convertMonolithicAll,
  convertDetailMarkdownToYaml,
} from "../convert/index.js";

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
        "Read an entire YAML index or a specific record by token. Use index to choose which file (requirements, architecture, implementation, semantic-tokens). Optionally pass token to get a single record.",
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
        "Insert a new record into a YAML index. Fails if the token already exists. Record must be a JSON object (nested allowed). Writes to the index file (e.g. tied/requirements.yaml).",
      inputSchema: z.object({
        index: INDEX_ENUM.describe(
          "Which YAML index: requirements, architecture, implementation, or semantic-tokens"
        ),
        token: z.string().describe("Token ID for the new record (e.g. REQ-NEW_FEATURE)"),
        record: z
          .string()
          .describe("JSON string of the record object (e.g. {\"name\": \"...\", \"status\": \"Planned\"})"),
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
      let record: Record<string, unknown>;
      try {
        const parsed = JSON.parse(recordJson) as unknown;
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))
          return textContent(JSON.stringify({ ok: false, error: "record must be a JSON object" }));
        record = parsed as Record<string, unknown>;
      } catch {
        return textContent(JSON.stringify({ ok: false, error: "Invalid JSON in record" }));
      }
      const result = insertRecord(index as IndexName, token, record);
      return textContent(JSON.stringify(result, null, 2));
    },
  },
  {
    name: "yaml_index_update",
    config: {
      description:
        "Update an existing record in a YAML index by merging the given fields at the top level. Fails if the token does not exist. Updates must be a JSON object.",
      inputSchema: z.object({
        index: INDEX_ENUM.describe(
          "Which YAML index: requirements, architecture, implementation, or semantic-tokens"
        ),
        token: z.string().describe("Token ID of the record to update"),
        updates: z
          .string()
          .describe("JSON string of key-value pairs to merge into the record (e.g. {\"status\": \"Implemented\"})"),
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
      let updates: Record<string, unknown>;
      try {
        const parsed = JSON.parse(updatesJson) as unknown;
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))
          return textContent(JSON.stringify({ ok: false, error: "updates must be a JSON object" }));
        updates = parsed as Record<string, unknown>;
      } catch {
        return textContent(JSON.stringify({ ok: false, error: "Invalid JSON in updates" }));
      }
      const result = updateRecord(index as IndexName, token, updates);
      return textContent(JSON.stringify(result, null, 2));
    },
  },
  {
    name: "yaml_detail_read",
    config: {
      description:
        "Read a single detail YAML file by token (REQ-*, ARCH-*, or IMPL-*). Returns the detail record (the content under the token key). Fails if token format is invalid or no detail file exists.",
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
        "Create a new detail YAML file. Token must be REQ-*, ARCH-*, or IMPL-*. Record is the JSON object for the single top-level key. Fails if file already exists or token invalid. Optionally syncs index detail_file (sync_index: true).",
      inputSchema: z.object({
        token: z.string().min(1).describe("Token ID (e.g. REQ-NEW_FEATURE)"),
        record: z.string().describe("JSON string of the detail record object"),
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
      let record: Record<string, unknown>;
      try {
        const parsed = JSON.parse(recordJson) as unknown;
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))
          return textContent(JSON.stringify({ ok: false, error: "record must be a JSON object" }));
        record = parsed as Record<string, unknown>;
      } catch {
        return textContent(JSON.stringify({ ok: false, error: "Invalid JSON in record" }));
      }
      const result = writeDetail(token, record, { syncIndex: sync_index !== false });
      return textContent(JSON.stringify(result, null, 2));
    },
  },
  {
    name: "yaml_detail_update",
    config: {
      description:
        "Update an existing detail YAML file by merging the given object at the top level. Fails if no detail file exists.",
      inputSchema: z.object({
        token: z.string().min(1).describe("Token ID of the detail file to update"),
        updates: z.string().describe("JSON string of key-value pairs to merge into the detail record"),
      }),
    },
    handler: async ({
      token,
      updates: updatesJson,
    }: {
      token: string;
      updates: string;
    }) => {
      let updates: Record<string, unknown>;
      try {
        const parsed = JSON.parse(updatesJson) as unknown;
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))
          return textContent(JSON.stringify({ ok: false, error: "updates must be a JSON object" }));
        updates = parsed as Record<string, unknown>;
      } catch {
        return textContent(JSON.stringify({ ok: false, error: "Invalid JSON in updates" }));
      }
      const result = updateDetail(token, updates);
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
        "Create a new REQ, ARCH, or IMPL token with both index record and detail YAML in one step. Writes the index (requirements, architecture-decisions, or implementation-decisions) and the corresponding detail file. Fails if detail file already exists. Set upsert_index true to merge into existing index record. For IMPL tokens, detail_record should follow the TIED v2.2.0 canonical schema (see implementation-decisions.template.md).",
      inputSchema: z.object({
        token: z.string().min(1).describe("Token ID (REQ-*, ARCH-*, or IMPL-*)"),
        index_record: z.string().describe("JSON string of the index record (e.g. name, status, cross_references). detail_file is set automatically."),
        detail_record: z.string().describe("JSON string of the detail record body (per detail-files-schema.md; for IMPL use TIED v2.2.0 schema from implementation-decisions.template.md)."),
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

      let indexRecord: Record<string, unknown>;
      try {
        const parsed = JSON.parse(indexRecordJson) as unknown;
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))
          return textContent(JSON.stringify({ ok: false, error: "index_record must be a JSON object" }, null, 2));
        indexRecord = { ...(parsed as Record<string, unknown>), detail_file: detailFile };
      } catch {
        return textContent(JSON.stringify({ ok: false, error: "Invalid JSON in index_record" }, null, 2));
      }

      let detailRecord: Record<string, unknown>;
      try {
        const parsed = JSON.parse(detailRecordJson) as unknown;
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))
          return textContent(JSON.stringify({ ok: false, error: "detail_record must be a JSON object" }, null, 2));
        detailRecord = parsed as Record<string, unknown>;
      } catch {
        return textContent(JSON.stringify({ ok: false, error: "Invalid JSON in detail_record" }, null, 2));
      }

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
    name: "convert_monolithic_requirements",
    config: {
      description:
        "Convert markdown to YAML: parses monolithic requirements.md and writes requirements.yaml (primary output) plus requirements/REQ-*.yaml detail files. Every heading (##/###) or text label (**Label**:) that immediately contains text or a list becomes a key in the YAML structure. Provide file_path or content. Paths are cwd-relative unless absolute. Use dry_run to get paths without writing.",
      inputSchema: z.object({
        file_path: z
          .string()
          .optional()
          .describe("Path to monolithic requirements.md file (cwd-relative unless absolute)"),
        content: z
          .string()
          .optional()
          .describe("Raw markdown content (use if file_path not provided)"),
        output_base_path: z
          .string()
          .optional()
          .describe("Output directory (default: tied or TIED_BASE_PATH). Cwd-relative unless absolute."),
        dry_run: z
          .boolean()
          .optional()
          .describe("If true, return summary and paths without writing"),
        overwrite: z
          .boolean()
          .optional()
          .describe("If false, skip writing detail files that already exist (default: true)"),
        token_format: z
          .enum(["hyphen", "colon", "both"])
          .optional()
          .describe("Input token format: hyphen [REQ-*], colon [REQ:*], or both (normalize colon to hyphen before parsing)"),
      }),
    },
    handler: async (args: {
      file_path?: string;
      content?: string;
      output_base_path?: string;
      dry_run?: boolean;
      overwrite?: boolean;
      token_format?: "hyphen" | "colon" | "both";
    }) => {
      let content = args.content;
      if (content == null && args.file_path) {
        try {
          content = fs.readFileSync(args.file_path, "utf8");
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          return textContent(JSON.stringify({ ok: false, error: `Read failed: ${msg}` }, null, 2));
        }
      }
      if (content == null || content === "")
        return textContent(
          JSON.stringify({ ok: false, error: "Provide file_path or content" }, null, 2)
        );
      const result = convertMonolithicRequirements(content, args.output_base_path, {
        dry_run: args.dry_run,
        overwrite: args.overwrite,
        token_format: args.token_format,
      });
      return textContent(JSON.stringify(result, null, 2));
    },
  },
  {
    name: "convert_monolithic_architecture",
    config: {
      description:
        "Convert markdown to YAML: parses monolithic architecture-decisions.md and writes architecture-decisions.yaml (primary output) plus architecture-decisions/ARCH-*.yaml detail files. Every heading or text label that immediately contains text or a list becomes a key in the YAML structure. Paths are cwd-relative unless absolute. Use dry_run to get paths without writing.",
      inputSchema: z.object({
        file_path: z.string().optional().describe("Path to monolithic architecture-decisions.md (cwd-relative unless absolute)"),
        content: z.string().optional().describe("Raw markdown content"),
        output_base_path: z.string().optional().describe("Output directory (cwd-relative unless absolute)"),
        dry_run: z.boolean().optional().describe("If true, no writes"),
        overwrite: z.boolean().optional().describe("If false, skip existing detail files"),
        token_format: z
          .enum(["hyphen", "colon", "both"])
          .optional()
          .describe("Input token format: hyphen, colon [ARCH:*], or both (normalize to hyphen before parsing)"),
      }),
    },
    handler: async (args: {
      file_path?: string;
      content?: string;
      output_base_path?: string;
      dry_run?: boolean;
      overwrite?: boolean;
      token_format?: "hyphen" | "colon" | "both";
    }) => {
      let content = args.content;
      if (content == null && args.file_path) {
        try {
          content = fs.readFileSync(args.file_path, "utf8");
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          return textContent(JSON.stringify({ ok: false, error: `Read failed: ${msg}` }, null, 2));
        }
      }
      if (content == null || content === "")
        return textContent(
          JSON.stringify({ ok: false, error: "Provide file_path or content" }, null, 2)
        );
      const result = convertMonolithicArchitecture(content, args.output_base_path, {
        dry_run: args.dry_run,
        overwrite: args.overwrite,
        token_format: args.token_format,
      });
      return textContent(JSON.stringify(result, null, 2));
    },
  },
  {
    name: "convert_monolithic_implementation",
    config: {
      description:
        "Convert markdown to YAML: parses monolithic implementation-decisions.md and writes implementation-decisions.yaml (primary output) plus implementation-decisions/IMPL-*.yaml detail files. Every heading or text label that immediately contains text or a list becomes a key in the YAML structure. Paths are cwd-relative unless absolute. Use dry_run to get paths without writing.",
      inputSchema: z.object({
        file_path: z.string().optional().describe("Path to monolithic implementation-decisions.md (cwd-relative unless absolute)"),
        content: z.string().optional().describe("Raw markdown content"),
        output_base_path: z.string().optional().describe("Output directory (cwd-relative unless absolute)"),
        dry_run: z.boolean().optional().describe("If true, no writes"),
        overwrite: z.boolean().optional().describe("If false, skip existing detail files"),
        token_format: z
          .enum(["hyphen", "colon", "both"])
          .optional()
          .describe("Input token format: hyphen, colon [IMPL:*], or both (normalize to hyphen before parsing)"),
      }),
    },
    handler: async (args: {
      file_path?: string;
      content?: string;
      output_base_path?: string;
      dry_run?: boolean;
      overwrite?: boolean;
      token_format?: "hyphen" | "colon" | "both";
    }) => {
      let content = args.content;
      if (content == null && args.file_path) {
        try {
          content = fs.readFileSync(args.file_path, "utf8");
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          return textContent(JSON.stringify({ ok: false, error: `Read failed: ${msg}` }, null, 2));
        }
      }
      if (content == null || content === "")
        return textContent(
          JSON.stringify({ ok: false, error: "Provide file_path or content" }, null, 2)
        );
      const result = convertMonolithicImplementation(content, args.output_base_path, {
        dry_run: args.dry_run,
        overwrite: args.overwrite,
        token_format: args.token_format,
      });
      return textContent(JSON.stringify(result, null, 2));
    },
  },
  {
    name: "convert_monolithic_all",
    config: {
      description:
        "Convert markdown to YAML for all three monolithic files (requirements, architecture, implementation) in one call. Primary output is YAML index files; detail YAML files (REQ-*.yaml, ARCH-*.yaml, IMPL-*.yaml) are also written unless dry_run. Every heading or text label that immediately contains text or a list becomes a key in the YAML structure. Pass paths and/or raw content for any of the three; content overrides path when both provided. Paths are cwd-relative unless absolute.",
      inputSchema: z.object({
        requirements_path: z.string().optional().describe("Path to requirements.md (cwd-relative unless absolute)"),
        architecture_path: z.string().optional().describe("Path to architecture-decisions.md (cwd-relative unless absolute)"),
        implementation_path: z.string().optional().describe("Path to implementation-decisions.md (cwd-relative unless absolute)"),
        requirements_content: z.string().optional().describe("Raw markdown for requirements (overrides requirements_path when set)"),
        architecture_content: z.string().optional().describe("Raw markdown for architecture (overrides architecture_path when set)"),
        implementation_content: z.string().optional().describe("Raw markdown for implementation (overrides implementation_path when set)"),
        output_base_path: z.string().optional().describe("Output directory (cwd-relative unless absolute)"),
        dry_run: z.boolean().optional().describe("If true, no writes"),
        overwrite: z.boolean().optional().describe("If false, skip existing detail files"),
        token_format: z
          .enum(["hyphen", "colon", "both"])
          .optional()
          .describe("Input token format: hyphen, colon [REQ:*] etc., or both (normalize to hyphen before parsing)"),
      }),
    },
    handler: async (args: {
      requirements_path?: string;
      architecture_path?: string;
      implementation_path?: string;
      requirements_content?: string;
      architecture_content?: string;
      implementation_content?: string;
      output_base_path?: string;
      dry_run?: boolean;
      overwrite?: boolean;
      token_format?: "hyphen" | "colon" | "both";
    }) => {
      const result = convertMonolithicAll({
        requirements_path: args.requirements_path,
        architecture_path: args.architecture_path,
        implementation_path: args.implementation_path,
        requirements_content: args.requirements_content,
        architecture_content: args.architecture_content,
        implementation_content: args.implementation_content,
        output_base_path: args.output_base_path,
        dry_run: args.dry_run,
        overwrite: args.overwrite,
        token_format: args.token_format,
      });
      return textContent(JSON.stringify(result, null, 2));
    },
  },
  {
    name: "convert_detail_markdown_to_yaml",
    config: {
      description:
        "Convert a single REQ/ARCH/IMPL detail from markdown to YAML (per detail-files-schema). Use for existing .md detail files or pasted content. Optionally write the .yaml file, update the index detail_file, and remove the .md. When sync_index is true, the index at getBasePath() is updated; use the same output_base_path (or default) so the written file and index refer to the same tree.",
      inputSchema: z.object({
        file_path: z
          .string()
          .optional()
          .describe("Path to existing .md detail file (cwd-relative unless absolute)"),
        content: z
          .string()
          .optional()
          .describe("Raw markdown content (use if file_path not provided)"),
        type: z
          .enum(["requirement", "architecture", "implementation"])
          .optional()
          .describe("Detail type; inferred from token or path if omitted"),
        token: z
          .string()
          .optional()
          .describe("Token override (e.g. REQ-TIED_SETUP); inferred from content or path if omitted"),
        output_base_path: z
          .string()
          .optional()
          .describe("Output directory for written .yaml (default: tied or TIED_BASE_PATH)"),
        dry_run: z.boolean().optional().describe("If true, return summary and paths without writing"),
        overwrite: z.boolean().optional().describe("If false, skip writing when detail .yaml already exists"),
        write_file: z.boolean().optional().describe("If true, write the .yaml detail file (default: true)"),
        sync_index: z.boolean().optional().describe("If true, set index record detail_file to the new .yaml path (default: true)"),
        remove_md_after: z.boolean().optional().describe("If true and source was file_path to .md, remove the .md after successful write (default: false)"),
      }),
    },
    handler: async (args: {
      file_path?: string;
      content?: string;
      type?: "requirement" | "architecture" | "implementation";
      token?: string;
      output_base_path?: string;
      dry_run?: boolean;
      overwrite?: boolean;
      write_file?: boolean;
      sync_index?: boolean;
      remove_md_after?: boolean;
    }) => {
      const result = convertDetailMarkdownToYaml({
        content: args.content,
        file_path: args.file_path,
        type: args.type,
        token: args.token,
        output_base_path: args.output_base_path,
        dry_run: args.dry_run,
        overwrite: args.overwrite,
        write_file: args.write_file,
        sync_index: args.sync_index,
        remove_md_after: args.remove_md_after,
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
];
