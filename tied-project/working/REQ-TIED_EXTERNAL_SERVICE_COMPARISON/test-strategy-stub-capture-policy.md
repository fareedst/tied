# Test strategy — stub capture policy (REQ-TIED_EXTERNAL_SERVICE_COMPARISON kaizen)

| Field | Content |
| --- | --- |
| **Work item** | `stub-capture-policy` |
| **Linked PLAN** | [PLAN-stub-capture-policy.md](PLAN-stub-capture-policy.md) |
| **Module boundary** | Bundled `external-service-comparison` skill prose, methodology template, bootstrap static tests, optional capture inventory test, doc retrofits |
| **depth_tier** | `minimal` (packaging + doc policy; no adversarial inquiry on bulk markdown) |

## RED command(s) (author before GREEN)

1. Extend `tools/bootstrap/lib/external-service-comparison-skill.test.mjs`:
   - Skill text includes Waves **1–3** no-source-copy rule
   - Requires stub vocabulary: `does not reproduce` and `Why this file has no article body` (or documented equivalent)
   - Skill must **not** instruct “full article sections” or “offline-readable” vendor body in repo
   - Forbidden lists: extract sidecars, vendor source trees under repo paths

2. Add `tools/bootstrap/lib/comparison-capture-stub-policy.test.mjs`:
   - For each path in **article retrofit set** (post-GREEN): stub marker OR line count ≤ budget
   - Honor **exempt list** from [evidence/retrofit-inventory.md](evidence/retrofit-inventory.md)
   - Register in bootstrap manifest / npm test script if required by repo convention

## Green command(s)

```bash
node --test tools/bootstrap/lib/external-service-comparison-skill.test.mjs
node --test tools/bootstrap/lib/comparison-capture-stub-policy.test.mjs
npm test --prefix mcp-server -- src/e2e/prompt-type-skills.test.ts
```

## Pseudo-code / YAML

```bash
# After STUB_CAPTURE_POLICY block added:
# MCP pseudocode_validate IMPL-TIED_EXTERNAL_SERVICE_COMPARISON
# MCP tied_validate_consistency after REQ satisfaction criterion SC-ESC-NO-SOURCE-COPY
# lint_yaml on touched tied-project YAML
```

## Manual verification (retrofit)

| Check | Method |
| --- | --- |
| Stub preamble | Grep retrofit files for stub section |
| Sibling links | Relative links capture ↔ `*-vs-tied*.md` |
| No extract rows | Netflix capture: no `Local extract` companion path |
| Wave 2 unchanged scope | Spot-check §2 still references stub sibling |

## Proof boundary

- Bootstrap tests prove **skill + file inventory** policy, not operator compliance on future invocations
- Retrofit completeness proven by static test + inventory table, not live URL fetch in CI

## Verification gate (implement)

`checklist-tracker-stub-capture-policy.yaml` → advisory `tied_checklist_gate_validate` phase `verification` when implement complete.