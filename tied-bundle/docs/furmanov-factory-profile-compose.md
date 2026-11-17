# Furmanov factory profile — compose guide

**Audience:** Sponsors, harness authors, and agents implementing TIED-tracked changes after reading [Furmanov harness-profiler × TIED](../../docs/comparisons/afurmanov-harness-profiler-vs-tied-agent-management.md).

**Traceability:** [REQ-TIED_FURMANOV_FACTORY_PROFILE_WAVE3](../../tied-project/requirements/REQ-TIED_FURMANOV_FACTORY_PROFILE_WAVE3.yaml) · [ARCH-TIED_FURMANOV_FACTORY_PROFILE_WAVE3](../../tied-project/architecture-decisions/ARCH-TIED_FURMANOV_FACTORY_PROFILE_WAVE3.yaml) · [IMPL-TIED_FURMANOV_FACTORY_PROFILE_WAVE3](../../tied-project/implementation-decisions/IMPL-TIED_FURMANOV_FACTORY_PROFILE_WAVE3.yaml)

**Compose-don’t-replace:** This guide adds **factory profile** literacy (inline vs fork contexts, **check-trace** expectations, PASS vs **structural** waste) for the software-delivery slice. It does **not** mandate the Claude Code **harness-profiler** plugin, Furmanov-reported token tables as proof, or **check-trace** outcomes as gate receipts (**`not_measured`** for vendor effectiveness).

---

## Proof boundary

| In scope | Out of scope |
| --- | --- |
| Post-session **structure** review (duplicate child calls, fork order) | Furmanov token/duration bars as TIED success metrics |
| **check-trace**-style expectation skills on local traces | **`tied_checklist_gate_validate`** or **`tied_verify`** substitution |
| HTOL + **`tied_feedback_capture_observation`** for harness bugs | Claude Code plugin as TIED core |
| Pair-read harness rows **14–15** (Cursor/LangChain trace compose) | Methodology matrix §2 row without MCM LEAP |
| agentstream optional turn trace mention | agentstream ↔ `.harness-profile` JSONL bridge (Defer) |

Pattern: [tests vs checker-backed claims](tests-vs-checker-backed-claims.md) — separate **harness PASS lines** from **platform proof**.

---

## Scope slice

| TIED delivery graph (in-repo) | Factory / vendor plane |
| --- | --- |
| One **REQ-scoped** checklist item per change | Dozens of skills/subagents per unbounded session |
| **`tied_verify`** on shipped tests | Sub-skill validator **PASS** first lines only |
| IMPL pseudo-code + gate receipts | Visual sequence HTML (**Furmanov-reported** UI) |
| PRELOAD + prompt-type routing | Per-context token tables (**`not_measured`**) |

Label Furmanov-reported anecdotes **`not_measured`** unless a pilot charter exists.

---

## Context and fork analog table

| Furmanov / Claude Code (**target-repo-observed**) | TIED (stdd) | Operator action |
| --- | --- | --- |
| Vertical **context bar** | Main session vs Task subagent | Map wasted duplicate work to HTOL |
| **Diamond** = inline skill | In-turn `@skill` | Keep scope in one tracker slug |
| **Fork** = new context | Foreground Task / subagent | Fresh context by design |
| **check-trace** skill | Project invariant skill + `@harness-trace-review` | Advisory only |
| `.harness-profile/.jsonl` | Optional `AGENTSTREAM_HARNESS_TRACE=1` JSONL | Different schema; compose only |

---

## PASS vs structure catalog

Structural failures that can still show **PASS** (**Furmanov-reported** duplicate-validation case):

| Symptom | Likely harness cause | TIED response |
| --- | --- | --- |
| Second validation bar ≈ first; same children | Reuse rule skipped (dirty tree, script failure) | HTOL observation; git hygiene before “final” pass |
| Token/time “waste” invisible in logs | Only sub-skill PASS read | Profile or transcript review |
| Factory looks healthy in chat | No structural invariant check | **factory invariants** in CITDP |
| Plugin shows duplicate skills | Orchestration bug | Kaizen; not auto LEAP |

---

## check-trace vs gates table

| Surface | Proves | Does not prove |
| --- | --- | --- |
| **check-trace** PASS on `tree --verbose` | Factory order/invariants for that session | Implement-complete on REQ |
| HTOL batch review | Harness improvement candidates | `tied_checklist_gate_validate` |
| **`tied_feedback_capture_observation`** | Kaizen Loop 2 evidence | YAML / LEAP promotion |
| **`tied_verify`** (when enrolled) | Tests vs REQ | Claude factory shape |
| Gate JSON receipts | Checklist progression | Furmanov token efficiency |

---

## Pair-read

1. [Furmanov harness-profiler × TIED](../../docs/comparisons/afurmanov-harness-profiler-vs-tied-agent-management.md) — primary Wave 2 analysis.
2. [LangChain harness × TIED](../../docs/comparisons/langchain-harness-engineering-vs-tied-agent-management.md) — row **15** trace/benchmark (distinct COG).
3. [Cursor harness × TIED](../../docs/comparisons/cursor-harness-engineering-vs-tied-agent-management.md) — row **14** fleet metrics (**Cursor-reported**).
4. [HPS authority-boundary operator checklist](../../tied-project/working/REQ-TIED_HARNESS_PLATFORM_SEAM/authority-boundary-operator-checklist.md).
5. [Harness trace observation loop](harness-trace-observation-loop.md) — observations ≠ gates.

---

## CITDP prompt

Sponsor-facing bullets (post **off-repo** Furmanov article; paraphrase only):

- What **factory invariants** apply (skill order, fork rules, no duplicate validators)?
- Which outcomes are **harness PASS** vs **`tied_verify`** / gate receipts?
- Where could **structural waste** hide though chat reports success?
- Is **`tied_config_get_base_path`** confirmed before project YAML writes?
- Are Furmanov token metrics labeled **`not_measured`**?
- Is implement-complete backed by **`tied_checklist_gate_validate`**—not **check-trace** alone?

Policy pointer: [citdp-policy.md](citdp-policy.md) (factory profile paragraph).

**Operator checklist:** [factory profile operator checklist](../../tied-project/working/REQ-TIED_FURMANOV_FACTORY_PROFILE_WAVE3/factory-profile-operator-checklist.md).

---

## Anti-patterns

| Anti-pattern | Why it fails | Remedy |
| --- | --- | --- |
| **check-trace** as gate | No checklist JSON | `tied_checklist_gate_validate` |
| **Token bar green** | Furmanov-reported only | Proof boundary; **`not_measured`** |
| **Plugin mandatory** | External product | Defer install; HTOL compose |
| **Sub-skill PASS = done** | Structure untested | Profile/transcript + platform verify |
| **HTOL = implement-complete** | Kaizen only | Verification gate receipts |
| **Profile → auto YAML** | Comparison prose rule | `add-feature` + MCP |

---

## Related documents

- [Client development index](client-development-index.md) — Quick reads row
- [Furmanov stub capture](../../docs/comparisons/afurmanov-harness-profiler.md)
- [AGENTS.md](../../AGENTS.md)