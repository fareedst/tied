# TIED bootstrap engine

Cross-platform **BOOTSTRAP_TIED** implementation shared by all platform entry points.

## Prerequisites

- Node.js >= 18 on PATH
- Built MCP server: `cd mcp-server && npm install && npm run build`

## Entry points

| Entry | Platform | Behavior |
|-------|----------|----------|
| `tied-install.sh` / `tied-install.cmd` / `tied-install.ps1` | Unix / CMD / PowerShell | **Layered install** (default `--mode linked`); `tied-install-dispatch.mjs` → `install-layers.mjs` |
| `tools/bootstrap/tied-install-dispatch.mjs` | All | Install dispatch ([RUN_TIED_INSTALL_ENTRYPOINT]) |
| `tools/bootstrap/install-layers.mjs` | All | Layer engine: `--layers`, `--harness`, `--mode linked\|full`, `--doctor`, `--migrate-layout` |

**Profiles:** `linked` (stubs + MCP bundle env; factory default) vs **`full`** (offline materialized `tied-bundle/`). Brownfield: **`tied-install --migrate-layout`**.

**Primary implementation repositories** (product repo + `tied-project/` in one tree, separate TIED store): see root [README.md § Primary implementation repository](../../README.md#primary-implementation-repository).

**Operator matrix:** `source scripts/build-commands.sh && how install-matrix` — maps smoke flags (`test-new-tied-client --install-mode full`, layer subsets) to committed vs gitignored paths; see `tied-project/working/REQ-TIED_LAYERED_CLIENT_INSTALL/install-resource-matrix.md`.

**CI / pre-push:** `source scripts/build-commands.sh && test-all` runs `test-bootstrap-layered-install` (unit/composition for `tied-install` / layers; [REQ-TIED_LAYERED_CLIENT_INSTALL]). Disposable factory smoke remains `test-new-tied-client` (not in `test-all`).

| `tools/bootstrap/new-tied-client.mjs` | All | Disposable/explicit client factory pipeline (defaults to `tied-install` linked) |
| `scripts/new-tied-client.cmd` / `.ps1` | Windows | Explicit client dir: bootstrap + lint + MCP + git |
| `scripts/test-new-tied-client.cmd` / `.ps1` | Windows | `--disposable` under `%USERPROFILE%\Documents\dev\test\<unix-seconds>` |
| `scripts/test-new-claude-tied-client.cmd` / `.ps1` | Windows | Claude-first disposable (`--harness claude` + validation receipt) |
| `scripts/validate-claude-tied-client.cmd` / `.ps1` | Windows | Re-run Claude validation on an existing client (`CLIENT_DIR` + optional flags) |
| `scripts/run-tied-claude-client-validation.mjs` | All | Node backend for validate-claude shims |
| `scripts/lint_yaml.cmd` / `.ps1` | Windows | `-F tied` lint parity with `lint_yaml.sh` |
| `tied-install.ps1` | Windows | Same as `tied-install.cmd` |
| `test-new-tied-client.cmd` / `.ps1` | Windows | Repo-root discoverability shim |

## Disposable client smoke (Windows)

From the TIED repo:

```cmd
scripts\test-new-tied-client.cmd
```

PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\test-new-tied-client.ps1
```

Creates `%USERPROFILE%\Documents\dev\test\<unix-seconds>` with bootstrap, lint, **G4 new-client onboarding audit** (`tied-project/working/tied-new-client-audit.v1.json` on two-folder clients; undivided brownfield fallback `working/tied-new-client-audit.v1.json` — [REQ-TIED_FACTORY_ONBOARDING_WORKING_PATH](../../tied-project/requirements/REQ-TIED_FACTORY_ONBOARDING_WORKING_PATH.yaml), [REQ-TIED_NEW_CLIENT_ADHERENCE](../../tied-project/requirements/REQ-TIED_NEW_CLIENT_ADHERENCE.yaml)), optional ``${CURSOR_CLI_NAME:-agent} mcp enable tied-yaml`` (resolved via `resolveCursorAgentCli`; see env table below), and `git commit -m "TIED {methodology version from AGENTS.md}"` (e.g. `TIED 3.0.0`). Bash equivalent: `source scripts/build-commands.sh` then `test-new-tied-client`. Skip audit: `TIED_SKIP_NEW_CLIENT_AUDIT=1` or `--skip-onboarding-audit`.

| Variable | Role |
|----------|------|
| `CURSOR_CLI_NAME` | Preferred Cursor Agent CLI basename for MCP enable; default **`agent`**. Probed first, then `agent`, then `cursor` (deduped). |
| `TIED_CURSOR_AGENT_CMD` | Full override basename; wins over `CURSOR_CLI_NAME` when set. |

Explicit directory:

```cmd
scripts\new-tied-client C:\path\to\client-dir
```

Skip flags: `--skip-lint`, `--skip-mcp-enable`, `--skip-git`, `--force-mcp-enable`.

## Claude adherence hook bridge ([REQ-TIED_CLAUDE_ADHERENCE_HOOKS])

On **`bootstrapTied`**, when the MCP server is built:

- Writes `.claude/hooks/tied-adherence-bridge.sh` (Unix manual) and on Windows `.claude/hooks/tied-adherence-bridge.cmd`.
- **Safe-merges** a `PostToolUse` handler into `.claude/settings.json` using a **Node** command (`node …/claude-adherence-bridge.js`) so Windows does not spawn Git Bash windows for `.sh` hooks; re-run upgrades legacy `.sh` commands (foreign hooks preserved; idempotent re-run).
- Appends **`action_attempted`** ledger rows only when an **active-turn marker** exists (same contract as Cursor `log.rb` bridge).

Hook log pointer: `.claude/adherence-bridge.log`. CLI pin for fixtures: Claude Code **2.1.273** (see `mcp-server/fixtures/claude/hooks/`).

## Claude-first disposable client ([REQ-TIED_CLAUDE_BOOTSTRAP_OPS])

Node-only factory (bash/cmd are thin delegates). Does **not** run `cursor` / `agent mcp enable`; runs post–G4 **`runClaudeClientValidation`** and writes `working/tied-claude-client-validation.v1.json`.

```bash
source scripts/build-commands.sh
test-new-claude-tied-client
```

Direct CLI:

```bash
node tools/bootstrap/new-tied-client.mjs --disposable --harness claude --with-agentstream-dry-run
```

Validation-only on an existing tree:

```bash
node scripts/run-tied-claude-client-validation.mjs --client-root /path/to/client --with-agentstream-dry-run
```

Optional **Claude Code interactive smoke** (stdio MCP via `claude -p --strict-mcp-config`, not IDE OAuth):

```bash
node scripts/run-tied-claude-client-validation.mjs --client-root /path/to/client --with-claude-code-interactive-smoke
# or: TIED_CLAUDE_CODE_INTERACTIVE_SMOKE=1
```

After bootstrap, `claude mcp list` may show project **`.mcp.json`** servers as **Pending approval** until you approve once in an interactive `claude` session; the smoke flag above bypasses that for scripted checks. Operators still approve in the IDE for day-to-day `/build-plan` sessions without `--strict-mcp-config`.

Defaults: validation on (unless `--skip-claude-validation`); agentstream dry-run on; `tied_validate_consistency` off (`--with-consistency` or `TIED_CLAUDE_CLIENT_WITH_CONSISTENCY=1` to enable). Live Claude is operator-only and not part of the default factory.

## Windows bootstrap smoke (automated)

From the TIED repo on Windows (after `mcp-server` build):

```cmd
scripts\windows-bootstrap-smoke.cmd (includes Claude asserts via `tools/bootstrap/assert-windows-bootstrap-claude.mjs` — [REQ-TIED_CLAUDE_BOOTSTRAP_OPS])
```

Runs `tied-install.cmd` into a temp client dir, `lint_yaml.cmd -F tied-project`, **`tied-install.cmd --mode linked`**, **`--migrate-layout`** on a legacy fixture, and **`test-new-tied-client.cmd`** with MCP/git/audit skips. Exit code 0 = pass.

**CI:** GitHub Actions workflow `Windows bootstrap smoke` (`.github/workflows/windows-bootstrap-smoke.yml`) runs the same script on `windows-latest` after building `mcp-server`, plus a **`pwsh`** step for `tied-install.ps1`. A green run is the only evidence that may set `WINDOWS_COPY_PROVEN_IN_CI` to `true` in `tools/bootstrap/lib/constants.mjs` (symlink opt-in remains env-driven; copy-default unchanged).

Environment: `TIED_REPO_ROOT`, `TIED_TEST_ROOT`, `TIED_CURSOR_AGENT_CMD` (override Cursor agent CLI name).

## Usage

```cmd
cd C:\dev\my-client-app
..\dev\tied\tied-install.cmd .
```

```bash
./tied-install.sh /path/to/client
./tied-install.sh --merge-vocab
./tied-install.sh --install-methodology-hook /path/to/client
./tied-install.sh --methodology-readonly --install-methodology-hook /path/to/client  # Unix opt-in chmod
```

### Client refresh parity gate ([REQ-TIED_CLIENT_REFRESH_PARITY])

Bootstrap runs parity **after** inherited methodology verify gates and **before** the methodology client boundary hook. Default report: `<client>/.tied/client-refresh-parity-report.json`.

| Flag | Effect |
| --- | --- |
| *(default)* | Parity A methodology drift → exit **1**; Parity B doc drift → warn, exit **0** |
| `--strict-refresh` | Parity B doc drift → exit **1** |
| `--skip-parity-gate` | Skip parity entirely (no report) |
| `--parity-gate-report-only` | Write report; parity never changes bootstrap exit code |
| `--parity-report=<path>` | Override report JSON path |
| `--semantic-yaml-compare` | Parity A `.yaml` uses `scripts/compare_yaml_dirs.rb` semantic mode |

Standalone (no copy):

```bash
node tools/bootstrap/verify-client-methodology.mjs /path/to/client
node tools/bootstrap/verify-client-methodology.mjs --strict-refresh /path/to/client
```

JSON Schema: `tools/bootstrap/schemas/client-refresh-parity-report.v1.schema.json`. Template-only Parity A skips: `tools/bootstrap/lib/methodology-template-only-allowlist.mjs`.

Methodology boundary (Phase A, [REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY]): `--methodology-readonly` and `--install-methodology-hook` are **opt-in** (not default-on). After hook install, enable with `git config core.hooksPath .githooks`. CI guard recipe: `tied-bundle/docs/client-development-index.md` § **methodology-boundary-ci-guard**.

## Manifest

`manifest.json` is the single source for `BASE_FILES`, `DOCS_TO_COPY`, prompt-type skill dirs, verify artifact lists, and `TIED_CLI_REPO_ROOT_MARKER`. Node reads it at runtime; bash no longer duplicates inline arrays.

### Repo-root base files (`BASE_FILES`)

| Artifact | Policy | Source |
| --- | --- | --- |
| `.cursorrules`, `AGENTS.md` | Create-if-absent | Repo root |
| `tied-project/config.yaml` | Create-if-absent | `tied-bundle/templates/config.yaml` starter when present |

Existing client copies are never overwritten on refresh. Brownfield clients without the file get it on the next bootstrap while the destination path is still absent; see [methodology-migration.md](../tied-bundle/docs/methodology-migration.md).

### Optional tool-use flags (`--full-tools`)

| Flag | Effect |
| --- | --- |
| `--full-tools` | `--with-jev` + `--with-dae` + `--with-bbce` |
| `--with-jev` | On create (or with `--force-tool-config`): `jev.plan_skills: true` in `tied-project/config.yaml` |
| `--with-dae` | On create (or force): `dae.crap_threshold: 30` only — never default `dae.branch_check` or `dae.agentstream_gate_check` |
| `--with-bbce` | Copy `tied-bundle/templates/tied/analysis/` starters into client `tied-project/analysis/` (additive) |
| `--tools jev,dae,bbce` | Comma-separated granular flags |
| `--force-tool-config` | Merge tool-related keys into an existing `tied-project/config.yaml` without replacing unrelated keys |

Environment mirrors: `TIED_BOOTSTRAP_FULL_TOOLS`, `TIED_BOOTSTRAP_WITH_JEV`, `TIED_BOOTSTRAP_WITH_DAE`, `TIED_BOOTSTRAP_WITH_BBCE`, `TIED_BOOTSTRAP_FORCE_TOOL_CONFIG` (CLI overrides env). **`JEV_API_KEY` is never written by bootstrap** — set in Cursor MCP env after bootstrap.

Unix: `source scripts/build-commands.sh && test-new-tied-client --full-tools`. Windows: `scripts\test-new-tied-client.cmd --full-tools`.

## Claude Code harness (dual bootstrap)

After the Cursor path (`.cursor/skills/`, create-only `.cursor/mcp.json`), bootstrap also:

| Artifact | Policy |
| --- | --- |
| `.claude/skills/` | Copy-default Prompt Composer + `tied-yaml` bundles (same inventory as Cursor) |
| Repo-root `skills/` (optional) | When **`TIED_SKILLS_REROOT=1`**, both Cursor and Claude managed bundles install under **`skills/`** instead of harness-native paths. Default **off**. Requires `windows_copy_proven_in_ci` and [ARCH-TIED_CLAUDE_SKILLS_REROOT](../tied-project/architecture-decisions/ARCH-TIED_CLAUDE_SKILLS_REROOT.yaml). See [REQ-TIED_CLAUDE_SKILLS_REROOT](../tied-project/requirements/REQ-TIED_CLAUDE_SKILLS_REROOT.yaml). |
| Repo-root `.mcp.json` | Create-if-absent or safe-merge **`tied-yaml` only**; sets `TIED_MCP_HARNESS=claude` |
| `CLAUDE.md` | Optional create-if-absent thin delta pointing at **AGENTS.md** (never replaces Tracker or `tied/` YAML) |

Cursor **create-only** `.cursor/mcp.json` policy is unchanged — existing client MCP files are never mutated.

Contract tests: `node --test tools/bootstrap/lib/claude-harness.test.mjs` (requires built `mcp-server` for MCP prerequisite).

Operator routing (REQ vs FEAT, operating modes): [client-development-index.md](../tied-bundle/docs/client-development-index.md) § **Multi-harness entry matrix (Cursor vs Claude Code)**.

Traceability: [REQ-TIED_CLAUDE_HARNESS](../tied-project/requirements/REQ-TIED_CLAUDE_HARNESS.yaml) · [ARCH-TIED_CLAUDE_HARNESS](../tied-project/architecture-decisions/ARCH-TIED_CLAUDE_HARNESS.yaml) · [IMPL-TIED_CLAUDE_HARNESS](../tied-project/implementation-decisions/IMPL-TIED_CLAUDE_HARNESS.yaml)

## Client `.gitignore` (INSTALL MANAGED v2)

`writeGitignoreBlock` ([`lib/layers/gitignore-block.mjs`](lib/layers/gitignore-block.mjs)) always uses **`mergeLocalWorkingGitignoreBlock` profile `client`**: it writes the versioned `# BEGIN TIED INSTALL MANAGED` paths (including `tied-bundle/`, `.cursor/skills/`, `.claude/skills/`, and repo-root `skills/` for optional `TIED_SKILLS_REROOT=1`) and **removes** legacy `# BEGIN TIED LOCAL WORKING` / undivided-store mirror blocks without re-appending them. Refresh and `--migrate-layout` are idempotent on the managed block.

**Store profile** (expanded local-working globs) is reserved for methodology-repo close-out via `collapseLegacyWorkingGitignorePatterns` in [`lib/working-gitignore.mjs`](lib/working-gitignore.mjs); client bootstrap must not call it.

## Layout

- `install-layers.mjs` — layered install CLI
- `new-tied-client.mjs` — disposable/explicit client factory
- `lint-yaml.mjs` — Windows `-F tied` lint backend
- `lib/bootstrap.mjs` — orchestration
- `lib/client-refresh-parity.mjs` — Parity A/B gate + report v1
- `lib/methodology-template-only-allowlist.mjs` — Parity A template-only path allowlist
- `verify-client-methodology.mjs` — standalone parity CLI
- `schemas/client-refresh-parity-report.v1.schema.json` — report envelope
- `lib/copy-managed.mjs` — attribute-preserving copy + midnight mtime
- `lib/mcp-config.mjs`, `lib/skills.mjs`, `lib/skills-reroot.mjs`, `lib/claude-md.mjs`, `lib/vocab.mjs`, `lib/docs.mjs`, `lib/verify.mjs`
- `tied-bundle/templates/CLAUDE.md.template` — optional client `CLAUDE.md` source

Traceability: [REQ-TIED_SETUP](../tied-project/requirements/REQ-TIED_SETUP.yaml) · [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM](../tied-project/architecture-decisions/ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM.yaml) · [IMPL-TIED_FILES](../tied-project/implementation-decisions/IMPL-TIED_FILES.yaml)
