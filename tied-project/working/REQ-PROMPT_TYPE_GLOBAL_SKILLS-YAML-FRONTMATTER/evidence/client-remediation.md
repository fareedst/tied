# Client remediation — prompt-type SKILL frontmatter

Brownfield TIED clients that show Cursor parse errors for `ammend-commit`, `debug`, `leap-ad-hoc`, `leap-diff-promote`, or `plan-close-out` should refresh skills from the TIED store (linked default):

```bash
/path/to/TIED/store/tied-install.sh --refresh /path/to/client
```

Use `--mode full` only when the client intentionally materializes full skill copies.

No hand-editing of `.cursor/skills/*/SKILL.md` is required when refresh picks up the quoted `description` frontmatter from `tools/bundled-prompt-type-skills/`.
