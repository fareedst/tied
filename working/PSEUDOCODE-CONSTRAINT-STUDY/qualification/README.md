# Typed-Flow Client Qualification Harness

Read-only qualification harness for `[REQ-PSEUDOCODE_TYPED_FLOW]`. Captures pre-pilot analyzer behavior on real clients and stdd project sidecars without mutating external corpus trees.

**Baseline anchor:** commit `7f3d5b0`  
**External corpus (read-only):** `/Users/fareed/Documents/dev/test`  
**Never mutate:** client trees under the external corpus.

## Cohort tiers

| Tier | Scope | Mandatory |
|------|-------|-----------|
| A | 10-client production panel | Pass/fail |
| B | stdd `tied/implementation-decisions/IMPL-*-pseudocode.md` | Zero regression |
| C | 5–8 smoke clients (distinct lineage from A) | Report-only run |
| D | `tied-win-diff` stress (optional) | Budget probe |

## Dedupe / exclusion rules

Recorded in `manifest.yaml` per entry:

- Exclude `tied/methodology/**` sidecars
- Exclude methodology-only clients (no project-specific `requirements.yaml` keys)
- Exclude near-duplicate snapshot lineages (same remote + branch + tip within 24h → retain newest)
- Exclude orchestration ephemera (`working/**`, `.cursor/**`)
- Include only project-layer `IMPL-*-pseudocode.md` paths

## Invocation

Primary path (in-process analyzer, pins commit via local build):

```bash
chmod +x working/PSEUDOCODE-CONSTRAINT-STUDY/qualification/scripts/run-harness.sh
working/PSEUDOCODE-CONSTRAINT-STUDY/qualification/scripts/run-harness.sh baseline
```

Individual steps:

```bash
./scripts/run-harness.sh scan      # build manifest.yaml
./scripts/run-harness.sh baseline  # Step 1 — typed_flow: false, gate_mode: true
./scripts/run-harness.sh pilot     # Step 6 — typed_flow: true + regression false
./scripts/run-harness.sh compare   # threshold diff baseline vs pilot
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
  snapshots/          # byte-stable JSON subsets (gitignored)
  metrics/            # aggregated compare output (summary.json, tier results tracked)
  annotation-study/   # copied sidecars only (Step 6)
  scripts/
    run-phase3.ts     # Phase 3 qualification + R1/R2
```
