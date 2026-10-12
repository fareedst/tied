# TIED LangGraph orchestration — phased implementation plan

| Field | Value |
| --- | --- |
| **Status** | **P1 scaffold complete** — P2+ gated (see program `PLAN.md`) |
| **Change ID** | `PLAN-TIED-LANGGRAPH-ORCHESTRATION` |
| **Priority** | P2 (experimental orchestration; does not block product REQ delivery) |
| **Owner** | Canonical TIED source repository (`stdd`) |
| **Conceptual basis** | [`docs/tools/langgraph-evidence-driven-software-engineering.md`](../tools/langgraph-evidence-driven-software-engineering.md) |
| **Last updated** | 2026-10-11 |

**Planning-artifact disclaimer:** This document does **not** create project REQ/ARCH/IMPL tokens by itself, does **not** change checklist gate behavior in `tied-bundle/`, and does **not** authorize edits to committed methodology YAML. Each phase that changes enforcement, MCP contracts, or agentstream defaults requires its own scoped enrollment (Tracker, CITDP, gates, traceable-commit) unless the phase table explicitly marks work as **planning-only** or **pilot-local**.

---

## 1. Executive summary

LangGraph is valuable to TIED when it provides **explicit, persistent, interruptible graph execution** for engineering obligations, while **authorization to proceed** remains with deterministic validators and existing TIED MCP tools—not with agent self-assessment.

This program delivers an **experimental Python orchestration package** under `tools/langgraph-pilot/` (name fixed in Phase 0) that:

1. Reads and writes **no canonical truth** outside `tied-project/` YAML, checklist trackers, and envelope artifacts.
2. Invokes **`tied-cli.sh` / TIED MCP** for gate validation, envelope build/validate, pseudocode validation, and `tied_validate_consistency`.
3. Maps graph state to **run ledgers** (run id, policy version, commits, checklist slug → evidence ref) stored under `tied-bundle/working/{REQ-TOKEN}/langgraph/` per [working-artifact-placement.md](../../tied-bundle/docs/working-artifact-placement.md).
4. Reuses **`tied agentstream`** patterns for subprocess agents, worktrees, and optional human interrupts—LangGraph is an alternative **orchestrator**, not a second methodology.

**Success criterion for the full program:** A single REQ slice can be driven from checklist-bound planning through RED → GREEN → gate receipt → envelope validate with **no step closable on model claims alone**, and an evaluation readout compares LangGraph pilot runs to agentstream baseline on the same fixture REQ.

**Non-goals (guardrails):**

- Replacing Cursor IDE agents or agentstream as the default operator path
- Duplicating `[PROC-AGENT_REQ_CHECKLIST]` step text inside Python prompts as the source of truth
- Storing REQ/ARCH/IMPL definitions only in graph memory
- Shipping LangGraph as a hard dependency for client `tied-install.sh` bootstrap

---

## 2. Governing principle and alignment

**Principle (from conceptual doc):** An agent may *propose* that an obligation is satisfied; only a verification process operating on *admissible evidence* may *authorize* completion.

| TIED artifact / process | LangGraph role |
| --- | --- |
| `[PROC-AGENT_REQ_CHECKLIST]` | **Project graph** node boundaries derived from checklist slugs; transitions gated externally |
| `[PROC-TIED_DEV_CYCLE]` | **Task subgraph**: unit RED → GREEN → composition → E2E |
| `[PROC-LEAP]` | **Replan edges** when evidence invalidates scope; does not skip IMPL-first elevation |
| `[REQ-REQUEST_EVIDENCE_ENVELOPE]` | Canonical **evidence index**; graph state holds pointers, not parallel schemas |
| `[REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]` | **`tied_checklist_gate_validate`** on conditional edges |
| `tied agentstream` | **Baseline executor** for A/B evaluation and feature parity checklist |
| Semantic tokens `REQ-*` / `ARCH-*` / `IMPL-*` | Stable keys in plan + manifest; graph never renames tokens |

### Three information classes (must remain distinct in implementation)

