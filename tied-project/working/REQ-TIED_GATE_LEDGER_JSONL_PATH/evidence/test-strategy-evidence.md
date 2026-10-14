# test-strategy — REQ-TIED_GATE_LEDGER_JSONL_PATH

- RED: `assertJsonlLedgerPath` rejects `.yaml` and non-`.jsonl` (adherence-ledger.test.ts).
- GREEN: existing appendGateDecided / appendStatusMutated tests.
- Regression: `./scripts/lint_yaml.sh -F tied-project`.
