# PLAN — Checklist gate operator path (process pending feedback)

| Field | Value |
| --- | --- |
| **Token** | `REQ-TIED_CHECKLIST_GATE_OPERATOR_PATH` |
| **Depth** | `profile_depth` / `depth_tier`: **minimal** · `gate_policy`: **advisory** |
| **Profiles** | `research_profile`: read-only · `assurance_profile`: baseline-functional · `eligibility_triggers_matched`: [] |
| **Source feedback** | `fb-mw6d3pz5-9cg0e8` ([`tied-project/feedback.yaml`](../../feedback.yaml)) · witness during [`REQ-TRIAL_METHODOLOGY_VERSION_READOUT`](../REQ-TRIAL_METHODOLOGY_VERSION_READOUT/PLAN.md) |
| **Linked sponsor plan** | Process pending feedback (Cursor plan `process_pending_feedback_d405d875`) — full countermeasure track selected |
| **Status** | **build-plan complete** — optional `@close-out` |
| **plan_phase** | `post-build` |
| **Refine runs** | Pass 1 (2026-11-07) · Pass 2 (2026-11-07) — gate `allowed: true`, `run_id=refine-plan-pass2-2026-11-07` |
| **Related (compose, not duplicate)** | [REQ-TIED_DAE_INCORPORATION](../../requirements/REQ-TIED_DAE_INCORPORATION.yaml) (`tied_gate_check`), [REQ-TIED_TOOL_INPUT_COMPATIBILITY](../../requirements/REQ-TIED_TOOL_INPUT_COMPATIBILITY.yaml) (CLI hindrance diagnostics), [REQ-FEEDBACK_TO_TIED](../../requirements/REQ-FEEDBACK_TO_TIED.yaml) |

---

## Refine (Touchpoint 1 — RESOLVE)

| Term | Resolution |
| --- | --- |
| **feedback entry** | `fb-mw6d3pz5-9cg0e8` — `bug_report`, tooling_defect: ad-hoc `node -e require('yaml')` + pipe → `tied_checklist_gate_validate` **-32602** cascade |
| **checklist gate operator path** | Sponsor term for running gates via **`tied_gate_check`** / CLI **`tied gate check`** with `request_token`, `phase`, and optional `citdp_path` / `tracker_path` — **without** shell-piped JSON built by repo-root one-liners |
| **promotion status hygiene** | Stale `promotion_pending` on entries whose LEAP proposals are **`applied`** — reconcile to **`canonical_ready`** in Wave 0 (same build-plan session, no new REQ) |
| **Kaizen review bridge** | Phase 5 handoff for `fb-mw6d3pz5` → pending/approved LEAP before minting REQ stack |

**Vocabulary PRELOAD:** [feedback-to-tied.md](../../vocab/feedback-to-tied.md), [tied-yaml-mcp.md](../../vocab/tied-yaml-mcp.md), [leap-proposal-queue.md](../../vocab/leap-proposal-queue.md).

**Consequence ladder**

| Choice | Ladder | Disposition |
| --- | --- | --- |
| Skill + reference anti-patterns (`tools/bundled-tied-yaml-skill/`) | Reversible | **build-plan default** |
| Optional `scripts/run-gate-check.sh` wrapper | Reversible | Include if copy-paste JSON args reduce friction |
| CLI **DIAGNOSTIC** hint on empty stdin + gate `-32602` | Reversible | Stretch — only if RED test locks hint text |
| Mint **REQ-TIED_CHECKLIST_GATE_OPERATOR_PATH** + ARCH/IMPL | Costly | Approved (sponsor countermeasure scope) |
| New MCP gate authority or schema change | Costly | **Out of scope** |
| Auto `tied_feedback_promote` on CLI failure | Costly | **Rejected** |

**Ambiguity cleared:** Distinct from closed **structured record input** work ([REQ-TIED_TOOL_INPUT_COMPATIBILITY](../../requirements/REQ-TIED_TOOL_INPUT_COMPATIBILITY.yaml)); root cause here is **operator procedure** (pipe + missing module), not object-vs-string record fields.