1. **Claims** — LLM assertions (inputs to review only).
2. **Observations** — tool outputs (exit code, stdout, commit SHA, artifact hash).
3. **Verification decisions** — policy applied to observations (gate receipts, envelope validate, `tied_verify`).

---

## 3. RESOLVE — sponsor vocabulary

| Sponsor / casual term | Canonical term | Notes |
| --- | --- | --- |
| LangGraph port | **LangGraph orchestration pilot** | Python package + graphs; not a TIED token |
| Engineering record | **run ledger** + envelope | Machine state under `langgraph/`; envelope remains REQ-scoped index |
| Quality gate | **deterministic acceptance gate** | Python policy function + MCP gate tools |
| Agent loop | **obligation cycle** | Obligation → action → evidence → verification → next |
| Full TIED process | **checklist-bound orchestration** | Full checklist is Phase 5+; earlier phases slice intentionally |
| Experimental | **methodology learning experiment** | Composes with QMM Loop 3; paired readout required at Phase 7 |

**PRELOAD when implementing any phase:** [`quality-assurance.md`](../../tied-project/vocab/quality-assurance.md), [`sponsor-agent-relationship.md`](../../tied-project/vocab/sponsor-agent-relationship.md), [`request-evidence-envelope.md`](../../tied-bundle/docs/request-evidence-envelope.md), [`agent-req-implementation-checklist.md`](../../tied-bundle/docs/agent-req-implementation-checklist.md).

---

## 4. Architecture (target end state)

```text
┌─────────────────────────────────────────────────────────────────┐
│ LangGraph Project Orchestration Graph                            │
│  • load REQ tracker + checklist YAML vars                        │
│  • schedule slices / dependencies                                │
│  • interrupt/resume for sponsor (human) decisions                │
└────────────┬────────────────────────────────────────────────────┘
             │ per slice
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Task Execution Subgraph (TDD + implementation)                   │
│  • investigation nodes (read-only repo tools)                    │
│  • RED → validate expected failure → GREEN → regression          │
│  • isolated worktree when parallel (Send)                          │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Verification Subgraph (authoritative progress)                   │
│  • envelope build / validate                                     │
│  • tied_checklist_gate_validate per slug                         │
│  • pseudocode_validate / tied_verify when checklist requires     │
│  • acceptance_gate → repair | replan | escalate | accept         │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ TIED MCP + tied-cli + shell tools (Git, test runners, linters)   │
└─────────────────────────────────────────────────────────────────┘
```

**Layer responsibilities** (from conceptual doc §10, adapted):

| Layer | Responsibility |
| --- | --- |
| LangGraph | Routing, persistence, checkpoints, interrupts, bounded retries |
| Pilot agents (LLM nodes) | Investigation, planning drafts, test/implement proposals |
| Engineering tools | Git, compilers, test runners, static analysis |
| TIED policy services | MCP gates, envelope, consistency validation, token graph |

Orchestration language (**Python**) may differ from product repos under test; tools run in client project roots with explicit `TIED_BASE_PATH`.

---

## 5. Costly-choice register (defaults until sponsor overrides)

| Decision | Default | Consequence ladder |
| --- | --- | --- |
| Canonical executor | **agentstream remains default**; LangGraph is opt-in pilot | Reversible until Phase 7 convergence |
| Source of truth for “may proceed” | **MCP gate + envelope validate**; graph local checklist is cache only | Costly if inverted |
| First ported checklist slice | **`[PROC-TIED_DEV_CYCLE]` unit RED/GREEN** only (Phase 3–4) | Reversible |
| Python pilot location | `tools/langgraph-pilot/` in `stdd` | Reversible |
| Methodology YAML edits | **Deferred** to separate `plan-new-feature` if gates must change | Costly |
| Weakening gates for pilot throughput | **Forbidden** | Costly / rejected |
| Public client dependency on LangGraph | **Forbidden** until Phase 7+ explicit REQ | Costly |

Open sponsor decisions (record answers in Phase 0 charter):

