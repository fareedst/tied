/**
 * [IMPL-TIED_JEV_DECISION_COPROCESSOR] [ARCH-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR]
 * Typed shapes for Jev /v1/decide (System One).
 */

export type JevState = string | Record<string, unknown> | unknown[];

export type JevQuestion =
  | { type: "choice"; instructions: string; criteria: Record<string, string | null> }
  | { type: "score"; instructions: string; criteria: string[] }
  | { type: "noul"; instructions: string; criteria?: Record<string, string> };

export type JevQuestions = Record<string, JevQuestion>;

export type JevDecideRequest = {
  model?: string;
  state: JevState;
  questions: JevQuestions;
};

export type JevChoiceAnswer = {
  type: "choice";
  choice: string;
  confidence: number;
  probabilities: Record<string, number>;
};

export type JevScoreAnswer = {
  type: "score";
  score: number;
  confidence: number;
  probabilities: Record<string, number>;
  legend?: Record<string, string>;
};

export type JevNoulAnswer = {
  type: "noul";
  noul: number;
};

export type JevAnswer = JevChoiceAnswer | JevScoreAnswer | JevNoulAnswer;

export type JevDecideResponse = {
  model: string;
  answers: Record<string, JevAnswer>;
  usage?: {
    input_tokens?: number;
    cost_usd?: number;
    credits_remaining_usd?: number;
  };
};

export type JevSkipReason =
  | "no_credentials"
  | "state_too_large"
  | "provider_misconfigured"
  | "decision_backend_unavailable"
  | "local_timeout"
  | "local_bridge_failed"
  | "malformed_local_response"
  | "unsupported_question_type";

export type JevDecideResult =
  | { ok: true; response: JevDecideResponse }
  | { ok: false; skipped: true; reason: JevSkipReason }
  | { ok: false; skipped: false; error: string; status?: number };
