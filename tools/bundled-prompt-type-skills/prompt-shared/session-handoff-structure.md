# Session handoff structure

**Audience:** Operators and agents invoking **`@handoff`** / **`/handoff`**.

**Traceability:** [REQ-TIED_SESSION_HANDOFF_SKILL](../../../tied-project/requirements/REQ-TIED_SESSION_HANDOFF_SKILL.yaml) · [ARCH-TIED_SESSION_HANDOFF_SKILL_BOUNDARY](../../../tied-project/architecture-decisions/ARCH-TIED_SESSION_HANDOFF_SKILL_BOUNDARY.yaml) · [IMPL-TIED_SESSION_HANDOFF_SKILL](../../../tied-project/implementation-decisions/IMPL-TIED_SESSION_HANDOFF_SKILL.yaml)

**Skill procedure:** [`tools/bundled-session-handoff-skill/SKILL.md`](../../../tools/bundled-session-handoff-skill/SKILL.md)

**Copy-paste template:** [`tied-bundle/templates/session-handoff.v1.template.md`](../../../tied-bundle/templates/session-handoff.v1.template.md)

**Optional typed context:** [`tied-bundle/templates/session-handoff-context.v1.example.yaml`](../../../tied-bundle/templates/session-handoff-context.v1.example.yaml)

---

## Proof boundary

| In scope | Out of scope |
| --- | --- |
| Rolling markdown log **`tied-project/working/{token}/evidence/session-handoff.md`** | Renaming existing `*handoff*.md` repo-wide |
| Phase **snapshots** merged into the rolling log | Automatic `git` or MCP reads of TIQ queue |
| Compose with [completion-signals-handoff.md](completion-signals-handoff.md) | Replacing **`/close-out`** or **`/clear-workspace`** |
| Advisory section completeness in `@handoff` | New MCP validator in Wave 2 |

### DAE handoff YAML (distinct artifact)

**[REQ-TIED_DAE_INCORPORATION]** additive **`working/{REQ}/handoffs/{phase}.yaml`** (schema **v1**, `tied handoff validate`) holds **criterion evidence** for checklist phases. It **does not replace**:

- `evidence/session-handoff.md` (operator continuity log), or
- `request-evidence-envelope.v1.json` (machine close-out envelope).

Do not copy DAE schema fields into `session-handoff-context.v1` and treat them as validated by `tied handoff validate`.

---

## Section order

Use this order in **`session-handoff.md`** unless a section is genuinely **n/a** (say why in Constraints).

| # | Section | TIED-tracked REQ | Non-TIED thread |
| --- | --- | --- | --- |
| 1 | Header | required | required |
| 2 | Plan spine | required | required |
| 3 | Authoritative refs | required | when paths exist |
| 3a | Plan execution steps | required when plan skills run | required when plan skills run |
| 4 | Environment | required | recommended |
| 5 | Requirements and dependencies | required | when named |
| 6 | Related and pending prior requests | required | recommended |
| 7 | Finished this session | required | required |
| 8 | Completion signals | when claiming close-out readiness | when claiming close-out readiness |
| 9 | Do next | required | required |
| 10 | Constraints | required | required |
| 11 | Repeatable verification | optional | optional |

**Header fields:** `handoff_kind` (`session` | `close_out_snapshot` | `phase_snapshot`), date, `request_token`, optional `run_id`, `prompt_type`, **`plan_phase`** (`pre-implementation` | `post-build` | `close-out-ready`).

**Plan spine:** Linked `PLAN.md`, **`plan_phase`** (normative — see [plan-build-sequence-guard.md](plan-build-sequence-guard.md)), program phase / wave table when multi-step.

**Do next vs plan_phase:** When `plan_phase: pre-implementation`, **Do next** MUST include **`@build-plan`** (not `@close-out` alone). When `post-build` or `close-out-ready`, refine-plan Do next is optional **`@close-out`** unless scope reopens.

**Authoritative refs:** Tracker YAML, persisted CITDP, gate receipts, envelope paths (typed paths).

**Environment:** `workspace_root`, `TIED_BASE_PATH`, `execution_site` (store vs client repo), git policy (paste-only — skill forbids automatic git).

**Requirements and dependencies:** Primary REQ tokens; `depends_on` / `blocks`; `depth_tier` / `gate_policy` when applicable.

---

## Plan execution steps

**Authority:** Primary durable record for **required**, **optional**, and **recommendation** steps created or changed during plan skills (`add-feature`, `refine-plan`, `non-tied-plan`, `non-tied-refine`, and revisions during `build-plan` / `close-out`). **`PLAN.md`** remains canonical for phased implementation narrative. Procedure: [prompt-skill-disk-handoff.md](prompt-skill-disk-handoff.md).