**Alignment**

| Source | Link |
| --- | --- |
| Witness baseline | `fb-mw6d3pz5` body in `tied-project/feedback.yaml` |
| Existing compose surface | MCP `tied_gate_check` — same algorithm as `tied gate check` |
| Skill gap | [`tools/bundled-tied-yaml-skill/SKILL.md`](../../../tools/bundled-tied-yaml-skill/SKILL.md) documents `tied_checklist_gate_validate` but not anti-pipe / `tied_gate_check` preference |

### Operator quick reference (preferred vs witness anti-pattern)

**Forbidden (witness `fb-mw6d3pz5`):** `node -e "… require('yaml') …"` piped into `tied-cli.sh tied_checklist_gate_validate` — root `node -e` has no `yaml` package; empty stdin yields `-32602` (`phase` enum + `citdp` record undefined). This is **operator procedure**, not [REQ-TIED_TOOL_INPUT_COMPATIBILITY] record coercion.

**Preferred — CLI** (from repo root; paths relative to `project_root`):

```bash
node mcp-server/packages/cli/dist/index.js gate check \
  --request-token REQ-TIED_CHECKLIST_GATE_OPERATOR_PATH \
  --phase pre_implementation \
  --tracker tied-project/working/REQ-TIED_CHECKLIST_GATE_OPERATOR_PATH/checklist-tracker.yaml \
  --citdp tied-project/working/REQ-TIED_CHECKLIST_GATE_OPERATOR_PATH/CITDP-REQ-TIED_CHECKLIST_GATE_OPERATOR_PATH.yaml \
  --project-root . \
  --persist-receipt \
  --run-id build-plan-pre-impl
```

**Preferred — MCP:** `tied_gate_check` with the same `request_token`, `phase`, `citdp_path`, `tracker_path`, `project_root` (loads YAML from disk — no inline `citdp` object).

**Direct MCP only when needed:** `tied_checklist_gate_validate` requires a full inline `citdp` **record** object (or coerced JSON string per compatibility rules), not a filesystem path — use path-based tools above instead.

---

## Plan process tools (refine-plan — DAE)

| Check | Result |
| --- | --- |
| `tied-project/config.yaml` `dae.crap_threshold` | `30` — **CRAP adjunct inactive** (no `diff_scoped_crap` on CITDP) |
| BBCE | **not_applicable** |
| Methodology surface enrollment | **not_applicable** — bundled skill + optional mcp-server hint only |
| `tied_gate_check` `pre_implementation` | **allowed: true** (`run_id=refine-plan-pass2-2026-11-07`) |
| `tied_jev_vocab_shadow` | **ran** — `run_id=ps-20261107T130923-e9dcfb39`; `readiness: locally_skipped` (bridge unavailable); evidence under `tied-bundle/working/REQ-TIED_CHECKLIST_GATE_OPERATOR_PATH/jev/plan-skills/` |

**Skill boundary:** Refine stops before **Implement** — no skill edits or RED tests until `@build-plan`.

---

## Program waves (build-plan scope)

| Wave | Token / focus | Outcome |
| --- | --- | --- |
| **0** | Kaizen queue hygiene | Export + digest under `working/FEEDBACK-PENDING-PROCESS-2026-11-07/evidence/`; reconcile rows below; advance `fb-mw6d3pz5` after bridge |

**Wave 0 — `promotion_status` reconciliation (snapshot 2026-11-07)**

| Feedback | Current | LEAP queue | Target (Wave 0) |
| --- | --- | --- | --- |
| `fb-mvmmb3lp-723euw` | `promotion_pending` | `applied` (close-out Track B doc) | `canonical_ready` + `context.reviewed_at` / evidence link |
| `fb-mvmmq5pl-dxzvb6` | `promotion_pending` | slice noted **applied** in same proposal summary (workspace hygiene, 2026-10-24) | `canonical_ready` + evidence link |
| `fb-mvo18hye-i6x5fq` | `proposal_created` | `applied` | `canonical_ready` + evidence link |
| `fb-mw6d3pz5-9cg0e8` | *(unset)* | *(pending bridge)* | `promotion_pending` → `proposal_created` after `tied_feedback_review_bridge` |

