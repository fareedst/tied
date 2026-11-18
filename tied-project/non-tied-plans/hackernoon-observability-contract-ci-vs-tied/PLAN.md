# Plan: HackerNoon observability contract CI × TIED (Wave 1–2)

**Slug:** `hackernoon-observability-contract-ci-vs-tied`  
**Track:** `non-tied-refine` (this revision) → `@non-tied-build` → optional `@non-tied-close`  
**Source:** [Your CI Pipeline Should Reject Any Service Without an Observability Contract](https://hackernoon.com/your-ci-pipeline-should-reject-any-service-without-an-observability-contract) (2026-06-23; Akhil — **HackerNoon-reported**)  
**Skill:** [@external-service-comparison](../../../tools/bundled-prompt-type-skills/external-service-comparison/SKILL.md)  
**Template:** [external-service-three-wave-comparison-template.md](../../../tied-bundle/docs/external-service-three-wave-comparison-template.md) Wave 1 + Wave 2 (14 sections)

---

## Scope

Doc-only **Wave 1 stub + Wave 2 comparison**: map Akhil’s **observability contract** practice (K8s manifest minimums, **OPA Conftest** CI **intent** gate, nightly **runtime** log audit; “observably dead” vs green CI) to TIED **agent-management** proof surfaces (checklist gates, evidence envelopes, **`tied_verify`**, skipped/not-run visibility, HTOL compose)—**not** adopting Conftest, Prometheus/Loki/Tempo, or client microservice policy as TIED core.

| Boundary | Choice |
| --- | --- |
| Wave 1 | `docs/comparisons/hackernoon-observability-contract-ci.md` — **stub only** (link + TL;DR; **no article body** per sponsor) |
| Wave 2 | `docs/comparisons/hackernoon-observability-contract-ci-vs-tied-agent-management.md` |
| Publish | Git allowlist — two `!docs/comparisons/…` lines in root `.gitignore` |
| Parallel working | `tied-project/working/DOC-HACKERNOON-OBSERVABILITY-CONTRACT-CI-COMPARISON/` — outreach tracker; **no REQ mint** |
| Article text in repo | **Forbidden** — no pasted YAML/Rego/workflows; `evidence/url-fetch-receipt.md` theme bullets only |
| Matrix §2 new row | **Defer**; cross-link Netflix row **17**, Open Governance sensing, Traefik L2 in Related documents |
| Wave 3 | **Defer** — optional doc compose on “implement-complete observability contract” (receipts + skipped gates) unless sponsor scopes **`add-feature`** |

---

## Refine outcomes (Touchpoint 1 — RESOLVE)

**PRELOAD (read-only):** [quality-assurance.md](../../vocab/quality-assurance.md), [harness-platform-taxonomy.md](../../vocab/harness-platform-taxonomy.md), [sponsor-agent-relationship.md](../../vocab/sponsor-agent-relationship.md), [feedback-to-tied.md](../../vocab/feedback-to-tied.md). **No vocab RECORD** on this non-tied refine pass.

| Term | Resolved meaning |
| --- | --- |
| **Observability contract** | Minimum telemetry/probe/alert **manifest contract** before deploy; enforced as **hard CI gate** (**HackerNoon-reported**) |
| **Observably dead** | Service healthy by tests/health checks but **invisible** to monitoring/alerting (**HackerNoon-reported** narrative) |
| **Intent gate** | CI validates declared annotations/labels (structured logging, metrics port, trace propagation, alert rule ref, probes) |
| **Runtime audit** | Nightly verification that live logs/traces match declared shape — closes “lying annotation” gap (**HackerNoon-reported**) |
| **Harness-adjacent analogy** | “Green chat / green consistency” ≠ observable delivery; HTOL/session trace as **optional** compose |
| **Platform-adjacent proof** | **`tied_checklist_gate_validate`**, **`tied_verify`**, gate receipts, MCP **`tied-project/`** authority |

**Analytical center (this bundle):** *deploy-time SRE contract (intent + verification)* vs TIED *software-intent traceability and gate receipts*—**not** Netflix operational RDF flywheel, **not** organizational “cannot sense” board essay, **not** LangSmith/Cursor harness trace loops as primary subject.

**Gate:** Slug, stub Wave 1 (no body), sibling boundaries, Wave 3 **Defer**, matrix **Defer** — sponsor constraints absorbed; ambiguity cleared.

**Recorded depth:** `depth_tier: minimal`, `gate_policy: advisory`, `profile_depth: not_measured`, `change_class: comparisons_doc_only`.

---

## Deliverables (`@non-tied-build`)

| Artifact | Path | Required |
| --- | --- | --- |
| Wave 1 stub | `docs/comparisons/hackernoon-observability-contract-ci.md` | Yes |
| Wave 2 analysis (14 sections) | `docs/comparisons/hackernoon-observability-contract-ci-vs-tied-agent-management.md` | Yes |
| Git allowlist | `.gitignore` | Yes |
| Sibling backlinks | Netflix observability, Open Governance sensing, Traefik, HTOL, Ludanyi (green metrics) | Yes |
| Skill examples row | `tools/bundled-prompt-type-skills/external-service-comparison/examples.md` | Yes |
| DOC working | `tied-project/working/DOC-HACKERNOON-OBSERVABILITY-CONTRACT-CI-COMPARISON/*` | Yes |
| Matrix header sibling link | `docs/comparisons/methodology-composition-matrix.md` **Sibling docs** line | Optional (one-line index) |

---

## Distinct from

| Sibling | Owns | This plan owns |
| --- | --- | --- |
| [Netflix observability ontology × TIED](../../../docs/comparisons/netflix-ontology-driven-observability-vs-tied-agent-management.md) | Ops RDF graph, MELT, AutoRCA | **K8s CI manifest contract** + Conftest intent gate |
| [Open Governance cannot sense × TIED](../../../docs/comparisons/open-governance-cannot-sense-vs-tied-agent-management.md) | Board/organizational sensing, odourless harm | **SRE telemetry wiring** when stack exists but unwired |
| [Traefik harness/platform × TIED](../../../docs/comparisons/traefik-harness-platform-vs-tied-agent-management.md) | L2 fleet egress observability | **In-repo methodology** gates/envelopes, not cluster OPA |
| [LangChain/Cursor harness × TIED](../../../docs/comparisons/langchain-harness-engineering-vs-tied-agent-management.md) | Harness trace/benchmark loops | Analogy only: green harness ≠ gate receipts |
| [Ludanyi × TIED](../../../docs/comparisons/andras-ludanyi-illusion-of-measurement-judgment-cooperation-vs-tied-agent-management.md) | People proxy metrics | **Ops green CI** vs missing telemetry contract |
| [Anthropic FV × TIED](../../../docs/comparisons/anthropic-llm-formal-verification-vs-tied-agent-management.md) | Checker-backed proof envelopes | Runtime log schema audit — different proof plane |

---

## Wave 2 content checklist (for build)

Executive summary must include center-of-gravity table and **compose-don’t-replace** one-liner; optional mermaid **intent vs verify** mapping (SRE plane vs TIED plane).

| § | Section | Build notes |
| --- | --- | --- |
| 1 | Executive summary | HackerNoon SRE vs TIED COG table; observably-dead ↔ checklist-without-receipts |
| 2 | Source summary | Incident, audit stats, five rules, Conftest CI, nightly audit, rollout claims — **HackerNoon-reported** only; **no code fences** |
| 3 | Sibling comparisons | Table above expanded |
| 4 | Harness lessons → TIED | Green CI/healthz → tests pass without receipts; intent annotations → IMPL/checklist declared vs verified |
| 5 | Touchpoint 1 — RESOLVE | Observability contract vs evidence envelope / gate contract vocabulary |
| 6 | Primary capability matrix | ~10 rows: contract, intent CI, runtime audit, alert wiring, probe semantics, wiki vs gate, post-mortem → Kaizen |
| 7 | Authority boundary | Client OPA **platform-adjacent**; TIED gates not waivable |
| 8 | Anti-patterns | Article fleet metrics as TIED proof; `tied_validate_consistency` as “observable”; Conftest as TIED core |
| 9 | Compose-don’t-replace | Borrow intent+verify literacy; keep MCP YAML + gate authority |
| 10 | Bounded recommendations | Recommendation-only (5–7): skipped visibility, pre-handoff charter, HTOL for harness slice |
| 11 | Phased recommendations | Phase 0 doc-only; Wave 3 **Defer** |
| 12 | Explicit non-adoptions | OPA/Rego pack, client LGTM stack, matrix row |
| 13 | Proof boundary | **not_measured**; no REQ mint in body |
| 14 | Related documents | [harness-trace-observation-loop.md](../../../tied-bundle/docs/harness-trace-observation-loop.md), [pre-handoff-verification-charter.md](../../../tied-bundle/docs/pre-handoff-verification-charter.md), siblings |

---

## Forbidden

- Pasting or committing HackerNoon article text (including large vendor code blocks)
- Project REQ/ARCH/IMPL YAML mutations from comparison prose
- Methodology composition matrix **§2 data row** without scoped REQ
- Claiming author rollout metrics as TIED effectiveness
- Substituting manifest intent checks for **`tied_checklist_gate_validate`** / **`tied_verify`**
- Automatic git stage, commit, or push

---

## Plan execution steps

1. [x] Refine PLAN + CITDP + test-strategy (`non-tied-refine`)
2. [x] Create DOC working folder + refine tracker + url-fetch evidence (themes only)
3. [x] Author Wave 1 stub capture
4. [x] Author Wave 2 analysis (14 template sections)
5. [x] Update `.gitignore`, sibling links, `examples.md`
6. [x] Verification grep (labels, links, section parity, no REQ mint, no article body)
7. [x] Update `evidence/session-handoff.md`; hand off paths to sponsor (`@non-tied-build`)

**Do next:** Optional **`@non-tied-close`** when sponsor requests git commit.