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
| Checklist evidence sufficiency | `mcp-server/src/jev/checklist-evidence-sufficiency.ts` | Blueprint C pre-gate module; opt-in `TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY` |
| Gate MCP pre-gate hook | `mcp-server/src/tools/checklist-evidence-sufficiency-mcp.ts` | `HOOK_CHECKLIST_GATE_VALIDATE` inside `tied_checklist_gate_validate` |
| Standalone diagnostic MCP | `tied_jev_checklist_evidence_sufficiency` | Same module; does not emit gate `allowed` |
| Sufficiency replay / benchmark | `mcp-server/scripts/replay-jev-checklist-evidence-sufficiency.ts` | Arms `deterministic_only`, `jev_on`, `jev_off`, `shadow_compare`; schema `checklist-evidence-sufficiency-benchmark.v1` |
| Decide trace writer | `mcp-server/src/jev/decide-trace.ts` | Opt-in `JEV_DECIDE_TRACE`; schema **`system-one-decide-trace.v1`** |

---

## Blueprint C — checklist evidence sufficiency (child REQ)

**Traceability:** [REQ-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY](../requirements/REQ-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY.yaml) · [ARCH-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY](../architecture-decisions/ARCH-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY.yaml) · [IMPL-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY](../implementation-decisions/IMPL-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY.yaml)

| Preferred term | Avoid | Notes |
|---|---|---|
| **evidence sufficiency pre-gate** | checklist gate, gate receipt | Opt-in filter on gate-call path; may reject submission; never authoritative `allowed` |
| **Blueprint C** | Pattern 11 alone | Taxonomy slice: Pattern **11** (verification — claim vs evidence) + Pattern **5** (evidence gate — factual evidence before phase advance) |
| **Pattern 5 evidence gate** | pre-gate receipt | Factual evidence before phase advance; code-owned thresholds |
| **Pattern 11 verification** | envelope validate | Semantic substance of step evidence vs vacuous claims |
| **compose-don’t-fork** | second gate MCP | Hook inside `tied_checklist_gate_validate`; standalone tool is diagnostic only |
| **pre_gate** disposition | gate_receipt | Response field `pre_gate: "jev_evidence_sufficiency"` on reject; no `gate_receipt` |

### Configuration (Blueprint C)

| Source | Key | Enabled when |
|---|---|---|
| Env | `TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY` | `"1"` or `"true"`; explicit `"0"`/`"false"` overrides manifest |
| Manifest | `.tied-yaml.yaml` → `jev.checklist_evidence_sufficiency: true` | boolean `true` only |
| Trace (independent) | `JEV_DECIDE_TRACE`, `JEV_DECIDE_TRACE_PATH` | Trace may be on while pre-gate is off |

### Decide trace (Blueprint C + shared JEV)

| Preferred term | Env / schema | Notes |
|---|---|---|
| **`system-one-decide-trace.v1`** | JSONL `schema` field | One line per `jevDecide` when trace enabled |
| **`JEV_DECIDE_TRACE`** | env | `"1"` / `"true"` enables append |
| **`JEV_DECIDE_TRACE_PATH`** | env optional | Default `working/jev-decide-trace/system-one-decide.v1.jsonl` under repo root |
| **context_meta (Blueprint C)** | trace record | Includes `gate_phase`, `step_slug`, feature id `checklist_evidence_sufficiency` for sufficiency fan-out |

### Blueprint C pseudo-code blocks (IMPL)

| Preferred term | UPPER_SNAKE block | Role |
|---|---|---|
| Resolve sufficiency config | `RESOLVE_CHECKLIST_EVIDENCE_SUFFICIENCY_CONFIG` | Env + manifest opt-in |
| Slug scope | `DERIVE_PRE_GATE_TARGET_SLUGS` | Same required set as authoritative gate |
| Evidence excerpt | `EXTRACT_GATE_EVIDENCE_STATE` | Per-slug text for Jev state |
| Tier-1 checks | `RUN_DETERMINISTIC_EVIDENCE_PRECHECKS` | Empty / missing token literals |
| Jev fan-out | `RUN_JEV_EVIDENCE_SUFFICIENCY_FANOUT` | Three questions; fail-open on skip |
| Thresholds | `APPLY_SUFFICIENCY_THRESHOLDS` | `0.60` nouls; score `<= 2` reject |
| Pre-gate JSON | `EMIT_PRE_GATE_DISPOSITION` | Never `allowed: true` from Jev |
| Gate hook | `HOOK_CHECKLIST_GATE_VALIDATE` | W4 MCP integration seam |
| Trace append | `APPEND_SYSTEM_ONE_DECIDE_TRACE` | Shared with parent JEV program |

---

## Blueprint D — harness tool safety gating (child REQ)

