# [IMPL-ASYNC_REQ_ARCH_GUIDANCE] [ARCH-ASYNC_REQ_ARCH_CONTRACT] [REQ-ASYNC_REQ_ARCH_TEMPLATES]
# Summary: Extend REQ and ARCH authoring guides with async acceptance criteria and architecture prompts for seven semantic classes.


Grammar-Version: v2

procedure AUTHOR_REQ_ASYNC_CRITERIA(doc_root):
  # [IMPL-ASYNC_REQ_ARCH_GUIDANCE] [ARCH-ASYNC_REQ_ARCH_CONTRACT] [REQ-ASYNC_REQ_ARCH_TEMPLATES] — How: add requirements.md section with complete and N/A examples per semantic class.
  Contract:
    INPUT: doc_root: string where length(doc_root) > 0
    PRE: async-methodology glossary exists
    OUTPUT: requirements_guide_updated
    POST: each of seven classes has complete example and explicit N/A example; proof-boundary note present
    EFFECTS: IO
    TERMINATION: total
  APPEND requirements.md async acceptance criteria table
  DOCUMENT detail-files-schema optional async satisfaction_criteria pattern
  RETURN success

procedure AUTHOR_ARCH_ASYNC_PROMPTS(doc_root):
  # [IMPL-ASYNC_REQ_ARCH_GUIDANCE] [ARCH-ASYNC_REQ_ARCH_CONTRACT] [REQ-ASYNC_REQ_ARCH_TEMPLATES] — How: add architecture-decisions.md section with concurrency, delivery, failure, and DATA ownership prompts.
  Contract:
    INPUT: doc_root
    PRE: AUTHOR_REQ_ASYNC_CRITERIA completed
    OUTPUT: architecture_guide_updated
    POST: ARCH prompts cover timeout complete/N/A and retry N/A examples at minimum
    EFFECTS: IO
    TERMINATION: total
  APPEND architecture-decisions.md async architecture decisions table
  RETURN success
