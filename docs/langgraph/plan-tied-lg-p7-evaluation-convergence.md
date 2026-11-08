# PLAN-TIED-LG-P7 — Evaluation, methodology learning, convergence

| Field | Value |
| --- | --- |
| **Program** | [PLAN-TIED-LANGGRAPH-ORCHESTRATION](../../tied-project/working/PLAN-TIED-LANGGRAPH-ORCHESTRATION/PLAN.md) |
| **Wave** | P7 |
| **Working folder** | [tied-project/working/PLAN-TIED-LG-P7-CONVERGENCE/](../../tied-project/working/PLAN-TIED-LG-P7-CONVERGENCE/PLAN.md) |
| **Depends on** | P6 multi-task complete (`f0cea237`; 61 pytest green) |
| **Phased spec** | [tied-langgraph-orchestration-plan.md](./tied-langgraph-orchestration-plan.md) § Phase 7 |
| **Primary deliverable** | [phase-7-convergence.md](../../tied-project/working/PLAN-TIED-LANGGRAPH-ORCHESTRATION/evidence/phase-7-convergence.md) |
| **Mode** | `plan_and_readout` — no pilot feature RED unless metrics collector schema is sponsor-approved |

## Goal

Produce a **paired readout** comparing the LangGraph pilot (`tools/langgraph-pilot/`) to the **agentstream** default executor on the same fixture contract, then record a sponsor-facing **disposition**: **Extend**, **Compose**, or **Stop** (per phased spec § Phase 7).

**agentstream remains default** until sponsor signs disposition; this wave does not imply methodology promotion.

## Refined scope and authority

**Plan-and-readout** under program working folders. No new stdd `REQ-*`/`ARCH-*`/`IMPL-*` unless disposition **Extend** triggers a separate `plan-new-feature`. Fresh **`pre_implementation`** gate on P7 CITDP before `@build-plan` readout execution; P0 program enrollment receipts are not reused for P7 claims.

**depth_tier:** `minimal` · **gate_policy:** `advisory` — evaluation and documentation; optional small JSON schema test only if metrics file is machine-validated.

## Fixture three-part contract (A/B anchor)

| Part | Value |
| --- | --- |
| Catalog | PROMPT-GF-09 / TIED-DEMO-09 / CON-01 |
| Client root | `/Users/fareed/Documents/dev/test/1791767366` |
| Implement REQ | `REQ-BOUNDED_WORKER_POOL` · `TIED_BASE_PATH` → that client's `tied-project/` |

LangGraph arm: hermetic pilot runs (P3–P6) + optional **sponsor smoke** on charter client (out of default CI). Agentstream arm: documented baseline runs (trial readouts + `workflow_trial_agentstream` / manual four-phase) on disposable clients with the same product scope class.

## Paired metrics (non-exhaustive)

Capture in `p7-paired-readout-metrics.v1.json` and summarize in `phase-7-convergence.md`:

| Metric id | Definition | LangGraph source | Agentstream source |
| --- | --- | --- | --- |
| `first_pass_gate_accept` | `pre_implementation` / `verification` gate `allowed=true` on first attempt | P2–P6 gate receipts under `tied-bundle/working/PLAN-TIED-LG-*/gates/` | WF trial / REQ close-out gate JSON on disposable client |
| `stale_evidence_incidence` | Count of staleness routes or invalidate events per run | P2 ledger + P6 merge staleness tests / run ledgers | Envelope staleness fields at close-out |
| `rework_loops_per_slug` | Tracker slug transitions `pending` → `completed` with >1 disposition change | P5/P6 disposable tracker copies | Agentstream checklist tracker per WF trial |
| `envelope_gap_count` | `blocking_gap_count` at machine close-out | P4/P6 close-out receipts | `@close-out` envelope on fixture or WF trial |
| `operator_wall_minutes` | Sponsor-timed wall clock for same-scope slice (honest estimate OK) | Pilot CLI + pytest evidence collection | agentstream four-phase or IDE skill turns |

## In scope (`@build-plan`)

