---
name: plan-close-out traceable-commit
overview: "Extend @plan-close-out to run default tied_git_hygiene (preview) and checklist-aligned traceable-commit when unified close_out allows; sibling close-out leaves unchanged."
linked_cursor_plan: plan-close-out_commit_c1bbb590.plan.md
request_token: REQ-PROMPT_TYPE_GLOBAL_SKILLS
working_slug: REQ-PROMPT_TYPE_PLAN_CLOSE_OUT_COMMIT
---

# PLAN — plan-close-out traceable-commit + git hygiene

**Plan status:** **Close-out complete** (2026-10-20) — commit `cf2c43b4`. Handoff: [evidence/session-handoff.md](evidence/session-handoff.md).

## Session handoff (2026-10-20 — refine pass 2)

Close-out **ready to execute** — dedicated [checklist-tracker.yaml](checklist-tracker.yaml); rebuild stale envelope at **minimal** depth before `--envelope-blocking`.  
**Primary REQ:** [REQ-PROMPT_TYPE_GLOBAL_SKILLS](../../requirements/REQ-PROMPT_TYPE_GLOBAL_SKILLS.yaml) (contract extension; no new leaf skill).  
**Cross-ref:** [REQ-TIED_GIT_HYGIENE](../../requirements/REQ-TIED_GIT_HYGIENE.yaml), [REQ-PROMPT_TYPE_SUBAGENT](../../requirements/REQ-PROMPT_TYPE_SUBAGENT.yaml) (agent wrapper).  
**Tracker (close-out):** [checklist-tracker.yaml](checklist-tracker.yaml) — refine-only history: [checklist-tracker-refine.yaml](checklist-tracker-refine.yaml)  
**CITDP (working):** [CITDP-REQ-PROMPT_TYPE_PLAN_CLOSE_OUT_COMMIT.yaml](CITDP-REQ-PROMPT_TYPE_PLAN_CLOSE_OUT_COMMIT.yaml)  
**Test strategy:** [test-strategy.md](test-strategy.md)

**Sponsor decisions (recorded):**

| Decision | Choice | Ladder |
| --- | --- | --- |
| Commit when `close_out` blocked | **Skip commit**; incomplete handoff with blockers | Reversible |
| `@plan-close-out` invocation | Authorizes **stage + commit** when gates allow (replaces prior commit-deferred skill contract) | Costly — changes global Prompt Composer semantics |
| Git hygiene | **`tied_git_hygiene`** `context_mode: plan_close_out`, **`apply: false`** by default; guarded apply only with exact `allowed_paths` | Reversible |
| Push | **Never** unless sponsor asks (unchanged) | Reversible |

---

## Refine (Touchpoint 1 — RESOLVE)

### Intent (one line)

Make **`plan-close-out`** the single close-out surface that finishes with **[PROC-GITIGNORE_CLOSE_OUT]** handoff, default **git hygiene preview**, and checklist slug **`traceable-commit`** (VALIDATE → stage → commit), while **`leap-diff-promote`** and **`ammend-commit`** keep **do not commit**.

### Vocabulary RECORD (required during implement)

Update [prompt-composer.md](../../vocab/prompt-composer.md):

