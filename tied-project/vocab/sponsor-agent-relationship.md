# Sponsor–agent relationship (canonical)

**Scope:** Operating principles for **sponsor**, **agent**, and **reviewer** roles; **instrument branch** vs **person branch**; **agency boundary condition**; **reversible choice** / **costly choice** taxonomy; **hinge field** and **consequence ladder**; **sponsor-vs-TIED disagreement** routing; failure modes **over-asking** and **instrumentalizing the sponsor**; **RESOLVE charter**.

**Traceability:** [REQ-TIED_SPONSOR_AGENT_RELATIONSHIP](../requirements/REQ-TIED_SPONSOR_AGENT_RELATIONSHIP.yaml) · [ARCH-TIED_SPONSOR_AGENT_RELATIONSHIP](../architecture-decisions/ARCH-TIED_SPONSOR_AGENT_RELATIONSHIP.yaml) · [IMPL-TIED_SPONSOR_AGENT_RELATIONSHIP](../implementation-decisions/IMPL-TIED_SPONSOR_AGENT_RELATIONSHIP.yaml)

**See also:** [`routing.md`](routing.md) · [`domain-references.md`](domain-references.md) · [`tied-methodology.md`](tied-methodology.md) · [`pseudocode-and-citdp.md`](pseudocode-and-citdp.md) · [`decision-copilot.md`](decision-copilot.md) · [`../docs/sponsor-agent-relationship.md`](../../tied-bundle/docs/sponsor-agent-relationship.md)

---

## Preferred terms vs synonyms

| Preferred | Avoid | Notes |
|-----------|-------|-------|
| **agent** | the AI, the model (alone) | AI coding assistant as **instrument** under a **delegated work envelope** |
| **sponsor** | user (alone), owner (alone) | Human with agency; owns intent, non-goals, approvals, irreversible choices |
| **reviewer** | approver (alone) | Human adjudicating review-gated artifacts; may be the sponsor |
| **delegated work envelope** | permission, scope (alone) | What the agent may do without asking: plan, CITDP, Tracker, documented defaults |
| **instrument branch** | system model (alone) | Observe → act → measure → adapt; failure is information |
| **person branch** | human model (alone) | Express → listen → choose → respect → adapt toward sponsor/reviewer |
| **agency boundary condition** | the boundary (alone) | Person → agency is a constraint; instrument → direct/optimize within envelope |
| **reversible choice** | cheap decision | Proceed on documented default; audit trail suffices to unwind |
| **costly choice** | expensive decision | Requires sponsor question with recommended default |
| **hinge field** | approval field (alone) | Dual measurement + consent; `owner`, `approval`/`review_status`, evidence path, `expiry` when bounded |
| **consequence ladder** | escalation path (alone) | Default → default+evidence → reviewer → sponsor (see relationship doc) |
| **sponsor-vs-TIED disagreement** | spec error (alone) | Route LEAP or sponsor question — not IMPL contradiction bin |
| **prohibited optimization target** | — | Sponsor agency, non-goals, approvals, disagreement |
| **over-asking** | hesitation | Human model applied to reversible agent work |
| **instrumentalizing the sponsor** | — | System model applied to sponsor choices or placeholder waivers |
| **RESOLVE charter** | — | RESOLVE canonicalizes **names** only; intent authority stays sponsor-owned |

Fleet **reversible sponsor choice (fleet)** / **costly sponsor choice (fleet)** in [`pseudocode-and-citdp.md`](pseudocode-and-citdp.md) are specializations of **reversible choice** / **costly choice**.

---

## Pseudo-code block names (IMPL)

| Block | Role |
|-------|------|
| `CLASSIFY_DECISION_CONSEQUENCE` | Map open decisions to consequence ladder rungs |
| `VALIDATE_HINGE_FIELD` | CITDP hinge-field hygiene diagnostics |
| `ROUTE_SPONSOR_TIED_DISAGREEMENT` | LEAP vs sponsor question routing |
| `AUDIT_RELATIONSHIP_LAYER_CONTRACT` | Static SC-SAR contract audit |

---

## Alphabetical index

- **agency boundary condition** — person vs instrument branch selector
- **agent** — instrument role
- **consequence ladder** — escalation rungs
- **costly choice** — sponsor question at end of turn
- **delegated work envelope** — bounded agent authority
- **hinge field** — measurement + consent maps in CITDP
- **instrument branch** — agent operating principle
- **instrumentalizing the sponsor** — failure mode
- **over-asking** — failure mode
- **person branch** — sponsor/reviewer operating principle
- **prohibited optimization target** — non-optimizable sponsor agency
- **RESOLVE charter** — names only, not intent authority
- **reviewer** — human adjudication role
- **reversible choice** — documented default proceed
- **sponsor** — human intent owner
- **sponsor-vs-TIED disagreement** — LEAP or costly question
