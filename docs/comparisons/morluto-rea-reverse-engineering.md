# REA: Reverse Engineer Anything — repository summary (read-only capture)

| Field | Value |
| --- | --- |
| **Source** | [morluto/rea](https://github.com/morluto/rea) (MIT) · [rea.tools](https://rea.tools/) |
| **npm package** | [rea-agents](https://www.npmjs.com/package/rea-agents) (`6.8.0` in root `package.json`, **target-repo-observed**) |
| **MCP registry name** | `io.github.morluto/rea` (**target-repo-observed**) |
| **Purpose** | Read-only repository summary for comparison and architecture reference — **external content**; this document does not mint REQ/ARCH/IMPL tokens. |
| **Captured** | 2026-11-08 |
| **Analysis (sibling)** | [morluto-rea-reverse-engineering-vs-tied-agent-management.md](morluto-rea-reverse-engineering-vs-tied-agent-management.md) |
| **Related (large MCP sibling)** | [Open Ontologies repository capture](open-ontologies-repository.md) — ontology **plan/apply** engine; this capture covers **reverse-engineering** MCP |

---

## TL;DR

- **One distribution** — Node/npm CLI + MCP server (`rea-agents`); agents and terminal share workflows (**target-repo-observed** in README).
- **`npx rea-agents setup`** registers MCP and installs bundled workflow skills (including **`reverse-engineer-anything`**) for Cursor, Claude Code, Codex, Gemini CLI, and many other clients — with backups, staged writes, and explicit approval (**target-repo-observed** in `docs/getting-started/installation.md`).
- **Targets** span desktop installs, native binaries (Hopper/Ghidra/IDA/Kuna), JavaScript/Electron, .NET, websites, firmware, GPU objects, Android packages, and more — returns **findings with evidence and stated limitations** (**REA-reported** / **target-repo-observed**).
- **Evidence model** — MCP tools return canonical Evidence records (`normalized_result`, `evidence_id`, limitations); session retention and comparison tools documented in `docs/reference/mcp-contracts.md` (**target-repo-observed**).
- **Schema profiles** — compact vs full MCP input schemas and compact/off output schema modes via environment variables to manage client context limits (**target-repo-observed**).
- **Official-source warning** — README instructs users to trust [morluto/rea](https://github.com/morluto/rea), [rea.tools](https://rea.tools/), or npm only; copied repo names do not establish authenticity (**target-repo-observed**).

---

## What it is

REA (**Reverse Engineer Anything**) is an **agent-facing reverse-engineering harness**: connect an IDE agent or CLI to tools that inspect **shipped artifacts** (binaries, packaged apps, sites) when behavior is not established from available source alone.

The primary workflow skill states: use REA when a claim depends on a **shipped binary or package**, decompilation, runtime evidence, or comparison with behavior not in source; for ordinary analysis of a **complete source repository**, use normal repository tools and skip REA readiness (**target-repo-observed** in `reverse-engineer-anything/SKILL.md`).

### Architecture (summary)

| Layer | Role |
| --- | --- |
| **Clients** | Cursor, Claude Code/Desktop, Codex, VS Code, Gemini CLI, Grok Build, and others via `rea setup --client …` (**target-repo-observed**) |
| **Transport** | MCP stdio (managed setup); optional HTTP listener documented in MCP contracts (**target-repo-observed**) |
| **Workflow skills** | `.agents/skills/*` — `reverse-engineer-anything`, `rea-tool-design`, `rea-analysis-optimization`, `rea-ci-tests-audit`, `rea-changelog-update` |
| **Analysis engines** | Optional native backends (Hopper, Ghidra, IDA, Kuna); static JS/Electron without native engine; provider-specific guides under `docs/` |
| **Outputs** | Evidence records with limitations and unknowns; JSON CLI for JS tree analysis |

### Investigation flow

README describes: the agent calls REA through MCP to inspect the target and trace code; REA returns findings with evidence; the agent explains, implements, or tests in the **user’s** project. CLI commands use the same workflows (**REA-reported** narrative; diagram in `website/public/assets/figures/rea-investigation-flow.svg`).

---

## How it is used

### Quick start (agent)

```bash
npx rea-agents setup
```

Choose agents, review proposed config/skill paths, approve changes, restart the agent. Setup can optionally install or connect Hopper/Ghidra with **separate** approval (**target-repo-observed**).

Example user prompt (README):

```text
Understand how search works in the Notes app, show me the evidence, and build a
similar feature for my project.
```

### Quick start (CLI, JavaScript/Electron)

```bash
npx -y rea-agents@latest analyze-javascript-application /absolute/path/to/app --json
```

Returns modules, imports, Electron boundaries, and evidence (**target-repo-observed**). Native analysis requires configuring a provider first (`docs/getting-started/cli.md`).

### MCP schema profiles

| Variable | Role (**target-repo-observed**) |
| --- | --- |
| `REA_MCP_INPUT_SCHEMA_PROFILE` | `compact` (default) vs `full` tool input guidance |
| `REA_MCP_OUTPUT_SCHEMA_PROFILE` | Complete advertised output schemas (default), `compact`, or `off` |

Both profiles keep full tool set and server-side validation per README.

### Bundled skill routing (summary)

The `reverse-engineer-anything` skill routes targets to tools — for example:

- ASAR / extracted JS/Electron → `analyze_javascript_application`
- Archives / APK / DMG / PyInstaller → `open_binary`, `inspect_artifact`
- Managed .NET → `inspect_managed_artifact`
- Native behavior / live calls → runtime workflows in skill references
- Firmware → `inspect_firmware_regions` / `extract_firmware` (caller-supplied Binwalk/Unblob on Linux)

Full routing lives in the skill body (**target-repo-observed**).

### Supported setup clients (partial list)

From `docs/getting-started/installation.md` (**target-repo-observed**): `claude_code`, `claude_desktop`, `codex`, **`cursor`**, `gemini_cli`, `vscode`, `grok_build`, `windsurf`, `devin`, `opencode`, and others; version-gated entries for newer client IDs.

### Updates

`rea update` for global installs; `npx rea-agents@latest setup` to refresh agent registrations (**target-repo-observed**).

---

## What you can analyze (target matrix)

README table summarizes targets (paraphrase; see upstream for full requirements column):

| Target class | Representative outputs | Native engine |
| --- | --- | --- |
| Desktop installations | Runtime candidates, component markers | Bounded directory/header inspection |
| Native binaries | Pseudocode, assembly, strings, xrefs | Hopper, Ghidra, IDA, or Kuna |
| JavaScript/Electron | Module graph, boundaries | Static — no native engine required |
| Websites / browser scenarios | Capture and trace flows | Browser-oriented tools per MCP catalog |
| .NET managed | IL/metadata inspection | Managed artifact tools |
| Go / GPU / firmware / Android | Format-specific static or provider workflows | Varies by target |

Numeric reliability claims in README badges and marketing are **REA-reported**, **not_measured** in stdd.

---

## Observation boundary (stdd)

| Fact class | Label |
| --- | --- |
| Structure and docs read from GitHub **2026-11-08** | **target-repo-observed** |
| Product narrative, Discord, Trendshift badges | **REA-reported** |
| npm version `6.8.0` vs skill metadata version `61` | **target-repo-observed** — unrelated versioning schemes; cite both without reconciling |
| stdd execution | **Did not** run `rea setup`, REA MCP, native disassemblers, or target CI during this capture |

---

## Target proof limits (from upstream docs)

Summarized from `docs/reference/mcp-contracts.md` and the primary skill (**target-repo-observed**):

- **Evidence** records carry **limitations** and **unknowns**; comparison tools refuse integrity mismatches (`evidence_integrity_mismatch`).
- **Static artifact equality** does not establish unchanged runtime behavior (explicit in MCP contracts).
- **Skill vs installed server** — a skill from repo `main` may describe capabilities absent from an older npm release; operators should use the connected server's `tools/list` (**target-repo-observed**).
- Installing a skill alone does **not** register MCP unless setup or a client plugin does so (**target-repo-observed**).

---

## Notes for stdd readers

- Wave 2 analysis: [morluto-rea-reverse-engineering-vs-tied-agent-management.md](morluto-rea-reverse-engineering-vs-tied-agent-management.md) — maps REA's **evidence-first investigation MCP** to TIED **traceability and gate authority** without adopting RE toolchain as methodology core.
- REA optimizes **black-box understanding**; TIED optimizes **REQ→ARCH→IMPL proof** in the implementation repo. They may **coexist** as separate MCP servers in one Cursor workspace; see Wave 2 authority boundary.
- Working folder: [DOC-MORLUTO-REA-COMPARISON](../../tied-project/working/DOC-MORLUTO-REA-COMPARISON/PLAN-refine-pass1.md).
