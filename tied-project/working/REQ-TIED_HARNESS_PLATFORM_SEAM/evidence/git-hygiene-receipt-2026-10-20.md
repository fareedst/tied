# Git hygiene receipt — plan_close_out

**Date:** 2026-10-20  
**Request:** REQ-TIED_HARNESS_PLATFORM_SEAM  
**Mode:** preview (`apply: false`)

## Staging policy

Commit **HPS wave only** — exclude EDPC, facilitator, dogfood script, remote-org `*.local.md`, visuals.

## Notable untracked (excluded from commit)

- `docs/tools/remote-org-http-mcp*.md`, `docs/visuals/2026-10-20.md`

## Traefik comparisons

Unblocked via gitignore exceptions; force-add platform + capture sibling in traceable commit.
