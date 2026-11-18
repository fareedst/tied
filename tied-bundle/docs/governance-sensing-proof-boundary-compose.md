# Governance sensing — proof boundary compose

**Audience:** Sponsors, harness authors, and agents implementing or reviewing TIED-tracked changes after reading [Open Governance × TIED](../../docs/comparisons/open-governance-cannot-sense-vs-tied-agent-management.md).

**Traceability:** [REQ-TIED_OPEN_GOVERNANCE_SENSING_WAVE3](../../tied-project/requirements/REQ-TIED_OPEN_GOVERNANCE_SENSING_WAVE3.yaml) · [ARCH-TIED_OPEN_GOVERNANCE_SENSING_WAVE3](../../tied-project/architecture-decisions/ARCH-TIED_OPEN_GOVERNANCE_SENSING_WAVE3.yaml) · [IMPL-TIED_OPEN_GOVERNANCE_SENSING_WAVE3](../../tied-project/implementation-decisions/IMPL-TIED_OPEN_GOVERNANCE_SENSING_WAVE3.yaml)

**Compose-don’t-replace:** This guide adds **operator literacy** and **deliberate smell** for the software-delivery slice. It does **not** add MCP gate authority, board GRC product scope, or OpenGovernance effectiveness proof (**`not_measured`**).

---

## Proof boundary

| In scope | Out of scope |
| --- | --- |
| What TIED **can** sense in implementation repos: REQ→ARCH→IMPL graph, tests, checklist gates, YAML consistency, scoped evidence envelopes | Vendor model weights, HR outcomes, production traffic, board comfort, enterprise row ontologies |
| **Mercaptan-style** operator cues: gate JSON, skipped steps, `tied_config_get_base_path`, diagnostic labels | Replacing **`tied_checklist_gate_validate`** or **`tied_verify`** with essay themes or agent calm |
| Pair-read with Ludanyi + HPS authority checklist | Methodology-composition-matrix §2 row without parent MCM LEAP |
| CITDP **change_definition** literacy for **odourless zones** | Storing Tony Fish essay body in-repo |

Pattern: mirror [tests vs checker-backed claims](tests-vs-checker-backed-claims.md) — separate **claim class** from **proof surface**.

---

## Scope slice

TIED’s center of gravity is **shipped software delivery intent** under `tied-project/`:

| TIED senses (when enrolled) | TIED does **not** sense by default |
| --- | --- |
| Token graph coherence — **`tied_validate_consistency`** | Organizational politics behind sponsor comfort |
| Process allowance — **`tied_checklist_gate_validate`** receipts | Vendor “green dashboard” product metrics |
| Test-backed behavior on executed examples | All branches, all production inputs |
| PRELOAD vocabulary routing; two-layer client/methodology vocab | Cropped enterprise ontologies outside delivery scope |
| **`tied_config_get_base_path`** before project YAML writes | Silent cross-repo MCP mutation |

Label outreach metrics (OpenGovernance-reported, vendor-reported) **`not_measured`** for TIED effectiveness unless a separate evaluation cohort is scoped.

---

## Mercaptan analog table

Invisible harm (OpenGovernance literacy) → deliberate TIED **smell** for the traceability slice:

| Odourless harm (essay theme) | TIED smell (operator action) | Artifact |
| --- | --- | --- |
| Comfortable chat / green turns | Require gate receipt before implement-complete | `tied_checklist_gate_validate` JSON |
| “Consistency feels fine” | Run **`tied_validate_consistency`**; read failures | CLI/MCP validate output |
| Skipped checklist steps | Tracker disposition + gate phase mismatch | Checklist tracker YAML |
| Wrong implementation repo | **`tied_config_get_base_path`** before MCP writes | Config receipt |
| Agent narrated success | **`tied_verify`** when verification-gated; tests green | Verify + test logs |
| Harness felt productive | Optional **`tied_feedback_capture_observation`** | Kaizen id — **not** gate pass |

