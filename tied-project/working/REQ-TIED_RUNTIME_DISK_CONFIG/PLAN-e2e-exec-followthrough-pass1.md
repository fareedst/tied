---
name: E2E exec follow-through for linked CLI stubs
overview: Align bootstrap-and-load e2e with linked-install design—assert runtime resolver on store exec target, not only client stub text. Light LEAP on [REQ-TIED_CLI_MCP_JSON_BASE_PATH] and [IMPL-TIED_LAYERED_CLIENT_INSTALL]; closes RDC verification gap without changing writeExecWrapper.
todos:
  - id: citdp-tracker
    content: CITDP + Tracker; pre_implementation gate allowed 2026-11-03
    status: completed
  - id: test-helper
    content: effectiveScriptTextForRuntimeDiskCheck + assertScriptsResolveRuntimeFromDisk(path) in bootstrap-and-load.test.ts
    status: completed
  - id: verify-e2e
    content: npx tsx --test src/e2e/bootstrap-and-load.test.ts (script runtime slice)
    status: completed
  - id: leap-impl-req
    content: WRITE_EXEC_WRAPPER block + SC-CLI-NO-SHELL-PATH-AUTHORITY metric; pseudocode_validate if needed
    status: completed
  - id: handoff-citdp-note
    content: session-handoff + optional CITDP RDC test_strategy note
    status: completed
isProject: true
---

# E2E exec follow-through (refined pass 1)

**Refined:** 2026-11-03  
**Source plan:** Cursor plan *E2E exec follow-through* (approach 1)  
**Working folder:** `tied-project/working/REQ-TIED_RUNTIME_DISK_CONFIG/`  
**Primary tokens:** [REQ-TIED_CLI_MCP_JSON_BASE_PATH], [REQ-TIED_LAYERED_CLIENT_INSTALL], [REQ-TIED_RUNTIME_DISK_CONFIG] (verification closure only — no new REQ)  
**CITDP:** [CITDP-CLI-E2E-EXEC-FOLLOWTHROUGH.yaml](./CITDP-CLI-E2E-EXEC-FOLLOWTHROUGH.yaml)  
**Tracker:** [agent-req-e2e-exec-checklist.yaml](./agent-req-e2e-exec-checklist.yaml)

**Depth / gates:** `profile_depth: minimal`, `gate_policy: advisory`  
**Pre-implementation gate:** `allowed: true` (2026-11-03; minimal depth). Inner CITDP body to `tied_checklist_gate_validate` (not wrapper key only).

---

## Refine — pass 1

| Topic | Resolution |
| --- | --- |
| **Approach** | **Approach 1 only:** test follows `exec` to store canonical script; no `writeExecWrapper` or stub materialization changes |
| **Sponsor scope** | Test + light LEAP (IMPL sidecar + REQ metric text); **no** production bootstrap behavior change |
| **Working REQ** | Amends traceability on existing **[REQ-TIED_CLI_MCP_JSON_BASE_PATH]** and **[IMPL-TIED_LAYERED_CLIENT_INSTALL]**; closes **[REQ-TIED_RUNTIME_DISK_CONFIG]** handoff “known gap” |
| **Exec path shape** | Wrapper emits `exec "<jsonSafeAbsolute store script>"` per [`writeExecWrapper`](../../../tools/bootstrap/lib/layers/skills-linked.mjs); helper regex must match quoted absolute path (forward slashes) |
| **Security of follow-through** | Target path must exist and include substring `bundled-tied-yaml-skill/scripts/` — rejects arbitrary exec targets |
| **Redundant assertion** | Remove lines 377–381 duplicate (`exec store OR resolver in stub`); helper subsumes |
| **Full file e2e** | Run entire `bootstrap-and-load.test.ts`; fix only script-runtime failures in scope; report unrelated failures without expanding scope |

**Costly choices (explicit defer)**

- Removing `TIED_REPO_ROOT` export from linked wrappers (runtime disk policy cleanup) — **defer**
- Copying `resolve-tied-cli-env.mjs` into client linked trees — **reject** (approach 2)

---

## Goal

