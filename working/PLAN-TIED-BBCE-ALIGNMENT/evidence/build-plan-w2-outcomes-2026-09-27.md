# Build-plan W2 outcomes — PLAN-TIED-BBCE-ALIGNMENT

**Date:** 2026-09-27 · **Wave:** W2 Mechanism A spike · **depth_tier:** integrated · **gate_policy:** advisory

## Delivered

- Repo slice map `tied/analysis/agentstream-slice-map.yaml` + `tied/analysis/README.md` + declared surface example.
- Validators `mcp-server/src/analysis/bbce-schemas.ts`, plumb helper `bbce-plumb-locality.ts`, event JSONL `bbce-locality-event.v1`.
- Checklist hook (optional, non-blocking): Tracker `declared_change_surface`; CITDP `risk_analysis.bbce_alignment.declared_change_surface_ref` — `tied/docs/agent-req-implementation-checklist.md` + `.yaml`.
- Plumb audit v2 spike: `plumb-audit-gate-log.v2` when `PLUMB_AUDIT_LOCALITY=1` or `--locality-report` (default off); documented in `docs/plumb-audit-gate.md`.
- Proposed CITDP attach: `working/PLAN-TIED-BBCE-ALIGNMENT/w2-promotion/risk_analysis.bbce_alignment.proposed.yaml`.
- W2 locality re-run: `pilot/w2-locality-run.json`, runner `pilot/run-locality-pilot-w2.mjs`.

## Locality re-run vs W1 baseline

| Scenario | W1 map | W2 repo map | W1 locality | W2 locality | Delta |
| --- | --- | --- | ---: | ---: | ---: |
| replay-claude-live-driver-commit | working pilot slice-map | `tied/analysis/agentstream-slice-map.yaml` | 0.60 | 0.60 | 0 |
| replay-phase3b-strangler-range | working pilot slice-map | `tied/analysis/agentstream-slice-map.yaml` | 0.60 | 0.60 | 0 |

**Drift:** None — repo-promoted map matches W1 working encoding (bindings/globs equivalent).

## Schema versions shipped

| Schema | Role |
| --- | --- |
| `bbce-declared-change-surface.v1` | Pre-implementation declared surface (validator in `bbce-schemas.ts`) |
| `bbce-slice-map.v1` | Repo slice map |
| `bbce-locality-event.v1` | Longitudinal JSONL event (optional append from plumb spike) |
| `plumb-audit-gate-log.v2` | Audit line with `locality_summary_ref` / compact `locality` |
| `bbce-change-locality-report.v1` | Unchanged compare output from `change-locality-pilot` |

## Tests

```
cd mcp-server && npm run build
npx esbuild src/analysis/change-locality-pilot.test.ts --outfile=dist/analysis/change-locality-pilot.test.js --platform=node --format=esm --packages=external
npx esbuild src/analysis/plumb-audit-gate.test.ts --outfile=dist/analysis/plumb-audit-gate.test.js --platform=node --format=esm --packages=external
node --test dist/analysis/change-locality-pilot.test.js dist/analysis/plumb-audit-gate.test.js
```

**Result:** 8 tests pass (4 locality + 4 plumb including v1/v2 audit line shape).

## TIED validation

- `tied_validate_consistency`: **ok: true** (no project YAML token changes in W2).
- `lint_yaml`: pass on changed YAML under `tied/analysis/`, working CITDP, w2-promotion.
- `tied_checklist_gate_validate` (verification, local): **allowed: false** — `integrated_depth_requires_pairing`, `activation_pairing_incomplete`, `missing_pseudocode_gate_history` (expected for working-folder `PLAN-*` request token without REQ-prefixed activation collect; same class as W1 — advisory spike, not checklist enforcement change). Close-out envelope sync **deferred**.


## REQ tokens

None added — W2 is working-folder + analysis modules + checklist docs only; no MCP gate behavior change requiring LEAP.

## Adversarial inquiry

- Root: `working/PLAN-TIED-BBCE-ALIGNMENT/adversarial-inquiry/`
- Phase dirs: `phase-pre_implementation/`, `phase-verification/` (W1 baseline; W2 verification reuses integrated advisory policy)

## W3 entry criteria

- Mechanism **B** shared-code justification sub-pass (full implementation).
- Mechanism **C** boundary violation / slice_map static analysis mode.
- Promote JSONL home + optional CI advisory thresholds; still no hard fail on `change_locality` until sponsor W4+ calibration.

## Proof boundary

Diff-scope discipline only — not behavioral correctness or REQ satisfaction.
