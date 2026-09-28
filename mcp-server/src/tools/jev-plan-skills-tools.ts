/**
 * [IMPL-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR]
 */

import path from "node:path";
import { z } from "zod";
import { textContent } from "../types.js";
import { getBasePath } from "../yaml-loader.js";
import { buildPlanSkillsStatus } from "../jev/plan-skills-status.js";
import { runPlanSkillsShadow } from "../jev/plan-skills-shadow.js";
import { PLAN_SKILL_VALUES } from "../jev/plan-skills-types.js";

const planSkillEnum = z.enum(PLAN_SKILL_VALUES);

export const jevPlanSkillsTools = [
  {
    name: "tied_jev_status",
    config: {
      description:
        "Return jev-plan-skills-status.v1 for Cursor plan-skill adjunct (read-only; never probes vendor).",
      inputSchema: z.object({
        project_root: z.string().optional().describe("Client project root; defaults to parent of TIED_BASE_PATH."),
      }),
    },
    handler: async (args: { project_root?: string }) => {
      try {
        const tiedBase = getBasePath();
        const projectRoot = args.project_root ?? path.resolve(tiedBase, "..");
        const payload = buildPlanSkillsStatus(projectRoot);
        return textContent(JSON.stringify(payload, null, 2));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return textContent(JSON.stringify({ ok: false, error: msg }, null, 2));
      }
    },
  },
  {
    name: "tied_jev_vocab_shadow",
    config: {
      description:
        "Run jev-plan-skills-vocab-shadow.v1 advisory shadow for explicit plan skills; optional evidence under working/{token}/jev/plan-skills/.",
      inputSchema: z.object({
        prompt: z.string().min(1),
        skill: planSkillEnum,
        plan_excerpt: z.string().optional(),
        phase: z.string().optional(),
        request_token: z.string().optional(),
        run_id: z.string().optional(),
        record_evidence: z.boolean().optional().default(false),
        project_root: z.string().optional(),
      }),
    },
    handler: async (args: {
      prompt: string;
      skill: string;
      plan_excerpt?: string;
      phase?: string;
      request_token?: string;
      run_id?: string;
      record_evidence?: boolean;
      project_root?: string;
    }) => {
      try {
        const tiedBase = getBasePath();
        const projectRoot = args.project_root ?? path.resolve(tiedBase, "..");
        const payload = await runPlanSkillsShadow({
          projectRoot,
          tiedBasePath: tiedBase,
          prompt: args.prompt,
          skill: args.skill,
          plan_excerpt: args.plan_excerpt,
          phase: args.phase,
          request_token: args.request_token,
          run_id: args.run_id,
          record_evidence: args.record_evidence ?? false,
        });
        return textContent(JSON.stringify(payload, null, 2));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return textContent(
          JSON.stringify({
            schema: "jev-plan-skills-vocab-shadow.v1",
            readiness: "configured_unreachable",
            failure_class: "transport",
            failure_excerpt_redacted: msg.slice(0, 500),
          }, null, 2),
        );
      }
    },
  },
];
