# PLAN — REQ-TIED_CLIENT_FEEDBACK_CAPTURE (refined)

**Linked refine:** `@refine-plan` pass 1 (2026-10-25)  
**Witness feedback:** `fb-mvnyr5n2-aaeg1j` · **Coordinator:** [`REQ-GF16-KAIZEN-OUTCOME-CLOSE`](../REQ-GF16-KAIZEN-OUTCOME-CLOSE/PLAN.md)  
**Tracker:** [`checklist-tracker.yaml`](checklist-tracker.yaml)  
**CITDP (working):** [`CITDP-REQ-TIED_CLIENT_FEEDBACK_CAPTURE.yaml`](CITDP-REQ-TIED_CLIENT_FEEDBACK_CAPTURE.yaml)  
**Persist CITDP to `tied-project/citdp/`:** after `@build-plan` close-out

---

## 1. Refine (Touchpoint 1 — RESOLVE)

| Sponsor / field term | Resolved meaning |
| --- | --- |
| **Failed to submit feedback** | No Kaizen **receipt**, no client `tied/feedback.yaml`, no store capture during client session — not "transport lost after submit" |
| **Upstream feedback** | Append to **`tied-project/feedback.yaml`** (store) or client `tied/feedback.yaml` with MCP **`tied_feedback_capture_observation`** / **`tied_feedback_add`** on correct **`TIED_BASE_PATH`** |
| **Receipt** | Tool return **`id`** + **`created_at`** — gates agent claims and close-out evidence |
| **Proxy ingest** | Facilitator **`tied_feedback_add`** on store during readout (e.g. GF-16 Track B proxy) — distinct from **client-originated** capture |
| **`--skip-feedback-ingest`** | Honest when **no client `feedback.yaml`**; readout must say ingest N/A and whether proxy rows were added separately |
| **Outcome `not_measured`** | Current Track A state (`oo-mvnytkgp-17p51v`) until this REQ ships; **`improved`** requires ship + **next** cohort receipt or N/A |

**Vocabulary PRELOAD:** [feedback-to-tied.md](../../vocab/feedback-to-tied.md), [project-operations-mcp.md](../../vocab/project-operations-mcp.md).

**Consequence ladder**

| Choice | Ladder | Disposition |
| --- | --- | --- |
| Require store feedback row for every client close-out | **Costly** | **Reject** — allow **N/A + reason** (GF-16 class) |
| Agents may claim "posted to TIED store" without receipt | **Costly misread** | **Reject** — SC-NO-NARRATIVE-POST |
| Implement tied-cli fix in this REQ | **Costly misread** | **Reject** — Track B only |
| Optional GF-16 client mirror row | **Reversible** | **Defer** to build-plan wave 6 |

**Depth / gates:** `depth_tier: minimal`, `gate_policy: advisory`.

---

## 2. Plan (CITDP — build-plan map)

### 2.1 File touch list (normative)

| SC id | Path | Change |
| --- | --- | --- |
| SC-CAPTURE-RECEIPT | `tools/bundled-prompt-type-skills/prompt-shared/traceable-commit-close-out.md` | Add **Upstream feedback capture outcome** subsection: receipt id \| store `fb-*` \| client `feedback.yaml` path \| **N/A** + reason |
| SC-CAPTURE-RECEIPT | `tools/bundled-prompt-type-skills/prompt-shared/completion-signals-handoff.md` | Three-signal table row or footnote: capture outcome not implied by machine close_out alone |
| SC-NO-NARRATIVE-POST | `tools/bundled-feedback-skill/SKILL.md` | Explicit: agents in **client** sessions must not assert upstream post without receipt; point to `/feedback` or MCP |
| SC-NO-NARRATIVE-POST | `tools/bundled-prompt-type-skills/prompt-shared/tied-close-out-process.md` | One paragraph cross-link |
| SC-GF-INGEST | `tools/bundled-record-gf-trial-skill/SKILL.md` + `reference.md` | Table: client-originated vs proxy store row vs skip; link **`fb-mvnyr5n2-aaeg1j`** class |
| SC-GF16-WITNESS | `docs/demos/trial-readout-PROMPT-GF-16-1792937222.md` | Follow-up row: capture track → this REQ |
| SC-GF16-WITNESS | `tied-project/requirements/REQ-TIED_CLIENT_FEEDBACK_CAPTURE.yaml` | Already links witness; no duplicate REQ tokens |

