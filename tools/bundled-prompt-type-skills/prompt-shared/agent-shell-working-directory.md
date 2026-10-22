# Agent shell working directory (prompt-shared)

**Audience:** AI agents that run shell commands or generate bash scripts in TIED client repos.

**Problem:** Conversation history does **not** reliably record the shell’s current working directory (`cwd`). Commands that use bare `./` or `../` paths, or that assume a prior `cd` still applies, are an anti-pattern for multi-step agent workflows.

**Principle:** One **persistent anchor** — the repository (or project) root — declared explicitly every time. Relative paths are allowed only **relative to that anchor**, never to an unknown `pwd`.

---

## Every agent shell tool call

1. Pass the **absolute** repository root as `working_directory` on **every** shell invocation (or an absolute subdirectory when the task truly requires it — state why in the same turn).
2. Prefer **absolute paths** in the command, or paths built from a named root variable in a script (`${REPO_ROOT}/...`).
3. Do **not** assume a `cd` from a previous turn is still active.
4. For one-off directory changes, use a **subshell** in one invocation: `( cd -- "/abs/path" && command )` instead of leaving the session in a subdirectory.
5. MCP and `tied-cli` resolve relative file paths from **process cwd**; use absolute `TIED_BASE_PATH` and absolute tool paths when in doubt.

---

## Every generated bash script

1. Start from [`agent-shell-script-header.template.sh`](agent-shell-script-header.template.sh) (or equivalent contract).
2. Derive or validate an absolute **`REPO_ROOT`** from `${BASH_SOURCE[0]}`; optional `REPO_ROOT` env override must be absolute.
3. Set **`MARKER_REL`** to a file that exists only at the intended root (e.g. `tied-install.sh`, `.git/HEAD`). The template **must fail** until `MARKER_REL` is set.
4. Call **`assert_repo_root`** (or the same checks) **before any side effect** (writes, installs, destructive commands).
5. Inside the script, use only **`${REPO_ROOT}/...`** for repo-relative paths — not bare `./` unless you are already inside a guarded subshell with a validated cwd.

### `cd` policy in scripts

- Prefer **`( cd -- "$dir" && command )`** for isolated work in another directory ([`scripts/build-commands.sh`](../../../scripts/build-commands.sh) `echo_exec` pattern).
- If the script changes directory globally, re-validate the expected root and marker **immediately after** each `cd` and before mutations.
- On mismatch, print a **`DIAGNOSTIC:`** line (expected root, marker path, actual `pwd`) and **exit non-zero** — fail closed, do not proceed in the wrong tree.

---

## Gate trail (when evidence already exists)

At meaningful workflow gates (plan handoff, verification, close-out), when you already write handoff or evidence artifacts, record:

- `repo_root` (absolute)
- script path (if any)
- `marker` used
- timestamp (ISO)

Use an **existing** plan, handoff, or envelope field — do **not** create a new evidence tree solely for a trivial one-liner shell command.

---

## Forbidden

- Unexplained `./` or `../` in agent-issued commands without a declared anchor.
- Scripts that `cd` without root/marker validation before side effects.
- Relative MCP/TIED paths without confirming absolute `TIED_BASE_PATH` matches the repo under change.

---

## References

- [`tied-install.sh`](../../../tied-install.sh) — `SCRIPT_DIR` anchor
- [`mcp-server/README.md`](../../../mcp-server/README.md) — path resolution vs process cwd
