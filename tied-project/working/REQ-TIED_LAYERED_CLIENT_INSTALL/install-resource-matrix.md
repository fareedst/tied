# Install resource matrix (layer × argument)

**Purpose:** Operator reference for how **resource types** are materialized under different **`tied-install`** / factory arguments. Primary smoke entry: `source scripts/build-commands.sh && test-new-tied-client [flags]`.

**Two-folder layout ([REQ-TIED_TWO_FOLDER_LAYOUT]):** committed **project** tree = `tied-project/`; local **bundle** tree = `tied-bundle/` (one gitignore line on clients). Store repo commits `tied-bundle/` corpus; MCP **store mode** uses `TIED_BASE_PATH` → `tied-project/` with no client `install.json`.

**Legend**

| Symbol | Meaning |
|--------|---------|
| **C** | Committed (intended for git) |
| **G** | Gitignored (managed block in `.gitignore`) |
| **Stub** | Small local file pointing at store path |
| **Copy** | Full tree copied from store |
| **—** | Unchanged / not touched by this profile |

---

## Resource types × install profiles

| Resource type | Path(s) | Layer | Policy | `test-new-tied-client` (default linked) | `--install-mode full` | `--layers` subset |
|---------------|---------|-------|--------|-------------------------------------------|------------------------|-------------------|
| Project config | `tied-project/config.yaml` | db | **C** | create-if-absent | create-if-absent | db only |
| Project DB indexes | `tied-project/*.yaml` (project indexes) | db | **C** | create-if-absent | create-if-absent | db only |
| Project detail dirs | `tied-project/requirements/`, `architecture-decisions/`, `implementation-decisions/` | db | **C** | mkdir | mkdir | db only |
| Client vocab handoffs | `tied-project/vocab/` | db | **C** | written | written | db only |
| Committed working | `tied-project/working/{REQ}/` (PLAN, tracker, envelope) | db | **C** | — | — | — |
| Loader files | `AGENTS.md`, `.cursorrules` | db | **C** | create-if-absent | create-if-absent | db only |
| Constitution example | `tied-project/constitution.example.yaml` | db | **C** | create-if-absent | create-if-absent | db only |
| Gitignore managed block | `.gitignore` (TIED INSTALL MANAGED v2 only; no LOCAL WORKING on clients) | db | **C** | idempotent append | idempotent append | db only |
| Repo-root skills (re-root) | `skills/` when `TIED_SKILLS_REROOT=1` | db | **G** | listed in managed block | listed in managed block | db only |
| Install config | `tied-bundle/install.json` | manifest | **G** | written (v2) | written | end of run |
| Cursor MCP config | `.cursor/mcp.json` | mcp | **G** | create/merge + env | create/merge | mcp only |
| Claude MCP config | `.mcp.json` | mcp | **G** | create/merge + env | create/merge | mcp only |
| MCP env (linked) | `TIED_BASE_PATH`, `TIED_STORE_ROOT`, optional `TIED_METHODOLOGY_BUNDLE_PATH` | mcp | **G** (in JSON) | set | full copy mode may omit bundle path | mcp only |
| Cursor skills | `.cursor/skills/**` | skills | **G** | **Stub** + wrappers | **Copy** | skills only |
| Claude skills | `.claude/skills/**` | skills | **G** | **Stub** + wrappers | **Copy** | skills only |
| tied-yaml scripts | `.cursor/…/tied-yaml/scripts/tied-cli.sh` | skills | **G** | **exec wrapper** → store | full copy | skills only |
| Methodology corpus | `tied-bundle/requirements.yaml`, detail dirs, indexes (flattened) | methodology | **G** | symlink/stub/copy | **Copy** | methodology only |
| Methodology docs | `tied-bundle/docs/**` | methodology | **G** | **Stub** → store | **Copy** | methodology only |
| Methodology vocab | `tied-bundle/vocab/*.md` | methodology | **G** | stub/symlink from store `tied-project/vocab` | **Copy** | methodology only |
| Sidecar template | `tied-bundle/templates/impl-essence-pseudocode-template.md` | methodology | **G** | **Stub** | **Copy** | methodology only |
| Local working evidence | `tied-bundle/working/**` (gates, adversarial-inquiry, …) | — | **G** | — | — | — |
| Parity report (full) | `tied-bundle/reports/client-refresh-parity-report.json` | methodology | **G** | — | written | full mode |

**Removed (SC-TFL-LEGACY-REMOVED):** root `templates/`, top-level `tied/`, `copy_files.*`, `--legacy-bootstrap`, `TIED_BOOTSTRAP_LEGACY`, `.tied-yaml.yaml`, `tied/.tied-install.json`, `.linked-methodology-view/`.

---

## Factory / smoke arguments (`test-new-tied-client`)

| Argument / env | Applies to | Effect on resources |
|----------------|------------|---------------------|
| *(none)* | factory | `tied-install --mode linked --harness cursor --store $TIED_REPO_ROOT` + lint + G4 audit + optional MCP enable + git |
| `--install-mode linked\|full` | install | selects Stub/wrapper vs Copy column |
| `--install-harness cursor\|claude\|both` | install | which **G** skill trees and MCP JSON files |
| `--install-layers db,mcp,…` | install | only listed layers; others **—** |
| `--methodology-bundle live\|pinned` | install (linked) | bundle path for MCP + verify |
| `--store PATH` | install | store root in stubs, wrappers, MCP dist path |
| `--migrate-layout` | brownfield | hard cut to `tied-project/` + `tied-bundle/` (idempotent) |
| `--full-tools` / Jev/DAE/BBCE | db + `tied-project/config.yaml` | tool profile in install config |
| `--skip-lint`, `--skip-mcp-enable`, `--skip-git`, `--skip-onboarding-audit` | pipeline only | no change to install materialization |
| `--doctor` (on `tied-install` after smoke) | verify | read-only checks; no new resources |
| `TIED_SKIP_NEW_CLIENT_AUDIT=1` | audit | skips G4 JSON; install unchanged |

---

## Windows install entry points

| Surface | Install | Disposable factory |
|---------|---------|-------------------|
| Git Bash | `./tied-install.sh [OPTS] DIR` | `source scripts/build-commands.sh && test-new-tied-client [flags]` |
| CMD | `tied-install.cmd` | `test-new-tied-client.cmd` or `scripts\test-new-tied-client.cmd` |
| PowerShell | `.\tied-install.ps1` | `.\test-new-tied-client.ps1` |

All install shims call `tools/bootstrap/tied-install-dispatch.mjs`. Factory flags are parsed in Node — **cross-shell**.

---

## Suggested operator recipes (after `build-commands.sh`)

```bash
source scripts/build-commands.sh
how install-matrix
verify-install-matrix-doc
test-new-tied-client --install-mode linked
test-new-tied-client --install-mode full
tied-install --migrate-layout /path/to/brownfield/client
```

**G4 audit ([REQ-TIED_NEW_CLIENT_ADHERENCE]):** grammar audit + **two-folder layout checks** (`two_folder_layout` in `tied-new-client-audit.v1.json`): no top-level `tied/`, `tied-project/config.yaml`, `git check-ignore tied-bundle/`.

**Sync check:** `node tools/bootstrap/lib/render-install-resource-matrix.mjs` verifies this file mentions `tied-project`, `tied-bundle`, `tied-install`, and `--migrate-layout`.
