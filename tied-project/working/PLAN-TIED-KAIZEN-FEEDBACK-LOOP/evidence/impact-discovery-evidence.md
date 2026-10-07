# impact-discovery

Request: `PLAN-TIED-KAIZEN-FEEDBACK-LOOP`

In scope for this pass: `docs/tied-kaizen-feedback-loop-plan.md`, `tied-project/vocab/feedback-to-tied.md`, this working folder, and the documentation CITDP.

Read-only neighborhood:

- `mcp-server/src/feedback.ts` defines `feature_request`, `bug_report`, `methodology_improvement`.
- `mcp-server/src/feedback-promotion.ts` maps `user_report` to `feature_request` and other operational sources to `bug_report`.
- Promotion status values are `promotion_pending`, `proposal_created`, `canonical_ready`, `rejected`, `duplicate`.
- REQ-TIED_OPERATIONAL_FEEDBACK_PROMOTION status is `Planned`. ARCH-TIED_FEEDBACK_PROMOTION_BOUNDARY and IMPL-TIED_FEEDBACK_PROMOTION are Active.

No IMPL pseudo-code is in scope. `tied_tokens_new` and `tied_tokens_affected` are empty.

Profile depth for the evidence chain is `not_measured`. Inquiry `depth_tier` is `minimal` and applies only to this pass.
