/**
 * [IMPL-GOAGENT-CHECKLIST-CONTROL] [ARCH-GOAGENT-PIPELINE] [REQ-GOAGENT-PIPELINE-CHAIN]
 * Live queue rewrite after control goto (Go pipeline parity, Phase 4a).
 */
import type { Turn } from "./checklist-load-turns.js";

export function knownStepStubs(turns: Turn[]): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const t of turns) {
    const stub = t.stepStub.trim();
    if (stub !== "") {
      out[stub] = true;
    }
  }
  return out;
}

export function replaceRemainingFromStep(
  turns: Turn[],
  completedIdx: number,
  targetStep: string,
): Turn[] {
  if (completedIdx < 0 || completedIdx >= turns.length) {
    throw new Error(`completed turn index ${completedIdx} out of range`);
  }
  const target = targetStep.trim();
  if (target === "") {
    throw new Error("target step is empty");
  }
  let targetIdx = -1;
  for (let i = 0; i < turns.length; i++) {
    if (turns[i]!.stepStub === target) {
      targetIdx = i;
      break;
    }
  }
  if (targetIdx < 0) {
    throw new Error(`target step not found in turn queue: ${target}`);
  }
  const prefix = turns.slice(0, completedIdx + 1);
  const suffix = turns.slice(targetIdx);
  return prefix.concat(suffix);
}
