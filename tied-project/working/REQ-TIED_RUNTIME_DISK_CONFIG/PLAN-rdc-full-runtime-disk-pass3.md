---
name: RDC full runtime on disk pass 3
overview: Migrate non-secret operator toggles from shell export to store yaml and client mcp.json; secrets stay env-only.
request_token: REQ-TIED_RUNTIME_DISK_CONFIG
profile_depth: minimal
gate_policy: advisory
prior_plans:
  - PLAN-rdc-env-cleanup-pass2.md
  - PLAN-refine-pass2.md
todos:
  - id: refine-pass3
    content: Resolved intent + CITDP pass3_extension + Tracker reset
    status: completed
  - id: schema-operator
    content: tied-store-config.v1 operator section + template store.yaml
    status: completed
  - id: bootstrap-operator-resolve
    content: resolveOperatorFlagsForInstall + installMcpLayer disk-first; RED/GREEN tests
    status: completed
  - id: mcp-json-sync
    content: Refresh writes operator env keys to mcp.json from store + preserve brownfield
    status: completed
  - id: mcp-server-readers
    content: usage-metrics, envelope hooks — spawn from mcp.json (no hot-path disk read)
    status: completed
  - id: jev-operator-local
    content: JEV harness non-secret toggles via operator.local.yaml overlay
    status: completed
  - id: docs-operator-profile
    content: operator-shell-profile, NON-TIED PLAN feature-env row
    status: completed
  - id: req-sc-leap
    content: SC-RDC-OPERATOR-DISK + IMPL pseudo-code LEAP + lint_yaml + tied_validate_consistency
    status: completed
  - id: verify-closeout
    content: verification gate + session-handoff pass 3 closed + persist CITDP to tied-project/citdp/
    status: completed
isProject: true
---

# [REQ-TIED_RUNTIME_DISK_CONFIG] — full runtime on disk except secrets (pass 3)

**Refined:** 2026-11-03  
**Prior:** [PLAN-rdc-env-cleanup-pass2.md](./PLAN-rdc-env-cleanup-pass2.md) (closed **8a16acec**), [pending-full-runtime-disk-handoff.md](./evidence/pending-full-runtime-disk-handoff.md)  
**Working token:** `REQ-TIED_RUNTIME_DISK_CONFIG` (extend — same REQ, pass 3 track)  
**CITDP:** [CITDP-REQ-TIED_RUNTIME_DISK_CONFIG.yaml](./CITDP-REQ-TIED_RUNTIME_DISK_CONFIG.yaml) — `pass3_extension`  
**Tracker:** [agent-req-implementation-checklist-pass3.yaml](./agent-req-implementation-checklist-pass3.yaml)

**Depth / gates:** `profile_depth: minimal`, `gate_policy: advisory`

---

## Refine — pass 3 (resolved intent)

| Sponsor term | Resolved meaning |
| --- | --- |
| **Full runtime on disk (except secrets)** | All **non-secret** operator configuration lives in committed or gitignored **on-disk** surfaces; operators do not rely on shell `export` for first-party toggles. |
| **Operator toggle** | Boolean or enum-like setting that changes first-party behavior (metrics, envelope hooks, agentstream preflight, JEV provider mode). Not a transport path ([pass 2](./PLAN-rdc-env-cleanup-pass2.md)). |
| **Disk surfaces** | **Store:** `.tied/store.yaml` `operator:` section + optional gitignored `.tied/operator.local.yaml` overlay. **Client:** `.cursor/mcp.json` / `.mcp.json` `tied-yaml` env block (written by refresh). |
| **Spawn injection** | MCP/Cursor copies disk values into child `process.env` at spawn — allowed; not “operator shell export”. |
| **Secrets** | `JEV_API_KEY`, API tokens, credentials — env or secret manager only; never committed yaml. |
| **Shell export deprecation** | First-party install and CLI **ignore** operator shell env for catalogued toggle keys when disk defines the key; one-release diagnostic optional for stray exports. |
| **CLI IMPL essence** | `TIED_CLI_IMPL_ESSENCE_*` remains **stdin/file** session transport; document in operator profile, not store yaml. |

