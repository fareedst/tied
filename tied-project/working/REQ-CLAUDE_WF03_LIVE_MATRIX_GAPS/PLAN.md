# PLAN — [REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS] (refine-plan pass 1)

**Status:** build-plan complete (2026-11-04). Close-out deferred. **Linked context:** live trial analysis from disposable client `1793810114-wf-agentstream-wf-03-claude-claudehaiku55` (see [session-handoff](../REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG/evidence/session-handoff.md)).

**Workflow:** add-feature → refine-plan → **@build-plan** → close-out

**Request token:** [REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS](../../requirements/REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS.yaml) · status **Planned** (ARCH/IMPL: **build-plan**)

**profile_depth:** `minimal` · **gate_policy:** `advisory`

**Trial:** `wf-agentstream-wf-03-claude-claudehaiku55` · **Model config / slug:** `claude-haiku-5-5` · **Harness:** `claude`

**CITDP (working draft):** [CITDP-REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS.yaml](./CITDP-REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS.yaml)

**Test strategy:** [test-strategy.md](./test-strategy.md)

**Tracker:** [checklist-tracker.yaml](./checklist-tracker.yaml)

---

## 1. Refine (Touchpoint 1 — RESOLVE) — closed

| Sponsor term | Resolved concept | Disposition |
| --- | --- | --- |
| Live trial failure | **WF03_CLAUDE_HAIKU55_INCOMPLETE** — product GREEN, machine close_out blocked, preflight `ok: false` | **Evidence** (2026-11-04 run) |
| Gold reference | **WF03_CURSOR_GOLD** — unchanged `1793760220-wf-agentstream-wf-03` | **Locked** |
| False preflight | Validation requires legacy **`TIED_BASE_PATH`** + **`client/tied`** while bootstrap writes **`TIED_CLIENT_PROJECT_PATH`** + **`tied-project/`** | **Locked root cause** |
| Preflight policy | Default **continue-on-fail** weakens matrix signal; optional **`WF_TRIAL_STRICT_PREFLIGHT=1`** fail-closed for parity experiments | **Locked** (reversible choice) |
| Close-out gate pitfall | Turn 4 **`malformed_citdp:adversarial_inquiry`** when gate gets wrapped/partial CITDP; turn 2 fixed pre_implementation with inner body | **Locked** — use **`tied_gate_check`** + `citdp_path` |
| Envelope gap | **`hydration_envelope_gaps_missing`** — no `request-evidence-envelope.v1.json` before close_out | **Locked** — build-plan/close-out playbook |
| Tracker hygiene | Template tracker never dispositioned (`completed` / `close_out_evidence.gates` empty) | **Locked** — batch agent must sync or emit receipts |
| Working directory | Agent sessions drifted to **TIED store** root while mutating disposable client | **Locked** — Claude driver cwd contract |
| Scope boundary | Harness/orchestrator/validation only; not model capability | **Locked** |

**Charter lane:** All rows pre-implementation.

**Ambiguity accepted:** Exact env var name for strict preflight may be `WF_TRIAL_STRICT_PREFLIGHT` or documented alias in build-plan.

---

## 2. Problem (evidence)

| # | Gap | Symptom (live run) | Owner pillar |
| --- | --- | --- | --- |
| 1 | Stale Claude validation contract | `mcp_json_harness_contract` fail; MCP tools still work via canonical env | **E** |
| 2 | Fail-open preflight | Trial continues with `DIAGNOSTIC: … continuing may weaken MCP parity` | **F** |
| 3 | Close-out gate invocation | Turn 4 `malformed_citdp:adversarial_inquiry` + envelope read_failed | **G** |
| 4 | Checklist / envelope hygiene | Empty tracker dispositions; no envelope file | **G** |
| 5 | Status / verify | No commit → no verification manifest → REQ stays Planned | **G** (process) |
| 6 | Cwd / skill routing | Primary CWD became stdd store during turns | **H** |
| 7 | Preload | `agent-preload-contract.yaml` absent (template fallback) | **G** (optional seed) |

**Reference client (facilitator):** `/Users/fareed/Documents/dev/test/1793810114-wf-agentstream-wf-03-claude-claudehaiku55` — `REQ-PRODUCER_CONSUMER_WIRING`, 14 tests green, close_out incomplete.

---

## 3. Scope

### In scope

- **Pillar E — Canonical MCP validation:** Update [`assertMcpJsonHarnessContract`](../../../tools/bootstrap/lib/claude-client-validation.mjs) to accept **`TIED_CLIENT_PROJECT_PATH`** (and optional legacy **`TIED_BASE_PATH`**) with **`resolveTiedLayout(clientRoot).tiedDir`**; align tests/fixtures with **`tied-project/`** layout. Cross-ref [REQ-TIED_CLI_MCP_JSON_BASE_PATH](../../requirements/REQ-TIED_CLI_MCP_JSON_BASE_PATH.yaml).
- **Pillar F — Matrix preflight policy:** [`workflow-trial-agentstream.sh`](../../../scripts/workflow-trial-agentstream.sh) — document default advisory continue; implement **`WF_TRIAL_STRICT_PREFLIGHT=1`** (or agreed name) to exit non-zero when validation `ok: false`.
- **Pillar G — Close-out playbook:** Four-phase batch and/or prompt-shared close-out adjunct — require **`tied_gate_check`** with `citdp_path` + `tracker_path`; **`request_evidence_envelope_build`** before turn 4; minimal tracker disposition guidance for batch agents (no `--sync-dispositions` trap per [REQ-WF_TRIAL close-out handoff](../REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG/evidence/close-out-handoff.md)).
- **Pillar H — Client-root cwd:** Land or finish [`claude-driver.ts`](../../../mcp-server/packages/agentstream/src/claude-driver.ts) cwd = disposable **`WORKSPACE`** (unstaged WIP noted in parity close-out).
- **TIED:** `REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS`, `ARCH-*`, `IMPL-*` + token-commented pseudo-code.
- **Docs:** [`tied-project/vocab/agentstream.md`](../../vocab/agentstream.md) — RECORD **WF03_CLAUDE_HAIKU55_INCOMPLETE**, strict preflight term; catalog matrix facilitator note.

