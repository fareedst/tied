# Multi-step × phase × wave handoff — morluto/rea × TIED

**handoff_kind:** multi_step_phase_wave · **updated:** 2026-11-08 · **token:** `DOC-MORLUTO-REA-COMPARISON`  
**source:** [morluto/rea](https://github.com/morluto/rea) · **process:** `@external-service-comparison` · [three-wave template](../../../tied-bundle/docs/external-service-three-wave-comparison-template.md)

| Field | Value |
| --- | --- |
| **Status** | Waves **1–3** **done** · traceable commit **`4257f91b`** |
| **Active** | `wave_3` / `phase_0_git_closeout` |
| **Depth** | `minimal` · outreach doc-only · **no REQ mint** |
| **Proof** | No REA run from stdd · no `tied_validate_consistency` |

**Compose:** REA = reverse-engineering MCP + skills (Cursor, etc.). TIED = REQ→ARCH→IMPL + gates + `tied-project/` YAML on **TIED MCP only**. REA Evidence ≠ requirements or gates.

| Deliverable | Path |
| --- | --- |
| Wave 1 | [morluto-rea-reverse-engineering.md](../../../docs/comparisons/morluto-rea-reverse-engineering.md) |
| Wave 2 | [morluto-rea-reverse-engineering-vs-tied-agent-management.md](../../../docs/comparisons/morluto-rea-reverse-engineering-vs-tied-agent-management.md) |
| Plan (W1–2) | [PLAN-refine-pass1.md](./PLAN-refine-pass1.md) |
| Plan (W3) | [PLAN.md](./PLAN.md) |
| Upstream receipt | [evidence/target-repo-receipt.md](./evidence/target-repo-receipt.md) |

**Owns:** RE MCP, dual-MCP seam, Evidence discipline. **Not:** Open Ontologies, Traefik seam doc, Google skills, Trail-Code pre-read.

---

## Macro pipeline (resume here)

| Step | Wave | Task | Status |
| ---: | --- | --- | :---: |
| 01 | 1 | Session bootstrap + PRELOAD | done |
| 02 | 1 | Working folder + plan + tracker | done |
| 03 | 1 | Wave 1 capture markdown | done |
| 04 | 2 | Wave 2 analysis (14 sections) | done |
| 05 | 2 | `.gitignore` allowlist | done |
| 06 | 2 | Doc verification ([build-plan-handoff](./evidence/build-plan-handoff.md)) | done |
| 07 | 3 | **Traceable commit** | **done** (`4257f91b`) |
| 08 | 3 | Wave 3 harness compose (`build-plan`) | **done** |

---

## Wave 1 — Summarize service (capture) · **done** 2026-11-08

**Deliverable:** `docs/comparisons/morluto-rea-reverse-engineering.md`

### Phase 0 — Bootstrap

- [x] Resolve slug `DOC-MORLUTO-REA-COMPARISON` / file names
- [x] Create `tied-project/working/DOC-MORLUTO-REA-COMPARISON/`
- [x] Read-only target evidence → [target-repo-receipt.md](./evidence/target-repo-receipt.md)

### Phase 1 — Capture write

- [x] Metadata table + TL;DR + observation boundary
- [x] Sibling link → Wave 2 analysis path

---

## Wave 2 — Compare to TIED · **done** 2026-11-08

**Deliverable:** `docs/comparisons/morluto-rea-reverse-engineering-vs-tied-agent-management.md`

### Phase 0 — Skeleton

- [x] Analysis metadata + executive summary

### Phase 1 — Template parity

- [x] All **14** sections + authority mermaid

### Phase 2 — Verification

- [x] Token grep — no bracket REQ/ARCH/IMPL mint in bodies
- [x] Claim labels + reciprocal Wave 1 ↔ Wave 2 links

---

## Wave 3 — Improve TIED · **done** 2026-11-08 (doc compose)

Canonical plan: [PLAN.md](./PLAN.md) · Tracker: [checklist-tracker-wave3.yaml](./checklist-tracker-wave3.yaml) · Handoff: [evidence/session-handoff.md](./evidence/session-handoff.md)

Promotion requires **`build-plan`** for disk edits — not comparison prose alone.

### Phase 0 — Publish Waves 1–2 · **done**

- [x] Git allowlist `!docs/comparisons/morluto-rea-*.md`
- [x] **Traceable commit** `4257f91b` — comparisons, working folder, bundle docs, CITDP, `.gitignore`

### Phase 1 — Doc compose · **done** 2026-11-08

- [x] Client-development-index dual-MCP note
- [x] Harness-trace external-investigation MCP pointer
- [x] Evidence: [build-plan-wave3-handoff.md](./evidence/build-plan-wave3-handoff.md)

### Phase 2 — Matrix row · **done** 2026-11-08

- [x] `methodology-composition-matrix.md` §2 row **19** — sponsor review per matrix §0
- [x] Evidence: [build-plan-matrix-row-handoff.md](./evidence/build-plan-matrix-row-handoff.md)

### Phase 3 — Behavior (optional)

- [x] Vocab RECORD — [`external-investigation-mcp.md`](../../../vocab/external-investigation-mcp.md) (2026-11-08)
- [x] Dual-MCP operator checklist — [dual-mcp-operator-checklist.md](./dual-mcp-operator-checklist.md) (2026-11-08); REA → **`@add-feature` to TIED** (existing-implementation or transform R+A+I); no R/A/I mint from investigation
- [—] **REA install / stdd CI bundle** — **OutOfScope** for this initiative; separate sponsor effort

---

## Do next (priority)

1. Sponsor **traceable commit** / **`@non-tied-close`** — see [session-handoff](./evidence/session-handoff.md).
2. **`git push`** — branch is ahead of `origin/main` (sponsor-owned).

## Non-adoptions

- REA as TIED core · Ghidra/Hopper/IDA as methodology deps · REA badges as TIED effectiveness · YAML/LEAP from comparison text · **REA install / stdd CI** (separate effort).

## Verify

```bash
REPO="/Users/fareed/Documents/dev/chatgpt/stdd"
git -C "$REPO" status --short \
  docs/comparisons/morluto-rea-*.md \
  tied-project/working/DOC-MORLUTO-REA-COMPARISON/ .gitignore
```

## Changelog

- **2026-11-08** — `build-plan`: [dual-mcp-operator-checklist.md](./dual-mcp-operator-checklist.md); [build-plan-dual-mcp-checklist-handoff.md](./evidence/build-plan-dual-mcp-checklist-handoff.md).
- **2026-11-08** — Sponsor: **REA install / stdd CI** removed from initiative scope (separate effort); plans/handoffs/matrix row 19 sponsor_notes updated.
- **2026-11-08** — `build-plan` phase 2: matrix §2 row 19; [build-plan-matrix-row-handoff.md](./evidence/build-plan-matrix-row-handoff.md).
- **2026-11-08** — `build-plan` wave 3: client-development-index, HTOL, phased table, CITDP persist; see [build-plan-wave3-handoff.md](./evidence/build-plan-wave3-handoff.md).
- **2026-11-08** — `add-feature` wave 3: PLAN.md, test-strategy, tracker, CITDP draft, session-handoff steps; phase 1 promoted from defer to planned.
- **2026-11-08** — Waves 1–2; allowlist; this handoff tracker (markdown).
