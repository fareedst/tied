# TIED feature onboarding

## Quickstart

From a project root with Node and the built TIED MCP server available:

```text
.cursor/skills/tied-yaml/scripts/tied.sh init
.cursor/skills/tied-yaml/scripts/tied.sh feature new "Add count-lines CLI"
.cursor/skills/tied-yaml/scripts/tied.sh feature build --feature FEAT-001
```

These commands are adoption delegates. Lifecycle transitions, manifest
persistence, readiness, task scheduling, generated views, and agentstream
execution remain owned by their existing validated modules.

The wrapper points at the TIED repository that ran `copy_files.sh`. If that
repository moves, set `TIED_REPO_ROOT` to its absolute path before invoking it.
The standalone feature surface is available at
`.cursor/skills/tied-yaml/scripts/feature-orchestrator.sh`.

## Advanced and offline paths

Local defaults are reported with their source and are never written implicitly:
`TIED_MCP_BIN`, `TIED_BASE_PATH`, `tied/constitution.yaml`, and
`tied/features/`. If Node or the MCP binary is unavailable, use the explicit
TIED YAML client:

```text
TIED_BASE_PATH=/absolute/project/tied \
  .cursor/skills/tied-yaml/scripts/tied-cli.sh tied_validate_consistency '{}'
```

For a manual workflow, follow
[`using-tied-without-mcp.md`](using-tied-without-mcp.md).
The TIED YAML MCP, `tied-cli.sh`, and `tools/agentstream` remain supported.

## Brownfield migration

Migration is dry-run by default:

```text
.cursor/skills/tied-yaml/scripts/tied.sh feature migrate --source prompts/initial-specs.yaml
.cursor/skills/tied-yaml/scripts/tied.sh feature migrate --source prompts/initial-specs.yaml --confirm-migration
```

Preview output includes normalized candidates, source ordering, deterministic
conflicts, and no-write evidence. Confirmed migration creates a backup before
publishing feature manifests atomically. Conflicts, stale previews, and
publication failures do not modify project-owned TIED YAML and never create
Git branches or worktrees.

For an existing client, re-run `copy_files.sh`; use
`./copy_files.sh --merge-vocab /path/to/client` when the feature-orchestration
glossary is absent. The bootstrap preserves existing project YAML, MCP
configuration, documentation, and vocabulary.