1. **Runtime spine:** LangGraph-only pilot vs parallel extension of agentstream state machine in TypeScript.
2. **Human-in-the-loop default:** interrupt before every costly gate vs autonomous with post-hoc envelope audit.
3. **Fixture REQ** for phases 3–6 — default instance: **PROMPT-GF-09** client `1791767366` at `/Users/fareed/Documents/dev/test/1791767366` with **`REQ-BOUNDED_WORKER_POOL`** (see [`catalog-greenfield-plan-new-feature-prompts.md`](../demos/catalog-greenfield-plan-new-feature-prompts.md) § Recorded trials).

---

## 6. Repository layout (authorized in Phase 1)

```text
tools/langgraph-pilot/
  pyproject.toml              # langgraph, pydantic, optional langchain-core
  README.md                   # operator entrypoints
  tied_langgraph/
    state.py                  # TypedDict / Pydantic run state
    mcp_client.py             # stdio MCP wrapper → existing tools
    policies/
      acceptance.py           # deterministic acceptance_gate
      tdd_red.py              # ValidRedEvidence policy
      staleness.py            # commit / policy_version invalidation
    graphs/
      project.py
      task_tdd.py
      verification.py
  tests/
    fixtures/                 # frozen gate responses, sample envelope JSON
    test_acceptance_gate.py
    test_mcp_adapter_contract.py

tied-project/working/PLAN-TIED-LANGGRAPH-ORCHESTRATION/   # Phase 0
  PLAN.md                     # symlink or copy of this doc section + tracker
  checklist-tracker.yaml      # program steps only
  evidence/                   # phase readouts, A/B metrics
```

Regenerable run artifacts: `tied-bundle/working/{REQ-TOKEN}/langgraph/{run_id}/`.

Committed rationale (if tokens added later): `tied-project/working/PLAN-TIED-LANGGRAPH-ORCHESTRATION/evidence/`.

---

## 7. Phased program

### Phase summary

| Phase | ID | Mode | Outcome | Exit gate |
| --- | --- | --- | --- | --- |
| 0 | Charter | Planning | Sponsor-approved scope, fixture REQ, costly choices resolved | Charter signed in working folder |
| 1 | Scaffold | Implement (pilot-local) | `tools/langgraph-pilot/` importable; MCP adapter smoke test | Unit tests green; no product behavior change |
| 2 | Evidence wiring | Implement | Envelope build/validate on graph transitions; run ledger schema v1 | Fixture envelope 0 blocking errors on validate |
| 3 | TDD subgraph | Implement | RED/GREEN/refactor loop with `ValidRedEvidence` policy | Composition test: forced fail → pass on fixture repo |
| 4 | Acceptance gate | Implement | Verification subgraph routes repair/replan/accept | Policy tests + one MCP gate receipt attached |
| 5 | Checklist slice | Implement | One contiguous checklist segment (e.g. unit TDD slugs) driven end-to-end | Tracker shows completed slugs with evidence refs |
| 6 | Multi-task | Implement | Dependency scheduling + optional `Send` + worktree isolation | Two-task fixture with merge regression |
| 7 | Evaluation & convergence | Planning + readout | Methodology learning readout vs agentstream; go/extend/stop decision | Sponsor review of `phase-7-convergence.md` |

---

### Phase 0 — Charter and program folder

**Goal:** Authorize work, fix vocabulary, choose fixture REQ, create working folder.

**Tasks:**

1. Copy program tracker template from [`agent-req-implementation-checklist.yaml`](../../tied-bundle/docs/agent-req-implementation-checklist.yaml) header instructions into `tied-project/working/PLAN-TIED-LANGGRAPH-ORCHESTRATION/checklist-tracker.yaml` (program meta only).
2. Record resolved costly choices (§5) in `evidence/charter.md`.
3. Select **fixture REQ** and **client project root** (read-only or disposable clone) for phases 3–6.
4. Document **MCP base path** policy: one Cursor window per target repo; `tied_config_get_base_path` recorded in charter.
5. Optional: documentation CITDP YAML (`CITDP-PLAN-TIED-LANGGRAPH-ORCHESTRATION.yaml`) if sponsor wants blast-radius tracking—planning-only.

