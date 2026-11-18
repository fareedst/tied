# HackerNoon observability contract — intent/verify compose

**Audience:** Sponsors, harness authors, and agents implementing TIED-tracked changes after reading [HackerNoon observability contract × TIED](../../docs/comparisons/hackernoon-observability-contract-ci-vs-tied-agent-management.md).

**Traceability:** [REQ-TIED_HACKERNOON_OBSERVABILITY_CONTRACT_WAVE3](../../tied-project/requirements/REQ-TIED_HACKERNOON_OBSERVABILITY_CONTRACT_WAVE3.yaml) · [ARCH-TIED_HACKERNOON_OBSERVABILITY_CONTRACT_WAVE3](../../tied-project/architecture-decisions/ARCH-TIED_HACKERNOON_OBSERVABILITY_CONTRACT_WAVE3.yaml) · [IMPL-TIED_HACKERNOON_OBSERVABILITY_CONTRACT_WAVE3](../../tied-project/implementation-decisions/IMPL-TIED_HACKERNOON_OBSERVABILITY_CONTRACT_WAVE3.yaml)

**Compose-don’t-replace:** This guide adds **intent vs verify** literacy for implement-complete claims—declared checklist/IMPL vs tests, manifests, and gate receipts. It does **not** adopt Conftest/LGTM/OPA as TIED core, mandate client Kubernetes policy, or treat receipt CI as **`tied_checklist_gate_validate`** authority (**`not_measured`** for HackerNoon fleet metrics).

---

## Proof boundary

| In scope | Out of scope |
| --- | --- |
| **Observably dead** operator cues: green chat, consistency pass without manifests | Conftest/Rego packs in stdd CI core |
| Opt-in **`implement-complete-receipt-contract`** on enrolled REQ folders | Global scan of all `tied-project/working/REQ-*` in v1 |
| Compose doc contract test + receipt validator tests | LGTM stack as TIED client dependency |
| Pair-read organizational sensing (Open Governance) vs **ops wiring** here | Receipt CI substituting **`tied_verify`** or gate JSON |
| **`tied_config_get_base_path`** before project YAML writes | HackerNoon compliance anecdotes as methodology proof |

Pattern: [tests vs checker-backed claims](tests-vs-checker-backed-claims.md) — separate **declared intent** from **verified proof**.

---

## Scope slice

TIED’s center of gravity is **software delivery intent** under `tied-project/`:

| TIED delivery plane (when enrolled) | Client SRE / fleet plane |
| --- | --- |
| Checklist slugs, IMPL PRE/POST, pseudo-code validate | K8s manifest minimums (**HackerNoon-reported**) |
| **`tied_checklist_gate_validate`** receipts | Conftest deny rules in PR CI |
| Tests + optional **`tied_verify`** | Nightly log JSON schema audit |
| Evidence envelopes + session handoffs | Prometheus/Loki/Tempo wiring |
| Opt-in receipt validator on **closed** enrolled folders | Fleet-wide compliance dashboards |

Label essay rollout and compliance timelines **`not_measured`** unless a sponsor evaluation cohort exists.

---

## Intent vs verify table

| Layer | Intent (declared) | Verify (executed) | TIED surface |
| --- | --- | --- | --- |
| Essay CI | Manifest annotations present at merge | Nightly live log shape audit | CITDP `change_definition` + IMPL PRE |
| Methodology close-out | Agent claims implement-complete | Gate JSON + tests green | **`tied_checklist_gate_validate`** |
| Wave 3 compose | PLAN slices + operator checklist | Doc contract tests | `hackernoon-observability-contract-compose-doc.test.mjs` |
| Enrolled REQ folder | `plan_phase: closed` in PLAN | `verification-evidence-manifest.v1.json` + handoff refs | **`implement-complete-receipt-contract.mjs`** |
| Harness calm | Long green chat | HTOL observations (optional) | Not gate receipts |

---

## Observably dead catalog

Green signals that may hide missing proof on the TIED plane:

