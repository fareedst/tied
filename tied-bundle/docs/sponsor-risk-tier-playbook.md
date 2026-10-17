# Sponsor risk-tier playbook

**Audience:** **Sponsors** and **reviewers** deciding how much human attention a TIED-tracked change needs before merge or handoff (Loop 1 — advisory process).

**Traceability:** [REQ-TIED_SPONSOR_RISK_TIER_PLAYBOOK](../../tied-project/requirements/REQ-TIED_SPONSOR_RISK_TIER_PLAYBOOK.yaml) · Claude comparison [Phase 2](../../docs/comparisons/claude-code-team-code-review-vs-tied.md#7-phased-approach-to-improving-tied-recommendations-only)

---

## Proof boundary

| In scope | Out of scope |
| --- | --- |
| **Advisory mapping** from **assurance profile**, CITDP **`depth_tier`**, and **gate_policy** to expected **sponsor/reviewer** attention | Automated risk classifiers, merge bots, or “zero-human” approval |
| Relating informal **low / medium / high** review tiers (external articles) to TIED vocabulary | Replacing **`tied_checklist_gate_validate`**, **`tied_verify`**, or MCP gate receipts |
| **Hinge fields** and **consequence ladder** rungs for costly paths | **[REQ-TIED_DAE_VERIFICATION_CHARTER]** opt-in tooling (separate program) |
| Compose with [pre-handoff verification charter](pre-handoff-verification-charter.md) | PR comment volume or bot scores as TIED authority |

This playbook is **normative prose** for humans. Agents use it to **classify** attention and **escalate** **costly choices**; it does **not** auto-approve irreversible decisions.

---

## Sponsor review attention map

Record **`depth_tier`**, **`gate_policy`**, and **assurance profile** in CITDP at **`risk-assessment`** (see [quality-assurance](../../tied-project/vocab/quality-assurance.md)). The table below is **guidance**, not a shipped classifier.

| Informative tier (external studies) | Typical **`depth_tier`** | Assurance profile (selector) | Human review attention | **Consequence ladder** (see [sponsor–agent relationship](sponsor-agent-relationship.md)) |
| --- | --- | --- | --- | --- |
| **Low** — docs-only, reversible defaults, no new trust boundaries | `minimal` | `baseline-functional` | Agent proceeds on **reversible choice**; sponsor spot-checks handoff evidence ([pre-handoff charter](pre-handoff-verification-charter.md)) | Rung **1–2** |
| **Medium** — behavior change, bounded modules, no untrusted input | `minimal` → `integrated` when eligibility triggers match | `baseline-functional`; add profile rows in CITDP evidence matrix when warranted | Reviewer or sponsor confirms **verification** / gate receipts; watch **costly choice** backlog | Rung **2–3** |
| **High** — auth, network, persistence, external input, strict close-out | `integrated` or `strict_candidate` (no silent downgrade) | `external-input-security` and matrix rows per change | Sponsor **must** adjudicate **costly choices**; integrated inquiry artifacts when policy requires | Rung **3–4** |

**`gate_policy`:** `advisory` records findings without blocking progression by default; `strict` (when declared in CITDP) raises human confirmation requirements—still **not** auto-merge.

**Fresh-context review:** For **high** informal tier or large diffs, prefer a new session or handoff so review is not only same-thread fatigue (compose with pre-handoff charter).

---

## Hinge fields and costly choices

| Concept | Playbook use |
| --- | --- |
| **Hinge field** | CITDP / tracker fields that need **measurement + consent** (`owner`, `approval` / `review_status`, evidence path, `expiry` when bounded) |
| **Reversible choice** | Documented default + audit trail; agent may proceed inside **delegated work envelope** |
| **Costly choice** | **Never** auto-approved—surface sponsor question at end of turn with recommended default |
| **Agency boundary condition** | Instrument branch optimizes execution; **person branch** owns intent and irreversible approvals |

When informal **high** tier aligns with **`depth_tier: integrated`**, expect **`sub-adversarial-inquiry-pass`** (when not waived) and identity-bound activation evidence at gates—not optional “nice-to-have” review.

---

## Related docs

- [Pre-handoff verification charter](pre-handoff-verification-charter.md) — Phase 1 executable checks ([REQ-TIED_PRE_HANDOFF_VERIFICATION_CHARTER](../../tied-project/requirements/REQ-TIED_PRE_HANDOFF_VERIFICATION_CHARTER.yaml))
- [Sponsor–agent relationship (methodology)](sponsor-agent-relationship.md) — consequence ladder diagram
- [Client development index](client-development-index.md) — scenario entry
- [Claude Code team code review × TIED](../../docs/comparisons/claude-code-team-code-review-vs-tied.md) — Phase 2 source

**Last updated:** 2026-10-17
