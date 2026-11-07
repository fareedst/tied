/**
 * [IMPL-PROMPT_TYPE_REFINE_BUILD_PHASE_GUARD] [REQ-PROMPT_TYPE_REFINE_BUILD_PHASE_GUARD]
 * Lint session-handoff.md for refine-plan → build-plan phase / Do next rules (D1–D2).
 */

const PLAN_PHASE_RE =
  /(?:\*\*plan_phase:\*\*\s*|(?:^|\n)\s*plan_phase:\s*)(?:`([^`]+)`|(\S+))/im;

const DO_NEXT_SECTION_RE = /## Do next\s+([\s\S]*?)(?=\n## |\n---\s*\n|$)/i;

/**
 * @param {string} markdown
 * @returns {{ ok: true } | { ok: false; code: string }}
 */
export function lintPlanBuildSequenceHandoff(markdown) {
  const phaseMatch = markdown.match(PLAN_PHASE_RE);
  const phase = phaseMatch?.[1] ?? phaseMatch?.[2] ?? null;
  if (!phase || phase !== "pre-implementation") {
    return { ok: true };
  }

  const doNextMatch = markdown.match(DO_NEXT_SECTION_RE);
  if (!doNextMatch) {
    return { ok: false, code: "missing_do_next_section" };
  }
  const doNextBody = doNextMatch[1];
  const hasBuild = /@build-plan/i.test(doNextBody);
  const hasClose = /@close-out/i.test(doNextBody);

  if (!hasBuild) {
    return { ok: false, code: "pre_implementation_requires_build_plan_in_do_next" };
  }
  if (hasClose && !hasBuild) {
    return { ok: false, code: "pre_implementation_close_out_without_build_plan" };
  }

  return { ok: true };
}
