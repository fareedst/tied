/**
 * MCP resource handlers for tied:// URIs.
 * Exposes YAML indexes and single records as read-only resources.
 */

import { type McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  loadIndex,
  getRecord,
  listTokens,
  type IndexName,
} from "./yaml-loader.js";
import { loadDetail, listDetailTokens } from "./detail-loader.js";

const TIED_PREFIX = "tied://";

function toYamlLike(obj: unknown): string {
  return JSON.stringify(obj, null, 2);
}

export function registerResources(server: McpServer): void {
  const staticResources: Array<{
    name: string;
    uri: string;
    index: IndexName;
  }> = [
    { name: "requirements", uri: `${TIED_PREFIX}requirements`, index: "requirements" },
    {
      name: "architecture-decisions",
      uri: `${TIED_PREFIX}architecture-decisions`,
      index: "architecture",
    },
    {
      name: "implementation-decisions",
      uri: `${TIED_PREFIX}implementation-decisions`,
      index: "implementation",
    },
    { name: "semantic-tokens", uri: `${TIED_PREFIX}semantic-tokens`, index: "semantic-tokens" },
  ];

  for (const { name, uri, index } of staticResources) {
    server.registerResource(
      name,
      uri,
      {
        description: `Full contents of ${index} YAML index`,
        mimeType: "application/json",
      },
      async (url) => {
        const data = loadIndex(index);
        const text = data ? toYamlLike(data) : "{}";
        return { contents: [{ uri: url.href, text }] };
      }
    );
  }

  server.registerResource(
    "requirement",
    new ResourceTemplate(`${TIED_PREFIX}requirement/{token}`, {
      list: undefined,
      complete: {
        token: async (value) => {
          const tokens = listTokens("requirements");
          if (!value) return tokens;
          const lower = value.toLowerCase();
          return tokens.filter((t) => t.toLowerCase().startsWith(lower));
        },
      },
    }),
    {
      description: "Single requirement record by token (e.g. REQ-TIED_SETUP)",
      mimeType: "application/json",
    },
    async (uri, variables) => {
      const token = asString(variables.token);
      const record = getRecord("requirements", token);
      const text = record != null ? toYamlLike(record) : `No requirement found for: ${token}`;
      return { contents: [{ uri: uri.href, text }] };
    }
  );

  server.registerResource(
    "decision",
    new ResourceTemplate(`${TIED_PREFIX}decision/{token}`, {
      list: undefined,
      complete: {
        token: async (value) => {
          const arch = listTokens("architecture");
          const impl = listTokens("implementation");
          const tokens = [...arch, ...impl];
          const v = asString(value);
          if (!v) return tokens;
          const lower = v.toLowerCase();
          return tokens.filter((t) => t.toLowerCase().startsWith(lower));
        },
      },
    }),
    {
      description: "Single architecture or implementation decision by token",
      mimeType: "application/json",
    },
    async (uri, variables) => {
      const token = asString(variables.token);
      const index: IndexName = token.startsWith("ARCH-") ? "architecture" : "implementation";
      const record = getRecord(index, token);
      const text = record != null ? toYamlLike(record) : `No decision found for: ${token}`;
      return { contents: [{ uri: uri.href, text }] };
    }
  );

  server.registerResource(
    "requirement-detail",
    new ResourceTemplate(`${TIED_PREFIX}requirement/{token}/detail`, {
      list: undefined,
      complete: {
        token: async (value) => {
          const tokens = listDetailTokens("requirement");
          const v = asString(value);
          if (!v) return tokens;
          const lower = v.toLowerCase();
          return tokens.filter((t) => t.toLowerCase().startsWith(lower));
        },
      },
    }),
    {
      description: "Full detail YAML content for a requirement (REQ-*) by token",
      mimeType: "application/json",
    },
    async (uri, variables) => {
      const token = asString(variables.token);
      if (!token.startsWith("REQ-")) {
        return { contents: [{ uri: uri.href, text: `Invalid token for requirement detail: ${token}. Must start with REQ-` }] };
      }
      const record = loadDetail(token);
      const text = record != null ? toYamlLike(record) : `No detail file found for: ${token}`;
      return { contents: [{ uri: uri.href, text }] };
    }
  );

  server.registerResource(
    "decision-detail",
    new ResourceTemplate(`${TIED_PREFIX}decision/{token}/detail`, {
      list: undefined,
      complete: {
        token: async (value) => {
          const arch = listDetailTokens("architecture");
          const impl = listDetailTokens("implementation");
          const tokens = [...arch, ...impl];
          const v = asString(value);
          if (!v) return tokens;
          const lower = v.toLowerCase();
          return tokens.filter((t) => t.toLowerCase().startsWith(lower));
        },
      },
    }),
    {
      description: "Full detail YAML content for an architecture or implementation decision (ARCH-* or IMPL-*) by token",
      mimeType: "application/json",
    },
    async (uri, variables) => {
      const token = asString(variables.token);
      if (!token.startsWith("ARCH-") && !token.startsWith("IMPL-")) {
        return { contents: [{ uri: uri.href, text: `Invalid token for decision detail: ${token}. Must start with ARCH- or IMPL-` }] };
      }
      const record = loadDetail(token);
      const text = record != null ? toYamlLike(record) : `No detail file found for: ${token}`;
      return { contents: [{ uri: uri.href, text }] };
    }
  );
}

function asString(v: string | string[] | undefined): string {
  if (v == null) return "";
  return Array.isArray(v) ? v[0] ?? "" : v;
}
