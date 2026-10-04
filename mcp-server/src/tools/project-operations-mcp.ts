/**
 * [IMPL-TIED_PROJECT_LINT] [IMPL-TIED_GIT_HYGIENE] [IMPL-TIED_SPONSOR_QUESTIONS]
 * [ARCH-TIED_PROJECT_LINT_BOUNDARY] [ARCH-TIED_GIT_HYGIENE_SAFETY] [ARCH-TIED_SPONSOR_QUESTIONS_BOUNDARY]
 * [REQ-TIED_PROJECT_LINT] [REQ-TIED_GIT_HYGIENE] [REQ-TIED_SPONSOR_QUESTIONS]
 * How: MCP adapters for project operations modules.
 */

import path from "node:path";
import { z } from "zod";
import { textContent } from "../types.js";
import { getBasePath } from "../yaml-loader.js";
import { runProjectLint } from "../project-operations/project-lint.js";
import { runGitHygiene } from "../project-operations/git-hygiene.js";
import { extractSponsorQuestions } from "../project-operations/sponsor-questions.js";

function resolveProjectRoot(projectRoot?: string): string {
  return projectRoot ? path.resolve(projectRoot) : path.resolve(getBasePath(), "..");
}

export const projectOperationsMcpTools = [
  {
    name: "tied_project_lint",
    config: {
      description:
        "[REQ-TIED_PROJECT_LINT] Read-only aggregation of TIED index validation, consistency, optional CITDP DAE sizing, and optional pseudocode gate checks. Does not replace tied_validate_consistency authority.",
      inputSchema: z.object({
        citdp: z.record(z.unknown()).optional(),
        impl_tokens: z.array(z.string()).optional(),
        include_pseudocode: z.boolean().optional(),
      }),
    },
    handler: async (args: {
      citdp?: Record<string, unknown>;
      impl_tokens?: string[];
      include_pseudocode?: boolean;
    }) => {
      const result = runProjectLint({
        citdp: args.citdp,
        impl_tokens: args.impl_tokens,
        include_pseudocode: args.include_pseudocode,
      });
      return textContent(JSON.stringify(result, null, 2));
    },
  },
  {
    name: "tied_git_hygiene",
    config: {
      description:
        "[REQ-TIED_GIT_HYGIENE] Preview untracked files and gitignore suggestions; apply deletes untracked paths only when allowed_paths exactly matches untracked set.",
      inputSchema: z.object({
        project_root: z.string().optional(),
        context_mode: z.enum(["checklist", "plan_close_out", "agent_preview"]).optional(),
        apply: z.boolean().optional(),
        allowed_paths: z.array(z.string()).optional(),
        write_gitignore: z.boolean().optional(),
      }),
    },
    handler: async (args: {
      project_root?: string;
      context_mode?: "checklist" | "plan_close_out" | "agent_preview";
      apply?: boolean;
      allowed_paths?: string[];
      write_gitignore?: boolean;
    }) => {
      const result = await runGitHygiene({
        project_root: resolveProjectRoot(args.project_root),
        context_mode: args.context_mode,
        apply: args.apply,
        allowed_paths: args.allowed_paths,
        write_gitignore: args.write_gitignore,
      });
      return textContent(JSON.stringify(result, null, 2));
    },
  },
  {
    name: "tied_sponsor_questions",
    config: {
      description:
        "[REQ-TIED_SPONSOR_QUESTIONS] Extract costly-choice sponsor questions from CITDP hinge fields, pending decisions, and LEAP queue (read-only).",
      inputSchema: z.object({
        project_root: z.string().optional(),
        citdp: z.unknown().optional(),
        pending_decisions: z
          .array(
            z.object({
              description: z.string(),
              reversibility_evidence: z.string().optional(),
              affects_clients: z.boolean().optional(),
              affects_status: z.boolean().optional(),
            }),
          )
          .optional(),
      }),
    },
    handler: async (args: {
      project_root?: string;
      citdp?: unknown;
      pending_decisions?: Array<{
        description: string;
        reversibility_evidence?: string;
        affects_clients?: boolean;
        affects_status?: boolean;
      }>;
    }) => {
      const result = extractSponsorQuestions({
        project_root: resolveProjectRoot(args.project_root),
        citdp: args.citdp,
        pending_decisions: args.pending_decisions,
      });
      return textContent(JSON.stringify(result, null, 2));
    },
  },
];
