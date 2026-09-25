# TIED bootstrap engine

Cross-platform **BOOTSTRAP_TIED** implementation shared by all platform entry points.

## Prerequisites

- Node.js >= 18 on PATH
- Built MCP server: `cd mcp-server && npm install && npm run build`

## Entry points

| Entry | Platform | Behavior |
|-------|----------|----------|
| `copy_files.cmd` | Windows | PATHEXT resolves `copy_files` from neighboring repo |
| `copy_files.sh` | Unix / Git Bash | Thin wrapper: `exec node tools/bootstrap/copy-files.mjs` |
| `tools/bootstrap/copy-files.mjs` | All | Direct Node CLI |

| `tools/bootstrap/new-tied-client.mjs` | All | Disposable/explicit client factory pipeline |
| `scripts/new-tied-client.cmd` | Windows | Explicit client dir: bootstrap + lint + MCP + git |
| `scripts/test-new-tied-client.cmd` | Windows | `--disposable` under `%USERPROFILE%\Documents\dev\test\<unix-seconds>` |
| `scripts/test-new-claude-tied-client.cmd` | Windows | Claude-first disposable (`--harness claude` + validation receipt) |
| `scripts/run-tied-claude-client-validation.mjs` | All | Re-run Claude validation on an existing client |
| `scripts/lint_yaml.cmd` | Windows | `-F tied` lint parity with `lint_yaml.sh` |
| `test-new-tied-client.cmd` | Windows | Repo-root discoverability shim |

## Disposable client smoke (Windows)

From the TIED repo:

```cmd
scripts\test-new-tied-client
```

Creates `%USERPROFILE%\Documents\dev\test\<unix-seconds>` with bootstrap, lint, **G4 new-client onboarding audit** (`working/tied-new-client-audit.v1.json`, [REQ-TIED_NEW_CLIENT_ADHERENCE](../../tied/requirements/REQ-TIED_NEW_CLIENT_ADHERENCE.yaml)), optional `cursor mcp enable tied-yaml` (Windows; `agent` on Unix when on PATH), and `git commit -m "TIED {methodology version from AGENTS.md}"` (e.g. `TIED 3.0.0`). Bash equivalent: `source scripts/build-commands.sh` then `test-new-tied-client`. Skip audit: `TIED_SKIP_NEW_CLIENT_AUDIT=1` or `--skip-onboarding-audit`.

Explicit directory:

```cmd
scripts\new-tied-client C:\path\to\client-dir
```

Skip flags: `--skip-lint`, `--skip-mcp-enable`, `--skip-git`, `--force-mcp-enable`.

## Claude adherence hook bridge ([REQ-TIED_CLAUDE_ADHERENCE_HOOKS])

On **`bootstrapTied`**, when the MCP server is built:

- Writes `.claude/hooks/tied-adherence-bridge.sh` (calls `mcp-server/dist/cli/claude-adherence-bridge.js`).
- **Safe-merges** a `PostToolUse` handler into `.claude/settings.json` (foreign hooks preserved; idempotent re-run).
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

Runs `copy_files.cmd` into a temp client dir, `lint_yaml.cmd -F tied`, and a direct `copy-files.mjs` invoke. Exit code 0 = pass.

**CI:** GitHub Actions workflow `Windows bootstrap smoke` (`.github/workflows/windows-bootstrap-smoke.yml`) runs the same script on `windows-latest` after building `mcp-server`. A green run is the only evidence that may set `WINDOWS_COPY_PROVEN_IN_CI` to `true` in `tools/bootstrap/lib/constants.mjs` (symlink opt-in remains env-driven; copy-default unchanged).

Environment: `TIED_SOURCE_ROOT`, `TIED_TEST_ROOT`, `TIED_CURSOR_AGENT_CMD` (override Cursor agent CLI name).

## Usage

```cmd
cd C:\dev\my-client-app
..\dev\tied\copy_files
```

