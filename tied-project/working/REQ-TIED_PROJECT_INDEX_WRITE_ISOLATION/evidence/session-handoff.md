# Session handoff — REQ-TIED_PROJECT_INDEX_WRITE_ISOLATION

**Updated:** 2026-10-13 (plan-close-out refresh **piwi-closeout-tier-bc-2026-10-13** — CHANGELOG/handoff aligned with SC-PIWI-DOCS met)  
**Depth:** minimal · **gate_policy:** advisory  
**Phase:** plan-close-out refresh complete · **traceable-commit:** **`e8e47dcf`**

**Close-out plan:** [piwi_close-out_refresh_a62e9034.plan.md](file:///Users/fareed/.cursor/plans/piwi_close-out_refresh_a62e9034.plan.md) · **Handoff:** [plan-close-out-handoff.md](../plan-close-out-handoff.md)

## What this change is

MCP **index writes** must persist **only** keys in `tied-project/{requirements,architecture-decisions,implementation-decisions,semantic-tokens}.yaml`. **Merged read** (methodology ∪ project) stays read-only on disk. Polluted clients get **advisory** `methodology_index_duplicated_in_project` plus **prune** script.

**Plan (refined):** [`project_yaml_write_boundary_93078969.plan.md`](file:///Users/fareed/.cursor/plans/project_yaml_write_boundary_93078969.plan.md)

## ARCH-TIED_PROJECT_INDEX_WRITE_ISOLATION

**Status:** **Active** (index + detail updated 2026-10-12; sponsor parity with REQ/IMPL)

| Concern | Architecture choice |
| --- | --- |
| **Read model** | `loadIndex()` continues to merge methodology (`tied-bundle/`) with project indexes for MCP reads and traceability queries. Methodology rows are never written back from that merged view. |
| **Write model** | `insertRecord` / `updateRecord` / `upsertRecord` in `mcp-server/src/yaml-loader.ts` serialize **project-only** payloads: the mutated token row (and existing project rows), not the full merged map. |
| **Pollution detection** | `tied_validate_consistency` emits advisory **`methodology_index_duplicated_in_project`** when a project index row is an identical copy of an inherited methodology row (`mcp-server/src/consistency-validator.ts`). |
| **Repair** | `scripts/prune-project-index-methodology-duplicates.mjs` removes duplicate methodology copies from project indexes (dry-run default; preserves intentional overrides when payload differs). |
| **Agent contract** | Tier A docs and MCP tool copy state: writable boundary is **`tied-project/*.yaml`** only; merged read ≠ project write. |

**Canonical detail:** `tied-project/architecture-decisions/ARCH-TIED_PROJECT_INDEX_WRITE_ISOLATION.yaml`  
**Rationale (one line):** Writers must not treat `loadIndex()` output as the on-disk project index payload.

## TIED stack status

| Token | Index status | Notes |
| --- | --- | --- |
| **REQ-TIED_PROJECT_INDEX_WRITE_ISOLATION** | **Implemented** | index + detail aligned (plan-close-out 2026-10-12) |
| **ARCH-TIED_PROJECT_INDEX_WRITE_ISOLATION** | **Active** | manual index/detail update (not in `tied_verify` scope) |
| **IMPL-TIED_PROJECT_INDEX_WRITE_ISOLATION** | **Active** | via `tied_verify` |

**CITDP (canonical):** `tied-project/citdp/CITDP-REQ-TIED_PROJECT_INDEX_WRITE_ISOLATION.yaml`  
**Working CITDP:** `tied-project/working/REQ-TIED_PROJECT_INDEX_WRITE_ISOLATION/CITDP-REQ-TIED_PROJECT_INDEX_WRITE_ISOLATION.yaml`  
**Tracker:** `tied-project/working/REQ-TIED_PROJECT_INDEX_WRITE_ISOLATION/checklist-tracker.yaml` (fixed duplicate `request:` key)

## Code / tooling delivered

| Area | Path |
| --- | --- |
| Write isolation | `mcp-server/src/yaml-loader.ts` (`insertRecord` / `updateRecord` / `upsertRecord`) |
| Unit tests | `mcp-server/src/yaml-loader.test.ts` (isolation describe) |
| Duplication scan | `mcp-server/src/consistency-validator.ts` → `methodology_index_duplicated_in_project` |
| Prune CLI | `scripts/prune-project-index-methodology-duplicates.mjs` (**positional client path** or `TIED_BASE_PATH`) |
| MCP tool copy | `mcp-server/src/tools/index.ts` → `tied-project/*.yaml` |
| Tier A docs | `bundled-tied-yaml-skill/SKILL.md`, `tied-bundle/docs/{yaml-update-mcp-runbook,ai-principles,ai-agent-tied-mcp-usage,client-development-index,tied-yaml-agent-index}.md`, `tied-project/vocab/tied-yaml-mcp.md` |
| Tier B/C docs + lint | `tied-bundle/docs` (priority corpus), `.cursor/agents`, `AGENTS.md`, `tools/bootstrap/lib/check-docs-vocab-links.mjs`, `lint-stale-layout.mjs`, bootstrap unit tests |
| Pseudo-code | `tied-project/implementation-decisions/IMPL-TIED_PROJECT_INDEX_WRITE_ISOLATION-pseudocode.md` |

**Rebuild:** run `npx tsc -p mcp-server/tsconfig.json` (or `npm test --prefix mcp-server`) after pulling; clients consume `mcp-server/dist`.

### Completion signals

- **Machine close-out:** **pass** — gate `close_out` `allowed=true` (`run_id=piwi-closeout-tier-bc-2026-10-13`); envelope validate `fail_on_error_gaps=true` `blocking_gaps=0`; envelope path=`tied-project/working/REQ-TIED_PROJECT_INDEX_WRITE_ISOLATION/evidence/request-evidence-envelope.v1.json` (regenerable; gitignored); summary=`evidence/closeout-run-close-out-gates.json`
- **Process contract:** **pass** — dual-write=clear on close-out refresh tracker; manifest=present (prior + supplemental command evidence 2026-10-13); PSA Layer C=n/a; profile=minimal/advisory; **traceable-commit** + vocab VALIDATE (Touchpoint 3) at commit
- **Adherence ledger:** **pass** — reconcile `process_grade` band **A** (`closeout-run-close-out-gates.json`)

| Extra | Status |
| --- | --- |
| **Verification index** | **Pass** — `tied_verify` + `npm test --prefix mcp-server` (plan-close-out replay) |
| **ARCH parity** | **Done** — `ARCH-TIED_PROJECT_INDEX_WRITE_ISOLATION` → **Active** |

- **Gitignore hygiene ([PROC-GITIGNORE_CLOSE_OUT]):** Applied unstaged `.gitignore` additions: `tied-project/working/**/evidence/quality-manifest/` (+ quality stdout/stderr + not-applicable receipt mirrors); stage at traceable-commit.

## Gate receipts

| Phase | Allowed | Artifact |
| --- | --- | --- |
| `pre_implementation` | yes | `tied-project/working/REQ-TIED_PROJECT_INDEX_WRITE_ISOLATION/gates/gate-pre_implementation-result.json` |
| `verification` | yes | `.../gates/gate-verification-result.json` |
| `close_out` | yes | `.../gates/gate-close_out-result.json` |
| `tied_verify` | ok | `.../gates/verification-2026-10-13T05-32-29-431Z.json` |

Replay unified close-out (authoritative tracker: `close-out-tracker.yaml`, not full `checklist-tracker.yaml`):

```bash
node tied-project/working/REQ-TIED_PROJECT_INDEX_WRITE_ISOLATION/run-close-out-gates.mjs
```

**Evidence bundle:** `evidence/request-evidence-envelope.v1.json`, `evidence/not-applicable-receipt.v1.json`, `evidence/verification-evidence-manifest.v1.json`.

**Note:** `tied_verify` still needs an inline `{ steps: [...] }` tracker; use the local script’s historical inline shape or a trimmed tracker with required slugs only.

## Trial client `1791739774`

- **Symptom:** polluted `tied-project/*.yaml` after first MCP index mutation (plan fixture).
- **Prune (dry-run):**  
  `node scripts/prune-project-index-methodology-duplicates.mjs /Users/fareed/Documents/dev/test/1791739774`  
  (Do **not** rely on bare positional path without this script version; old script ignored argv and used wrong `TIED_BASE_PATH`.)
- **Prune `--write` (2026-10-12 unblock):** ran; **0** identical methodology duplicates (client already clean or repaired).

## Satisfaction criteria

| ID | Status |
| --- | --- |
| SC-PIWI-INSERT-ONE | met (unit tests) |
| SC-PIWI-DUP-DETECT | met (validator + prune) |
| SC-PIWI-DOCS | **met** (Tier B live surfaces + Tier C `check-docs-vocab-links` / `lint-stale-layout` with `tied-bundle/docs`; run `piwi-tier-bc-2026-10-12`) |

## Session recommendations (carry-forward)

Ordered checklist for the next sponsor/agent pass. Item 1 completed in this handoff update.

| # | Recommendation | Status | Action |
| --- | --- | --- | --- |
| 1 | **ARCH parity** — `ARCH-TIED_PROJECT_INDEX_WRITE_ISOLATION` → **Active** in index + detail | **done** | MCP `yaml_index_update` + `yaml_detail_update` 2026-10-12 |
| 2 | **Unified close-out** — envelope-blocking + reconcile | **done** | Wrapper delegates to bootstrap template; see `closeout-run-close-out-gates.json` |
| 3 | **Fixture repair** — prune on `1791739774` | **done** (no-op) | Dry-run and `--write` report 0 duplicates |
| 4 | **Tier B/C docs** — grep `tied-bundle/docs/` + `.cursor/agents/`; extend `check-docs-vocab-links.mjs` for mislabeled client links | **done** | build-plan `piwi-tier-bc-2026-10-12` |
| 5 | **Traceable-commit** — stage implementation + TIED YAML + docs + `.gitignore`; vocab VALIDATE (Touchpoint 3); commit via `evidence/proposed-commit-message.txt` | **done** | **`e8e47dcf`** (2026-10-13) |

## Commands cheat sheet

```bash
# Tests
npm test --prefix mcp-server

# Consistency (store)
# MCP: tied_validate_consistency

# Prune trial client (dry-run)
node scripts/prune-project-index-methodology-duplicates.mjs \
  /Users/fareed/Documents/dev/test/1791739774

# TIED base path (must be tied-project/)
# tied_config_get_base_path → .../stdd/tied-project
```

## Remaining risks / costly choices

- **MCP index semantics** change for any automation that depended on accidental full-index duplication (mitigated by prune + override promotion).
- **Prune `--write`** on real clients — default dry-run; overrides preserved when payload differs from methodology.
- **Traceable-commit** — use [proposed-commit-message.txt](proposed-commit-message.txt); exclude gitignored envelope regenerables.
