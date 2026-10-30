# Bullet count receipt — build-plan 2026-10-26

Generated from capture `docs/comparisons/software-engineering-degree.md` and inventory generator output.

| Course | Expected detail rows | Actual detail rows | Match |
| ---: | ---: | ---: | --- |
| Framing | 3 | 3 | yes |
| 1 | 40 | 40 | yes |
| 2 | 45 | 45 | yes |
| 3 | 45 | 45 | yes |
| 4 | 45 | 45 | yes |
| 5 | 50 | 50 | yes |
| 6 | 50 | 50 | yes |
| 7 | 50 | 50 | yes |
| 8 | 51 | 51 | yes |
| 9 | 51 | 51 | yes |
| 10 | 58 | 58 | yes |
| 11 | 61 | 61 | yes |
| 12 | 61 | 61 | yes |
| 13 | 59 | 59 | yes |
| 14 | 78 | 78 | yes |
| 15 | 78 | 78 | yes |
| 16 | 62 | 62 | yes |
| **Total** | **887** | **887** | **yes** |

**Capture checks (2026-10-26):**

- `rg '^## Course [0-9]+'` → **16** courses
- `rg '^- '` on capture → **887** hyphen list items (includes 3 framing bullets before `# I.`)
- Wave 2 inventory data rows (Observance `**M:**` pattern) → **887**

**Regenerate command:** `node tied-project/working/DOC-SOFTWARE-ENGINEERING-DEGREE-COMPARISON/evidence/generate-wave2-inventory.mjs`

**Review pass (2026-10-26):** Regenerated with `interpret-degree-rows.mjs` — point-specific Interpretation (esp. Courses 7–15), Course 13 **Gap** disposition, executive COG table, capture-accurate part titles, Courses 1–16 TOC.

**Review fix (2026-10-26):** `pickPattern` — `\bsort\b` false positive in “standard”; ops before REQ-trace / CI-gate hijacks; Course 1 CLI rule + Course 12 ops interpretation — regen **887** rows unchanged.
