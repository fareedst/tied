/** [REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM] SQLite schema v1 */

export const SCHEMA_VERSION = 1;

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
