# W1 discovery limitations log

**Status:** W1 workshop complete (2026-09-27) — extend at W2 classification and W4 validation.

## Theory / provenance

- Academic provenance of Residuality Theory remains a research pointer (see comparison doc).

## Method limits

- **Design vs holdout:** Sponsor chose **holdout stressors in W4 only**; W1 stressors are for discovery and gap analysis, not pre-declared test holdouts.
- **Stressor scope:** Technical and operational-human scenarios only; commercial/vendor/contract stressors are **out of scope** for this pilot.
- Stressor set is **heuristic** (target 20–30); not a completeness proof.
- Incidence matrix is exploratory; not a requirements database.
- Gap analysis compares to **current** satisfaction criteria — planned REQs may not cover all residues.

## Evidence limits

- W1 does not execute composition faults or RED tests (W4).
- Adversarial inquiry at W1 refine was **structural/advisory** on authority boundaries, not runtime fidelity of pilot IMPL.
- **P1 composition (2026-09-27):** Seven batch-2 stressors have UI-free composition bindings in `w4-residuality-pilot.composition.test.ts`; operator rows (S-O02, S-O06, S-O07) prove in-process gate→store/create seams only — no persisted audit log, bulk-cancel CLI, or metrics pipeline.

## Accepted residual risks (discovery phase)

- Operational/human residues may remain notes until W2 classifies REQ vs operational criteria.
- Unreviewed worksheet rows must not enter LEAP.
- **Workshop agent draft:** 25 stressors authored agent-led; sponsor review may merge/split IDs or reclass residue classes before W2 ledger.
- **Attractor A5 cluster** (version skew, retry storm, partition reads, override tooling) flagged as gaps — promotion to ARCH/REQ requires W2+ review, not W1 discovery alone.
