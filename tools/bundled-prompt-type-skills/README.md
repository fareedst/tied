# Bundled Prompt-Type Skills

This directory is the git-tracked canonical source for the Prompt Composer
Cursor skills used by TIED projects.

## Inventory

- 13 explicit-only leaf skills:
  `plan-new-feature`, `refine-plan`, `build-plan`, `plan-close-out`, `debug`,
  `question`, `use-skill`, `ammend-commit`, `non-tied-plan`, `non-tied-debug`,
  `leap-ad-hoc`, `leap-diff-promote`, and `other`.
- One explicit-only `prompt-type-router` skill.
- 14 direct Markdown references under `prompt-shared/`.

The source files are copied from the personal Cursor skill bundle during
development, but clients must consume the version committed here.

## Client installation

`copy_files.sh` installs the managed skill directories and `prompt-shared/`
under a client project's `.cursor/skills/`, and installs every
`.cursor/agents/*.md` Task wrapper, including `plan-refine-build`. The installer
refreshes only these managed prompt-type paths; unrelated skills and
`.cursor/mcp.json` remain client-owned.

All leaf skills use relative `../prompt-shared/*.md` references. The source and
installed layouts preserve that one-level relationship so references resolve
without a project-specific rewrite.

## Maintenance

When the Prompt Composer taxonomy or workflow changes:

1. Update the canonical bundle here.
2. Update `tied/docs/prompt-type-skills.md` and
   `tied/vocab/prompt-composer.md`.
3. Update the linked TIED REQ/ARCH/IMPL records through the TIED YAML tools.
4. Run the prompt-type static contract and bootstrap tests.
5. Refresh representative client projects with `copy_files.sh`.
