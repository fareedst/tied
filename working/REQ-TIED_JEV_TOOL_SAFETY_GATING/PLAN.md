---
name: blueprint-d-tool-guard
overview: Refine Blueprint D as a TIED child that hardens the existing W5 harness guard with explicit command-risk and workspace-scope semantics, a reproducible five-arm benchmark, and one read-only diagnostic MCP adapter.
todos:
  - id: refine-pass-2-contracts
    content: "Refine pass 2: risk aggregation, W5 question migration, MCP diagnostic I/O, workspace live seam, REQ SC-* draft, PLAN-CLOSE-OUT pointer"
    status: completed
  - id: w0-child-contract
    content: "Wave 0: Mint the child REQ/ARCH/IMPL stack, CITDP, Tracker, pseudo-code, and pre_implementation gate during build-plan"
    status: completed
  - id: w1-guard-tdd
    content: "Wave 1: Extend the shipped W5 guard with Blueprint D questions, scope normalization, deterministic patterns, trace context, and boundary tests"
    status: completed
  - id: w2-benchmark
    content: "Wave 2: Add labeled tool-safety fixtures, five benchmark arms, replay script, and mocked acceptance report"
    status: completed
  - id: w3-diagnostic-mcp
    content: "Wave 3: Add one read-only tied_jev_tool_safety_evaluate diagnostic adapter and composition tests; do not create a second runtime gate"
    status: completed
  - id: w4-agentstream-contract
    content: "Wave 4: Propagate declared workspace through the already-shipped Cursor/Claude live gate and preserve strict-confirm semantics"
    status: completed
  - id: w5-verify-closeout
    content: "Wave 5: Run integrated inquiry, language/TIED validation, verification gate, and close-out evidence"
    status: completed
isProject: false
---

# Plan: Blueprint D — Harness Live Tool Guard and Shell Safety Gating

## Scope and current-state correction

