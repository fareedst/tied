# CITDP gate-test litter cleanup

**Date:** 2026-11-01

Removed untracked files (never committed):

- `tied-project/citdp/CITDP-REQ-ACTIVATION.yaml`
- `tied-project/citdp/CITDP-REQ-NESTED.yaml`
- `tied-project/citdp/CITDP-REQ-PRESERVE.yaml`
- `tied-project/citdp/CITDP-REQ-UNIT_TEST.yaml`
- `tied-project/citdp/CITDP-REQ-UPGRADE.yaml`
- `tied-project/citdp/CITDP-REQ-UPGRADE-MISSING.yaml`

**Cause:** `mcp-server/src/citdp-writer.test.ts` uses tempdirs when `TIED_BASE_PATH` is set per test; full-store test runs with project `TIED_BASE_PATH` can persist these basenames under real `tied-project/citdp/`.

**Prevention:** Prefer scoped test runs with isolated base path; `@clear-workspace` / `git clean -f` on these basenames when litter reappears.
