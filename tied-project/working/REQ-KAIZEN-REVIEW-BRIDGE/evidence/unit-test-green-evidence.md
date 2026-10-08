# unit-test-green

`mcp-server/src/feedback-review-bridge.ts` implements RUN_DIGEST_REVIEW_BRIDGE and delegates to `createReviewedLeapProposal` with `canonicalWrite: false` and optional `leap_hints_extra` for digest anchor fields.

Focused suite: `npx tsx --test src/feedback-review-bridge.test.ts` — 9/9 pass. `npx tsc -b` clean.
