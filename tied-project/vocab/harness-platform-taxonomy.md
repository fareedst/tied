# Harness platform taxonomy (canonical)

**Scope:** Sponsor ↔ TIED naming bridge for **model**, **vendor agent harness**, **product platform**, **`tied agentstream`**, and **platform-adjacent TIED governance** — especially workflow trials (WF), HMEP fingerprints, and fair-comparison matrix cells. **Vocabulary only**; Traefik/LangChain comparison narratives stay in `docs/comparisons/`.

**Traceability:** [REQ-TIED_HARNESS_PLATFORM_TAXONOMY](../requirements/REQ-TIED_HARNESS_PLATFORM_TAXONOMY.yaml) · [REQ-TIED_HARNESS_PLATFORM_SEAM](../requirements/REQ-TIED_HARNESS_PLATFORM_SEAM.yaml) · [REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM](../requirements/REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM.yaml) · [REQ-GOAGENT-AGENT-EXECUTOR](../requirements/REQ-GOAGENT-AGENT-EXECUTOR.yaml) · [REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG](../requirements/REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG.yaml)

**See also:** [`routing.md`](routing.md) (row **2c**) · [`domain-references.md`](domain-references.md) · [`agentstream.md`](agentstream.md) · [`harness-model-eval.md`](harness-model-eval.md) · [`prompt-composer.md`](prompt-composer.md) (harness profile for prompt types) · [`tied-methodology.md`](tied-methodology.md) · [Traefik harness/platform × TIED](../../docs/comparisons/traefik-harness-platform-vs-tied-agent-management.md) · [methodology composition matrix §2 row 13](../../docs/comparisons/methodology-composition-matrix.md)

---

## Sponsor umbrella terms (RESOLVE)

| Sponsor term | Typical meaning | TIED preferred term | Notes |
|--------------|-----------------|---------------------|--------|
| **AI coding assistant** | Broad AI-assisted development | *(informal)* | Use when scope is not agentic execution |
| **AI coding agent** | Autonomous/semi-autonomous inspect-edit-run loop | **vendor agent harness** | Cursor Agent, Claude Code CLI session |
| **Agent harness** | Runtime orchestration, tools, context, loop | **vendor agent harness** (Layer 1) · **`harness profile`** (operator flag) | TIED overloads **harness** for `cursor` \| `claude` selection — not “the whole stack” |
| **Agentic coding platform** / **coding agent platform** | Product + IDE/CLI surface | **vendor platform** (informal) | Cursor app, Anthropic Claude Code product |
| **Coding CLI** | CLI entry to a coding agent | Part of **vendor agent harness** | e.g. `cursor agent`, `claude` subprocess |
| **Model** | Weights/API behind the agent | **`MODEL_SLUG`**, **`MODEL_CONFIG`**, **model effort** | Separate trial matrix dimension; catalog `docs/agent-harness-evaluation/config/wf-trial-model-catalog.yaml` |
| **Model configuration** | Slug + effort + compose family | **`MODEL_CONFIG`**, **`wf-trial-model-spec`**, **`MODEL_EFFORT`** | HMEP **configuration fingerprint** includes harness + model + effort |

---

## Three-layer placement (TIED view)

Aligned with [Traefik harness/platform × TIED](../../docs/comparisons/traefik-harness-platform-vs-tied-agent-management.md) and distinct from the **dual MCP seam** ([`external-investigation-mcp.md`](external-investigation-mcp.md)).

| Layer | Sponsor label (informal) | TIED preferred label | Examples in this repo |
|-------|--------------------------|----------------------|------------------------|
| **1 — Vendor harness** | Agent harness | **vendor agent harness** · **`AgentDriver`** | Cursor live executor; Claude **AgentDriver** |
| **2 — TIED orchestration** | *(often unnamed in sponsor docs)* | **`tied agentstream`** · **workflow trial orchestrator** | `mcp-server/packages/agentstream/`; `workflow_trial_agentstream` |
| **3 — TIED governance** | *(not a coding agent)* | **platform-adjacent governance** · **TIED agent management** | TIED YAML MCP, checklist gates, `tied_verify`, sponsor ladder |

```text
workflow_trial_agentstream  →  tied agentstream  →  --harness cursor|claude  →  vendor harness
                                      ↓ (optional, compose)
                              TIED MCP preflight · checklist · adherence
                                      ↓ (authority, not replaced)
                              platform-adjacent gates · tied-project/ YAML writes
```

---

## Where `@tied/agentstream` lives

