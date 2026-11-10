# PLAN — REQ-TIED_PROJECT_SIZE_OPERATIONAL_UTF8_MASS

**Token:** `REQ-TIED_PROJECT_SIZE_OPERATIONAL_UTF8_MASS`  
**Track:** `@add-feature` → **@refine-plan** (this revision) → `@build-plan` → `@close-out`  
**Parent:** [REQ-TIED_PROJECT_SIZE_LAYERS](../REQ-TIED_PROJECT_SIZE_LAYERS/PLAN.md) (closed v1; additive LEAP)  
**Linked Cursor plan:** `.cursor/plans/operational_utf-8_mass_metrics_4aae86de.plan.md`  
**plan_phase:** `post-build`

---

## Sponsor intent (locked)

Add **UTF-8 byte mass** beside **line counts** in the **operational intent** layer of `project-size-snapshot-receipt.v1`. Dense pseudo-code lines (long `Contract:` blocks, nested control flow) should increase mass without increasing `applied_lines` alone.

**Sponsor metric choice:** `applied_utf8_bytes` family (not JS string length, not LLM tokens).

**Proof boundary:** Unchanged — descriptive evidence only; no grades, no REQ status, no leaderboard.

---

## RESOLVE

| Term | Definition |
| --- | --- |
| **Line** | One physical line in an `IMPL-*-pseudocode.md` body; **non-empty** after `trim()`. |
| **gross_utf8_bytes** | Sum of `Buffer.byteLength(trimmed, 'utf8')` over all non-empty lines (all sidecars). |
| **template_overlap_utf8_bytes** | Sum of UTF-8 bytes for non-empty trimmed lines present in methodology template line set (same match rule as `template_overlap_lines`). |
| **applied_utf8_bytes** | `max(0, gross_utf8_bytes - template_overlap_utf8_bytes)`. |
| **atomTotal** | Same denominator as `operational_intent_per_atom` (vocab + REQ + ARCH + IMPL + corpus graph nodes). |
| **operational_intent_utf8_per_atom** | `applied_utf8_bytes / atomTotal` when `atomTotal > 0`, else `null`. |

---

## Refinements (refine-plan)

1. **Single traversal:** Extract `scanPseudocodeLines(text, templateLines)` returning `{ grossLines, overlapLines, grossUtf8Bytes, overlapUtf8Bytes }` so line and byte metrics cannot diverge.
2. **Invariants (tests):** `applied_utf8_bytes <= gross_utf8_bytes`; `template_overlap_utf8_bytes <= gross_utf8_bytes`; `applied_lines = gross_lines - template_overlap_lines` unchanged.
3. **Receipt schema:** Stay `project-size-snapshot-receipt.v1` — **additive** JSON fields only (backward compatible for readers).
4. **IMPL naming (locked):** New slice **`IMPL-TIED_PROJECT_SIZE_OPERATIONAL_UTF8_MASS`**; **`IMPL-TIED_PROJECT_SIZE_SNAPSHOT`** pseudo-code updated via LEAP (COLLECT_OPERATIONAL_INTENT_LAYER calls shared scan).
5. **Parent REQ:** Add `cross_references` to follow-on token; **do not** regress parent status.
6. **Facilitator wiring:** [project-size-comparison-render.mjs](../../../tools/bootstrap/lib/project-size-comparison-render.mjs) — column **`applied_utf8`** (+ optional **`utf8/atom`**); regenerate dogfood evidence optional at close-out.
7. **Hash:** `operational_intent_hash` unchanged (full merged bodies); byte metrics are derived views, not hash inputs.

---

## Acceptance criteria (REQ detail — for build-plan)

| ID | Criterion |
| --- | --- |
| SC-UTF8-01 | Receipt `layers.operational_intent` includes `gross_utf8_bytes`, `template_overlap_utf8_bytes`, `applied_utf8_bytes` on successful snapshot. |
| SC-UTF8-02 | `cross_layer.operational_intent_utf8_per_atom` present with same null rules as line ratio. |
| SC-UTF8-03 | Registry YAML lists three new metric ids under `operational_intent`. |
| SC-UTF8-04 | Unit test proves equal `applied_lines`, unequal `applied_utf8_bytes` for controlled fixture. |
| SC-UTF8-05 | `npm test` project-size scoped tests green; `tied_validate_consistency` ok. |

---

## Build sequence (`@build-plan`)

| Step | Deliverable |
| --- | --- |
| 1 | MCP enroll REQ / ARCH / IMPL + `semantic-tokens.yaml` |
| 2 | IMPL pseudo-code (slice + LEAP parent snapshot block) |
| 3 | RED tests → [snapshot-builder.ts](../../../mcp-server/src/project-size/snapshot-builder.ts), [types.ts](../../../mcp-server/src/project-size/types.ts) |
| 4 | [project-size-metrics.registry.yaml](../../config/project-size-metrics.registry.yaml) |
| 5 | Catalog + record-wf reference mention (optional one line) |
| 6 | Facilitator comparison column + glossary |
| 7 | `tied_validate_consistency`; evidence manifest |

---

## Out of scope

- D-C4 JSONL backfill; tiktoken; rank/score UX; receipt `schema_version` bump; changing hash algorithm.

---

## Handoff

**Do next:** `@close-out` (optional commit) or refresh facilitator comparison table.
