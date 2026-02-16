/**
 * MCP tool handlers for TIED YAML index operations and monolithic conversion.
 */

import fs from "node:fs";
import { z } from "zod";
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
  type IndexName,
} from "../yaml-loader.js";
import {
  convertMonolithicRequirements,
  convertMonolithicArchitecture,
  convertMonolithicImplementation,
  convertMonolithicAll,
} from "../convert/index.js";

const INDEX_ENUM = z.enum([
  "requirements",
  "architecture",
  "implementation",
  "semantic-tokens",
]);
const TOKEN_TYPE_ENUM = z.enum(["REQ", "ARCH", "IMPL", "PROC"]);

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
    name: "convert_monolithic_requirements",
    config: {
      description:
        "Convert markdown to YAML: parses monolithic requirements.md and writes requirements.yaml (primary output) plus requirements/REQ-*.md detail files. Every heading (##/###) or text label (**Label**:) that immediately contains text or a list becomes a key in the YAML structure. Provide file_path or content. Paths are cwd-relative unless absolute. Use dry_run to get paths without writing.",
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
        "Convert markdown to YAML: parses monolithic architecture-decisions.md and writes architecture-decisions.yaml (primary output) plus architecture-decisions/ARCH-*.md detail files. Every heading or text label that immediately contains text or a list becomes a key in the YAML structure. Paths are cwd-relative unless absolute. Use dry_run to get paths without writing.",
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
        "Convert markdown to YAML: parses monolithic implementation-decisions.md and writes implementation-decisions.yaml (primary output) plus implementation-decisions/IMPL-*.md detail files. Every heading or text label that immediately contains text or a list becomes a key in the YAML structure. Paths are cwd-relative unless absolute. Use dry_run to get paths without writing.",
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
        "Convert markdown to YAML for all three monolithic files (requirements, architecture, implementation) in one call. Primary output is YAML index files; detail markdown files are also written unless dry_run. Every heading or text label that immediately contains text or a list becomes a key in the YAML structure. Pass paths and/or raw content for any of the three; content overrides path when both provided. Paths are cwd-relative unless absolute.",
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
];
