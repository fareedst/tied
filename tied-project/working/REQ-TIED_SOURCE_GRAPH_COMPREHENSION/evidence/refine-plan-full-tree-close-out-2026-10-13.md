# Refine evidence — full-tree plan-close-out (2026-10-13)

**Prompt type:** plan-close-out  
**Linked plan:** `full-tree_plan-close-out_7b411441.plan.md`  
**Invocation remainder:** git-hygiene traceable-commit

## Partition D (methodology bundle)

- **Action:** Reverted unstaged `tied-bundle/{requirements,architecture-decisions,implementation-decisions,semantic-tokens}.yaml` and `REQ-METHODOLOGY-LEARNING-COHORT-EXPORT.yaml` — quote/reflow churn only; no substantive delta retained.
- **Rationale:** Plan default — avoid ~2k-line merge noise; QMM promotion remains separate.

## Partition A (index path LEAP)

- Default index rel: `tied-bundle/reports/source-graph/source-graph-index.v1.json`
- Updated: working + persisted CITDP, PLAN.md, BFIE matrix row 4
- Fixture: golden index under `mcp-server/test/fixtures/source-graph/mini-repo/tied-bundle/reports/source-graph/` (replaces `.tied/…` delete)

## Gates replayed

| REQ | Phase | run_id | allowed | envelope blocking |
| --- | --- | --- | --- | --- |
| SGC | verification | `sgc-verification-2026-10-13-index-path` | yes | 0 |
| SGC | close_out | `sgc-closeout-2026-10-13` | yes | 0 |
| BFIE | close_out | (wrapper replay) | yes | 0 |

## SC-FTCO status

| ID | Status |
| --- | --- |
| SC-FTCO-A | done — no `.tied/source-graph` authority strings remain |
| SC-FTCO-B | done — fixture path + tests green |
| SC-FTCO-C | done — see `closeout-run-close-out-gates.json` |
| SC-FTCO-D | done — dogfood evidence staged |
| SC-FTCO-E | done — bundle reverted; `tied_validate_consistency` index valid |
