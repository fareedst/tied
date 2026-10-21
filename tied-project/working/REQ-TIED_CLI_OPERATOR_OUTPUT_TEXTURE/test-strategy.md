# Test strategy — REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE

**Metric file:** `tools/bootstrap/build-commands-how.test.mjs`  
**Runner:** `node --test tools/bootstrap/build-commands-how.test.mjs`

## Composition harness

```bash
bash -lc 'source scripts/build-commands.sh && how …'
```

Use `encoding: 'utf8'`, `cwd: REPO_ROOT`, and `NO_COLOR=1` unless testing texture (texture off still asserted via no `\x1b[` when plain).

## Cases

1. Default stream: `how build` → exit 0, empty stdout, stderr contains command names, no ANSI when `NO_COLOR=1`.
2. Plain env: `TIED_CLI_PLAIN=1` → ASCII `-` rules, no `─`, no escapes.
3. Plain flag: `how --plain build` → same as (2).
4. Stdout override: `how --stdout build` and `TIED_CLI_HELP_STDOUT=1` → content on stdout, stderr empty on success.
5. Errors: unknown topic and `how build extra` → exit 2, stderr only, stdout empty.
6. Coverage: `how all`, `how install-matrix` section strings on default stderr.

## RED note

Case (1) fails against current implementation (help on stdout). Implement stream routing after RED.

## Regression

No change required to MCP controlled-runner tests; optional addition to unified toolchain CLI help test bundle in CITDP.