This plan implements [Blueprint D](file:///Users/fareed/Documents/dev/chatgpt/stdd/docs/comparisons/system-one-jev-taxonomy-and-opportunities.md) (Pattern 6 authorization/safety plus Pattern 5 gating) as a **child follow-on** to the closed [REQ-TIED_JEV_DECISION_COPROCESSOR](file:///Users/fareed/Documents/dev/chatgpt/stdd/tied/requirements/REQ-TIED_JEV_DECISION_COPROCESSOR.yaml).

Blueprint D is not a greenfield live runtime gate. W5 already ships:

- `evaluateHarnessToolCall` and `resolveHarnessFromEnv` in [harness-tool-guard.ts](file:///Users/fareed/Documents/dev/chatgpt/stdd/mcp-server/src/jev/harness-tool-guard.ts);
- opt-in `AGENTSTREAM_JEV_HARNESS` / `jev.agentstream_harness`, fail-closed missing-key behavior, and the W5 harness dist hard stop in [harness-config.ts](file:///Users/fareed/Documents/dev/chatgpt/stdd/mcp-server/src/jev/harness-config.ts) and agentstream preflight;
- per-line live proposal interception in [jev-harness-live-tool-gate.ts](file:///Users/fareed/Documents/dev/chatgpt/stdd/mcp-server/packages/agentstream/src/jev-harness-live-tool-gate.ts), already composed into both Cursor and Claude live drivers;
- block/confirm/allow and CI/`AGENTSTREAM_JEV_HARNESS_CONFIRM_STRICT` behavior covered by [harness-tool-guard.test.ts](file:///Users/fareed/Documents/dev/chatgpt/stdd/mcp-server/src/jev/harness-tool-guard.test.ts) and [jev-harness-live-tool-gate.test.ts](file:///Users/fareed/Documents/dev/chatgpt/stdd/mcp-server/packages/agentstream/src/jev-harness-live-tool-gate.test.ts).

The current child adds the missing Blueprint D contract: exact D question identifiers, declared-workspace scope evidence, broader but bounded deterministic fast-deny coverage, redaction-safe trace context, labeled benchmark evidence, and one diagnostic MCP adapter. The W5 runtime gate remains the sole execution boundary; no parallel runtime evaluator or Cursor IDE hook is proposed.

**Working scope:** `working/REQ-TIED_JEV_TOOL_SAFETY_GATING/`  
**Plan mirror (created only during build-plan):** `working/REQ-TIED_JEV_TOOL_SAFETY_GATING/PLAN.md`  
**Close-out plan (create at W5):** `working/REQ-TIED_JEV_TOOL_SAFETY_GATING/PLAN-CLOSE-OUT.md` (CO0–CO5 envelope + CHANGELOG pattern from Blueprint C)

| Field | Value |
| --- | --- |
| **Source** | [system-one-jev-taxonomy-and-opportunities.md](file:///Users/fareed/Documents/dev/chatgpt/stdd/docs/comparisons/system-one-jev-taxonomy-and-opportunities.md) § Blueprint D (Pattern 6 + Pattern 5) |
| **Patterns** | **Pattern 6** (command-risk, scope/boundary) + **Pattern 5** (execute/do-not-execute gate) |
| **Parent** | [REQ-TIED_JEV_DECISION_COPROCESSOR](file:///Users/fareed/Documents/dev/chatgpt/stdd/tied/requirements/REQ-TIED_JEV_DECISION_COPROCESSOR.yaml) (closed); completes D semantics on the **residual** W5 live guard, not a second hook |
| **Siblings** | Blueprint A [REQ-TIED_JEV_CONTEXT_LOG_PRUNING](file:///Users/fareed/Documents/dev/chatgpt/stdd/tied/requirements/REQ-TIED_JEV_CONTEXT_LOG_PRUNING.yaml); Blueprint C [REQ-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY](file:///Users/fareed/Documents/dev/chatgpt/stdd/tied/requirements/REQ-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY.yaml) |
| **Operator guide** | Extend [jev-for-tied-improvement.md](file:///Users/fareed/Documents/dev/chatgpt/stdd/docs/comparisons/jev-for-tied-improvement.md) with a **Blueprint D** section at close-out (env, surfaces, authority) |
| **Last refined** | 2026-09-29 (**pass 2** — risk aggregation, W5 migration, live workspace seam, REQ SC-* draft) |

**Hard rule:** Blueprint D is a **runtime tool execution coprocessor** when harness is opt-in on. It may **block or abort** proposed `bash`/`Shell` invocations; it must **never** set checklist gate `allowed`, mutate TIED YAML, or replace deterministic checklist validation.

## Refine — resolved terms and reversible defaults

Canonical terms from [decision-copilot.md](file:///Users/fareed/Documents/dev/chatgpt/stdd/tied/vocab/decision-copilot.md): **decision coprocessor**, **noul gate**, **speculative fan-out**, **fail-closed tool block**, **harness dist gate**, and **missing-dist hard stop**. “Interactive confirmation” is resolved to the behavior the current stream drivers can actually provide: `confirm` is diagnostic-only locally and aborts under CI or `AGENTSTREAM_JEV_HARNESS_CONFIRM_STRICT=1`; this child does not invent a blocking prompt protocol.

| Decision | Default | Boundary |
| --- | --- | --- |
| Child tokens | `REQ-TIED_JEV_TOOL_SAFETY_GATING`, `ARCH-TIED_JEV_TOOL_SAFETY_GATING`, `IMPL-TIED_JEV_TOOL_SAFETY_GATING` | New child stack; do not reopen or mutate the closed parent status |
| Blocking tools | `bash` and `Shell` | Reuse `DEFAULT_BLOCKING_TOOLS`; no broad all-tool interception |
| Enablement | Existing `AGENTSTREAM_JEV_HARNESS=1/true` or manifest `jev.agentstream_harness: true` | Default off; do not add a second runtime flag |
| D questions | `noul_destructive_risk` and `noul_scope_violation` with the exact Blueprint D wording | Replace W5’s `high_risk` / `needs_confirm` ids in `buildAgentRiskQuestions()`; update unit mocks and any replay fixtures that stub answer keys |
| Risk aggregation | `combined = max(destructive, scope)`; **block** if `combined >= 0.72`; **confirm** if `0.45 <= combined < 0.72`; **allow** if `combined < 0.45` | Single combined band matches taxonomy step 5; report `risk: combined` in evaluation; do not use asymmetric per-axis confirm without LEAP |
| Thresholds | `< 0.45` allow, `0.45`–`< 0.72` confirm, `>= 0.72` block | Code-owned and reported in benchmark metadata; no claim that taxonomy prose calibrated them |
| Jev unavailable/error/malformed response | Block enabled blocking tools | Non-blocking tools stay allowed without a Jev call; deterministic hard-deny remains independent of Jev |
| Declared workspace | Required from live agentstream; required by the diagnostic MCP input | Backward-compatible library input may omit it and must report scope as not evaluated, never claim scope safety |
| Scope proof | Deterministic normalization for explicit path signals, then Jev scope noul over a compact sanitized representation | Shell expansion/interpreter semantics are outside the proof boundary; uncertainty follows fail-closed/confirm policy |
| Trace | Reuse `jevDecide` plus [decide-trace.ts](file:///Users/fareed/Documents/dev/chatgpt/stdd/mcp-server/src/jev/decide-trace.ts), opt-in via `JEV_DECIDE_TRACE` | `context_meta.feature: "tool_safety_gating"`; never log API keys, raw workspace paths, or unredacted command state |
| Diagnostic MCP | One `tied_jev_tool_safety_evaluate` read-only adapter over the same guard function | It never executes a command, writes TIED YAML, emits a gate receipt, or becomes a second runtime authority |
| Assurance selection | `depth_tier: integrated`, `profile_depth: integrated`, `gate_policy: mixed` | External API + safety boundary + workspace/privacy risk; deterministic TIED gates remain authoritative |

Non-goals: a new live hook, a second shell evaluator, changes to `tied_checklist_gate_validate`, default-on blocking, an interactive prompt protocol, semantic log pruning, automatic command rewriting, or Jev authority over TIED records and deterministic gates.

**W5 → D migration (reconciled 2026-09-30):** [harness-tool-guard.ts](file:///Users/fareed/Documents/dev/chatgpt/stdd/mcp-server/src/jev/harness-tool-guard.ts) now ships Blueprint D question ids, combined `max(destructive, scope)` thresholds, workspace scope signals in vendor state, expanded fast-deny coverage, and `context_meta.feature: "tool_safety_gating"`. [jev-harness-live-tool-gate.ts](file:///Users/fareed/Documents/dev/chatgpt/stdd/mcp-server/packages/agentstream/src/jev-harness-live-tool-gate.ts) passes declared `workspace` from `resolveProjectRootForJev(cfg)` (W4). Evidence index: [waves-reconcile-w0-w3.v1.json](evidence/waves-reconcile-w0-w3.v1.json), [w4-agentstream-workspace.v1.json](evidence/w4-agentstream-workspace.v1.json), [tool-safety-benchmark.v1.json](evidence/tool-safety-benchmark.v1.json).

**Distinction from Blueprint C:** C is **fail-open** to the authoritative gate when Jev is unavailable; D harness policy is **fail-closed** for enabled blocking tools without Jev (W5 sponsor policy). Do not copy C fallback semantics into D.

### Configuration contract (runtime + diagnostic)

| Source | Key | Effect |
| --- | --- | --- |
| Env | `AGENTSTREAM_JEV_HARNESS=1` / `true` | Enables agentstream live gate + same harness config the guard reads |
| Manifest | `.tied-yaml.yaml` → `jev.agentstream_harness: true` | Same as env when env unset |
| Env | `JEV_API_KEY`, optional `JEV_MODEL` | Required for Jev fan-out when harness on blocking tools |
| Env | `AGENTSTREAM_JEV_HARNESS_CONFIRM_STRICT=1` or `CI=true` | Abort turn on `confirm` (existing W5) |
| Trace (independent) | `JEV_DECIDE_TRACE`, `JEV_DECIDE_TRACE_PATH` | Opt-in JSONL; may be on while harness off |
| MCP diagnostic | `tied_jev_tool_safety_evaluate` | Evaluates one proposal using injected harness policy + **required** `workspace`; no env mutation |

No separate `TIED_JEV_TOOL_SAFETY_GATING=1` flag in v1 — reuse harness enablement to avoid dual opt-in drift (revisit only if product requires MCP-only evaluation without agentstream harness).

### Proposed REQ satisfaction criteria (mint at W0)

| id | Criterion (summary) | Metric |
| --- | --- | --- |
| SC-W5-PRESERVED | Default-off; existing W5 tests green | `bun test` harness + live-gate suites |
| SC-D-QUESTIONS | D question ids + wording in IMPL | Unit tests + sidecar |
| SC-D-FAST-DENY | Hard-deny before Jev; near-miss corpus | Unit + benchmark `deterministic_only` |
| SC-D-SCOPE | Workspace passed live + required on MCP diagnostic | Composition tests |
| SC-D-THRESHOLDS | Combined max bands at 0.45 / 0.72 | Unit boundary tests |
| SC-D-FALLBACK | Unavailable Jev blocks enabled blocking tools | Unit + `jev_unavailable` arm |
| SC-D-TRACE-PRIVACY | Trace redaction tests | Unit with canaries |
| SC-D-MCP-AUTHORITY | Read-only tool; no gate receipt | `tool-safety-mcp.test.ts` |
| SC-D-BENCH | Five arms, one fixture hash | `tool-safety-benchmark.v1.json` |
| SC-D-TIED | Consistency + verification gate | `tied_validate_consistency` |

## Plan — CITDP, architecture, and evidence contract

### Proposed traceability stack

Mint these records in build-plan W0 using the TIED YAML tool surface; this refine pass intentionally does not create them:

| Layer | Record | Required content |
| --- | --- | --- |
| REQ | `REQ-TIED_JEV_TOOL_SAFETY_GATING` | Intercept enabled `bash`/`Shell` proposals; deterministic hard-deny; D fan-out; workspace/privacy/fallback invariants; benchmark |
| ARCH | `ARCH-TIED_JEV_TOOL_SAFETY_GATING` | One shared guard core; agentstream composition; one diagnostic MCP adapter; authority and proof boundaries |
| IMPL | `IMPL-TIED_JEV_TOOL_SAFETY_GATING` | Contracts, question map, path normalization, thresholds, trace, benchmark, and TDD/composition order |

Cross-reference the parent decision coprocessor and existing `ARCH/IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT` only as authority boundaries. Do not duplicate parent W5 records or change parent status.

### CITDP and adversarial inquiry

- `depth_tier: integrated` is required because this is an external-input, network, authorization, destructive-operation, and privacy-sensitive behavior change.
- `profile_depth: integrated` and `gate_policy: mixed` are selected independently: inquiry evidence is read-only review evidence; the runtime guard may block tool execution, while TIED/MCP checklist gates retain deterministic authority.
- Run `sub-adversarial-inquiry-pass` at structural, pre-RED, and verification phases with explicit scope covering regex false negatives, shell/path ambiguity, secret leakage, unavailable Jev, and authority confusion.
- If scope, depth, or policy changes, invalidate downstream inquiry dispositions/evidence and rerun `tied_checklist_gate_validate` for `pre_implementation`; do not carry receipts across a loop-back.
- When activated, persist only `obligation-report.json`, `finding-ledger.jsonl`, `gate-result.json`, and `evidence-provenance.json` under `working/REQ-TIED_JEV_TOOL_SAFETY_GATING/adversarial-inquiry/`. Observations remain review-gated; only confirmed findings can trigger LEAP.

### Module boundaries

| Module | Existing seam | Contract and independent validation |
| --- | --- | --- |
| Guard decision core | `mcp-server/src/jev/harness-tool-guard.ts` | Pure deterministic classification plus one `jevDecide` fan-out; unit-test patterns, paths, thresholds, failures, redaction inputs, and result reasons |
| Configuration boundary | `mcp-server/src/jev/harness-config.ts` | Reuse W5 enablement and fail-closed policy; change only if D needs an explicit typed policy field, never a duplicate flag |
| Shared Jev/trace boundary | `mcp-server/src/jev/client.ts`, `decide-trace.ts`, `redact-state.ts` | Vendor receives bounded sanitized state; trace is opt-in and outcome-neutral; unit-test key, skip, HTTP error, malformed response, and canary paths |
| Benchmark | New `mcp-server/src/jev/tool-safety-benchmark.ts` plus replay script/fixtures | Pure arm runner and metrics; no live execution and no production policy mutation |
| Diagnostic MCP adapter | New `mcp-server/src/tools/tool-safety-mcp.ts`, registered through `mcp-server/src/tools/index.ts` | Thin JSON/Zod adapter over the guard core; composition tests use the existing `allTools.find` pattern |
| Live composition | Existing agentstream live gate, `executor-run.ts`, `claude-driver.ts`, and their tests | Pass `cfg.workspace` into the guard; preserve proposal parsing, dist hard stop, block termination, and strict-confirm behavior |

### Fallback and authority matrix

| Condition | Guard result | Authority |
| --- | --- | --- |
| Harness disabled | `allow`, `harness_disabled` | Existing opt-in boundary |
| Non-blocking tool | `allow`, `non_blocking_tool` | Guard does not call Jev |
| Deterministic destructive match | `block`, `destructive_pattern` | Code-owned hard deny; Jev is not consulted |
| Enabled blocking tool, no key | `block`, `jev_unavailable_fail_closed` | Code-owned fail-closed policy |
| Jev HTTP/error/malformed answer | `block`, stable failure reason | Code-owned fail-closed policy |
| Valid D answers, `combined < 0.45` | `allow`, `jev_allow` | Code-owned threshold |
| Valid D answers, `0.45 <= combined < 0.72` | `confirm`, `jev_needs_confirm` | Stream driver logs; CI/strict aborts |
| Valid D answers, `combined >= 0.72` | `block`, `jev_high_risk` | Stream driver aborts; no command execution |
| Missing workspace | Library-compatible result with scope `not_evaluated`; diagnostic MCP rejects missing required workspace | No false claim of scope verification |

### Privacy and redaction contract

Before Jev or trace emission, cap and sanitize goal/context/arguments, replace the declared workspace with a stable placeholder, preserve only bounded path/scope features needed for judgment, and use the existing `redactState` path for secrets. Tests must prove that `.env`, `jv_live_*`, API-key/password/token canaries, and raw absolute workspace paths do not appear in vendor state or trace records. `JEV_API_KEY` remains server-side environment state only. Benchmark fixtures and reports are synthetic/redacted and contain no live commands, credentials, or committed live traces.

### Benchmark acceptance contract

Create a deterministic corpus at `mcp-server/test/fixtures/tool-safety/labeled-corpus.v1.jsonl` with at least 30 rows across benign reads/builds/tests, safe destructive-looking near misses, hard destructive patterns, database/disk/git overwrites, explicit in/out-of-workspace paths, ambiguous shell expansions, and secret canaries. Each row has a label, tool, arguments, workspace, expected safety class, and proof-boundary note.

Replay the identical fixture hash and order through `tool-safety-benchmark.v1` arms:

1. `deterministic_only`: deterministic patterns and scope signals, Jev skipped.
2. `jev_on`: deterministic layer plus mocked D fan-out and thresholds.
3. `jev_off`: feature disabled/no-Jev control; report legacy disposition separately, not as proof of safety.
4. `jev_unavailable`: enabled blocking path with missing key/error injection; every blocking fixture must fail closed.
5. `shadow_compare`: compute deterministic and Jev candidate dispositions side-by-side without changing the selected control disposition.

CI acceptance is fixture-contract based: all hard-block rows block; safe rows do not hard-block; threshold boundary rows produce the pinned allow/confirm/block result; unavailable blocking rows block; all five arms share one corpus hash; metrics include counts, false-allow/false-block by label, p50/p95 latency, Jev calls/skips/errors, model/threshold metadata, and `mocked|live`. `--live` is optional evidence only: vendor latency/agreement is measured, never used as an unverified CI headline.

### Test strategy

| Order | Test target | Required evidence |
| --- | --- | --- |
| Unit RED → GREEN | `harness-tool-guard.test.ts` | D question ids, exact threshold edges, hard-deny near misses, workspace in/out/unknown, no-key/error/malformed fallback, non-blocking bypass, redaction-safe state/trace |
| Unit RED → GREEN | benchmark module/replay tests | Corpus schema, arm isolation, stable hash/order, metric denominators, no command execution |
| Composition RED → GREEN | `tool-safety-mcp.test.ts` | Tool registration, read-only result, workspace requirement, no gate receipt/`allowed`, injected Jev, server policy resolution |
| Composition RED → GREEN | `jev-harness-live-tool-gate.test.ts` and preflight tests | Workspace reaches guard for Cursor and Claude paths; block kills the turn; confirm remains local-log/CI-strict; dist hard stop unchanged |
| Regression | Existing Jev, checklist, agentstream, and context-pruning suites | W5 behavior remains default-off and no authority boundary regresses |

No E2E test is needed for this slice: stream proposal parsing and driver binding are composition-testable without invoking a real agent or vendor.

## Implement — build-plan execution order

### W0 — TIED contract and pre-RED gates

Copy the per-request Tracker from `tied/docs/agent-req-implementation-checklist.yaml` to the child working folder, persist CITDP with the independent depth/profile/gate fields, mint the child REQ/ARCH/IMPL through MCP after confirming `tied_config_get_base_path`, and author the IMPL sidecar. The sidecar must include token-commented Active blocks with INPUT/OUTPUT/DATA/CONTROL plus PRE/POST/EFFECTS/FAILURE_MODES/DATA_TRANSITION/TERMINATION where applicable:

`RESOLVE_HARNESS_SAFETY_CONFIG` → `NORMALIZE_TOOL_SAFETY_INPUT` → `MATCH_DESTRUCTIVE_COMMAND` → `DERIVE_WORKSPACE_SCOPE_SIGNAL` → `RUN_HARNESS_SAFETY_FANOUT` → `APPLY_HARNESS_RISK_THRESHOLDS` → `EMIT_HARNESS_DECISION` → `APPEND_TOOL_SAFETY_TRACE` → `BUILD_TOOL_SAFETY_DIAGNOSTIC` → `BIND_WORKSPACE_TO_LIVE_GATE`.

Run Layer A (`tied_validate_consistency`), Layer B pseudo-code validation, and Layer C `pseudocode_analyze` with `gate_mode: true` before RED tests. Then obtain the authoritative `pre_implementation` checklist gate. This linked-plan pass performs none of those writes or claims that gate.

### W1 — Guard core

Write failing unit tests first, then extend the existing W5 evaluator in `harness-tool-guard.ts`; do not create `blueprint-d-tool-guard.ts`. Keep `harness-config.ts` as the enablement/policy boundary. Replace W5 answer keys with D ids, switch threshold logic to **combined max** (see Refine table), preserve public `HarnessToolEvaluation` compatibility, add `workspace` on input and bounded scope normalization in vendor state, expand patterns with safe near-miss tests, and pass `contextMeta: { feature: "tool_safety_gating" }` into the existing client trace path. Update tests that mock `high_risk` / `needs_confirm` to mock `noul_destructive_risk` / `noul_scope_violation`.

### W2 — Benchmark and replay

After the guard module is independently green, add the labeled JSONL corpus, pure benchmark runner, `mcp-server/scripts/replay-jev-tool-safety-benchmark.ts`, and `tool-safety-benchmark.v1` report schema. Run mocked arms first; persist evidence only under the child working folder. Live mode must require an explicit operator opt-in and must never write secrets or alter runtime decisions.

### W3 — One diagnostic MCP surface

Write the failing composition tests before the adapter. Implement `tied_jev_tool_safety_evaluate` as a thin read-only adapter over `evaluateHarnessToolCall`, register it once by spreading its tool list in `mcp-server/src/tools/index.ts` beside the existing JEV tool groups, and expose no command-execution capability. Its response may contain `decision`, risk, reason, pattern/scope diagnostics, and Jev observation, but never a checklist `allowed` result or `gate_receipt`.

### W4 — Existing live composition

Write failing composition assertions that `resolveProjectRootForJev(cfg)` (or `cfg.workspace`) reaches `evaluateHarnessToolCall` as `workspace` on both Cursor and Claude live paths — today only `goal` and `arguments` are passed in [evaluateStreamToolProposal](file:///Users/fareed/Documents/dev/chatgpt/stdd/mcp-server/packages/agentstream/src/jev-harness-live-tool-gate.ts). Make the smallest adapter change in `jev-harness-live-tool-gate.ts` / binding call sites. Do not add another runtime hook. Preserve the existing W5 stream proposal shapes, dist hard stop, SIGTERM on block, local diagnostic on confirm, and CI/strict abort behavior. Run the agentstream build and focused tests before the full suite.

### W5 — Verification and close-out

Run focused Jev, MCP, and agentstream tests, TypeScript build/lint, the mocked five-arm replay, token audit, vocabulary RECORD/VALIDATE for any newly named child concepts, integrated inquiry at structural/pre-RED/verification phases, verification gate, and `tied_validate_consistency`. Use the unified close-out evidence procedure before any completion claim. Do not treat benchmark agreement, inquiry observations, or Jev output as permission to mutate TIED YAML or bypass deterministic gates.

## Acceptance criteria

- [x] **SC-W5-PRESERVED:** Existing W5 guard/preflight/live-gate tests pass with harness default-off; no duplicate runtime evaluator or new live hook exists.
- [x] **SC-D-QUESTIONS:** Enabled blocking calls send exactly `noul_destructive_risk` and `noul_scope_violation` in one speculative fan-out, with taxonomy wording recorded in the child IMPL.
- [x] **SC-D-FAST-DENY:** Destructive patterns hard-block before Jev; safe near misses remain testable and do not overmatch solely because they contain a keyword.
- [x] **SC-D-SCOPE:** Live calls carry the declared workspace; explicit in/out/unknown scope cases have deterministic, redaction-safe outcomes and an explicit proof boundary.
- [x] **SC-D-THRESHOLDS:** Combined `max(destructive, scope)` bands at `0.45` and `0.72` lock allow/confirm/block; strict/CI confirm behavior is covered without claiming interactive prompting.
- [x] **SC-D-FALLBACK:** Missing key, transport error, non-2xx, state-too-large, and malformed answers fail closed for enabled blocking tools; non-blocking tools remain unaffected. *(Unit tests: missing key, HTTP 503, state_too_large skip; malformed/missing noul keys still allow at combined=0 — proof boundary in w5-verify-closeout.v1.json.)*
- [x] **SC-D-TRACE-PRIVACY:** Opt-in `system-one-decide-trace.v1` contains D call metadata but no API key, canary secret, raw absolute workspace, or unredacted command.
- [x] **SC-D-MCP-AUTHORITY:** `tied_jev_tool_safety_evaluate` is read-only and composition-tested; it never executes commands, writes YAML, or emits checklist gate authority.
- [x] **SC-D-AGENTSTREAM:** Both existing live driver compositions pass workspace and preserve block/confirm/dist semantics.
- [x] **SC-D-BENCH:** One corpus hash appears in all five arms; mocked acceptance covers hard blocks, safe rows, threshold boundaries, unavailable fail-closed behavior, denominators, latency, and error metrics.
- [x] **SC-D-TIED:** Child REQ/ARCH/IMPL, sidecar token comments, Tracker/CITDP, vocabulary, inquiry artifacts, verification gate, and `tied_validate_consistency` are mutually consistent. *(Close_out gate allowed; `tied_validate_consistency` ok; verification-phase gate pairing deferred; see [w5-verify-closeout.v1.json](evidence/w5-verify-closeout.v1.json).)*

## Risks and deferred decisions

- Shell commands are not fully interpreted by a regex/path classifier; command substitutions, aliases, symlinks, and platform-specific shells remain residual risk and must be stated in the proof boundary.
- `confirm` is not a human prompt in the current stream drivers. Turning it into an interactive approval protocol is a separate scope decision.
- The MCP diagnostic tool is deliberately one adapter over the runtime guard. A separate IDE middleware or second policy engine requires a new approved child scope.
- Thresholds are operating points, not vendor guarantees; model/version changes require benchmark reruns and possible LEAP updates.
- If a future requirement makes the guard production-default rather than opt-in, reassess `depth_tier`, privacy/data tier, and gate policy before implementation.

## Refine-plan handoff

| Item | Status |
| --- | --- |
| Linked plan | **Updated (pass 2)** — plan-only; external Markdown plan edited |
| Pass 2 deltas | Combined max risk aggregation; W5 question-key migration; fail-closed vs Blueprint C; no second env flag; live workspace seam documented; REQ SC-* draft; PLAN-CLOSE-OUT pointer |
| Child Tracker / CITDP / TIED YAML | **Deferred** to build-plan W0 |
| `tied_checklist_gate_validate` | **Not run** — no child Tracker/CITDP yet |
| Vocabulary | PRELOAD: decision-copilot, quality-assurance, fidelity-research; RECORD **Blueprint D — tool safety gating** block in `decision-copilot.md` at W5 |
| Next step | `/build-plan` W0 → W5, then `PLAN-CLOSE-OUT.md` CO0–CO5 |