**Non-goals (unchanged):** MCP introspection (handoff E); TS/JS shared runtime fixture parity (handoff 4); third-party `INDESCRIPT_*` unless explicitly scoped later.

**Costly choices (defaults — confirm to deviate)**

| Choice | Default | Ladder |
| --- | --- | --- |
| Schema version | Extend **`tied-store-config.v1`** with `operator:` map | Reversible |
| Separate `operator.local.yaml` vs nested in `store.local.yaml` | **`operator.local.yaml`** gitignored for machine-local JEV/harness prefs | Reversible |
| Consumer migration order | Bootstrap install → MCP server readers → agentstream → JEV | Reversible |

---

## Operator toggle catalog (pass 3)

| Env key (spawn) | Store yaml path | Phase |
| --- | --- | --- |
| `TIED_MCP_COLLECT_METRICS` | `operator.mcp.collect_metrics` | **Slice 1** (bootstrap) |
| `TIED_ENVELOPE_HOOKS` | `operator.mcp.envelope_hooks` | Slice 2 |
| `AGENTSTREAM_TIED_MCP_PREFLIGHT` | `operator.agentstream.tied_mcp_preflight` | Slice 2 |
| `AGENTSTREAM_SKIP_TIED_MCP_PREFLIGHT` | `operator.agentstream.skip_tied_mcp_preflight` | Slice 2 |
| `AGENTSTREAM_CHECKLIST_VAR_STRICT` | `operator.agentstream.checklist_var_strict` | Slice 3 |
| `AGENTSTREAM_JEV_HARNESS` | `operator.jev.harness` | Slice 3 |
| `TIED_JEV_DECISION_PROVIDER` | `operator.jev.decision_provider` | Slice 3 |
| `TIED_JEV_LOCAL_BRIDGE` | `operator.jev.local_bridge` | Slice 3 |

---

## Goal

After pass 3, an operator configures toggles via **`./tied-install.sh --refresh`** and edited store/client yaml; dev shell **does not need** `export TIED_MCP_COLLECT_METRICS` / `AGENTSTREAM_*` / non-secret `TIED_JEV_*` for first-party tools.

---

## Plan — CITDP summary

| Area | Pass-3 change |
| --- | --- |
| **change_definition.current** | Pass 2 moved **paths** to disk; toggles still documented as shell exports in operator-shell-profile and read from `process.env` in MCP/agentstream. |
| **change_definition.desired** | Toggle catalog on disk; install refresh syncs to mcp.json; consumers honor disk-first policy; REQ **SC-RDC-OPERATOR-DISK**. |
| **unchanged_behavior** | Secrets env-only; MCP spawn still injects env from mcp.json; global paths unchanged. |

---

## Test strategy

| Command | Notes |
| --- | --- |
| `node --test tools/bootstrap/lib/tied-runtime-config.test.mjs tools/bootstrap/lib/mcp-layer.test.mjs` | SC-RDC-OPERATOR-DISK bootstrap |
| `cd mcp-server && npx tsx --test src/usage-metrics.test.ts src/request-evidence-envelope/hooks.composition.test.ts` | After MCP reader slice |
| `cd mcp-server && npx tsx --test packages/agentstream/src/dry-run-config.test.ts` | After agentstream slice |
| `./tied-install.sh --refresh .` | Smoke |

---

## Implement phases

1. **Slice 1 (this session):** Schema + `resolveOperatorFlagsForInstall` + mcp layer disk-first `collect_metrics`; RED/GREEN unit tests.
2. **Slice 2:** Envelope hooks + agentstream preflight keys in refresh + MCP readers.
3. **Slice 3:** JEV operator.local.yaml + harness readers.
4. **Slice 4:** Docs, REQ/IMPL LEAP, verification, close-out.

**LEAP rule:** Code ≠ pseudo-code → IMPL first.

---

## Handoff

| Artifact | Role |
| --- | --- |
| [session-handoff.md](./evidence/session-handoff.md) | Plan spine pass 3 status |
| [pending-full-runtime-disk-handoff.md](./evidence/pending-full-runtime-disk-handoff.md) | Close when pass 3 ships |