### Out of scope

- Changing shipped argv MCP flags (REQ-AGENTSTREAM_CLAUDE_WF_PARITY pillar A)
- Disposable tag format (REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG)
- Default CI live LLM matrix
- Promoting disposable trial client REQ to Implemented without sponsor commit policy

---

## 4. Planned layout (build-plan)

| Path | Role |
| --- | --- |
| `tools/bootstrap/lib/claude-client-validation.mjs` | Pillar E |
| `tools/bootstrap/lib/claude-client-validation.test.mjs` | Pillar E tests |
| `scripts/workflow-trial-agentstream.sh` | Pillar F |
| `tools/bootstrap/workflow-trial-agentstream-sh.test.mjs` | Pillar F tests |
| `docs/demos/traditional-four-phase-agentstream.yaml` | Pillar G close-out turn hints (if batch text change) |
| `tools/bundled-prompt-type-skills/prompt-shared/*close*` or plan-process-tools-adjunct | Pillar G gate/envelope sequence |
| `mcp-server/packages/agentstream/src/claude-driver.ts` | Pillar H |
| `tied-project/requirements/REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS.yaml` | build-plan |
| `tied-project/implementation-decisions/IMPL-CLAUDE_WF03_LIVE_MATRIX_GAPS-pseudocode.md` | build-plan |

---

## 5. Implementation order (for build-plan)

1. Create REQ/ARCH/IMPL tokens + IMPL pseudo-code (validate with `pseudocode_validate`).
2. **RED → GREEN pillar E** (validation contract).
3. **RED → GREEN pillar F** (strict preflight flag + tests).
4. **Pillar G** — docs/batch prompt edits (no RED unless script extracts batch assertions).
5. **Pillar H** — driver cwd + agentstream tests.
6. `node --test` bootstrap + agentstream packages; manual wf-03 re-run checklist in evidence.
7. `tied_validate_consistency`; persist CITDP to `tied-project/citdp/` at close-out.

---

## 6. Gates (refine-plan)

**Invocation:** `tied_gate_check` with:

- `phase: pre_implementation`
- `citdp_path: tied-project/working/REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS/CITDP-REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS.yaml`
- `tracker_path: tied-project/working/REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS/checklist-tracker.yaml`
- `project_root: /Users/fareed/Documents/dev/chatgpt/stdd`

**Result (2026-11-04 refine pass 1):** `allowed: true`, `exit_code: 0`, no reasons (`tied_gate_check` with inner CITDP file paths).

**Plan-mode policy:** Advisory — refine completion does not require `allowed: true`. Build-plan must set `sub-adversarial-inquiry-pass` → `not_applicable` (minimal depth) before RED, matching gold pattern.

**Process note:** [tied-refine.md](../../../tools/bundled-prompt-type-skills/prompt-shared/tied-refine.md) says do not start plan until gate allows; [prompt-execution-mode.md](../../../tools/bundled-prompt-type-skills/prompt-shared/prompt-execution-mode.md) says advisory gate blocking is expected in plan mode. **Governance:** plan-mode advisory wins for refine-plan; build-plan treats fail-closed pre_implementation as blocking for RED.

---

## 7. Gate receipt (refine-plan)

| Field | Value |
| --- | --- |
| Tool | `tied_gate_check` |
| Phase | `pre_implementation` |
| Allowed | **true** |
| Reasons | _(empty)_ |
| Note | Template tracker still has all steps `pending`; build-plan must set `sub-adversarial-inquiry-pass` → `not_applicable` before RED even though refine gate passed |

---

## 8. Handoff

**Next:** `@build-plan` on this folder.

**Build-plan entry:**

1. `tied_token_create_with_detail` for REQ/ARCH/IMPL (`related_to`: REQ-AGENTSTREAM_CLAUDE_WF_PARITY, REQ-TIED_CLAUDE_BOOTSTRAP_OPS, REQ-TIED_CLI_MCP_JSON_BASE_PATH).
2. Set tracker `sub-adversarial-inquiry-pass` not_applicable with policy + rationale.
3. Execute pillars E → F → G → H per [test-strategy.md](./test-strategy.md).

**Manual proof after build-plan:**

```bash
AGENTSTREAM_CLAUDE_LIVE_OK=1 MODEL_CONFIG=claude-haiku-5-5 MODEL_SLUG=claude-haiku-5-5 HARNESS=claude workflow_trial_agentstream wf-03
# optional: WF_TRIAL_STRICT_PREFLIGHT=1
```

**Open for sponsor:**

1. Confirm strict preflight env name (`WF_TRIAL_STRICT_PREFLIGHT` vs always fail-closed on Claude preflight).
2. Whether pillar G is batch YAML only or also agentstream injected turn preface.