**Deliverables:** `PLAN.md` (short pointer to this file), charter, tracker initialized.

**Exit:** Sponsor explicit “proceed Phase 1” (costly-choice rung 2).

---

### Phase 1 — Scaffold and MCP adapter

**Goal:** Minimal LangGraph project that can call TIED MCP tools reliably from Python.

**Tasks:**

1. Create `tools/langgraph-pilot/` with `pyproject.toml`, lint/format aligned with repo norms (document in pilot README).
2. Implement `mcp_client.py`:
   - Spawn `node mcp-server/dist/index.js` or invoke `.cursor/skills/tied-yaml/scripts/tied-cli.sh` for read-only tools first.
   - Required tools for scaffold: `tied_config_get_base_path`, `yaml_index_read`, `tied_validate_consistency` (read-only smoke).
3. Define `RunState` v0: `run_id`, `request_token`, `policy_version`, `baseline_commit`, `candidate_commit`, `checklist_vars`, `evidence_refs` (dict).
4. Single-node graph: `ping` → call MCP → persist checkpoint to local SQLite (LangGraph default) under run directory.
5. Unit tests with **mocked MCP JSON-RPC** responses (no live server in CI).

**Deliverables:** README with `uv run` / `pip install -e .` instructions; CI job stub optional (non-blocking until Phase 4).

**Exit:** `pytest` (or `uv run pytest`) green in `tools/langgraph-pilot/tests/`.

**Forbidden:** Writing project YAML via ad-hoc file edits; use MCP when mutating TIED data.

---

### Phase 2 — Evidence manifest and envelope integration

**Goal:** Graph transitions consume **envelope gaps**, not agent narrative.

**Tasks:**

1. Specify **run ledger** JSON schema v1 (`langgraph-run-ledger.v1.json`) aligned with envelope cross-links—document in pilot README.
2. On entering verification nodes, call:
   - `request_evidence_envelope_build`
   - `request_evidence_envelope_validate` (when blocking policy enabled)
3. Map envelope `gaps[]` to conditional edges: `continue` | `collect_more` | `escalate`.
4. Persist observation records: tool name, commit, exit code, artifact path, sha256.
5. Implement **staleness stub**: if `candidate_commit != evidence.commit`, mark evidence invalid and route to repair.

**Deliverables:** Schema doc; fixture envelope in `tests/fixtures/`; integration test against built MCP (optional nightly, mocked in CI).

**Exit:** Validate fixture envelope reports 0 **error**-severity gaps for a synthetic complete slice (warnings allowed).

**References:** [`request-evidence-envelope.md`](../../tied-bundle/docs/request-evidence-envelope.md), [`docs/evidence-collection-conversation-patterns.md`](../evidence-collection-conversation-patterns.md).

---

### Phase 3 — Single-task TDD subgraph

**Linked plan (refined):** [plan-tied-lg-p3-tdd-subgraph.md](./plan-tied-lg-p3-tdd-subgraph.md) · Working folder: `tied-project/working/PLAN-TIED-LG-P3-TDD/`.

**Goal:** Executable RED → GREEN → REFACTOR with **ValidRedEvidence** before implement allowed.

**Tasks:**

1. Implement `task_tdd.py` subgraph:
   - **RED:** agent or scripted test edit → run tests on `baseline_commit` → capture observation.
   - **RED gate:** `tdd_red.py` policy distinguishes expected failure vs syntax/fixture/dependency failure.
   - **GREEN:** implement node (agent proposal + apply patch) → run targeted tests on working tree.
   - **GREEN gate:** targeted tests pass; record commits.
   - **REFACTOR:** optional node; regression command from project norm (`npm test`, `go test ./...`, etc.).
2. Invariants (application policy, not LangGraph builtins):
   - `ImplementAllowed => ValidRedEvidence`
   - `AcceptAllowed => GreenEvidence && RegressionEvidence` (review evidence added Phase 4)
3. Detect **test weakening** heuristics: deleted assertions, skipped tests without waiver record in ledger.
4. Configurable **TDD waiver** object in run ledger: scope, reason, sponsor flag—for doc-only tasks.

