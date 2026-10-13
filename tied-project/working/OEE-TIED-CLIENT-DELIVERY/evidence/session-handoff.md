# Session handoff — OEE-TIED-CLIENT-DELIVERY (operating environment externalities)

> **POSTPONED (2026-10-12):** OEE v0 docs and pilot are committed; REQ/MCP follow-on deferred. Read this file first on resume.

**Updated:** 2026-10-12  
**Scope:** Methodology documentation + pilot working folder — **not** a `[REQ-*]` enrollment  
**TIED base path (stdd):** `/Users/fareed/Documents/dev/chatgpt/stdd/tied-project` — re-run `tied_config_get_base_path` before MCP writes.  
**Traceable commit:** `aa261d32` (see CHANGELOG `[Unreleased]`)

---

## What this session delivered

1. **Specification (v0):** [docs/tied-operating-environment-externalities.md](../../../../docs/tied-operating-environment-externalities.md) — additional level when **application externalities** and **operating-environment** complexity must be managed (external workflows, compatibility, brownfield ops behavior).
2. **Vocabulary:** [tied-project/vocab/operating-environment-externalities.md](../../../vocab/operating-environment-externalities.md) + routing row **2e** in [routing.md](../../../vocab/routing.md).
3. **Discoverability:** Scenario row in [client-development-index.md](../../../../tied-bundle/docs/client-development-index.md); cross-link from [concept impact inquiry](../../../../docs/tied-concept-impact-inquiry.md).
4. **Reference pilot:** [OEE-TIED-CLIENT-DELIVERY/](../README.md) — filled register (WF-001…005), compatibility ledger, dependency map, sample intent matrix, decision **proceed (pilot documentation only)**.
5. **Close-out (2026-10-12):** `@plan-close-out` + git-hygiene preview + traceable-commit per linked plan; evidence under `evidence/`.

**Governing principle (carry forward):** observed dependency ≠ approved obligation.

---

## Program state

| Field | Value |
| --- | --- |
| **OEE id** | `OEE-TIED-CLIENT-DELIVERY` |
| **Baseline lock** | `b74d9548ffba11e44e081dbc055fe09824544497` (pilot); re-lock on promotion |
| **REQ enrollment** | **None** — future candidates: `[REQ-TIED_OPERATING_ENVIRONMENT_EXTERNALITIES]`, `[ARCH-TIED_OEE_BOUNDARY]`, `[IMPL-TIED_OEE_VALIDATION]`, `[PROC-OPERATING_ENVIRONMENT_EXTERNALITIES]` (spec §14) |
| **Sponsor decision** | [decision-record.md](../decision-record.md) — proceed as copy template; **development postponed** after docs commit |

---

## Explicitly not done

| Item | Notes |
| --- | --- |
| TIED YAML tokens / MCP validators | Spec §14 evolution only — **still open** |
| `tied_validate_consistency` after enrollment | N/A — no index mutations |
| ~~`@plan-close-out` / traceable-commit~~ | **Done** — docs-only partial close-out |
| ~~Git commit (OEE scope)~~ | **Done** @ `aa261d32` |
| Copy to a **client application** repo | Next program should duplicate `OEE-{SLUG}/` for real integrators/operators |

---

## Completion signals (honest status)

| Signal | Status |
| --- | --- |
| **Machine close-out** | **not_run** — no `[REQ-*]` Tracker or envelope |
| **Process contract** | **partial (docs)** — committed pilot + specs + close-out evidence |
| **Adherence ledger** | **not_run** |
| **Proof boundary** | Pilot proves **documentation shape**, not fleet compliance |

---

## Costly choices (open)

1. Mandatory OEE when OEE spec §2 activation criteria apply to methodology-surface changes (see [compatibility-ledger.md](../compatibility-ledger.md)).
2. Breaking MCP tool renames without deprecation (WF-001 **preserve**).
3. Formal REQ enrollment via `@plan-new-feature`.

Default for (1): **defer** until one non-STDD client program copies OEE and cites it in CITDP/PLAN.

---

## Resume checklist (next agent)

1. Read this handoff first — do **not** reopen OEE doc edits unless sponsor expands scope.
2. PRELOAD [operating-environment-externalities.md](../../../vocab/operating-environment-externalities.md) + OEE spec §2 when task touches external workflows or brownfield ops.
3. **If sponsor wants formal TIED:** `@plan-new-feature` for `[REQ-TIED_OPERATING_ENVIRONMENT_EXTERNALITIES]`; link `OEE-TIED-CLIENT-DELIVERY` as reference in PLAN/CITDP.
4. **If sponsor wants a real client program:** copy pilot → `OEE-{SLUG}/`, replace WF rows, link from target `PLAN.md` / `CITDP-*.yaml` `reference`.

---

## Key paths

| Artifact | Path |
| --- | --- |
| Spec | [docs/tied-operating-environment-externalities.md](../../../../docs/tied-operating-environment-externalities.md) |
| CII spec | [docs/tied-concept-impact-inquiry.md](../../../../docs/tied-concept-impact-inquiry.md) |
| Pilot README | [../README.md](../README.md) |
| Register | [../external-workflow-register.md](../external-workflow-register.md) |
| Ledger | [../compatibility-ledger.md](../compatibility-ledger.md) |
| Close-out evidence | [plan-close-out-handoff.md](plan-close-out-handoff.md), [traceable-commit-evidence.md](traceable-commit-evidence.md) |