```bash
./copy_files.sh /path/to/client
./copy_files.sh --merge-vocab
./copy_files.sh --install-methodology-hook /path/to/client
./copy_files.sh --methodology-readonly --install-methodology-hook /path/to/client  # Unix opt-in chmod
```

Methodology boundary (Phase A, [REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY]): `--methodology-readonly` and `--install-methodology-hook` are **opt-in** (not default-on). After hook install, enable with `git config core.hooksPath .githooks`. CI guard recipe: `tied/docs/client-development-index.md` § **methodology-boundary-ci-guard**.

## Manifest

`manifest.json` is the single source for `DOCS_TO_COPY`, prompt-type skill dirs, verify artifact lists, and `TIED_CLI_REPO_ROOT_MARKER`. Node reads it at runtime; bash no longer duplicates inline arrays.

## Claude Code harness (dual bootstrap)

After the Cursor path (`.cursor/skills/`, create-only `.cursor/mcp.json`), bootstrap also:

| Artifact | Policy |
| --- | --- |
| `.claude/skills/` | Copy-default Prompt Composer + `tied-yaml` bundles (same inventory as Cursor) |
| Repo-root `skills/` (optional) | When **`TIED_SKILLS_REROOT=1`**, both Cursor and Claude managed bundles install under **`skills/`** instead of harness-native paths. Default **off**. Requires `windows_copy_proven_in_ci` and [ARCH-TIED_CLAUDE_SKILLS_REROOT](../tied/architecture-decisions/ARCH-TIED_CLAUDE_SKILLS_REROOT.yaml). See [REQ-TIED_CLAUDE_SKILLS_REROOT](../tied/requirements/REQ-TIED_CLAUDE_SKILLS_REROOT.yaml). |
| Repo-root `.mcp.json` | Create-if-absent or safe-merge **`tied-yaml` only**; sets `TIED_MCP_HARNESS=claude` |
| `CLAUDE.md` | Optional create-if-absent thin delta pointing at **AGENTS.md** (never replaces Tracker or `tied/` YAML) |

Cursor **create-only** `.cursor/mcp.json` policy is unchanged — existing client MCP files are never mutated.

Contract tests: `node --test tools/bootstrap/lib/claude-harness.test.mjs` (requires built `mcp-server` for MCP prerequisite).

Operator routing (REQ vs FEAT, operating modes): [client-development-index.md](../tied/docs/client-development-index.md) § **Multi-harness entry matrix (Cursor vs Claude Code)**.

Traceability: [REQ-TIED_CLAUDE_HARNESS](../tied/requirements/REQ-TIED_CLAUDE_HARNESS.yaml) · [ARCH-TIED_CLAUDE_HARNESS](../tied/architecture-decisions/ARCH-TIED_CLAUDE_HARNESS.yaml) · [IMPL-TIED_CLAUDE_HARNESS](../tied/implementation-decisions/IMPL-TIED_CLAUDE_HARNESS.yaml)

## Layout

- `copy-files.mjs` — bootstrap CLI
- `new-tied-client.mjs` — disposable/explicit client factory
- `lint-yaml.mjs` — Windows `-F tied` lint backend
- `lib/bootstrap.mjs` — orchestration
- `lib/copy-managed.mjs` — attribute-preserving copy + midnight mtime
- `lib/mcp-config.mjs`, `lib/skills.mjs`, `lib/skills-reroot.mjs`, `lib/claude-md.mjs`, `lib/vocab.mjs`, `lib/docs.mjs`, `lib/verify.mjs`
- `templates/CLAUDE.md.template` — optional client `CLAUDE.md` source

Traceability: [REQ-TIED_SETUP](../tied/requirements/REQ-TIED_SETUP.yaml) · [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM](../tied/architecture-decisions/ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM.yaml) · [IMPL-TIED_FILES](../tied/implementation-decisions/IMPL-TIED_FILES.yaml)
