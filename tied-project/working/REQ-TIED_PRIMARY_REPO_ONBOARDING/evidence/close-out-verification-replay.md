# Verification replay — REQ-TIED_PRIMARY_REPO_ONBOARDING close-out

**Date:** 2026-10-05

## README deliverable

- [README.md](../../../../README.md) § **Primary implementation repository** documents linked install with `--store`, MCP env keys, skills stubs, brownfield migrate, verify checklist, Windows/Unix entry points, and `SELF_INSTALL_REFUSED`.

## Harness verification (store-hosted TIED source repo)

- MCP store mode: `tied_config_get_base_path` → `mode: store`, `base_path` → `tied-project/`.
- Structural validation: `tied_validate_consistency` → index valid (2026-10-05 macOS build-plan close-out).
- Note: `install-layers --doctor .` is not used on this layout (`SELF_INSTALL_REFUSED` when store resolves to repo root).
