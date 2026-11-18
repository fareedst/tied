# TIED methodology release 4.3.0 (non-TIED plan)

**Slug:** `tied-methodology-release-4-3-0`  
**Track:** `@non-tied-plan` → `@non-tied-refine` → `@non-tied-build` → `@non-tied-close`  
**Precedent:** [tied-methodology-release-4-2-0](../tied-methodology-release-4-2-0/PLAN.md) · [REQ-TIED_METHODOLOGY_RELEASE_4_1_0 PLAN](../../working/REQ-TIED_METHODOLOGY_RELEASE_4_1_0/PLAN.md)

**Sponsor intent (locked):** Bump **4.2.2 → 4.3.0** (minor); promote full **`[Unreleased]`** body to **`## [4.3.0] - 2026-11-18`**; align live authority pins; `./tied-install.sh --refresh` and witness **`tied-bundle/install.json`**. No project REQ/ARCH/IMPL YAML.

---

## Refine summary (2026-11-18)

- **VRAI vs RDB:** Operator README and changelog **headline** rows come from enrolled **`[REQ-*]`** intent; trial readouts and close-out envelopes stay at session **4.2.2** (RDB truth).
- **Changelog gap:** **`[REQ-TIED_AS_OPERATED_BASELINE]`** close-out complete but **missing** from store `CHANGELOG.md` — **lead** the promoted `[4.3.0]` **Added** section with that row (then existing `[Unreleased]` bullets).
- **Changelog scope:** **Full** promote (precedent 4.1.0 / 4.2.0); reset empty `[Unreleased]`.
- **Inventory:** `rg '4\.2\.2'` → **127** paths — **~14** live (VRAI), **~113** frozen (RDB); see [evidence/version-inventory.md](evidence/version-inventory.md).
- **README:** Locked **Release highlights (4.3.0)** below; verify with `store-readme-structure.test.ts`.
- **Vocab:** `@non-tied-build` updates [tied-methodology.md](../../vocab/tied-methodology.md) **methodology release** row + link to this plan (`phase-g-vocab-link` if validate fails).

---

## VRAI + RDB lens

| Layer | Release role | Action |
|-------|----------------|--------|
| **VRAI** | README themes, new changelog lead row, live MCP examples | Update authority + contracts only |
| **RDB** | Readouts, facilitator evidence, stderr fixtures, historical `[4.2.2]` changelog section | **No mass edit** |

---

## Locked decisions

| Topic | Decision |
|-------|----------|
| **Semver** | Minor **4.3.0** |
| **Authority** | [VERSION](../../../VERSION), [AGENTS.md](../../../AGENTS.md) |
| **Changelog** | Full `[Unreleased]` → `## [4.3.0] - 2026-11-18`; **prepend** `[REQ-TIED_AS_OPERATED_BASELINE]` if absent |
| **README** | Approved copy below (replaces **4.2.2** block) |
| **Frozen** | Patterns in [version-inventory.md](evidence/version-inventory.md) |
| **Witness** | `tied-bundle/install.json` after refresh on store root `.` |

### Approved README copy (insert verbatim)

Placement: after opening paragraph, **before** `## How to use this README` (no new H2).

```markdown
**Release highlights (4.3.0):** Methodology minor since 4.2.2 — **VRAI vs as-operated RDB (phases 0–7)**, harness evaluation corpus + model-eval platform, WF disposable closeout stack, and external methodology comparison waves. Full notes: [CHANGELOG — 4.3.0](CHANGELOG.md#430---2026-11-18).

- **As-operated baseline** — Checklist facet `as_operated_baseline`; Snapshot-A/B at composition-integration and verification-gate when `mode: active`; VRAI design ≠ RDB evidence ([REQ-TIED_AS_OPERATED_BASELINE], [PROC-TIED_AS_OPERATED_BASELINE]).
- **Harness evaluation** — Facilitator corpus under `docs/agent-harness-evaluation/`; `@tied/harness-eval` M1/M2 cohort and trial costing ([REQ-AGENT_HARNESS_EVALUATION_DOCS], [REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM]).
- **WF disposable closeout** — CITDP gate hydration, minimal progression waivers, verification receipt assist, slim inter-turn tracker ([REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION], [REQ-WF_TRIAL_DISPOSABLE_CLOSEOUT_READINESS], [REQ-WF_TRIAL_SLIM_TRACKER_INTER_TURN]).
- **Agentstream operator stderr** — Elapsed-offset `DIAGNOSTIC:` / `DEBUG:` lines shared across shell and TypeScript orchestrators ([REQ-AGENTSTREAM_OPERATOR_STDERR_ELAPSED]).
- **Harness platform taxonomy** — Sponsor ↔ TIED vocabulary for benchmarking and `/xlate` ([REQ-TIED_HARNESS_PLATFORM_TAXONOMY]).
- **Comparison compose waves** — External-service stub policy plus Wave 3 tracks (Meta Astryx, HackerNoon, Furmanov, LangChain, Open Governance, and related) ([REQ-TIED_EXTERNAL_SERVICE_COMPARISON]).
```

Also bump **`TIED Methodology Version`** line at README top and [docs/tied-experience/index.md](../../../docs/tied-experience/index.md).

---

## Phases

See [evidence/session-handoff.md](evidence/session-handoff.md) **Plan execution steps**.

| Phase | Slug | Work |
|-------|------|------|
| A | `phase-a-inventory` | Confirm inventory; no frozen edits |
| B | `phase-b-authority` | `VERSION`, `AGENTS.md`, README + hub, approved blurb |
| C | `phase-c-live-pins` | MCP contracts + `tied-methodology-version.test.ts`; `agent-loader-sync.test.mjs` store semver fixtures if tests read `VERSION` |
| D | `phase-d-changelog` | Promote `[Unreleased]`; lead with AS_OPERATED row |
| E | `phase-e-refresh-validate` | [test-strategy.md](test-strategy.md) battery |
| F | `phase-f-close` | Release commit; handoff hash |
| G | `phase-g-vocab-link` | `tied-methodology.md` release row → this plan + 4.3.0 anchor |

---

## Risks

| Choice | Ladder | Notes |
|--------|--------|-------|
| Full vs trimmed `[Unreleased]` | Reversible pre-commit | **Full** (locked) |
| Mass readout semver edit | **Forbidden** | Falsifies RDB |
| `conversation-adherence-score.test.mjs` | Check at build | Currently pins **4.2.0** — update only if test asserts **live** store semver |

---

## Handoff

**Next:** `@non-tied-build` — paths: `tied-project/non-tied-plans/tied-methodology-release-4-3-0/`