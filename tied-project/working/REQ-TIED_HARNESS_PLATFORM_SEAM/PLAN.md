# Implementation plan — Traefik harness vs platform × TIED agent management

| Field | Value |
| --- | --- |
| **request_token** | `REQ-TIED_HARNESS_PLATFORM_SEAM` |
| **working_slug** | `REQ-TIED_HARNESS_PLATFORM_SEAM` |
| **Primary source** | [traefik-harness-platform-vs-tied-agent-management.md](../../../docs/comparisons/traefik-harness-platform-vs-tied-agent-management.md) |
| **CITDP** | [CITDP-REQ-TIED_HARNESS_PLATFORM_SEAM.yaml](CITDP-REQ-TIED_HARNESS_PLATFORM_SEAM.yaml) |
| **Tracker** | [checklist-tracker.yaml](checklist-tracker.yaml) |
| **Test strategy** | [test-strategy.md](test-strategy.md) |
| **depth_tier** | `minimal` |
| **gate_policy** | `advisory` |
| **methodology_surface_change_class** | `prompt_type_workflow` (documentation + optional harness hooks only) |
| **Operator interruption budget** | Docs-only build-plan; **no new mandatory CLI flags**, **no default behavior flips**, **no IDE restart rituals**; opt-in preflight stays off |
| **program_phase** | **closed** — close-out commit `3c5c49f8` (2026-10-20) |
| **Linked close-out plan** | Cursor plan `hps_req_close-out_a5b032cf` (sponsor scope: HPS wave + Traefik comparison if diff) |

## Refine resolution

| Sponsor term | TIED resolution |
| --- | --- |
| **Harness** (Traefik L1) | **Agent execution surface** — IDE agent, prompt-type **Task** subagent, `@tied/agentstream` turn pipeline ([agentstream.md](../../vocab/agentstream.md)) |
| **Platform** (Traefik L2) | **Client platform layer** (defer gateways) + **TIED MCP governance plane** (YAML, gates, validate, sponsor ladder) |
| **Seam / authority boundary** | Harness turns vs **gate authority** / MCP writes / **consequence ladder** ([sponsor-agent-relationship.md](../../vocab/sponsor-agent-relationship.md)) |
| **Compose-don't-replace** | Tune orchestration in harness; keep **`tied_checklist_gate_validate`**, MCP YAML authority, **`tied_verify`** on platform-adjacent plane |
| **Minimal operator interruption** | Additive doc cross-links and one short checklist; operators discover guidance in existing bootstrap paths (AGENTS.md, tied-yaml skill, agentstream README) without new gates or env defaults |
| **Unblock where possible** | Single documented path (base path → then YAML); clarify delegation ≠ gate waiver; reference closed [REQ-TIED_TOOL_INPUT_COMPATIBILITY](../../requirements/REQ-TIED_TOOL_INPUT_COMPATIBILITY.yaml) at MCP seam |
| REQ name | **`REQ-TIED_HARNESS_PLATFORM_SEAM`** (preferred over `REQ-TIED_AGENT_HARNESS_AUTHORITY` — emphasizes bootstrap seam + Traefik mapping) |

**Vocab RECORD:** Terms recorded in this PLAN and IMPL pseudo-code; **build Slice B** may add at most one **harness profile** row in [prompt-composer.md](../../vocab/prompt-composer.md) if the activation map alone is insufficient (cross-ref sponsor-agent + prompt-composer glossaries; no duplicate taxonomy).

**Related closed arcs (reference only):** [REQ-TIED_CLAUDE_HARNESS](../../requirements/REQ-TIED_CLAUDE_HARNESS.yaml) (thin cross-link if needed); [REQ-TIED_TOOL_INPUT_COMPATIBILITY](../../requirements/REQ-TIED_TOOL_INPUT_COMPATIBILITY.yaml) (implemented — structured record input + `DIAGNOSTIC: TIED_CLI_HINDRANCE` in harness MCP seam docs).

