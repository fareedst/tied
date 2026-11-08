# Test strategy — REQ-TIED_BUNDLED_SKILL_PRODUCT_RELEASE

**depth_tier:** `minimal`  
**gate_policy:** `advisory`

## refine-plan (planning artifacts)

| Check | Method | Expected |
| --- | --- | --- |
| CITDP + PLAN + Tracker | File presence | Complete through test-strategy |
| IMPL pseudo-code token comments | `pseudocode_validate` `gate_mode` on sidecar | Pass before pre_implementation |
| Plan gate | `tied_checklist_gate_validate` `pre_implementation` | `allowed: true` |

## build-plan (Slices A–F)

### Mandatory order

1. **RED:** `tools/bootstrap/lib/skill-product-release-validate.test.mjs` and `mcp-server/src/e2e/bundled-skill-product-release.test.ts` fail on missing catalog, semver, or eval trees.
2. **Slice A:** Author `tied-bundle/docs/bundled-skill-product-release.md`; extend `manifest.json` with `BUNDLED_SKILL_RELEASE_CATALOG` until catalog unit test passes.
3. **Slice B:** Implement `skill-product-release-validate.mjs` (static semver, suite atomicity, report staleness hash).
4. **Slice C:** Add `metadata.version: "1.0.0"` and minimal `evals/suite.v1.yaml` + `evals/reports/latest.json` per catalog entry.
5. **Slice D:** Wire `scripts/check-skill-release-bump.sh` (or bootstrap lib) for CI; add non-blocking `bundled-skill-run-evals.yml`.
6. **Slice E:** Operator-local comparison phased table update only.
7. **Slice F:** Full regression battery below.

### test-strategy executable matrix

| Field | Required content |
| --- | --- |
| RED command(s) | `node --test tools/bootstrap/lib/skill-product-release-validate.test.mjs` (fails first); `cd mcp-server && npx tsx --test src/e2e/bundled-skill-product-release.test.ts` (fails first) |
| Green command(s) | Same commands after Slice C baseline |
| Regression | `npx tsx --test src/e2e/prompt-type-skills.test.ts`; `node --test tools/bootstrap/lib/client-skills-catalog.test.mjs`; existing standalone skill e2e files |
| Verification gate | `tied_checklist_gate_validate` phase `verification` + receipt under `gates/` |
| Proof line | Skill eval stub green ≠ Q1 defect arm; charter proof boundary cited in methodology doc |

### Behavioral path globs (diff-aware semver)

- `SKILL.md` (body after closing frontmatter `---`)
- `scripts/**`, `references/**`, `examples.md`, `evals/suite.v1.yaml`
- Exclude: `evals/reports/latest.json`-only updates when refreshing receipt after intentional bump

### Regression boundaries

- Do not add checklist slugs or MCP tools that write project YAML from skill CI.
- Do not make `/run-evals` a required merge check in this REQ.
- Frontmatter changes must keep `prompt-type-skills` and standalone skill install contracts green.

## verification gate

| Check | Method | Expected |
| --- | --- | --- |
| Product release validator | `node --test tools/bootstrap/lib/skill-product-release-validate.test.mjs` | Pass |
| E2e catalog | `cd mcp-server && npx tsx --test src/e2e/bundled-skill-product-release.test.ts` | Pass |
| Prompt-type contract | `npx tsx --test src/e2e/prompt-type-skills.test.ts` | Pass |
| TIED graph | `tied_validate_consistency` | Pass |
| Checklist | `tied_checklist_gate_validate` `verification` | `allowed: true` |

## close-out

Deferred until sponsor `@close-out` with envelope sync per completion-signals-handoff.