**Traceability:** [REQ-TIED_JEV_TOOL_SAFETY_GATING](../requirements/REQ-TIED_JEV_TOOL_SAFETY_GATING.yaml) · [ARCH-TIED_JEV_TOOL_SAFETY_GATING](../architecture-decisions/ARCH-TIED_JEV_TOOL_SAFETY_GATING.yaml) · [IMPL-TIED_JEV_TOOL_SAFETY_GATING](../implementation-decisions/IMPL-TIED_JEV_TOOL_SAFETY_GATING.yaml)

| Preferred term | Avoid | Notes |
|---|---|---|
| **Blueprint D** | Pattern 6 alone | Taxonomy slice: Pattern **6** (command-risk, scope) + Pattern **5** (execute/do-not-execute gate) on W5 live harness |
| **tool safety gating** | second runtime gate | Extends `evaluateHarnessToolCall`; no parallel evaluator or IDE hook |
| **combined max risk** | per-axis confirm | `max(destructive, scope)` with bands 0.45 / 0.72 |
| **noul_destructive_risk** | high_risk (W5 legacy id) | Blueprint D fan-out question id |
| **noul_scope_violation** | needs_confirm (W5 legacy id) | Workspace scope question id |
| **declared workspace** | raw path in Jev state | Live agentstream + diagnostic MCP require workspace; vendor state uses placeholder |
| **scope_class** | scope proof | `in_scope` / `out_of_scope` / `unknown` / `not_evaluated`; shell expansion outside proof boundary |
| **deterministic fast-deny** | Jev-only safety | Regex/path signals before `jevDecide`; fail-closed when Jev unavailable for blocking tools |
| **tied_jev_tool_safety_evaluate** | gate receipt | Read-only diagnostic MCP; never `allowed` or command execution |

### Configuration (Blueprint D)

| Source | Key | Enabled when |
|---|---|---|
| Env | `AGENTSTREAM_JEV_HARNESS` | `"1"` / `"true"` (same as W5; no separate Blueprint D flag) |
| Manifest | `.tied-yaml.yaml` → `jev.agentstream_harness: true` | Same as W5 when env unset |
| Env | `JEV_API_KEY`, optional `JEV_MODEL` | Required for Jev fan-out when harness on blocking tools |
| Env | `AGENTSTREAM_JEV_HARNESS_CONFIRM_STRICT` / `CI` | Abort turn on `confirm` (W5 G3) |
| Trace | `JEV_DECIDE_TRACE`, `JEV_DECIDE_TRACE_PATH` | Opt-in; `context_meta.feature: tool_safety_gating` |

### Blueprint D pseudo-code blocks (IMPL)

| Preferred term | UPPER_SNAKE block | Role |
|---|---|---|
| Harness config | `RESOLVE_HARNESS_SAFETY_CONFIG` | Reuse W5 enablement |
| Input normalization | `NORMALIZE_TOOL_SAFETY_INPUT` | Cap and redact proposal |
| Fast deny | `MATCH_DESTRUCTIVE_COMMAND` | Pre-Jev hard block |
| Scope signals | `DERIVE_WORKSPACE_SCOPE_SIGNAL` | Workspace-bound path features |
| Jev fan-out | `RUN_HARNESS_SAFETY_FANOUT` | D question ids |
| Thresholds | `APPLY_HARNESS_RISK_THRESHOLDS` | Combined max bands |
| Decision record | `EMIT_HARNESS_DECISION` | `HarnessToolEvaluation` |
| Trace | `APPEND_TOOL_SAFETY_TRACE` | Shared decide trace |
| Diagnostic MCP | `BUILD_TOOL_SAFETY_DIAGNOSTIC` | `tied_jev_tool_safety_evaluate` |
| Live seam | `BIND_WORKSPACE_TO_LIVE_GATE` | Agentstream workspace pass-through |

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
| Blueprint C | Blueprint C — checklist evidence sufficiency |
| evidence sufficiency pre-gate | Blueprint C — checklist evidence sufficiency |
| Pattern 5 evidence gate | Blueprint C — checklist evidence sufficiency |
| Pattern 11 verification | Blueprint C — checklist evidence sufficiency |
| system-one-decide-trace.v1 | Blueprint C — checklist evidence sufficiency |
| JEV_DECIDE_TRACE | Blueprint C — checklist evidence sufficiency |
| context_meta (Blueprint C) | Blueprint C — checklist evidence sufficiency |
| HOOK_CHECKLIST_GATE_VALIDATE | Blueprint C — checklist evidence sufficiency |
| tied_jev_checklist_evidence_sufficiency | Blueprint C — checklist evidence sufficiency |
| checklist-evidence-sufficiency-benchmark.v1 | Blueprint C — checklist evidence sufficiency |
| System One model | Preferred terms |
