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

- [IMPL-TIED_JEV_DECISION_COPROCESSOR] [ARCH-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR] How: Parse `tied-project/vocab/routing.md` glossary table into `{ priority, file, keywords[] }` rows.
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
  - FAILURE_MODES: never sets checklist `allowed` or substitutes four inquiry activation artifacts (W6d)

## APPLY_TIEBREAK_ADVISORY_DISPLAY

- [IMPL-TIED_JEV_DECISION_COPROCESSOR] [ARCH-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR] How: W6d display-only tiebreak when `shadow_mode: tiebreak`, ≥2 distinct keyword glossary ids, readiness `ready`, and parsed confidence ≥ TIEBREAK_CONFIDENCE_MIN (0.90); never mutates keyword_glossaries.
- procedure APPLY_TIEBREAK_ADVISORY_DISPLAY(input):
  - PRE: input.shadow_mode is `tiebreak` OR return tiebreak_active false with no advisory fields
  - PRE: input.readiness is `ready` AND distinct keyword_glossary count ≥ 2 AND confidence ≥ 0.90
  - PRE: jev_glossaries non-empty for advisory_primary selection
  - OUTPUT: advisory_primary (first Jev-ranked glossary id), optional recommended_glossary_order, tiebreak_active true, shadow_mode tiebreak
  - POST: keyword_glossaries unchanged vs advisory run on identical inputs
  - FAILURE_MODES: gate failure → omit tiebreak fields or tiebreak_active false; never error skill path

## RUN_PLAN_SKILLS_TRIAGE_MCP

- [IMPL-TIED_JEV_DECISION_COPROCESSOR] [ARCH-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR] How: W6d MCP adapter over ADVERSARIAL_TRIAGE_PILOT; inline cases JSON or contained file path under working/; evidence at plan-skills tree only.
- procedure RUN_PLAN_SKILLS_TRIAGE_MCP(input):
  - INPUT: cases[] OR cases_path (working-relative containment); request_token; pre_implementation_gate_passed must be true
  - PRE: NOT pre_implementation_gate_passed → structured refusal `gate_ordering_violation` (no vendor call)
  - PRE: resolvePlanSkillsConfig enabled + key OR skip observations without throw
  - PRE: Zod max cases bound; invalid token/path → error field
  - EFFECTS: CALL ADVERSARIAL_TRIAGE_PILOT with timeout-wrapped fetch
  - POST: record_evidence + valid token → write adversarial-triage-pilot.v1.json under working/{token}/jev/plan-skills/{run_id}/
  - FAILURE_MODES: never gate authority; never finding-ledger writes

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

- [IMPL-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR] How: Agentstream hook after DAE gate; opt-in via AGENTSTREAM_JEV_HARNESS or jev.agentstream_harness; **harness dist gate** hard-stops when `mcp-server/dist/jev/harness-tool-guard.js` is missing (sponsor **2C** / **JEV-HARNESS-DIST-2C**); live smoke when dist built and key present; injected live deps may bypass dist check for unit smoke only.
- procedure RUN_JEV_HARNESS_PREFLIGHT(cfg):
  - CONTROL: compose after tiedpreflight and DAE gate; does not replace checklist gates
  - PRE: harness enabled OR return exitCode 0 empty stderr
  - PRE: isHarnessDistBuilt(projectRoot) OR return exitCode 1 + formatHarnessDistMissingMessage (dry-run / sync always)
  - EFFECTS: emit bootstrap DEBUG/DIAGNOSTIC lines (key missing → fail-closed tool policy note)
  - POST: exitCode 0 when harness disabled OR dist present; exitCode 1 when harness enabled and dist missing
  - FAILURE_MODES: missing dist → exit 1 (missing-dist hard stop); never auto-build dist
  - OUTPUT: stderr lines; exitCode 0 | 1

- procedure RUN_JEV_HARNESS_PREFLIGHT_LIVE(cfg, deps?):
  - PRE: harness enabled OR return exitCode 0
  - PRE: deps.evaluateSampleTool OR deps.adviseSampleContext → skip dist hard-stop (injected deps bypass / T-CFG only)
  - PRE: ELSE isHarnessDistBuilt OR return exitCode 1 + formatHarnessDistMissingMessage
  - EFFECTS: optional live smoke via dist module or injected deps
  - POST: exitCode 0 on success or deps smoke; exitCode 1 on missing-dist hard stop
  - FAILURE_MODES: missing dist without deps → exit 1; never bypass checklist gates

## RUN_JEV_LIVE_TOOL_GATE

- [IMPL-TIED_JEV_DECISION_COPROCESSOR] [ARCH-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR] How: W5 residual — parse stream-json tool proposals in live executor; CALL EVALUATE_HARNESS_TOOL_CALL before turn proceeds; SIGTERM agent subprocess on block; live-executor **dist belt** aborts when harness enabled and gate is null after create (defense in depth behind preflight).
- procedure RUN_JEV_LIVE_TOOL_GATE(stream_line, cfg, gate):
  - PRE: jev harness enabled OR no-op
  - PRE: parseToolProposalFromStreamObject OR continue
  - EFFECTS: evaluateHarnessToolCall for blocking tools only (guard internal)
  - POST: block → abort turn exit 1 + DIAGNOSTIC; confirm/allow → stderr advisory only (CI / CONFIRM_STRICT may abort on confirm)
  - FAILURE_MODES: dist/jev missing → createJevLiveToolGate returns null; RUN_JEV_HARNESS_PREFLIGHT(_LIVE) and live-executor belt must exit 1 before turns (missing-dist hard stop); never bypass checklist gates

