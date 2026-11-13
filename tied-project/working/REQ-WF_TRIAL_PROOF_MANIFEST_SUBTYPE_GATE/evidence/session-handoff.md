# Session handoff — REQ-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE

- handoff_kind: session
- date: 2026-11-12
- request_token: REQ-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE
- prompt_type: handoff
- plan_phase: post-build
- run_id: handoff-2026-11-12-pmg-wave3

## Plan spine (this REQ)

- **PLAN:** [PLAN.md](../PLAN.md)
- **Parent:** [REQ-WF_TRIAL_RANGE_PROOF_MANIFEST_MANDATE](../REQ-WF_TRIAL_RANGE_PROOF_MANIFEST_MANDATE/PLAN.md)
- **Field case:** disposable `1794511862` (WF-10 Cursor Composer 2.5) — four-phase exit **1** on `FACET_AS_SUBTYPE` / coarse `proof_subtype` (do **not** register)

## Authoritative refs

| Artifact | Path |
| --- | --- |
| PLAN | [PLAN.md](../PLAN.md) |
| Tracker | [checklist-tracker.yaml](../checklist-tracker.yaml) |
| CITDP | [CITDP-REQ-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE.yaml](../CITDP-REQ-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE.yaml) |
| Pseudo-code | [IMPL-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE-pseudocode.md](../../../implementation-decisions/IMPL-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE-pseudocode.md) |
| Taxonomy | [proof-test-label-taxonomy.md](../../REQ-TIED_TRIAL_PROOF_INTENT_STACK/evidence/proof-test-label-taxonomy.md) |
| Refine handoff | [phase-handoff-refine-plan.md](./phase-handoff-refine-plan.md) |

## Plan execution steps

**Last updated:** 2026-11-12 · **prompt_type:** handoff

### Required

- [x] add-feature — REQ/ARCH/IMPL scaffold
- [x] refine-plan — R1–R9 locked; CITDP refined; pseudo-code sidecar
- [x] build-plan — token comments, SC-PMG-11..13 tests, verification gate (2026-11-12)
- [ ] close-out

### Optional

- [ ] LEAP cross-link parent RPM PLAN with SC-PMG-11..13

## Environment

- execution_site: TIED store `/Users/fareed/Documents/dev/chatgpt/stdd`
- TIED_BASE_PATH: `tied-project/`
- git: `main` **ahead 4** (`d151c746` SEQ + prior ABS commits); **PMG + debug gate code unstaged**

## Requirements

| Token | Status |
| --- | --- |
| **REQ-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE** | **Active** — `@build-plan` next |
| **REQ-WF_TRIAL_RANGE_PROOF_MANIFEST_MANDATE** | Shipped (child wave 3) |
| **REQ-TIED_TRIAL_PROOF_INTENT_STACK** | Taxonomy authority |

**depth_tier:** minimal · **gate_policy:** advisory

## Uncommitted inventory (this REQ)

| Area | Note |
| --- | --- |
| TIED indexes + detail YAML | REQ/ARCH/IMPL + semantic tokens (Draft/Proposed/Planned) |
| Working folder | `tied-project/working/REQ-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE/` |
| Exploratory code | `wf-trial-proof-manifest-gate.mjs` + `.test.mjs` + prompt-shared adjuncts (from `@debug`; commit at PMG close-out) |

## Completion signals

| Signal | Status |
| --- | --- |
| Machine close-out | verification `allowed: true`; close-out not_run |
| Process contract | build-plan complete; close-out pending |
| Adherence ledger | gate receipt in `gates/` |

## Do next

1. **`@close-out`** — [PLAN.md](../PLAN.md) + [phase-handoff-build-plan.md](./phase-handoff-build-plan.md)
2. Program rollup: [REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL session handoff](../../REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL/evidence/session-handoff.md)

## Constraints

- Do **not** register disposable run `1794511862`
- Coarse `proof_facet` ≠ `proof_subtype` (fine labels only)

## Repeatable verification (post build-plan)

```bash
node --test tools/bootstrap/lib/wf-trial-proof-manifest-gate.test.mjs
```