1. **Inventory** — consolidate P0–P6 exit commits, pytest count, gate receipts, and pilot README operator surfaces into convergence draft sections.
2. **Agentstream baseline packet** — cite existing trial readouts ([docs/demos/](../demos/)) and charter; if no `REQ-BOUNDED_WORKER_POOL` agentstream run exists, run **one** sponsor-authorized agentstream path on fixture or nearest disposable analogue and record run_id + tracker path.
3. **LangGraph arm packet** — cite P3 TDD subgraph, P4 acceptance, P5 checklist slice, P6 multi-task; attach `cd tools/langgraph-pilot && .venv/bin/pytest -q` result.
4. **Metrics JSON** — write [p7-paired-readout-metrics.v1.json](../../tied-project/working/PLAN-TIED-LANGGRAPH-ORCHESTRATION/evidence/p7-paired-readout-metrics.v1.json) (schema below).
5. **Convergence doc** — complete [phase-7-convergence.md](../../tied-project/working/PLAN-TIED-LANGGRAPH-ORCHESTRATION/evidence/phase-7-convergence.md): findings, gaps, disposition (**pending sponsor** until signed).
6. **Program exit** — update [langgraph-program-execution-checklist.yaml](../../tied-project/working/PLAN-TIED-LANGGRAPH-ORCHESTRATION/langgraph-program-execution-checklist.yaml) P7 `status` and optional `exit_commit`; [program-evidence-registry.v1.yaml](../../tied-project/working/PLAN-TIED-LANGGRAPH-ORCHESTRATION/evidence/program-evidence-registry.v1.yaml) wave P7 disposition.
7. **Sponsor decision record** — `evidence/sponsor-disposition-p7-YYYYMMDD.md` when sponsor chooses Extend | Compose | Stop.
8. **Optional machine check** — unit test validating `p7-paired-readout-metrics.v1.json` against embedded schema in pilot tests (only if sponsor wants CI enforcement in this wave).

## Out of scope

- Phase 8+ checklist graph (backlog only).
- Replacing agentstream as default executor without separate ARCH program.
- Live LLM nodes in pilot for A/B (deterministic/scripted arms only).
- Automatic promotion of pilot into `tied-bundle/` methodology.

## Disposition definitions

| Disposition | Meaning | Next action |
| --- | --- | --- |
| **Extend** | Fund broader checklist coverage / new REQ tokens | Scoped `plan-new-feature` (tentative `REQ-TIED_LANGGRAPH_ORCHESTRATION`); proof boundary required |
| **Compose** | Keep pilot as research; agentstream stays default | Maintain pilot + shared MCP contract tests; no new program wave without charter |
| **Stop** | Archive pilot | Absorb learnings into MCP/agentstream docs only; LEAP proposals if rules change |

## Metrics JSON schema (v1)

```json
{
  "schema_version": "p7-paired-readout-metrics.v1",
  "program_request": "PLAN-TIED-LANGGRAPH-ORCHESTRATION",
  "recorded_at": "ISO-8601",
  "fixture_client": "/Users/fareed/Documents/dev/test/1791767366",
  "implement_req": "REQ-BOUNDED_WORKER_POOL",
  "arms": {
    "langgraph_pilot": {
      "wave_exit_commits": ["ebda93d5", "58c1fa9b", "a997b6d6", "f0cea237"],
      "pytest_last": { "command": "cd tools/langgraph-pilot && .venv/bin/pytest -q", "passed": null, "total": null }
    },
    "agentstream_baseline": {
      "run_refs": [],
      "trial_readout_refs": []
    }
  },
  "metrics": {}
}
```

## Implementation sequence (`@build-plan`)

1. Fresh P7 `pre_implementation` gate + tracker dispositions through test-strategy (plan artifacts).
2. Collect evidence inventory (no RED product code required).
3. Fill metrics JSON + convergence narrative.
4. Sponsor review disposition; file LEAP proposals if methodology rules change.
5. Optional program `@close-out` when machine envelope policy applies to readout wave.

## Acceptance and exit

- `phase-7-convergence.md` lists all five metric families with sourced values or explicit **not_observed**.
- Sponsor-signed disposition artifact **or** documented **pending** with dated follow-up in Do next.
- Program checklist P7 status reflects readout complete; pilot pytest still green if optional schema test added.

## References

- [plan-tied-lg-p6-multi-task.md](./plan-tied-lg-p6-multi-task.md)
- [run-agent-stream-tied.md](../run-agent-stream-tied.md)
- [mcp-server/packages/agentstream/README.md](../../mcp-server/packages/agentstream/README.md)
- [charter.md](../../tied-project/working/PLAN-TIED-LANGGRAPH-ORCHESTRATION/evidence/charter.md)
