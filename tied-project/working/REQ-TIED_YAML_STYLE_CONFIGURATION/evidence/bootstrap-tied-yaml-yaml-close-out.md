# Close-out evidence — bootstrap `.tied-yaml.yaml`

**Date:** 2026-09-26  
**Plan:** `~/.cursor/plans/bootstrap_tied-yaml.yaml_55dbb2d9.plan.md`  
**profile_depth:** minimal (advisory)

## Scope

Seed client project-root **repository YAML style config** (`.tied-yaml.yaml`) during `copy_files` / `BOOTSTRAP_TIED`:

- `templates/.tied-yaml.yaml` — client-safe `{}` starter (templates-first; not stdd dev root file)
- `manifest.json` `BASE_FILES` + `resolveTemplateFile` for base files
- Contract tests in `claude-harness.test.mjs`
- Windows `windows-bootstrap-smoke.cmd` hard assert
- REQ-TIED_SETUP satisfaction criterion (+ templates mirror)
- IMPL-TIED_FILES pseudo-code, README, vocab, migration note

## Tokens

| Token | Role |
| --- | --- |
| REQ-TIED_SETUP | Explicit satisfaction: bootstrap seeds `.tied-yaml.yaml` when absent |
| REQ-TIED_YAML_STYLE_CONFIGURATION | Style config file location and seed intent |
| IMPL-TIED_FILES | BASE_FILES list and create-if-absent copy policy |
| ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM | Same manifest behavior on Unix/Windows |

## Acceptance criteria (plan)

| # | Criterion | Met |
| --- | --- | --- |
| 1 | Fresh bootstrap creates `.tied-yaml.yaml` from template (no dev keys) | Yes — `claude-harness-test.stdout.txt` |
| 2 | Re-bootstrap unchanged bytes | Yes — idempotency test in harness |
| 3 | Pre-existing custom content preserved | Yes — sentinel test in harness |
| 4 | `templates/.tied-yaml.yaml` passes lint_yaml | Yes — `lint-template-tied-yaml.stdout.txt` |
| 5 | `node --test claude-harness.test.mjs` green | Yes — 19/19 pass |
| 6 | IMPL pseudo-code documents three base files | Yes — `IMPL-TIED_FILES-pseudocode.md` |
| 7 | README documents BASE_FILES | Yes — `tools/bootstrap/README.md` |
| 8 | `tied_validate_consistency` after REQ touch | Yes — `tied-validate-consistency-summary.json` |

## Gitignore hygiene ([PROC-GITIGNORE_CLOSE_OUT])

- **N/A** for new ignore patterns from this slice.
- Parent should **exclude** repo-root `.tied-yaml.yaml` if accidental dev-only modify (methodology repo keeps local dev config).
- Do not stage unrelated `working/REDDIT*`, `mcp-server/working/`, or other untracked program folders.

## Vocabulary RECORD

Recorded in `tied/vocab/tied-methodology.md` and `tied/vocab/tied-yaml-mcp.md` (bootstrap install line). VALIDATE at commit by parent.

## Close-out gates (2026-09-26)

Unified runner: `run-close-out-gates.mjs --envelope-blocking --sync-dispositions --reconcile`  
**merged_decision.allowed:** true — gate **allowed: true**, envelope **blocking_gap_count: 0**  
Receipt: `close-out-gates-2026-09-26.json`
