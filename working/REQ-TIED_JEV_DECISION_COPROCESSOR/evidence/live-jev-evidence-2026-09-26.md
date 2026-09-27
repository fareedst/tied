# Live Jev API evidence — REQ-TIED_JEV_DECISION_COPROCESSOR

**Date:** 2026-09-26  
**Operator:** sponsor-provided `JEV_API_KEY` (env-only; **not** stored in repo)  
**Model pin (default):** `jev-1.13.0` per `mcp-server/src/jev/constants.ts`

## Commands (from repo root)

```bash
cd mcp-server
export JEV_API_KEY='…'   # never commit; use local env or secret store

bun scripts/replay-jev-vocab-shadow.ts --live
bun scripts/replay-jev-prompt-type-advisory.ts --live
bun scripts/replay-jev-adversarial-triage-pilot.ts --live \
  --out ../working/REQ-TIED_JEV_DECISION_COPROCESSOR/evidence/adversarial-triage-pilot-report-live.v1.json
```

## W2 — vocab shadow (`--live`)

| Metric | Value |
| --- | --- |
| Prompts | 10 |
| `jev_invoked` | 10 / 10 |
| Keyword vs Jev **agreement_rate** | **0.70** (threshold in script: ≥ 0.90 → exit 1) |
| Artifacts | [w2-live-replay.stdout.txt](./w2-live-replay.stdout.txt), [w2-live-replay.stderr.txt](./w2-live-replay.stderr.txt) |

**Systematic disagreements (3):** Jev often adds `quality-assurance` or selects `leap-proposal-queue` where keyword routing is empty or narrower — document as tie-break / shadow tuning candidates, not PRELOAD behavior change.

## W3 — prompt-type advisory (`--live`)

| Metric | Value |
| --- | --- |
| Fixture lines | 8 (`fixtures/prompt-type-advisory-prompts.jsonl`) |
| Exit | 0 |
| Artifacts | [w3-live-replay.stdout.txt](./w3-live-replay.stdout.txt) |

## W4 — adversarial triage pilot (`--live`)

| Metric | Value |
| --- | --- |
| `jev_invoked` | **true** |
| Label agreement_rate | **5/6 ≈ 0.833** (script threshold ≥ 0.90 → exit 1) |
| Mismatch | `synthetic-spec-gap` — human label vs `implementation_drift` noul |
| Artifacts | [adversarial-triage-pilot-report-live.v1.json](./adversarial-triage-pilot-report-live.v1.json), [w4-live-replay.stderr.txt](./w4-live-replay.stderr.txt) |

Fixture-only baseline (CI): [adversarial-triage-pilot-report.v1.json](./adversarial-triage-pilot-report.v1.json) (`jev_invoked: false`).

## Interpretation

- Live runs **confirm** end-to-end HTTP + parsing; they do **not** reopen REQ close-out (W2/W4 acceptance was fixture/CI OR document disagreements).
- Sub-0.90 agreement is **evidence for threshold tuning** and glossary tie-break policy, not a gate failure for the closed program.
- **Security:** API key was supplied in chat; prefer env/1Password and **rotate** if the chat log is retained.

## Non-goals

- No change to keyword PRELOAD authority in `tied/vocab/routing.md`.
- No `tied_adversarial_inquiry_run` integrated activation.