Mercaptan is **metaphor only** in v1 (no vocab RECORD); see phased comparison for optional RECORD.

---

## Odourless-zone catalog

Harms that may be real but have **no default sensor** in current TIED reporting — list beside in-scope proof in CITDP:

- **Vendor model / layer drift** — not observed by project unit tests unless explicitly fixture-scoped (**`not_measured`**).
- **Production traffic and incident shape** — out of repo proof boundary unless client REQ enrolls observability.
- **Board / sponsor comfort** — human judgment; not **`tied_verify`** input.
- **HR, legal, or people outcomes** — pair [Ludanyi × TIED](../../docs/comparisons/andras-ludanyi-illusion-of-measurement-judgment-cooperation-vs-tied-agent-management.md); delivery gates unchanged.
- **Uncropped enterprise ontology** — vocab PRELOAD is **scoped**; absence of a glossary file ≠ absence of organizational risk.
- **OpenGovernance-reported governance metrics** — outreach only; **`not_measured`** for stdd effectiveness.

**Operator checklist:** [odourless zones operator checklist](../../tied-project/working/REQ-TIED_OPEN_GOVERNANCE_SENSING_WAVE3/odourless-zones-operator-checklist.md).

---

## Pair-read

Read in this order when scoping a Wave 3 literacy pass:

1. [Open Governance “Cannot Sense” × TIED](../../docs/comparisons/open-governance-cannot-sense-vs-tied-agent-management.md) — instrument/frame limits (**OpenGovernance-reported**).
2. [Ludanyi illusion of measurement × TIED](../../docs/comparisons/andras-ludanyi-illusion-of-measurement-judgment-cooperation-vs-tied-agent-management.md) — people metrics and judgment.
3. [HPS authority-boundary operator checklist](../../tied-project/working/REQ-TIED_HARNESS_PLATFORM_SEAM/authority-boundary-operator-checklist.md) — harness vs platform-adjacent authority before YAML and batch turns.
4. [Harness trace observation loop](harness-trace-observation-loop.md) — observations compose with gates; they do not replace them.
5. [Pre-handoff verification charter](pre-handoff-verification-charter.md) — executable checks before handoff.

---

## CITDP prompt

Sponsor-facing bullets (paraphrase; full essay **off-repo**):

- What harms could be **real** yet **invisible** in our current TIED reporting for this change?
- Beside in-scope proof (tests, gates, consistency), which **odourless zones** should `change_definition` name?
- Are we treating **green chat** or token coverage as implement-complete without a **gate receipt**?
- Did we run **`tied_config_get_base_path`** before project YAML mutations?
- Are OpenGovernance or vendor metrics cited with **`not_measured`** unless an evaluation cohort exists?
- Which **costly choices** need sponsor sign-off vs **reversible** doc-compose?

Policy pointer: [citdp-policy.md](citdp-policy.md) (odourless zones paragraph).

---

## Anti-patterns

| Anti-pattern | Why it fails | Remedy |
| --- | --- | --- |
| **Green chat** as success | No checklist gate receipt | `tied_checklist_gate_validate` for scoped phase |
| **Token coverage alone** | Graph present ≠ behavior proven | Tests + verify policy when enrolled |
| **Agent as sensor** for implement-complete | Narration ≠ gate JSON | HPS row: observations ≠ gates |
| **`tied_validate_consistency` = product quality** | Index coherence ≠ shipped correctness | Pair tests-vs-checker-backed-claims guide |
| **HTOL observation = done** | Kaizen Loop 2 only | Gate at verification/close_out |
| **Essay themes → `tied_verify`** | Organizational sensing out of scope | Label **`not_measured`**; scope REQ |

---

## Related documents

- [Client development index](client-development-index.md) — Quick reads row
- [Open Governance stub capture](../../docs/comparisons/open-governance-cannot-sense.md)
- [Tests vs checker-backed claims](tests-vs-checker-backed-claims.md)
- [AGENTS.md](../../AGENTS.md) — MCP write path and checklist mandate