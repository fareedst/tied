# change-definition — REQ-TIED_GATE_LEDGER_JSONL_PATH

**Date:** 2026-10-13

Renamed committed P3 gate adherence ledger from `gate-ledger.v1.yaml` to `gate-ledger.jsonl` and added MCP writer guard so JSONL ledgers cannot use `.yaml`/`.yml` extensions (avoids `lint_yaml` false YAML scan).
