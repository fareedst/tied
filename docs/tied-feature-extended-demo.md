# Extended feature-orchestration smoke runbook

```bash @on-load @hide
cd "$INDESCRIPT_DOC_DIR/.." # from 'docs'
source ~/.bash_profile

export ROOT="$(pwd)"

export ONBOARD="$ROOT/mcp-server/dist/feature-orchestration/onboarding-entry.js"
export SERVER="$ROOT/mcp-server/dist/index.js"

export TIED_CLI_SH="$ROOT/.cursor/skills/tied-yaml/scripts/tied-cli.sh"
export TIED_MCP_BIN="$SERVER"
export TIED_SOURCE_ROOT=/Users/fareed/Documents/dev/chatgpt/stdd
```
```ux
echo: $ROOT
name: HOME
```
```ux
echo: '*.*'
name: GLOB
```
```opts @on-load @hide
files_allow_external_local_root: true
```
- files_allow_external_local_root: &{files_allow_external_local_root}

```files @property-prefix:root,glob,count
root: ${HOME}
glob: ${GLOB}
layout: table
columns: [name, ext, size, mtime]
unbounded: true
```

This runbook extends [`tied-feature-demo.md`](tied-feature-demo.md) with the
shell functions in [`scripts/build-commands.sh`](../scripts/build-commands.sh).
It is intended for repeatable smoke testing of the published client wrappers
in a fresh, inspectable TIED client.

The smoke functions validate orchestration state and wrapper integration. They
do not implement or prove the runtime behavior of a product feature.

## Prerequisites
Run these commands from the TIED repository root:

```bash @eval
echo_exec npm --prefix mcp-server run build
```
```bash @eval
echo_exec command -v node
echo_exec command -v jq
echo_exec command -v yq
echo_exec command -v git
echo_exec command -v agent
```
```bash @n:with_commands @hide
source scripts/build-commands.sh
```

The MCP build provides the onboarding and feature-orchestration entry points.
`copy_files.sh` uses the `agent` command while configuring the disposable
client's `tied-yaml` MCP entry.

By default, disposable clients are created under
`$HOME/Documents/dev/test`. Use `TIED_TEST_ROOT` to choose another retained
test area.

## Discover the commands

After sourcing the script, use `how` to confirm the smoke functions are
available:

```bash @eval @r:with_commands
how
```

The relevant entries are:

```text
test-tied-feature-onboarding: smoke-test tied init/new/build in a fresh client
test-tied-feature-lifecycle: smoke-test all feature lifecycle transitions
```

## Onboarding smoke

1. Create a new `tied-feature-orchestration.XXXXXX` client directory.

```ux
exec: >-
  mktemp -q -d "${TMPDIR:-/tmp}/tied-feature-demo.XXXXXX"
init: false
name: DEMO
transform: :chomp
```

Run:

```bash @eval @n:new_tied_test_client @r:with_commands
_new_tied_test_client "$DEMO" /Users/fareed/Documents/dev/chatgpt/stdd
```

```bash @eval @r:with_commands
test-tied-feature-onboarding "$DEMO"
```

The function:

1. Creates a new `tied-feature-orchestration.XXXXXX` client directory.
2. Runs `copy_files.sh`, TIED YAML lint, `agent mcp enable tied-yaml`, and
   Git initialization with the `TIED` bootstrap commit.
3. Runs the installed onboarding wrapper:

   ```bash @eval @req(DEMO)
   cd -- "$DEMO"
   echo_exec .cursor/skills/tied-yaml/scripts/tied.sh init
   echo_exec .cursor/skills/tied-yaml/scripts/tied.sh feature new "Add count-lines CLI"
   echo_exec .cursor/skills/tied-yaml/scripts/tied.sh feature build FEAT-001
   ```

   `feature build` receives the generated feature identifier positionally.
   The onboarding adapter's next-action text currently displays the equivalent
   `--feature` spelling, but the working command form is positional.
4. Parses the JSON responses with `jq`.
5. Verifies the generated YAML manifest with `yq`, including:
   - the generated feature identifier,
   - `draft` lifecycle status,
   - revision `1`.

The function prints the retained client path:

```text
Feature onboarding smoke passed: FEAT-001
Client: /absolute/path/to/test-clients/tied-feature-orchestration.XXXXXX
```

Keep this path when inspecting the generated wrapper configuration, Git
history, or feature manifest.

## Lifecycle smoke

Run:

```bash @eval @r:with_commands
test-tied-feature-lifecycle "$DEMO"
```

The function creates a separate fresh client and advances a new feature
through the lifecycle:

```text
draft
  -> refining
  -> specified
  -> planned
  -> tasked
  -> verifying
  -> closed
```

Every successful mutation receives the expected current revision. The
revision therefore advances from `1` to `7`.

The current command boundary is intentional:

- `feature-orchestrator.sh` exercises the standalone CLI for `specify` and
  `refine`.
