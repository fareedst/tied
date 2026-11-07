# PLAN — REQ-TIED_STORE_README_MCP_MANUAL_ACCEPTANCE

**Status:** build-plan complete · **Handoff:** `@close-out`

**Profile:** `depth_tier: minimal` · `gate_policy: advisory`

**Sponsor intent (locked):** Root [README.md](../../../README.md) documents **manual** operator steps to accept/enable TIED MCP in **Cursor** and **Claude CLI**, not only `agent mcp enable`.

---

## Locked decisions (refine-plan)

| Topic | Decision |
|-------|----------|
| **Section anchor** | HTML id `manual-mcp-acceptance` immediately under `#### 2. Optionally enable the MCP server`; keep existing markdown slug `#2-optionally-enable-the-mcp-server` for backward links |
| **Quick start step 4** | Link target `#manual-mcp-acceptance` (replace bare `#2-optionally-enable-the-mcp-server` only on step 4) |
| **Primary verify step 3** | Same anchor: “approve MCP” → link `#manual-mcp-acceptance` |
| **Operator lens step 4** | **One sentence** + link to [README#manual-mcp-acceptance](../../../README.md#manual-mcp-acceptance); no duplicated TUI block |
| **`agent mcp enable`** | **Advanced / optional** subsection after manual flows; one command + link to [adding-tied-mcp §3.3](../../../tied-bundle/docs/adding-tied-mcp-and-invoking-passes.md) |
| **Display label coexistence** | Document **workspace folder basename** on inner Cursor control today; parenthetical: after [REQ-TIED_CURSOR_MCP_DISPLAY_LABEL](../../REQ-TIED_CURSOR_MCP_DISPLAY_LABEL/PLAN.md) ships, expect **`tied`** / **`tied-optin`** |
| **Structure-test substrings** | Add exactly: `manual-mcp-acceptance`, `Customize`, `MCPs`, `tied-yaml-optin`, `2 new MCP servers found`, `Enable selected` to [store-readme-structure.test.ts](../../../mcp-server/src/store-readme-structure.test.ts) `REQUIRED_SUBSTRINGS` |
| **L2 ordered-block test** | **Omitted** — substring contract is sufficient for doc-only scope |
| **CHANGELOG** | One line under [Unreleased] doc fixes at `@close-out` (optional if 4.1.0 still open) |

---

## Cursor manual flow (copy for build)

1. Run Cursor with the **client** or **primary** repo open (folder containing `tied-project/` and `.cursor/mcp.json`).
2. **Settings** → **Customize** → **MCPs**.
3. Under **Connected**, select **`tied-yaml`**.
4. Click the **first inner control** labeled with the **workspace folder basename** (parent directory of `tied-project/`, e.g. `stdd` on this store clone).
5. Repeat for **`tied-yaml-optin`** when infrequent tools are needed ([mcp-server README](../../../mcp-server/README.md) — tool profiles).
6. Verify: MCP **`tied_config_get_base_path`** → this project’s `tied-project/`.

---

## Claude CLI manual flow (copy for build)

1. After `tied-install`, confirm repo-root **`.mcp.json`** lists `tied-yaml` and `tied-yaml-optin`.
2. From project root, run **`claude`**; approve **trust this folder** on first launch.
3. When prompted with **2 new MCP servers found**, keep both servers checked and choose **Enable selected**:

```
────────────────────────────────────────────────────────────────────────────────
  2 new MCP servers found in this project
  Select any you wish to enable.

  MCP servers may execute code or access system resources. All tool calls
  require approval. Learn more in the MCP documentation.

  ❯ [✔] tied-yaml
    [✔] tied-yaml-optin
       Enable selected
 Space to select · Esc to reject all
```

4. Per-call tool approval still applies in Claude; **Esc** at this menu rejects all servers.

---

## Traceability (build-plan creates indexes)

| Layer | Token |
|-------|--------|
| REQ | **[REQ-TIED_STORE_README_MCP_MANUAL_ACCEPTANCE]** |
| ARCH | **[ARCH-TIED_STORE_README_MCP_ONBOARDING]** — extend [ARCH-TIED_STORE_README_INFORMATION_ARCHITECTURE](../../../architecture-decisions/ARCH-TIED_STORE_README_INFORMATION_ARCHITECTURE.yaml) |
| IMPL | **[IMPL-TIED_STORE_README_MCP_MANUAL_ACCEPTANCE]** — README + structure test + operator-lens link; pseudo-code `DOCUMENT_README_MCP_ACCEPTANCE` |

**Depends on:** [REQ-TIED_STORE_README_OPERATOR_DELIVERY_SPINE](../../../requirements/REQ-TIED_STORE_README_OPERATOR_DELIVERY_SPINE.yaml), [REQ-TIED_CLAUDE_HARNESS](../../../requirements/REQ-TIED_CLAUDE_HARNESS.yaml), [REQ-TIED_SETUP](../../../requirements/REQ-TIED_SETUP.yaml)

**Related:** [REQ-TIED_CURSOR_MCP_DISPLAY_LABEL](../../REQ-TIED_CURSOR_MCP_DISPLAY_LABEL/PLAN.md) (inner label text only)

---

## Build-plan execution order

1. TIED tokens + CITDP persist under `tied-project/citdp/` if not already promoted from working copy.
2. IMPL pseudo-code sidecar block with token comments.
3. README edits (§2 expand + touchpoints).
4. `docs/tied-experience/operator-lens.md` one-liner.
5. Structure test + run `node --import tsx --test src/store-readme-structure.test.ts`.
6. Evidence stub: `evidence/cursor-claude-mcp-acceptance.md` (manual L5; screenshot optional).
7. `tied_validate_consistency`.

---

## Non-goals

- Full rewrite of [adding-tied-mcp-and-invoking-passes.md](../../../tied-bundle/docs/adding-tied-mcp-and-invoking-passes.md).
- Changing bootstrap or MCP config generation.
- Replacing [mcp-server/README.md](../../../mcp-server/README.md) Cursor section (README may link “see also” only).

---

## Artifacts

- [CITDP-REQ-TIED_STORE_README_MCP_MANUAL_ACCEPTANCE.yaml](CITDP-REQ-TIED_STORE_README_MCP_MANUAL_ACCEPTANCE.yaml)
- [test-strategy.md](test-strategy.md)
- [checklist-tracker.yaml](checklist-tracker.yaml)
- [evidence/session-handoff.md](evidence/session-handoff.md)