- procedure REQUIRE_JEV_LIVE_GATE_WHEN_HARNESS_ENABLED(cfg, gate):
  - PRE: harness enabled AND gate is null → return abort exitCode 1 + formatHarnessDistMissingMessage
  - POST: else continue live bind

## RESOLVE_PLAN_SKILLS_CONFIG

- [IMPL-TIED_JEV_DECISION_COPROCESSOR] [ARCH-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR] [REQ-PROMPT_TYPE_GLOBAL_SKILLS] How: W6 opt-in `jev.plan_skills` for explicit plan skills only; env override precedes `tied-project/config.yaml`; never stores API key.
- procedure RESOLVE_PLAN_SKILLS_CONFIG(project_root, env?):
  - INPUT: `TIED_JEV_PLAN_SKILLS` when set → `1`/`true` on, `0`/`false` off, else off + `invalid_env_override`
  - INPUT: else strict boolean `jev.plan_skills: true` in `tied-project/config.yaml` → on; malformed → off + `invalid_plan_skills_flag`
  - INPUT: `JEV_PLAN_SKILLS_TIMEOUT_MS` positive ≤60000 else default 3000 + diagnostic
  - OUTPUT: `{ enabled, enabled_source, timeout_ms, diagnostics[] }`
  - POST: independent from `jev.agentstream_harness`

## ASSESS_JEV_SERVICE_READINESS

- [IMPL-TIED_JEV_DECISION_COPROCESSOR] [ARCH-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR] How: W6 per-call readiness from config + key + bounded `jevDecide` result; key alone is not `ready`.
- procedure ASSESS_JEV_SERVICE_READINESS(config, key_present, decide_result?, timed_out?):
  - PRE: NOT config.enabled → `disabled` (no vendor call)
  - PRE: config.enabled AND NOT key_present → `configured_no_credentials` (no vendor call)
  - PRE: skipped `state_too_large` → `locally_skipped`
  - PRE: timed_out OR `{ok:false,skipped:false}` OR malformed answers → `configured_unreachable`
  - POST: `{ok:true}` with parseable answers → `ready`
  - OUTPUT: readiness enum + optional `failure_class`, `skip_reason`

## LOAD_MERGED_ROUTING_BASELINE

- [IMPL-TIED_JEV_DECISION_COPROCESSOR] [ARCH-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR] How: W6 client then methodology routing rows; de-dupe by glossary basename; first-seen wins; shared by keyword PRELOAD parity and shadow.
- procedure LOAD_MERGED_ROUTING_BASELINE(project_root, tied_base_path):
  - EFFECTS: read client `tied-project/vocab/routing.md` if present else empty
  - EFFECTS: read methodology `tied-bundle/vocab/routing.md`; missing → diagnostic `methodology_routing_missing`
  - EFFECTS: PARSE_ROUTING_TABLE each; merge client then methodology; de-dupe by glossaryIdFromFile
  - OUTPUT: `{ rows: RoutingRow[], diagnostics[] }`

## RUN_PLAN_SKILLS_SHADOW

- [IMPL-TIED_JEV_DECISION_COPROCESSOR] [ARCH-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR] [REQ-PROMPT_TYPE_GLOBAL_SKILLS] How: W6 advisory shadow after keyword PRELOAD; timeout-wrapped `jevDecide`; optional evidence under `working/{token}/jev/plan-skills/{run_id}/`; never mutates PRELOAD or gates.
- procedure RUN_PLAN_SKILLS_SHADOW(input):
  - INPUT: `skill` enum (four plan skills); `prompt` slice 4000; optional `plan_excerpt` slice 8000
  - INPUT: optional `shadow_mode` enum `advisory` (default) | `tiebreak` (W6d display-only)
  - INPUT: optional `request_token` must pass isValidWorkingRequestToken for evidence
  - PRE: CALL RESOLVE_PLAN_SKILLS_CONFIG
  - PRE: CALL LOAD_MERGED_ROUTING_BASELINE → keyword_glossaries = MATCH_KEYWORD_GLOSSARIES
  - PRE: readiness NOT `ready` → return jev-plan-skills-vocab-shadow.v1 without vendor call when disabled/no key
  - EFFECTS: when `ready`, CALL SHADOW_VOCAB_PRELOAD logic on merged rows with timeout wrapper (no extra 502 retries)
  - EFFECTS: when shadow_mode tiebreak, CALL APPLY_TIEBREAK_ADVISORY_DISPLAY on parsed jev_glossaries + confidence (display fields only)
  - POST: `agrees` = vocabShadowAgrees; `service_reachable` only when readiness `ready`
  - POST: `record_evidence` + valid token → write `vocab-shadow.v1.json` under contained path only
  - FAILURE_MODES: catch all errors; redact excerpt ≤500; never throw to skill prose
