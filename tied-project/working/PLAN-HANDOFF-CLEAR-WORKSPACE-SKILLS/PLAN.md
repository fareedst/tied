---
name: Handoff and clear-workspace skills
overview: "Register handoff (rename from session-handoff invoke name; log file session-handoff.md) and clear-workspace orchestrator via BUNDLED_STANDALONE_CLIENT_SKILLS. Two REQ tokens, one implement wave."
todos:
  - id: mint-tied-stack
    content: "Mint REQ/ARCH/IMPL for SESSION_HANDOFF + CLEAR_WORKSPACE; pseudo-code; semantic-tokens.yaml"
    status: completed
  - id: skill-bodies
    content: "Update bundled-session-handoff-skill; add bundled-clear-workspace-skill + prompt-shared/clear-workspace-routing.md"
    status: completed
  - id: red-bootstrap-tests
    content: "RED: client-skills-catalog.test.mjs + client-bootstrap-skills.test.ts expect four standalone skills"
    status: completed
  - id: green-manifest
    content: "GREEN: manifest handoff + clear-workspace entries"
    status: completed
  - id: vocab-leap
    content: "project-operations-mcp.md + routing 2c; tied_validate_consistency"
    status: completed
  - id: verification-closeout
    content: "npm test filter; pre_implementation gate; defer CITDP persist + plan-close-out per REQ"
    status: completed
  - id: close-out-hydrate
    content: "CITDP adversarial_inquiry + tracker hydration (refine pass 2 gate blockers)"
    status: completed
  - id: plan-close-out-exec
    content: "@plan-close-out — gates, git hygiene, CHANGELOG, proposed commit, traceable-commit prep"
    status: completed
isProject: false
---

# Program plan — handoff + clear-workspace standalone skills

**Plan status:** Close-out complete (2026-10-18); **traceable-commit deferred** until sponsor asks. Evidence: [evidence/plan-close-out-handoff.md](./evidence/plan-close-out-handoff.md), [evidence/build-plan-evidence.md](./evidence/build-plan-evidence.md).

**Linked Cursor plans:**

- Build: `handoff_and_clear-workspace_skills_cbdaff99.plan.md`
- Close-out (refined): `plan-close-out_handoff_skills_0864e275.plan.md`

| Phase REQ | Working folder |
| --- | --- |
| **[REQ-TIED_SESSION_HANDOFF_SKILL]** | [../REQ-TIED_SESSION_HANDOFF_SKILL/PLAN.md](../REQ-TIED_SESSION_HANDOFF_SKILL/PLAN.md) |
| **[REQ-TIED_CLEAR_WORKSPACE_SKILL]** | [../REQ-TIED_CLEAR_WORKSPACE_SKILL/PLAN.md](../REQ-TIED_CLEAR_WORKSPACE_SKILL/PLAN.md) |

**Next command:** `@plan-close-out` (or `@clear-workspace` for hygiene + close-out chain before commit).

---

## Refine (Touchpoint 1 — RESOLVE)

### Intent (one line)

Ship two **standalone bundled skills** through **`tied-install.sh`**: **`handoff`** for chat continuity (evidence log **`session-handoff.md`**) and **`clear-workspace`** to run **git hygiene**, **`plan-close-out`**, and **traceable-commit prep** only as warranted.

### Canonical terms

| Term | Meaning |
| --- | --- |
| **`handoff` skill** | Invoke `/handoff` / `@handoff`; store dir [`tools/bundled-session-handoff-skill/`](../../../tools/bundled-session-handoff-skill/) |
| **`session-handoff.md`** | Committed/regenerable **evidence log** under `tied-project/working/{REQ}/evidence/` — **not** the skill install name |
| **`clear-workspace` skill** | Invoke `/clear-workspace`; orchestrator at `tools/bundled-clear-workspace-skill/` |
| **`traceable-commit`** | Checklist **slug** only — not a prompt-type skill; clear-workspace prepares, sponsor commits |
| **Standalone catalog** | `manifest.json` → `BUNDLED_STANDALONE_CLIENT_SKILLS` (today: xlate, unblock) |

### Sponsor decisions (recorded)

| Decision | Choice | Ladder |
| --- | --- | --- |
| Skill invoke name | **`handoff`** (not `session-handoff`) | **Costly** — locked |
| Evidence log filename | **`session-handoff.md`** | **Costly** — locked |
| Legacy `/session-handoff` skill row | **Doc-only** alias phrasing | **Reversible** |
| Bundle directory rename | Keep `bundled-session-handoff-skill` | **Reversible** |
| Implement shape | **One wave**, two REQ tokens, **one** manifest/test diff | **Reversible** |
| `clear-workspace-routing.md` | **Required** in prompt-shared (not optional) | **Reversible** |
| Adversarial depth | **`depth_tier: minimal`**, **`gate_policy: advisory`** | Re-select at build-plan if scope adds MCP/auth |

### Non-goals

- Bulk-rename existing `session-handoff.md` files in working trees
- New MCP tools or prompt-type leaf entries
- Automatic `git commit` / `git push` in either skill
- Replacing **`sub-close-out-evidence-sync`** or envelope machinery

### RESOLVE charter

Agent documents routing defaults and test markers; sponsor owns commit timing and costly naming choices above.

---

## Plan (CITDP + test strategy)

### Change definition summary

