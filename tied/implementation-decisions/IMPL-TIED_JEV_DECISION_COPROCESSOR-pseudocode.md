# [IMPL-TIED_JEV_DECISION_COPROCESSOR] [ARCH-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR]
# Summary: Optional server-side Jev /v1/decide client with state redaction, skip-without-key, and injectable fetch for tests.

Grammar-Version: v2

## Summary contract

- [IMPL-TIED_JEV_DECISION_COPROCESSOR] [ARCH-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR] How: W1 delivers HTTP client only; MCP and agentstream hooks are later waves.
- Contract:
  - INPUT: `JEV_API_KEY`, optional `JEV_API_BASE`, optional `JEV_MODEL`, `state`, `questions` map.
  - OUTPUT: `{ ok: true, response }` or `{ ok: false, skipped: true, reason }` or `{ ok: false, skipped: false, error, status? }`.
  - PRE: state redacted; no `jv_live_` substrings; bounded serialized size.
  - POST: response includes `answers` and `usage` when HTTP 2xx.
  - FAILURE_MODES: missing key; oversize state; 401/402; 502 retry once.

## REDACT_STATE

- [IMPL-TIED_JEV_DECISION_COPROCESSOR] [ARCH-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR] How: Strip `.env`, `jv_live_`, and common secret key names from serialized state before HTTP.
- procedure REDACT_STATE(state):
  - INPUT: state string | object | array
  - OUTPUT: redacted clone or string
  - EFFECTS: replace matching substrings with `[REDACTED]`

## RESOLVE_JEV_CONFIG

- [IMPL-TIED_JEV_DECISION_COPROCESSOR] [ARCH-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR] How: Read env; default base `https://jevtypesafeai.com/api` and model `jev-1.13.0`.
- procedure RESOLVE_JEV_CONFIG():
  - RETURN { apiKey, apiBase, model }

## JEV_DECIDE

- [IMPL-TIED_JEV_DECISION_COPROCESSOR] [ARCH-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR] How: Skip without key; POST JSON to `/v1/decide`; single 502 retry with backoff.
- procedure JEV_DECIDE(state, questions, config?):
  - PRE: apiKey present OR return `{ skipped: true, reason: 'no_credentials' }`
  - PRE: serialized redacted state within budget OR return `{ skipped: true, reason: 'state_too_large' }`
  - EFFECTS: POST `{ model, state, questions }` with Bearer auth
  - POST: parse JSON body on 2xx
  - FAILURE_MODES: 401/402/400 → no retry; 502 → one retry

## PARSE_ROUTING_TABLE

- [IMPL-TIED_JEV_DECISION_COPROCESSOR] [ARCH-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR] How: Parse `tied/vocab/routing.md` glossary table into `{ priority, file, keywords[] }` rows.
- procedure PARSE_ROUTING_TABLE(markdown):
  - OUTPUT: RoutingRow[]

## MATCH_KEYWORD_GLOSSARIES

- [IMPL-TIED_JEV_DECISION_COPROCESSOR] [ARCH-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR] How: Case-insensitive substring match of keyword phrases against sponsor prompt; authoritative PRELOAD baseline unchanged.
- procedure MATCH_KEYWORD_GLOSSARIES(prompt, rows):
  - OUTPUT: glossary id list

## SHADOW_VOCAB_PRELOAD

- [IMPL-TIED_JEV_DECISION_COPROCESSOR] [ARCH-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR] How: W2 logs `{ keyword_glossaries, jev_glossaries, confidence, agrees }`; Jev fan-out choice + per-glossary nouls; does not mutate agent PRELOAD.
- procedure SHADOW_VOCAB_PRELOAD(prompt, rows, config?):
  - EFFECTS: keyword_glossaries = MATCH_KEYWORD_GLOSSARIES
  - EFFECTS: optional jevDecide when apiKey present
  - OUTPUT: VocabShadowPreloadLog
  - POST: agrees when jev skipped OR jev set subset of keyword set OR equal

## ADVISE_PROMPT_TYPES

- [IMPL-TIED_JEV_DECISION_COPROCESSOR] [ARCH-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR] [REQ-PROMPT_TYPE_GLOBAL_SKILLS] How: W3 advisory only — suggest explicit prompt-type sequence and TIED applicability; never load skills.
- procedure ADVISE_PROMPT_TYPES(remainder, config?):
  - EFFECTS: heuristic_prompt_types = explicit token scan (slash, at, or word boundary)
  - EFFECTS: optional jevDecide choice + applicability + needs_linked_plan
  - OUTPUT: PromptTypeAdvisoryLog with envelope_hint lines
  - POST: suggested types prefer heuristic when explicit names present
  - CONTROL: does not invoke prompt-type-router or leaf SKILL.md

## ADVERSARIAL_TRIAGE_PILOT

- [IMPL-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_JEV_DECISION_COPROCESSOR] How: W4 fan-out nouls on trimmed criterion + pseudo-code + test excerpt; observations only.
- procedure ADVERSARIAL_TRIAGE_PILOT(cases, config?):
  - INPUT: labeled cases (optional human booleans)
  - EFFECTS: jevDecide with criterion_met, spec_gap, test_supports_claim, implementation_drift nouls
  - OUTPUT: adversarial-triage-pilot.v1 report with agreement_rate when labels present
  - FAILURE_MODES: skip without key; never append finding-ledger.jsonl

## EVALUATE_HARNESS_TOOL_CALL

- [IMPL-TIED_JEV_DECISION_COPROCESSOR] [ARCH-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR] How: W5 fail-closed gate for blocking tools (`bash`, `Shell`) when harness enabled; deterministic destructive argv block; Jev agent/risk nouls when key present.
- procedure EVALUATE_HARNESS_TOOL_CALL(input, harness, config?):
  - PRE: harness.enabled OR return allow / harness_disabled
  - PRE: tool in blocking set OR return allow / non_blocking_tool
  - PRE: destructive argv pattern OR return block / destructive_pattern
  - PRE: harness.hasApiKey OR (blockWhenUnavailable → block / jev_unavailable_fail_closed)
  - EFFECTS: jevDecide high_risk + needs_confirm nouls
  - POST: high_risk ≥ τ_block → block; needs_confirm ≥ τ_confirm → confirm; else allow
  - FAILURE_MODES: Jev error → fail-closed block when blockWhenUnavailable

## ADVISE_CONTEXT_FILTER

- [IMPL-TIED_JEV_DECISION_COPROCESSOR] [ARCH-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR] How: W5 advisory keep/truncate/drop for agentstream context bloat; never mutates context without caller.
- procedure ADVISE_CONTEXT_FILTER(taskSummary, contextItem, harness, config?):
  - PRE: harness.enabled OR keep / harness_disabled
  - PRE: harness.hasApiKey OR keep / no_jev_key_advisory_only
  - EFFECTS: jevDecide drop_item + truncate_item nouls
  - OUTPUT: { action: keep | truncate | drop, reason }

## RUN_JEV_HARNESS_PREFLIGHT

- [IMPL-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR] How: Agentstream hook after DAE gate; opt-in via AGENTSTREAM_JEV_HARNESS or jev.agentstream_harness; bootstrap diagnostics only on dry-run; live smoke when dist/jev built and key present.
- procedure RUN_JEV_HARNESS_PREFLIGHT(cfg):
  - CONTROL: compose after tiedpreflight and DAE gate; does not replace checklist gates
  - OUTPUT: stderr DEBUG/DIAGNOSTIC lines; exitCode 0 (non-blocking preflight)
