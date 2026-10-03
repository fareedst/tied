# Conversation analysis tools

**Tokens:** `[REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]`, `[PROC-AGENT_REQ_CHECKLIST]`

Wave 7-D1 adds executable transcript scoring for conversation-adherence hypotheses. Reports are **read-only** with `proof_boundary: transcript_observation_only` — they do **not** substitute for machine close-out, gate receipts, or envelope validate.

## Transcript scoring CLI

From repository root after `npm run build --prefix mcp-server` (backfill/batch deps only; scorer is pure Node):

```bash
node scripts/conversation-adherence-score.mjs \
  --transcript-dir ~/.cursor/projects/Users-fareed-Documents-dev-chatgpt-stdd/agent-transcripts \
  --project-root /path/to/repo \
  --request-token REQ-EXAMPLE \
  --yaml-out working/evaluation/conversation-adherence-report.v1.yaml
```

Output schema: `conversation-adherence-report.v1.yaml` with `sessions_scored`, aggregate `dimensions[]` (numerator, denominator, proof_boundary), and per-session rows.

### Seven hypothesis dimensions

| ID | Hypothesis |
|---|---|
| `early_exit_at_gate` | Session ends after first gate `allowed: true` without envelope validate or close-out sync |
| `call_mention_without_execution` | Assistant prose mentions `CALL sub-close-out-evidence-sync` without matching tool/script |
| `completion_verb_without_artifacts` | Completion verbs without envelope + manifest on disk at session end |
| `depth_tier_avoidance` | `depth_tier: minimal` when integrated-scope triggers appear in transcript |
| `build_without_closeout_skill` | `build-plan` prompt-type without `plan-close-out` / promote / amend arc |
| `dual_write_turn_shape` | Tracker `execution_evidence.completed` shape without disposition sync |
| `stdout_without_manifest` | Test stdout quoted without manifest path mention |

## Related operator tools

- Envelope backfill batch: `scripts/backfill-client-envelopes.mjs` — see [request-evidence-envelope.md](./request-evidence-envelope.md)
- Cohort gap report: `npm run request-evidence-envelope-batch-collect`
- Hook log analysis: `scripts/extract_repeated_tool_calls.rb`, `scripts/analyze_hook_log.rb`

See also [evidence-collection-conversation-patterns.md](../../docs/evidence-collection-conversation-patterns.md) for cohort analysis and Wave 7 acceptance criteria.