Linked clients install **thin bash wrappers** that `exec` store [`tied-cli.sh`](../../../tools/bundled-tied-yaml-skill/scripts/tied-cli.sh). Runtime resolution runs in the **store** script via [`resolve-tied-cli-env.mjs`](../../../tools/bundled-tied-yaml-skill/scripts/resolve-tied-cli-env.mjs) using **client cwd**. E2e must verify that contract, not require the resolver string in stub text alone.

```mermaid
flowchart LR
  stub[Client_stub]
  store[Store_tied_cli_sh]
  resolver[resolve_tied_cli_env_mjs]
  mcp[Client_mcp_json]
  stub -->|exec| store
  store --> resolver
  resolver --> mcp
```

---

## Code anchors (read-only)

| Artifact | Role |
| --- | --- |
| [`mcp-server/src/e2e/bootstrap-and-load.test.ts`](../../../mcp-server/src/e2e/bootstrap-and-load.test.ts) | `assertScriptsResolveRuntimeFromDisk` — change point |
| [`tools/bootstrap/lib/layers/skills-linked.mjs`](../../../tools/bootstrap/lib/layers/skills-linked.mjs) | `writeExecWrapper` — behavior unchanged |
| [`tools/bundled-tied-yaml-skill/scripts/tied-cli.sh`](../../../tools/bundled-tied-yaml-skill/scripts/tied-cli.sh) | Canonical resolver wiring |

---

## Plan — CITDP summary

| Area | Change |
| --- | --- |
| **change_definition** | E2e greps client stub only; linked install delegates resolver to store script |
| **impact** | `bootstrap-and-load.test.ts`; IMPL sidecar block; REQ detail metric line; handoff |
| **risk** | Low — test alignment |
| **test-strategy** | Single e2e file; three script paths |

Full record: [CITDP-CLI-E2E-EXEC-FOLLOWTHROUGH.yaml](./CITDP-CLI-E2E-EXEC-FOLLOWTHROUGH.yaml).

---

## Test strategy (acceptance)

| ID | Criterion | Metric |
| --- | --- | --- |
| **SC-CLI-E2E-EXEC-RESOLVER** | Installed linked `tied-cli.sh`, `tied.sh`, `feature-orchestrator.sh` satisfy runtime-disk check via inline resolver **or** verified exec to store script containing `resolve-tied-cli-env.mjs` | `bootstrap-and-load.test.ts` helper |
| **SC-CLI-E2E-NO-BAKE-PLACEHOLDER** | Effective script text (stub or exec target) must not contain `/ABSOLUTE/PATH/TO/TIED/SOURCE/DIR` | same helper |
| **SC-CLI-E2E-REGRESSION** | Existing bootstrap-and-load cases unrelated to script grep remain unchanged in behavior | full file run |

**Command:**

```bash
cd mcp-server && npx tsx --test src/e2e/bootstrap-and-load.test.ts
```

---

## Implement — ordered checklist

Follow [agent-req-e2e-exec-checklist.yaml](./agent-req-e2e-exec-checklist.yaml).

1. **test-helper** — Add `effectiveScriptTextForRuntimeDiskCheck(scriptPath, label)`; refactor `assertScriptsResolveRuntimeFromDisk` to take path; update three call sites; drop redundant 377–381 block; token comments on helper.
2. **verify-e2e** — Run command above; confirm “tied-install populates tied-project/…” script assertions pass.
3. **leap-impl-req** — Add `WRITE_EXEC_WRAPPER` (or extend linked skills block) in `IMPL-TIED_LAYERED_CLIENT_INSTALL-pseudocode.md`; `yaml_detail_update` on **SC-CLI-NO-SHELL-PATH-AUTHORITY** metric → cite e2e exec follow-through.
4. **sync-tied-stack** — `pseudocode_validate` on touched IMPL if gated; `lint_yaml` on REQ detail; `tied_validate_consistency`.
5. **handoff-citdp-note** — session-handoff verify section; optional one line in persisted RDC CITDP `test_strategy`.

**Next workflow:** `@build-plan` this file or implement directly.

---

## Out of scope

- `writeExecWrapper` body changes
- New REQ/ARCH/IMPL tokens
- MCP server production code beyond e2e test file

---

## Tracker / gate status

| Step | Disposition |
| --- | --- |
| change-definition, impact-discovery, risk-assessment, test-strategy | completed (this plan + CITDP) |
| sub-adversarial-inquiry-pass | not_applicable (minimal) |
| Implement | pending |
