# Contributing

## Commit messages

Write a single commit message per development session that summarizes the session's changes. Where useful, reference the main REQ/ARCH/IMPL tokens touched.

- Prefer a short subject line (e.g. conventional commits: `feat:`, `fix:`, `docs:`).
- In the body, list the main changes and, when relevant, the TIED tokens (e.g. `[REQ-*]`, `[ARCH-*]`, `[IMPL-*]`) that were added or updated.
- Align with **[PROC-TIED_DEV_CYCLE](tied/processes.md)** and **[PROC-NEW_FEATURE](docs/new-feature-process.md)**: one session commit after README/CHANGELOG and TIED doc updates.

### Example

```
docs: add new feature process and PROC-NEW_FEATURE

- Add docs/new-feature-process.md with flow diagram and procedure
- Add [PROC-NEW_FEATURE] to tied/processes.md and semantic-tokens.yaml
- Add CONTRIBUTING.md with commit message guidelines
Tokens: PROC-NEW_FEATURE, PROC-TIED_DEV_CYCLE
```
