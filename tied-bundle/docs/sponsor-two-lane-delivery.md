# Sponsor two-lane delivery

**Tokens:** [REQ-TIED_SPONSOR_TWO_LANE_DELIVERY], [ARCH-TIED_SPONSOR_TWO_LANE_DELIVERY], [IMPL-TIED_SPONSOR_TWO_LANE_DELIVERY]

**Composes with:** [sponsor-agent-relationship.md](sponsor-agent-relationship.md) (consequence ladder, hinge fields) — does **not** replace reviewer or integrated inquiry authority.

---

## Proof boundary

This guide is normative for **when** sponsor Q&A is scheduled and **what evidence** selection requires. It does **not** auto-approve costly choices, hard-block mid-lane backlog under advisory policy, or merge reviewer rungs into sponsor lanes.

---

## Charter lane

**Charter lane** covers pre-code strategic sponsor decisions through the **`pre_implementation`** gate: intent, non-goals, success criteria, scope, and costly **what-to-build** choices. Unresolved items belong in **`sponsor_charter_backlog`** on the working CITDP (typed rows with decision_id, phase, lane, default_or_option, consequence_rung, disposition, evidence_refs).

---

## Selection lane

**Selection lane** covers post-code sponsor preference among **implemented** alternatives from **`verification`** through **`close_out`**. Every selectable option must cite **`selection_evidence`** (test id, demo path, feature flag, or gate receipt). Hypothetical options without product evidence are invalid.

---

## Mid-lane deferral

When the agent proceeds on a documented reversible default, record the item on the appropriate backlog and emit **`mid_lane_sponsor_deferral`** as a **warn-only** diagnostic under advisory **`gate_policy`** (W3+) — no extra sponsor chat turn and no hard-block at gates unless a future REQ authorizes blocking.

---

## Operator flow

1. At **translate-sponsor-intent**, classify touchpoints as charter vs selection.
2. At **risk-assessment**, batch charter-lane costly choices into **`sponsor_charter_backlog`**.
3. At **verification-gate**, validate **`selection_evidence`** before accepting selection-lane preference.
4. Use MCP **`tied_sponsor_questions`** for lane-filtered readout (read-only; no YAML writes).

See also [client-development-index.md](client-development-index.md) quick read row for this guide.
