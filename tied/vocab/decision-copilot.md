# decision-copilot (canonical)

**Scope:** Optional **System One** decision APIs (Jev) as a fast judgment **coprocessor** inside TIED operator surfaces. Deterministic MCP gates and the token graph remain authoritative.

**Traceability:** [REQ-TIED_JEV_DECISION_COPROCESSOR](../requirements/REQ-TIED_JEV_DECISION_COPROCESSOR.yaml) · [ARCH-TIED_JEV_DECISION_COPROCESSOR](../architecture-decisions/ARCH-TIED_JEV_DECISION_COPROCESSOR.yaml) · [IMPL-TIED_JEV_DECISION_COPROCESSOR](../implementation-decisions/IMPL-TIED_JEV_DECISION_COPROCESSOR.yaml)

**See also:** [`routing.md`](routing.md) · [`prompt-composer.md`](prompt-composer.md) · [`fidelity-research.md`](fidelity-research.md) · [`system-one-jev-taxonomy-and-opportunities.md`](../../docs/comparisons/system-one-jev-taxonomy-and-opportunities.md)

---

## Preferred terms vs synonyms

| Preferred | Avoid | Notes |
|-----------|-------|-------|
| **System One model** | small LLM, classifier LLM | Typed decisions only; no prose generation |
| **bounded semantic decision engine** | generative LLM (for decisions) | State in, typed judgments + calibrated probabilities out |
| **decision coprocessor** | Jev agent | Advises; code and deterministic gates commit outcomes |
| **decision algebra** | ad-hoc classification | 6 operators: judge, transform collection, control program, control sequence, control uncertainty, control expensive intelligence |
| **decision role taxonomy** | subject-matter catalog | 40-category functional classification organized by 27 canonical decision verbs |
| **semantic garbage collection** | context summarization | Pruning logs and context chunks by semantic relevance rather than lossy LLM summarization |
| **noul gate** | boolean LLM output | Calibrated 0–1 yes/no; threshold policy is code-owned |
| **speculative fan-out** | sequential LLM chain | Many `questions` in one `/v1/decide` call |
| **shadow routing** | replace routing.md | Log Jev glossary picks vs keyword PRELOAD without changing behavior |
| **Jev ready-made API** | custom decide only | Shortcuts such as agent risk, context filter, model route |
| **confidence threshold policy** | magic cutoff | Pinned per model version; medium → confirm, low → escalate |
| **`jev_data_tier`** | GDPR mode (alone) | `standard_us` for US operator; `eu_strict` optional per client CITDP |
| **fail-closed tool block** | Auto Mode (Cursor) | W5 harness may deny high-risk tools; deny if Jev unavailable for blocking set |
| **harness dist gate** | missing-dist fail-open (2B) | Opt-in W5: require `mcp-server/dist/jev/harness-tool-guard.js` before dry-run/live proceed |
| **missing-dist hard stop** | continue unguarded (2B) | Sponsor **2C** / **JEV-HARNESS-DIST-2C**: exit 1 + build hint when harness on and dist absent |

---

## Naming bridge

| Concept | Env / path | Role |
|---------|------------|------|
| API key | `JEV_API_KEY` | Server-side only; `jv_live_*`; CLI/replay may fall back to `.cursor/mcp.json` `tied-yaml` env when process env is unset (file is gitignored) |
| Model pin | `JEV_MODEL` | Default `jev-1.13.0` |
| API base | `JEV_API_BASE` | Default `https://jevtypesafeai.com/api` |
| HTTP client | `mcp-server/src/jev/` | W1 `jevDecide` wrapper |
| Context log pruner | `mcp-server/src/jev/context-log-pruner.ts` | Blueprint A chunk pipeline; opt-in `TIED_JEV_CONTEXT_LOG_PRUNING` |
| Context pruning replay | `mcp-server/scripts/replay-jev-context-pruning.ts` | Five benchmark arms; `context-pruning-benchmark.v1` |
| Shadow PRELOAD replay | `mcp-server/scripts/replay-jev-vocab-shadow.ts` | W2 keyword vs Jev JSONL log |
| Prompt-type advisory | `advisePromptTypes` in `mcp-server/src/jev/` | W3 explicit-name heuristic + Jev hint |
| Adversarial triage pilot | `runAdversarialTriagePilot` | W4 observation-only nouls; no finding-ledger |
| Harness dist module | `mcp-server/dist/jev/harness-tool-guard.js` | Built artifact required by **harness dist gate** when agentstream harness enabled |

---

## W6 Cursor plan-skill wiring

