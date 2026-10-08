# plan-close-out — post-program hygiene (2026-10-08)

**Sponsor:** `plan-close-out evidence + commit`  
**Scope:** Uncommitted verification follow-ups after Kaizen program EXIT (no new REQ tokens).

## Changes

| Area | Tokens / process | Notes |
| --- | --- | --- |
| Claude adherence bridge | [REQ-TIED_CLAUDE_ADHERENCE_HOOKS] | Removed temporary local debug ingest (`fetch` to 127.0.0.1) from `runClaudeAdherenceBridgeFromStdin`. |
| Adversarial inquiry MCP tests | [REQ-TIED_ADVERSARIAL_INQUIRY], two-folder layout | Composition immutability checks read `tied-project/{requirements,architecture-decisions,implementation-decisions,semantic-tokens}.yaml` instead of legacy `tied/`. |
| Vocab index validator | [PROC-VOCABULARY_INDEX] | In-document Markdown fragment links (`#heading`) no longer resolved as filesystem paths. |
| Fixtures / manifests | [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT], [REQ-REQUEST_EVIDENCE_ENVELOPE] | Refreshed adversarial-inquiry mode-b mini-project artifacts, fixture `1787603099` regression manifest, and `envelope-gap-report.v1.yaml` batch row. |
| JEV context pruning benchmark | [REQ-TIED_JEV_CONTEXT_LOG_PRUNING] | Regenerated `context-pruning-benchmark.v1.json` from latest local run output. |

## Verification

| Command | Result |
| --- | --- |
| `ruby scripts/validate_vocab_index_test.rb -n test_in_document_fragment` | pass |
| `npm test --prefix mcp-server -- adversarial-inquiry-mcp.test.ts` | pass (includes composition immutability cases) |

## Gitignore hygiene

**N/A** — no new ephemeral untracked artifacts; only tracked working/evaluation and fixture updates.

## Completion signals

- **Machine close-out:** **not_run** — no single REQ tracker or `request-evidence-envelope.v1.json` for this hygiene batch; per-REQ close_out receipts from Kaizen phases remain authoritative.
- **Process contract:** **pass** — tests run for touched surfaces; evidence recorded in this file before commit.
- **Adherence ledger:** **not_run** — no checklist slug dispositions for this pass.

## Publish

Push remains **deferred** per Kaizen program handoff unless sponsor asks.
