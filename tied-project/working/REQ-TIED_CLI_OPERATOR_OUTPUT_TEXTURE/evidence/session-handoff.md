# Session handoff — REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE

**Depth:** minimal · **gate_policy:** advisory · **Close-out:** complete

## Machine

- Tests: `node --test tools/bootstrap/build-commands-how.test.mjs` — 10/10 green
- Close-out gates: `closeout-run-close-out-gates.json` (`merged_decision.allowed: true`)
- CITDP: `tied-project/citdp/CITDP-REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE.yaml`

## Process

- TIED stack in **stdd** `tied-project/`: REQ / ARCH / IMPL + semantic tokens + pseudocode sidecar
- Breaking UX: `how` help defaults to stderr; use `--stdout` or `TIED_CLI_HELP_STDOUT=1` to pipe help

## Ledger

- Full handoff: `evidence/close-out-handoff.md`
- Replay gates: `node tools/bootstrap/templates/run-close-out-gates.mjs --request-token REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE --tracker-path tied-project/working/REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE/checklist-tracker.yaml --citdp-path tied-project/working/REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE/CITDP-REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE.yaml --phase close_out --envelope-blocking --sync-dispositions --reconcile`
