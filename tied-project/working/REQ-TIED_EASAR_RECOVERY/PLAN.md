# REQ-TIED_EASAR_RECOVERY — program plan

**Linked Cursor plan:** `req-tied_easar_recovery_17decacf.plan.md`  
**Methodology bridge:** [docs/methodologies/evidence-assured-software-architecture-recovery.md](../../../docs/methodologies/evidence-assured-software-architecture-recovery.md) (§7)  
**CITDP (draft):** [CITDP-REQ-TIED_EASAR_RECOVERY.yaml](./CITDP-REQ-TIED_EASAR_RECOVERY.yaml)  
**Tracker (draft):** [checklist-tracker.yaml](./checklist-tracker.yaml)

## Sponsor decisions (resolved)

| Decision | Choice |
| --- | --- |
| First cycle | MVP slices **0–4** (enrollment + EASAR §7.6 items 1–4) |
| Tracker binding | **`brownfield_intent_elevation.mode`** + facet **`engagement: easar_full`** |
| Depth / gates | **`depth_tier: integrated`**, phase-aware inquiry; governed waivers only |

## Slice status

| Slice | EASAR stage | Status | Receipt |
| --- | --- | --- | --- |
| 0 | Enrollment + gates | **done** (pre_implementation `allowed: true`) | [gate receipt](gates/pre_implementation-2026-10-18T02-15-41-747Z.json) + structural inquiry `run_id=easar-structural-pre-impl-20261017` |
| 1 | 0–1 inventory | **done** (verification `allowed: true`) | [inventory.v1.json](evidence/inventory.v1.json) · [slice1 verification gate](evidence/slice1-verification-gate.md) · `run_id=easar-slice1-verify-20261018` |
| 2 | 2 code_graph | **done** (verification `allowed: true`) | [code-graph-matrix-receipt.v1.json](evidence/code-graph-matrix-receipt.v1.json) · [slice2 verification gate](evidence/slice2-verification-gate.md) · `run_id=easar-slice2-verify-20261018` |
| 3 | 4 claims choreography | **done** (verification `allowed: true`) | [claim-matrix-map.v1.json](evidence/claim-matrix-map.v1.json) · [slice3 verification gate](evidence/slice3-verification-gate.md) · `run_id=easar-slice3-verify-20261018` |
| 4 | 6 reflexion | **done** (verification `allowed: true`) | [reflexion-report.v1.json](evidence/reflexion-report.v1.json) · [slice4 verification gate](evidence/slice4-verification-gate.md) · `run_id=easar-slice4-verify-20261018` |
| 5 | 7 validation corpus | **done** (verification `allowed: true`) | [validation-cases.v1.yaml](evidence/validation-cases.v1.yaml) · [validation-results.v1.json](evidence/validation-results.v1.json) · [slice5 verification gate](evidence/slice5-verification-gate.md) · `run_id=easar-slice5-verify-20261018` |
| 6 | 9 portable export | **refined** (build pending) | [slice6-e2e-plan.md](evidence/slice6-e2e-plan.md) · inquiry `run_id=easar-slice6-verify-20261019` |
| Close-out | Program gates + CITDP persist | **done** | [close-out gate](evidence/close-out-gate.md) · `run_id=easar-close-out-20261018` |

## Dogfood target

**stdd** store repo: `mcp-server/` source graph, checklist gate modules, BFIE validator; baseline via `brownfield-baseline-lock` when mode is `pilot`.

## Gate contract (integrated)

- **Structural** `tied_adversarial_inquiry_run` + pairing before Slice 1 RED.
- **Per-slice** `verification` gate with distinct `run_id` before next slice.
- **Close-out:** close_out inquiry or **close-out inquiry waiver**; envelope validate blocking gaps.

Refine-plan pass: **2026-10-17** (program) · **2026-10-18** [Slice 2 E2E](evidence/slice2-e2e-plan.md) · **2026-10-18** [Slice 3 E2E](evidence/slice3-e2e-plan.md) · **2026-10-18** [Slice 4 E2E](evidence/slice4-e2e-plan.md) — see linked Cursor plan for architecture diagram, anti-patterns, and test matrix.

## Slice 2 E2E (complete)

Authoritative steps: [evidence/slice2-e2e-plan.md](evidence/slice2-e2e-plan.md). Verification tracker: [gate-tracker-slice2-verification.yaml](gate-tracker-slice2-verification.yaml). Inquiry `run_id`: `easar-slice2-verify-20261018`.

## Slice 3 E2E (complete)

Authoritative steps: [evidence/slice3-e2e-plan.md](evidence/slice3-e2e-plan.md). Verification tracker: [gate-tracker-slice3-verification.yaml](gate-tracker-slice3-verification.yaml). Inquiry `run_id`: `easar-slice3-verify-20261018`. Stage 3 PROC sequence: [evidence/slice3-stage3-proc-choreography.md](evidence/slice3-stage3-proc-choreography.md).

## Slice 4 E2E (complete)

Authoritative steps: [evidence/slice4-e2e-plan.md](evidence/slice4-e2e-plan.md). Verification tracker: [gate-tracker-slice4-verification.yaml](gate-tracker-slice4-verification.yaml). Inquiry `run_id`: `easar-slice4-verify-20261018`.

## Slice 5 E2E (complete)

Authoritative steps: [evidence/slice5-e2e-plan.md](evidence/slice5-e2e-plan.md). Verification tracker: [gate-tracker-slice5-verification.yaml](gate-tracker-slice5-verification.yaml). Inquiry `run_id`: `easar-slice5-verify-20261018`. Program MVP close_out unchanged.

## Slice 6 E2E (refined 2026-10-19)

Authoritative steps: [evidence/slice6-e2e-plan.md](evidence/slice6-e2e-plan.md). Reserved verification `run_id`: `easar-slice6-verify-20261019`. Read-only portable `recovery/` mapper; committed **`recovery-export-manifest.v1.json`** + **`recovery-portable-map.v1.yaml`**; export tree under `tied-bundle/working/` (gitignored). Proposed LEAP criterion **SC-EASAR-EXPORT**. Program MVP close_out unchanged until sponsor opts into LEAP re-close.
