# W1 pilot definition of done

| # | Criterion | Evidence | Status |
| --- | --- | --- | --- |
| 1 | Working-folder slice map for agentstream bindings | `pilot/slice-map.yaml` | done |
| 2 | Declared change surface v1 for ≥1 scripted case | `declared-change-surface-claude-live.v1.yaml` (+ wide scenario) | done |
| 3 | Read-only git replay vs declared surface | `locality-run.json` | done |
| 4 | BBCE metrics: locality, unexpected, shared, crossings | `change-locality-pilot.ts` + `locality-run.json` | done |
| 5 | Unit tests (TDD) for classifier + git range helper | `change-locality-pilot.test.ts` | done |
| 6 | Slice encoding + JSONL storage recommendations | `limitations.md` | done |
| 7 | Integrated adversarial inquiry artifacts | `../adversarial-inquiry/` (+ `phase-verification/`, `phase-pre_implementation/`) | done |
| 8 | Gate receipts (pre_implementation, verification) | `../gates/` | done (verification gate; close_out deferred) |
| 9 | CITDP + feature plan W1 status | CITDP + `docs/tied-bbce-alignment-plan.md` | done |
| 10 | Proof boundary documented | baseline, limitations, reports | done |

**Explicitly out of scope:** checklist mandate, plumb v2, Mechanisms B/C, CI hard fail, methodology YAML edits.
