# Evidence chain profile (`evidence-chain-profile.v1`)

**Tokens:** `[REQ-EVIDENCE_CHAIN_PROFILE]` `[ARCH-EVIDENCE_CHAIN_PROFILE]` `[IMPL-EVIDENCE_CHAIN_PROFILE]` `[REQ-EVIDENCE_CHAIN_REPORT]` `[ARCH-EVIDENCE_CHAIN_REPORT]` `[IMPL-EVIDENCE_CHAIN_REPORT]` `[PROC-EVIDENCE_CHAIN]`

A versioned, read-only **evidence chain profile** reports completeness, provenance, denominators, and **proof boundaries** across:

`domain vocabulary → REQ → ARCH → IMPL pseudo-code → tests → code → composition → quality evidence → change outcome`

It is not an **assurance profile**, not a **verification evidence manifest**, and not a universal maturity score.

## Evidence-chain profile depths

`profile_depth` is independent of inquiry `research_profile` and of **assurance profiles**.

| Depth | Collects | Must not invoke |
|---|---|---|
| `integrated` | Structural validators, traceability partition, quality partition | `AUDIT_IMPL_FIDELITY`, `ANALYZE_BINDING_EVIDENCE`, `ANALYZE_SPECIFICATION_STATE` |
| `human_research` | Everything in `integrated`, plus fidelity and binding adapters | Finding-ledger append, case promotion, `runFirstSlice` / `runFidelityResearchPilot` wholesale |

`human_research` without `change_context` **succeeds**. `change_fidelity` is `not_measured` / `not_applicable`.

## MCP / CLI (Path A)

### Prerequisites

For **observed** `quality.command_results` (`executable_behavior` proof boundary), collect a **verification evidence manifest** first and pass `manifest_reference` into the generator. See [quality-evidence-manifest.md](./quality-evidence-manifest.md) and `[PROC-QUALITY_EVIDENCE_PROVENANCE]`.

For **observed** structural validator rows, supply live structural validator results. MCP accepts optional `invoke_structural_validators: true` (default `false` for backward compatibility) to run the six structural validators internally and attach results. Without manifest or structural wiring, derived fields correctly remain `not_measured` (fail-closed).

Typical attach-provenance flow:

```bash
TIED_BASE_PATH=/absolute/client/tied \
  .cursor/skills/tied-yaml/scripts/tied-cli.sh \
  quality_evidence_collect_manifest @collect-args.json \
  > working/evidence-chain/verification-evidence-manifest.v1.json

TIED_BASE_PATH=/absolute/client/tied \
  .cursor/skills/tied-yaml/scripts/tied-cli.sh \
  evidence_chain_profile_generate @profile-args-with-manifest-ref.json \
  > working/evidence-chain/profile.json
```

Example `profile-args-with-manifest-ref.json`:

```json
{
  "profile_depth": "integrated",
  "manifest_reference": "working/evidence-chain/verification-evidence-manifest.v1.json",
  "invoke_structural_validators": false,
  "run_metadata": { "run_id": "pilot-001", "commit": "abc123" }
}
```

Bare profile (no attach):

```bash
TIED_BASE_PATH=/absolute/client/tied \
  .cursor/skills/tied-yaml/scripts/tied-cli.sh \
  evidence_chain_profile_generate @profile-args.json > working/evidence-chain/profile.json
```

Required: `profile_depth`. Optional: `project_root`, `tied_base_path` (must match `tied_config_get_base_path`), `scope`, `change_context`, `manifest_reference`, `invoke_structural_validators`, `output_mode` / `output_path`.

**Fail closed** when the requested **TIED base path** is not `project_root/tied` or does not match the confirmed MCP base path (`WrongTiedBasePath`).

**Read-only:** never write project REQ/ARCH/IMPL, methodology YAML, finding ledgers, or case reports. `output_path` may only target a caller-selected non-intent file (for example `working/evidence-chain/{run_id}.json`).

## Path B (manual)

Same schema with `identity.generator: manual`. Required:

- `assumptions[]`
- `confidence`
- `unsupported_checks[]`

Do not claim MCP validator results that were not run. Mark fidelity/binding `not_measured` when tooling is unavailable.

## Derived-field contract

Every derived field carries `source`, `method`, `denominator`, and `proof_boundary`. Missing evidence is `not_measured`, `unknown`, or `not_applicable` — never a silent zero. Forbidden keys: `maturity`, `score`, `maturity_score`, `universal_score`.

## Proof-boundary partition

- `traceability_structure`
- `pseudo_code_structure`
- `semantic_fidelity`
- `executable_behavior`
- `human_decision`

Methodology, templates, fixtures, and generated output are excluded from production conclusions.

## Comparison rules

Two profiles are comparable only when `schema_version`, `profile_depth`, and each ratio `denominator` match. Do not rank clients with a rollup score.

## Opt-in metrics

When `TIED_MCP_COLLECT_METRICS` is enabled, records may include hashed `project_id`, `run_id`, `profile_depth`, `scope_hash`, and `commit`. The profile field `operational.metrics_opt_in` must reflect `isMetricsEnabled()` at generation time (true when env opt-in is active, false otherwise). Those fields are optional **tool-usage metrics** only. They are not **evidence chain statistics report** results.

## Multi-client evidence chain statistics report

**Tokens:** `[REQ-EVIDENCE_CHAIN_REPORT]` `[ARCH-EVIDENCE_CHAIN_REPORT]` `[IMPL-EVIDENCE_CHAIN_REPORT]`

A TIED-source offline aggregator consumes already-generated **evidence chain profile** artifacts. It never generates profiles, never walks a client `project_root`, and never mutates project YAML, methodology YAML, finding ledgers, or case reports.