```markdown
## Plan execution steps

**Last updated:** {ISO date} · **prompt_type:** {skill} · **PLAN:** ../PLAN.md

### Required
- [ ] {stable-slug} — {one line}

### Optional
- [ ] {stable-slug} — {one line}

### Recommendations
- {advice; flag costly choices}

### Changelog (this REQ)
- {date prompt_type}: {summary}
```

**Merge rules (plan execution steps):**

1. **Append** changelog rows; do not delete prior rows.
2. **Required** list keyed by stable slug; update disposition (`[ ]` / `[x]`) in handoff; keep phase detail in `PLAN.md`.
3. When PLAN phases change, update this subsection in the **same turn**.
4. Chat and parent handoff list **disk paths only** — not full step lists.

---

## Port backlog (optional — long agent branches)

When work spans **many merges from main** or parallel agent lanes, maintain a **named port backlog** (owed-ports metaphor) so silent merge loss is visible before close-out. This is **operator hygiene**, not gate authority.

| Field | Guidance |
| --- | --- |
| **Where** | `tied-project/working/{REQ-TOKEN}/evidence/session-handoff.md` (or non-tied `tied-project/non-tied-plans/{slug}/evidence/session-handoff.md`) |
| **Shape** | Markdown subsection `## Port backlog` with table: `id`, `description`, `status` (`open` \| `ported` \| `waived`), `provenance` |
| **Promotion** | Sponsor-confirmed items may become **`merge_miss`** rows in [incident-revert evaluation corpus](../../../tied-bundle/docs/incident-revert-evaluation-corpus.md); waivers need **costly choice** note |
| **Compose** | [REQ-TIED_LANGWATCH_AGENT_REFACTOR_WAVE3](../../../tied-project/requirements/REQ-TIED_LANGWATCH_AGENT_REFACTOR_WAVE3.yaml); [langwatch-bounded-operator-skim](../../../tied-project/working/REQ-TIED_LANGWATCH_AGENT_REFACTOR_WAVE3/langwatch-bounded-operator-skim.md) |

Do **not** treat an empty port backlog as merge-ready; do **not** encode waivers only in chat.

---

## Related and pending prior requests

Carry-forward table for work **known to the current effort** but not finished in this session.

| Column | Meaning |
| --- | --- |
| `id` | Stable row id (REQ token, PLAN name, `TIQ-*`, or sponsor slug) |
| `kind` | `REQ` \| `PLAN` \| `sponsor_ask` \| `TIQ` |
| `status` | `pending` \| `active` \| `blocked` \| `done` \| `cancelled` |
| `owner` | `sponsor` \| `agent` \| `external` |
| `evidence_link` | Path to handoff, PLAN, or receipt |
| `blocks_current` | `yes` \| `no` |

Optional link to local [Primary improvement pending queue](../../../tied-bundle/docs/tied-improvement-pending-work-queue.md) (`TIQ-*` rows); queue file is operator-local, not MCP authority.

---

## Merge rules (@handoff)

1. Read existing **`evidence/session-handoff.md`** in the active `working/{token}/` folder.
2. Read **`evidence/*handoff*.md`** and sibling snapshots (`plan-close-out-handoff.md`, `*-build-plan-handoff.md`, refine handoffs) in the same folder — newest first for snapshot facts.
3. **Merge** pending-prior-requests rows by **`id`** (newer row wins on conflict; keep `done`/`cancelled` unless reopened with evidence).
4. **Append** dated subsections for phase snapshots; **do not delete** prior history (rolling log).
5. **Advisory validate:** if a required section for the thread type is empty, **WARN** in chat and still persist (reversible policy).

**Handoff kinds:** `@handoff` **owns** the rolling **`session-handoff.md`**. Snapshots feed merge only.

---

## Resume prompt (chat deliverable)

The skill emits a fenced block for the **first message** in a new chat. It must include at minimum: plan spine paths, **Environment**, **Pending prior requests**, Done, Do next, Completion signals (when TIED REQ), Constraints.

---

## Annotated example

Gold markdown shape: [REQ-TIED_BOUNDED_COMPOSITION session-handoff.md](../../../tied-project/working/REQ-TIED_BOUNDED_COMPOSITION/evidence/session-handoff.md) (plan spine, upstream, costly choices, dated reconcile).

---

## Related docs

- [pre-handoff-verification-charter.md](../../../tied-bundle/docs/pre-handoff-verification-charter.md) — executable checks before handoff
- [completion-signals-handoff.md](completion-signals-handoff.md) — three signals + workspace cleanliness
- [client-pr-handoff-fields.v1.example.yaml](../../../tied-bundle/templates/client-pr-handoff-fields.v1.example.yaml) — PR fields (parallel typed pattern)

**Last updated:** 2026-11-07
