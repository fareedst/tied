# [IMPL-TIED_TESTS_CHECKER_CLAIM_COMPOSE] [ARCH-TIED_TESTS_CHECKER_CLAIM_COMPOSE] [REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE] — Doc compose maintenance.

## MAINTAIN_TESTS_CHECKER_CLAIM_GUIDE
<!-- [IMPL-TIED_TESTS_CHECKER_CLAIM_COMPOSE] [ARCH-TIED_TESTS_CHECKER_CLAIM_COMPOSE] [REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE] — Keeps Wave 3 Phase 1 guide, index links, and contract test aligned. -->

- INPUT: guide_path, index_path, pseudocode_path, test_path
- OUTPUT: Green `tests-checker-claim-compose-doc.test.mjs` | { error: missing_marker }
- PRE: REQ satisfaction criteria SC-GUIDE-DOC, SC-INDEX-LINK, SC-PSEUDOCODE-LINK defined
- POST: tied-bundle/docs/tests-vs-checker-backed-claims.md contains proof boundary and claim classes
- EFFECTS: client-development-index Quick reads link guide and Anthropic comparison

## RECORD_CHECKER_CLAIM_VOCAB
<!-- [IMPL-TIED_TESTS_CHECKER_CLAIM_COMPOSE] [ARCH-TIED_TESTS_CHECKER_CLAIM_COMPOSE] [REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE] — Phase 2 RECORD checker-backed claim and theorem statement in project vocab; bidirectional guide links. -->

- INPUT: qa_vocab_path, guide_path, comparison_path, domain_references_path, routing_path, test_path
- OUTPUT: Green contract test | { error: missing_vocab_bridge }
- PRE: SC-VOCAB-CHECKER-CLAIM, SC-VOCAB-THEOREM-STATEMENT, SC-VOCAB-GUIDE-BIDIRECTIONAL defined on REQ
- POST: quality-assurance.md contains CHECKER_BACKED_CLAIM and THEOREM_STATEMENT with non-implication vs tied_verify; guide links tied-project/vocab/quality-assurance.md; comparison Phase 2 Done
- EFFECTS: domain-references cross-topic and routing keywords updated; no MCP schema change

## COMPOSE_CHECKER_ENVELOPE_PROOF
<!-- [IMPL-TIED_TESTS_CHECKER_CLAIM_COMPOSE] [ARCH-TIED_TESTS_CHECKER_CLAIM_COMPOSE] [REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE] — Phase 3 matrix row 16, guide envelope compose, advisory validate; delegates proof_kind registry to IMPL-TIED_CHECKER_BACKED_ENVELOPE_PROOF. -->

- INPUT: guide_path, matrix_path, comparison_path, validate_module_path, test_paths
- OUTPUT: Green Phase 3 contract tests | { error: missing_envelope_compose_marker }
- PRE: SC-MCM-ROW-16, SC-ENVELOPE-CHECKER-PROOF-KIND, SC-GUIDE-ENVELOPE-COMPOSE defined on REQ
- POST: tests-vs-checker-backed-claims.md contains ## Envelope compose; comparison Phase 3 matrix and envelope Done; benchmark Defer
- EFFECTS: cross-link ARCH-TIED_CHECKER_BACKED_ENVELOPE_PROOF; no Rocq gate wiring
