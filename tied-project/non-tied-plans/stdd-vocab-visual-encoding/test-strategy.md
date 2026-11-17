# Test strategy — stdd-vocab-visual-encoding

**Slug:** `stdd-vocab-visual-encoding`  
**Track:** non-TIED documentation and vocab artifacts only — no automated product tests.

## Verification (build-complete gate)

| Id | Check | Method |
| --- | --- | --- |
| V1 | Term coverage | Run `node evidence/build-term-index.mjs`; every preferred/index term in 27 glossaries maps to exactly one D4 row (merged duplicates documented) |
| V2 | Domain budget | D1 lists exactly **7** `dom.*` ids |
| V3 | Override seed | §2.4 edge-case terms in PLAN present in D3 with matching domains |
| V4 | Dedupe | Cross-glossary duplicates single row or disambiguated Notes — no conflicting domains for same bold string |
| V5 | Regen stability | Second `build-term-index.mjs` run produces zero diff on D4 |
| V6 | Links | `routing.md` + `domain-references.md` link D1 and `docs/visual-encoding-standards.md`; D1 links D4 |
| V7 | Accessibility | D1 includes grayscale + CVD + label-first legend; Tier A legends name `dom.*` / `layer.*` |
| V8 | Tier A | T1–T4 each have palette comment, legend, and consistent `classDef` names documented in D6 |
| V9 | YAML lint | `visual-encoding-domains.v1.yaml`, D2, D3 parse as valid YAML (manual or `node -e` load) |
| V10 | Anti-patterns | Spot-check vs [informative-color-coding reference](../../../../.cursor/skills/informative-color-coding/reference.md) § Anti-patterns |

## Build results (2026-11-16)

| Id | Result |
| --- | --- |
| V1 | pass — **1083** master index rows (table + alphabetical extraction; post-dedupe by normalized key) |
| V2 | pass |
| V3 | pass — 20 override keys in D3 |
| V4 | pass — override file resolves harness profile / vendor agent harness split |
| V5 | pass — double regen same row count |
| V6 | pass |
| V7 | pass — D1 gate + Tier A legend notes |
| V8 | pass — T1–T4 encoded; W1 sequence uses prose legend |
| V9 | pass |
| V10 | pass — ≤7 dom hues; multi-channel labels |

## Out of scope

- `dotnet test`, Mermaid CLI render, automated WCAG contrast tooling (optional `@color-expert` follow-up)
- Editing all 27 glossary headers (deferred D8b)