# Proposed commit — store CLI help (plan-close-out)

**Run ID:** `store-cli-help-closeout-20261019`  
**Close-out receipt:** [closeout-run-close-out-gates-store-cli-help.json](closeout-run-close-out-gates-store-cli-help.json) (`merged_decision.allowed=true`, envelope `blocking_gap_count=0`)

## Proposed message

```
feat(bootstrap): styled --help for build-workspace and tied-install

Add build-workspace -h/--help via build-workspace-help.mjs (SC-UNIFIED-BUILD-WORKSPACE-HELP,
IMPL-TIED_WORKSPACE_BUILD_ENTRY). tied-install with no args prints help; explicit path or
`.` required to install (SC-LCI-CLI-HELP-NO-ARGS). Shared console.mjs texture; bootstrap tests.
```

## Scope (stage these paths)

**build-workspace help**

- `build-workspace.sh` / `build-workspace.ps1` / `build-workspace.cmd` / `build-workspace.zsh`
- `tools/bootstrap/lib/build-workspace-help.mjs`
- `tools/bootstrap/build-workspace-help-cli.mjs`
- `tools/bootstrap/build-workspace-help.test.mjs`
- `tools/bootstrap/build-workspace-sh-help.test.mjs`

**tied-install help**

- `tools/bootstrap/lib/tied-install-help.mjs`
- `tools/bootstrap/lib/console.mjs`
- `tools/bootstrap/tied-install-dispatch.mjs`
- `tools/bootstrap/install-layers.mjs`
- `tools/bootstrap/tied-install-help.test.mjs`
- `tools/bootstrap/install-layers-help.test.mjs`
- `tools/bootstrap/tied-install-dispatch.test.mjs`

**TIED + docs**

- `tied-project/requirements/REQ-TIED_UNIFIED_TOOLCHAIN.yaml`
- `tied-project/requirements/REQ-TIED_LAYERED_CLIENT_INSTALL.yaml`
- `tied-project/requirements/REQ-TIED_SETUP.yaml`
- `tied-project/implementation-decisions.yaml`
- `tied-project/implementation-decisions/IMPL-TIED_WORKSPACE_BUILD_ENTRY.yaml`
- `tied-project/implementation-decisions/IMPL-TIED_WORKSPACE_BUILD_ENTRY-pseudocode.md`
- `tied-project/implementation-decisions/IMPL-TIED_LAYERED_CLIENT_INSTALL-pseudocode.md`
- `tied-project/semantic-tokens.yaml`
- `tied-project/citdp/CITDP-REQ-TIED_UNIFIED_TOOLCHAIN.yaml`
- `tied-project/working/REQ-TIED_UNIFIED_TOOLCHAIN/PLAN-build-workspace-cli-help.md`
- `tied-project/working/REQ-TIED_UNIFIED_TOOLCHAIN/CITDP-store-cli-help-closeout.yaml`
- `tied-project/working/REQ-TIED_UNIFIED_TOOLCHAIN/agent-req-checklist-store-cli-help-closeout.yaml`
- `tied-project/working/REQ-TIED_UNIFIED_TOOLCHAIN/run-close-out-gates-store-cli-help.mjs`
- `tied-project/working/REQ-TIED_UNIFIED_TOOLCHAIN/evidence/plan-close-out-proposed-commit.md`
- `tied-project/working/REQ-TIED_UNIFIED_TOOLCHAIN/evidence/closeout-run-close-out-gates-store-cli-help.json`
- `tied-project/working/REQ-TIED_LAYERED_CLIENT_INSTALL/PLAN-tied-install-cli-help.md`
- `CHANGELOG.md`
- `README.md`
- `tools/bootstrap/README.md`

**Related (review before stage — may be same session or separate intent)**

- `mcp-server/src/store-readme-structure.test.ts`
- `scripts/build-commands.sh`
- `scripts/tasd.sh`
- `mcp-server/package-lock.json` / `tools/bootstrap/package-lock.json` (only if dependency changes intended)

## Gitignore hygiene

**N/A** — no new ephemeral ignore patterns. Untracked `build-workspace.*` shims and committed working PLANs are intentional deliverables.

## Verify before commit

```bash
node --test tools/bootstrap/build-workspace-help.test.mjs \
  tools/bootstrap/build-workspace-sh-help.test.mjs \
  tools/bootstrap/tied-install-help.test.mjs \
  tools/bootstrap/tied-install-dispatch.test.mjs \
  tools/bootstrap/install-layers-help.test.mjs
```
