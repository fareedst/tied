# PLAN — GF-05 gate receipt + checklist_gate verify (dual-track)

| Field | Value |
| --- | --- |
| **Parent token** | `PLAN-GF-05-GATE-VERIFY-DUAL-TRACK` |
| **Active track (refine pass 2)** | **`SCOPE-VERIFY-GATE-COMMON` (Track B)** |
| **Deferred track** | `SCOPE-CLOSE-OUT-EXT` (Track A) — out of scope until separate refine/build-plan |
| **Track B CITDP** | [`CITDP-PLAN-GF-05-SCOPE-VERIFY-GATE-COMMON.yaml`](CITDP-PLAN-GF-05-SCOPE-VERIFY-GATE-COMMON.yaml) |
| **Parent CITDP** | [`CITDP-PLAN-GF-05-GATE-VERIFY-DUAL-TRACK.yaml`](CITDP-PLAN-GF-05-GATE-VERIFY-DUAL-TRACK.yaml) |
| **Tracker** | [`checklist-tracker.yaml`](checklist-tracker.yaml) |
| **Source feedback** | `fb-mvo18hye-i6x5fq` · **PROMPT-GF-05** · client `1792944114-gf-05` |
| **LEAP proposal** | `lp-2026-10-25T16-23-32-863Z-c284570f3c0b` (pending) |
| **Depth** | `minimal` · `gate_policy`: **advisory** |

---

## 1. Refine (Touchpoint 1 — RESOLVE) — Track B

| Sponsor term | Resolved meaning |
| --- | --- |
| **Track B** | **`SCOPE-VERIFY-GATE-COMMON`** — methodology checklist + skill/docs, not close-out runner code |
| **Common step** | New sub-procedure **`sub-checklist-gate-before-verify-update`**, invoked before **`tied_verify`** with **`update: true`** at **verification** and **close_out** (all clients, all REQ cycles) |
| **checklist_gate** | MCP payload: **phase**, **tracker_path**, **unwrapped inner CITDP body** (same shape as `loadCitdpRecord` — not top-level `CITDP-REQ-*` wrapper) |
| **Operator sequence** | `tied_checklist_gate_validate` + `receipt_persistence` → optional envelope patch → `tied_verify` with **checklist_gate** + tokens |

**Vocabulary PRELOAD:** [feedback-to-tied.md](../../vocab/feedback-to-tied.md), [tied-yaml-mcp.md](../../vocab/tied-yaml-mcp.md), [leap-proposal-queue.md](../../vocab/leap-proposal-queue.md).

**Consequence ladder**

| Choice | Ladder | Disposition |
| --- | --- | --- |
| Track B only (this refine) | **Reversible** | **Accepted** — sponsor selection |
| Track A in same build-plan | **Costly** | **Reject** — deferred |
| New REQ token before LEAP approve | **Costly** | **Defer** — extend existing `[PROC-AGENT_REQ_CHECKLIST]` / `[REQ-TIED_VERIFICATION_GATED]` prose unless LEAP mints slice |
| MCP behavior change (auto-inject checklist_gate) | **Costly** | **Reject** — `missing_checklist_gate` already fail-closed; normative checklist only |

**Depth / gates:** `depth_tier: minimal`, `gate_policy: advisory`, `sub_adversarial_inquiry_pass: not_applicable`.

---

## 2. Plan (CITDP — Track B build-plan map)

### 2.1 File touch list (normative)

| SC id | Path | Change |
| --- | --- | --- |
| SC-SUB-VERIFY-GATE | `tied-bundle/docs/agent-req-implementation-checklist.yaml` | Add sub-procedure **`sub-checklist-gate-before-verify-update`**; **CALL** from **`verification-gate`** and **`traceable-commit`** before `tied_verify` **`update: true`** |
| SC-SUB-VERIFY-GATE | `tied-bundle/docs/agent-req-implementation-checklist.md` | Mirror sub slug and operator sequence (inner CITDP rule) |
| SC-PROC-XREF | `tied-bundle/docs/processes.md` | `[PROC-TIED_VERIFICATION_GATED]` paragraph cross-link |
| SC-SKILL-EXAMPLE | `tools/bundled-tied-yaml-skill/SKILL.md` | Replace bare `tied_verify` example with **checklist_gate** example; link sub-procedure |
| SC-TEST-CONTRACT | `tools/bootstrap/lib/` or `mcp-server/` test | RED: assert sub slug + skill **checklist_gate** block exist |

