# W2 refine-plan — Refine outcomes (Touchpoint 1 — RECORD)

**Change ID:** `PLAN-TIED-RESIDUALITY-ANALYSIS`  
**Batch:** W2 residue classification and risk gating — refine/plan only (ledger scaffold; population deferred to build-plan W2)  
**Date:** 2026-09-26

## Sponsor guidance (accepted)

1. **Human stressor labels (S-O02, S-O06, S-O07):** Accepted — harmful tag names the risk; worksheets document desirable preserved behavior (audit/reject, no silent corruption).
2. **Heavy stressors:** **S-T11** and **S-T16** both in scope for W2 classification (not deferred).
3. **S-T01 vs S-T12:** Keep separate — duplicate delivery vs duplicate evidence ordering-key defect are distinct failure modes.
4. **W2 ordering:** **REQ-aligned** — classify task-recovery cluster first, idempotent-create cluster second, cross-cutting third.
5. **S-T09 (schema/normalization skew):** **Architecture/requirement follow-up candidate for W3** — not accepted-residual-risk-only; not ops-only deferral.
6. **Attractor A5:** **Case-by-case disposition** in the ledger — no blanket bucket default.

## Resolved terms (W2 batch)

- **classification ledger** — Working artifact (`pilot/classification-ledger.md` or `.jsonl`) mapping each stressor/residue to a **disposition** enum and **proof_boundary**; not REQ/ARCH/IMPL authority.
- **disposition.status** — One of: `candidate_requirement`, `architecture_constraint`, `finding`, `accepted_residual_risk`, `not_applicable`, `unresolved` (matches candidate `stressor-residue.v1` §5).
- **accepted residual risk** — Quality-assurance term for risk remaining after controls; **not** synonymous with **residue** (see `tied/vocab/residuality.md`).

## W1 exit → W2 entry

W1 exit evidence present under `working/PLAN-TIED-RESIDUALITY-ANALYSIS/pilot/` (25 worksheets, incidence matrix, gap-list, limitations, participant-scope with sponsor decisions). Handoff recorded in `evidence/w1-exit-w2-handoff.md`.

## Vocabulary RECORD/VALIDATE

- **RECORD:** Sponsor W2 decisions appended to `pilot/participant-scope.md` (W1 workshop review section); W2 refine outcomes in this file.
- **PRELOAD:** `residuality.md`, `quality-assurance.md`, `fidelity-research.md`.
- **VALIDATE:** Deferred to traceable-commit after build-plan W2 ledger population; refine-plan must not conflate residue with `accepted_residual_risk` disposition label.

## Open items for sponsor (non-blocking refine)

1. Per-row **tied_refs** for `candidate_requirement` / `architecture_constraint` — build-plan W2 should cite existing pilot REQ/ARCH/IMPL tokens read-only where applicable.
2. Operational/human residues (S-O*) — case-by-case whether W3 elevates to REQ criteria vs operational runbook notes (feature plan §0 open item #2).
3. Validation stressor set — remains **W4**; W2 ledger must not treat design stressors as holdout proof.
