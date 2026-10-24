---
name: FRS close-out commit
overview: "LEAP close-out for [REQ-TIED_FEEDBACK_REPORT_SKILL]: backfill tracker evidence, unified close_out + envelope gates, git hygiene preview, CHANGELOG, scoped traceable commit (no push), and close-out handoff with three completion signals."
todos:
  - id: evidence-backfill
    content: Phase 0 — create missing step-evidence files and sub-adversarial-inquiry-pass-evidence.md; confirm not-applicable-receipt.v1.json on disk
    status: pending
  - id: evidence-sync
    content: Re-run focused tests; run run-close-out-gates.mjs (close_out, envelope-blocking, sync-dispositions, reconcile); persist runner JSON under evidence/
    status: pending
  - id: gates-verify
    content: Confirm close_out allowed and envelope blocking_gap_count=0; if blocked, handoff incomplete and skip commit
    status: pending
  - id: hygiene-changelog
    content: tied_git_hygiene preview (plan_close_out); CHANGELOG [Unreleased] /feedback entry; merge hygiene stage candidates into staging map
    status: pending
  - id: citdp-close-commit
    content: persist-citdp-record (closed); VALIDATE vocab; scoped git add; proposed-commit-message + traceable-commit-evidence; git commit (no push)
    status: pending
  - id: citdp-handoff
    content: lint_yaml on changed project YAML; tied_validate_consistency note; close-out-handoff.md with three completion signals + replay block
    status: pending
isProject: false
---

# Close-out refined plan (pass 1) — [REQ-TIED_FEEDBACK_REPORT_SKILL]

**Refined:** 2026-10-24  
**Source plan:** `.cursor/plans/frs_close-out_commit_3d2572ca.plan.md`  
**Request token:** `REQ-TIED_FEEDBACK_REPORT_SKILL`  
**CITDP:** [CITDP-REQ-TIED_FEEDBACK_REPORT_SKILL.yaml](../../citdp/CITDP-REQ-TIED_FEEDBACK_REPORT_SKILL.yaml) (`record_status: open` until close-out)  
**Build tracker:** [checklist-tracker-build.yaml](./checklist-tracker-build.yaml)  
**Close-out tracker (authoritative for gates):** [checklist-tracker-close-out.yaml](./checklist-tracker-close-out.yaml)

## Refine — RESOLVE and depth

| Field | Value |
| --- | --- |
| `profile_depth` / `depth_tier` | **minimal** |
| `gate_policy` | **advisory** |
| Adversarial inquiry | **not_applicable** — [sub-adversarial-inquiry-pass-na.md](./evidence/sub-adversarial-inquiry-pass-na.md), [not-applicable-receipt.v1.json](./evidence/not-applicable-receipt.v1.json) |
| Sponsor intent | **Traceable commit when unified close_out allows**; no push unless asked |
| Out of scope | Live `/feedback` capture, push, edits to other bundled skills, unrelated dirty tree |

**Reversible defaults for execute:** use fresh `run_id` `close-out-req-tied-feedback-report-skill-2026-10-24`; keep bootstrap-only proof boundary (catalog + static SKILL e2e).

**Costly choice (sponsor already accepted):** single scoped commit bundling product + committed process evidence; do not widen staging map to repo-wide hygiene fixes.

### Gap reconciliation (vs source plan)

1. **Tracker evidence drift:** [checklist-tracker-build.yaml](./checklist-tracker-build.yaml) marks build steps `completed` but nine `evidence/*-evidence.md` paths and `verification-evidence-manifest.v1.json` are **missing** on disk. Envelope/sync will fail or emit blocking gaps until **Phase 0** backfill (thin stubs pointing at CITDP, tests, pseudocode, NA inquiry).
2. **Close-out slugs:** Build tracker ends at `verification-gate`; close-out requires `gitignore-close-out-hygiene`, `sub-close-out-evidence-sync`, `persist-citdp-record`, `traceable-commit` on the **close-out tracker** (dual-write with `execution_evidence.completed` in the same pass as sync).
3. **CITDP close before commit:** Set `record_identity.record_status: closed`, `closed_at`, and close-out `run_id` **before** `git commit` so the staged CITDP matches handoff claims.
4. **Hygiene stage candidates:** After sync, merge MCP `tied_git_hygiene` `committed_working_stage_candidates` into the staging map ([traceable-commit-close-out.md](../../../tools/bundled-prompt-type-skills/prompt-shared/traceable-commit-close-out.md)).

