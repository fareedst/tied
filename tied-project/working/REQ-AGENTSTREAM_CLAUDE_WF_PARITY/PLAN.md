# PLAN — [REQ-AGENTSTREAM_CLAUDE_WF_PARITY] (refine-plan)

**Status:** refine-plan (phase 2). Linked plan refined from Cursor plan `claude_wf_harness_parity_a0d7ad17`. No implementation code or RED tests in this phase.

**Workflow:** add-feature (deferred REQ index) → **refine-plan** → build-plan → close-out

**Request token:** `REQ-AGENTSTREAM_CLAUDE_WF_PARITY` (index + detail: **build-plan** first step via `tied_token_create_with_detail`)

**profile_depth:** `minimal` · **gate_policy:** `advisory`

**CITDP (working draft):** [CITDP-REQ-AGENTSTREAM_CLAUDE_WF_PARITY.yaml](./CITDP-REQ-AGENTSTREAM_CLAUDE_WF_PARITY.yaml)

**Test strategy:** [test-strategy.md](./test-strategy.md)

**Tracker:** [checklist-tracker.yaml](./checklist-tracker.yaml)

---

## 1. Refine (Touchpoint 1 — RESOLVE) — closed

| Sponsor term | Resolved concept | Disposition |
| --- | --- | --- |
| Cursor gold | **WF03_CURSOR_GOLD** — disposable `1793760220-wf-agentstream-wf-03`, `REQ-MODULE_COMPOSITION`, `composer-2.5-fast`, close_out allowed | **Locked** (normative fingerprint) |
| Claude gap cell | **WF03_CLAUDE_INCOMPLETE** — `1793805223…`, scaffold only, build-plan blocked | **Evidence** (motivation) |
| Product parity | Same **PROMPT-WF-03** product class + **close_out** at same **MODEL_SLUG** when comparing harnesses | **Locked** |
| Harness vs model | This REQ closes **harness/orchestrator** defects only | **Locked** |
| Batch agent playbook | Greenfield minimal path (IMPL before RED, `sub-adversarial-inquiry-pass` N/A, no sponsor questions in batch mode) is **orchestrator content**, not Claude-only | **Locked** |
| CI vs live | CI: argv, MCP smoke, unit tests; live wf-03 parity: manual/nightly | **Locked** (costly choice accepted) |
| REQ index | Not created in refine-plan; build-plan creates **REQ/ARCH/IMPL** stack before code | **Locked** |

**Charter lane:** All decisions above are charter-lane (pre-implementation). No selection-lane items.

**Ambiguity accepted:** Exact Claude `MODEL_SLUG` for manual parity run is operator-chosen but must match the Cursor cell under comparison.

---

## 2. Problem (evidence)

Four-phase **feature-spec batch** ([`traditional-four-phase-agentstream.yaml`](../../../docs/demos/traditional-four-phase-agentstream.yaml)) drives both harnesses, but Claude live subprocess contract diverges from validated client smoke and from Cursor workspace MCP behavior.

| Gap | Cursor | Claude today | Symptom |
| --- | --- | --- | --- |
| MCP load | `.cursor/mcp.json` via `cursor agent --workspace` | [`claude-agent-argv.ts`](../../../mcp-server/packages/agentstream/src/claude-agent-argv.ts): no `--mcp-config` / `--strict-mcp-config` | Weaker TIED MCP during turns |
| Skill paths | Batch cites `.cursor/skills/` | Claude inventory `.claude/skills/` | Path bias in batch goals |
| Preload | Often missing on disposable clients | Template fallback only | No harness dimension in preload |
| Greenfield playbook | Gold hydrates tracker + IMPL | Claude cell stopped at gate | No product despite 4 sessions |
| Observability | stderr turn markers | Same | No durable trace |

---

## 3. Reference baseline — WF03_CURSOR_GOLD

| Field | Value |
| --- | --- |
| Client | `/Users/fareed/Documents/dev/test/1793760220-wf-agentstream-wf-03` |
| Inventory | `tied-project/working/REQ-MODULE_COMPOSITION/evidence/trial-workflow-interaction-inventory.v1.json` |
| Product | `src/producer.ts`, `src/consumer.ts`, `src/wiring.ts`, `src/wiring.test.ts`; `npm test` green |
| close_out | `tied-bundle/working/REQ-MODULE_COMPOSITION/gates/close_out-2026-11-04T02-53-59-373Z.json` (`allowed: true`) |
| Minimal adversarial | Tracker `sub-adversarial-inquiry-pass`: `not_applicable`; `not-applicable-receipt.v1.json` |

