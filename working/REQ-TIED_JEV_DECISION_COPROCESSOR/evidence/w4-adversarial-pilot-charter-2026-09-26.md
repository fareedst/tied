# W4 adversarial triage pilot charter — 2026-09-26

## Scope

Pre-sort **candidate** criterion alignment using Jev fan-out **nouls** before (or alongside) human review. This is **not** integrated `[REQ-TIED_ADVERSARIAL_INQUIRY]` activation.

## In scope

- Labeled cases derived from `adversarial-inquiry-go-rootjobs` fidelity statements + synthetic gaps
- `adversarial-triage-pilot.v1` JSON report under `evidence/`
- Mocked unit tests + optional `--live` replay with `JEV_API_KEY`

## Out of scope

- `tied_adversarial_inquiry_run` receipts
- `finding-ledger.jsonl` / obligation-report mutations
- Client `1787603099` gate fixture automation (future slice)

## Acceptance

- Unit tests pass for classify/compare/observe paths
- Live run: document `agreement_rate` in evidence; target ≥90% on labeled v1 fixture or record systematic disagreements

## Operator commands

```bash
cd mcp-server
bun test src/jev/adversarial-triage-pilot.test.ts
bun run scripts/replay-jev-adversarial-triage-pilot.ts
JEV_API_KEY=... bun run scripts/replay-jev-adversarial-triage-pilot.ts --live
```
