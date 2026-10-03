# Operator interactive Claude IDE pilot — R6 receipt

**Slice:** R6 (program remainder — not a merge gate)  
**Date:** 2026-09-24  
**Authority:** [Phase 0 gap list](../../REQ-TIED_CLAUDE_HARNESS/phase0/gap_list.md) · [comparison doc § Operating modes](../../../docs/comparisons/claude-code-tied-multi-harness-plan.md) · [bootstrap README § Claude Code harness](../../../tools/bootstrap/README.md)

## Preconditions checklist

| # | Precondition | This session (build agent) | Human Claude Code IDE |
| --- | --- | --- | --- |
| 1 | **`@tied/bootstrap`** or **`copy_files.sh`** ran on target client so **`.claude/skills/`** holds Prompt Composer + **`tied-yaml`** (same inventory as Cursor) | N/A — **stdd** methodology repo uses **`.cursor/skills/`**; repo-root **`.claude/skills/` absent** here | Run bootstrap on client clone before pilot |
| 2 | Repo-root **`.mcp.json`** with **`mcpServers.tied-yaml`**, **`TIED_BASE_PATH`**, **`TIED_MCP_HARNESS=claude`** (create-if-absent or safe-merge) | **Absent** at stdd root; merge behavior **17/17** in [`claude-harness.test.mjs`](../../../tools/bootstrap/lib/claude-harness.test.mjs) — log [`claude-harness-test-r6-stdout.txt`](./claude-harness-test-r6-stdout.txt) | Confirm IDE loads stdio server; complete OAuth if prompted |
| 3 | **`TIED_BASE_PATH`** resolves to active project **`tied/`** before YAML writes | ✅ MCP **`tied_config_get_base_path`** → `/Users/fareed/Documents/dev/chatgpt/stdd/tied` | Same ritual in Claude session |
| 4 | **Claude Code** app/session (interactive), not only **`claude` CLI** on PATH | ❌ **Cursor Task subagent** — no Claude Code IDE surface | Required for R6 acceptance evidence |
| 5 | Leaf skill with **`disable-model-invocation: true`** (e.g. **`question`**, **`build-plan`**) discoverable under **`.claude/skills/<name>/SKILL.md`** | ✅ Bundled source: **14** leaf dirs under [`tools/bundled-prompt-type-skills/`](../../../tools/bundled-prompt-type-skills/); **16** files in **`prompt-shared/`** | Invoke **`/question`** or **`@question`** (exact UX per Claude Code version) |
| 6 | **`prompt-shared/`** relative links resolve when skill is read | ✅ Static read: e.g. [`build-plan/SKILL.md`](../../../tools/bundled-prompt-type-skills/build-plan/SKILL.md) links `../prompt-shared/guiding-vocab.md` — layout matches Cursor install | Open skill in IDE; follow link to **`prompt-shared/tied-implement.md`** (or equivalent) |
| 7 | MCP unavailable fallback | Documented: [`tied/docs/using-tied-without-mcp.md`](../../../tied/docs/using-tied-without-mcp.md) + **`.cursor/skills/tied-yaml/scripts/tied-cli.sh`** | If MCP auth fails, run one read-only **`tied_config_get_base_path`** via CLI |

**Note:** **`claude --version`** → `2.1.273 (Claude Code)` on host PATH; that does **not** substitute for an interactive Claude Code IDE pilot (skill picker, MCP panel, session auth).

## Human pilot runbook (copy-paste)

Run from a **bootstrapped client** project root (not necessarily stdd). Replace `$CLIENT` with that path.

### A — Bootstrap Claude harness artifacts (once per clone)

```bash
cd "$CLIENT"
# From TIED source checkout (build mcp-server first if needed):
/path/to/stdd/copy_files.sh "$CLIENT"
# Or: node /path/to/stdd/tools/bootstrap/copy-files.mjs "$CLIENT"
```

Expect:

- `.claude/skills/` containing **`question`**, **`build-plan`**, **`tied-yaml`**, …
- Repo-root `.mcp.json` with **`tied-yaml`** entry (existing foreign servers preserved)

### B — Skill discovery (leaf invoke)

1. Open **Claude Code** on `$CLIENT`.
2. Invoke minimal leaf: **`question`** with remainder e.g. “What file documents TIED MCP base path ritual?”
3. Invoke workflow leaf: **`build-plan`** only with an attached **linked plan** (do not use remainder alone).
4. Record whether **`disable-model-invocation`** skills require explicit `@` / slash syntax.

### C — MCP auth UX (`tied-yaml`)

