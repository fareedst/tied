# test-strategy

Outline in `CITDP-REQ-KAIZEN-SOURCE-NORMALIZATION.yaml` test_strategy.

RED tests (at build-plan) must fail on current `user_report` → `feature_request` mapping and pass only after shared inference lands.

Composition: extend `batch-5-mcp.test.ts` operational_add binding with kind and entry_type assertions.

No E2E (MCP/file surfaces only).
