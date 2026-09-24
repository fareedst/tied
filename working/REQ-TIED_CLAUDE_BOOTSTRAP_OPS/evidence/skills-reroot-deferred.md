# CONFIG_SKILLS_REROOT deferral (B3)

**REQ:** REQ-TIED_CLAUDE_BOOTSTRAP_OPS  
**Block:** CONFIG_SKILLS_REROOT  
**Date:** 2026-09-23 (build-plan B2–B5)

## Disposition

**Deferred** — not implemented in this slice.

## Rationale

- `windows_copy_proven_in_ci` remains **false** globally (B1 proof note: no Windows CI runner green yet; RISK-BOOT-001).
- IMPL pseudo-code PRE requires `windows_copy_proven_in_ci` true before enabling repo-root `skills/` re-root.
- Sponsor policy forbids default-on re-root and merging re-root before Windows proof.

## Follow-up

Re-open B3 after Windows smoke/CI proof authorizes `windows_copy_proven_in_ci` flip; then RED/GREEN dual-harness install + Windows asserts per CITDP phase 3.
