# Pre-close-out evidence index — REQ-TIED_CLAUDE_LIVE_DRIVER

Collected **2026-09-24** before `/plan-close-out REQ A`.

## Machine verification

| Artifact | Path | Status |
| --- | --- | --- |
| Agentstream test log | `evidence/agentstream-npm-test-stdout.txt` | **52 pass / 0 fail** (exit 0) |
| Verification manifest | `evidence/verification-evidence-manifest.v1.json` | Built (`agentstream-npm-test` command) |
| Request envelope | `evidence/request-evidence-envelope.v1.json` | **`request_evidence_envelope_validate` ok**, 0 blocking gaps |
| Adversarial N/A (minimal depth) | `evidence/not-applicable-receipt.v1.json` | Present (backfill) |
| Pseudocode validate | `evidence/pseudocode-validate.json` | From plan-new-feature |
| Sub-adversarial N/A note | `evidence/sub-adversarial-inquiry-pass-na.md` | Waiver / Mode B TS gap |
| CITDP working copy | `../CITDP-REQ-TIED_CLAUDE_LIVE_DRIVER.yaml` | Snapshot of `tied/citdp/…` for `persist-citdp-record` reconcile |

## Gate runner (verification phase)

Command template:

```bash
node tools/bootstrap/templates/run-close-out-gates.mjs \
  --project-root /Users/fareed/Documents/dev/chatgpt/stdd \
  --request-token REQ-TIED_CLAUDE_LIVE_DRIVER \
  --tracker-path working/REQ-TIED_CLAUDE_LIVE_DRIVER/checklist-tracker.yaml \
  --citdp-path tied/citdp/CITDP-REQ-TIED_CLAUDE_LIVE_DRIVER.yaml \
  --phase verification \
  --run-id "verify-REQ-TIED_CLAUDE_LIVE_DRIVER-<timestamp>" \
  --sync-dispositions --reconcile --envelope-blocking
```

Outputs:

- `evidence/run-close-out-gates-verification-stdout.txt` (first run; envelope blocked before NA receipt)
- `evidence/run-close-out-gates-verification-stdout-2.txt` (second run; **merged allowed** after NA receipt)
- `evidence/run-close-out-gates-verification-final.json` (third run; manifest revision conflict diagnostic only)

Latest **verification** gate receipt on disk (pre-final sync): `gates/verification-2026-09-24T02-42-48-910Z.json` (**allowed: true**).

## Reconcile advisories (non-blocking for verification merge)

`tied_adherence_reconcile_run` still reports **completed_with_unresolved_evidence** for plan-stack steps that expect per-step `*-evidence.md` files (e.g. `session-bootstrap-evidence.md`). Parent **REQ-TIED_CLAUDE_HARNESS** close-out ran with similar reconcile noise. Options at close-out:

1. Add lightweight step evidence stubs under `evidence/` referencing envelope + manifest, or  
2. Re-run `sync-dispositions` after close-out agent updates Tracker `evidence_refs` for `unit-test-green` → manifest + stdout.

**Gate receipts (pruned 2026-09-24):** One receipt per phase plus `*-latest.json` symlinks under `gates/`; `ledger.jsonl` compacted to match. Authoritative: `pre_implementation-2026-09-24T02-40-23-882Z.json`, `verification-2026-09-24T02-42-48-910Z.json`, `close_out-2026-09-24T02-52-41-879Z.json`.

**Gitignore ([PROC-GITIGNORE_CLOSE_OUT]):** `.gitignore` now whitelists `REQ-TIED_CLAUDE_LIVE_DRIVER` gates + envelope/manifest/NA receipt (mirror `REQ-TIED_CLAUDE_HARNESS`).

## Not collected (defer to close-out)

- **`close_out` phase** gate with `--envelope-blocking --sync-dispositions --reconcile`
- **`tied_verify`** status flip (REQ → Implemented) — run during close-out with validated checklist gate payload
- **Evidence-chain profile** — skipped (`no_psa_reports` under `working/.../pseudocode-analysis/`)
- **Integrated adversarial inquiry** — N/A at effective minimal depth + waiver

## Suggested next command

`/plan-close-out REQ A` with git preamble; expect close-out runner to refresh verification/close_out receipts against this envelope.
