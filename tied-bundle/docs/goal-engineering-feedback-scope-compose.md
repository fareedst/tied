# Goal engineering — feedback-scope compose

**Audience:** Sponsors, harness authors, and agents implementing TIED-tracked changes after reading [LangChain Goal Engineering × TIED](../../docs/comparisons/langchain-goal-engineering-vs-tied-agent-management.md).

**Traceability:** [REQ-TIED_LANGCHAIN_GOAL_ENGINEERING_WAVE3](../../tied-project/requirements/REQ-TIED_LANGCHAIN_GOAL_ENGINEERING_WAVE3.yaml) · [ARCH-TIED_LANGCHAIN_GOAL_ENGINEERING_WAVE3](../../tied-project/architecture-decisions/ARCH-TIED_LANGCHAIN_GOAL_ENGINEERING_WAVE3.yaml) · [IMPL-TIED_LANGCHAIN_GOAL_ENGINEERING_WAVE3](../../tied-project/implementation-decisions/IMPL-TIED_LANGCHAIN_GOAL_ENGINEERING_WAVE3.yaml)

**Compose-don’t-replace:** This guide adds **goal-aligned scope** and **feedback-batch** literacy for the software-delivery slice. It does **not** adopt Hone/Actively product UI, business KPI optimizers, or LangChain-reported effectiveness proof (**`not_measured`**).

---

## Proof boundary

| In scope | Out of scope |
| --- | --- |
| Scoping agent work so **sponsor review** batches cleanly (REQ item, checklist slug, prompt-type) | CRM **motion** products or per-account agent UX |
| **Tacit** sponsor preference via charter/selection lanes and feedback MCP | Replacing **`tied_checklist_gate_validate`** or **`tied_verify`** with chat approval throughput |
| Written intent: IMPL pseudo-code, project YAML, tests | Business-metric **green** as implement-complete proof |
| Pair-read with harness row **15** (trace loop) and row **20** compose | Storing LangChain blog body in-repo |

Pattern: mirror [tests vs checker-backed claims](tests-vs-checker-backed-claims.md) — separate **claim class** from **proof surface**.

---

## Scope slice

| TIED can encode in-repo | Tacit / out-of-graph by default |
| --- | --- |
| REQ → ARCH → IMPL + token comments | Taste, brand tone, “how aggressive” (**LangChain-reported** examples) |
| Checklist slug batching per change item | Sales **account**-scoped micro-agents |
| **`tied_sponsor_questions`** during charter lane | Chat-only preference with no hinge field |
| PRELOAD / scoped reads (**context-gathering** analog) | LangChain **Hone** metric loops (**`not_measured`**) |
| **`tied_feedback_capture_observation`** (Kaizen) | Feedback observation = gate pass |

Label LangChain-reported narratives **`not_measured`** unless an evaluation cohort is scoped.

---

## Feedback-batch analog table

LangChain **motion** literacy (**LangChain-reported**) → TIED delivery batching:

| Motion idea (vendor) | TIED analog | Operator action |
| --- | --- | --- |
| JTBD across many entities | One **REQ-scoped** checklist tracker | Single `request_token`; avoid per-file wandering |
| Sparse review on one account | Micro-scope agent per file/path | Batch by **slug** (`build-plan`, `refine-plan`) |
| Feedback transfers inside motion | Shared PLAN + CITDP for one item | Same working folder evidence |
| Background context assembly | PRELOAD glossaries; brownfield reads | Complete gather pass before RED |
| Human teaches tacit rules | Sponsor lanes + `tied_feedback_*` | Record costly choices; not chat alone |

---

## Tacit-context catalog

Tacit zones to name beside in-scope proof in CITDP **change_definition**:

- **Sponsor taste** not yet in vocab — charter or selection lane; vocab RECORD **Defer** v1.
- **Review UX** preferences — IDE/PLAN ergonomics; not **`tied_verify`**.
- **Client KPI loops** (ads, pipeline) — **`Defer`**; use tests + gates for shipped behavior.
- **LangChain-reported** product outcomes — outreach only; **`not_measured`**.
- **Harness trace insights** — pair [LangChain harness × TIED](../../docs/comparisons/langchain-harness-engineering-vs-tied-agent-management.md); HTOL observations ≠ gates.

**Operator checklist:** [goal-aligned scope operator checklist](../../tied-project/working/REQ-TIED_LANGCHAIN_GOAL_ENGINEERING_WAVE3/goal-aligned-scope-operator-checklist.md).

---

## Pair-read

1. [LangChain goal engineering × TIED](../../docs/comparisons/langchain-goal-engineering-vs-tied-agent-management.md) — goal scope + review UX (**LangChain-reported**).
2. [LangChain harness engineering × TIED](../../docs/comparisons/langchain-harness-engineering-vs-tied-agent-management.md) — row **15** trace/middleware (distinct subject).
3. [Sponsor two-lane delivery](sponsor-two-lane-delivery.md) — charter vs selection for tacit preference.
4. [HPS authority-boundary operator checklist](../../tied-project/working/REQ-TIED_HARNESS_PLATFORM_SEAM/authority-boundary-operator-checklist.md) — harness vs platform before YAML writes.
5. [Harness trace observation loop](harness-trace-observation-loop.md) — observations compose; they do not replace gates.

---

## CITDP prompt

Sponsor-facing bullets (post **off-repo**; paraphrase only):

- What is the **goal-aligned scope** for this agent/session (one REQ item, not unbounded KPI)?
- Which **tacit** preferences need sponsor lane evidence vs written IMPL?
- Are we batching review like a **motion** (slug/tracker) or fragmenting per file?
- Is **PRELOAD** / gather complete before implementation RED?
- Did we call **`tied_config_get_base_path`** before project YAML writes?
- Are LangChain-reported metrics labeled **`not_measured`**?
- Is implement-complete backed by **`tied_checklist_gate_validate`**—not review throughput?

Policy pointer: [citdp-policy.md](citdp-policy.md) (goal-aligned scope paragraph).

---

## Anti-patterns

| Anti-pattern | Why it fails | Remedy |
| --- | --- | --- |
| **Chat approval** as gate | No checklist JSON | `tied_checklist_gate_validate` |
| **KPI green** as TIED done | Business metric ≠ tests | Proof boundary; **`not_measured`** |
| **Per-file micro-agents** | Sparse sponsor feedback | REQ-scoped batching |
| **Goal engineering waives IMPL** | Subjective ≠ untested behavior | IMPL + RED for shipped code |
| **HTOL / feedback = done** | Kaizen only | Verification gate receipts |
| **Row 15 smeared into row 20** | Harness trace ≠ goal scope | Pair-read both comparisons |

---

## Related documents

- [Client development index](client-development-index.md) — Quick reads row
- [LangChain goal stub capture](../../docs/comparisons/langchain-goal-engineering.md)
- [Methodology composition matrix §2 row 20](../../docs/comparisons/methodology-composition-matrix.md)
- [AGENTS.md](../../AGENTS.md)