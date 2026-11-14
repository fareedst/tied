# PLAN — Harness platform taxonomy (sponsor ↔ TIED vocabulary)

| Field | Value |
| --- | --- |
| **request_token** | `REQ-TIED_HARNESS_PLATFORM_TAXONOMY` (mint at `@build-plan`) |
| **working_slug** | `REQ-TIED_HARNESS_PLATFORM_TAXONOMY` |
| **`program_phase`** | **closed** — close-out 2026-11-14 |
| **`plan_phase`** | `close-out-complete` |
| **Primary source** | Sponsor `/xlate` session (2026-11-14): model vs harness vs platform; where `tied agentstream` lives; TIED category for benchmarking |
| **Pre-landed RECORD** | [`harness-platform-taxonomy.md`](../../vocab/harness-platform-taxonomy.md) + routing / `domain-references` / cross-links |
| **depth_tier** | `minimal` |
| **gate_policy** | `advisory` |
| **methodology_surface_change_class** | `prompt_type_workflow` (vocab + doc cross-links; optional contract test) |
| **Operator interruption budget** | **Low** — no CLI behavior change; no default env flips |

## Refine resolution

| Sponsor term | TIED resolution |
| --- | --- |
| **Harness** (Cursor, Claude Code) | **`vendor agent harness`** · **`harness profile`** (`HARNESS` / `--harness` = `cursor` \| `claude`) |
| **Model** | **`MODEL_SLUG`**, **`MODEL_CONFIG`**, **model effort** — separate matrix dimension |
| **Coding agent platform** | **`vendor platform`** (informal) — not TIED methodology |
| **`tied agentstream`** | **Workflow orchestrator** / **checklist operator CLI** — drives vendor harnesses; implementation `mcp-server/packages/agentstream/` |
| **TIED (category)** | **Agent management** · **platform-adjacent governance** — Traefik L2 seam ([REQ-TIED_HARNESS_PLATFORM_SEAM](../../requirements/REQ-TIED_HARNESS_PLATFORM_SEAM.yaml)) |
| **xlate / benchmarking** | PRELOAD [`harness-platform-taxonomy.md`](../../vocab/harness-platform-taxonomy.md) row **2c** before HMEP / agentstream / WF trial docs |

**LEAP relationship:** Extends closed **HPS** vocabulary seam without re-opening agentstream code. **Compose-don't-replace** with [`prompt-composer.md`](../../vocab/prompt-composer.md) **harness profile** (prompt-type scope) — disambiguation lives in taxonomy glossary § *Distinct from prompt-type harness profile*.

## Explicit non-goals

| Non-goal | Rationale |
| --- | --- |
| Renaming `HARNESS=` env or `--harness` flag | Operator contract frozen; glossary bridges sponsor language only |
| New agentstream drivers or default harness flip | Out of scope |
| Merging HMEP metrics into `@record-wf-trial` grading | Existing **proof boundary** ([`harness-model-eval.md`](../../vocab/harness-model-eval.md)) |
| Full REQ stack duplication of Traefik comparison | Comparison doc stays reference; taxonomy is PRELOAD target |

## Phased slices (`@build-plan` executes)

### Slice A — Vocab VALIDATE (mostly done)

**Status:** RECORD landed in prior agent turn.

**Build-plan remainder:**

- Touchpoint 3 audit: alphabet index + routing keywords cover sponsor matrix terms (`AI coding agent`, `workflow orchestrator`, `vendor platform`).
- Fix drift if grep finds duplicate definitions outside owning glossary.

**Acceptance:** `harness-platform-taxonomy.md` is sole sponsor bridge; cross-topic note in `domain-references.md` present.

### Slice B — Operator discoverability

| File | Change |
| --- | --- |
| [`tools/bundled-xlate-skill/SKILL.md`](../../../tools/bundled-xlate-skill/SKILL.md) | Step **RESOLVE**: when harness/platform/model benchmarking keywords match, PRELOAD **`harness-platform-taxonomy.md`** (not only generic routing). |
| [`tied-project/vocab/project-operations-mcp.md`](../../vocab/project-operations-mcp.md) | **`/xlate`** row: link taxonomy glossary for harness benchmarking. |
| [`docs/comparisons/traefik-harness-platform-vs-tied-agent-management.md`](../../../docs/comparisons/traefik-harness-platform-vs-tied-agent-management.md) | One executive-summary bullet: canonical sponsor bridge → taxonomy glossary (no token mint in comparison file). |
| [`tied-project/working/REQ-TIED_HARNESS_PLATFORM_SEAM/authority-boundary-operator-checklist.md`](../REQ-TIED_HARNESS_PLATFORM_SEAM/authority-boundary-operator-checklist.md) | Optional one-line pointer under harness vocabulary (skip if redundant). |

**Acceptance:** Operator following `/xlate` + harness keywords reaches taxonomy without ad-hoc search.

### Slice C — TIED traceability (build-plan)

Mint **`REQ-TIED_HARNESS_PLATFORM_TAXONOMY`** (+ ARCH/IMPL minimal) with satisfaction criteria:

| ID | Criterion | Metric |
| --- | --- | --- |
| **SC-HPT-VOCAB** | `tied-project/vocab/harness-platform-taxonomy.md` exists with sponsor bridge + three-layer placement + WF matrix dimensions | File + section audit |
| **SC-HPT-ROUTE** | `routing.md` row **2c** keywords include benchmark / xlate harness terms | Table audit |
| **SC-HPT-XLATE** | Bundled **xlate** skill cites taxonomy for harness/model/platform RESOLVE | Skill diff |
| **SC-HPT-RELATE** | `REQ-TIED_HARNESS_PLATFORM_SEAM` `related_to` includes taxonomy REQ; HMEP REQ cross-ref glossary in detail or related_to | `tied_validate_consistency` |

**IMPL:** Doc-only pseudo-code optional; no production runtime blocks unless contract test added.

### Slice D — Regression guard (optional, sponsor confirm at build-plan)

| Option | Cost |
| --- | --- |
| **D1 (recommended)** | `tools/bootstrap/lib/vocab-harness-platform-taxonomy-contract.test.mjs` — asserts routing row links file; taxonomy links `agentstream.md` + Traefik comparison; **no** full prose snapshot |
| **D2** | Skip test; manual VALIDATE only at close-out |

**Default:** **D1** if build-plan timeboxed &lt; 1h; else **D2** with close-out evidence note.

## Module boundaries

```text
tied-project/vocab/harness-platform-taxonomy.md     # canonical (landed)
tied-project/vocab/routing.md                       # landed
tied-project/vocab/domain-references.md             # landed
tools/bundled-xlate-skill/SKILL.md                  # slice B
tied-project/vocab/project-operations-mcp.md        # slice B
docs/comparisons/traefik-harness-platform-vs-tied-agent-management.md  # slice B
tied-project/requirements|architecture|implementation-decisions/     # slice C @ build-plan
tools/bootstrap/lib/vocab-harness-platform-taxonomy-contract.test.mjs  # slice D optional
```

## refine-plan delta (2026-11-14)

- Created linked PLAN from prior **`/add-feature`** vocab RECORD (no PLAN existed on invoke).
- Locked **LEAP-on-HPS** posture: new REQ for taxonomy traceability; do not reopen HPS implementation status.
- **`plan_phase`:** `pre-implementation` — tokens mint at **`@build-plan`**.

## Do next

**`@build-plan`** with linked plan: `tied-project/working/REQ-TIED_HARNESS_PLATFORM_TAXONOMY/PLAN.md`