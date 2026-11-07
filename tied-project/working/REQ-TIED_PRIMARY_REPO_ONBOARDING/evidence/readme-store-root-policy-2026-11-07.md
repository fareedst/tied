# README store-root install policy (2026-11-07)

**Plan:** `readme_tied-install_ia_ae3a89a6.plan.md` (refined pass 2 — env minimalism)

## Operator surface

- Root [README.md](../../../../README.md) documents install and refresh only **from the TIED store root** with a path argument (`./tied-install.sh /path/to/client-or-primary`).
- Root README does **not** document `--store`, default `--mode linked`, or process environment keys for MCP wiring.
- Flags, store resolution, primary-cwd refresh, and env key catalog: [tools/bootstrap/README.md](../../../../tools/bootstrap/README.md) and [docs/tied-first-party-env-catalog.md](../../../../docs/tied-first-party-env-catalog.md).

## LEAP note

[CITDP-REQ-TIED_PRIMARY_REPO_ONBOARDING](../../../citdp/CITDP-REQ-TIED_PRIMARY_REPO_ONBOARDING.yaml) `desired_behavior` referenced README onboarding with explicit `--store`; operator truth moved to bootstrap README per [REQ-TIED_ENVIRONMENT_VARIABLE_POLICY](../../../requirements/REQ-TIED_ENVIRONMENT_VARIABLE_POLICY.yaml) disk-first policy.

## Verification

- `node --test mcp-server/src/store-readme-structure.test.ts`
- `rg '--store|--mode linked|TIED_BASE_PATH|TIED_STORE_ROOT' README.md` → no matches
