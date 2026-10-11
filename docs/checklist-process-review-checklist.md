# Checklist and process review — worksheet

**Procedure:** [checklist-process-review-plan.md](checklist-process-review-plan.md) · **REQ:** [REQ-CHECKLIST-PROCESS-REVIEW](../tied-project/requirements/REQ-CHECKLIST-PROCESS-REVIEW.yaml)

Use this worksheet for one review cycle. It does **not** replace **[PROC-AGENT_REQ_CHECKLIST]** or your per-REQ Tracker.

---

## Review metadata

| Field | Value |
| --- | --- |
| Review ID | |
| Repository revision (commit or tag) | |
| Review date | |
| Reviewer | |
| Sponsor / approver | |
| Scope roots (included) | |
| Excluded generated evidence | |
| TIED base path | |
| `next_review_date` or trigger | |

---

## A. Review setup

- [ ] Vocabulary PRELOAD completed (`tied-project/vocab/routing.md` → matched glossaries)
- [ ] Costly-choice register started (canonical rewrite, gate semantics, install surface, evidence deletion)
- [ ] Phase scope declared (2 inventory only / 3 cleanup batch ID / etc.)

**Notes:**

---

## B. Inventory

| Path | Owner | Status | Authority role | Parent/child | Tokens |
| --- | --- | --- | --- | --- | --- |
| | | | | | |

- [ ] Canonical checklist MD + YAML listed
- [ ] `docs/` plan corpus listed
- [ ] `tied-project/working/` PLAN + Tracker variants listed
- [ ] Navigation (`AGENTS.md`, `README.md`, manifest) listed

**Notes:**

---

## C. Authority

- [ ] One owner per rule identified
- [ ] Markdown/YAML checklist pairing verified for canonical checklist
- [ ] `[PROC-*]` ownership mapped in `processes.md`
- [ ] Plans linked to REQ tokens where applicable
- [ ] Historical overlays labeled (not active authority)

**Notes:**

---

## D. Completeness

For each **active** artifact reviewed:

- [ ] Purpose, scope, inputs, outputs
- [ ] Owner, preconditions, ordered steps
- [ ] Branches / loop-back, failure modes
- [ ] Evidence requirements, exit criteria, status metadata

**Notes:**

---

## E. Coherence

- [ ] Canonical checklist MD/YAML parity (if canonical pair in scope)
- [ ] Token and relative links resolve
- [ ] `tied-project/` vs `tied-bundle/` paths correct
- [ ] Working-artifact placement matches [working-artifact-placement](../tied-bundle/docs/working-artifact-placement.md)
- [ ] Tracker dispositions align with gate receipts where checked

**Notes:**

---

## F. Contradictions

| ID | Sources (paths) | Expected authority | Impact | Disposition | LEAP / sponsor |
| --- | --- | --- | --- | --- | --- |
| | | | | | |

- [ ] Historical context distinguished from live contradiction

**Notes:**

---

## G. Efficiency

| Metric | Finding |
| --- | --- |
| Duplicate instruction clusters | |
| Redundant bootstrap reads | |
| Repeated validation | |
| Optional vs mandatory boundaries | |
| Risk-triggered steps applied outside trigger | |

**Notes:**

---

## H. Lifecycle

| Path | Class (active / handoff / reference / superseded / ambiguous) | Evidence for class |
| --- | --- | --- |
| | | |

- [ ] Stale headers flagged
- [ ] Supersession links recorded
- [ ] Orphans identified (no inbound refs, no authority role)

**Notes:**

---

## I. Excision safety (phase 3 only)

**Delete-candidate path:**

- [ ] Inbound reference sweep attached (`rg` summary)
- [ ] CITDP / Tracker / envelope impact listed
- [ ] Replacement links merged
- [ ] Audit identity preserved (commit ref or migration note)
- [ ] Sponsor approval for costly deletes
- [ ] Post-delete zero-reference check

**Notes:**

---

## J. Validation and sign-off

| Check | Result | Evidence path |
| --- | --- | --- |
| `check_docs_vocab_links` (if nav touched) | | |
| `tied_project_lint` (if applicable) | | |
| YAML `lint_yaml` on changed project records | | |
| Checklist parity tests (if canonical pair changed) | | |
| `tied_validate_consistency` | | |
| Vocabulary VALIDATE | | |

**Residual risks:**

**Deferred work:**

| Role | Name | Date | Signature / ack |
| --- | --- | --- | --- |
| Reviewer | | | |
| Sponsor | | | |
