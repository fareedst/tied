# PLAN — [REQ-WF_TRIAL_IMPLEMENTATION_STACK] (refine-plan)

| Field | Value |
| --- | --- |
| **Status** | build-plan complete (2026-11-04) — close-out deferred |
| **profile_depth** | `minimal` |
| **gate_policy** | `advisory` |
| **Origin** | Sponsor: lock **TypeScript** (+ `node --test` / `tsx`) on WF matrix trials so cohorts compare product decisions, not Python vs npm harness |
| **Related** | [REQ-WF_TRIAL_FOUR_PHASE_HARDENING](../../requirements/REQ-WF_TRIAL_FOUR_PHASE_HARDENING.yaml) (preload materialize — extend, do not reopen close-out) · [catalog-traditional-workflow-trial-prompts.md](../../../docs/demos/catalog-traditional-workflow-trial-prompts.md) |

---

## 1. Refine — resolved decisions

| Topic | Resolution |
| --- | --- |
| **Problem** | Language-neutral prompts (e.g. PROMPT-WF-03) let **refine-plan** pick Python or TypeScript; PROMPT-WF-01 explicitly invites either. Preload copy leaves `implementation_contract.language` empty ([materialize_disposable_preload_contract](../../../scripts/lib/wf-trial-four-phase-hardening.inc.sh)). |
| **Scope** | **Orchestrated** path only: [`workflow-trial-agentstream.sh`](../../../scripts/workflow-trial-agentstream.sh) after disposable bootstrap. Manual IDE trials on raw `test-new-tied-client` **unchanged** unless facilitator copies stack docs. |
| **Sponsor remainder** | Keep pasted PROMPT-WF blocks **plain product language** (catalog rule). Stack enforced via **seed + preload + batch goals**, not TIED tokens in remainder. **Exception:** PROMPT-WF-01 text drops “Pick TypeScript or Python” → TypeScript-only wording. |
| **Stack id** | `wf-trial-ts-node-test-v1` — recorded in `trial-workflow-interaction-inventory.v1.json` and facilitator readouts. |
| **Language** | **TypeScript** only for product code under `src/`. |
| **Module** | **ESM** — `"type": "module"` in seeded `package.json`. |
| **Test runner** | **`node --import tsx --test`** (sponsor choice); glob **`src/**/*.test.ts`**. |
| **Test command** | **`npm test`** — canonical facilitator verification (aligns with RED archive guidance in four-phase hardening). |
| **Layout** | Product: `src/**/*.ts`; tests: **colocated** `src/**/*.test.ts` (not top-level `tests/`). |
| **Dependencies** | **No runtime** npm deps; devDependencies only: `typescript`, `tsx`, `@types/node` (pinned ranges in fixture, not floating `latest`). |
| **Preload source** | New bundle file **`tied-bundle/docs/wf-trial-agent-preload-contract.yaml`** — full contract derived from [agent-preload-contract-template.yaml](../../../tied-bundle/docs/agent-preload-contract-template.yaml) with stack fields set. Orchestrator **`materialize_wf_trial_preload_contract`** copies **this** file (copy-if-absent), not bare template. Existing generic `materialize_disposable_preload_contract` unchanged for non-WF callers. |
| **Fixture location** | **`tools/bootstrap/fixtures/wf-trial-typescript-stack/`** — `package.json`, `tsconfig.json`, `src/.gitkeep`. Helper **`seed_wf_trial_typescript_stack(WORKSPACE)`** in **`scripts/lib/wf-trial-implementation-stack.inc.sh`** (copy-if-absent per file). |
| **Orchestrator hook order** | After `WORKSPACE` known: `seed_wf_trial_typescript_stack` → `materialize_wf_trial_preload_contract` → existing reconcile preflight → four-phase exec. |
| **Refine semantics** | New **`prompt-shared/wf-trial-refine-plan-stack.md`**; [traditional-four-phase-agentstream.yaml](../../../docs/demos/traditional-four-phase-agentstream.yaml) turn 2: stack **pre-locked** — copy into PLAN **Locked stack** table; refine **product** ambiguity only. Turn 1 seeds inventory `implementation_stack_id`. Turn 3: RED/GREEN via **`npm test`**. |
| **Facilitator** | [`@record-wf-trial`](../../../tools/bundled-record-wf-trial-skill/SKILL.md): default verify `npm test`; stack compliance note (no `*.py` / `requirements.txt` without waiver). Catalog new § **Trial implementation stack**. |
| **Opt-out** | **`WF_TRIAL_SKIP_IMPLEMENTATION_STACK=1`** skips seed + WF-specific preload (diagnostics only; matrix comparability waived). Default **on** when orchestrator runs. |
| **New REQ** | Separate from FOUR_PHASE_HARDENING — `[REQ-WF_TRIAL_IMPLEMENTATION_STACK]`, `[ARCH-WF_TRIAL_IMPLEMENTATION_STACK]`, `[IMPL-WF_TRIAL_IMPLEMENTATION_STACK]`. |
| **Reversible** | Stack id bump if layout or runner changes; opt-out env. |
| **Costly** | Seeding `package.json` on disposable clients constrains “empty greenfield” narrative for orchestrated runs; manual trials need explicit waiver if stack skipped. |

