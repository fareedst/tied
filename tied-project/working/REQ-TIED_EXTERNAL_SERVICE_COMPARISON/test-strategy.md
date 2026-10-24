# Test strategy — REQ-TIED_EXTERNAL_SERVICE_COMPARISON

| Field | Content |
| --- | --- |
| **Request** | `REQ-TIED_EXTERNAL_SERVICE_COMPARISON` |
| **Module boundary** | Bundled methodology-harness skill + bootstrap contract tests + prompt-type bundle inventory (no runtime ingestion in CI) |
| **RED command(s)** | `node --test tools/bootstrap/lib/external-service-comparison-skill.test.mjs` (add before `SKILL.md` GREEN); extend `mcp-server/src/e2e/prompt-type-skills.test.ts` expectations RED-first |
| **Green command(s)** | Same as RED after skill + manifest wiring |
| **Pseudo-code** | `pseudocode_validate` + `pseudocode_analyze` on `tied-project/implementation-decisions/IMPL-TIED_EXTERNAL_SERVICE_COMPARISON-pseudocode.md` |
| **Enrollment** | `npm test --prefix mcp-server -- src/methodology-production-system-enrollment/methodology-production-system-enrollment.test.ts` (includes `PROMPT_TYPE_LEAF_IDS`) |
| **E2E bundle** | `npm test --prefix mcp-server -- src/e2e/prompt-type-skills.test.ts` |
| **TIED consistency** | `tied_validate_consistency` after project YAML writes |
| **Comparison output contract** | Documented in skill `reference.md`; optional static grep test for 14 section headings in template (no live URL fetch in CI) |
| **Verification gate** | `tied_checklist_gate_validate` phase `verification` with Tracker under `tied-project/working/REQ-TIED_EXTERNAL_SERVICE_COMPARISON/` |
| **Proof line** | Exit code 0 on listed commands + gate receipts; model self-check is not sole proof |
| **Live external fetch smoke** | **not_applicable** — CI proves skill prose and install wiring only; operators run read-only fetch during `@external-service-comparison` invocations |

## Contract test assertions (RED → GREEN)

`external-service-comparison-skill.test.mjs` must fail until GREEN on:

- `disable-model-invocation: true` and directory name `external-service-comparison`
- Reference to `external-service-three-wave-comparison-template.md`
- Mandatory `tied-project/working/DOC-{SLUG}-COMPARISON/` before comparison docs
- Wave 1 + Wave 2 default paths under `docs/comparisons/`
- Claim labels: `target-repo-observed`, `{Vendor}-reported`, `TIED-existing`, `Recommendation-only`, `Defer`, `not_measured`
- Forbidden: `yaml_index_insert`, gate-waiver phrasing, `pbpaste`/`pbcopy`, automatic git
- Wave 3 routes behavior change to `add-feature` / `build-plan` (handoff only)

## Composition / bootstrap

- `manifest.json` managed skill list includes `external-service-comparison`
- Disposable client `tied-install.sh --mode full` installs skill without clobbering custom skills or `mcp.json`