| Old preferred | New preferred |
| --- | --- |
| **plan-close-out (commit deferred)** | **plan-close-out (traceable commit when gates allow)** — prepares gates/CHANGELOG/**executes commit** when machine close-out passes; skips commit when blocked |
| **caller git context** … no agent-initiated git in plan-close-out | **caller git context** describes starting tree; agent may run read-only git + stage/commit **only in traceable-commit phase** after gates |

### Non-goals

- Changing **`ammend-commit`** / **`leap-diff-promote`** / **`plan-new-feature`** git policy
- Auto **`tied_git_hygiene` apply** without sponsor **`allowed_paths`**
- **`git push`** by default
- New MCP tools (reuse **`tied_git_hygiene`**, existing gate runner)

### Unchanged-behavior checklist

| Surface | Must stay |
| --- | --- |
| `leap-diff-promote/SKILL.md` | Forbidden `git add` / `git commit` |
| `ammend-commit/SKILL.md` | Forbidden commit/amend execution |
| `git_preamble_close_out` (paste template) | Still usable for **prep-only** contexts (e.g. clear-workspace gap analysis before invoking plan-close-out) |
| Checklist slug **`traceable-commit`** | Same preconditions (gate + envelope + Touchpoint 3 VALIDATE) |

### Anti-examples

- Committing when **`merged_decision.allowed: false`** or envelope has blocking gaps
- Staging unrelated workspace drift “because it was dirty”
- Deleting untracked files via hygiene **`apply: true`** without exact allowlist
- Collapsing the three **completion signals** into “committed therefore done”

---

## Plan (CITDP)

### Change definition

| | Current | Desired |
| --- | --- | --- |
| `plan-close-out/SKILL.md` | Gates OK → CHANGELOG + proposed message; **forbidden** commit | Gates OK → hygiene receipt → CHANGELOG → **traceable-commit** |
| `.cursor/agents/plan-close-out.md` | “Do not commit”; handoff denies SHA | Hygiene + traceable-commit; handoff includes **SHA** or **skip reason** |
| `tied-close-out-process.md` | Single prologue: propose only | Split: standard (no commit) vs **plan-close-out** prologue |
| `prompt-type-skills.md` | “All skills” never run git | **Exception** for `plan-close-out` |
| `SHARED_REFERENCES` test inventory | 18 files | **19** (+ `traceable-commit-close-out.md`) |
| IMPL inventory prose | “15 direct Markdown references” | Align to **19** (or “enumerated in test”) |

### Profile / gates

- **`depth_tier`:** **minimal** (docs + static tests only; no new executable product surface)
- **`gate_policy`:** **advisory**
- **`surface_ref`:** `plan-close-out` (methodology surface enrollment: note-only unless CITDP declares link)

### Risks

| Risk | Mitigation |
| --- | --- |
| Agents assume all prompt types still no-commit | Update **`prompt-type-skills.md`**, taxonomy hint, **prompt-composer** glossary |
| Stale handoff docs say “plan-close-out forbids commit” | Out of scope to rewrite history; new skill text is authoritative |
| Test loop expects all CLOSE_OUT leaves “Do not commit” | Split assertions: **`plan-close-out`** vs **`ammend-commit`** / **`leap-diff-promote`** |

---

## Implement (phased)

### Phase 0 — RED (contract tests first)

1. Update [prompt-type-subagent.test.ts](../../../mcp-server/src/e2e/prompt-type-subagent.test.ts):
   - **`plan-close-out` agent** must reference **`traceable-commit-close-out.md`** and/or **`tied_git_hygiene`** / **`traceable-commit`**
   - Must **not** require global “Do not commit” for **`plan-close-out`** only
   - Handoff contract: **commit SHA** or **commit skipped**
2. Add **`traceable-commit-close-out.md`** to **`SHARED_REFERENCES`** in [prompt-type-skills.test.ts](../../../mcp-server/src/e2e/prompt-type-skills.test.ts) — tests fail until file exists and **`plan-close-out/SKILL.md`** links it.
3. Run: `cd mcp-server && node --test src/e2e/prompt-type-subagent.test.ts src/e2e/prompt-type-skills.test.ts` (expect RED).

### Phase 1 — Shared docs + skill bundle

1. Add [traceable-commit-close-out.md](../../../tools/bundled-prompt-type-skills/prompt-shared/traceable-commit-close-out.md) — distill checklist **`traceable-commit`** tasks (~797–817 in agent checklist YAML): evidence paths, VALIDATE, staging map, `[PROC-COMMIT_MESSAGES]`, no push, post-commit tracker disposition.
2. Edit [tied-close-out-process.md](../../../tools/bundled-prompt-type-skills/prompt-shared/tied-close-out-process.md) — **Prologue (plan-close-out)** → CHANGELOG + link traceable doc; keep standard prologue for diff-promote/amend.
3. Edit [plan-close-out/SKILL.md](../../../tools/bundled-prompt-type-skills/plan-close-out/SKILL.md):
   - Procedure order: git preamble **`git_preamble_plan_close_out`** → process 1–6 → adjuncts → **`close_out` gates** → on success **`tied_git_hygiene`** → plan-close-out prologue
   - Gates/outputs/forbidden as refined above
4. Edit [git-context-templates.md](../../../tools/bundled-prompt-type-skills/prompt-shared/git-context-templates.md) — new **`git_preamble_plan_close_out`** block (no “keep unstaged” constraint).
5. Edit [gitignore-close-out-hygiene.md](../../../tools/bundled-prompt-type-skills/prompt-shared/gitignore-close-out-hygiene.md) matrix + remove “agent-initiated git forbidden in plan-close-out”.
6. Edit [clear-workspace-routing.md](../../../tools/bundled-prompt-type-skills/prompt-shared/clear-workspace-routing.md) + [completion-signals-handoff.md](../../../tools/bundled-prompt-type-skills/prompt-shared/completion-signals-handoff.md).
7. Edit [.cursor/agents/plan-close-out.md](../../../.cursor/agents/plan-close-out.md) to match SKILL (source of truth remains bundled SKILL).

### Phase 2 — Methodology + taxonomy + TIED LEAP

1. [prompt-type-skills.md](../../../tied-bundle/docs/prompt-type-skills.md) — leaf table + Git exception subsection.
2. [prompt-type-taxonomy.ts](../../../mcp-server/src/jev/prompt-type-taxonomy.ts) — hint text.
3. REQ satisfaction criterion + ARCH note + IMPL inventory + pseudo-code block comments.
4. [prompt-composer.md](../../vocab/prompt-composer.md) RECORD.
5. `lint_yaml` on touched YAML; **`tied_validate_consistency`**.

### Phase 3 — `@plan-close-out` (machine close-out + traceable commit)

**Prerequisite:** Stale [request-evidence-envelope.v1.json](evidence/request-evidence-envelope.v1.json) may show `identity.depth_tier: integrated` and blocking `evidence_chain_profile` gap — **rebuild** via gate runner using CITDP **minimal** depth (do not hand-patch integrated identity).

1. **Verification replay** — `cd mcp-server && node --test src/e2e/prompt-type-subagent.test.ts src/e2e/prompt-type-skills.test.ts`; **`tied_validate_consistency`**.
2. **Unified close_out gates** — from repo root:

```bash
node tools/bootstrap/templates/run-close-out-gates.mjs \
  --project-root /Users/fareed/Documents/dev/chatgpt/stdd \
  --request-token REQ-PROMPT_TYPE_PLAN_CLOSE_OUT_COMMIT \
  --tracker-path tied-project/working/REQ-PROMPT_TYPE_PLAN_CLOSE_OUT_COMMIT/checklist-tracker.yaml \
  --citdp-path tied-project/working/REQ-PROMPT_TYPE_PLAN_CLOSE_OUT_COMMIT/CITDP-REQ-PROMPT_TYPE_PLAN_CLOSE_OUT_COMMIT.yaml \
  --phase close_out \
  --run-id pco-close-out-20261020 \
  --envelope-blocking \
  --sync-dispositions \
  --reconcile
```

Persist stdout to `evidence/closeout-run-close-out-gates-final.json`. Proceed only when `merged_decision.allowed === true` and `envelope.blocking_gap_count === 0`; otherwise **skip commit** (sponsor lock).

3. **`tied_git_hygiene`** — `context_mode: plan_close_out`, `apply: false`; receipt `evidence/git-hygiene-receipt-{YYYY-MM-DD}.md`.
4. **Traceable-commit** — [traceable-commit-close-out.md](../../../tools/bundled-prompt-type-skills/prompt-shared/traceable-commit-close-out.md): Touchpoint 3 VALIDATE; `evidence/proposed-commit-message.txt` + `evidence/traceable-commit-evidence.md`; scoped `git add`; commit; record SHA; mark **`traceable-commit`** completed on [checklist-tracker.yaml](checklist-tracker.yaml).
5. **Persist CITDP** to [tied-project/citdp/CITDP-REQ-PROMPT_TYPE_PLAN_CLOSE_OUT_COMMIT.yaml](../../citdp/CITDP-REQ-PROMPT_TYPE_PLAN_CLOSE_OUT_COMMIT.yaml).
6. **Handoff** — three completion signals per [completion-signals-handoff.md](../../../tools/bundled-prompt-type-skills/prompt-shared/completion-signals-handoff.md). **No push** unless sponsor asks.

**Explicit exclude from staging:** `tied-project/working/REQ-TIED_LEGACY_LAYOUT_DOC_DECOMMISSION/**` and other unrelated REQ working-tree drift.

---

## Verification gates (implement)

| Gate | Command / tool | Phase |
| --- | --- | --- |
| Static contract | `node --test mcp-server/src/e2e/prompt-type-*.test.ts` | verification |
| TIED consistency | `tied_validate_consistency` | verification |
| Machine close-out | `run-close-out-gates.mjs --envelope-blocking --sync-dispositions --reconcile` | close_out |
| Traceable-commit | In skill pass: commit + Touchpoint 3 VALIDATE evidence | close_out |

**Refine gates:** Pass 1 — `run_id=pco-refine-preimpl-20261019-r4`, [gates/pre_implementation-2026-10-20T04-57-55-060Z.json](gates/pre_implementation-2026-10-20T04-57-55-060Z.json). Pass 2 — **`allowed: true`** — `run_id=pco-refine-preimpl-20261020-p2`, [gates/pre_implementation-2026-10-20T05-07-20-634Z.json](gates/pre_implementation-2026-10-20T05-07-20-634Z.json). Details: [evidence/refine-plan-pass2.md](evidence/refine-plan-pass2.md). CITDP body passed **unwrapped** to MCP.

---

## Staging scope (traceable-commit preview)

**Include:** `tools/bundled-prompt-type-skills/**`, `.cursor/agents/plan-close-out.md`, `mcp-server/src/e2e/prompt-type*.test.ts`, `mcp-server/src/jev/prompt-type-taxonomy.ts`, `tied-bundle/docs/prompt-type-skills.md`, `tied-project/{requirements,architecture-decisions,implementation-decisions,vocab}/**` for this REQ, `tied-project/working/REQ-PROMPT_TYPE_PLAN_CLOSE_OUT_COMMIT/**`, `CHANGELOG.md`.

**Exclude:** Unrelated in-flight REQ working trees, regenerable envelope JSON unless whitelisted, unrelated `tied-bundle/` index churn not produced by this pass.
