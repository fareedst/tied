# [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
# Summary: Bootstrap TIED layout from templates via copy_files.sh — indexes, guides, detail dirs, AGENTS.md family, vocab seed, tied-yaml skill.

# How: Contract — INPUT/OUTPUT/DATA for BOOTSTRAP_TIED below (same IMPL/ARCH/REQ); not separate downstream IMPL calls.
# How: INPUT — project root; template source directory (TIED repo templates/ or equivalent); TIED source root (SCRIPT_DIR).
# How: OUTPUT — created or updated files under tied/ and selected root files; process exit status.
# How: DATA — requirements.yaml, architecture-decisions.yaml, implementation-decisions.yaml, semantic-tokens.yaml; methodology tree under tied/methodology/ when copied; tied/vocab/*.md when seeded.

procedure BOOTSTRAP_TIED(projectRoot):
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
  # How: Ensure tied/ exists; copy template indexes; copy guide/schema docs from tied/docs/ in the TIED source per copy_files.sh; create detail subdirs; copy AGENTS.md, .cursorrules to project root.
  ON missing template source or unwritable destination: exit non-zero with actionable message
  FOR each copy_files.sh target: apply copy or merge policy; never overwrite client project-only YAML with empty templates where script forbids
  CALL INSTALL_TIED_YAML_SKILL(projectRoot)
  CALL SEED_DOMAIN_VOCAB(projectRoot)
  RETURN success

procedure INSTALL_TIED_YAML_SKILL(projectRoot):
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
  # How: Copy tied-yaml skill from tools/bundled-tied-yaml-skill/ (canonical); dev fallback .cursor/skills/tied-yaml only if bundle incomplete; overwrite each run; chmod tied-cli.sh executable.
  IF bundled skill at TIED_SOURCE/tools/bundled-tied-yaml-skill/scripts/tied-cli.sh is complete:
    copy bundled skill to projectRoot/.cursor/skills/tied-yaml/
  ELSE IF dev fallback at TIED_SOURCE/.cursor/skills/tied-yaml/scripts/tied-cli.sh is complete:
    warn non-canonical fallback; copy dev skill to projectRoot/.cursor/skills/tied-yaml/
  ELSE:
    exit non-zero with recovery instructions
  CALL PATCH_TIED_CLI_REPO_ROOT(projectRoot)
  # How: Do not create projectRoot/scripts/tied-cli.sh; canonical stdio client is projectRoot/.cursor/skills/tied-yaml/scripts/tied-cli.sh only.

procedure PATCH_TIED_CLI_REPO_ROOT(projectRoot):
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
  # How: Replace TIED_REPO_ROOT placeholder in installed tied-cli.sh with realpath of TIED source so TIED_MCP_BIN resolves to TIED_SOURCE/mcp-server/dist/index.js on client projects.
  cliPath := projectRoot/.cursor/skills/tied-yaml/scripts/tied-cli.sh
  IF cliPath missing: RETURN
  IF cliPath contains unsubstituted marker /ABSOLUTE/PATH/TO/TIED/SOURCE/DIR:
    replace marker with realpath(TIED_SOURCE) once via python3 inline script
  ELSE IF marker line absent: warn and skip (non-fatal)

procedure SEED_DOMAIN_VOCAB(projectRoot):
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP] [PROC-VOCABULARY_INDEX]
  # How: When client tied/vocab/ is missing or has no *.md files, copy all *.md from TIED_SOURCE/tied/vocab/ preserving basename (seed set includes routing.md as primary PRELOAD entry and domain-references.md as full on-demand catalog); never overwrite existing client vocab files.
  dest := projectRoot/tied/vocab/
  IF dest has one or more *.md files: RETURN (client extensions preserved)
  IF TIED_SOURCE/tied/vocab/ missing or empty: warn; RETURN
  FOR each *.md in TIED_SOURCE/tied/vocab/: copy to dest preserving basename
