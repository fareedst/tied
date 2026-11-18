# Your CI Pipeline Should Reject Any Service Without an Observability Contract

| Field | Value |
| --- | --- |
| **Source** | [HackerNoon — Akhil](https://hackernoon.com/your-ci-pipeline-should-reject-any-service-without-an-observability-contract) — full article text is **not** stored in this repository |
| **Authors** | Akhil (**HackerNoon-reported**) |
| **Published** | 2026-06-23 (**HackerNoon-reported**, page metadata) |
| **Purpose** | External reference index for Wave 2 comparison — **link + summary only**; does not mint REQ/ARCH/IMPL tokens and does **not** reproduce the article body. |
| **Captured** | 2026-11-17 (summary for analysis); full-text capture **withheld** per sponsor (do not commit long-form article body or vendor code blocks) |
| **Analysis (sibling)** | [hackernoon-observability-contract-ci-vs-tied-agent-management.md](hackernoon-observability-contract-ci-vs-tied-agent-management.md) |
| **Plan (working)** | [PLAN-refine-pass1.md](../../tied-project/working/DOC-HACKERNOON-OBSERVABILITY-CONTRACT-CI-COMPARISON/PLAN-refine-pass1.md) |

---

## Why this file has no article body

An off-repo read was used to author the sibling analysis, but the **full post is not kept in-repo**. This stub retains metadata, **TL;DR**, and pointers. Read the essay at the **Source** link; do not paste the HackerNoon body or large YAML/Rego/workflow excerpts back into this repository.

**Off-repo read:** [Your CI Pipeline Should Reject Any Service Without an Observability Contract](https://hackernoon.com/your-ci-pipeline-should-reject-any-service-without-an-observability-contract)

---

## TL;DR

Summarizes themes used in the sibling analysis (**HackerNoon-reported**; read off-repo for wording; not independently verified here).

- **Observably dead:** A revenue-adjacent microservice stopped processing while tests and `/healthz` stayed green; monitoring never fired because structured logging was dropped during an extraction—**HackerNoon-reported** incident narrative (~47 minutes silent).
- **Stack vs wiring:** Prometheus, Grafana, Loki, Tempo, and Alertmanager were in place, but many services lacked SLOs, trace propagation, metrics ports, or structured logs—a **governance gap**, not a tooling budget gap (**HackerNoon-reported** cluster audit).
- **Observability contract:** Five minimum requirements (structured JSON logging declaration, named `metrics` port, W3C trace propagation declaration, Alertmanager rule-group reference, liveness + readiness probes) enforced before deploy—not a Confluence norm (**HackerNoon-reported**).
- **CI intent gate:** Open Policy Agent **Conftest** runs on rendered Helm/Kubernetes manifests in PR CI; deny rules block merge (**HackerNoon-reported**).
- **Intent vs verification:** Annotation-based rules trust declared intent at CI time; a **nightly runtime audit** checks live log JSON shape and opens issues when reality diverges (**HackerNoon-reported**).
- **Rollout claims:** Gate shipped with a compliance window; author reports full fleet compliance and no silent failures since—**HackerNoon-reported**; effectiveness **`not_measured`** in stdd.

---

## Notes for stdd readers

- Claims above are **summary-only** for comparison traceability. They are **not** independently verified in Wave 1–2 and must not be treated as TIED methodology proof.
- This essay is **client SRE / platform engineering**, not a TIED product spec. Wave 2 maps themes to TIED **agent-management proof boundaries**—**not** adoption of Conftest or the LGTM stack as TIED core.
- Effectiveness of either the author’s gate or TIED practices against silent-failure risk is **`not_measured`** unless an evaluation cohort is enrolled.
- **Wave 2:** [hackernoon-observability-contract-ci-vs-tied-agent-management.md](hackernoon-observability-contract-ci-vs-tied-agent-management.md) — observability contract × TIED agent management (**reference only**).