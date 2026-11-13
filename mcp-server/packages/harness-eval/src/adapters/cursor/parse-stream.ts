/**
 * [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] PARSE_CURSOR_STREAM_JSON_FILE — SC-HMEP-M1-01
 * [ARCH-TIED_HARNESS_MODEL_EVAL_PLATFORM] D-PARSER-DUP
 */
import fs from "node:fs";
import type { TokenObservation } from "../../types.js";
import { assessObservationCompleteness, usageObjectToFields } from "../../tokens/accounting.js";

export function parseCursorStreamJsonFile(
  filePath: string,
  seenOrigin = new Set<string>(),
): TokenObservation[] {
  const text = fs.readFileSync(filePath, "utf8");
  const lines = text.split("\n");
  const out: TokenObservation[] = [];
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
    const hasAny =
      fields.input_tokens !== null ||
      fields.output_tokens !== null ||
      fields.reasoning_tokens !== null;
    if (!hasAny) {
      continue;
    }
    const origin =
      (typeof obj.uuid === "string" && obj.uuid) ||
      (typeof obj.request_id === "string" && obj.request_id) ||
      `${filePath}:${i + 1}`;
    if (seenOrigin.has(origin)) {
      continue;
    }
    seenOrigin.add(origin);
    const completeness = assessObservationCompleteness(fields);
    out.push({
      origin_id: origin,
      harness: "cursor",
      source_path: filePath,
      line_no: i + 1,
      event_type: typ,
      completeness,
      ...fields,
    });
  }
  return out;
}