### 2.2 IMPL pseudo-code (author at build-plan)

No new IMPL token in refine pass. If build-plan adds **`IMPL-*`**, sidecar blocks (names only):

- **`DOCUMENT_VERIFY_GATE_SUBPROCEDURE`** — checklist YAML/md contain sub slug and CALL sites
- **`FORBID_BARE_VERIFY_UPDATE`** — skill strings forbid update-only verify narrative

Run **`pseudocode_validate`** only if IMPL detail is created at build-plan.

### 2.3 Test strategy (RED before prose)

| Test | Asserts |
| --- | --- |
| New Node contract test | `sub-checklist-gate-before-verify-update` in checklist YAML |
| Same or second test | `checklist_gate` in bundled-tied-yaml-skill `SKILL.md` |
| Existing `mcp-server/src/verify.test.ts` | Still green for **`missing_checklist_gate`** |

### 2.4 Build-plan waves (Track B)

| Wave | Action |
| --- | --- |
| 0 | `pre_implementation` gate (receipt under `gates/`) |
| 1 | RED contract tests |
| 2 | GREEN: checklist + processes + skill edits per §2.1 |
| 3 | `tied_validate_consistency` (methodology read paths unchanged for clients until refresh) |
| 4 | Update LEAP proposal summary / `tied_leap_proposal_mark_applied` when sponsor approves |
| 5 | Persist Track B CITDP to `tied-project/citdp/`; parent dual-track CITDP note Track B closed |
| 6 | Traceable commit (store); optional GF-05 readout row |

**Track A:** No waves in this PLAN execution.

---

## 3. Implement boundary

| Refine (this pass) | `@build-plan` |
| --- | --- |
| Track B PLAN + CITDP + Tracker paths | Waves 0–6 |
| `pre_implementation` gate | Re-run if CITDP changes |
| No checklist/skill edits yet | §2.1 files |

---

## 4. Gate receipts (refine-plan pass 2 — Track B)

| Gate | Result | Receipt |
| --- | --- | --- |
| `pre_implementation` | **allowed: true** (minimal) | [`pre_implementation-2026-10-25T16-29-23-527Z.json`](gates/pre_implementation-2026-10-25T16-29-23-527Z.json) |

---

## 5. Related

| Artifact | Role |
| --- | --- |
| `fb-mvo18hye-i6x5fq` | Witness + promotion |
| [`trial-readout-PROMPT-GF-05`](../../../docs/demos/trial-readout-PROMPT-GF-05-1792944114.md) | Field narrative |
| Track A | Deferred — `run-close-out-gates.mjs` persistence |

---

## 6. Build-plan (Track B — 2026-10-25)

| Wave | Status |
| --- | --- |
| 1 RED | **done** — `mcp-server/src/e2e/gf05-verify-gate-checklist-contract.test.ts` |
| 2 GREEN | **done** — checklist YAML/MD, `processes.md`, `bundled-tied-yaml-skill/SKILL.md` |
| 5 persist CITDP | **done** — `tied-project/citdp/CITDP-PLAN-GF-05-SCOPE-VERIFY-GATE-COMMON.yaml` |

Evidence: [`evidence/build-plan-evidence.md`](evidence/build-plan-evidence.md)

**Close-out:** **done** (2026-10-25) — `run_id=close-out-gf05-track-b-20261025`; receipt [`evidence/close-out-handoff.md`](evidence/close-out-handoff.md).

---

## Session handoff

Track B **closed**. Optional: LEAP approve/mark applied; Track A refine when ready.
