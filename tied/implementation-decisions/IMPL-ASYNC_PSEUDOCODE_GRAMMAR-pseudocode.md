# [IMPL-ASYNC_PSEUDOCODE_GRAMMAR] [ARCH-ASYNC_CONTRACT_GRAMMAR] [REQ-ASYNC_PSEUDOCODE_CONTRACTS]
# Summary: Document optional v1 async contract rows, template section, pre-async-contract grace, and structural fixture corpus.

procedure DOCUMENT_ASYNC_ROWS(doc_root):
  # [IMPL-ASYNC_PSEUDOCODE_GRAMMAR] [ARCH-ASYNC_CONTRACT_GRAMMAR] [REQ-ASYNC_PSEUDOCODE_CONTRACTS] — How: add pseudocode-format-and-practices §4a and implementation-decisions preferred vocabulary rows.
  Contract:
    INPUT: doc_root
    PRE: W0 glossary and REQ/ARCH guidance exist
    OUTPUT: grammar_docs_updated
    POST: all seven optional rows documented with valid and insufficient examples; CONTROL ordering noted as v1 vehicle
    EFFECTS: IO
    TERMINATION: total
  UPDATE pseudocode-format-and-practices.md section 4a
  UPDATE implementation-decisions.md preferred vocabulary
  UPDATE templates/impl-essence-pseudocode-template.md optional async section
  RETURN success

procedure PUBLISH_FIXTURE_CORPUS(working_root):
  # [IMPL-ASYNC_PSEUDOCODE_GRAMMAR] [ARCH-ASYNC_CONTRACT_GRAMMAR] [REQ-ASYNC_PSEUDOCODE_CONTRACTS] — How: create ≥14 pos/neg fixtures and manifest; legacy no-async corpus remains green.
  Contract:
    INPUT: working_root
    PRE: DOCUMENT_ASYNC_ROWS completed
    OUTPUT: fixture_manifest
    POST: fourteen fixtures (one pos+neg per semantic class); manifest documents pre-async-contract N/A for legacy
    DATA: fixture_manifest
    EFFECTS: IO
    TERMINATION: total
  WRITE working/REQ-TIED_ASYNC_METHODOLOGY/fixtures/async-contract/*.pseudocode.md
  WRITE fixture-manifest.json
  RUN tied-async-contract-fixtures.test.ts
  RETURN fixture_manifest
