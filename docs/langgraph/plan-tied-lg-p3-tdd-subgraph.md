# PLAN-TIED-LG-P3-TDD — Single-task TDD subgraph

| Field | Value |
| --- | --- |
| **Program** | [PLAN-TIED-LANGGRAPH-ORCHESTRATION](../../tied-project/working/PLAN-TIED-LANGGRAPH-ORCHESTRATION/PLAN.md) |
| **Wave** | P3 |
| **Working folder** | [tied-project/working/PLAN-TIED-LG-P3-TDD/](../../tied-project/working/PLAN-TIED-LG-P3-TDD/PLAN.md) |
| **Depends on** | P2 evidence wiring complete (`tools/langgraph-pilot/` ledger, envelope, routing, staleness) |
| **Phased spec** | [tied-langgraph-orchestration-plan.md](./tied-langgraph-orchestration-plan.md) § Phase 3 |
| **Fixture (charter)** | Client `1791767366` · [trial readout](../demos/trial-readout-PROMPT-GF-09-1791767366.md) |

## Goal

Execute **RED → GREEN → REFACTOR** as a LangGraph subgraph with application policy **`ImplementAllowed => ValidRedEvidence`**. Test observations are recorded in the run ledger; implement nodes may not advance without a validated RED outcome.

## Refined scope and authority

**Pilot-local** slice: extends `tools/langgraph-pilot/` only. No new stdd `REQ-*`/`ARCH-*`/`IMPL-*` unless sponsor later mints `REQ-LANGGRAPH-*`. Fixture **`REQ-BOUNDED_WORKER_POOL`** lives on the disposable client; the pilot **reads/runs tests** there — it does not mutate fixture TIED YAML during default CI.

The **`pre_implementation`** receipt from this **`@refine-plan`** pass is **plan-only**. It authorizes CITDP and test-strategy handoff, not P3 RED tests or code. **`@build-plan`** must obtain a fresh **implement-phase** `pre_implementation` gate before RED.

P2 envelope routing and staleness remain authoritative for verification-adjacent nodes; P3 does not weaken gate-blocking semantics.

## In scope

1. **`tied_langgraph/graphs/task_tdd.py`** — subgraph nodes:
   - **RED:** run targeted test command at `baseline_commit` (or clean tree baseline); capture observation (exit code, stdout/stderr refs, commit, artifact hash).
   - **RED gate:** `tied_langgraph/policies/tdd_red.py` classifies outcome → `ValidRedEvidence` | `InvalidRedEvidence` (expected failure vs syntax/fixture/dependency/unrelated failure).
   - **GREEN:** apply candidate patch (agent proposal or test harness hook) → run targeted tests on working tree; record observation.
   - **GREEN gate:** targeted tests pass at `candidate_commit`.
   - **REFACTOR (optional):** run project regression command; record observation.
2. **Invariants (application policy):**
   - `ImplementAllowed => ValidRedEvidence`
   - `AcceptAllowed => GreenEvidence && RegressionEvidence` (review evidence deferred to P4)
3. **Test-weakening heuristics** — `tied_langgraph/policies/test_weakening.py` (or equivalent): flag deleted assertions, broad `it.skip` / `test.skip` without ledger **TDD waiver** record.
4. **TDD waiver** object on run ledger: `{ scope, reason, sponsor_flag }` for doc-only or explicitly waived tasks.
5. **README** — Mermaid diagram of subgraph; env vars for fixture root and test commands.

## Fixture and composition boundary

| Layer | Boundary |
| --- | --- |
| **Charter fixture** | `/Users/fareed/Documents/dev/test/1791767366` · `npm test` · `TIED_BASE_PATH` → fixture `tied-project/` |
| **CI default** | Hermetic mini-project under `tests/fixtures/tdd-mini-repo/` (Vitest or shell-driven) so `pytest` stays offline; no dependency on sponsor disk path |
| **Optional integration** | `@pytest.mark.integration` test when `LANGGRAPH_FIXTURE_CLIENT_ROOT` is set — full charter path for local/sponsor verification |

**Exit composition:** end-to-end subgraph run produces RED and GREEN observation records in the ledger referencing test command, commits, and artifact hashes. CI proves the loop on the hermetic fixture; charter path is documented for manual replay.

## Implementation sequence

`@build-plan` RED-first order:

1. **`tdd_red` policy** — failing matrix: expected assertion failure vs syntax error vs missing dependency.
2. **Test-weakening detector** — failing cases for skip-without-waiver and assertion deletion diff heuristic.
3. **Subgraph state extensions** — `RunState` fields for TDD phase, last observation id, waiver flag.
4. **`task_tdd` graph** — unit tests with mocked test runner (no subprocess) for transitions.
5. **Test runner adapter** — `tied_langgraph/runners/npm_test.py` (or generic `subprocess` runner): cwd, env, timeout, ledger append.
6. **Hermetic fixture composition** — forced fail → minimal green patch → refactor regression in `tests/fixtures/tdd-mini-repo/`.
7. **Optional integration test** — skipped unless env set; document in README.

Validate **policy modules** independently before wiring the full subgraph composition seam.

## Module boundaries and test strategy

| Module | Boundary | Independent validation |
| --- | --- | --- |
| `policies/tdd_red.py` | Classify test exit evidence | Matrix of exit codes, stderr patterns, expected-failure markers |
| `policies/test_weakening.py` | Diff/skip heuristics | Synthetic diffs; waiver present vs absent |
| `graphs/task_tdd.py` | State machine edges | Mock runner; no fixture I/O |
| `runners/*` | Subprocess isolation, timeout | Fake commands; ledger append contract |
| composition | Runner + subgraph + mini-repo | Hermetic RED→GREEN; optional live fixture |

**CI:** mocked runner in unit tests; hermetic mini-repo for composition; live fixture optional.

## Acceptance and exit criteria

P3 is ready to close only when:

- Fresh **implement** `pre_implementation` gate allowed (plan-only receipt not reused).
- **`ValidRedEvidence`** required before implement transition; invalid RED routes repair/escalate.
- Test-weakening without waiver blocks GREEN acceptance.
- Hermetic composition test demonstrates forced fail → pass with ledger artifacts.
- Pilot `pytest` green; no P4 acceptance subgraph or live MCP gate receipts required yet.

## Out of scope

- P4 `verification.py` / `acceptance.py` gate semantics.
- Checklist slice end-to-end (P5).
- Mutating fixture client TIED YAML via ad-hoc edits (MCP-only if ever needed).
- Weakening RED gate for demo throughput.

## References

- [langgraph-evidence-driven-software-engineering.md](../tools/langgraph-evidence-driven-software-engineering.md) § TDD invariants
- [plan-tied-lg-p2-evidence-wiring.md](./plan-tied-lg-p2-evidence-wiring.md)
- Program charter fixture contract: [charter.md](../../tied-project/working/PLAN-TIED-LANGGRAPH-ORCHESTRATION/evidence/charter.md)

## Implement handoff

After this plan pass: **`@build-plan`** on [PLAN-TIED-LG-P3-TDD/PLAN.md](../../tied-project/working/PLAN-TIED-LG-P3-TDD/PLAN.md).

Before RED, run and persist a fresh integrated P3 **`pre_implementation`** gate on the authoritative Tracker and CITDP. If blocked, repair phase-specific evidence and rerun; do not claim implementation readiness.
