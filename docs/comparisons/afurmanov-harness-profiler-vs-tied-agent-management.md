# Furmanov harness-profiler × TIED — agent management lens

| Field | Value |
| --- | --- |
| **Purpose** | Map **harness-profiler** (Claude Code hooks → JSONL → context sequence profile + optional **check-trace** invariants) to TIED in this repository — emphasis on **hidden orchestration waste** (PASS with duplicate work), **harness/platform seam**, and HTOL compose — not product adoption or token metrics as TIED proof. |
| **Audience** | Sponsors, harness authors, prompt-type operators, methodology owners |
| **Source URL** | [What Did My Software Factory Just Do?](https://afurmanov.com/harness-profiler) (A. Furmanov, 2026-11-15 — **Furmanov-reported**); [github.com/afurmanov/harness-profiler](https://github.com/afurmanov/harness-profiler) (**target-repo-observed**) |
| **Article capture (sibling)** | [afurmanov-harness-profiler.md](afurmanov-harness-profiler.md) — stub; **reference only** |
| **Status / date** | Outreach / analysis snapshot, **2026-11-17** — **reference only; this document does not mint REQ/ARCH/IMPL tokens** |
| **Executable follow-up** | **`REQ-TIED_FURMANOV_FACTORY_PROFILE_WAVE3`** ([furmanov-factory-profile-compose.md](../../tied-bundle/docs/furmanov-factory-profile-compose.md)); JSONL bridge **Defer** |
| **Distinct from** | [LangChain harness × TIED](langchain-harness-engineering-vs-tied-agent-management.md) (LangSmith + benchmark loop); [Cursor harness × TIED](cursor-harness-engineering-vs-tied-agent-management.md) (Keep Rate, online A/B); [LangChain goal engineering × TIED](langchain-goal-engineering-vs-tied-agent-management.md) (review UX / motions); [Claude Code team review × TIED](claude-code-team-code-review-vs-tied.md) (PR convergence); [Traefik × TIED](traefik-harness-platform-vs-tied-agent-management.md) (harness/platform seam architecture) |
| **TIED anchors (reference only)** | [AGENTS.md](../../AGENTS.md), [agent-req-implementation-checklist.md](../../tied-bundle/docs/agent-req-implementation-checklist.md), [harness-trace-observation-loop.md](../../tied-bundle/docs/harness-trace-observation-loop.md), [agentstream README](../../mcp-server/packages/agentstream/README.md), [feedback-to-tied.md](../../tied-project/vocab/feedback-to-tied.md), [sponsor-agent-relationship.md](../../tied-project/vocab/sponsor-agent-relationship.md) |

---

## Executive summary

Furmanov describes building an **X-ray** for a personal **software factory**: dozens of Claude Code **skills** and **subagents** cooperating on delivery work. **harness-profiler** hooks each tool call, appends JSON lines under `.harness-profile/.jsonl`, and renders a UML-style **sequence diagram** where each vertical bar is a **context** (conversation history), inline skills appear as diamonds, and forked skills/subagents get their own bars and colors. Token counts and durations sit beside each context (**Furmanov-reported** narrative; hook schema **target-repo-observed**). A motivating failure mode: two **validation** runs both returned **PASS**, but the profile showed the second run repeating expensive Rails review and tests after only a planning doc changed (**Furmanov-reported** ~60s and ~48k new tokens per change).

TIED’s center of gravity is **declarative delivery intent and proof**: vocabulary RESOLVE/RECORD/VALIDATE, CITDP-scoped items, REQ → ARCH → IMPL **essence_pseudocode**, checklist gates, MCP **`tied-project/`** YAML, **`tied_verify`** when enrolled, LEAP, and the sponsor **consequence ladder**. TIED already composes **harness-adjacent** session review via [harness trace observation loop](../../tied-bundle/docs/harness-trace-observation-loop.md) (`@harness-trace-review`, **`tied_feedback_capture_observation`**) and optional **`AGENTSTREAM_HARNESS_TRACE=1`** turn JSONL in this repo—**TIED-existing**; not Furmanov’s HTML sequence UI.

**Compose-don’t-replace:** Use factory profiles and **check-trace**-style expectation skills to spot structural duplication and orchestration bugs; keep **gate authority**, **YAML truth**, and implement-complete proof on the TIED/MCP/checklist plane.

| Center of gravity | Furmanov harness-profiler | TIED (stdd) |
| --- | --- | --- |
| Primary optimization | See what the factory **did** (structure + cost) | REQ→ARCH→IMPL traceability + tests + gates |
| Quality signal (external) | Visual profile + PASS lines in sub-skills | **`tied_verify`**, gate receipts — **not** token bars |
| Durable state | `.harness-profile/.jsonl` (local, git-excluded) | Project YAML, IMPL sidecars, working folders |
| Expectation enforcement | **check-trace** skill on tree output | Checklist slugs, pseudocode_validate, LEAP |
| Runtime scope | Claude Code hooks (**target-repo-observed**) | Cursor + agentstream + skills (this repo) |

---

## Source summary (Furmanov claims only)

From sibling [stub](afurmanov-harness-profiler.md) and **target-repo-observed** README themes (**Furmanov-reported** unless labeled).

- **Problem:** Skill/agent count grew into a **software factory**; hard to see how parts cooperate (**Furmanov-reported**).
- **Solution:** Profiler adapted from UML sequence diagrams: time downward; **context bars**; **inline** vs **forked** skill/subagent semantics (**Furmanov-reported**).
- **Install:** Claude Code plugin marketplace + install commands; web sessions use `npx github:afurmanov/harness-profiler init claude` (**target-repo-observed**).
- **Data:** Post-tool hook writes JSONL with tool name, args, duration, tokens, subagent id (**target-repo-observed** sample).
- **View:** `/harness-profiler:show-profile` or `tree --format html`; verbose mode for every tool call (**target-repo-observed**).
- **Toy factory:** `orchestrator` → `process-story` subagent → inline `planner` / `implementor` → forked `validator` → forked `github` + second `validator` (**Furmanov-reported** diagram story).
- **Real incident:** “Final” validation should reuse prior PASS checks when only docs changed; profile showed full re-run; root causes included uncommitted code and script Ruby version (**Furmanov-reported**).
- **check-trace:** Skill runs `tree --verbose` and asserts ordering, fork rules, no duplicate skills per story (**Furmanov-reported** / README example).
- **Limits:** Codex unsupported; inline skill token cost folded into caller; Bash-heavy workflows skew tool mix (**target-repo-observed** constraints).

---

## Relationship to sibling comparisons

| Sibling | What it owns | This document owns |
| --- | --- | --- |
| [LangChain harness × TIED](langchain-harness-engineering-vs-tied-agent-management.md) | LangSmith fetch, parallel failure analysis, Terminal Bench | **Single-repo** JSONL + **context timeline** for skill/subagent factories |
| [Cursor harness × TIED](cursor-harness-engineering-vs-tied-agent-management.md) | Production evals, Keep Rate, tool 9s ops | **One session** structural post-mortem; duplicate child calls under PASS |
| [LangChain goal engineering × TIED](langchain-goal-engineering-vs-tied-agent-management.md) | Goal scope for human feedback | **Call-tree invariants** (`planner` before `implementor`, etc.) |
| [Claude Code team review × TIED](claude-code-team-code-review-vs-tied.md) | PR/diff review convergence | **Runtime** orchestration profile, not merge review |
| [Traefik × TIED](traefik-harness-platform-vs-tied-agent-management.md) | Fleet harness/platform layers | Profiler at **harness-adjacent** seam (see authority boundary) |
| [Open Governance × TIED](open-governance-cannot-sense-vs-tied-agent-management.md) | Organizational sensing limits | **Factory** observability compose only |

Methodology composition matrix **§2 new row**: **Defer** (sponsor); cross-link existing rows **14–15** in [Related documents](#related-documents).

---

## Harness lessons → TIED agent management

### Context, inline skills, and forks

| Furmanov pattern | TIED surface | Notes |
| --- | --- | --- |
| Vertical bar = context | Subagent / Task with fresh context; main chat session | **Composable** mental model |
| Diamond = inline skill | In-turn `@skill` without Task subagent | **Align** with prompt-type routing |
| Forked skill/subagent | `Task` subagent; agentstream turn chain | **Composable** |
| Column stacking non-overlapping contexts | N/A (visual compression) | **Defer** product UX |
| Token new/cached/out per context | Transcript length; agentstream metrics when on | **Tension** — no Furmanov UI in TIED core |

### PASS vs structural waste

| Furmanov pattern | TIED surface | Notes |
| --- | --- | --- |
| Validator returns PASS first line | Test GREEN, **`tied_verify`** | **Tension** — different layers |
| Second validation duplicates children | Duplicate checklist/tool work in one session | **Composable** HTOL observation |
| Reuse rule ignored (uncommitted files) | Git hygiene before “final” verify | **Align** with close-out discipline |
| ~1 min / ~48k tokens “invisible” in logs | **`DIAGNOSTIC:`** / trace review culture | **Composable** — label **Furmanov-reported** |

### Expectation specs (check-trace)

| Furmanov pattern | TIED surface | Notes |
| --- | --- | --- |
| check-trace skill on JSONL tree | Custom skill + `@harness-trace-review` | **Composable** |
| Invariants as numbered checks | Test-strategy / checklist slug expectations | **Align** literacy |
| PASS/FAIL per invariant in chat | Kaizen **operational observation** | **Not** gate receipt |
| Learn “healthy factory” shape over time | HTOL failure-mode taxonomy | **Composable** |

### Instrumentation plane

| Furmanov pattern | TIED surface | Notes |
| --- | --- | --- |
| Post-tool hooks (Claude Code) | Cursor hooks; agentstream stream-json | **Gap** for unified factory profile in Cursor |
| `.harness-profile/.jsonl` | `harness-turn-trace.jsonl` (optional env) | **Composable** — different schema |
| HTML sequence page | IDE transcript + manual review | **Gap** viz in TIED core |
| `doctor` / hook silent without Node | MCP/tool failure hygiene | **Align** with context rot theme |

---

## Touchpoint 1 — RESOLVE

| Furmanov / vendor term | TIED preferred term / surface | Disposition |
| --- | --- | --- |
| **Software factory** | Skills + prompt-types + optional Task subagents in one repo | **Composable** literacy |
| **Context (profiler)** | Conversation history / subagent scope | **Composable** |
| **Inline skill** | Skill invoked in parent turn | **Align** |
| **Fork / new context** | Task subagent; forked skill (Claude) | **Composable** |
| **harness-profiler** | External Claude Code plugin name | **Defer** product |
| **check-trace** | Harness expectation skill; HTOL batch review | **Composable** |
| **Profile / X-ray** | Session trace review; adherence notes | **Composable** |
| **PASS (validator)** | Tests / sub-skill verdict line | **Tension** vs **`tied_verify`** |
| **Token counts in profile** | **`not_measured`** for TIED effectiveness | **Defer** as proof |

### Disposition key

| Disposition | Meaning |
| --- | --- |
| **Align** | TIED already encodes intent for delivery scope. |
| **Composable** | Combine patterns without equivalence. |
| **Tension** | Partial overlap; proof boundary required. |
| **Gap** | Vendor emphasis outside TIED core. |
| **Defer** | Claude-only product path or sponsor-owned tooling. |

---

## Primary capability matrix

| Concern | Furmanov COG | TIED COG | Disposition | Rationale |
| --- | --- | --- | --- | --- |
| Post-session structure visibility | Sequence diagram + call tree | Transcripts + HTOL | **Composable** | Different instruments |
| Per-context token/duration | Hook JSONL | agentstream optional trace | **Tension** | **Furmanov-reported** labels only |
| Inline vs fork semantics | First-class in viz | Task/skills mental model | **Align** literacy |
| Duplicate work detection | Visual compare validation bars | HTOL + sponsor review | **Composable** |
| PASS without waste check | Sub-skill verdict lines | **`tied_verify`** + gates | **Tension** |
| Factory invariant skills | check-trace | Checklist + custom skills | **Composable** |
| Claude Code hooks | Plugin + settings.json | Cursor execution plane | **Gap** / **Defer** |
| Codex support | Not yet (**target-repo-observed**) | N/A | **Defer** |
| Gate authority | None (local tool) | **`tied_checklist_gate_validate`** | **Align** boundary |
| YAML / REQ truth | None | TIED MCP | **Align** boundary |
| Methodology effectiveness | Author anecdote | Evaluation charter | **not_measured** |
| Matrix §2 inventory row | N/A | Existing rows 14–15 | **Defer** new row |

---

## Authority boundary

```mermaid
flowchart TB
  subgraph furmanovPlane [Furmanov profiler plane]
    hooks[Claude Code post-tool hooks]
    jsonl[".harness-profile/.jsonl"]
    htmlSeq[HTML sequence view]
    checkTrace[check-trace skill]
  end
  subgraph harnessAdj [TIED harness adjacent]
    htol["@harness-trace-review"]
    feedback["tied_feedback_capture_observation"]
    agentstream["AGENTSTREAM_HARNESS_TRACE optional"]
    expectSkills[Expectation skills / PRELOAD]
  end
  subgraph tiedCore [TIED platform adjacent core]
    yamlMcp[TIED YAML MCP]
    gates[tied_checklist_gate_validate tied_verify]
    impl[IMPL pseudo-code tests]
    sponsor[sponsor consequence ladder]
  end
  operator[Operator sponsor]
  operator --> htmlSeq
  operator --> htol
  hooks --> jsonl --> htmlSeq
  htmlSeq --> checkTrace
  checkTrace -.->|advisory PASS FAIL| htol
  htol --> feedback
  agentstream --> htol
  operator --> yamlMcp
  yamlMcp --> gates
  gates --> impl
  impl --> sponsor
  checkTrace -.x gates
```

Profiler output and **check-trace** results stay **harness-adjacent**. **Implement-complete** and project YAML truth remain on gates, MCP, and verification.

---

## Anti-patterns (Furmanov lessons → TIED risk)

| Anti-pattern | Symptom | TIED-oriented remedy |
| --- | --- | --- |
| PASS line = done | Validator PASS while factory duplicated work | HTOL for structure; **`tied_verify`** for shipped behavior |
| check-trace as gate | Invariant FAIL treated as implement-complete | Route to Kaizen; checklist-owned promotion |
| Token bar = TIED success | Lower new tokens cited as methodology win | **`not_measured`**; **Furmanov-reported** only |
| Profile waives IMPL | “Looks efficient” skips pseudo-code | LEAP + tests for behavior changes |
| No git hygiene before final check | Reuse logic sees dirty tree | close-out / commit discipline |
| Adopt Claude plugin as core | stdd assumes Furmanov hooks | **Defer**; Cursor plane + optional dual-harness |
| Observation → auto YAML | Profile suggests REQ mint | **`add-feature`** + MCP writes |
| Conflate with LangChain trace doc | Benchmark tuning for factory shape | Use siblings for distinct COG |

---

## Compose-don’t-replace table

| Tune with harness-profiler literacy | Keep TIED authority |
| --- | --- |
| After factory sessions, review structure not only PASS lines | **`tied_checklist_gate_validate`** outcomes |
| Write **check-trace**-style invariants for recurring workflows | **IMPL essence_pseudocode** for shipped logic |
| Capture duplicate-child observations via **`tied_feedback_capture_observation`** | **REQ/ARCH/IMPL** via TIED MCP |
| Pair visual profile with PRELOAD / slug scope | **`tied_config_get_base_path`** before writes |
| Use agentstream trace when debugging orchestration | Gates unchanged |
| Read Furmanov token tables as harness tuning hints | No effectiveness claims |

---

## Bounded operator recommendations (Recommendation-only)

1. **Review structure after batches** — For multi-skill or Task-heavy TIED sessions, run `@harness-trace-review` (or read agentstream trace when enabled) before declaring harness health.
2. **Separate validator PASS from platform proof** — Sub-skill or linter PASS lines compose with, but do not replace, **`tied_verify`** and gate receipts.
3. **Document factory invariants** — Encode recurring orchestration order as project skills or checklist notes (Furmanov **check-trace** pattern); promotion still via owning slug.
4. **Label token anecdotes** — Furmanov duration/token figures are **Furmanov-reported**; TIED pilots need their own denominators.
5. **Dual-harness optional** — Claude Code factories may install harness-profiler locally; stdd default plane remains Cursor + TIED MCP (**Defer** committed hook unless sponsor scopes).
6. **Pair siblings** — Benchmark trace tuning: [LangChain harness × TIED](langchain-harness-engineering-vs-tied-agent-management.md); fleet metrics: [Cursor harness × TIED](cursor-harness-engineering-vs-tied-agent-management.md).
7. **Authority skim** — [Traefik × TIED](traefik-harness-platform-vs-tied-agent-management.md) + [authority-boundary checklist](../../tied-project/working/REQ-TIED_HARNESS_PLATFORM_SEAM/authority-boundary-operator-checklist.md).

---

## Phased recommendations (doc-first)

| Phase | Action | Status |
| --- | --- | --- |
| **0** | Wave 1 stub + this analysis + git allowlist | **Done** (2026-11-17) |
| **1** | HTOL **Source studies** one-line cross-link | **Done** (2026-11-17, doc-only) |
| **2** | Compose guide + factory profile operator checklist | **Implemented** ([REQ-TIED_FURMANOV_FACTORY_PROFILE_WAVE3](../../tied-project/requirements/REQ-TIED_FURMANOV_FACTORY_PROFILE_WAVE3.yaml)) |
| **3** | agentstream ↔ harness-profiler JSONL bridge | **Defer** (behavior-changing; separate REQ) |
| **4** | Methodology composition matrix §2 row | **Defer** (sponsor costly choice) |

---

## Explicit non-adoptions

- **harness-profiler** as TIED core or mandatory client dependency
- Furmanov token/duration tables as **TIED methodology effectiveness** proof
- **check-trace** PASS/FAIL substituting **`tied_checklist_gate_validate`** or **`tied_verify`**
- Claude Code hook installation in stdd without scoped REQ
- Minting `[REQ-*]` / `[ARCH-*]` / `[IMPL-*]` from this comparison prose
- Methodology composition matrix **§2 data row** without parent REQ contract
- Codex profiler path until vendor support ships (**target-repo-observed** gap)

---

## Proof boundary

- Article and case metrics are **Furmanov-reported**; README install/constraints are **target-repo-observed**; not independently verified in stdd.
- TIED surfaces cited are **TIED-existing** at authoring time; composability does not ship Furmanov’s plugin.
- Wave 3 behavior requires **`add-feature`** / **`build-plan`** with tests—not comparison markdown alone.
- Effectiveness of factory profiling in TIED clients is **`not_measured`** unless enrolled in [evaluation framework](../tied-methodology-evaluation-framework.md) arms.
- This document introduces **no new** REQ/ARCH/IMPL records **in its body**.

---

## Related documents

- [Article stub (sibling)](afurmanov-harness-profiler.md)
- [LangChain harness × TIED (sibling)](langchain-harness-engineering-vs-tied-agent-management.md)
- [Cursor harness × TIED (sibling)](cursor-harness-engineering-vs-tied-agent-management.md)
- [LangChain goal engineering × TIED (sibling)](langchain-goal-engineering-vs-tied-agent-management.md)
- [Traefik harness/platform × TIED](traefik-harness-platform-vs-tied-agent-management.md)
- [Harness trace observation loop](../../tied-bundle/docs/harness-trace-observation-loop.md) (matrix rows **14–15**)
- [agentstream README](../../mcp-server/packages/agentstream/README.md)
- [External three-wave comparison template](../../tied-bundle/docs/external-service-three-wave-comparison-template.md)
- [Working DOC plan](../../tied-project/working/DOC-AFURMANOV-HARNESS-PROFILER-COMPARISON/PLAN-refine-pass1.md)
- [Non-tied plan](../../tied-project/non-tied-plans/afurmanov-harness-profiler-vs-tied/PLAN.md)
- [Furmanov factory profile compose guide](../../tied-bundle/docs/furmanov-factory-profile-compose.md) ([REQ-TIED_FURMANOV_FACTORY_PROFILE_WAVE3](../../tied-project/requirements/REQ-TIED_FURMANOV_FACTORY_PROFILE_WAVE3.yaml))