| Wave | Token / focus | Outcome |
| --- | --- | --- |
| **1** | LEAP + REQ mint | `tied_feedback_review_bridge` (or `tied_leap_proposal_add` + approve) for `fb-mw6d3pz5`; `tied_token_create_with_detail` for REQ/ARCH/IMPL |
| **2** | TDD countermeasure | Skill § **Checklist gate operator path** (new, before Close-out recovery); `reference.md` tool row; extend `mcp-server/packages/cli/src/gate-check.test.ts` or sibling composition test using **this** working CITDP; optional `scripts/run-gate-check.sh` |
| **3** | Verification + Kaizen close | `tied_verify`, `tied_feedback_outcome_record`, `fb-mw6d3pz5` → `canonical_ready`, scoped traceable-commit |

```mermaid
flowchart LR
  w0[Wave0 hygiene]
  w1[Wave1 LEAP REQ]
  w2[Wave2 skill tests]
  w3[Wave3 closeout]

  w0 --> w1 --> w2 --> w3
```

---

## Plan (CITDP + Tracker)

Full record: [CITDP-REQ-TIED_CHECKLIST_GATE_OPERATOR_PATH.yaml](./CITDP-REQ-TIED_CHECKLIST_GATE_OPERATOR_PATH.yaml) · Tracker: [checklist-tracker.yaml](./checklist-tracker.yaml) · Tests: [test-strategy.md](./test-strategy.md)

| Item | Disposition |
| --- | --- |
| CITDP persist to `tied-project/citdp/` | **Defer** until implementation complete ([citdp-policy.md](../../../tied-bundle/docs/citdp-policy.md)) |
| Adversarial inquiry | **minimal** — `sub-adversarial-inquiry-pass` **not_applicable** |
| IMPL pseudo-code | **build-plan** — sidecar before RED |

### Change definition (summary)

| | Current | Desired |
| --- | --- | --- |
| Operator docs | Agents may pipe broken JSON into `tied-cli.sh tied_checklist_gate_validate` after failed `node -e` YAML parse | Document **forbidden anti-pattern** and **preferred** `tied_gate_check` / `tied gate check` examples with path-based CITDP |
| CLI UX | `-32602` with missing `phase` / `citdp` after empty stdin | Optional richer **TIED_CLI_HINDRANCE** `recovery_hint` pointing to skill section (stretch) |
| Feedback queue | Stale `promotion_pending` despite applied LEAP | **`canonical_ready`** with `context.reviewed_at` evidence refs |

### Non-goals

- Rewriting `tied_checklist_gate_validate` Zod contract
- Adding root `yaml` npm dependency for ad-hoc `node -e` one-liners
- Changing agentstream DAE gate preflight
- Processing unset-status captures (`fb-mw0b2pe8`, etc.) beyond digest export unless grouped

### Test strategy (outline)

See [test-strategy.md](./test-strategy.md). **No RED files authored in refine-plan.**

### Build-plan REQ sketch (Wave 1 — titles only)

| Token | Intent |
| --- | --- |
| `REQ-TIED_CHECKLIST_GATE_OPERATOR_PATH` | Sponsor countermeasure: document and test path-based gate invocation; hygiene for witness class `fb-mw6d3pz5` |
| `ARCH-TIED_CHECKLIST_GATE_OPERATOR_PATH` | Compose [REQ-TIED_DAE_INCORPORATION] `tied_gate_check`; skill as operator surface; no second gate authority |
| `IMPL-TIED_CHECKLIST_GATE_OPERATOR_PATH` | Skill/reference edits; optional CLI `recovery_hint`; composition test module |

---

## Do next

Optional **`@close-out`** for scoped traceable-commit when the sponsor wants machine/process/ledger completion signals on disk.
