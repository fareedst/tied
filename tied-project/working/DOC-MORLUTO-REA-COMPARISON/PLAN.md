# morluto/rea × TIED — Wave 3 improve (harness compose)

| Field | Value |
| --- | --- |
| **Working token** | `DOC-MORLUTO-REA-COMPARISON` |
| **plan_phase** | `post-build` |
| **Refined** | 2026-11-08 (`add-feature` wave 3) |
| **Change class** | Harness compose — **doc-only** (Loop 2 Kaizen); **no REQ mint** |
| **Source analysis** | [morluto-rea-reverse-engineering-vs-tied-agent-management.md](../../../docs/comparisons/morluto-rea-reverse-engineering-vs-tied-agent-management.md) |
| **Waves 1–2** | [PLAN-refine-pass1.md](./PLAN-refine-pass1.md) · [multi-step-phase-wave-handoff.md](./multi-step-phase-wave-handoff.md) |
| **Tracker** | [checklist-tracker-wave3.yaml](./checklist-tracker-wave3.yaml) |
| **Test strategy** | [test-strategy.md](./test-strategy.md) |
| **CITDP (draft)** | [citdp-wave3-draft.yaml](./citdp-wave3-draft.yaml) — persist to `tied-project/citdp/` after **build-plan** if sponsor promotes |

**profile_depth:** `minimal` · **gate_policy:** `outreach_doc_only` · **depth_tier:** `minimal`

---

## Refine (Touchpoint 1 — RESOLVE)

**Invocation:** `@add-feature` wave 3 after Waves 1–2 complete.

**PRELOAD (session):** [quality-assurance.md](../../../tied-project/vocab/quality-assurance.md), [sponsor-agent-relationship.md](../../../tied-project/vocab/sponsor-agent-relationship.md), [tied-yaml-mcp.md](../../../tied-project/vocab/tied-yaml-mcp.md).

| Initiative | Wave 2 disposition | Wave 3 class | This plan |
| --- | --- | --- | --- |
| Publish comparison bundle (git) | Phase 0 **pending** | Operator close | **Required** — `@non-tied-close` or sponsor commit |
| Client-development-index × REA | Phase 1 **Defer** | Harness compose | **Required** — Quick reads row |
| HTOL external-investigation pointer | Phase 1 **Defer** | Harness compose | **Required** — context-discovery compose |
| Vocab RECORD (`REA Evidence`, dual MCP seam) | Phase 2 **Defer** | Vocab | **Optional** — costly; separate sponsor ask |
| Matrix §2 row | Phase 2 **Defer** | Matrix | **Optional** — sponsor review |
| Dual-MCP operator checklist (working doc) | Phase 3 **Defer** | doc-only | **Done** — [dual-mcp-operator-checklist.md](./dual-mcp-operator-checklist.md); R/A/I only via separate **`@add-feature`** |

**Out of scope (separate effort):** Installing or CI-bundling **REA** / `rea-agents`, native RE engines, or vendor MCP setup in stdd — not part of `DOC-MORLUTO-REA-COMPARISON`.

**Consequence ladder:** Phase 0–1 = **reversible** (doc + git). Matrix / vocab RECORD = **costly** when promoted; REA install is **not** on this initiative's ladder.

