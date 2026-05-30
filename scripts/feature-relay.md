# Commands to implement a feature
```bash
pwd
```
```ux
name: CHANGE_TITLE
```
```ux
name: FEATURE_GOAL
```
```ux
name: FEATURE_BEHAVIOR_OR_DASH
```
```bash :from-3-args
$EVAL "$FEATURE_RELAY_BIN" "$CHANGE_TITLE" "$FEATURE_GOAL" "$FEATURE_BEHAVIOR_OR_DASH"
```
```bash :from-clipboard
pbpaste | $EVAL "$FEATURE_RELAY_BIN" "$CHANGE_TITLE" "$FEATURE_GOAL" -
```

# Miscellaneous Commands
```bash
$EVAL "$LINT_YAML_BIN" -F tied
```

```ux
name: FEATURE_RELAY_BIN
init: scripts/feature-relay.sh
```
```ux
name: EVAL
init: echo_exec
# Install echo_exec locally if needed (prints command and exit status).
```
```ux
name: LINT_YAML_BIN
init: scripts/lint_yaml.sh

```
```ux
name: YAML_TOOL_BIN
init: scripts/yaml_tool.sh

```
`echo_exec` is a local binary that prints the command and status (with command if > 0).

```opts :(document_opts)
debounce_execution: false
pause_after_script_execution: true
save_executed_script: true
```
