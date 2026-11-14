# IMPL-TIED_HARNESS_PLATFORM_TAXONOMY — essence pseudocode

```text
# [REQ-TIED_HARNESS_PLATFORM_TAXONOMY] [ARCH-TIED_HARNESS_PLATFORM_TAXONOMY] [IMPL-TIED_HARNESS_PLATFORM_TAXONOMY]
# Sponsor harness/platform taxonomy: vocab RECORD, xlate PRELOAD, contract test — no runtime agentstream change.

RECORD_TAXONOMY_GLOSSARY:
  # [REQ-TIED_HARNESS_PLATFORM_TAXONOMY] [SC-HPT-VOCAB]
  # Writes harness-platform-taxonomy.md; links agentstream, HMEP, Traefik comparison.
  PRE: sponsor terms for model, harness, platform, agentstream placement resolved
  POST: glossary is canonical sponsor bridge
  EFFECTS: routing.md row 2c keywords; domain-references cross-topic note

WIRE_XLATE_PRELOAD:
  # [REQ-TIED_HARNESS_PLATFORM_TAXONOMY] [SC-HPT-XLATE] [REQ-TIED_XLATE_SKILL]
  # Harness/platform benchmarking keywords → PRELOAD taxonomy before generic routing.
  PRE: tools/bundled-xlate-skill/SKILL.md installed
  POST: step 3 cites harness-platform-taxonomy.md path
  EFFECTS: project-operations-mcp /xlate row cross-link

RUN_VOCAB_CONTRACT:
  # [REQ-TIED_HARNESS_PLATFORM_TAXONOMY] [SC-HPT-ROUTE] [SC-HPT-VOCAB]
  # Bootstrap test asserts link graph only (no prose snapshot).
  PRE: test file tools/bootstrap/lib/vocab-harness-platform-taxonomy-contract.test.mjs
  POST: node --test exits 0
  EFFECTS: T-HPT-ROUTE-01, T-HPT-GLOSS-01, T-HPT-XLATE-01, T-HPT-TRAEFIK-01 pass

LINK_RELATED_REQS:
  # [REQ-TIED_HARNESS_PLATFORM_TAXONOMY] [SC-HPT-RELATE]
  # HPS and HMEP related_to include taxonomy REQ; tied_validate_consistency clean.
  PRE: REQ index records exist
  POST: related_to edges bidirectional where required
  EFFECTS: traceability graph closure
```