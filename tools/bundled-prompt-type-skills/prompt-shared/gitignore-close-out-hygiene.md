# Gitignore close-out hygiene ([PROC-GITIGNORE_CLOSE_OUT])

Advisory close-out review of **ephemeral artifacts** against [`.gitignore`](../../../.gitignore) comment-block conventions. Required at close-out; not a blocking checklist gate.

## When

- **plan-close-out** — [`tied-close-out-process.md`](tied-close-out-process.md) process step 5 (before `close_out` gate and CHANGELOG).
- **Checklist** — slug `gitignore-close-out-hygiene` (after `persist-citdp-record`, before `traceable-commit`).

## Git policy matrix

| Surface | Read-only `git status` / `git diff --name-only` | Edit `.gitignore` (unstaged) | `git add` / `git commit` |
|---------|---------------------------------------------------|------------------------------|--------------------------|
| **plan-close-out** | **Forbidden** — use [caller git context](git-context-templates.md) / pasted untracked path list only | **Allowed** when unambiguous; otherwise propose-only in handoff | **Forbidden** |
| **checklist `gitignore-close-out-hygiene`** | **Allowed** when caller context is thin | **Allowed** unstaged; stage at `traceable-commit` | **Forbidden at this slug** |
| **`traceable-commit`** | As needed for staging | N/A | **Allowed** |

## Inputs

1. **Caller git context** (plan-close-out) or read-only git output (checklist).
2. Current `.gitignore` comment blocks as the pattern catalog (especially `# Ephemeral working/` and qualification harness blocks).
3. Paths observed during the change (typically under `working/`, gate receipts, sweep reports, `run-*-gates.mjs`, `*.tsbuildinfo`).

## Classification

| Class | Meaning | Action |
|-------|---------|--------|
| **ignore** | Regenerable local-dev output; not canonical TIED intent | Add or confirm gitignore pattern |
| **track** | Aggregate, golden, fixture, or intentional deliverable | Do **not** ignore; use `!` negation when a broad pattern would hide it |
| **delete** | One-off scratch with no convention | Remove locally; do not add a one-off ignore unless it will recur |

## Procedure

1. List untracked or newly recurring ephemeral paths from inputs.
2. For each path, check existing `.gitignore` rules (including negated `!` exceptions).
3. When a gap exists, propose or apply **convention patterns** grouped under the matching comment block (mirror lines 27–105 of `.gitignore`).
4. Prefer `working/**/convention-*.ext` over literal paths.
5. When a broad pattern would hide a **track** aggregate, add `!` negation on the next line (example: `phase3/*` with `!.../phase3/summary.json`).
6. Record handoff evidence (templates below) or explicit **N/A** with rationale.

## N/A criteria

Record **N/A** when:

- No ephemeral untracked paths were observed, **or**
- Every observed path is already covered by an existing pattern (cite rule lines), **or**
- All ephemeral paths were classified **track** and correctly left unignored.

Do not record N/A without reviewing inputs or read-only status when untracked noise is visible.

## Handoff bullet templates

Include **exactly one** in plan-close-out / checklist close-out handoff:

**N/A (already covered):**

```markdown
- **Gitignore hygiene ([PROC-GITIGNORE_CLOSE_OUT]):** N/A — untracked paths match existing `working/.../phase3/*` (`.gitignore:95–96`); no new patterns.
```

**Proposed (plan-close-out, not applied):**

```markdown
- **Gitignore hygiene ([PROC-GITIGNORE_CLOSE_OUT]):** Proposed (not applied — plan-close-out): add `working/**/qualification-sweep-*.json` under `# Ephemeral working/` block; no `!` negations required.
```

**Applied unstaged:**

```markdown
- **Gitignore hygiene ([PROC-GITIGNORE_CLOSE_OUT]):** Applied unstaged `.gitignore` additions: `working/**/sweep-*.report.json` (+ comment); stage at `traceable-commit`.
```

**Track / do not ignore:**

```markdown
- **Gitignore hygiene ([PROC-GITIGNORE_CLOSE_OUT]):** Classified `working/.../summary.json` as **track** (aggregate artifact); existing `!` negation retained; no new ignores.
```

## Counterexamples (must not happen)

- Broad `working/**` without `!` for trackable aggregates.
- One-off path literals when a convention pattern exists.
- Treating modified tracked source/TIED files as ephemeral.
- Agent-initiated git commands in **plan-close-out**.
- Blocking close-out when hygiene is incomplete.

## Cross-refs

- [PROC-AGENT_REQ_CHECKLIST](../../../tied/docs/agent-req-implementation-checklist.md) — checklist slug `gitignore-close-out-hygiene`
- [PROC-COMMIT_MESSAGES](../../../tied/docs/processes.md) — staging at `traceable-commit`
