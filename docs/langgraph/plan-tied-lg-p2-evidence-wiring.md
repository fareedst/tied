# PLAN-TIED-LG-P2-EVIDENCE — Evidence manifest and envelope integration

| Field | Value |
| --- | --- |
| **Program** | [PLAN-TIED-LANGGRAPH-ORCHESTRATION](../../tied-project/working/PLAN-TIED-LANGGRAPH-ORCHESTRATION/PLAN.md) |
| **Wave** | P2 |
| **Working folder** | [tied-project/working/PLAN-TIED-LG-P2-EVIDENCE/](../../tied-project/working/PLAN-TIED-LG-P2-EVIDENCE/PLAN.md) |
| **Depends on** | P1 `tools/langgraph-pilot/` scaffold complete |
| **Close-out** | Machine close-out 2026-10-12 (`p2-closeout-closeout-20261012`, envelope blocking_gaps=0) |
| **Phased spec** | [tied-langgraph-orchestration-plan.md](./tied-langgraph-orchestration-plan.md) § Phase 2 |

## Goal

Graph transitions consume **request evidence envelope** gaps (`gaps[]`), not agent narrative. Verification-oriented nodes build/validate envelopes via MCP and route on gap severity.

## Refined scope and authority

This is a **pilot-local implementation slice**. It adds no project
`REQ-*`/`ARCH-*`/`IMPL-*` records, changes no `tied-bundle/` methodology
content, and does not make LangGraph an acceptance authority. The canonical
envelope and TIED gate remain authoritative; the graph may only cache
observations and select a repair/escalation route.

The existing `pre_implementation` receipt is **plan-only** evidence. It
authorizes this CITDP and test-strategy handoff, not P2 RED tests or code. A
fresh implement-phase `pre_implementation` gate must be allowed against the
Tracker in the working folder before `@build-plan` starts RED. The existing
integrated envelope is retained as diagnostic evidence only because its
`gaps[]` include blocking `expected_artifact_missing` and unresolved inquiry
findings.

## In scope

1. **Run ledger** schema `langgraph-run-ledger.v1.json` (cross-links to envelope paths, observations, commits).
2. Pilot modules under `tools/langgraph-pilot/tied_langgraph/`:
   - `ledger.py` — append-only observation records (tool, commit, exit code,
     artifact path, sha256), confined beneath the run directory.
   - `envelope.py` — validates the request token, calls
     `request_evidence_envelope_build` and
     `request_evidence_envelope_validate` through `McpClient`, and preserves
     the returned gap payload without rewriting policy.
   - `graphs/project.py` — maps gap severity/codes to `continue`,
     `collect_more`, or `escalate`; error-severity gaps must never continue.
   - `policies/staleness.py` — compares candidate and evidence commits and
     routes mismatches to repair.
3. **Fixture boundary:** use a synthetic envelope fixture only; do not invoke
   the stdd project or P3 fixture client from default CI.

## Implementation sequence

`@build-plan` follows this RED-first order:

1. Add the ledger schema and failing ledger tests.
2. Add the envelope wrapper and failing request-token/MCP contract tests.
3. Add gap routing and failing severity/code matrix tests.
4. Add staleness invalidation and failing revision-mismatch tests.
5. Add the complete synthetic envelope fixture and mocked MCP composition test.
6. Validate ledger, envelope, routing, and staleness independently before
   composing the graph transition.
7. Run the pilot suite and record evidence; live MCP is not required for CI.

## Module boundaries and test strategy

| Module | Boundary | Independent validation |
| --- | --- | --- |
| `ledger.py` | Typed observation append and run-directory confinement | Schema, required fields, hash format, path escape rejection |
| `envelope.py` | MCP request/response adapter; no routing policy | Request-token forwarding, build/validate payload shape, MCP failure propagation |
| `graphs/project.py` | Pure gap-to-route policy | Complete/warning/error/malformed gap matrices; fail-closed error route |
| `policies/staleness.py` | Revision validity predicate | Equal commits remain valid; mismatch invalidates and routes repair |
| fixture/composition seam | MCP adapter to graph route | Mocked end-to-end transition with no live project writes |

## Acceptance and exit criteria

P2 is ready to close only when all of the following are true:

- The fresh implement `pre_implementation` gate is allowed for the current
  Tracker/CITDP; the plan-only receipt is not reused.
- The ledger schema is documented and every persisted observation contains the
  tool, commit, exit code, artifact path, and sha256 fields.
- A wrong request token, path escape, malformed gap, or error-severity gap
  fails closed; no such case routes to `continue`.
- The synthetic complete envelope validates with **0 error-severity gaps**
  (warnings may remain).
- Unit tests pass for every module and the mocked composition test passes.
- No live MCP, fixture-client, P3 TDD, or gate-semantics change is introduced.

## Out of scope

- Fixture client `1791767366` (P3+).
- TDD subgraph (P3).
- Weakening gate-blocking semantics for pilot demos.

## References

- [request-evidence-envelope.md](../../tied-bundle/docs/request-evidence-envelope.md)
- [langgraph-evidence-driven-software-engineering.md](../tools/langgraph-evidence-driven-software-engineering.md)

## Implement handoff

After this plan pass: `@build-plan` on
[PLAN-TIED-LG-P2-EVIDENCE/PLAN.md](../../tied-project/working/PLAN-TIED-LG-P2-EVIDENCE/PLAN.md).
Before RED, build-plan must run and persist a fresh integrated P2
**`pre_implementation`** gate using the authoritative Tracker and CITDP.
If the gate is blocked by stale or unresolved integrated evidence, repair the
phase-specific evidence and rerun it; do not claim implementation readiness.
