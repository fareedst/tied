# PLAN — Store-only `@record-gf-trial` facilitator skill

**Prompt type:** refine-plan + build-plan (complete 2026-10-24)  
**Linked Cursor plan:** `record-gf-trial_skill_3118d76f.plan.md`  
**Change request:** `PLAN-RECORD-GF-TRIAL-SKILL`  
**Traceability (LEAP scope):** [REQ-TIED_CLIENT_BOOTSTRAP_SKILLS](../../requirements/REQ-TIED_CLIENT_BOOTSTRAP_SKILLS.yaml) · [IMPL-TIED_CLIENT_BOOTSTRAP_SKILLS](../../implementation-decisions/IMPL-TIED_CLIENT_BOOTSTRAP_SKILLS.yaml) — extend for **store facilitator** install path (no new REQ token v1)  
**CITDP (working):** [CITDP-PLAN-RECORD-GF-TRIAL-SKILL.yaml](./CITDP-PLAN-RECORD-GF-TRIAL-SKILL.yaml) — persist to `tied-project/citdp/` after `@build-plan` if behavior ships  
**Tracker:** [checklist-tracker.yaml](./checklist-tracker.yaml)

---

## 1. Refine (Touchpoint 1 — RESOLVE)

**Stripped sponsor intent:** Add a **store-only** skill **`record-gf-trial`** that accepts a disposable **TIED client** directory (path or numeric id), analyzes the as-built client, grades vs existing **GF benchmarks**, publishes **trial readout** docs, and participates in the **Kaizen loop** / **feedback cycle** without the ad hoc `/non-tied-plan … grade and record` prompt.