| REQ | Current | Desired |
| --- | --- | --- |
| **REQ-TIED_SESSION_HANDOFF_SKILL** | SKILL.md exists; **not** in manifest; invoke name still `session-handoff` in frontmatter | **`handoff`** registered; log path **`evidence/session-handoff.md`** in procedure |
| **REQ-TIED_CLEAR_WORKSPACE_SKILL** | Absent | Orchestrator skill + routing doc + manifest row |

**CITDP (working, persist after implement):**

- [../REQ-TIED_SESSION_HANDOFF_SKILL/CITDP-REQ-TIED_SESSION_HANDOFF_SKILL.yaml](../REQ-TIED_SESSION_HANDOFF_SKILL/CITDP-REQ-TIED_SESSION_HANDOFF_SKILL.yaml)
- [../REQ-TIED_CLEAR_WORKSPACE_SKILL/CITDP-REQ-TIED_CLEAR_WORKSPACE_SKILL.yaml](../REQ-TIED_CLEAR_WORKSPACE_SKILL/CITDP-REQ-TIED_CLEAR_WORKSPACE_SKILL.yaml)

### Impact / modules

| Module | Change |
| --- | --- |
| `tools/bootstrap/manifest.json` | +2 `BUNDLED_STANDALONE_CLIENT_SKILLS` rows |
| Bootstrap tests | Expect **4** standalone skills (was 2) |
| `tied-project/vocab/project-operations-mcp.md` | RECORD handoff + clear-workspace |
| Project REQ/ARCH/IMPL YAML | Mint **6** new detail/index rows (2 stacks) |

**Dependencies:** **[REQ-TIED_CLIENT_BOOTSTRAP_SKILLS]** (catalog installer — **Implemented**). **[REQ-TIED_GIT_HYGIENE]** (MCP reused by clear-workspace — status Planned in index; tool exists on disk).

### Test strategy (must pass before verification claims)

```bash
node --test tools/bootstrap/lib/client-skills-catalog.test.mjs
cd mcp-server && npm test -- client-bootstrap-skills
```

Capture stdout under each REQ `evidence/` on build-plan.

**RED before GREEN:** Update tests to expect `handoff` and `clear-workspace` **before** manifest lists them (TDD).

### Implement sequence (build-plan)

1. Copy Tracker YAML per REQ from [agent-req-implementation-checklist.yaml](../../../tied-bundle/docs/agent-req-implementation-checklist.yaml); set `execution_evidence.request`.
2. Mint tokens + IMPL pseudo-code (bootstrap LOAD/INSTALL blocks for handoff; routing procedure for clear-workspace).
3. RED bootstrap tests (count 4; markers `/handoff`, `/clear-workspace`).
4. Update handoff SKILL.md; add clear-workspace bundle + [`clear-workspace-routing.md`](../../../tools/bundled-prompt-type-skills/prompt-shared/clear-workspace-routing.md).
5. GREEN manifest entries.
6. Vocab RECORD + VALIDATE at traceable-commit.
7. `lint_yaml` on changed project YAML; `tied_validate_consistency`.
8. `tied_checklist_gate_validate` `phase: pre_implementation` then verification after tests.

### Satisfaction criteria (program)

| ID | Criterion |
| --- | --- |
| `handoff-manifest` | `.cursor/skills/handoff` + `.claude/skills/handoff` after install |
| `handoff-log-path` | Procedure writes **`evidence/session-handoff.md`** |
| `clear-workspace-routing` | Shared routing doc + SKILL boundaries (no auto-commit) |
| `bootstrap-tests` | Catalog + e2e standalone install green |
| `tied-validate` | Consistency ok after mint |

---

## Implement (build-plan — done)

Executed 2026-10-18. Evidence: [evidence/build-plan-evidence.md](./evidence/build-plan-evidence.md).

---

## Close-out tranche (refined)

**Prompt-type:** `@plan-close-out` (not build-plan). **Scope:** all dirty paths; **git:** diff-or-stage; **no commit** in close-out pass.

### Prerequisites (gate blockers)

Refine pass 2 probe: `close_out` **`allowed: false`** until:

1. CITDP copies include `risk_analysis.adversarial_inquiry` (minimal / advisory / `not_applicable`).
2. Checklist trackers are authoritative (envelope path, `execution_evidence.completed`, dual-write dispositions).

See linked Cursor plan **Implement** section and [evidence/refine-plan-pass-2.md](./evidence/refine-plan-pass-2.md).

### Close-out test strategy

```bash
node --test tools/bootstrap/lib/client-skills-catalog.test.mjs
node --test tools/bootstrap/lib/install-layers-core.test.mjs
cd mcp-server && npm test -- client-bootstrap-skills
cd mcp-server && npm test -- prompt-type-skills
```

Then `run-close-out-gates.mjs` ×2 (SESSION + CLEAR WORKSPACE), `tied_git_hygiene` preview, CHANGELOG + proposed commit, `traceable-commit` prep.

---

## Gate probe (refine)

| Pass | Phase | Result |
| --- | --- | --- |
| [refine-plan-pass-1.md](./evidence/refine-plan-pass-1.md) | `pre_implementation` (handoff) | `allowed: false` — expected pre build-plan |
| [refine-plan-pass-2.md](./evidence/refine-plan-pass-2.md) | `close_out` (clear-workspace) | `allowed: false` — CITDP shape + envelope missing |

**Refine evidence:** [evidence/refine-plan-pass-1.md](./evidence/refine-plan-pass-1.md) · [evidence/refine-plan-pass-2.md](./evidence/refine-plan-pass-2.md)
