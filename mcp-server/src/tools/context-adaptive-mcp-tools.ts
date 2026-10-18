/**
 * [REQ-TIED_CONTEXT_ADAPTIVE_ENGINEERING] [IMPL-TIED_CONTEXT_ADAPTIVE_*]
 */

import { z } from "zod";
import { textContent } from "../types.js";
import { loadPracticeLibraryV1 } from "../context-adaptive/contracts.js";
import { validateContextProfileV1 } from "../context-adaptive/profile.js";
import { selectPracticesDeterministicV1 } from "../context-adaptive/selector.js";
import { reassessContextV1 } from "../context-adaptive/reassess.js";

export const contextAdaptiveMcpTools = [
  {
    name: "context_adaptive_practice_validate",
    config: {
      description:
        "Validate practice-contract.v1 documents or a practice library (read-only). [REQ-TIED_CONTEXT_ADAPTIVE_ENGINEERING]",
      inputSchema: z.object({
        contracts: z.array(z.record(z.unknown())).min(1),
      }),
    },
    handler: async (args: { contracts: Record<string, unknown>[] }) => {
      const result = loadPracticeLibraryV1(args.contracts);
      return textContent(JSON.stringify(result, null, 2));
    },
  },
  {
    name: "context_adaptive_profile_validate",
    config: {
      description: "Validate context-profile.v1 (read-only). [REQ-TIED_CONTEXT_ADAPTIVE_ENGINEERING]",
      inputSchema: z.object({
        profile: z.record(z.unknown()),
      }),
    },
    handler: async (args: { profile: Record<string, unknown> }) => {
      const result = validateContextProfileV1(args.profile);
      return textContent(JSON.stringify(result, null, 2));
    },
  },
  {
    name: "context_adaptive_select_practices",
    config: {
      description:
        "Deterministic practice selection producing selection-receipt.v1 (read-only). [REQ-TIED_CONTEXT_ADAPTIVE_ENGINEERING]",
      inputSchema: z.object({
        contracts: z.array(z.record(z.unknown())).min(1),
        profile: z.record(z.unknown()),
        hard_constraints: z
          .array(
            z.object({
              id: z.string(),
              reject_practice_ids: z.array(z.string()).optional(),
            }),
          )
          .optional(),
      }),
    },
    handler: async (args: {
      contracts: Record<string, unknown>[];
      profile: Record<string, unknown>;
      hard_constraints?: { id: string; reject_practice_ids?: string[] }[];
    }) => {
      const library = loadPracticeLibraryV1(args.contracts);
      if (!library.ok || !library.library) {
        return textContent(JSON.stringify(library, null, 2));
      }
      const profile = validateContextProfileV1(args.profile);
      if (!profile.ok || !profile.profile) {
        return textContent(JSON.stringify(profile, null, 2));
      }
      const receipt = selectPracticesDeterministicV1({
        library: library.library,
        profile: profile.profile,
        hard_constraints: args.hard_constraints,
      });
      return textContent(JSON.stringify({ ok: true, receipt }, null, 2));
    },
  },
  {
    name: "context_adaptive_reassess",
    config: {
      description:
        "Compare context profiles and emit reassessment-receipt.v1 (read-only). [REQ-TIED_CONTEXT_ADAPTIVE_ENGINEERING]",
      inputSchema: z.object({
        prior_profile: z.record(z.unknown()),
        revised_profile: z.record(z.unknown()),
        prior_receipt: z.record(z.unknown()),
      }),
    },
    handler: async (args: {
      prior_profile: Record<string, unknown>;
      revised_profile: Record<string, unknown>;
      prior_receipt: Record<string, unknown>;
    }) => {
      const prior = validateContextProfileV1(args.prior_profile);
      const revised = validateContextProfileV1(args.revised_profile);
      if (!prior.ok || !prior.profile || !revised.ok || !revised.profile) {
        return textContent(JSON.stringify({ ok: false, prior, revised }, null, 2));
      }
      const receipt = args.prior_receipt as Parameters<typeof reassessContextV1>[0]["prior_receipt"];
      const result = reassessContextV1({
        prior_profile: prior.profile,
        revised_profile: revised.profile,
        prior_receipt: receipt,
      });
      return textContent(JSON.stringify({ ok: true, receipt: result }, null, 2));
    },
  },
];
