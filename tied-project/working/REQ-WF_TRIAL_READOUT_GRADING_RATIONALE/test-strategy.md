# Test strategy — [REQ-WF_TRIAL_READOUT_GRADING_RATIONALE]

**depth_tier:** minimal · **gate_policy:** advisory · **Proof boundary:** store facilitator docs + static readout corpus (not live matrix).

## RED-first tests (author before implementation)

| ID | Layer | File | Assert |
| --- | --- | --- | --- |
| T-GR-REF-01 | Contract | `tools/bootstrap/lib/trial-readout-grading-rationale-contract.test.mjs` | `tools/bundled-record-wf-trial-skill/reference.md` contains **Session grading rationale** heading/subsection with band patterns and ≥2 examples |
| T-GR-SKILL-01 | Contract | same | `tools/bundled-record-wf-trial-skill/SKILL.md` **Grade** step links or names rationale subsection |
| T-GR-CAT-01 | Contract | same | `docs/demos/catalog-traditional-workflow-trial-prompts.md` facilitator grading section documents **Rationale** column rules (bullet list) |
| T-GR-READOUTS-01 | Composition | same | For each `docs/demos/trial-readout-PROMPT-WF-*.md`: parse `## Session grading` → exactly **7** data rows; rationale ≠ empty/`—`; normalized band ≠ `A` ⇒ rationale length ≥ 15 and not punctuation-only |

## Shared parser (implementation)

| Module | Role |
| --- | --- |
| `tools/bootstrap/lib/read-trial-readout-session-grading.mjs` | Parse markdown table; export `parseSessionGradingTable(markdown)` + `normalizeBand(cell)` |

Unit-level edge cases covered inside contract test `describe` blocks (Unicode minus, **B+**, markdown links allowed in cell).

## Explicitly not tested here

- Maximum word count (~30) — facilitator judgment + spot-check in close-out evidence.
- Registry compact grade string ↔ Band column parity (SC-GR-05 manual).
- GF readouts or future PROMPT-WF files outside glob (out of scope).

## Verification command (close-out)

```bash
node --test tools/bootstrap/lib/trial-readout-grading-rationale-contract.test.mjs
tied_validate_consistency
```