### Report input manifest (`evidence-chain-report-inputs.v1`)

```yaml
schema_version: evidence-chain-report-inputs.v1
mode: strict                    # strict | partial; CLI --mode overrides
include_absolute_paths: false   # default; true keeps full profile_path in outputs
inputs:
  - profile_path: stdd-integrated.json   # required; relative to cwd or absolute
    client_alias: stdd                   # optional display name
    notes: optional
```

Stable identity is the profile hashed `project_id`. `client_alias` is display-only and is not part of the duplicate key.

Duplicate key: `(project_id, commit, profile_depth, scope_hash)`. `scope_hash` comes from `operational.scope_hash` or a hash of the canonical `scope` object.

### Modes and errors

| Mode | Rejected input (missing, malformed, forbidden field, duplicate) | Zero accepted profiles |
|---|---|---|
| `strict` (default) | Exit `2`; write no `yaml_out` / `markdown_out` | Exit `2`; no outputs |
| `partial` | Exclude the input with a reason; continue | Exit `1`; no outputs |

### Compatibility key and **client cohort**

`compatibility_key = schema_version + "|" + profile_depth`

Incompatible **evidence-chain profile depth** or `schema_version` values become separate **client cohort** partitions. v1 does **not** split on numeric denominator *values*. v1 does **not** sum or average derived-field `value` numbers. There is no cross-cohort rollup and no universal ranking.

When bare and reprofile runs share a **compatibility key** but derived-field **denominators** differ (observed on client `1787461685`), v1 emits residual risks yet still rolls up under one cohort. v2 addresses this with **denominator fingerprint** sub-cohorts (gate III approved 2026-08-23).

### YAML report v2 (`evidence-chain-statistics-report.v2`)

Opt-in via CLI `--report-version v2` (default remains v1). Adds:

- `denominator_fingerprint` on each accepted input row (stable hash of required derived-path denominators plus structural denominators)
- **Denominator subcohort** partitions inside each **client cohort** when fingerprints differ
- Named statistic `denominator_subcohort_count` (count-only; **proof boundary** `traceability_structure`)
- Residual-risk refinement: suppress cohort-level "incompatible denominators" when sub-cohorts already isolate the mismatch

v2 non-goals unchanged: no maturity score, no averaging derived-field values, no client-root walk, no project YAML mutation.

Golden fixture: `working/evidence-chain/report-inputs-v2-golden.yaml` with `client-1787461685-bare.v1.json` and `client-1787461685-reprofile.v1.json` (same `project_id`, two sub-cohorts).

### YAML report (`evidence-chain-statistics-report.v1`)

Authoritative machine document. Required top-level keys:

- `schema_version`: `evidence-chain-statistics-report.v1`
- `generated_at`: injected clock (tests pin this)
- `generator_version`
- `mode`
- `include_absolute_paths`
- `inputs[]`: `project_id`, `client_alias`, `commit`, `profile_depth`, `artifact_ref`, `profile_hash`, `compatibility_key`, `generator`, `generator_version`
- `cohorts[]`: `compatibility_key`, `clients[]`, `statistics[]`
- `excluded_inputs[]`
- `validation_errors[]`
- `residual_risks[]`

`artifact_ref` is the profile basename unless `include_absolute_paths` is true.

Each named statistic carries `name`, `numerator`, `denominator`, `status`, `source`, `method`, and `proof_boundary`.

v1 named statistics (count-only):

- `cohort_profile_count`
- `unique_project_id_count`
- `measurement_status_count` (per required derived-field path and status)
- `proof_boundary_partition_count` (per **proof boundary**)
- report-level `excluded_input_count` and `validation_error_count`

Statuses remain `observed`, `not_measured`, `unknown`, and `not_applicable`. Missing evidence is never coerced to zero.

Forbidden keys anywhere in an input profile or the output report: `maturity`, `score`, `maturity_score`, `universal_score`.

### Markdown contract

`report.md` is a deterministic projection of the YAML values. It must not invent statistics. Sections: generated time and mode; input and cohort counts; per-cohort statistics; coverage / **proof boundary** summary; excluded inputs; validation errors; residual-risk and provenance notes. A failed rerun removes stale generated outputs before returning its error.

### CLI

```bash
node /path/to/stdd/mcp-server/dist/cli/evidence-chain-report.js \
  --inputs /path/to/report-inputs.yaml \
  --yaml-out /path/to/working/evidence-chain-report/report.yaml \
  --markdown-out /path/to/working/evidence-chain-report/report.md \
  [--mode strict|partial] \
  [--report-version v1|v2]
```

Output paths must be caller-selected non-intent files (example `working/evidence-chain-report/`). Reject writes under `tied/requirements`, `tied/architecture-decisions`, `tied/implementation-decisions`, or `tied/methodology`.

### Distribution

- This guide is client-copied via `copy_files.sh` `DOCS_TO_COPY` (copy-when-missing).
- `[REQ-EVIDENCE_CHAIN_PROFILE]` records are promoted into `templates/` so clients can cite generation.
- `[REQ-EVIDENCE_CHAIN_REPORT]` records stay **source-repository-only**; clients invoke the TIED-source CLI, they do not inherit aggregator tokens.
- Source installation contract: from a checked-out TIED source repository, run `npm ci` and `npm run build` in `mcp-server/`, then invoke `mcp-server/dist/cli/evidence-chain-report.js`. The CLI is not installed by `copy_files.sh` and is not expected to be available from a client-only checkout.

## v1 non-goals

Block-level IMPL↔test matrices; generator-side cross-project aggregation; automatic TIED mutation; vocabulary drift automation beyond presence/linkage; generator-side finding append or case promotion; summing or averaging derived-field values in the statistics report; live client-root traversal.