## Explicit non-goals (build-plan must not expand into)

| Non-goal | Rationale |
| --- | --- |
| Traefik **Triple Gate** product stack or shipping an enterprise MCP gateway | Client-owned egress; comparison names the seam only |
| Fleet SSO, FinOps, regional model routing, TBAC at gateway | **Defer** to client platform; matrix row 13 must not invent fleet controls |
| Vendor benchmark anecdotes (Terminal-Bench, Cursor harness team, etc.) as TIED effectiveness | Traefik-reported / **not_measured** until enrolled experiments |
| Authorization or gate waivers encoded only in `.cursor/skills` / subagent prompts | Violates [ARCH-TIED_HARNESS_PLATFORM_SEAM](../../architecture-decisions/ARCH-TIED_HARNESS_PLATFORM_SEAM.yaml) authority boundary |
| New TIED MCP tools, new checklist slugs, or new prompt types | Out of scope; compose with existing gate surface |
| Default **`AGENTSTREAM_TIED_MCP_PREFLIGHT=1`** or CI-enforced preflight without sponsor **costly choice** | Preserves operator ergonomics ([test-strategy.md](test-strategy.md) regression boundary) |
| Behavior-changing agentstream code hooks in early slices | README + doc seams first; code only if zero default change and sponsor confirms |
| Editing TIED-source `.cursor/agents/*` wrappers or rewording gate contracts | Harness docs only; wrappers stay explicit-only |
| Conflating this Traefik article with **Harness²** | See [tied-vs-harness2.md](../../../docs/comparisons/tied-vs-harness2.md) |
| Full implementation of slices A–F in add-feature / refine-plan | **build-plan** child executes file edits |
| Minting REQ/ARCH/IMPL from the comparison markdown | Comparison remains reference-only outreach |

## Compose-don't-replace contract (build-plan must honor)

| Harness (tune here) | Platform-adjacent authority (do not replace) |
| --- | --- |
| Prompt-type choice, subagent delegation | Gate receipts and **`tied_checklist_gate_validate`** |
| Skill wording for RESOLVE hints | REQ/ARCH/IMPL writes via **TIED MCP** / **tied-cli** |
| Agentstream harness profile, dry-run | Authoritative **Tracker** and envelope refs |
| Opt-in Jev Shell blocking, DAE preflight | **IMPL essence_pseudocode** + **`pseudocode_validate`** before code |
| PRELOAD routing, pipeline Build order | **Costly choice** on sponsor ladder |

## Slice execution order and dependencies

Build-plan runs slices in this order. **Parallel** slices share no write conflicts (different files).

| Order | Slice | Depends on | Operator interruption | Primary deliverable |
| ---: | --- | --- | --- | --- |
| 1 | **A** (+ **F** bundled) | — | **Low** — read existing bootstrap; optional one paragraph in skill | Single doc path: verify base path → then YAML; tool-input cross-ref |
| 2a | **B** | A (wording may reference bootstrap link) | **Low** — table columns only | Activation map: TIED applicability + harness profile + gate reminder |
| 2b | **C** | A (shared comparison / gate vocabulary) | **Low** — README subsection | Preflight chain labeled harness middleware, not gate authority |
| 3 | **D** | A, B, C (links targets exist) | **Low** — one new short checklist in working folder | [authority-boundary-operator-checklist.md](authority-boundary-operator-checklist.md) |
| 4 | **E** | B, C (concrete tool names stable) | **Low** — one matrix row | Row 13 mechanism cells aligned to in-repo tools |

**Unblock rule:** If a slice target file is missing or already satisfies acceptance, record **N/A** in build-plan evidence and proceed; do not block the chain for optional cross-links.

## Phased slices (build-plan executes; refine-plan stops after planning artifacts)

### Slice A — Session bootstrap seam (+ Slice F tool-input cross-ref)

**Goal:** Reduce wrong-tree MCP writes without new operator rituals.