**Authority:** REA **Evidence** ≠ gate receipts; only **TIED YAML MCP** may mutate `tied-project/` YAML ([Wave 2 proof boundary](../../../docs/comparisons/morluto-rea-reverse-engineering-vs-tied-agent-management.md#proof-boundary)).

---

## Implement (build-plan scope)

### Phase 0 — Publish Waves 1–2

| Task | Path / action |
| --- | --- |
| Traceable commit | `docs/comparisons/morluto-rea-*.md`, `tied-project/working/DOC-MORLUTO-REA-COMPARISON/**`, root `.gitignore` allowlist |
| Verify scope | `git status --short` on paths in handoff **Verify** block |

**Note:** Commit is sponsor-owned; **`build-plan`** may run doc edits first; **`@non-tied-close`** may batch commit when sponsor approves.

### Phase 1 — Harness compose (doc-only)

| Task | Path | Acceptance |
| --- | --- | --- |
| Quick reads row | `tied-bundle/docs/client-development-index.md` | One row: REA reverse-engineering comparison + dual-MCP literacy; link Wave 2 analysis |
| HTOL pointer | `tied-bundle/docs/harness-trace-observation-loop.md` | **Context discovery** row or **Source studies** bullet: external target MCP (e.g. REA) read-only vs TIED YAML writes; cite morluto comparison |
| Wave 2 status sync | `docs/comparisons/morluto-rea-reverse-engineering-vs-tied-agent-management.md` § Phased recommendations | Phase 1 items → **Planned** or **Done** per build outcome |
| Handoff tracker | `multi-step-phase-wave-handoff.md` | Steps 07–08; Wave 3 phase table |

**Forbidden in this plan:** project REQ/ARCH/IMPL YAML; `methodology-composition-matrix.md` row without sponsor promotion; **REA install or CI bundling** (separate effort); effectiveness claims from REA badges.

---

## Wave 3 initiatives (template parity)

### Wave 3 initiative: Dual-MCP operator literacy

| Field | Value |
| --- | --- |
| **Source analysis** | [morluto-rea-reverse-engineering-vs-tied-agent-management.md](../../../docs/comparisons/morluto-rea-reverse-engineering-vs-tied-agent-management.md) |
| **Finding** | Client repos may run **TIED YAML MCP** and **external investigation MCP** (REA) together; only TIED may write `tied-project/`. |
| **Change class** | doc-only |
| **REQ token** | none |
| **Proof** | Link check; no bracket-token mint in comparison bodies; bundle doc review |
| **Out of scope** | REA as required TIED dependency; Ghidra/IDA in checklist |
| **Status** | done (2026-11-08 build-plan) |

### Wave 3 initiative: Dual-MCP operator checklist

| Field | Value |
| --- | --- |
| **Finding** | Wave 2 § dual-MCP checklist + **REA → `@add-feature` to TIED** (existing-implementation R+A+I or transform R+A+I for another platform) |
| **Change class** | doc-only working checklist |
| **REQ token** | none (enforcement REQ optional via future sponsor **`@add-feature`**) |
| **Proof** | [build-plan-dual-mcp-checklist-handoff.md](./evidence/build-plan-dual-mcp-checklist-handoff.md) |
| **Status** | done (2026-11-08 build-plan) |

### Out of scope: REA install / CI (separate effort)

| Field | Value |
| --- | --- |
| **Finding** | Operator may install REA locally; not tracked here |
| **Change class** | — |
| **REQ token** | none (future effort owns scope) |
| **Status** | **OutOfScope** for `DOC-MORLUTO-REA-COMPARISON` |

---

## Distinct from siblings

| Sibling | This plan does not |
| --- | --- |
| [Open Ontologies × TIED](../../../docs/comparisons/open-ontologies-repository-vs-tied-agent-management.md) | RDF plan/apply or Lean certs |
| [Traefik harness × TIED](../../../docs/comparisons/traefik-harness-platform-vs-tied-agent-management.md) | Harness/platform routing seam doc |
| [Google agent skills × TIED](../../../docs/comparisons/google-agent-skills-vs-tied-agent-management.md) | Skill-as-product CI semantics |

---

## Verification (no `tied_verify`)

- Grep comparison bodies for minted `[REQ-*]` / `[ARCH-*]` / `[IMPL-*]` in prose (must remain absent).
- `lint_yaml` on any new/changed YAML under working folder or CITDP after persist.
- **`tied_validate_consistency`** — **skip** until project index YAML changes (out of scope).

---

## Handoff

**Next:** `@build-plan` on this folder (`DOC-MORLUTO-REA-COMPARISON`).

Optional parallel: `@non-tied-close` for commit-only if docs already match plan (Phase 0).

**Do not:** `@close-out` alone while `plan_phase: pre-implementation`.
