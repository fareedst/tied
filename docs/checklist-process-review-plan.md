# Checklist and process review — operator plan

| Field | Value |
| --- | --- |
| **Status** | Active operator procedure (phase 1 deliverable) |
| **REQ** | [REQ-CHECKLIST-PROCESS-REVIEW](../tied-project/requirements/REQ-CHECKLIST-PROCESS-REVIEW.yaml) |
| **Parent program** | [PLAN-CHECKLIST-PROCESS-REVIEW](../tied-project/working/PLAN-CHECKLIST-PROCESS-REVIEW/PLAN.md) |
| **Companion worksheet** | [checklist-process-review-checklist.md](checklist-process-review-checklist.md) |

## Authority and non-replacement

This document defines a **repeatable, episodic review** for checklist and process documentation in a TIED repository. It does **not** replace **[PROC-AGENT_REQ_CHECKLIST]** or the executable checklist in `tied-bundle/docs/agent-req-implementation-checklist.yaml`. Per-REQ implementation still uses a copied Tracker and the canonical checklist; this review program audits the **corpus** of process docs, plans, and handoffs.

| Authority layer | Source | Role |
| --- | --- | --- |
| Machine step order | `tied-bundle/docs/agent-req-implementation-checklist.yaml` | Mandatory implementation workflow |
| Step explanation | `tied-bundle/docs/agent-req-implementation-checklist.md` | Human-readable mirror |
| Process meaning | `[PROC-*]` entries in `tied-bundle/docs/processes.md` | Definitions and cross-links |
| Execution state | Per-request Tracker under `tied-project/working/{REQ-TOKEN}/` | Dispositions and evidence |
| Program rationale | Plans under `docs/` and `tied-project/working/` | Bounded scope and history |

**Hard rule:** Hard-delete obsolete docs or plans only after all active references, evidence paths, Trackers, CITDP records, scripts, tests, changelog links, and navigation links are removed or migrated to a stable replacement.

## Scope roots

Include in a full repository review:

- **Canonical process spine:** `tied-bundle/docs/agent-req-implementation-checklist.md` and `.yaml`, `processes.md`, pseudo-code validation guides/checklists, `client-development-index.md`, `tied-yaml-agent-index.md`, `working-artifact-placement.md`.
- **Root plans and process docs:** everything under `docs/` that describes methodology, checklists, or programs.
- **Committed working artifacts:** `tied-project/working/` (`PLAN.md`, Trackers, draft CITDP, evidence markdown). Treat machine evidence under `tied-bundle/working/` as **local/regenerable** unless envelope or CITDP explicitly commits a facet (see [working-artifact-placement](../tied-bundle/docs/working-artifact-placement.md)).
- **Navigation and install surfaces:** `AGENTS.md`, `README.md`, `tied-project/vocab/routing.md`, `tools/bootstrap/manifest.json`.

Exclude from “authority” classification (review as **evidence to classify** only): one-off gate JSON, ledgers, adversarial-inquiry trees under `tied-bundle/working/`, unless copied into committed working evidence as rationale.

## Phased program

| Phase | Goal | Typical mutations |
| --- | --- | --- |
| **1 Deliverables** | Publish this plan + worksheet | `docs/checklist-process-review-*.md` |
| **2 Inventory & review** | Disposition table, findings ledger | Evidence under `tied-project/working/{review-id}/` |
| **3 Cleanup batches** | Delete/migrate with proof | Bounded batches; one reference sweep per batch |
| **4 Methodology surface** | Canonical checklist/gate changes | Separate `plan-new-feature` + methodology-surface enrollment |

Do not combine phase 3 deletes with phase 1 authoring unless explicitly scoped and re-gated.

## Review passes (procedure)

