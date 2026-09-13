# [IMPL-ASYNC_VOCABULARY] [ARCH-ASYNC_REQ_ARCH_CONTRACT] [REQ-ASYNC_REQ_ARCH_TEMPLATES]
# Summary: Maintain async-methodology glossary with seven semantic classes, routing, and proof-boundary disclaimers.


Grammar-Version: v2

procedure PUBLISH_ASYNC_GLOSSARY(source_root):
  # [IMPL-ASYNC_VOCABULARY] [ARCH-ASYNC_REQ_ARCH_CONTRACT] [REQ-ASYNC_REQ_ARCH_TEMPLATES] — How: write tied/vocab/async-methodology.md with preferred terms, synonyms, naming bridges, and non-claims per class.
  Contract:
    INPUT: source_root: string where length(source_root) > 0
    PRE: source_root is readable TIED methodology repository
    OUTPUT: glossary_path
    POST: glossary_path exists; seven semantic classes each have definition, example, and non-claim
    FAILURE_MODES: missing_source
    EFFECTS: IO
    TERMINATION: total
  WRITE tied/vocab/async-methodology.md
  RETURN glossary_path

procedure UPDATE_VOCAB_ROUTING(source_root):
  # [IMPL-ASYNC_VOCABULARY] [ARCH-ASYNC_REQ_ARCH_CONTRACT] [REQ-ASYNC_REQ_ARCH_TEMPLATES] — How: add async keyword route and domain-references catalog entry 5f.
  Contract:
    INPUT: source_root
    PRE: PUBLISH_ASYNC_GLOSSARY completed
    OUTPUT: routing_updated
    POST: routing.md lists async-methodology.md; domain-references.md includes entry 5f
    EFFECTS: IO
    TERMINATION: total
  UPDATE tied/vocab/routing.md async keywords
  UPDATE tied/vocab/domain-references.md catalog
  RETURN success
