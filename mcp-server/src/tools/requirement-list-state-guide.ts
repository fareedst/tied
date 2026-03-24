/**
 * Step through a client-supplied requirement list via MCP.
 * Stateless: continuation is base64url JSON round-tripped as current_state.
 */

import { z } from "zod";

const testScopeSchema = z
  .object({
    unit: z.array(z.string()).optional(),
    integration: z.array(z.string()).optional(),
    e2e: z.array(z.string()).optional(),
  })
  .passthrough();

export const requirementItemSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    depends_on: z.array(z.string()),
    summary: z.string(),
    rationale: z.string(),
    inputs: z.array(z.string()),
    outputs: z.array(z.string()),
    functional_requirements: z.array(z.string()),
    acceptance_criteria: z.array(z.string()),
    test_scope: testScopeSchema,
  })
  .passthrough();

export type RequirementListItem = z.infer<typeof requirementItemSchema>;

const continuationPayloadSchema = z.object({
  v: z.literal(1),
  items: z.array(requirementItemSchema),
  next: z.number().int().min(0),
});

export type ContinuationPayload = z.infer<typeof continuationPayloadSchema>;

const END_SUMMARY =
  "All requirements in the guided walk have been presented. No further steps.";

/** Terminal id for this tool only (prefixed; not the generic "end" used by other guides). */
export const REQUIREMENT_LIST_STATE_GUIDE_END_ID = "end_requirement_list" as const;

const END_RECORD: RequirementListItem = {
  id: REQUIREMENT_LIST_STATE_GUIDE_END_ID,
  name: "requirement_list_complete",
  depends_on: [],
  summary: END_SUMMARY,
  rationale: "The client has stepped through every requirement in the initialized list.",
  inputs: [],
  outputs: [],
  functional_requirements: [],
  acceptance_criteria: [],
  test_scope: {},
};

const INIT_GUIDANCE =
  "First requirement shown. Call again with current_state set to continuation_state from this response to advance. Large requirement lists produce large tokens; avoid exceeding MCP message limits.";
const ADVANCE_GUIDANCE =
  "Next requirement shown. Pass continuation_state on the following call to continue.";
const FINAL_GUIDANCE =
  "Requirement list walk complete (end_requirement_list). Pass the same current_state to remain at terminal state.";
const ERROR_EMPTY =
  "No requirements provided. Pass a non-empty requirements array on the first call (omit or clear current_state).";
const ERROR_BAD_TOKEN =
  "Invalid or corrupted continuation state. Restart with a fresh requirements array (omit current_state).";
const ERROR_VALIDATION = "Requirement list validation failed.";

export function encodeContinuation(payload: ContinuationPayload): string {
  const json = JSON.stringify(payload);
  return Buffer.from(json, "utf8").toString("base64url");
}

export function decodeContinuation(token: string): ContinuationPayload | null {
  const trimmed = token?.trim();
  if (!trimmed) return null;
  try {
    const json = Buffer.from(trimmed, "base64url").toString("utf8");
    const raw = JSON.parse(json) as unknown;
    const parsed = continuationPayloadSchema.safeParse(raw);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function buildRequirementResponse(
  item: RequirementListItem,
  guidance: string,
  isEnd: boolean,
  continuationState?: string
): Record<string, unknown> {
  const base: Record<string, unknown> = {
    state: item.id,
    guidance,
    is_end: isEnd,
    ...item,
  };
  if (continuationState !== undefined) {
    base.continuation_state = continuationState;
  }
  return base;
}

function buildEndResponse(guidance: string): Record<string, unknown> {
  return buildRequirementResponse(END_RECORD, guidance, true);
}

export type RequirementListStateGuideResponse =
  | Record<string, unknown>
  | { state: "error"; guidance: string; is_end: true };

export function resolveRequirementListStateGuide(args: {
  requirements?: unknown[] | null;
  current_state?: string | null;
}): RequirementListStateGuideResponse {
  const current = args.current_state?.trim();

  if (current) {
    const payload = decodeContinuation(current);
    if (!payload) {
      return { state: "error", guidance: ERROR_BAD_TOKEN, is_end: true };
    }
    const { items, next } = payload;
    const len = items.length;

    if (next >= len) {
      return buildEndResponse(FINAL_GUIDANCE);
    }

    const item = items[next] as RequirementListItem;
    const nextIndex = next + 1;
    if (nextIndex >= len) {
      const endToken = encodeContinuation({ v: 1, items, next: len });
      return {
        ...buildRequirementResponse(item, ADVANCE_GUIDANCE, false),
        continuation_state: endToken,
      };
    }
    const token = encodeContinuation({ v: 1, items, next: nextIndex });
    return {
      ...buildRequirementResponse(
        item,
        next === 0 ? INIT_GUIDANCE : ADVANCE_GUIDANCE,
        false
      ),
      continuation_state: token,
    };
  }

  const reqs = args.requirements;
  if (!Array.isArray(reqs) || reqs.length === 0) {
    return { state: "error", guidance: ERROR_EMPTY, is_end: true };
  }

  const parsedItems: RequirementListItem[] = [];
  for (let i = 0; i < reqs.length; i++) {
    const one = requirementItemSchema.safeParse(reqs[i]);
    if (!one.success) {
      return {
        state: "error",
        guidance: `${ERROR_VALIDATION} Item index ${i}: ${one.error.message}`,
        is_end: true,
      };
    }
    parsedItems.push(one.data);
  }

  const first = parsedItems[0];
  const len = parsedItems.length;

  if (len === 1) {
    const endToken = encodeContinuation({ v: 1, items: parsedItems, next: len });
    return {
      ...buildRequirementResponse(first, INIT_GUIDANCE, false),
      continuation_state: endToken,
    };
  }

  const token = encodeContinuation({ v: 1, items: parsedItems, next: 1 });
  return {
    ...buildRequirementResponse(first, INIT_GUIDANCE, false),
    continuation_state: token,
  };
}
