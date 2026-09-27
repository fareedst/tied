# Pilot definition of done — assessment (§7)

**Change ID:** `PLAN-TIED-RESIDUALITY-ANALYSIS`  
**Assessed:** 2026-09-27 (refine-plan W5 — planning batch)  
**Scope:** Read-only pilot targets `REQ-FEAT_TASK_EXECUTION_RECOVERY`, `REQ-FEAT_IDEMPOTENT_CREATION`

**Overall:** **11/12 met or met-with-documented-caveats**; item 12 completed in W5 refine batch. Item 8 **met** after W3 P1 batch 2 (2026-09-27).

| # | DoD item | Status | Evidence path(s) | Notes |
|---|----------|--------|------------------|-------|
| 1 | Documented baseline / naïve architecture | **Met** | `pilot/baseline.md` | Naïve pipeline + assumptions; discovery-only disclaimer |
| 2 | System boundary incl. human/operational actors | **Met** | `pilot/baseline.md` (§ Candidate system boundary), `pilot/participant-scope.md` | API client, worker, operator, on-call, support |
| 3 | Diverse coherent stressor set (20–30) | **Met** | `pilot/stressor-catalog.md`, 25× `pilot/worksheets/S-*.md` | 25 stressors (18 technical + 7 operational-human) |
| 4 | Worksheets (five fields minimum) | **Met** | `pilot/worksheets/_template.md`, 25 worksheets | Stressor, Impact Path, Residue, Business Priority, Design Response |
| 5 | Useful and harmful residue classifications | **Met** | `pilot/classification-ledger.md`, `pilot/classification-ledger.jsonl` | 25/25 dispositions; harmful vs desirable separated in W2 |
| 6 | Attractors / coupling patterns when present | **Met** | `pilot/incidence-matrix.md` (§ Attractors), `pilot/gap-list.md` | A5 cluster documented; case-by-case W2 disposition |
| 7 | Exploratory incidence matrix | **Met** | `pilot/incidence-matrix.md` | Capability × stressor grid; read-only discovery view |
| 8 | Mapping to existing/proposed REQ/ARCH/IMPL | **Met (W3 P1 batch 2)** | `pilot/gap-list.md`, `w3-leap/scope-and-phasing.md`, `evidence/w3-build-plan-summary.md`, `evidence/w3-p1-build-plan-summary.md` | **P0+P1:** all **14/14** W3-eligible rows LEAP-persisted with `residuality_facet` metadata |
| 9 | Validation stressor set or N/A rationale | **Met** | `pilot/validation-stressors.md`, `mcp-server/src/feature-orchestration/w4-residuality-pilot.composition.test.ts` (V-H01..V-H03) | Holdouts distinct from design set; overlap disclosed |
| 10 | Executable or qualified evidence + proof boundaries | **Partial** | `evidence/w4-build-plan-summary.md`, `evidence/w4-exit-handoff.md`, `gates/verification-2026-09-27T06-08-27-103Z.json` | **27** W4 tests green; **S-T13** module-local split-claim only; **V-H01** post-create storm (not simultaneous lock contention); **PLAN-*** machine close-out still deferred (`request-evidence-envelope-waiver.v1.json` pattern) |
| 11 | Unresolved theory / accepted-risk log | **Met** | `pilot/limitations.md`, comparison doc (gitignored — see caveat) | Theory provenance open; W1 agent-draft review note; S-O03 accepted residual risk |
| 12 | Recommendation adopt / revise / defer / reject | **Met (W5 refine)** | `evidence/w5-refine-outcomes.md`, `working/w5-promotion/w5-promotion-decisions.md` | Default stance: **Adopt (revise)** — see W5 refine outcomes |

### External caveats (not DoD failures)

- **`docs/comparisons/`** is listed in root `.gitignore` — comparison synthesis may be absent from git clones; feature plan + `tied/vocab/residuality.md` remain in-repo anchors.
- **P1 LEAP** deferred by sponsor (SD-W3-P1); DoD item 8 partial is expected until batch 2 or explicit waive.
