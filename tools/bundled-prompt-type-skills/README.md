# Bundled Prompt-Type Skills

This directory is the git-tracked canonical source for the Prompt Composer
Cursor skills used by TIED projects.

## Inventory

- 13 explicit-only **prompt-type** leaf skills:
  `add-feature`, `refine-plan`, `build-plan`, `close-out`, `debug`,
  `question`, `use-skill`, `ammend-commit`, `non-tied-plan`, `non-tied-debug`,
  `leap-ad-hoc`, `leap-diff-promote`, and `other`.
- 4 explicit-only **methodology harness** leaf skills: `harness-trace-review`
  ([REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP](../../tied-project/requirements/REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP.yaml)),
  `harness-trace-analyzer`
  ([REQ-TIED_HARNESS_LANGCHAIN_PHASE3](../../tied-project/requirements/REQ-TIED_HARNESS_LANGCHAIN_PHASE3.yaml)),
  `harness-trace-langsmith-compose`
  ([REQ-TIED_HARNESS_LANGSMITH_COMPOSE](../../tied-project/requirements/REQ-TIED_HARNESS_LANGSMITH_COMPOSE.yaml)),
  `external-service-comparison`
  ([REQ-TIED_EXTERNAL_SERVICE_COMPARISON](../../tied-project/requirements/REQ-TIED_EXTERNAL_SERVICE_COMPARISON.yaml)).
- One explicit-only `prompt-type-router` skill.
- 21 tracked `prompt-shared/` references (includes `agent-shell-working-directory.md`, `agent-shell-script-header.template.sh`, and `gitignore-close-out-hygiene.md`; see `mcp-server/src/e2e/prompt-type-skills.test.ts` `SHARED_REFERENCES`).

The source files are copied from the personal Cursor skill bundle during
development, but clients must consume the version committed here.

## Client installation

`tied-install.sh` installs the managed skill directories and `prompt-shared/`
under a client project's `.cursor/skills/`. Prompt-type Task wrappers under
`.cursor/agents/` (including `add-refine-build`) are TIED-source development
artifacts only and are not copied into client projects. The installer refreshes
only managed prompt-type skill paths; unrelated skills and `.cursor/mcp.json`
remain client-owned.

All leaf skills use relative `../prompt-shared/*.md` references. The source and
installed layouts preserve that one-level relationship so references resolve
without a project-specific rewrite.

## Maintenance

When the Prompt Composer taxonomy or workflow changes:

1. Update the canonical bundle here.
2. Update `tied-bundle/docs/prompt-type-skills.md` and
   `tied-project/vocab/prompt-composer.md`.
3. Update the linked TIED REQ/ARCH/IMPL records through the TIED YAML tools.
4. Run the prompt-type static contract and bootstrap tests.
5. Refresh representative client projects with `tied-install.sh`.
