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
| `scripts/lint_yaml.cmd` | Windows | `-F tied` lint parity with `lint_yaml.sh` |
| `test-new-tied-client.cmd` | Windows | Repo-root discoverability shim |

## Disposable client smoke (Windows)

From the TIED repo:

```cmd
scripts\test-new-tied-client
```

Creates `%USERPROFILE%\Documents\dev\test\<unix-seconds>` with bootstrap, lint, optional `cursor mcp enable tied-yaml` (Windows; `agent` on Unix when on PATH), and `git commit -m TIED`.

Explicit directory:

```cmd
scripts\new-tied-client C:\path\to\client-dir
```

Skip flags: `--skip-lint`, `--skip-mcp-enable`, `--skip-git`, `--force-mcp-enable`.

## Windows bootstrap smoke (automated)

From the TIED repo on Windows (after `mcp-server` build):

```cmd
scripts\windows-bootstrap-smoke.cmd
```

Runs `copy_files.cmd` into a temp client dir, `lint_yaml.cmd -F tied`, and a direct `copy-files.mjs` invoke. Exit code 0 = pass.

Environment: `TIED_SOURCE_ROOT`, `TIED_TEST_ROOT`, `TIED_CURSOR_AGENT_CMD` (override Cursor agent CLI name).

## Usage

```cmd
cd C:\dev\my-client-app
..\dev\tied\copy_files
```

```bash
./copy_files.sh /path/to/client
./copy_files.sh --merge-vocab
```

## Manifest

`manifest.json` is the single source for `DOCS_TO_COPY`, prompt-type skill dirs, verify artifact lists, and `TIED_CLI_REPO_ROOT_MARKER`. Node reads it at runtime; bash no longer duplicates inline arrays.

## Layout

- `copy-files.mjs` — bootstrap CLI
- `new-tied-client.mjs` — disposable/explicit client factory
- `lint-yaml.mjs` — Windows `-F tied` lint backend
- `lib/bootstrap.mjs` — orchestration
- `lib/copy-managed.mjs` — attribute-preserving copy + midnight mtime
- `lib/mcp-config.mjs`, `lib/skills.mjs`, `lib/vocab.mjs`, `lib/docs.mjs`, `lib/verify.mjs`

Traceability: [REQ-TIED_SETUP](../tied/requirements/REQ-TIED_SETUP.yaml) · [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM](../tied/architecture-decisions/ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM.yaml) · [IMPL-TIED_FILES](../tied/implementation-decisions/IMPL-TIED_FILES.yaml)