**In scope (minimal, reversible, additive only):**

- One short cross-ref in `AGENTS.md` session bootstrap (or existing tied-yaml skill bootstrap step): Traefik comparison link + multi-root **`TIED_BASE_PATH`** warning; **do not** reorder or duplicate full bootstrap checklist.
- Agentstream README: document opt-in **`AGENTSTREAM_TIED_MCP_PREFLIGHT`** / `--tied-mcp-preflight` as composing with (not replacing) **`tied_config_get_base_path`**.
- **Optional (skip if timeboxed):** one paragraph in bundled tied-yaml skill pointing to comparison bounded recommendation §1.

**Slice F (same PR / same slice acceptance):** Where Slice A docs discuss MCP tool-call failures, one line cross-ref [REQ-TIED_TOOL_INPUT_COMPATIBILITY](../../requirements/REQ-TIED_TOOL_INPUT_COMPATIBILITY.yaml) and **`DIAGNOSTIC: TIED_CLI_HINDRANCE`**.

**Out of slice:** New shell aliases, mandatory preflight, agentstream code changes, editing comparison doc status to mint tokens.

**Acceptance:** Operator can follow a **single documented path**: verify base path → then YAML mutation; tool-input diagnostic named once at MCP seam.

### Slice B — Prompt-type as harness profiles

**Goal:** TIED-tracked vs non-tied prompt types explicit; delegation ≠ gate waiver.

**In scope:**

- Extend [fresh-client-prompt-activation-map.md](../../../tied-bundle/docs/fresh-client-prompt-activation-map.md) with columns: **TIED applicability** (`full` \| `minimal` \| `none`), **harness profile** note, **gate authority** reminder (one line per row max).
- **Optional:** one glossary row in [prompt-composer.md](../../vocab/prompt-composer.md) for **harness profile** if column headers need a canonical term.

**Out of slice:** New prompt types, router logic changes, subagent prompt edits that mention waivers.

**Acceptance:** All **13 leaf prompt types** listed; `add-feature` / `build-plan` / `refine-plan` / `non-tied-plan` / `question` dispositions unambiguous; no “gates optional” phrasing for advisory policy.

### Slice C — Agentstream preflight chain

**Goal:** Clarify middleware boundaries with zero default change.

**In scope:**