1. **Bootstrap boundary** — Record review date, repository revision, included/excluded roots, `TIED_BASE_PATH` (`tied-project/`), vocabulary preload, definition of **active**, and costly-choice register.
2. **Inventory** — Enumerate canonical docs, `docs/` plans, working `PLAN.md` files, Tracker variants, orchestrators, and `[PROC-*]` / REQ references. Capture path, owner, status, last update, authority role, parent/child links, tokens.
3. **Lifecycle classification** — Order: canonical active → active implementation handoff → completed reference → historical/superseded → **ambiguous**. Resolve status from completion checklists, CITDP/gate evidence, REQ state, then narrative headers. **Never delete ambiguous.**
4. **Completeness** — For each active checklist/process: purpose, scope, I/O, owner, preconditions, steps, branches, failure handling, evidence, exit criteria, status, token refs. For each plan: current/desired/unchanged behavior, non-goals, risks, success criteria, close-out state.
5. **Coherence & contradictions** — Markdown/YAML checklist pair, `processes.md`, pseudo-code layers, indexes, Trackers, plans. Inspect ordering/gates, `depth_tier` / `profile_depth` / `gate_policy`, Tracker vs `execution_evidence`, `tied-bundle/` vs `tied-project/` ownership, committed vs local working paths, legacy `tied/docs`, `tied/`, undivided `working/`, status vs gate receipts.
6. **Efficiency** — Duplicated instructions, redundant bootstrap reads, unnecessary ceremony, unclear branches, assurance work outside triggers. Prefer one authoritative definition plus indexes/links.
7. **Reconcile** — Per finding: `keep`, `update`, `split`, `supersede`, `delete-candidate` with severity, evidence paths, fix, sponsor approval flag. Split closed plans that still contain useful runbooks.
8. **Dependency-safe excision (phase 3 only)** — Per delete-candidate: repo-wide reference search; inspect `tied-project/citdp/`, Trackers, envelopes, `CHANGELOG.md`, scripts, tests, manifests, navigation. Migrate links first; preserve audit identity; delete only with zero active dependencies.
9. **Validate & close** — Link/reference checks, checklist parity when canonical pair changed, vocabulary VALIDATE, YAML lint for changed project records, `tied_validate_consistency`, checklist/process tests as applicable. Re-run inventory to confirm no orphan references. Record residual risks and **next review trigger**.

## Operator commands (validation)

| Step | Command / tool |
| --- | --- |
| Reference sweep | `rg -l '<path-or-basename>'` from repo root |
| Vocab/doc links | `check_docs_vocab_links` (after `source scripts/build-commands.sh`) |
| Project lint | MCP `tied_project_lint` |
| Scoped impact | MCP `tied_scoped_analysis_run` (optional) |
| TIED consistency | MCP `tied_validate_consistency` (after project YAML changes) |

## Deletion gates (checklist)

Before any hard delete:

- [ ] Disposition is `delete-candidate`, not ambiguous.
- [ ] Inbound reference sweep attached (paths + `rg` output summary).
- [ ] CITDP, Tracker, envelope, and changelog impacts listed.
- [ ] Replacement links merged for live navigation.
- [ ] Sponsor approval recorded for costly or evidence-bearing docs.
- [ ] Post-delete zero-reference spot check documented.

## Cadence and escalation

- **Cadence:** Event-driven (large methodology install, program close-out) or scheduled (record `next_review_date` in phase 2 close-out). Default after first full phase 2 pass: **manual** trigger unless sponsor sets a calendar date.
- **Escalation:** Contradictions affecting gate semantics, checklist step order, or install surfaces → phase 4 methodology-surface change, not silent doc edits.

## Known drift patterns (fixtures)

Use as test cases during review; not an exhaustive list.

| Pattern | What to look for | Expected disposition |
| --- | --- | --- |
| Duplicated build-order narratives | Same TDD order in `processes.md`, checklist, and legacy plans | `update` + link to canonical; avoid weakening gates |
| Stale `tied/docs` or `tied/` paths | Pre–two-folder path aliases in plans | `update` paths to `tied-project/` / `tied-bundle/` |
| Legacy `working/` ambiguity | Undivided repo-root `working/` vs `tied-project/working/` | `update`; cite [working-artifact-placement](../tied-bundle/docs/working-artifact-placement.md). **Store repo:** root `working/` → `tied-project/working/` (symlink); navigation in [tied-project/working/README.md](../tied-project/working/README.md) |
| Closed plan still referenced | CITDP or Tracker links to `PLAN.md` of closed program | `keep` or `split` runbook; not `delete` without migration |
| Status contradiction | Header says complete but gate receipt missing | Record contradiction; do not delete to hide |
| Manifest omissions | Bootstrap `manifest.json` missing validation doc | `update` manifest or index link |

## Active work — default non-delete

Until phase 2 disposition, treat as **non-delete** if still referenced by open handoffs: async W2 work, bootstrap detail-file fixes, fidelity pilot, residuality close-out, QMM follow-on handoffs, and any `tied-project/working/` folder with pending Tracker steps.
