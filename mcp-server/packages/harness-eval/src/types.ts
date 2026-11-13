/** [REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM] shared eval store types. */

export type HarnessLabel = "cursor" | "claude" | "unknown";

export type TokenCompleteness = "complete" | "incomplete" | "absent";

export interface TokenFields {
  input_tokens: number | null;
  output_tokens: number | null;
  reasoning_tokens: number | null;
  cache_read_input_tokens: number | null;
  cache_creation_input_tokens: number | null;
}

export interface TokenObservation extends TokenFields {
  origin_id: string;
  harness: HarnessLabel;
  source_path: string;
  line_no: number;
  event_type: string;
  completeness: TokenCompleteness;
}

export interface TrialTokenSummary extends TokenFields {
  trial_id: string;
  completeness: TokenCompleteness;
  observation_count: number;
}

export interface WfManifestV1 {
  schema: string;
  wf_id: string;
  harness: string;
  model_slug?: string;
  model_config?: string;
  model_effort?: string;
  started_at?: string;
  finished_at?: string;
  exit_code?: number;
  dry_run?: boolean;
  disposable_tag?: string;
}

export interface HarnessEvalSuiteDoc {
  schema_version: string;
  suite_id: string;
  suite_revision: string;
  description?: string;
  content_integrity_sha256?: string;
  scenarios: unknown[];
}

export interface CrossHarnessTrialRow {
  trial_id: string;
  harness: string;
  input_tokens: number | null;
  output_tokens: number | null;
  wall_clock_ms: number | null;
  config_fingerprint: string | null;
}
