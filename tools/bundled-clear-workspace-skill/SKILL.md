---
name: clear-workspace
description: "Clear the workspace toward commit-ready state—run git hygiene, plan-close-out, and traceable-commit prep only as merited. Use when the sponsor invokes /clear-workspace or @clear-workspace. Not for automatic git commit or replacing handoff chat continuity."
disable-model-invocation: true
---

# clear-workspace

**Audience:** sponsor or operator finishing TIED work in the repo and wanting a **clean, scoped, commit-ready** tree without guessing the close-out chain.

Explicit invocation only (`/clear-workspace`, `@clear-workspace`).

## Procedure

1. **Strip prefix** — Remove `/clear-workspace`; remainder may name `request_token`, working folder, or “this REQ only.”

2. **Route** — Follow [clear-workspace-routing.md](../bundled-prompt-type-skills/prompt-shared/clear-workspace-routing.md) in order. Document **N/A** for steps that do not apply.

3. **Delegate close-out** — When close-out artifacts or gates are missing, execute the **`@plan-close-out`** skill procedure (process doc + gates). **Do not commit.**

4. **Git hygiene** — Call MCP **`tied_git_hygiene`** preview; persist receipt under the active working folder. Apply only with sponsor-approved allowlist.

5. **Traceable-commit prep** — When commit-ready per routing doc, run checklist **traceable-commit** prep (vocab VALIDATE, staging map). **Commit only if the sponsor explicitly asks** in this thread.

6. **Hand off** — Summarize what ran, receipt paths, and whether **`@handoff`** is the better next step when not commit-ready.

## Boundaries

| Surface | Role |
| --- | --- |
| **`@handoff`** | New chat continuity; **`evidence/session-handoff.md`** |
| **`@plan-close-out`** | LEAP close-out without commit |
| **`@ammend-commit`** | Staged-patch amend flow only when sponsor invokes it separately |

## Related

- **Routing (normative):** `tools/bundled-prompt-type-skills/prompt-shared/clear-workspace-routing.md`
- **[REQ-TIED_CLEAR_WORKSPACE_SKILL]** · **[REQ-TIED_GIT_HYGIENE]** · **[REQ-TIED_CLIENT_BOOTSTRAP_SKILLS]**
