# Typed-Flow Client Qualification Harness

Read-only qualification harness for `[REQ-PSEUDOCODE_TYPED_FLOW]` and Phase 2 fleet constraint G1 runs (`[REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION]`).

**Baseline anchor (OD-P2-1):** `48d1fbbbd1c26dfdb3ac6d74b4cb36c60372dcd7` (shorthand **`48d1fbb+`** in receipts and docs)  
**External corpus (read-only):** `/Users/fareed/Documents/dev/test`  
**Never mutate:** client trees under the external corpus.

## Cohort tiers

| Tier | Scope | Mandatory |
|------|-------|-----------|
| A | 10-client production panel | Pass/fail |
| B | stdd `tied/implementation-decisions/IMPL-*-pseudocode.md` | Zero regression |
| C | 5–8 smoke clients (distinct lineage from A) | Report-only run |
| D | `tied-win-diff` stress (optional) | Budget probe |

## Phase 2 fleet G1 (P2-F) — receipts + qualification

G1 advisory analyzer flags (matches gate promotion G1):

- `gate_mode: true`
- `typed_flow: true`
- `constraint_flow: true`
- `constraint_gate_errors: false` (advisory)

**Primary command** (builds `mcp-server`, optional corpus scan, G1 sweep + receipt emit):

```bash
chmod +x working/PSEUDOCODE-CONSTRAINT-STUDY/qualification/scripts/run-harness.sh
working/PSEUDOCODE-CONSTRAINT-STUDY/qualification/scripts/run-harness.sh fleet-g1
```

**Outputs:**

| Path | Role |
|------|------|
| `qualification/fleet-g1/summary.json` | Tier A/B metrics, `qualification_green`, `CORPUS_UNAVAILABLE` when external corpus absent |
| `qualification/fleet-g1/receipts/*.receipt.json` | **constraint-migration-receipt.v1** per manifest entry (+ exemplar smoke) |
| `qualification/fleet-g1/reports/*.g1.report.json` | Raw `pseudocode_analyze` reports (ephemeral, gitignored) |

Collector implementation: `qualification/scripts/lib/constraint-migration-receipt.ts`  
Schema: `working/fleet-constraint-v2/constraint-migration-receipt.v1.schema.json`

If `/Users/fareed/Documents/dev/test` is missing, the harness still runs **Tier B stdd** manifest entries and **fleet exemplars** under `working/fleet-constraint-v2/exemplars/`; `summary.json` records `corpus_status: CORPUS_UNAVAILABLE`.

**Sample receipt JSON Schema validation (AJV):**

```bash
cd /path/to/stdd
npx --yes ajv-cli validate \
  -s working/fleet-constraint-v2/constraint-migration-receipt.v1.schema.json \
  -d working/PSEUDOCODE-CONSTRAINT-STUDY/qualification/fleet-g1/receipts/<entry-id>.receipt.json \
  --spec=draft2020 --strict=false
```

Or validate up to five receipts from the last fleet-g1 run:

```bash
cd working/PSEUDOCODE-CONSTRAINT-STUDY/qualification
node --experimental-strip-types scripts/validate-receipts-sample.ts fleet-g1/receipts/*.receipt.json
```

(Fleet-g1 also runs sample validation automatically and records results in `fleet-g1/summary.json`.)

**Qualification green (Phase 2):**

- **Tier A:** 100% parse ok; zero new `gate_mode` failures vs `baseline/` reports
- **Tier B (stdd):** Zero regression vs baseline `ok` for each sidecar
- **Receipts:** Unknown/truncation mapped in `unknown_summary`; sample AJV validation passes

## Dedupe / exclusion rules

Recorded in `manifest.yaml` per entry:

- Exclude `tied/methodology/**` sidecars
- Exclude methodology-only clients (no project-specific `requirements.yaml` keys)
- Exclude near-duplicate snapshot lineages (same remote + branch + tip within 24h → retain newest)
- Exclude orchestration ephemera (`working/**`, `.cursor/**`)
- Include only project-layer `IMPL-*-pseudocode.md` paths

## Invocation (typed-flow study)

Primary path (in-process analyzer, pins commit via local build):

```bash
working/PSEUDOCODE-CONSTRAINT-STUDY/qualification/scripts/run-harness.sh baseline
```

Individual steps:

```bash
./scripts/run-harness.sh scan      # build manifest.yaml
./scripts/run-harness.sh baseline  # Step 1 — typed_flow: false, gate_mode: true
./scripts/run-harness.sh pilot     # Step 6 — typed_flow: true + regression false
./scripts/run-harness.sh compare   # threshold diff baseline vs pilot
./scripts/run-harness.sh fleet-g1  # Phase 2 G1 + constraint-migration-receipt.v1
./scripts/run-phase3.ts            # Phase 3 — typed_gate_errors: true + R1/R2 checks
```

Phase 3 re-run (after `npm run build --prefix mcp-server`):

```bash
cd working/PSEUDOCODE-CONSTRAINT-STUDY/qualification
npx tsx scripts/run-phase3.ts
```

Writes per-entry reports under `phase3/` (gitignored except `phase3/summary.json`) and
`*.phase3.snapshot.json` under `snapshots/` (gitignored). See `.gitignore` qualification
section for ephemeral vs trackable artifacts.

## TIED_BASE_PATH rotation (MCP spot-check only)

For 2–3 Tier A clients, rotate `TIED_BASE_PATH` to `{client_root}/tied/` in a **fresh process**. Use read-only analyze against manifest absolute sidecar paths. **Never write** via MCP to client trees.

## Out of scope

- Mutating `/Users/fareed/Documents/dev/test`
- Writing to client `tied/` except read-only analyze on copied content
- Layer B validator changes
- Methodology sidecar retrofits
- Mutating client trees under the external corpus

## Layout

```
qualification/
  manifest.yaml
  baseline/           # Step 1 reports (typed_flow: false); *.report.json gitignored
  pilot/              # Step 6 warning-only sweep (gitignored)
  phase3/             # Phase 3 typed_gate_errors sweep (gitignored except summary.json)
  fleet-g1/           # Phase 2 G1 sweep (summary.json tracked; receipts/reports gitignored)
  snapshots/          # byte-stable JSON subsets (gitignored)
  metrics/            # aggregated compare output (summary.json, tier results tracked)
  annotation-study/   # copied sidecars only (Step 6)
  scripts/
    run-fleet-g1-qualification.ts
    lib/constraint-migration-receipt.ts
    run-phase3.ts     # Phase 3 qualification + R1/R2
```
