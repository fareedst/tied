/**
 * MCP tool handlers for TIED YAML index operations.
 */

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
];
