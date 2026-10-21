# Sponsor decisions — REQ-TIED_HARNESS_LANGSMITH_COMPOSE

**Recorded:** 2026-10-21  
**Session:** `/unblock` — no LangSmith keys at this time to test with

## Decision

| Blocker | Sponsor choice | Effect |
| --- | --- | --- |
| Live LangSmith API export smoke (requires `LANGSMITH_API_KEY` and egress) | **Defer live test** until keys are available; accept **no-network** CLI contract tests as sufficient proof for this REQ | Verification and close-out may proceed without a vendor API call |
| API key custody / fleet egress policy | **Unchanged** — keys remain client-owned; export stays **explicit opt-in** when keys exist | No repo secrets; no mandatory LangSmith in HTOL default path |

## Unlocked downstream

- Checklist **verification-gate** and **close_out** with stub Tracker completed (adversarial inquiry **not_applicable** at `minimal` depth).
- Traceable commit when sponsor requests (optional live smoke later is out-of-band dogfood, not a gate blocker).

## Default agent behavior

Proceed with bootstrap + enrollment tests only; document live export as operator optional follow-up when `LANGSMITH_API_KEY` is provisioned.
