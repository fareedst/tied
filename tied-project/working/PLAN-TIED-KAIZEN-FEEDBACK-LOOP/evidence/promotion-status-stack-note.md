# Promotion record status note

REQ-TIED_OPERATIONAL_FEEDBACK_PROMOTION is `Planned` in the requirements index.

ARCH-TIED_FEEDBACK_PROMOTION_BOUNDARY is Active. IMPL-TIED_FEEDBACK_PROMOTION is Active. `mcp-server/src/feedback-promotion.ts` implements normalization, duplicate grouping, and reviewed proposal creation.

This refine pass does not change requirement status. Status edits on a verification-gated project belong to `tied_verify`, not a hand edit.

A later phase that touches promotion should carry this mismatch through LEAP if the sponsor wants the index status to match the Active implementation.
