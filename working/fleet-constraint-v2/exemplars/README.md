# Fleet constraint v2 — authoring exemplars (Phase 2 P2-E)

Reference sidecars for **constraint-ready-v2** authoring targets. These are **copies** for qualification and template alignment—not production `tied/implementation-decisions/` sidecars.

| File | `annotation_profile` | Tier-3 |
|------|----------------------|--------|
| `exemplar-contract-only.pseudocode.md` | contract-only | Layer B contracts only |
| `exemplar-refinement.pseudocode.md` | refinement | INPUT/OUTPUT `where` refinements |
| `exemplar-alias-mutation.pseudocode.md` | alias-mutation | ALIAS POLICY + immutable DATA |

Matching **constraint-migration-receipt.v1** JSON files live under `receipts/` (from live `pseudocode_analyze` with G1 advisory flags at pin `48d1fbb+`). Receipt `pin.manifest_entry_id` names the exemplar tier (`exemplar-contract-only`, `exemplar-refinement`, `exemplar-alias-mutation`); `subject.annotation_profile` is **constraint-ready-v2** for all three.

Authoritative schema: [`../constraint-migration-receipt.v1.schema.json`](../constraint-migration-receipt.v1.schema.json).
