# [IMPL-TIED_METHODOLOGY_VERSION_ON_DEMAND] [ARCH-TIED_METHODOLOGY_VERSION_ON_DEMAND] [REQ-TIED_METHODOLOGY_VERSION_ON_DEMAND]

Grammar-Version: v2

## RESOLVE_METHODOLOGY_VERSION_WITH_PROVENANCE

- [IMPL-TIED_METHODOLOGY_VERSION_ON_DEMAND] [ARCH-TIED_METHODOLOGY_VERSION_ON_DEMAND] [REQ-TIED_METHODOLOGY_VERSION_ON_DEMAND] How: shared resolver returns version, source, or resolution_error without throwing.
- procedure RESOLVE_METHODOLOGY_VERSION_WITH_PROVENANCE(input):
  - PRE: project_root and/or tied_base_path optional.
  - OUTPUT: TiedMethodologyVersionResolution.
  - POST: readTiedMethodologyVersion throws only when resolution_error set.

## POPULATE_SERVER_INFO_TIED_METHODOLOGY_EXTENSION

- [IMPL-TIED_METHODOLOGY_VERSION_ON_DEMAND] [IMPL-MCP_SERVER_INFO] [REQ-MCP_SERVER_INFO] How: buildServerInfoSnapshot sets extensions.tied.methodology from resolver.
- procedure POPULATE_SERVER_INFO_TIED_METHODOLOGY_EXTENSION(projectRoot):
  - EFFECTS: read-only resolve; no YAML mutation.
  - POST: extensions.tied.methodology present on every snapshot.

## UPDATE_LOADER_DOCS

- [IMPL-TIED_METHODOLOGY_VERSION_ON_DEMAND] [REQ-TIED_SETUP] [REQ-PROMPT_TYPE_SUBAGENT] How: AGENTS, ai-principles, checklist, agents, vocab remove per-turn stamp mandate.
- procedure UPDATE_LOADER_DOCS():
  - EFFECTS: markdown and YAML loader edits in store and tied-bundle.

## DEPRECATE_W7_STAMP_FLAGGING

- [IMPL-TIED_METHODOLOGY_VERSION_ON_DEMAND] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] How: stamp dimensions remain but flagged false with severity warn.
- procedure DEPRECATE_W7_STAMP_FLAGGING():
  - POST: conversation-adherence-score.test.mjs updated.