### Gate baseline (refine pass, read-only)

Full CITDP + build tracker at `pre_implementation`:

```text
allowed: true (tied gate check --json-only)
```

**Do not treat this as machine close-out.** Execute must still run `run-close-out-gates.mjs --envelope-blocking --sync-dispositions --reconcile` and satisfy **three completion signals** ([completion-signals-handoff.md](../../../tools/bundled-prompt-type-skills/prompt-shared/completion-signals-handoff.md)).

---

## Plan — CITDP and test strategy

### LEAP / stack

Confirm shipped tree matches CITDP `change_definition.success_criteria` and `leap_feedback.status: applied`. On drift, LEAP **IMPL → ARCH → REQ** before close-out claims.

### Focused verification (re-run in execute)

| Module | Command | Artifact |
| --- | --- | --- |
| `client_skills_catalog` | `node --test tools/bootstrap/lib/client-skills-catalog.test.mjs` | refresh [verification-tests.stdout.txt](./evidence/verification-tests.stdout.txt) |
| `bundled_feedback_skill` | `cd mcp-server && npx tsx --test src/e2e/feedback-skill.test.ts` | same stdout file (append or replace with labeled sections) |

Optional when verification-gated: MCP `tied_verify` with update after tests green.

### Risk (handoff)

- **RISK-FRS-001** — wrong `TIED_BASE_PATH` at capture time (skill mitigates; not eliminated by install tests).
- **Environmental** — repo-wide `tied_validate_consistency` unrelated gaps → document in handoff, not FRS regression.

---

## Implement — execute order

Invoke **`@close-out`** or **`@build-plan`** against this file; follow [close-out/SKILL.md](../../../tools/bundled-prompt-type-skills/close-out/SKILL.md).

### Phase 0 — Evidence backfill (before gate runner)

For each build step slug, ensure `steps[].evidence_refs` paths exist (minimal markdown stub: slug, date, pointers to CITDP section / test paths):

- `change-definition-evidence.md`
- `gate-pseudocode-validation-evidence.md`
- `impact-discovery-evidence.md`
- `risk-assessment-evidence.md`
- `session-bootstrap-evidence.md`
- `sub-adversarial-inquiry-pass-evidence.md` → link NA doc + `not-applicable-receipt.v1.json`
- `test-strategy-evidence.md`
- `translate-sponsor-intent-evidence.md`
- `unit-test-green-evidence.md`

Copy close-out tracker from [checklist-tracker-close-out.yaml](./checklist-tracker-close-out.yaml); after backfill, set build-step dispositions to `completed` with typed refs where the template uses `kind: file_path`.

### Phase 1 — Tests

Re-run focused battery; capture stdout to `evidence/verification-tests.stdout.txt`.

### Phase 2 — Unified close-out sync

```bash
node tools/bootstrap/templates/run-close-out-gates.mjs \
  --project-root /Users/fareed/Documents/dev/chatgpt/stdd \
  --request-token REQ-TIED_FEEDBACK_REPORT_SKILL \
  --tracker-path tied-project/working/REQ-TIED_FEEDBACK_REPORT_SKILL/checklist-tracker-close-out.yaml \
  --citdp-path tied-project/citdp/CITDP-REQ-TIED_FEEDBACK_REPORT_SKILL.yaml \
  --phase close_out \
  --run-id close-out-req-tied-feedback-report-skill-2026-10-24 \
  --envelope-blocking --sync-dispositions --reconcile
```

Persist runner output as `evidence/closeout-run-close-out-gates-close-out-req-tied-feedback-report-skill-2026-10-24.json`.

