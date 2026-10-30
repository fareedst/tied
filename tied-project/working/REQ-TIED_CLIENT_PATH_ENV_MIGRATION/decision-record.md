# Decision record: client path environment variable names

**Date:** 2026-10-29  
**Type:** Sponsor vocabulary choice (implemented under REQ-TIED_CLIENT_PATH_ENV_MIGRATION)  
**Glossary:** [tied-yaml-mcp.md](../../vocab/tied-yaml-mcp.md) § Recorded sponsor choice

## Decision

Adopt this **canonical pair** for MCP / CLI / server path configuration:

| Canonical env | Replaces (legacy) | Directory |
|---------------|-------------------|-----------|
| `TIED_CLIENT_PROJECT_PATH` | `TIED_BASE_PATH` | Client **`tied-project/`** (writable project YAML) |
| `TIED_CLIENT_BUNDLE_PATH` | `TIED_METHODOLOGY_BUNDLE_PATH` | Client **`tied-bundle/`** or pinned methodology corpus (read-only merge) |

## Rationale

- **Clarity:** “Base path” was misread as repo root, workspace root, or store root; **client project path** matches the two-folder layout.
- **Namespace:** Avoid `TIED_STORE_*` for client trees because **`TIED_STORE_ROOT`** already denotes the methodology **store git checkout**.

## Rejected alternative

- `TIED_STORE_PROJECT_PATH` / `TIED_STORE_BUNDLE_PATH` — overloaded “store” vs `TIED_STORE_ROOT`.

## Plan (refined)

**REQ token:** `REQ-TIED_CLIENT_PATH_ENV_MIGRATION`  
**PLAN:** [PLAN.md](PLAN.md) (refine-plan pass 1, 2026-10-29)

## Not in scope for this record

- Runtime rename remains future until build-plan executes PLAN § 3.

## Context

Discussion followed operator TODO (2026-10-29) on misnamed `TIED_BASE_PATH` and bundle path env.
