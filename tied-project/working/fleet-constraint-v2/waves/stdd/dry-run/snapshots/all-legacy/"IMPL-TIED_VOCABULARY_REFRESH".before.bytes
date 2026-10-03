# [IMPL-TIED_VOCABULARY_REFRESH] [ARCH-TIED_VOCABULARY_LAYERS] [REQ-TIED_VOCABULARY_OWNERSHIP]
# Summary: Refresh TIED methodology vocabulary separately from durable client vocabulary while preserving a single discovery handoff.

procedure REFRESH_VOCABULARY(projectRoot, mergeVocab):
  # [IMPL-TIED_VOCABULARY_REFRESH] [ARCH-TIED_VOCABULARY_LAYERS] [REQ-TIED_VOCABULARY_OWNERSHIP]
  # How: Refresh the inherited methodology vocabulary tree, preserve client glossaries, and create missing client routing/catalog handoffs.
  Contract:
    INPUT: projectRoot; TIED source vocabulary; optional mergeVocab flag
    OUTPUT: refreshed tied/methodology/vocab/ and durable tied/vocab/ client layer
    DATA: methodology glossary files; client glossary files; routing/catalog handoffs
    CONTROL: methodology replacement with stale-file pruning; client create-if-missing; source-only exclusion
    PRE: projectRoot is writable; source vocabulary is readable
    POST: methodology files match the current non-source-only source set; client files existing before refresh retain their bytes; handoffs point to both layers
    EFFECTS: File I/O — replaces inherited methodology vocabulary and conditionally creates handoffs; Diagnostics — reports refresh and preservation
    FAILURE_MODES: SOURCE_MISSING; DESTINATION_UNWRITABLE; COPY_FAILED; HANDOFF_WRITE_FAILED
    DATA_TRANSITION: methodology old|absent -> current snapshot; client vocabulary -> unchanged client vocabulary plus absent handoffs
    TERMINATION: total — finite source and client file sets
  CALL REFRESH_METHODOLOGY_VOCABULARY(projectRoot)
  CALL ENSURE_CLIENT_VOCABULARY_HANDOFFS(projectRoot)
  RETURN success

procedure ENSURE_CLIENT_VOCABULARY_HANDOFFS(projectRoot):
  # [IMPL-TIED_VOCABULARY_REFRESH] [ARCH-TIED_VOCABULARY_LAYERS] [REQ-TIED_VOCABULARY_OWNERSHIP]
  # How: Create client routing and catalog handoffs only when absent, so client authors retain durable product vocabulary while agents can reach both layers.
  Contract:
    INPUT: projectRoot; client vocabulary directory
    OUTPUT: client routing.md and domain-references.md handoffs
    DATA: client-owned handoff files; methodology routing/catalog links
    CONTROL: create-if-missing; preserve existing handoff bytes
    PRE: projectRoot is writable or already contains tied/vocab/
    POST: both handoffs exist and link to methodology discovery; existing handoff files are unchanged
    EFFECTS: File I/O — conditionally creates two Markdown files
    FAILURE_MODES: CLIENT_VOCABULARY_DESTINATION_UNWRITABLE; HANDOFF_WRITE_FAILED
    DATA_TRANSITION: absent handoffs -> client discovery handoffs; existing handoffs -> unchanged
    TERMINATION: total — two fixed paths
  IF tied/vocab/routing.md is absent:
    CREATE client routing handoff
  IF tied/vocab/domain-references.md is absent:
    CREATE client catalog handoff
  RETURN success

procedure REFRESH_METHODOLOGY_VOCABULARY(projectRoot):
  # [IMPL-TIED_VOCABULARY_REFRESH] [ARCH-TIED_VOCABULARY_LAYERS] [REQ-TIED_VOCABULARY_OWNERSHIP]
  # How: Replace the methodology vocabulary directory with every allowed canonical glossary and exclude source-only files.
  Contract:
    INPUT: TIED source vocabulary; projectRoot
    OUTPUT: exact non-source-only methodology vocabulary snapshot
    DATA: source *.md files; source-only basename allowlist; destination files
    PRE: source directory is readable
    POST: destination contains exactly the allowed source glossary basenames; stale inherited files are absent; source-only glossary is absent
    EFFECTS: File I/O — removes and copies the inherited vocabulary tree
    FAILURE_MODES: SOURCE_MISSING; DESTINATION_UNWRITABLE; COPY_FAILED
    DATA_TRANSITION: old|absent destination -> current allowed source set
    TERMINATION: total — finite source files
  FOR each source glossary:
    IF basename is source-only: CONTINUE
    COPY source glossary to projectRoot/tied/methodology/vocab/
  RETURN success

procedure MIGRATE_LEGACY_VOCABULARY(clientRoot, apply):
  # [IMPL-TIED_VOCABULARY_REFRESH] [ARCH-TIED_VOCABULARY_LAYERS] [REQ-TIED_VOCABULARY_OWNERSHIP]
  # How: Report mixed or customized files and move only byte-identical methodology glossaries when apply is enabled.
  Contract:
    INPUT: clientRoot; apply flag
    OUTPUT: migration report; optional moved files
    DATA: client *.md files; canonical source bytes; review list
    CONTROL: routing.md and domain-references.md always require review; differing content requires review; unknown files remain client-owned
    PRE: client tied/vocab/ exists
    POST: report-only leaves all files unchanged; apply moves exact methodology files only; mixed files are never split
    EFFECTS: File I/O — reads files and optionally moves exact matches; Diagnostics — emits CANDIDATE, MOVE, and REVIEW lines
    FAILURE_MODES: CLIENT_VOCABULARY_MISSING; SOURCE_MISSING; DESTINATION_CONFLICT
    DATA_TRANSITION: exact legacy methodology file -> methodology snapshot when applied; mixed|unknown -> client-owned unchanged
    TERMINATION: total — finite client files
  FOR each client glossary:
    CLASSIFY as methodology, mixed, or client-owned
    IF methodology and apply: MOVE to tied/methodology/vocab/
    IF mixed: EMIT REVIEW
  RETURN report
