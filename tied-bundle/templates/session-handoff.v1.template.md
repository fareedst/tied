# Session handoff — {REQUEST_TOKEN}

**handoff_kind:** session  
**Date:** {YYYY-MM-DD}  
**prompt_type:** {e.g. @build-plan}  
**run_id:** {optional}

---

## Plan spine

| Item | Path / note |
| --- | --- |
| Linked PLAN | [PLAN.md](../PLAN.md) |
| Program phase | {wave / slice / close-out deferred} |

---

## Authoritative refs

| Ref | Path |
| --- | --- |
| Tracker | [checklist-tracker.yaml](../checklist-tracker.yaml) |
| CITDP | [CITDP-{TOKEN}.yaml](../../../citdp/CITDP-{TOKEN}.yaml) |
| Envelope | `evidence/request-evidence-envelope.v1.json` (if present) |

---

## Plan execution steps

**Last updated:** {YYYY-MM-DD} · **prompt_type:** {@add-feature | @refine-plan | …} · **PLAN:** ../PLAN.md

### Required

- [ ] {stable-slug} — {one line}

### Optional

- [ ] {stable-slug} — {one line}

### Recommendations

- {non-blocking advice}

### Changelog (this REQ)

- {date prompt_type}: {summary}

---

## Port backlog

_Optional — use on long agent branches; see [session-handoff-structure.md](../../../tools/bundled-prompt-type-skills/prompt-shared/session-handoff-structure.md#port-backlog-optional--long-agent-branches)._

| id | description | status | provenance |
| --- | --- | --- | --- |
| OWED-001 | {port from main not yet merged} | open | {PR/ref} |

---

## Environment

| Field | Value |
| --- | --- |
| workspace_root | {absolute repo root} |
| TIED_BASE_PATH | {tied-project/ path} |
| execution_site | {store \| client repo name} |
| git policy | paste-only — no automatic git in @handoff |

---

## Requirements and dependencies

| Token / item | Role |
| --- | --- |
| {REQ-PRIMARY} | active request |
| depth_tier | {minimal \| integrated} |
| gate_policy | {advisory \| strict} |

**depends_on:** {REQ or PLAN links}  
**blocks:** {gate or costly choice ids}

---

## Related and pending prior requests

| id | kind | status | owner | evidence_link | blocks_current |
| --- | --- | --- | --- | --- | --- |
| {REQ-OTHER} | REQ | pending | sponsor | {path} | no |
| {PLAN-NAME} | PLAN | active | agent | {path} | yes |

---

## Finished this session

| Item | Evidence |
| --- | --- |
| {deliverable} | {test, SHA, or file path} |

---

## Completion signals

See [completion-signals-handoff.md](../../../tools/bundled-prompt-type-skills/prompt-shared/completion-signals-handoff.md).

- **Machine close-out:** {not_run | pass | fail} — …
- **Process contract:** {partial | pass | fail} — …
- **Adherence ledger:** {not_run | pass | partial} — …
- **Workspace cleanliness (scoped REQ):** {n/a | pass | partial} — …

---

## Do next

1. {`/build-plan @…` or gate step}
2. {attach @PLAN.md, Tracker}

---

## Constraints

- {non-goals, do-not-commit, branch}

---

## Repeatable verification

```bash
# {commands with exit codes recorded in Finished table}
```
