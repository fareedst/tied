# v1 parser quarantine policy (OD-P5-1)

**Status:** Active — Phase 5 program exit (P5-H, 2026-09-13)  
**Open decision:** [OD-P5-1](../../docs/pseudocode-constraint-v2-fleet-migration-phase-5-plan.md) — **defer removal**, quarantine + audit tagging only  
**Traceability:** [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT](../../tied/requirements/REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT.yaml) · [REQ-PSEUDOCODE_PARSER_UNIFICATION](../../tied/requirements/REQ-PSEUDOCODE_PARSER_UNIFICATION.yaml) (read-only until retirement scope accepted)

## Policy

1. **Default grammar path remains v1** when a sidecar has no `Grammar-Version: v2` header. G4 bootstrap enforcement applies to **new** clients and G4 audit dimensions only; it does not delete or disable the v1 parser in Phase 5.
2. **Removal is deferred.** No mandatory v1 parser deletion in the Phase 5 program slice. Optional retirement work requires a sponsor-amended OD-P5-1 scope and a dedicated REQ slice (e.g. parser unification amend).
3. **Quarantine tagging:** Legacy v1-only sidecars and prose-only procedures are **quarantined** for promotion purposes — they may remain in repos but must not be labeled `fleet-migrated-client`, `constraint-enforced-v2`, or G4-complete without explicit waiver or migration evidence.
4. **Audit dimension:** Fleet G4 CI and grammar-v2-default audit distinguish **header-only-v2**, **constraint-ready-v2**, and **constraint-enforced-v2** from v1-default paths; inventory rows in `not_enrolled_phase_4` remain honest **non-migrated** until enrolled or waived (Track B / Phase 5b).
5. **Exceptions:** Time-bounded waivers in [`migration-waiver-registry.v1.yaml`](migration-waiver-registry.v1.yaml) remain the only approved bypass for stale or incomplete migration states on enrolled Track A repos.

## Evidence

- Phase 5 plan § OD-P5-1  
- EX-P5-06 satisfied by this document at P5-H  
- Bootstrap enforcement: [`p5-f-bootstrap-enforcement-report.v1.json`](p5-f-bootstrap-enforcement-report.v1.json)
