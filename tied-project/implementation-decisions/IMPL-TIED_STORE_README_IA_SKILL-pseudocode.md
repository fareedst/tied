# IMPL-TIED_STORE_README_IA_SKILL essence pseudocode

```text
procedure REGISTER_README_IA_STORE_FACILITATOR_SKILL:
  # [IMPL-TIED_STORE_README_IA_SKILL] [ARCH-TIED_STORE_README_IA_SKILL_BOUNDARY] [REQ-TIED_STORE_README_IA_SKILL] [REQ-TIED_CLIENT_BOOTSTRAP_SKILLS]
  # How: manifest STORE_FACILITATOR_SKILLS entry points at tools/bundled-readme-information-architecture-skill; store self-install only.

  INPUT: sponsor skill body (reference.md v1.0); manifest.json; store repo root
  OUTPUT: bundled skill tree; updated manifest STORE_FACILITATOR_SKILLS
  PRE: sponsor skill body available (reference.md canonical procedure)
  PRE: skill is not listed in BUNDLED_STANDALONE_CLIENT_SKILLS or tied-bundle methodology copy sets
  EFFECTS: APPEND manifest.json STORE_FACILITATOR_SKILLS { skillName: readme-information-architecture, storeDir: tools/bundled-readme-information-architecture-skill }
  EFFECTS: WRITE tools/bundled-readme-information-architecture-skill/SKILL.md with store boundary + link to reference.md
  EFFECTS: WRITE tools/bundled-readme-information-architecture-skill/reference.md with full IA procedure (v1.0)
  POST: loadStoreFacilitatorSkills returns readme-information-architecture
  POST: store-facilitator-skills.test.mjs and readme-information-architecture-skill.test.ts pass

procedure INSTALL_ON_STORE_SELF_LINKED:
  # [IMPL-TIED_STORE_README_IA_SKILL] [IMPL-TIED_CLIENT_BOOTSTRAP_SKILLS] How: skills-linked.mjs calls installStoreFacilitatorSkillsLinkedStub when projectRoot equals storeRoot.

  INPUT: projectRoot; storeRoot; skillsInstallDir
  OUTPUT: linked SKILL.md stub under skillsInstallDir/readme-information-architecture/
  PRE: REGISTER_README_IA_STORE_FACILITATOR_SKILL complete
  EFFECTS: WHEN isStoreSelfInstall(projectRoot, storeRoot) THEN installStoreFacilitatorSkillsLinkedStub
  POST: .cursor/skills/readme-information-architecture/SKILL.md stub references store bundle path
```