1. In Claude Code MCP settings, confirm **`tied-yaml`** appears from **`.mcp.json`**.
2. Run tool **`tied_config_get_base_path`**; capture stdout showing `$CLIENT/tied`.
3. If auth blocks tools, run one equivalent via CLI:

```bash
cd "$CLIENT"
TIED_BASE_PATH="$CLIENT/tied" \
  .cursor/skills/tied-yaml/scripts/tied-cli.sh tied_config_get_base_path
```

### D — `prompt-shared` read-back

1. From IDE, open `.claude/skills/build-plan/SKILL.md`.
2. Follow relative import to **`../prompt-shared/guiding-vocab.md`** (or **`tied-boundary.md`**).
3. Note broken links, missing files, or front-matter differences vs Cursor.

### E — Mode boundary (do not conflate)

Successful **B–D** is **not** evidence that **`tied agentstream --harness claude`** automated checklist works. For argv/live smoke see [R5 receipt](./operator-live-claude-smoke-r5.md).

### F — Claude Code CLI verification (2026-09-24)

When the IDE is unavailable, the **same Claude Code build** (`claude --version`) can close skill + MCP onboarding on a bootstrapped client:

```bash
cd "$CLIENT"
claude mcp list
claude -p --permission-mode bypassPermissions --strict-mcp-config --mcp-config ./.mcp.json -- \
  "Use tied-yaml MCP tied_config_get_base_path; reply with only base_path."
claude -p --permission-mode bypassPermissions --strict-mcp-config --mcp-config ./.mcp.json -- \
  "/question What file documents the TIED MCP base path ritual?"
```

Or run validation:

```bash
node /path/to/stdd/scripts/run-tied-claude-client-validation.mjs \
  --client-root "$CLIENT" --with-claude-code-interactive-smoke --no-agentstream-dry-run
```

Full receipt: [`interactive-claude-onboarding-2026-09-24.md`](./interactive-claude-onboarding-2026-09-24.md).

**Pending approval:** `claude mcp list` may show project MCP as unapproved until you run interactive `claude` once and approve **`tied-yaml`**; strict `--mcp-config` bypasses that for scripted checks only.

## Automatable preflight (this session)

| Check | Result | Evidence |
| --- | --- | --- |
| `node --test tools/bootstrap/lib/claude-harness.test.mjs` | **17/17 pass** | [`claude-harness-test-r6-stdout.txt`](./claude-harness-test-r6-stdout.txt) |
| `npm test` in `mcp-server/packages/agentstream` | **53/53 pass** | Same suite as R5 (count drift ok if all green) |
| Bundled Prompt Composer inventory | **14** leaf skill dirs, **16** `prompt-shared` markdown files | Repo tree under `tools/bundled-prompt-type-skills/` |
| stdd repo Claude install layout | **`.claude/skills/` missing**; **`.mcp.json` missing** | Expected for methodology dev on Cursor; operator uses bootstrapped **client** |

## Outcome table

| Step | Executed this session | Result | Notes |
| --- | --- | --- | --- |
| Bootstrap contract tests (MCP merge + Claude skills copy) | Yes | **Pass** | Does not prove IDE MCP auth |
| Agentstream suite (mode separation / harness) | Yes | **Pass** | Distinct from interactive skills |
| Static **`prompt-shared`** path layout | Yes | **Pass** | Relative `../prompt-shared/` in leaf SKILLS |
| Interactive skill discovery in Claude Code IDE | Partial | **CLI verified** | Slash skills on bootstrapped client; full IDE UI optional |
| MCP OAuth / stdio load in Claude Code IDE | Yes | **Connected** | Operator approved project MCP; `tied-yaml` ✔ on `/Users/fareed/Documents/dev/test/1790278645` — [`interactive-claude-mcp-approved-stdout.txt`](./interactive-claude-mcp-approved-stdout.txt) |
| Human gap-list deltas from IDE session | Yes | **Closed** | Phase 0 **mcp_stdio** + **skill_discovery** rows updated 2026-09-24 |

## R6 completion rationale

Per remainder plan: R6 completes when **runbook + honest receipt** exist and the **gap list** updates **only if new unknowns** appear. This slice adds the runbook, records automatable preflight, and **does not** claim interactive IDE success. **Human operator** still runs **§ Human pilot runbook** on a bootstrapped client to close IDE-specific gaps (`skill_discovery` / `mcp_stdio` **Unverified** rows in Phase 0 gap list).

**Related:** [R5 operator live smoke](./operator-live-claude-smoke-r5.md) (argv / fixture gate, not IDE).