- [mcp-server/packages/agentstream/README.md](../../../mcp-server/packages/agentstream/README.md): subsection **Preflight chain (compose, don't replace)** — DAE gate preflight + Jev harness tool gate vs **`tied_checklist_gate_validate`** and MCP YAML writes.
- Cross-link [agentstream.md](../../vocab/agentstream.md) only if preflight flags table is incomplete after README edit.

**Out of slice:** Changing defaults, new env vars, unit tests unless project already snapshots README and diff is trivial.

**Acceptance:** README states fail-closed Jev does **not** waive checklist gates; enabled preflight validates layout/base path when operator opts in.

### Slice D — Authority boundary operator checklist

**Goal:** Short committed operator guidance (fast skim before turns).

**In scope:**

- Create [authority-boundary-operator-checklist.md](authority-boundary-operator-checklist.md): compact table (**before turn** / **before YAML write** / **before close-out**); each row ≤3 checklist bullets.
- Link comparison doc + [sponsor-agent-relationship.md](../../vocab/sponsor-agent-relationship.md).

**Optional:** one link from comparison **Related documents** back to checklist (only if build-plan time allows).

**Out of slice:** Automation, hooks, new MCP validators.

**Acceptance:** File under this working folder; linked from PLAN; answers “harness vs gate authority” in under two minutes.

**Deliverable:** [authority-boundary-operator-checklist.md](authority-boundary-operator-checklist.md)

### Slice E — Methodology composition matrix row 13

**Goal:** Fill mechanism cells where sponsor-owned TIED mechanisms are concrete.

**In scope:**

- Audit [methodology-composition-matrix.md](../../../docs/comparisons/methodology-composition-matrix.md) §2 row 13; align with parent [REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX](../../requirements/REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX.yaml).
- Name only in-repo tools already used in slices A–C (`tied_config_get_base_path`, activation map, agentstream preflight docs, checklist gates).

**Out of slice:** Fleet TBAC claims, effectiveness metrics, new matrix rows.

**Acceptance:** Row 13 mechanism columns reflect concrete repo surfaces without inventing gateway product features.

### Slice F — Tool-input seam cross-reference

**Status:** **Merged into Slice A** for execution (same acceptance). Retained in test-strategy as auditable SC-HPS-F; build-plan must not run F as a separate conflicting edit pass.

## refine-plan / add-feature scope boundary

**Completed in add-feature + refine-plan (this arc):**

- Mint [REQ-TIED_HARNESS_PLATFORM_SEAM](../../requirements/REQ-TIED_HARNESS_PLATFORM_SEAM.yaml), [ARCH-TIED_HARNESS_PLATFORM_SEAM](../../architecture-decisions/ARCH-TIED_HARNESS_PLATFORM_SEAM.yaml), [IMPL-TIED_HARNESS_PLATFORM_SEAM](../../implementation-decisions/IMPL-TIED_HARNESS_PLATFORM_SEAM.yaml)
- IMPL pseudo-code sidecar + **`pseudocode_validate`**
- This PLAN (refined slices, non-goals, consequence ladder, execution table), CITDP, Tracker, test-strategy, plan-phase evidence
- **`tied_checklist_gate_validate`** `pre_implementation` for build-plan handoff (re-validate after PLAN/CITDP refinement)

**Completed in build-plan (2026-10-20):** Slices A–E (+ F via A); verification gate **allowed**; CITDP persisted to [`tied-project/citdp/`](../../citdp/CITDP-REQ-TIED_HARNESS_PLATFORM_SEAM.yaml).

**Deferred to `@close-out`:** Envelope rebuild, unified `close_out` gate, git hygiene preview, CHANGELOG, traceable commit (scoped staging map).

## Consequence ladder (plan phase)

| Decision | Classification | Notes |
| --- | --- | --- |
| `depth_tier: minimal` for docs-first slices | **Reversible choice** | Upgrade to `integrated` if behavior-changing agentstream defaults ship |
| Default agentstream preflight **off**, document opt-in only | **Reversible choice** | Matches unchanged_behavior in CITDP |
| Additive doc cross-links and one working-folder checklist | **Reversible choice** | No schema or gate contract change |
| Extending activation map with three columns | **Reversible choice** | Methodology doc under `tied-bundle/`; clients refresh via `tied-install --refresh` |
| Optional comparison → checklist back-link | **Reversible choice** | Omit if timeboxed |
| Optional tied-yaml skill paragraph (Slice A) | **Reversible choice** | Skip without failing slice A if AGENTS.md + README path complete |
| Enabling preflight **by default** in CI or globally | **Costly choice** | Sponsor confirm — changes operator ergonomics and support burden |
| Material rewrite of `AGENTS.md` bootstrap ordering | **Costly choice** | Affects every agent session; prefer single cross-ref |
| New mandatory session-start CLI beyond documented MCP base-path check | **Costly choice** | Conflicts with minimal interruption budget |
| Behavior-changing agentstream preflight or Jev defaults | **Costly choice** | Requires CITDP impact rediscovery; likely `integrated` depth |
| Encoding gate waivers in subagent prompts or skills | **Rejected** | Violates ARCH authority boundary |
| Bypassing MCP for routine project YAML (“speed”) | **Rejected** | Wrong-base-path class; document **TIED_YAML_BYPASS** only for tooling gaps |

## Gate handoff for build-plan

1. Confirm `pre_implementation` receipt under `gates/` (re-run if PLAN/CITDP hashes change after refine-plan).
2. Execute **A (+F) → (B ∥ C) → D → E** per table above.
3. Run doc/link audits per [test-strategy.md](test-strategy.md); `lint_yaml` on touched project YAML only; **`tied_validate_consistency`**.
4. Verification + close-out per Tracker; persist CITDP when slices complete.

## refine-plan delta (2026-10-20)

- Added **operator interruption budget**, **explicit non-goals** table, and **slice execution order** with parallel B/C.
- Tightened slices A–E with in/out scope, optional skips, and **F merged into A**.
- Expanded **consequence ladder** with costly/rejected rows aligned to sponsor compose-don't-replace intent.

## Close-out plan (refine-plan pass 2 — 2026-10-20)

**Next prompt type:** `@close-out` (not build-plan). **depth_tier** and **gate_policy** unchanged (`minimal` / `advisory`).

### Sponsor commit scope

| Include | Exclude |
| --- | --- |
| `REQ-TIED_HARNESS_PLATFORM_SEAM` TIED stack + working folder | EDPC / facilitator / dogfood script drift |
| Doc/vocab/bundle slices (AGENTS.md, tied-yaml skill, activation map, agentstream README, matrix row 13, prompt-composer) | Untracked `*.local.md`, remote-org MCP local docs, visuals |
| [`traefik-harness-platform-vs-tied-agent-management.md`](../../../docs/comparisons/traefik-harness-platform-vs-tied-agent-management.md) **if** `git diff` shows changes at commit time | Unrelated `.gitignore` (`docs/tools/voice-agents.md`) unless sponsor expands scope |

### Close-out execution order

| Step | Action | Gate / evidence |
| ---: | --- | --- |
| 1 | Vocab **VALIDATE** (Touchpoint 3); LEAP drift check; `tied_validate_consistency` + `lint_yaml` on HPS YAML | Consistency ok |
| 2 | Extend Tracker: `sync-tied-stack` (if drift), `gitignore-close-out-hygiene`, `sub-close-out-evidence-sync`, `traceable-commit` | Dual-write dispositions |
| 3 | `run-close-out-gates.mjs` `--phase close_out` `--sync-dispositions --reconcile --envelope-blocking --skip-manifest` | Machine close-out: gate **allowed** + envelope **blocking_gap_count=0** |
| 4 | Optional **`tied_verify`** update (docs-only REQ **Planned → Implemented**) | Only after step 3 allows |
| 5 | **`tied_git_hygiene`** `plan_close_out` preview → receipt | Non-blocking preview |
| 6 | CHANGELOG + scoped **`git commit`** + three completion signals handoff | **No push** unless sponsor asks |

**Runner (canonical):**

```bash
node tools/bootstrap/templates/run-close-out-gates.mjs \
  --project-root /Users/fareed/Documents/dev/chatgpt/stdd \
  --request-token REQ-TIED_HARNESS_PLATFORM_SEAM \
  --tracker-path tied-project/working/REQ-TIED_HARNESS_PLATFORM_SEAM/checklist-tracker.yaml \
  --citdp-path tied-project/working/REQ-TIED_HARNESS_PLATFORM_SEAM/CITDP-REQ-TIED_HARNESS_PLATFORM_SEAM.yaml \
  --phase close_out \
  --run-id hps-close-out-20261020-r1 \
  --sync-dispositions --reconcile --envelope-blocking --skip-manifest
```

**Process contract expectation:** `--skip-manifest` → **partial** process contract (manifest N/A); acceptable at **minimal** depth — document in [`plan-close-out-handoff.md`](evidence/plan-close-out-handoff.md).

### Close-out non-goals

- No `git push`; no staging unrelated workspace paths; no default preflight flip; no REQ status promotion without gates + optional `tied_verify`.

## refine-plan pass 2 delta (2026-10-20)

- Merged Cursor **HPS REQ close-out** plan into this PLAN (execution order, staging map, runner command).
- Recorded **build-plan complete** and **`@close-out`** as sole next actor.
- Sponsor scope **HPS + Traefik if diff** frozen for traceable commit.
