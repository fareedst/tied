# PLAN — REQ-GF16-KAIZEN-OUTCOME-CLOSE (add-feature)

**Prompt type:** `@add-feature` (Refine + Plan complete; **Implement** on `@build-plan`)  
**Tracker:** [`checklist-tracker.yaml`](checklist-tracker.yaml)  
**CITDP (working):** [`CITDP-REQ-GF16-KAIZEN-OUTCOME-CLOSE.yaml`](CITDP-REQ-GF16-KAIZEN-OUTCOME-CLOSE.yaml)  
**Persist CITDP to `tied-project/citdp/`:** after `@build-plan` close-out

---

## 1. Refine (Touchpoint 1 — RESOLVE)

| Sponsor / field term | Resolved meaning |
| --- | --- |
| **GF-16 client** | Disposable greenfield witness at `/Users/fareed/Documents/dev/test/1792937222-gf-16` (PROMPT-GF-16 / STATE-06) |
| **Proxy feedback** | Store row **`fb-mvny01eb-my451g`** in `tied-project/feedback.yaml` (facilitator ingest during `REQ-TIED_CLI_MCP_JSON_BASE_PATH` build-plan), not live client transport |
| **Countermeasure** | **`REQ-TIED_CLI_MCP_JSON_BASE_PATH`** — commit **`5ba4086e`**; close-out receipt in [`../REQ-TIED_CLI_MCP_JSON_BASE_PATH/evidence/close-out-handoff.md`](../REQ-TIED_CLI_MCP_JSON_BASE_PATH/evidence/close-out-handoff.md) |
| **Feedback queue miss** | Surface mismatch (LEAP queue, `promotion_pending` filters, or agent search) — not absence of `fb-mvny01eb-my451g` |
| **Recognize implemented solution** | Kaizen **outcome loop** (Phase 6): **`tied_feedback_outcome_record`** + **`tied_verify`** on countermeasure REQ + optional **`promotion_status`** on feedback entry |
| **Client “posted feedback”** | Narrative only; durable client account = [`traceable-commit-evidence.md`](file:///Users/fareed/Documents/dev/test/1792937222-gf-16/tied-project/working/REQ-RECONCILIATION_ENGINE/evidence/traceable-commit-evidence.md) § TIED repair |

### 1.1 Dual feedback register (do not merge)

Both items are **`methodology_improvement`** rows in store **`tied-project/feedback.yaml`**, paired via **`paired_feedback_id`**, owned by **`REQ-GF16-KAIZEN-OUTCOME-CLOSE`**. Live register: [`evidence/feedback-dual-track-register.md`](evidence/feedback-dual-track-register.md).

| Track | Feedback id | Observation | Countermeasure lane | Outcome closes when |
| --- | --- | --- | --- | --- |
| **A — Capture gap** | **`fb-mvnyr5n2-aaeg1j`** | GF-16 **failed to submit** upstream feedback (no receipt / no client `feedback.yaml`; agent narrative only) | **`REQ-TIED_CLIENT_FEEDBACK_CAPTURE`** — [`PLAN.md`](../REQ-TIED_CLIENT_FEEDBACK_CAPTURE/PLAN.md) | Outcome **`not_measured`** until that REQ ships; then cohort receipt for **`improved`** |
| **B — CLI / env** | **`fb-mvny01eb-my451g`** | **`tied-cli.sh`** used **unset `TIED_BASE_PATH` / script-dir store root** instead of client **`mcp.json`** | **`REQ-TIED_CLI_MCP_JSON_BASE_PATH`** + resolver import LEAP | GF-16 cwd smoke + bootstrap tests + **`tied_verify`** + outcome record |

**As TIED clients operate:** append smoke JSON, capture receipts, and trial readout deltas under `tied-project/working/REQ-GF16-KAIZEN-OUTCOME-CLOSE/evidence/`; do not collapse Track A into Track B’s CLI REQ.

**Vocabulary PRELOAD:** [feedback-to-tied.md](../../vocab/feedback-to-tied.md), [project-operations-mcp.md](../../vocab/project-operations-mcp.md), [tied-yaml-mcp.md](../../vocab/tied-yaml-mcp.md).

**Consequence ladder**

| Choice | Ladder | Disposition |
| --- | --- | --- |
| Outcome **`improved`** without GF-16 cwd smoke | **Costly misread** | **Reject** — smoke or **`inconclusive`** / **`not_measured`** |
| New REQ for duplicate countermeasure code | **Costly** | **Reject** — LEAP one-line fix to existing IMPL if needed |
| Optional client `feedback.yaml` mirror | **Reversible** | **Default include** in build-plan step 6 (cohort parity) |
| Skip `tied_verify` on `REQ-TIED_CLI_MCP_JSON_BASE_PATH` | **Costly** | **Reject** — index stays **Draft** misleadingly |

**Depth / gates:** `depth_tier: minimal`, `gate_policy: advisory` (operator + YAML feedback mutation; no auth/network).

**Build-plan (2026-10-25):** Wave 0 import LEAP landed; GF-16 smoke green — [`evidence/gf16-tied-cli-base-path-smoke.json`](evidence/gf16-tied-cli-base-path-smoke.json). Coordinator close-out handoff: [`evidence/close-out-handoff.md`](evidence/close-out-handoff.md).

---

## 2. Plan (CITDP summary)

**Problem:** Kaizen arc incomplete: observation stored (proxy), countermeasure implemented in store tree, but **outcome observation**, **feedback promotion state**, and **verification-gated REQ status** are not aligned; client cannot yet demonstrate fixed CLI behavior.

**Scope:** **Coordinator** for GF-16 dual-track Kaizen close. **Track B** (tooling) completes here: import fix, smoke, outcome, **`tied_verify`**. **Track A** (capture gap) countermeasure is **`REQ-TIED_CLIENT_FEEDBACK_CAPTURE`** — separate linked plan; this arc only records baseline outcome **`not_measured`** and register links.

### 2.1 Execution waves (`@build-plan`)

| Wave | Action | Evidence |
| --- | --- | --- |
| **0** | **LEAP fix:** `resolve-tied-cli-env.mjs` import → `../../bootstrap/lib/mcp-base-path.mjs`; extend **`tied-cli-invoke.test.mjs`** to exec resolver from fixture client cwd if missing | Test stdout; optional commit on store `main` |
| **1** | MCP: create **`REQ-GF16-KAIZEN-OUTCOME-CLOSE`** index + detail (thin operator REQ); link related_to countermeasure + Kaizen tokens | `tied_validate_consistency` |
| **2** | **`pre_implementation`** gate → RED only if Wave 0 adds new test | Gate JSON under `gates/` |
| **3** | **Store tests:** `node --test tools/bootstrap/lib/mcp-base-path.test.mjs tools/bootstrap/lib/tied-cli-invoke.test.mjs` | Manifest row in verification-evidence |
| **4** | **GF-16 smoke** (no `TIED_BASE_PATH` env): `cd /Users/fareed/Documents/dev/test/1792937222-gf-16 && .cursor/skills/tied-yaml/scripts/tied-cli.sh tied_config_get_base_path '{}'` → `base_path` ends with `1792937222-gf-16/tied-project` | Save stdout under `evidence/gf16-tied-cli-base-path-smoke.json` |
| **5** | **`tied_feedback_outcome_record`** — **Track B** (`fb-mvny01eb-my451g`) | See §2.2 |
| **5b** | **Track A** evidence: traceable-commit addendum or working doc **`gf16-feedback-capture-closeout.md`** (receipt id or N/A + rationale); optional client **`tied/feedback.yaml`** mirror linking **`fb-mvnyr5n2-aaeg1j`** | Client + store evidence paths |
| **5c** | **`tied_feedback_outcome_record`** — **Track A** when process countermeasure evidenced (else **`not_measured`**) | See §2.3 |
| **6** | Both entries: **`promotion_status`** → **`canonical_ready`** after sponsor review (currently **`promotion_pending`**) | `feedback.yaml` lint |
| **7** | **`tied_verify`** with update for **`REQ-TIED_CLI_MCP_JSON_BASE_PATH`** (Track B only) | Verify receipt |
| **8** | Docs: trial readout — **two** follow-up rows (capture + CLI); facilitator GF-16 dual-track note | `docs/demos/trial-readout-PROMPT-GF-16-1792937222.md` |
| **9** | Update **`feedback-dual-track-register.md`** outcome column | This working folder |
| **10** | Persist CITDP; envelope; **`close_out`**; scoped traceable commit | Same pattern as CLI REQ close-out |

### 2.2 Outcome record — Track B (`fb-mvny01eb-my451g`, draft Wave 5)

**Tool:** `tied_feedback_outcome_record`

**`follow_up_window`** (must include observation date):

```json
{
  "start": "2026-10-25T00:00:00.000Z",
  "end": "2026-11-30T23:59:59.000Z"
}
```

**`payload`** (adjust `outcome` after Wave 4):

```json
{
  "entry_id": "fb-mvny01eb-my451g",
  "outcome": "improved",
  "observed_at": "2026-10-25T15:00:00.000Z",
  "countermeasure_ref": "REQ-TIED_CLI_MCP_JSON_BASE_PATH@5ba4086e",
  "baseline": {
    "baseline_ref": "/Users/fareed/Documents/dev/test/1792937222-gf-16/tied-project/working/REQ-RECONCILIATION_ENGINE/evidence/traceable-commit-evidence.md",
    "captured_at": "2026-10-25T14:17:45.240Z"
  },
  "evidence_links": [
    "file://docs/demos/trial-readout-PROMPT-GF-16-1792937222.md",
    "file://tied-project/working/REQ-GF16-KAIZEN-OUTCOME-CLOSE/evidence/gf16-tied-cli-base-path-smoke.json",
    "file://tied-project/working/REQ-TIED_CLI_MCP_JSON_BASE_PATH/evidence/build-plan-verification-evidence.md"
  ]
}
```

If Wave 0–4 fail: set **`outcome`** to **`inconclusive`** with **`insufficient_evidence: true`** and document blocker in evidence markdown (do not claim **`improved`**).

### 2.3 Outcome record — Track A (`fb-mvnyr5n2-aaeg1j`)

Same **`follow_up_window`** as §2.2. **`payload`** sketch:

```json
{
  "entry_id": "fb-mvnyr5n2-aaeg1j",
  "outcome": "not_measured",
  "observed_at": "2026-10-25T15:30:00.000Z",
  "not_measured_waiver": true,
  "countermeasure_ref": "REQ-GF16-KAIZEN-OUTCOME-CLOSE@process-capture",
  "baseline": {
    "baseline_ref": "docs/demos/trial-readout-PROMPT-GF-16-1792937222.md",
    "captured_at": "2026-10-25T14:48:13.331Z"
  },
  "evidence_links": [
    "file://tied-project/working/REQ-GF16-KAIZEN-OUTCOME-CLOSE/evidence/feedback-dual-track-register.md",
    "file://tied-project/working/REQ-GF16-KAIZEN-OUTCOME-CLOSE/evidence/gf16-feedback-capture-closeout.md"
  ]
}
```

Upgrade to **`improved`** only after shipped checklist/skill/prose countermeasure **and** a subsequent client trial shows receipt or honest N/A (future cohort evidence).

### 2.4 Commands you can run now (operator)

**Store (already green on unit module):**

```bash
cd /Users/fareed/Documents/dev/chatgpt/stdd
node --test tools/bootstrap/lib/mcp-base-path.test.mjs tools/bootstrap/lib/tied-cli-invoke.test.mjs
```

**GF-16 (expected fail until Wave 0):**

```bash
cd /Users/fareed/Documents/dev/test/1792937222-gf-16
unset TIED_BASE_PATH
.cursor/skills/tied-yaml/scripts/tied-cli.sh tied_config_get_base_path '{}'
```

**After Wave 0 fix — outcome + verify (store MCP / tied-cli from store repo):**

```bash
cd /Users/fareed/Documents/dev/chatgpt/stdd
# tied_feedback_outcome_record — use MCP or tied-cli with JSON payloads from §2.2
# tied_verify — request_token REQ-TIED_CLI_MCP_JSON_BASE_PATH, update statuses per project verify config
```

---

## 3. Implement boundary

| In `@add-feature` (this pass) | On `@build-plan` |
| --- | --- |
| PLAN + CITDP + Tracker | Waves 0–10 |
| Refine gate receipt | `pre_implementation`, verification, `close_out` |
| No REQ token MCP writes yet | `tied_token_create_with_detail` for REQ-GF16-KAIZEN-OUTCOME-CLOSE |
| No feedback.yaml mutation yet | Outcome + promotion_status |

**Skill boundary:** Refine/plan stops before Implement per [add-feature SKILL](../../../tools/bundled-prompt-type-skills/add-feature/SKILL.md).

---

## 4. Related artifacts

| Artifact | Role |
| --- | --- |
| `feedback.yaml` → **`fb-mvnyr5n2-aaeg1j`** | Track A — capture gap |
| `feedback.yaml` → **`fb-mvny01eb-my451g`** | Track B — tied-cli / env |
| [`../REQ-TIED_CLI_MCP_JSON_BASE_PATH/PLAN.md`](../REQ-TIED_CLI_MCP_JSON_BASE_PATH/PLAN.md) | Countermeasure plan |
| [`docs/demos/trial-readout-PROMPT-GF-16-1792937222.md`](../../../docs/demos/trial-readout-PROMPT-GF-16-1792937222.md) | Cohort readout |
| Client `1792937222-gf-16` | Smoke witness |

---

## 5. Sponsor checkpoint

Coordinator **`@build-plan`** completed 2026-10-25 — see [`evidence/session-handoff.md`](evidence/session-handoff.md).

## Session handoff (2026-10-25)

Coordinator arc **done** (operator layer). Next: **`REQ-TIED_CLIENT_FEEDBACK_CAPTURE`** build-plan; optional scoped **`@close-out`** commit for store changes.
