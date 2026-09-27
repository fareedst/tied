# W1 pilot participant scope

**Purpose:** Bound who performs discovery, who approves classifications (W2), and who must not mutate canonical YAML during W1.

## Roles

- **Facilitator** — Runs stressor workshop, maintains worksheets and incidence matrix; may be agent or human pair.
- **TIED stack reader** — Loads pilot REQ/ARCH/IMPL detail YAML read-only; cites tokens in `gap-list.md`.
- **Sponsor / owner** — Approves integrated depth, advisory gate policy, and any deviation from 20–30 stressor heuristic.
- **Out of scope for W1** — Implementers changing production code or project REQ/ARCH/IMPL without W3 behavior-changing CITDP.

## Session boundaries

- **In scope:** `working/PLAN-TIED-RESIDUALITY-ANALYSIS/pilot/**`, comparison doc, feature plan, provisional vocab.
- **Read-only:** `tied/requirements/REQ-FEAT_*`, linked ARCH/IMPL detail files for the two pilot REQs.
- **Forbidden:** Edits under `tied/methodology/`; silent promotion of residues to project YAML.

## Sponsor decisions (resolved 2026-09-27)

1. **Stressor mix:** **Technical + operational human factors only** — include failures like operator mistakes, support-only recovery, and runbook gaps; **exclude** commercial/vendor/contract stressors for this pilot.
2. **Personas:** **Generic roles only** — API client, background worker, operator, on-call engineer, support (no real names or team labels).
3. **Execution:** **Agent-led build-plan** — AI drafts stressors and worksheets from read-only REQ/ARCH/IMPL; sponsor reviews and corrects in a follow-up pass.
4. **Validation (holdout) stressors:** **W4 only** — W1 uses design stressors only; holdout scenarios and test binding come in W4 (`validation-stressors.md`). W1 documents this boundary in `limitations.md`.

## Facilitation mode

- Primary: build-plan W1 (`w1-build-plan-workshop` in linked plan).
- Sponsor review gate: after draft worksheets/matrix/gap-list, before W2 classification.

## W1 workshop sponsor review (resolved 2026-09-27)

1. **Human stressor labels (S-O02, S-O06, S-O07):** **Accepted** — harmful tag = the risk; worksheets already state desirable preserved behavior (audit/reject, no silent corruption).
2. **Heavy stressors:** **S-T11 and S-T16 both in scope** for W2 classification.
3. **S-T01 vs S-T12:** **Keep both** — duplicate delivery vs duplicate evidence ordering-key bug are distinct failure modes.
4. **W2 ordering:** **REQ-aligned** — classify task-recovery cluster first, then idempotent-create, then cross-cutting.
5. **S-T09 version skew:** **Architecture/requirement follow-up candidate** for W3 (not accepted-risk-only, not ops-only deferral).
6. **Attractor A5 default:** **Case-by-case** — no blanket bucket; per-stressor disposition in W2 ledger.
