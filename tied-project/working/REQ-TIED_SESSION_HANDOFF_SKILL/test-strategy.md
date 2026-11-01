# Test strategy — REQ-TIED_SESSION_HANDOFF_SKILL

**Wave 1:** minimal bootstrap (2026-10-18) — satisfied.  
**Wave 2:** structured handoff (2026-11-01) · **depth_tier:** minimal · **gate_policy:** advisory

## Module boundaries

| Module | Boundary |
| --- | --- |
| Structure doc + templates | Committed prose/YAML; no runtime |
| `@handoff` SKILL | Install copy via bootstrap; procedure asserted by doc test |
| DAE `handoff-yaml.ts` | **Out of scope** — no change to schema v1 |

## Wave 2 — RED (before GREEN)

1. Add `tools/bootstrap/lib/session-handoff-structure-doc.test.mjs`:
   - `session-handoff-structure.md` exists under prompt-shared
   - `tied-bundle/templates/session-handoff.v1.template.md` exists
   - `tools/bundled-session-handoff-skill/SKILL.md` references structure doc
   - SKILL resume template includes **Pending prior requests** and **Environment**
   - Template includes **Related and pending prior requests** table header (or equivalent section title)

## Wave 2 — GREEN

1. Implement structure doc, templates, SKILL deltas, charter/index links per [PLAN.md](./PLAN.md)
2. LEAP TIED YAML + pseudocode sidecar

## Verification commands

```bash
node --test tools/bootstrap/lib/client-skills-catalog.test.mjs
node --test tools/bootstrap/lib/session-handoff-structure-doc.test.mjs
cd mcp-server && npm test -- client-bootstrap-skills
```

Post-YAML: `tied_validate_consistency` (MCP).

## Composition / E2E

Not required — doc + bootstrap contract only (same class as Wave 1).

## Security

No network, auth, or persistence changes.