**Deliverables:** Mermaid diagram in pilot README; composition test on fixture repo.

**Exit:** End-to-end subgraph run on fixture REQ produces RED and GREEN observation artifacts referenced from ledger.

---

### Phase 4 — Deterministic acceptance gate and verification subgraph

**Goal:** Separate **produce work** nodes from **authorize progress** nodes.

**Tasks:**

1. Implement `verification.py` subgraph:
   - Evidence schema validation (required fields, hashes).
   - `tied_checklist_gate_validate` for configured slug(s).
   - `pseudocode_validate` when gate requires.
   - `tied_verify` when verification-gated mode applies.
2. Implement `acceptance.py`:
   - Inputs: evidence dict, `requirements_covered` flag (from MCP traceability tools), `unresolved_blockers`, revision match.
   - Outputs: `repair` | `replan` | `escalate` | `accept` (conditional edges).
3. **Separation of duties:** implementing agent node cannot call tools that mutate ledger or envelope; only verification subgraph writes verification decisions.
4. Optional **interrupt** before `accept` for sponsor approval ([LangGraph interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts)).
5. Bounded retry policy: classify tool unavailable vs policy fail; max repair loops documented.

**Deliverables:** Policy unit tests mirroring conceptual doc §5 example; one real gate receipt stored under working folder evidence.

**Exit:** Subgraph refuses `accept` when review evidence missing; accepts when fixture fully satisfied.

---

### Phase 5 — Checklist slice orchestration

**Goal:** Bind graph to **real checklist slugs** for one contiguous segment of `[PROC-AGENT_REQ_CHECKLIST]`.

**Recommended first slice (default):** Unit test RED through unit test GREEN and related composition hooks—maps directly to `[PROC-TIED_DEV_CYCLE]` steps already exercised in agentstream tests.

**Tasks:**

1. Load checklist YAML + tracker from paths supplied via `--checklist-yaml` / `--tracker` (mirror agentstream CLI vars).
2. Project graph: iterate slugs in segment; each slug dispatches task or verification subgraph.
3. On slug completion, update tracker **only** through documented path (MCP or agentstream-compatible YAML update tool—avoid dual writers; prefer single writer module shared or sequential handoff).
4. Emit `checklist_gate_receipt` cross-link into envelope via `request_evidence_envelope_patch` where supported.
5. Document **dual-write risk** if both agentstream and LangGraph touch same tracker in one REQ (forbidden in production pilot; A/B runs use separate working copies).

**Deliverables:** Operator runbook section in pilot README; recorded run under `tied-bundle/working/{REQ}/langgraph/`.

**Exit:** Tracker shows segment complete with evidence refs; `tied_validate_consistency` passes for fixture project.

---

### Phase 6 — Multi-task coordination and parallelism

**Goal:** Schedule dependent tasks; optional parallel independent slices.

**Tasks:**

1. Extend project graph with task dependency DAG (from plan artifact or checklist vars).
2. Use LangGraph **`Send`** (or equivalent) for independent tasks; **mandatory** git worktree or branch per parallel implementer.
3. Merge node: integrate branches, run **combined regression** on `candidate_commit`.
4. Invalidate stale evidence when merge changes revision (full staleness policy from Phase 2).
5. Replan edge: architectural invalidation routes to planning node with LEAP proposal hook (`tied_leap_proposal_add` advisory) without auto-editing REQ.

**Deliverables:** Two-task demo script; failure injection test (invalidates plan).

**Exit:** Parallel fixture completes with merge regression evidence on final commit.

---

### Phase 7 — Evaluation, methodology learning, convergence

**Goal:** Decide whether to invest further, merge into agentstream, or maintain as research tooling.

**Tasks:**

1. Define **paired readout** metrics (non-exhaustive):
   - First-pass gate acceptance rate
   - Stale-evidence incidence
   - Rework loops per slug
   - Envelope gap count at close-out
   - Operator wall time vs agentstream baseline on same fixture
