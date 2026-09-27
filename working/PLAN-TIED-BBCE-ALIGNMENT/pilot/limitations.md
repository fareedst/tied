# W1 pilot limitations

## Scope

- Two **read-only git replay** scenarios under `mcp-server/packages/agentstream/` only.
- No checklist field `declared_change_surface`, no plumb audit schema v2, no CI hard fail.
- Glob matcher in `change-locality-pilot.ts` is **minimal** (`*`, `**`) — sufficient for pilot maps, not a general path engine.

## Open item 1 — Slice encoding (recommendation)

| Option | Pros | Cons |
| --- | --- | --- |
| **Working-folder slice map (W1 pilot)** | Zero repo layout mandate; pairs with CITDP `declared_change_surface_ref`; easy to iterate per change ID | Not discoverable by MCP until promoted; drift vs composition inventory if not updated |
| **Repo `tied/analysis/agentstream-slice-map.yaml` (W2 candidate)** | Versioned with composition-coverage; MCP can load alongside binding inventory | Requires promotion policy; clients may omit until opt-in |
| **CITDP-only globs (no binding map)** | Minimal files | Loses binding-id traceability; weak link to composition tests |

**Recommendation for W2:** Promote a **repo-tracked slice map** under `tied/analysis/` (or extend composition-coverage with machine-readable binding → REQ + globs), while **CITDP/working Tracker** holds per-request **declared_change_surface** refs. Keep working-folder maps for experimental change IDs until calibration completes.

## Open item 2 — Longitudinal JSONL home (spike)

| Store | Schema fit | Coupling | W2 recommendation |
| --- | --- | --- | --- |
| **`plumb-audit/audit-log.jsonl`** | v1 lines are gate-centric (`preview`, `gap`, `pass`); locality dims need **schema v2** extension | Reuses opt-in gate path; risk of overloading traceability gate with BBCE metrics | **Append optional `locality` summary ref** after v2 design — do not overload v1 lines in W1 |
| **`working/{CHANGE_ID}/change-locality/*.jsonl`** | Purpose-built (`bbce-locality-event.v1`); no gate policy side effects | Per-request only until promotion | **W1 pilot write here**; W2 defines promotion to plumb-audit or quality evidence manifest |

Spike artifact: `working/PLAN-TIED-BBCE-ALIGNMENT/change-locality/pilot-metrics.jsonl` (one append line from W1 run).

**Recommendation for W2:** Dual-write spike — working JSONL for calibration, then **optional** plumb-audit v2 field `locality_summary_ref` pointing at the same machine report (avoid duplicating full path lists in audit log).

## Known false signals

- Test files (`*.test.ts`) often change without being listed on declared surface → lowers `change_locality` (expected under BBCE “record drift”, not auto-fail).
- Shared files (`paths.ts`) touch many bindings — counted as `shared_mechanism_touches`, not automatically violations until Mechanism **B** justification pass exists.