**Parity fingerprint (automated):** REQ+ARCH+IMPL stack; populated tracker; verification manifest + test stdout; envelope without blocking gaps; close_out gate allowed; inventory sponsor turns 3–4 complete.

---

## 4. Scope

### In scope

- **Pillar A:** Claude live argv alignment with [`runClaudeCodeInteractiveSmoke`](../../../tools/bootstrap/lib/claude-client-validation.mjs) (`--mcp-config`, `--strict-mcp-config`, env opt-out).
- **Pillar B:** `{{SKILL_ROOT}}` batch expansion; build-plan/close-out batch text; Claude preflight in [`workflow-trial-agentstream.sh`](../../../scripts/workflow-trial-agentstream.sh); disposable preload contract seed.
- **Pillar C:** `AGENTSTREAM_HARNESS_TRACE` JSONL framework in live-executor.
- **Pillar D:** `scripts/dual-harness-wf03-parity-smoke.*` (dry default + manual live doc).
- **TIED:** `REQ-AGENTSTREAM_CLAUDE_WF_PARITY`, `ARCH-AGENTSTREAM_CLAUDE_WF_PARITY`, `IMPL-AGENTSTREAM_CLAUDE_WF_PARITY` + pseudo-code sidecar.
- **Docs:** [`tied-project/vocab/agentstream.md`](../../vocab/agentstream.md), agentstream README, catalog § dual-harness parity.

### Out of scope

- Per-record `model` in batch YAML.
- Default CI live LLM dual-harness runs.
- Changing gold disposable client contents.

---

## 5. Planned layout (build-plan)

| Path | Role |
| --- | --- |
| `mcp-server/packages/agentstream/src/claude-agent-argv.ts` | MCP argv + tests |
| `mcp-server/packages/agentstream/src/harness-turn-trace.ts` | Trace writer |
| `mcp-server/packages/agentstream/src/live-executor.ts` | Invoke trace hook |
| `docs/demos/traditional-four-phase-agentstream.yaml` | Harness-aware batch |
| `scripts/run-traditional-four-phase-agentstream.sh` | Placeholder expansion |
| `scripts/workflow-trial-agentstream.sh` | Claude validation preflight |
| `scripts/dual-harness-wf03-parity-smoke.sh` | Parity automation |
| `tied-project/requirements/REQ-AGENTSTREAM_CLAUDE_WF_PARITY.yaml` | REQ detail (build-plan) |
| `tied-project/implementation-decisions/IMPL-AGENTSTREAM_CLAUDE_WF_PARITY-pseudocode.md` | IMPL pseudo-code |

---

## 6. Implementation order (for build-plan)

1. TIED tokens + IMPL pseudo-code (token-commented blocks).
2. RED: `claude-agent-argv.test.ts` → GREEN pillar A.
3. RED: batch expansion test → GREEN pillar B.
4. RED: `harness-turn-trace.test.ts` → GREEN pillar C.
5. Pillar D script + docs.
6. `npm test` (agentstream) + script tests; manual live wf-03 with trace optional.
7. `tied_validate_consistency`; LEAP vocab/CHANGELOG.

---

## 7. Gates (refine-plan)

- **Advisory `pre_implementation` (`tied_checklist_gate_validate`, 2026-11-04):** `allowed: false`, `blocking: true`, `depth: minimal`. Diagnostics: `missing_adversarial_evidence_references`, `missing_counterexamples`, `missing_disconfirming_observations`, `missing_falsification_questions`, `pending_required_step:sub-adversarial-inquiry-pass`, `sub_stub_pending`. **Expected in plan mode** with template tracker; build-plan must set `sub-adversarial-inquiry-pass` → `not_applicable` (minimal depth, harness-only scope) before RED, matching **WF03_CURSOR_GOLD** pattern.
- Plan-mode: advisory policy — refine completion does not require `allowed: true`.

---

## 8. Handoff

**Next:** `@build-plan` on this linked plan.

**Build-plan entry:**

1. Create REQ/ARCH/IMPL via tied-yaml MCP (`related_to` **REQ-TIED_CLAUDE_LIVE_DRIVER**, **REQ-TIED_CLAUDE_HARNESS**).
2. Author IMPL `essence_pseudocode` sidecar per [PROC-IMPL_PSEUDOCODE_TOKENS].
3. Execute pillars A→D with TDD per [test-strategy.md](./test-strategy.md).

**Carry-forward:** Record `pre_implementation` gate receipt under `working/REQ-AGENTSTREAM_CLAUDE_WF_PARITY/gates/` after tracker step dispositions for minimal depth are set in build-plan.