---

## 2. Locked stack contract (v1)

| Field | Value |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Language | TypeScript |
| Module | ESM |
| Product paths | `src/**/*.ts` |
| Test paths | `src/**/*.test.ts` |
| Test script | `"test": "node --import tsx --test 'src/**/*.test.ts'"` |
| Typecheck (optional) | `"typecheck": "tsc --noEmit"` when `tsconfig.json` present |
| Facilitator verify | `npm test`; optional `npm run typecheck` |

**Intentionally not locked:** duplicate policy (WF-02), null/missing rule (WF-07), WF-03 delivery pattern (push vs pull), REQ token naming, public API shape beyond “small library modules”, `depth_tier` beyond documenting **minimal** in batch (already in turn 3 goal).

---

## 3. Seeded `package.json` (normative for build-plan)

```json
{
  "name": "wf-trial-disposable",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --import tsx --test 'src/**/*.test.ts'",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@types/node": "^22.10.0",
    "tsx": "^4.19.0",
    "typescript": "^5.7.0"
  }
}
```

**Note:** Agents run `npm install` during build-plan when adding deps; fixture ships lockfile **optional** — v1 **no** `package-lock.json` in fixture (agents generate; facilitator records whether install was needed).

---

## 4. Preload contract highlights

File: `tied-bundle/docs/wf-trial-agent-preload-contract.yaml` (full file at build-plan).

Minimum `implementation_contract` fields:

- `language`: `TypeScript`
- `test_framework`: `node-test`
- `target_source_paths`: `["src/"]`
- `test_cohabit_code`: `"true"`

`workspace.project_summary`: one line referencing `implementation_stack_id` and `npm test`.

---

## 5. Deliverables (build-plan)

| # | Path | Purpose |
| --- | --- | --- |
| D1 | `tools/bootstrap/fixtures/wf-trial-typescript-stack/*` | Stack seed |
| D2 | `scripts/lib/wf-trial-implementation-stack.inc.sh` | `seed_wf_trial_typescript_stack`, `materialize_wf_trial_preload_contract` |
| D3 | `scripts/workflow-trial-agentstream.sh` | Call D2; honor `WF_TRIAL_SKIP_IMPLEMENTATION_STACK` |
| D4 | `tied-bundle/docs/wf-trial-agent-preload-contract.yaml` | WF preload body |
| D5 | `docs/demos/catalog-traditional-workflow-trial-prompts.md` | Facilitator stack §; PROMPT-WF-01; fair comparison |
| D6 | `docs/demos/traditional-four-phase-agentstream.yaml` | Turns 1–3 stack hints |
| D7 | `tools/bundled-prompt-type-skills/prompt-shared/wf-trial-refine-plan-stack.md` | Turn 2 playbook |
| D8 | `tools/bundled-record-wf-trial-skill/reference.md` (+ SKILL if needed) | Verification + stack compliance |
| D9 | `tools/bootstrap/workflow-trial-agentstream-sh.test.mjs` | TS-STACK-* tests |
| D10 | TIED REQ/ARCH/IMPL index + details + `semantic-tokens.yaml` | Traceability |
| D11 | `tied-project/vocab/agentstream.md` | **WF trial implementation stack**, **implementation_stack_id**, **WF_TRIAL_SKIP_IMPLEMENTATION_STACK** |

---

## 6. Test strategy

See [test-strategy.md](./test-strategy.md).

---

## 7. CITDP

See [CITDP-REQ-WF_TRIAL_IMPLEMENTATION_STACK.yaml](./CITDP-REQ-WF_TRIAL_IMPLEMENTATION_STACK.yaml).

---

## 8. Handoff

**Next:** `@build-plan` — TDD shell tests first, then inc.sh + orchestrator + docs + TIED tokens; run `node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs`; `tied_validate_consistency`.

**Advisory gate:** `pre_implementation` expected **not allowed** until RED/design complete — not a refine-plan failure.
