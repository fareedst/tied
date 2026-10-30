# Workspace drift reconciliation — 2026-10-29

## Why files were excluded (prior close-out) — revised

| Prior rationale | Reconsideration |
| --- | --- |
| "Unrelated repo drift" | **Over-broad.** Most dirty paths are **program-wave artifacts**: `lint_yaml` / gate-runner normalization on CITDP + checklist trackers, canonical `tied-project/citdp/*` copies, methodology checklist task ordering, and comparison-doc allowlist work—not random noise. |
| "Scoped bootstrap only" | **Valid for commit slicing**, not for leaving YAML/doc drift uncommitted indefinitely. |
| Exclude all `tied-project/working/**` | **Wrong** for committed working folders (PLAN/REQ evidence, CITDP working copies that mirror `citdp/`). Regenerable paths remain gitignored per block rules. |

## Actions taken this pass

1. **`.gitignore`** — Restored **TIED STORE LOCAL WORKING** (`tied-bundle/working/`, `install.json`). Removed erroneous store-repo entries (`tied-bundle/`, `AGENTS.md`, `.cursorrules`, `skills/`) from INSTALL MANAGED (those apply on **clients**, not this methodology store). Kept `!docs/comparisons/software-engineering-degree*.md` allowlist.
2. **Reverted regenerable churn** (no semantic test intent): adversarial fixture `request-evidence-envelope.v1.json` revision/timestamp-only edits; both `source-graph-index.v1.json` regen snapshots.
3. **Left in tree** (intentional — stage at traceable-commit): bootstrap E2E + README + CHANGELOG; CITDP/checklist YAML normalization; `tied-bundle/docs/agent-req-implementation-checklist.yaml` sponsor two-lane task ordering; comparison docs + `DOC-SOFTWARE-ENGINEERING-DEGREE-COMPARISON/`; `PLAN-TIED-INSTALL-BATCH-TARGETS/` working copies; project index/vocab touch-ups; `external-service-comparison/examples.md`.

## Untracked disposition

| Path | Class | Action |
| --- | --- | --- |
| `docs/comparisons/software-engineering-degree*.md` | **track** | `git add` (allowlisted) |
| `tied-project/working/DOC-SOFTWARE-ENGINEERING-DEGREE-COMPARISON/` | **track** | `git add` committed working |
| `tied-project/working/PLAN-TIED-INSTALL-BATCH-TARGETS/*.yaml` | **track** | `git add` (mirrors citdp batch-targets work) |
| `tied-project/working/BOOTSTRAP-MCP-PATH-REFRESH/evidence/close-out-handoff.md` | **track** | `git add` |
| `docs/methodologies/kirk-context-makes-agents-useful.md` | **review** | Local methodology note; not under `docs/comparisons/*` ignore—track if sponsor wants it published, else add `docs/methodologies/` ignore pattern |

## Suggested commit slices (not executed)

1. **bootstrap:** CHANGELOG, bootstrap E2E, README, BOOTSTRAP-MCP evidence  
2. **path-env + batch programs:** `tied-project/citdp/*`, related `working/REQ-TIED_CLIENT_PATH_*`, `PLAN-TIED-INSTALL-BATCH-TARGETS`, path migration trackers  
3. **methodology checklist:** `tied-bundle/docs/agent-req-implementation-checklist.yaml`  
4. **comparison doc wave:** `.gitignore` allowlist, `docs/comparisons/software-engineering-degree*.md`, `DOC-SOFTWARE-ENGINEERING-DEGREE-COMPARISON/`  
5. **Remaining program close-out YAML** (GF plans, facilitator CITDPs, checker-compose, etc.) — one commit per REQ or one batched "working yaml lint sync" commit with evidence

## Git stash

`git stash list` empty at reconciliation time—sponsor may have meant **working tree** (`git status`), not literal stash entries.
