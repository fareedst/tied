# Contributing

## Commit messages

Commit message format and release process are defined in **processes.md**: see [PROC-COMMIT_MESSAGES](processes.md) and [PROC-RELEASE](processes.md).

- Use the format `type(scope): subject` (e.g. `feat(ui): add dark mode`). Types: build, ci, chore, docs, feat, fix, perf, refactor, style, test.
- Keep the subject to 50 characters or fewer; imperative, present tense; no period at end.
- In the body, list the main changes and, when relevant, reference TIED tokens (e.g. `[REQ-*]`, `[ARCH-*]`, `[IMPL-*]`) for traceability.
- Full format, types, scopes, and examples: **processes.md** § [PROC-COMMIT_MESSAGES]. Release versioning: § [PROC-RELEASE].
- Align with **[PROC-TIED_DEV_CYCLE](processes.md)** and **[PROC-NEW_FEATURE](docs/new-feature-process.md)**: one session commit after README/CHANGELOG and TIED doc updates.

### Example

```
docs(tied): add new feature process and PROC-NEW_FEATURE

- Add docs/new-feature-process.md with flow diagram and procedure
- Add [PROC-NEW_FEATURE] to processes.md and semantic-tokens.yaml
- Add CONTRIBUTING.md with commit message guidelines
Tokens: PROC-NEW_FEATURE, PROC-TIED_DEV_CYCLE
```