**Hard stop:** `allowed: true` **and** `blocking_gap_count: 0` on envelope validate. Else → [close-out-handoff.md](./evidence/close-out-handoff.md) **incomplete**, **commit skipped**, list diagnostics.

### Phase 3 — Git hygiene (preview)

MCP `tied_git_hygiene`: `context_mode: plan_close_out`, `apply: false`, `request_token: REQ-TIED_FEEDBACK_REPORT_SKILL`.

Write `evidence/git-hygiene-receipt-2026-10-24.md`. Record gitignore bullet per [gitignore-close-out-hygiene.md](../../../tools/bundled-prompt-type-skills/prompt-shared/gitignore-close-out-hygiene.md).

### Phase 4 — Persist CITDP + prologue (only when Phase 2 passes)

1. Update CITDP `record_identity`: `record_status: closed`, `closed_at`, close-out `run_id`.
2. [CHANGELOG.md](../../../CHANGELOG.md) — `## [Unreleased]` **Added**: `/feedback` bundled skill, fifth standalone bootstrap skill, tokens `REQ-TIED_FEEDBACK_REPORT_SKILL` / `ARCH-TIED_FEEDBACK_REPORT_SKILL_BOUNDARY` / `IMPL-TIED_FEEDBACK_REPORT_SKILL`, link working folder + CITDP.
3. **Staging map** (product + committed process evidence):

   - `tools/bundled-feedback-skill/**`
   - `tools/bootstrap/manifest.json`, `tools/bootstrap/lib/client-skills-catalog.test.mjs`
   - `mcp-server/src/e2e/feedback-skill.test.ts`
   - `tied-project/requirements*.yaml`, detail dirs, `architecture-decisions*`, `implementation-decisions*`, `semantic-tokens.yaml`
   - `tied-project/citdp/CITDP-REQ-TIED_FEEDBACK_REPORT_SKILL.yaml`
   - `tied-project/vocab/project-operations-mcp.md`, `tied-project/vocab/routing.md`
   - `tied-project/working/REQ-TIED_FEEDBACK_REPORT_SKILL/**` (tracker, envelope, manifest, handoffs, curated evidence — not regenerable-only under `tied-bundle/working/`)
   - `CHANGELOG.md`
   - plus hygiene `committed_working_stage_candidates`

4. Touchpoint 3 VALIDATE vocab on staged paths.
5. Write `evidence/proposed-commit-message.txt`, `evidence/traceable-commit-evidence.md`.
6. `git commit` per [commit-guidelines.md](../../../tied-bundle/docs/commit-guidelines.md) (e.g. `feat(bootstrap): add /feedback bundled skill and TIED tokens`). **No push.**

### Phase 5 — Post-commit validation note

- `lint_yaml` on changed project TIED YAML.
- `tied_validate_consistency` — record repo-wide pre-existing issues in handoff if scoped FRS tokens are clean.

### Phase 6 — Handoff

Write [close-out-handoff.md](./evidence/close-out-handoff.md) using [PLAN-DATA-FILE-ORDERING example](../PLAN-DATA-FILE-ORDERING/evidence/close-out-handoff.md):

| Signal | Content |
| --- | --- |
| **Machine close-out** | `close_out` allowed; envelope path; blocking gaps 0; runner receipt path |
| **Process contract** | sync-dispositions + reconcile; minimal/advisory depth |
| **Adherence ledger** | reconcile band / gate ledger excerpt |
| **Commit** | SHA or **commit skipped** + reason |
| **Replay** | Full `run-close-out-gates.mjs` command block |

Mark close-out tracker slugs `sub-close-out-evidence-sync`, `persist-citdp-record`, `traceable-commit`, `gitignore-close-out-hygiene` **completed** with typed evidence refs in the same pass as handoff.

---

## Out of scope (unchanged)

- `/feedback` live capture session
- Push to remote
- Fixing unrelated workspace dirt outside staging map

## Next step

Run **`@close-out`** with git preamble when ready, or **`@build-plan`** referencing this refined plan file.
