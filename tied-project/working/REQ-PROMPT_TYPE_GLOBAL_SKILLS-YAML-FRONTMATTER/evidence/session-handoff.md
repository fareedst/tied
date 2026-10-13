# Session handoff — REQ-PROMPT_TYPE_GLOBAL_SKILLS YAML frontmatter

**Updated:** 2026-10-13 · **depth:** minimal · **phase:** close_out complete (pending traceable-commit hash)

**Close-out handoff:** [../plan-close-out-handoff.md](../plan-close-out-handoff.md)

## What changed

Cursor failed to parse five prompt-type skills because unquoted YAML `description` scalars contained colons. All 14 canonical skills now use double-quoted descriptions; e2e and bootstrap tests parse frontmatter with `js-yaml`.

## Client remediation

```bash
/path/to/stdd/tied-install.sh --refresh /path/to/client
```

See [client-remediation.md](client-remediation.md).

## Traceable-commit

Record git hash here after scoped commit from [proposed-commit-message.txt](proposed-commit-message.txt).
