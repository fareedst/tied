# [IMPL-TIED_CLIENT_BOOTSTRAP_SKILLS] [ARCH-TIED_CLIENT_BOOTSTRAP_SKILLS] [REQ-TIED_CLIENT_BOOTSTRAP_SKILLS] — Manifest-driven standalone skill install.

Grammar-Version: v2

## Client bootstrap skills

procedure LOAD_STANDALONE_CLIENT_SKILLS:
  # [IMPL-TIED_CLIENT_BOOTSTRAP_SKILLS] [ARCH-TIED_CLIENT_BOOTSTRAP_SKILLS] [REQ-TIED_CLIENT_BOOTSTRAP_SKILLS] How: read manifest.json BUNDLED_STANDALONE_CLIENT_SKILLS; resolve storeDir/SKILL.md under store root.
  Contract:
    INPUT: { store_root }
    OUTPUT: { entries: object[] }
    PRE: manifest lists skillName and storeDir
    POST: each entry has existing SKILL.md
    EFFECTS: IO | pure
  READ manifest BUNDLED_STANDALONE_CLIENT_SKILLS
  FOR EACH entry RESOLVE path.join(store_root, storeDir, SKILL.md)
  IF missing THEN FAIL STANDALONE_CLIENT_SKILL_MISSING
  RETURN entries

procedure INSTALL_STANDALONE_SKILLS_COPY:
  # [IMPL-TIED_CLIENT_BOOTSTRAP_SKILLS] [ARCH-TIED_CLIENT_BOOTSTRAP_SKILLS] [REQ-TIED_CLIENT_BOOTSTRAP_SKILLS] [REQ-TIED_XLATE_SKILL] How: copyTree each standalone bundle to skillsInstallDir/skillName (Cursor full, Claude full, installXlateSkill wrapper).
  Contract:
    INPUT: { store_root, skills_install_dir }
    OUTPUT: { installed_paths: string[] }
    PRE: LOAD_STANDALONE_CLIENT_SKILLS succeeds
    POST: each skillName/SKILL.md present under skills_install_dir
    DATA_TRANSITION: absent dirs to copied skill trees
    EFFECTS: IO
  CALL LOAD_STANDALONE_CLIENT_SKILLS
  FOR EACH entry CALL copyTreeWithAttributes(storeDir, dest)
  RETURN installed_paths

procedure INSTALL_STANDALONE_SKILLS_LINKED_STUB:
  # [IMPL-TIED_CLIENT_BOOTSTRAP_SKILLS] [ARCH-TIED_CLIENT_BOOTSTRAP_SKILLS] [REQ-TIED_CLIENT_BOOTSTRAP_SKILLS] [REQ-TIED_LAYERED_CLIENT_INSTALL] How: writeSkillStub per entry pointing at store canonical SKILL.md.
  Contract:
    INPUT: { store_root, skills_install_dir }
    OUTPUT: { stub_paths: string[] }
    PRE: LOAD_STANDALONE_CLIENT_SKILLS succeeds
    POST: stub bodies reference store path
    EFFECTS: IO
  CALL LOAD_STANDALONE_CLIENT_SKILLS
  FOR EACH entry CALL buildSkillStubBody AND writeSkillStub
  RETURN stub_paths

procedure ASSERT_STANDALONE_INVENTORY:
  # [IMPL-TIED_CLIENT_BOOTSTRAP_SKILLS] [ARCH-TIED_CLIENT_BOOTSTRAP_SKILLS] [REQ-TIED_CLIENT_BOOTSTRAP_SKILLS] [REQ-TIED_CLAUDE_BOOTSTRAP_OPS] How: claudeManagedInventoryComplete includes standalone skills under skillsRoot.
  Contract:
    INPUT: { skills_root, store_root? }
    OUTPUT: { complete: boolean }
    PRE: true
    POST: true iff every manifest skillName/SKILL.md exists
    EFFECTS: pure
  FOR EACH manifest skillName CHECK skills_root/skillName/SKILL.md
  RETURN complete

procedure EXTEND_CHECK_STORE_REACHABLE:
  # [IMPL-TIED_CLIENT_BOOTSTRAP_SKILLS] [ARCH-TIED_CLIENT_BOOTSTRAP_SKILLS] [REQ-TIED_CLIENT_BOOTSTRAP_SKILLS] [REQ-TIED_LAYERED_CLIENT_INSTALL] How: append each standalone storeDir to required paths before STORE_UNREACHABLE check.
  Contract:
    INPUT: { store_root }
    OUTPUT: { store_root, checked }
    PRE: true
    POST: missing standalone bundle fails reachability
    EFFECTS: IO
  CALL LOAD_STANDALONE_CLIENT_SKILLS
  APPEND each storeDir to required list
  RETURN check result
