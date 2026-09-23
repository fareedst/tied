/**
 * [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-GOAGENT-PIPELINE] [REQ-GOAGENT-PIPELINE-CHAIN]
 * Pipeline session/chain helpers (Go pipeline/pipeline.go parity subset).
 */
import type { Turn } from "./checklist-load-turns.js";

export function chainBetween(turns: Turn[]): boolean[] {
  if (turns.length < 2) {
    return [];
  }
  const out: boolean[] = [];
  for (let i = 0; i < turns.length - 1; i++) {
    out.push(turns[i + 1]!.chainFromPrevious);
  }
  return out;
}

export function sliceFromFirstTurn(turns: Turn[], first: number): Turn[] {
  if (first < 1) {
    throw new Error("--first-turn must be >= 1");
  }
  if (first > turns.length) {
    throw new Error(`--first-turn ${first} exceeds turn count ${turns.length}`);
  }
  return turns.slice(first - 1);
}

export function sessionForTurn(
  idx: number,
  initialSession: string,
  chain: boolean[],
  runningSession: string,
): string {
  if (idx === 0) {
    return initialSession;
  }
  if (chain.length < idx) {
    return "";
  }
  if (chain[idx - 1]) {
    return runningSession;
  }
  return "";
}
