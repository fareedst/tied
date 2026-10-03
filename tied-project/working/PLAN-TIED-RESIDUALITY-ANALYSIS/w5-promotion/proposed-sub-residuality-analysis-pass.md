# Candidate sub-procedure — sub-residuality-analysis-pass

<!-- Candidate only — not canonical until W5 promotion gate and checklist TDD merge. -->

**Purpose:** Optional **risk-triggered** residuality discovery pass after impact tokens are loaded and **before** authoring new REQ/ARCH intent — feeds candidates into change-definition / author-requirement; never replaces REQ/ARCH/IMPL.

**Placement:** Immediately after **`impact-discovery`** (or as nested CALL from impact-discovery when CITDP assurance profiles include `stateful-reliability`, `data-integrity-migration`, or sponsor flag `residuality_pass_requested`).

**Mode:** Optional; default skip when depth_tier `minimal` and no eligibility trigger.

## Procedure (scaffold)

1. **PRELOAD** `tied/vocab/residuality.md`, `quality-assurance.md`, `fidelity-research.md`.
2. Confirm **naïve baseline** or current ARCH summary exists (working folder or design note).
3. Enumerate **coherent stressors** (target 20–30 pilot heuristic; fewer allowed with rationale).
4. For each stressor, complete **five-field worksheet** (or optional `stressor-residue.v1` record).
5. Build **read-only incidence view** — not a requirements database.
6. **Classify** residues (desirable / harmful / finding / accepted residual risk / N/A / unresolved).
7. Attach outputs as **evidence refs** on CITDP `risk_analysis.residuality_analysis` (proposed field) or working pilot tree.
8. Route **only reviewed** desirable/harmful→constraint rows into LEAP / author-requirement — never auto-write project YAML from worksheets.

## Outputs

- `working/{REQ-TOKEN}/residuality/` or `working/{CHANGE-ID}/pilot/` tree (project convention).
- Classification ledger with **proof_boundary** per row.
- Gap list citing existing REQ satisfaction criteria and ARCH/IMPL tokens.

## Never

- Treat worksheet or matrix as REQ substitute.
- Claim runtime proof from discovery artifacts alone.
- Skip TDD / composition gates for promoted stack changes.

**Traceability:** `[PROC-AGENT_REQ_CHECKLIST]` extension candidate; `[REQ-TIED_FIDELITY_RESEARCH]` observation boundary.
