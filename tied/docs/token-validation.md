# Token validation (`[PROC-TOKEN_VALIDATION]`)

**Audience**: AI agents working in a TIED project.

**Purpose**: Confirm the semantic token registry and traceability graph stay aligned with indexes and detail files before you treat work as complete.

## Required check

Run full TIED consistency validation through the tied-yaml skill wrapper:

```bash
.cursor/skills/tied-yaml/scripts/tied-cli.sh tied_validate_consistency '{}'
```

Use the same **`TIED_BASE_PATH`** and built-server path described in [.cursor/skills/tied-yaml/SKILL.md](../../.cursor/skills/tied-yaml/SKILL.md) **Environment overrides** if your layout differs from the defaults. Inspect the JSON report; **`"ok": true`** is required for a clean pass.

## Optional project script

If the repository provides `./scripts/validate_tokens.sh` (or an equivalent), run it as an extra project-specific gate when documented by that script. It does not replace **`tied_validate_consistency`**; use both when the project defines the script.

## Fixing failures

Repair registry or traceability issues by mutating project-owned YAML only through **`.cursor/skills/tied-yaml/scripts/tied-cli.sh`**, then re-run **`tied_validate_consistency`** until it passes.
