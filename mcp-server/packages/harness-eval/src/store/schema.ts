/** [REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM] SQLite schema (v3 M3) */

export const SCHEMA_VERSION = 3;

export const MIGRATION_SQL_V1 = `
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY
);
INSERT OR IGNORE INTO schema_version (version) VALUES (1);

CREATE TABLE IF NOT EXISTS trials (
  trial_id TEXT PRIMARY KEY,
  harness TEXT NOT NULL,
  wf_id TEXT,
  config_fingerprint TEXT,
  started_at TEXT,
  finished_at TEXT,
  wall_clock_ms INTEGER,
  exit_code INTEGER,
  input_tokens INTEGER,
  output_tokens INTEGER,
  reasoning_tokens INTEGER,
  completeness TEXT
);

CREATE TABLE IF NOT EXISTS token_observations (
  origin_id TEXT PRIMARY KEY,
  trial_id TEXT NOT NULL,
  harness TEXT NOT NULL,
  source_path TEXT NOT NULL,
  line_no INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  input_tokens INTEGER,
  output_tokens INTEGER,
  reasoning_tokens INTEGER,
  cache_read_input_tokens INTEGER,
  cache_creation_input_tokens INTEGER,
  completeness TEXT NOT NULL,
  FOREIGN KEY (trial_id) REFERENCES trials(trial_id)
);

CREATE INDEX IF NOT EXISTS idx_observations_trial ON token_observations(trial_id);
`;

/** Columns added in M2 — applied idempotently via migrateToV2. */
export const V2_TRIAL_COLUMNS: { name: string; ddl: string }[] = [
  { name: "model_slug", ddl: "ALTER TABLE trials ADD COLUMN model_slug TEXT" },
  {
    name: "pricing_catalog_revision",
    ddl: "ALTER TABLE trials ADD COLUMN pricing_catalog_revision TEXT",
  },
  {
    name: "harness_estimated_cost",
    ddl: "ALTER TABLE trials ADD COLUMN harness_estimated_cost REAL",
  },
  {
    name: "normalized_list_price_cost",
    ddl: "ALTER TABLE trials ADD COLUMN normalized_list_price_cost REAL",
  },
];

/** Columns added in M3 — applied idempotently via migrateToV3. */
export const V3_TRIAL_COLUMNS: { name: string; ddl: string }[] = [
  {
    name: "provider_reported_cost",
    ddl: "ALTER TABLE trials ADD COLUMN provider_reported_cost REAL",
  },
  {
    name: "actual_charged_cost",
    ddl: "ALTER TABLE trials ADD COLUMN actual_charged_cost REAL",
  },
];
