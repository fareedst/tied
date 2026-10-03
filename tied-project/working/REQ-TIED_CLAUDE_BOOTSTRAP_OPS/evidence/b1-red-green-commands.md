# B1 RED/GREEN command evidence

**Date:** 2026-09-23

## RED

```bash
node --test tools/bootstrap/lib/claude-harness.test.mjs
```

Before GREEN implementation, the new suite `ASSERT_WINDOWS_BOOTSTRAP_CLAUDE` would fail on empty client; legacy smoke `.cmd` had no Claude assert steps.

## GREEN

```bash
node --test tools/bootstrap/lib/claude-harness.test.mjs
# tests 10, pass 10, fail 0

SMOKE=$(mktemp -d /tmp/tied-bootstrap-smoke-XXXX)
node tools/bootstrap/copy-files.mjs "$SMOKE"
node tools/bootstrap/assert-windows-bootstrap-claude.mjs "$SMOKE"
# exit 0
```