### 2.2 IMPL pseudo-code (author at build-plan)

Sidecar target: `tied-project/implementation-decisions/IMPL-TIED_CLIENT_FEEDBACK_CAPTURE-pseudocode.md`

Blocks (names only at refine):

- **`VALIDATE_CAPTURE_OUTCOME_DOCUMENTED`** — traceable-commit evidence contains capture section or N/A
- **`FORBID_NARRATIVE_UPSTREAM_CLAIM`** — skill contract strings present
- **`DOCUMENT_FACILITATOR_INGEST_MODES`** — record-gf-trial reference completeness

Run **`pseudocode_validate`** before RED tests.

### 2.3 Test strategy (RED before prose merge)

| Test | Asserts |
| --- | --- |
| Extend `tools/bootstrap/.../feedback-skill` or existing `feedback-skill-e2e` | SKILL.md contains narrative-post prohibition |
| New lightweight test (Node) | `traceable-commit-close-out.md` contains `Upstream feedback capture` (or agreed heading token) |
| Manual | Re-read GF-16 readout + dual-track register after doc edits |

No new MCP behavior in this REQ.

### 2.4 Build-plan waves

| Wave | Action |
| --- | --- |
| 0 | `pre_implementation` gate (receipt under `gates/`) |
| 1 | IMPL sidecar + `pseudocode_validate` |
| 2 | RED tests (above) |
| 3 | GREEN: prose/skill edits per §2.1 |
| 4 | Update [`feedback-dual-track-register.md`](../REQ-GF16-KAIZEN-OUTCOME-CLOSE/evidence/feedback-dual-track-register.md) Track A countermeasure → **Implemented (docs)** |
| 5 | `tied_validate_consistency`; verification gate; **`tied_verify`** this REQ when tests exist |
| 6 | Optional: disposable client `tied/feedback.yaml` mirror for GF-16 |
| 7 | Persist CITDP; close_out; traceable commit |

**Outcome loop:** Do **not** set Track A **`improved`** in this build-plan unless sponsor runs a **new** cohort trial; at most update countermeasure_ref to REQ commit hash and leave **`not_measured`** or record **`unchanged`** on process doc ship.

---

## 3. Implement boundary

| Refine (this pass) | `@build-plan` |
| --- | --- |
| PLAN + CITDP + Tracker | Waves 0–7 |
| `pre_implementation` gate | Re-run if CITDP changes |
| No prose edits yet | §2.1 files |

---

## 4. Gate receipts (refine-plan)

| `pre_implementation` (pass 1) | **allowed: true** (minimal) | [`pre_implementation-2026-10-25T15-16-24-398Z.json`](gates/pre_implementation-2026-10-25T15-16-24-398Z.json) — gate MCP takes CITDP **inner body** (not YAML wrapper key) |

---

## 5. Related

| Artifact | Role |
| --- | --- |
| `fb-mvnyr5n2-aaeg1j` | Track A feedback entry |
| [`gf16-feedback-capture-closeout.md`](../REQ-GF16-KAIZEN-OUTCOME-CLOSE/evidence/gf16-feedback-capture-closeout.md) | Baseline evidence |
| `ARCH-TIED_CLIENT_FEEDBACK_CAPTURE` | Boundary decision |
| `REQ-TIED_FEEDBACK_REPORT_SKILL` | Existing `/feedback` install — extend, do not fork |

---

## Session handoff (2026-10-25)

Refine complete; **`@build-plan`** next. Log: [`evidence/session-handoff.md`](evidence/session-handoff.md).