- The later transitions use the installed `tied-cli.sh` MCP client because
  their lifecycle gates require explicit evidence:
  - `plan`: `{ "validated": true }`
  - `tasks`: `{ "planned": true }`
  - `verify`: `{ "tasked": true }`
  - `close_out`: `{ "verified": true }`

The smoke asserts every JSON result and then verifies that the manifest has
status `closed` and revision `7`.

## Manual inspection

- @code-as-button(DEMO)
- @name-as-button(new_tied_test_client)

Inspect the bootstrap commit and generated files:

```bash @eval
git -C "$DEMO" log --oneline --max-count=1
git -C "$DEMO" status --short
ls "$DEMO/.cursor/skills/tied-yaml/scripts"
```

Create and inspect a feature manually:

```bash @append-output @req(DEMO)
cd -- "$DEMO"
new_result=$(
  echo_exec .cursor/skills/tied-yaml/scripts/tied.sh \
    feature new "Manual orchestration inspection"
)
FEATURE_ID="$(jq -er '.result.manifest.feature_id' <<<"$new_result")"
FEATURE_SLUG="$(jq -er '.result.manifest.slug' <<<"$new_result")"
MANIFEST="$DEMO/tied/features/$FEATURE_ID-$FEATURE_SLUG/feature.yaml"
echo_exec jq -er '.result.manifest' <<<"$new_result" > "$MANIFEST"
echo "FEATURE_ID="$FEATURE_ID""
echo "FEATURE_SLUG="$FEATURE_SLUG""
echo "MANIFEST="$MANIFEST""
```
- FEATURE_ID: `${FEATURE_ID}`
- FEATURE_SLUG: `${FEATURE_SLUG}`
- MANIFEST: `${MANIFEST}`
```bash @eval @req(DEMO)
yq -P "$MANIFEST"
```
```files @property-prefix:root,glob,count
root: ${MANIFEST}
glob: '*.*'
layout: table
columns: [name, ext, size, mtime]
```

Exercise the standalone CLI's revision boundary:

```bash @eval @req(FEATURE_ID)
cd -- "$DEMO"
.cursor/skills/tied-yaml/scripts/feature-orchestrator.sh \
  specify --feature "$FEATURE_ID" --revision 1

.cursor/skills/tied-yaml/scripts/feature-orchestrator.sh \
  refine --feature "$FEATURE_ID" --revision 2
```

For evidence-gated transitions, use the TIED YAML client and pass the
feature-specific revision:

```bash @eval @req(DEMO) @req(FEATURE_ID)
cd -- "$DEMO"
.cursor/skills/tied-yaml/scripts/tied-cli.sh feature_plan \
  "{\"feature_identifier\":\"$FEATURE_ID\",\"expected_revision\":3,\"command_input\":{\"validated\":true}}"

.cursor/skills/tied-yaml/scripts/tied-cli.sh feature_tasks \
  "{\"feature_identifier\":\"$FEATURE_ID\",\"expected_revision\":4,\"command_input\":{\"planned\":true}}"

.cursor/skills/tied-yaml/scripts/tied-cli.sh feature_verify \
  "{\"feature_identifier\":\"$FEATURE_ID\",\"expected_revision\":5,\"command_input\":{\"tasked\":true}}"

.cursor/skills/tied-yaml/scripts/tied-cli.sh feature_close_out \
  "{\"feature_identifier\":\"$FEATURE_ID\",\"expected_revision\":6,\"command_input\":{\"verified\":true}}"
```

Re-read the manifest after each mutation:

```bash @eval @req(MANIFEST)
yq '[.feature_id, .status, .revision]' "$MANIFEST"
```

## Troubleshooting

### MCP configuration is unavailable

Inspect the disposable client's copied configuration:

```bash @eval @req(DEMO)
yq '.' "$DEMO/.cursor/mcp.json"
```

The shell wrappers use the baked TIED source path and local defaults. They do
not require the source repository's project YAML to be selected as the
client's `TIED_BASE_PATH`.

### Stale revision

`STALE_REVISION` means the command's expected revision does not match the
manifest. Re-read the manifest and retry with its current revision. Do not
reuse a revision from another disposable client.

### Client cleanup

The smoke functions intentionally retain the client for inspection. Remove a
client only after collecting the evidence you need:

```bash @eval @req(DEMO)
rm -rf -- "$DEMO"
```

## Safety and proof boundaries

- Each smoke run creates a fresh client and leaves the source TIED repository
  unchanged.
- The bootstrap creates a Git repository and commits the copied client
  configuration as `TIED`; feature mutations remain available for inspection.
- The functions do not create Git branches or worktrees.
- Generated feature manifests demonstrate orchestration persistence and
  lifecycle state, not product implementation correctness.
- Runtime correctness still requires the relevant unit, composition, and E2E
  tests, followed by the TIED consistency and traceability checks described in
  [`tied-feature-demo.md`](tied-feature-demo.md).
