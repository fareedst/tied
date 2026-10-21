# Close-out handoff — REQ-TIED_HARNESS_LANGSMITH_COMPOSE

**Status:** Implemented; **gates clean** after sponsor `/unblock` (no LangSmith keys for live API).

## Sponsor unblock (2026-10-21)

- **Decision:** Defer live LangSmith API smoke; **no-network** CLI contract tests are sufficient proof.
- **Record:** [sponsor-decisions-evidence.md](./sponsor-decisions-evidence.md)

## Delivered

- `@harness-trace-langsmith-compose` skill + optional `export-langsmith-traces.mjs`
- HTOL guide **Optional LangSmith client compose** section
- LangChain comparison Phase 4 row + non-adoption clarification
- `PROMPT_TYPE_LEAF_IDS` + bootstrap manifest + contract tests

## Tests (green, no vendor API)

- `node --test tools/bootstrap/lib/harness-trace-langsmith-compose-skill.test.mjs tools/bootstrap/lib/export-langsmith-traces.test.mjs tools/bootstrap/lib/harness-trace-observation-loop-doc.test.mjs`
- `pseudocode_validate` gate_mode ok for IMPL-TIED_HARNESS_LANGSMITH_COMPOSE
- `tied_validate_consistency` ok

## Gates

- **verification:** [verification-2026-10-21T14-10-35-867Z.json](../gates/verification-2026-10-21T14-10-35-867Z.json) — **allowed: true**
- **close_out:** [close_out-2026-10-21T14-10-41-834Z.json](../gates/close_out-2026-10-21T14-10-41-834Z.json) — **allowed: true**
- Tracker: [checklist-tracker.yaml](../checklist-tracker.yaml) — `close_out_complete`

## Deferred (not blockers)

- **Live LangSmith export** when `LANGSMITH_API_KEY` is provisioned (operator dogfood)
- **traceable-commit** until sponsor requests git commit
- Harbor/Daytona adapters

## Costly choices (operations, unchanged)

- Fleet egress to `api.smith.langchain.com` when export is used
- API key custody and rotation
