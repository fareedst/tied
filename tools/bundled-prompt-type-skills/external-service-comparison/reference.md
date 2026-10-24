# External service comparison — reference

**Traceability:** [REQ-TIED_EXTERNAL_SERVICE_COMPARISON](../../../tied-project/requirements/REQ-TIED_EXTERNAL_SERVICE_COMPARISON.yaml)

## DOC working folder layout

```
tied-project/working/DOC-{SLUG}-COMPARISON/
  PLAN-refine-pass1.md
  checklist-tracker-refine.yaml
  evidence/
    build-plan-handoff.md   (optional)
```

## Wave 2 — 14 sections (order fixed)

1. Executive summary  
2. Source summary ({Vendor} claims only)  
3. Relationship to sibling comparisons  
4. Harness lessons → TIED agent management  
5. Touchpoint 1 — RESOLVE  
6. Primary capability matrix  
7. Authority boundary  
8. Anti-patterns  
9. Compose-don't-replace table  
10. Bounded operator recommendations (Recommendation-only)  
11. Phased recommendations (doc-first)  
12. Explicit non-adoptions  
13. Proof boundary  
14. Related documents  

## Verification grep checks

- No unlabeled `{Vendor}-reported` metrics in Wave 2 executive summary tables  
- Analysis metadata states **reference only; no REQ mint**  
- Sibling **Distinct from** section present when overlap risk exists  
- Capture ↔ analysis relative links resolve  

## Wave 3 handoff block (copy)

| Field | Value |
| --- | --- |
| **Change class** | doc-only \| skill \| REQ-behavior |
| **REQ token** | none until sponsor scopes add-feature |
| **Proof** | tests + gate receipts when behavior changes |
| **Route** | doc/skill → non-tied-plan or build-plan; behavior → add-feature → build-plan → close-out |
