# Test strategy — DOC-SOFTWARE-ENGINEERING-DEGREE-COMPARISON

**Change class:** comparisons doc-only · **profile_depth:** minimal · **no REQ mint**

| Check | Command / action | Pass criteria |
| --- | --- | --- |
| Token grep | `rg '\[REQ-[A-Z0-9_]+\]|\[ARCH-[A-Z0-9_]+\]|\[IMPL-[A-Z0-9_]+\]' docs/comparisons/software-engineering-degree*.md` | No **newly minted** project tokens in body; reference-only cites to existing stdd tokens OK if labeled |
| Claim labels | Manual pass | Curriculum → **Sponsor-proposed**; TIED capability → **TIED-existing**; suggestions → **Recommendation-only**; Wave 3 → **Defer**; effectiveness → **not_measured** |
| Wave 1 exit | Inspect capture | Metadata table, TL;DR, Notes for stdd readers, sibling link to Wave 2; curriculum body unchanged structurally |
| Wave 2 sections | Manual | All **14** template sections (competency-persona adaptation) before Parts I–IV bullet inventory |
| Source inventory | `rg '^## Course [0-9]+'`, `rg '^\d+\\?\. '`, `rg '^- '` on the capture | 16 courses; 167 numbered modules; **887** hyphen list items (**884** under courses + **3** framing bullets before Course 1) |
| Bullet inventory | `evidence/bullet-count-receipt.md` | Per-course counts match [PLAN-refine-pass3.md](./PLAN-refine-pass3.md) table (884 + 3 framing = 887); module titles/objectives are context, not rows |
| Plane column | Sample audit | Each row has M/A/C where applicable; Courses 1–6 mostly **A** + **Defer C** |
| Links | Relative from `docs/comparisons/` | Capture ↔ analysis ↔ [tied-vs-well-known-methodologies.md](../../../docs/comparisons/tied-vs-well-known-methodologies.md), template, AGENTS.md |
| Git allowlist | `.gitignore` | Both comparison paths explicitly unignored |
| Section order | Manual heading audit | Metadata preamble plus the 14 analytical sections; Proof boundary and Related documents remain separate |
| Lint | — | No `lint_yaml` (no TIED YAML changed) |
| Consistency | — | Skip `tied_validate_consistency` unless project YAML touched |

**RED command(s):** not_applicable (doc-only outreach).

**Evidence boundary:** No university accreditation claim; no assertion that TIED replaces CS labs or runtime courses 1–6.