2. Run **A/B**: same fixture REQ once via agentstream, once via LangGraph pilot (separate trackers/working dirs).
3. Write `evidence/phase-7-convergence.md` with disposition:
   - **Extend** — fund Phase 8+ REQ tokens and broader checklist coverage
   - **Compose** — keep pilot for research; agentstream stays default
   - **Stop** — archive pilot; absorb learnings into MCP/agentstream only
4. If **Extend:** open scoped `plan-new-feature` for `REQ-TIED_LANGGRAPH_ORCHESTRATION` (name tentative) with proof boundary; do not imply automatic methodology promotion.

**Deliverables:** Readout, metrics JSON, sponsor decision record.

**Exit:** Sponsor sign-off on disposition; LEAP proposals filed if methodology rules change.

---

## 8. Optional Phase 8+ (not authorized by this plan)

Record for backlog only—requires new charter:

| Idea | Enrollment |
| --- | --- |
| Full checklist graph | Multi-week program; CITDP per wave |
| LangGraph as agentstream backend | ARCH decision; TS/Python boundary |
| Cloud-hosted persistent runs | Security review; credential isolation |
| Adversarial inquiry integrated nodes | `[REQ-TIED_ADVERSARIAL_INQUIRY]` depth tiers |
| Client `tied-install` optional extra | Costly; fleet impact |

---

## 9. Testing strategy (by phase)

| Phase | Test type | Command / location |
| --- | --- | --- |
| 1 | Unit (mock MCP) | `tools/langgraph-pilot/tests/test_mcp_adapter_contract.py` |
| 2 | Unit + schema | ledger + envelope fixture tests |
| 3 | Composition | fixture repo RED/GREEN |
| 4 | Unit policy | `test_acceptance_gate.py` |
| 5 | Integration | pilot CLI against disposable client clone |
| 6 | Integration + fault injection | parallel worktree script |
| 7 | Evaluation | manual A/B + documented metrics |

Align with TIED priority: **tests before** expanding agent nodes; graph wiring tests before LLM-dependent paths where possible.

---

## 10. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Second checklist drifts from canonical YAML | Slugs imported from bundled checklist; gate validates each transition |
| MCP `TIED_BASE_PATH` wrong repo | Charter + preflight node calling `tied_config_get_base_path` |
| Checkpoint resume duplicates shell side effects | Idempotent nodes; explicit reconcile subnode after interrupt |
| Pilot weakens gates to demo green | Phase 4 separation of duties; Phase 7 readout includes gap audit |
| Python/Node dual maintenance | Phase 7 convergence; shared contract tests for MCP payloads |
| LLM cost / flake | Deterministic nodes for all authorization; LLM only in propose nodes |

---

## 11. References

- Conceptual design: [`docs/tools/langgraph-evidence-driven-software-engineering.md`](../tools/langgraph-evidence-driven-software-engineering.md)
- Checklist authority: [`tied-bundle/docs/agent-req-implementation-checklist.md`](../../tied-bundle/docs/agent-req-implementation-checklist.md)
- Agentstream baseline: [`mcp-server/packages/agentstream/README.md`](../../mcp-server/packages/agentstream/README.md), [`docs/run-agent-stream-tied.md`](../run-agent-stream-tied.md)
- Envelope operator guide: [`tied-bundle/docs/request-evidence-envelope.md`](../../tied-bundle/docs/request-evidence-envelope.md)
- Working artifact placement: [`tied-bundle/docs/working-artifact-placement.md`](../../tied-bundle/docs/working-artifact-placement.md)
- LangGraph docs: [Graph API](https://docs.langchain.com/oss/python/langgraph/graph-api), [Subgraphs](https://docs.langchain.com/oss/python/langgraph/use-subgraphs), [Persistence](https://docs.langchain.com/oss/python/langgraph/persistence), [Interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts)

---

## 12. Next actions

1. Sponsor resolves §5 open decisions and approves Phase 0.
2. Create `tied-project/working/PLAN-TIED-LANGGRAPH-ORCHESTRATION/` with charter + tracker.
3. Execute Phase 1 scaffold (Agent mode implementation session).

*This plan translates the prior architecture analysis into an executable phased program; implementation begins only after Phase 0 approval.*
