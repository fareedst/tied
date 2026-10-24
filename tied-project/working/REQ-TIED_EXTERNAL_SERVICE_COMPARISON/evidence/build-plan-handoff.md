# build-plan handoff — REQ-TIED_EXTERNAL_SERVICE_COMPARISON

**Date:** 2026-10-23

## Delivered

- `@external-service-comparison` skill: `tools/bundled-prompt-type-skills/external-service-comparison/{SKILL.md,reference.md,examples.md}`
- Contract test: `tools/bootstrap/lib/external-service-comparison-skill.test.mjs` (GREEN)
- Wiring: `manifest.json`, `prompt-type-skills.test.ts`, `PROMPT_TYPE_LEAF_IDS`, enrollment test
- TIED trace: REQ/ARCH/IMPL + pseudo-code sidecar
- Docs: template Wave table, `prompt-type-skills.md`, `client-development-index.md`, `prompt-composer.md`, bundled README

## LEAP

- **depth_tier:** refine `integrated` → implement **`minimal`** for skill packaging (mirror harness trace skills); integrated depth applies to **`DOC-*`** comparison invocations.

## Gates

- `pre_implementation`: **allowed** — receipt `gates/pre_implementation-2026-10-24T05-02-03-668Z.json` (diagnostic `minimal_depth_missing_waiver` non-blocking)
- **close_out:** **deferred** — run `@close-out` for envelope sync and traceable commit when sponsor ready

## Verification commands (GREEN)

```bash
node --test tools/bootstrap/lib/external-service-comparison-skill.test.mjs
npm test --prefix mcp-server -- src/e2e/prompt-type-skills.test.ts src/methodology-production-system-enrollment/methodology-production-system-enrollment.test.ts
TIED_BASE_PATH=$PWD/tied-project .cursor/skills/tied-yaml/scripts/tied-cli.sh pseudocode_validate '{"token":"IMPL-TIED_EXTERNAL_SERVICE_COMPARISON","gate_mode":true}'
```

## Next

- `./tied-install.sh --refresh` on a client to verify `.cursor/skills/external-service-comparison/`
- Invoke **`@external-service-comparison`** with a URL/path for a new comparison (creates `DOC-{SLUG}-COMPARISON/`)
