# [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
# Summary: Bootstrap TIED layout from templates via copy_files.sh — indexes, guides, detail dirs, AGENTS.md family.

# How: Contract — INPUT/OUTPUT/DATA for BOOTSTRAP_TIED below (same IMPL/ARCH/REQ); not separate downstream IMPL calls.
# How: INPUT — project root; template source directory (TIED repo templates/ or equivalent).
# How: OUTPUT — created or updated files under tied/ and selected root files; process exit status.
# How: DATA — requirements.yaml, architecture-decisions.yaml, implementation-decisions.yaml, semantic-tokens.yaml; methodology tree under tied/methodology/ when copied.

procedure BOOTSTRAP_TIED(projectRoot):
  # How: Ensure tied/ exists; copy template indexes; copy guide/schema docs from tied/docs/ in the TIED source per copy_files.sh; create detail subdirs; copy AGENTS.md, .cursorrules to project root; install tied-yaml skill to projectRoot/.cursor/skills/tied-yaml/ (canonical stdio: projectRoot/.cursor/skills/tied-yaml/scripts/tied-cli.sh; do not create projectRoot/scripts/tied-cli.sh).
  # How: Failure path — operator must fix paths or permissions before retry.
  ON missing template source or unwritable destination: exit non-zero with actionable message
  # How: Loop — apply copy_files.sh matrix; shell-only; no cross-IMPL composition in this procedure.
  FOR each copy_files.sh target: apply copy or merge policy; never overwrite client project-only YAML with empty templates where script forbids
  # How: Success — TIED tree ready for REQ/ARCH/IMPL detail files in project scope.
  RETURN success