| Resolved term | Meaning | Where |
| --- | --- | --- |
| **trial readout** | Facilitator markdown under `docs/demos/trial-readout-*.md` | GF-04 precedent |
| **GF benchmarks** | Cohort comparison prose vs existing readouts; not a leaderboard | [catalog grading guardrails](../../../docs/demos/catalog-tied-compact-tools.md#guardrails--forbidden-maturity-framing) |
| **feedback cycle** | Readout + optional store **`tied_feedback_add`** copy of client **`feedback.yaml`** rows | [feedback-to-tied.md](../../vocab/feedback-to-tied.md) |
| **store-only skill** | Not in **`BUNDLED_STANDALONE_CLIENT_SKILLS`**; installed when **`projectRoot === storeRoot`** on self-install | Sponsor choice 2026-10-24 |
| **subject client** | Read-only inspection; **`TIED_BASE_PATH`** scoped to client only for verify commands | FACILITATOR-GF-04 §2.3 |

**PRELOAD:** [feedback-to-tied.md](../../vocab/feedback-to-tied.md), [quality-assurance.md](../../vocab/quality-assurance.md), [project-operations-mcp.md](../../vocab/project-operations-mcp.md).

### Depth and policy

| Layer | `depth_tier` | `gate_policy` |
| --- | --- | --- |
| **This build** | **minimal** | **advisory** |
| **Skill runtime (per trial)** | **minimal** (facilitator publish) | **advisory** |

### Costly choices (consequence ladder)

| Choice | Rung | Disposition |
| --- | --- | --- |
| Treat one graded trial as methodology effectiveness | 3+ | **Forbidden** — future-test rule in skill |
| Write MCP feedback while **`TIED_BASE_PATH`** points at wrong tree | 3+ | **Costly** — skill requires store base path confirm before store ingest |
| Add skill to every disposable client bootstrap | 2 | **Rejected** — store-only |
| **`STORE_FACILITATOR_SKILLS`** manifest key (parallel to standalone list) | 1 | **Locked** for implement |
| Default **stop** if `trial-readout-*-{clientId}.md` exists | 1 | **Locked**; **`--force`** documented for republish |

### Refine gate

See [evidence/refine-plan-pass1.md](./evidence/refine-plan-pass1.md) for **`tied_checklist_gate_validate`** `pre_implementation` result.

---

## 2. Plan (CITDP)

### 2.1 Change definition

| | |
| --- | --- |
| **Current** | Manual facilitator PLANs + `/non-tied-plan` remainder; repeatable steps only in FACILITATOR-* working folders |
| **Desired** | Bundled skill + self-install stub + catalog protocol line; bootstrap unit test |
| **Non-goals** | New store REQ; client repair; MCP schema change; auto-commit |
| **Success** | CITDP success_criteria + tests green |

### 2.2 Impact (files)

| Action | Path |
| --- | --- |
| **New** | `tools/bundled-record-gf-trial-skill/{SKILL.md,reference.md,examples.md,README.md}` |
| **New** | `tools/bootstrap/lib/store-facilitator-skills.mjs`, `store-facilitator-skills.test.mjs` |
| **Edit** | `tools/bootstrap/manifest.json` — **`STORE_FACILITATOR_SKILLS`** array |
| **Edit** | `tools/bootstrap/lib/layers/skills-linked.mjs` — call install when `path.resolve(projectRoot) === path.resolve(storeRoot)` |
| **Edit** | `tools/bootstrap/lib/layers/skills.mjs` or `installSkillsFull` — same guard for `--mode full` store self-install |
| **Edit** | `docs/demos/catalog-greenfield-plan-new-feature-prompts.md`, `docs/demos/README.md` |
| **Edit** | `tied-project/vocab/project-operations-mcp.md` — **RECORD** `record-gf-trial` row |
| **LEAP** | `IMPL-TIED_CLIENT_BOOTSTRAP_SKILLS-pseudocode.md` — `LOAD_STORE_FACILITATOR_SKILLS` / `INSTALL_STORE_FACILITATOR_SKILLS_LINKED_STUB` blocks |

### 2.3 Manifest shape (locked)

```json
"STORE_FACILITATOR_SKILLS": [
  {
    "skillName": "record-gf-trial",
    "storeDir": "tools/bundled-record-gf-trial-skill"
  }
]
```

**Invariant:** `client-skills-catalog.test.mjs` still asserts **five** standalone skills (xlate, unblock, handoff, clear-workspace, feedback).

### 2.4 Skill procedure contract (summary — full text in bundled SKILL.md)

1. Workspace + **`tied_config_get_base_path`** → store `tied-project/`.
2. Resolve client root (`TIED_GF_TRIAL_CLIENTS_ROOT` + id, or absolute path).
3. Discover PROMPT-GF / custom from client `working/*/PLAN.md`.
4. Optional: create **`FACILITATOR-*`** working folder when publishing a **new** readout (skill documents template; does not replace store PLAN for skill build itself).
5. Run facilitator verification matrix (GF-04 §2.3) with client-scoped env.
6. Grade six dimensions; publish readout + catalog rows unless existing readout and no **`--force`**.
7. Feedback: optional store ingest per [PLAN-CLOSE-OUT-W5-FIELD-FEEDBACK](../PLAN-CLOSE-OUT-W5-FIELD-FEEDBACK/PLAN.md) pattern; no auto-promote.

**Readout section contract:** Mirror [FACILITATOR-GF-04 §2.4](../FACILITATOR-GF-04-1792857852/PLAN.md) (12 sections).

### 2.5 Test strategy (RED before GREEN)

| Order | Test | Proves |
| --- | --- | --- |
| 1 | `store-facilitator-skills.test.mjs` | Manifest load, stub `name: record-gf-trial`, canonical path |
| 2 | Integration test optional v2 | `installSkillsLinked` on tmp store root installs stub only when projectRoot equals storeRoot |
| 3 | Regression | `client-skills-catalog.test.mjs` unchanged standalone count |

**Verification commands (implement):**

```bash
node --test tools/bootstrap/lib/store-facilitator-skills.test.mjs
node --test tools/bootstrap/lib/client-skills-catalog.test.mjs
```

### 2.6 Operator install (store)

```bash
cd /path/to/stdd
./tied-install.sh --allow-self-install --layers skills .
# → .cursor/skills/record-gf-trial/SKILL.md stub → tools/bundled-record-gf-trial-skill/SKILL.md
```

### 2.7 Plan gate

Proceed to **`@build-plan`** when **`pre_implementation`** gate allows (or documented minimal waiver) and §2.5 RED test file exists.

---

## 3. Implement boundary (`@build-plan`)

| Phase | Action | Evidence target |
| --- | --- | --- |
| 1 | RED test + manifest entry | `store-facilitator-skills.test.mjs` failing then green |
| 2 | Bundled skill content | `tools/bundled-record-gf-trial-skill/*` |
| 3 | Bootstrap hook + LEAP pseudo-code | skills-linked.mjs + IMPL sidecar |
| 4 | Demo catalog docs | greenfield catalog + README |
| 5 | Vocab RECORD | `project-operations-mcp.md` |
| 6 | Dogfood | Idempotency check client `1792857852` (readout exists) |
| 7 | CHANGELOG Unreleased | Added row |

**Close-out:** **`tied_validate_consistency`** after LEAP YAML edits; **`traceable-commit`** sponsor-only.

**Implement status:** **Complete (build-plan + close-out 2026-10-24)** — [evidence/build-plan-evidence.md](./evidence/build-plan-evidence.md) · traceable-commit **`24f0ef19`** · [evidence/plan-close-out-handoff.md](./evidence/plan-close-out-handoff.md)

| Phase | Status |
| --- | --- |
| 1 RED/GREEN bootstrap test | Done |
| 2 Bundled skill | Done |
| 3 Bootstrap hook + LEAP pseudo-code | Done |
| 4 Demo catalog docs | Done |
| 5 Vocab RECORD | Done |
| 6 Idempotency dogfood note | Done |
| 7 CHANGELOG | Done |

---

## Related

- Facilitator precedent: [FACILITATOR-GF-04-1792857852/PLAN.md](../FACILITATOR-GF-04-1792857852/PLAN.md)
- Linked plan: [record-gf-trial_skill_3118d76f.plan.md](/Users/fareed/.cursor/plans/record-gf-trial_skill_3118d76f.plan.md)
- Feedback skill boundary: [tools/bundled-feedback-skill/SKILL.md](../../../tools/bundled-feedback-skill/SKILL.md)