| Surface | Path / command | Category |
|---------|----------------|----------|
| Package | `mcp-server/packages/agentstream/` | **Operator CLI / checklist runner / turn pipeline** |
| CLI | `tied agentstream`, `@tied/agentstream` | Same; not a vendor harness |
| WF wrapper | `scripts/workflow-trial-agentstream.sh`, `workflow_trial_agentstream` | **Workflow trial orchestrator** — bootstrap disposable client + four-phase batch |
| Implementation tree (removed) | Go `tools/agentstream/` | Historical only — Phase **4d** TS default |

**`tied agentstream` is not** Cursor Agent, Claude Code, or a third peer harness in benchmark taxonomy — it **drives** vendor harnesses via **`--harness`**.

---

## Trial matrix dimensions (benchmarking)

Fair comparison: one disposable client per **(PROMPT-WF-NN × model configuration × harness profile)** ([`catalog-traditional-workflow-trial-prompts.md`](../../docs/agent-harness-evaluation/catalogs/catalog-traditional-workflow-trial-prompts.md)). Facilitator corpus index: [`docs/agent-harness-evaluation/README.md`](../../docs/agent-harness-evaluation/README.md). Public lifecycle narrative (grading, cohort summaries, not a leaderboard): [`workflow-trials-guide.md`](../../docs/agent-harness-evaluation/workflow-trials-guide.md).

| Dimension | Env / flag | Example disposable tag segment |
|-----------|------------|--------------------------------|
| **Harness profile** | `HARNESS`, `--harness` | `cursor`, `claude` |
| **Model configuration** | `MODEL_CONFIG`, `MODEL_SLUG`, effort | `composer25`, `claudeopus55low` |
| **Orchestration stack** | `implementation_stack_id` | `wf-trial-ts-node-test-v1` (TIED-specific; not vendor) |

Tag pattern: `wf-agentstream-{wf-id}-{harness}-{modelBucket}` — see **workflow-trial disposable tag** in [`agentstream.md`](agentstream.md).

Manual IDE trials share **harness + model** axes but omit **`tied agentstream`** orchestration unless the facilitator runs the orchestrator.

---

## TIED category (sponsor question)

| Question | Preferred answer |
|----------|------------------|
| Is TIED an AI coding agent? | **No** as primary label — methodology + governance + proof around agents that code |
| Is TIED a harness? | **Partially adjacent** — agentstream does turn orchestration; **authority** stays platform-adjacent |
| Best umbrella for **TIED** | **Agent management** · **platform-adjacent governance** for AI-assisted implementation |
| Best umbrella for **`tied agentstream`** | **Workflow orchestrator** · **checklist operator CLI** — not “coding agent platform” |

HMEP ([`harness-model-eval.md`](harness-model-eval.md)): metrics use **harness + model + effort**; agentstream emits **stream-json**; **`/record-wf-trial`** grading stays separate (**proof boundary**).

---

## Preferred terms vs synonyms

| Preferred | Avoid | Notes |
|-----------|-------|-------|
| **vendor agent harness** | “the harness” when mean TIED or agentstream | Cursor/Claude execution loop |
| **`harness profile`** | `HARNESS=` meaning agentstream package | Operator value `cursor` \| `claude` only |
| **`tied agentstream`** | Cursor Agent; Claude Code; “meta-harness” in committed docs | Use **workflow orchestrator** in prose if “meta” needed |
| **platform-adjacent governance** | “TIED platform” = Cursor.app | Traefik Layer 2 seam vocabulary |
| **workflow trial orchestrator** | “TIED harness” | `workflow_trial_agentstream` shell layer |
| **vendor platform** | TIED methodology | Cursor/Anthropic/OpenAI products |

---

## Distinct from prompt-type **harness profile**

[`prompt-composer.md`](prompt-composer.md) uses **harness profile** for **bounded turn orchestration** of a leaf prompt type (IDE, Task subagent, or agentstream `--harness`). Same English phrase, two scopes:

| Scope | Meaning |
|-------|---------|
| **This glossary / WF trials** | Which **vendor** subprocess runs (`cursor` \| `claude`) |
| **Prompt Composer** | How a **prompt type** delegates turns without owning gate authority |

Define prompt-type nuance once in [`prompt-composer.md`](prompt-composer.md); WF trial nuance here.

---

## Alphabetical index

| Term | Section |
|------|---------|
| Agent harness | Sponsor umbrella terms |
| AI coding agent | Sponsor umbrella terms |
| AI coding assistant | Sponsor umbrella terms |
| coding agent platform | Sponsor umbrella terms |
| configuration fingerprint | Trial matrix dimensions; `harness-model-eval.md` |
| model configuration | Sponsor umbrella terms |
| platform-adjacent governance | TIED category |
| tied agentstream | Where `@tied/agentstream` lives |
| vendor agent harness | Three-layer placement |
| vendor platform | Sponsor umbrella terms |
| workflow trial orchestrator | Where `@tied/agentstream` lives |
| workflow-trial disposable tag | Trial matrix dimensions |