- **`tied_validate_consistency` pass** without verification gate receipts or command manifests.
- **Stub capture + analysis** linked in chat with no `commands[]` evidence in handoff.
- **Skill prose** describing observability without checklist activation JSON.
- **Pre-handoff charter** cited without executable command battery attached.
- **Comparison Phase Implemented** row updated before contract tests are green (LEAP order violation).
- **Wrong `TIED_BASE_PATH`** — YAML writes land in another clone silently.

**Operator checklist:** [intent-verify operator checklist](../../tied-project/working/REQ-TIED_HACKERNOON_OBSERVABILITY_CONTRACT_WAVE3/intent-verify-operator-checklist.md).

---

## Receipt contract schema

Opt-in enrollment (**v1:** explicit tokens only):

| Field | Role |
| --- | --- |
| `schemaVersion` | `implement-complete-receipt-enrollment.v1` |
| `enrolled_request_tokens[]` | REQ tokens subject to close-out rules |

**Canonical schema:** [implement-complete-receipt-enrollment.v1.json](schemas/implement-complete-receipt-enrollment.v1.json)

**Validator:** `tools/bootstrap/lib/implement-complete-receipt-contract.mjs` — export **`validateEnrolledCloseout(repoRoot, enrollmentPath)`**.

When `PLAN.md` contains **`plan_phase: closed`** (case-insensitive) for an enrolled token:

1. Require `evidence/verification-evidence-manifest.v1.json` with ≥1 `commands[]` entry (`command`, `exit_code`).
2. Require `evidence/session-handoff.md` to reference the manifest path, a `gates/` receipt path, **`non-tied-close`**, or an explicit **doc-only exception** string.

Non-goals v1: parse gate JSON bodies; default-scan every REQ folder.

---

## Pair-read

1. [HackerNoon observability contract × TIED](../../docs/comparisons/hackernoon-observability-contract-ci-vs-tied-agent-management.md) — primary Wave 2 analysis.
2. [Open Governance proof-boundary compose](governance-sensing-proof-boundary-compose.md) — organizational odourless harm (distinct COG).
3. [Netflix observability ontology × TIED](../../docs/comparisons/netflix-ontology-driven-observability-vs-tied-agent-management.md) — runtime identity graph (row 17).
4. [HPS authority-boundary operator checklist](../../tied-project/working/REQ-TIED_HARNESS_PLATFORM_SEAM/authority-boundary-operator-checklist.md).
5. [Harness trace observation loop](harness-trace-observation-loop.md) — session green-without-signal; not microservice paging.
6. [Pre-handoff verification charter](pre-handoff-verification-charter.md) — executable checks before handoff.

---

## CITDP prompt

Sponsor-facing bullets (paraphrase; essay **off-repo**):

- What **intent** does this change declare (PLAN, IMPL PRE, checklist items)?
- What **verify** artifacts prove it (tests, gate receipts, manifest `commands[]`)?
- Which **observably dead** patterns could succeed without **`tied_checklist_gate_validate`**?
- Did we run **`tied_config_get_base_path`** before MCP YAML writes?
- Are HackerNoon fleet metrics labeled **`not_measured`**?
- Beside in-scope gates, what **unwired proof** should `change_definition` name?

Policy pointer: [citdp-policy.md](citdp-policy.md) (intent vs verify paragraph).

---

## Anti-patterns

| Anti-pattern | Why it fails | Remedy |
| --- | --- | --- |
| Conftest as TIED gate substitute | No checklist JSON | **`tied_checklist_gate_validate`** |
| Receipt CI blocks without gates | Wrong authority plane | Document proof boundary; receipt CI advisory |
| Consistency-only close-out | No verify manifest | Pre-handoff charter + gate phase |
| Global REQ enrollment v1 | Costly without LEAP | Opt-in schema only |
| Essay compliance = TIED proof | **`not_measured`** | Separate evaluation cohort |
| HTOL = paging | Harness kaizen only | Client SRE owns fleet alerts |

---

## Related documents

- [Client development index](client-development-index.md) — Quick reads row
- [HackerNoon stub capture](../../docs/comparisons/hackernoon-observability-contract-ci.md)
- [AGENTS.md](../../AGENTS.md)