| Preferred term | Avoid | Notes |
|---|---|---|
| **plan-skills adjunct** | Jev skill, Jev agent | Shared advisory/shadow block used only by the four explicit main plan skills |
| **service readiness** | key is configured, service is up | Per-call state: only a schema-valid HTTP 2xx decision is `ready` |
| **configured** | enabled by default | Explicit `jev.plan_skills` or `TIED_JEV_PLAN_SKILLS` opt-in; absent/invalid is off |
| **key present** | authenticated, reachable | `JEV_API_KEY.trim().length > 0`; does not imply a vendor call succeeds |
| **merged routing baseline** | one routing table | Client handoff and methodology routing rows used for the deterministic keyword baseline |
| **advisory-primary tie-break** | PRELOAD override | W6d **tiebreak shadow mode**: display-only `advisory_primary` when ≥2 keyword glossary ids and confidence ≥ 0.90; never changes PRELOAD |
| **tiebreak shadow mode** | auto tie-break | Opt-in `shadow_mode: tiebreak` on `tied_jev_vocab_shadow`; default `advisory` (W6) |
| **tied_jev_adversarial_triage_pilot** | inquiry MCP | W6d plan-skills MCP adapter over W4 `runAdversarialTriagePilot`; observation-only; not gate activation |
| **plan-skill evidence** | gate proof | Redacted, request-scoped supplemental artifact under `working/{REQ\|PLAN-TOKEN}/jev/plan-skills/{run_id}/`; never gate authority |
| **agrees** | glossary match score | `vocabShadowAgrees`: true when Jev set empty, equal to, or subset of keyword baseline; false when Jev names a non-loaded glossary |
| **jev-plan-skills-status.v1** | health check JSON | `tied_jev_status` response schema; never probes vendor |
| **jev-plan-skills-vocab-shadow.v1** | shadow log JSON | `tied_jev_vocab_shadow` response/artifact schema |

## W6 proposed pseudo-code blocks

| Preferred term | UPPER_SNAKE block | Owning decision |
|---|---|---|
| (proposed) Resolve plan-skill configuration | `RESOLVE_PLAN_SKILLS_CONFIG` | [IMPL-TIED_JEV_DECISION_COPROCESSOR](../implementation-decisions/IMPL-TIED_JEV_DECISION_COPROCESSOR.yaml) |
| (proposed) Assess Jev service readiness | `ASSESS_JEV_SERVICE_READINESS` | [IMPL-TIED_JEV_DECISION_COPROCESSOR](../implementation-decisions/IMPL-TIED_JEV_DECISION_COPROCESSOR.yaml) |
| (proposed) Load merged routing baseline | `LOAD_MERGED_ROUTING_BASELINE` | [IMPL-TIED_JEV_DECISION_COPROCESSOR](../implementation-decisions/IMPL-TIED_JEV_DECISION_COPROCESSOR.yaml) |
| Run plan-skills shadow | `RUN_PLAN_SKILLS_SHADOW` | [IMPL-TIED_JEV_DECISION_COPROCESSOR](../implementation-decisions/IMPL-TIED_JEV_DECISION_COPROCESSOR.yaml) |
| (proposed W6d) Tiebreak advisory display | `APPLY_TIEBREAK_ADVISORY_DISPLAY` | [IMPL-TIED_JEV_DECISION_COPROCESSOR](../implementation-decisions/IMPL-TIED_JEV_DECISION_COPROCESSOR.yaml) |
| (proposed W6d) Plan-skills triage MCP | `RUN_PLAN_SKILLS_TRIAGE_MCP` | [IMPL-TIED_JEV_DECISION_COPROCESSOR](../implementation-decisions/IMPL-TIED_JEV_DECISION_COPROCESSOR.yaml) |

---

## Alphabetical index

| Term | Section |
|------|---------|
| ASSESS_JEV_SERVICE_READINESS | W6 proposed pseudo-code blocks |
| LOAD_MERGED_ROUTING_BASELINE | W6 proposed pseudo-code blocks |
| agrees | W6 Cursor plan-skill wiring |
| advisory-primary tie-break | W6 Cursor plan-skill wiring |
| APPLY_TIEBREAK_ADVISORY_DISPLAY | W6 proposed pseudo-code blocks |
| RUN_PLAN_SKILLS_TRIAGE_MCP | W6 proposed pseudo-code blocks |
| tiebreak shadow mode | W6 Cursor plan-skill wiring |
| tied_jev_adversarial_triage_pilot | W6 Cursor plan-skill wiring |
| configured | W6 Cursor plan-skill wiring |
| bounded semantic decision engine | Preferred terms |
| confidence threshold policy | Preferred terms |
| decision algebra | Preferred terms |
| decision coprocessor | Preferred terms |
| decision role taxonomy | Preferred terms |
| fail-closed tool block | Preferred terms |
| harness dist gate | Preferred terms |
| missing-dist hard stop | Preferred terms |
| jev-plan-skills-status.v1 | W6 Cursor plan-skill wiring |
| jev-plan-skills-vocab-shadow.v1 | W6 Cursor plan-skill wiring |
| key present | W6 Cursor plan-skill wiring |
| jev_data_tier | Preferred terms |
| Jev ready-made API | Preferred terms |
| merged routing baseline | W6 Cursor plan-skill wiring |
| noul gate | Preferred terms |
| plan-skill evidence | W6 Cursor plan-skill wiring |
| plan-skills adjunct | W6 Cursor plan-skill wiring |
| RESOLVE_PLAN_SKILLS_CONFIG | W6 proposed pseudo-code blocks |
| RUN_PLAN_SKILLS_SHADOW | W6 proposed pseudo-code blocks |
| semantic garbage collection | Preferred terms |
| shadow routing | Preferred terms |
| service readiness | W6 Cursor plan-skill wiring |
| speculative fan-out | Preferred terms |
| System One model | Preferred terms |
