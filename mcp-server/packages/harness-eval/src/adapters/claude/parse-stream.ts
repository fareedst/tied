/**
 * [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] PARSE_CLAUDE_STREAM_JSON_FILE — SC-HMEP-M1-02
 */
import fs from "node:fs";
import type { TokenFields, TokenObservation } from "../../types.js";
import { assessObservationCompleteness, usageObjectToFields } from "../../tokens/accounting.js";

function maxFields(a: TokenFields, b: TokenFields): TokenFields {
  const max = (x: number | null, y: number | null): number | null => {
    if (x === null) {
      return y;
    }
    if (y === null) {
      return x;
    }
    return Math.max(x, y);
  };
  return {
    input_tokens: max(a.input_tokens, b.input_tokens),
    output_tokens: max(a.output_tokens, b.output_tokens),
    reasoning_tokens: max(a.reasoning_tokens, b.reasoning_tokens),
    cache_read_input_tokens: max(a.cache_read_input_tokens, b.cache_read_input_tokens),
    cache_creation_input_tokens: max(a.cache_creation_input_tokens, b.cache_creation_input_tokens),
  };
}

export function parseClaudeStreamJsonFile(
  filePath: string,
  seenOrigin = new Set<string>(),
): TokenObservation[] {
  const text = fs.readFileSync(filePath, "utf8");
  const lines = text.split("\n");
  let cumulative: TokenFields = {
    input_tokens: null,
    output_tokens: null,
    reasoning_tokens: null,
    cache_read_input_tokens: null,
    cache_creation_input_tokens: null,
  };
  let lastResultLine = -1;
  let lastOrigin = "";
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "") {
      continue;
    }
    let obj: Record<string, unknown>;
    try {
      obj = JSON.parse(line) as Record<string, unknown>;
    } catch {
      continue;
    }
    const typ = String(obj.type ?? "");
    if (typ !== "result") {
      continue;
    }
    const usage = obj.usage as Record<string, unknown> | undefined;
    if (!usage) {
      continue;
    }
    const fields = usageObjectToFields(usage);
    cumulative = maxFields(cumulative, fields);
    lastResultLine = i + 1;
    lastOrigin =
      (typeof obj.uuid === "string" && obj.uuid) ||
      (typeof obj.session_id === "string" && `session:${obj.session_id}`) ||
      `${filePath}:result:${i + 1}`;
  }
  const hasAny =
    cumulative.input_tokens !== null ||
    cumulative.output_tokens !== null ||
    cumulative.reasoning_tokens !== null;
  if (!hasAny || lastResultLine < 1) {
    return [];
  }
  if (seenOrigin.has(lastOrigin)) {
    return [];
  }
  seenOrigin.add(lastOrigin);
  const completeness = assessObservationCompleteness(cumulative);
  return [
    {
      origin_id: lastOrigin,
      harness: "claude",
      source_path: filePath,
      line_no: lastResultLine,
      event_type: "result",
      completeness,
      ...cumulative,
    },
  ];
}
