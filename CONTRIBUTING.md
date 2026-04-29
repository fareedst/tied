# Contributing

## Commit messages

Commit message format and release process are defined in **tied/docs/processes.md**: see [PROC-COMMIT_MESSAGES](tied/docs/processes.md) and [PROC-RELEASE](tied/docs/processes.md).

- Use the format `type(scope): subject` (e.g. `feat(ui): add dark mode`). Types: build, ci, chore, docs, feat, fix, perf, refactor, style, test.
- Keep the subject to 50 characters or fewer; imperative, present tense; no period at end.
- In the body, list the main changes and, when relevant, reference TIED tokens (e.g. `[REQ-*]`, `[ARCH-*]`, `[IMPL-*]`) for traceability.
- Full format, types, scopes, and examples: **tied/docs/processes.md** § [PROC-COMMIT_MESSAGES]. Release versioning: § [PROC-RELEASE].
- Align with **[PROC-TIED_DEV_CYCLE](tied/docs/processes.md)** and **[PROC-AGENT_REQ_CHECKLIST](tied/docs/agent-req-implementation-checklist.md)**: one session commit after README/CHANGELOG and TIED doc updates.

### Example

```
docs(tied): point CONTRIBUTING at agent REQ checklist

- Update CONTRIBUTING.md to reference [PROC-AGENT_REQ_CHECKLIST] as the
  unified procedure for new features and changes
- Note that commit format is defined in tied/docs/processes.md
  § [PROC-COMMIT_MESSAGES]
Tokens: PROC-AGENT_REQ_CHECKLIST, PROC-TIED_DEV_CYCLE
```
