---
name: TIED config report CLI + MCP
overview: "Central read-only TIED configuration report with provenance; bootstrap builder shared by no-spawn CLI and MCP tied_config_report."
todos:
  - id: tied-stack
    content: Create REQ/ARCH/IMPL-TIED_CONFIG_REPORT (+ semantic token, pseudocode sidecar) via TIED MCP/tied-cli
    status: pending
  - id: red-report-tests
    content: RED — tied-config-report.test.mjs (fixture catalog + secrets + provenance)
    status: pending
  - id: report-builder
    content: GREEN — buildTiedConfigReport in tools/bootstrap/lib/tied-config-report.mjs
    status: pending
  - id: cli-entry
    content: tied-config-report-cli.mjs + client exec wrapper; bootstrap-and-load exec follow-through test
    status: pending
  - id: mcp-tool
    content: tied_config_report in tools/index.ts + tied-config-report.test.ts (core profile)
    status: pending
  - id: docs-vocab-closeout
    content: README/SKILL/operator-lens; vocab RECORD; CITDP persist; validate_consistency; verify
    status: pending
isProject: true
---

# [REQ-TIED_CONFIG_REPORT] — configuration report (refined)

**Refined:** 2026-11-03 (`refine-plan`)  
**Parent context:** [REQ-TIED_RUNTIME_DISK_CONFIG](../../requirements/REQ-TIED_RUNTIME_DISK_CONFIG.yaml) (`SC-RDC-MCP-INTROSPECTION` covers path subset only)  
**CITDP:** [CITDP-REQ-TIED_CONFIG_REPORT.yaml](./CITDP-REQ-TIED_CONFIG_REPORT.yaml)  
**Tracker:** [agent-req-implementation-checklist.yaml](./agent-req-implementation-checklist.yaml)

**Depth / gates:** `profile_depth: minimal`, `gate_policy: advisory`, `depth_tier: minimal`  
**Pre-implementation gate:** run after Tracker/CITDP edits (`tied_checklist_gate_validate`).

---

## Refine — selection and RESOLVE

| Need | Drift risk | In v1? |
| --- | --- | --- |
| Single operator view of paths + toggles + set guidance | **High** — shell exports vs disk vs IDE MCP env diverge silently | **Yes** |
| Extend `tied_config_get_base_path` JSON shape | **Medium** — breaks agents expecting stable keys | **No** — new tool + CLI schema |
| MCP spawn for every report | **Low** — slow, needs built dist for basic diagnostics | **No** for primary CLI; **Yes** as optional `tied-cli.sh tied_config_report` parity smoke |

**Canonical terms**

- **Config report** — `schema: tied-config-report.v1` document: effective values, provenance, and `configure_via` hints; read-only.
- **Catalogued entry** — A known TIED setting (path, operator toggle, MCP env key, CLI transport key, secret key) emitted by the builder—not an arbitrary env dump.
- **Basic report** — Default: secret catalog values omitted (`present` + `[REDACTED]` or absent); non-secrets show effective values.
- **Corpus path authority** — Unchanged: YAML MCP writes still use `getBasePath()` / install mcp.json; report **describes** authority, does not change it.

**Reversible choices (defaults for implement)**

| Decision | Default |
| --- | --- |
| MCP tool profile | **core** (not added to `OPTIN_TOOL_NAMES`; operator diagnostic like `tied_config_get_base_path`) |
| Primary CLI | `node tools/bootstrap/tied-config-report-cli.mjs` from store; client **exec wrapper** to same store script (linked install pattern) |
| JSON canonicalization | Same as MCP: `prettyCanonicalJson` / stable key order in tests |
| `requireDistExists` for report | **false** (report may run when dist missing; entry notes `mcp_dist_missing: true`) |
| Identity routing resolution | **Display-only** parse of `project-identity.v1.yaml`; link to `tied_config_get_base_path` for live routing in `notes[]` |
| Secret catalog v1 | `JEV_API_KEY` only; IMPL documents extension policy (explicit list, no `*_` wildcards) |

**Costly choice (sponsor confirmed)**

- **CLI + MCP** share one bootstrap module; MCP dynamically imports store `tools/bootstrap/lib/tied-config-report.mjs` (same pattern as [tied-runtime-introspection.ts](../../../mcp-server/src/tied-runtime-introspection.ts)). Accepted: avoids duplicating operator catalog rules in TS.

**Open questions (defaults unless sponsor overrides)**

| Question | Default |
| --- | --- |
| REQ token name | **REQ-TIED_CONFIG_REPORT** |
| Umbrella `@tied/cli` subcommand | **Defer** — v1 documents node + shell wrapper only |
| Include `tied-project/config.yaml` (YAML style) | **Optional section** if file exists (display path + scalar_style only) |

---

## Plan — CITDP summary

### Change definition

| | |
| --- | --- |
| **Current** | Operators stitch `tied_config_get_base_path`, mcp.json, `.tied/store.yaml`, and shell env manually; no unified provenance or “where to set” guidance; secrets risk if env is printed ad hoc. |
| **Desired** | One report from store or client cwd: paths, operator toggles (disk vs mcp.json), ignored shell globals, CLI session keys, optional secrets; every catalogued row has `source_kind`, `source_ref`, `configure_via`. |

### Impact

| Module | Change |
| --- | --- |
| `tools/bootstrap/lib/tied-config-report.mjs` | **New** — `buildTiedConfigReport`, `SECRET_ENV_KEYS`, section builders |
| `tools/bootstrap/tied-config-report-cli.mjs` | **New** — argv parse, stdout JSON/text, stderr warnings |
| `tools/bootstrap/lib/tied-config-report.test.mjs` | **New** — RED/GREEN |
| `tools/bundled-tied-yaml-skill/scripts/tied-config-report.sh` | **New** — client wrapper (exec store CLI or embed node + import path) |
| `mcp-server/src/tied-config-report.ts` | **New** — dynamic import wrapper (mirror introspection) |
| `mcp-server/src/tied-config-report.test.ts` | **New** |
| `mcp-server/src/tools/index.ts` | Register `tied_config_report` |
| `mcp-server/src/e2e/bootstrap-and-load.test.ts` | Assert linked stub can exec report script (optional slice) |
| TIED REQ/ARCH/IMPL + `semantic-tokens.yaml` | **New** tokens |
| Docs: `mcp-server/README.md`, tied-yaml SKILL, `tools/bootstrap/README.md`, operator-lens | Operator invocations |

### Success criteria (REQ draft — copy into detail on author-requirement)

| ID | Criterion | Metric |
| --- | --- | --- |
| **SC-CR-CLI-STORE** | Store root with `.tied/store.yaml` → exit 0, `schema: tied-config-report.v1`, resolved `store_root` + `mcp_dist_path` + `config_sources` | `node --test tools/bootstrap/lib/tied-config-report.test.mjs` case `monolithic-mcp` |
| **SC-CR-CLI-CLIENT** | Client with `tied-yaml` mcp entry → `client_project_path`, toggles with mcp.json provenance | fixture `linked-client` |
| **SC-CR-PROVENANCE** | Each catalogued operator toggle row includes `effective`, `source_kind`, `source_ref`, `configure_via` | unit assertions on `OPERATOR_*_MCP_FIELDS` coverage |
| **SC-CR-SECRETS-DEFAULT** | Default report never contains secret values; `JEV_API_KEY` shows `present` only | unit test |
| **SC-CR-SECRETS-OPTIN** | `--include-secrets` / MCP `include_secrets: true` emits catalogued secret values when set | unit test |
| **SC-CR-IGNORE-SHELL** | When `shellEnv` fixture sets wrong global paths, report lists them under `shell_ignored[]` with effective from disk | fixture `ignore-shell-path-env` |
| **SC-CR-MCP-PARITY** | `tied_config_report` JSON matches CLI for same fixture cwd (normalize timestamps) | `mcp-server` unit test |
| **SC-CR-TESTS** | Bootstrap + MCP tests in CI slice | command_seq below |

### Test strategy (RED first)

1. **RED** — `tied-config-report.test.mjs`: materialize cases from [manifest.json](../../../tools/bootstrap/fixtures/tied-runtime/manifest.json) (`monolithic-mcp`, `linked-client`, `ignore-shell-path-env`); assert schema, provenance, redaction, opt-in secrets, shell_ignored.
2. **RED** — `tied-config-report.test.ts`: handler vs CLI subprocess or shared normalize helper on one fixture id.
3. **GREEN** — Implement builder + CLI + MCP.
4. **Composition** — Client linked stub references store script (pattern from [CITDP-CLI-E2E-EXEC-FOLLOWTHROUGH](../../citdp/CITDP-CLI-E2E-EXEC-FOLLOWTHROUGH.yaml)): optional assert in `bootstrap-and-load.test.ts`.
5. **Regression** — `tied_config_get_base_path` tests unchanged; tool count +1 in core profile smoke optional.

```bash
node --test tools/bootstrap/lib/tied-config-report.test.mjs
cd mcp-server && npm run build && npx tsx --test src/tied-config-report.test.ts
node tools/bootstrap/tied-config-report-cli.mjs --format json
.cursor/skills/tied-yaml/scripts/tied-cli.sh tied_config_report '{}'
```

### Report shape (illustrative JSON)

```json
{
  "schema": "tied-config-report.v1",
  "generated_at": "2026-11-03T23:00:00.000Z",
  "cwd": "/abs/client",
  "layout_mode": "client",
  "paths": {
    "store_root": "/abs/stdd",
    "mcp_dist_path": "/abs/stdd/mcp-server/dist/index.js",
    "client_project_path": "/abs/client/tied-project",
    "client_bundle_path": "/abs/client/tied-bundle",
    "project_root": "/abs/client",
    "config_sources": ["mcp:.cursor/mcp.json", "store:.tied/store.yaml"]
  },
  "sections": [
    {
      "id": "operator_toggles",
      "title": "Operator toggles",
      "entries": [
        {
          "key": "TIED_MCP_COLLECT_METRICS",
          "effective": "1",
          "source_kind": "store_yaml",
          "source_ref": ".tied/store.yaml#operator.mcp.collect_metrics",
          "configure_via": "Edit operator section in .tied/store.yaml or .tied/operator.local.yaml; run ./tied-install.sh --refresh on clients",
          "redacted": false
        }
      ]
    },
    {
      "id": "secrets",
      "entries": [
        {
          "key": "JEV_API_KEY",
          "effective": null,
          "present": true,
          "source_kind": "env",
          "source_ref": "process.env.JEV_API_KEY",
          "configure_via": "Cursor MCP env or shell export (never commit)",
          "redacted": true
        }
      ]
    }
  ],
  "shell_ignored": [
    {
      "key": "TIED_STORE_ROOT",
      "shell_value": "/wrong",
      "effective_from": "mcp:.cursor/mcp.json"
    }
  ],
  "notes": [
    "Live corpus routing (marker_only vs env_dual_read): run tied-cli.sh tied_config_get_base_path"
  ]
}
```

**Text format (`--format text`):** Section headers, fixed column keys, `[REDACTED]` for secrets; stderr for `--include-secrets` warning and `DIAGNOSTIC:` lines ([REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE](../../requirements/REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE.yaml)).

### Catalog coverage (v1)

| Section | Keys / sources |
| --- | --- |
| Paths | From `resolveTiedRuntimeConfig` |
| Operator toggles | `OPERATOR_BOOL_MCP_FIELDS`, `OPERATOR_STRING_MCP_FIELDS` — compare disk operator merge vs mcp.json env |
| MCP spawn env | Non-toggle keys on `tied-yaml` entry: `TIED_CLIENT_*`, legacy `TIED_BASE_PATH`, `TIED_STORE_ROOT`, `TIED_MCP_TOOL_PROFILE` if set |
| Ignored shell | `TIED_MCP_BIN`, `TIED_REPO_ROOT`, `TIED_STORE_ROOT` + `OPERATOR_TOGGLE_ENV_KEYS` when disk wins |
| CLI session | `TIED_CLI_IMPL_ESSENCE_*`, `TIED_CLI_QUIET_MCP_STDERR`, metrics overrides per tied-cli.sh header |
| Secrets | `SECRET_ENV_KEYS` (v1: `JEV_API_KEY`) |
| Identity marker | Read-only fields from `tied-project/project-identity.v1.yaml` when present |

### Install / delivery

- **Store script:** `tools/bootstrap/tied-config-report-cli.mjs` imports `./lib/tied-config-report.mjs`.
- **Bundled skill:** `tools/bundled-tied-yaml-skill/scripts/tied-config-report.sh` — same exec-wrapper pattern as [skills-linked.mjs](../../../tools/bootstrap/lib/layers/skills-linked.mjs) `writeExecWrapper` for linked clients (no copy of `.mjs` required if stub execs store path).
- **Do not** require `feature-orchestration/onboarding-entry.js` (unlike `tied.sh`).

### LEAP / related REQ

- **depends_on:** REQ-TIED_RUNTIME_DISK_CONFIG, REQ-TIED_CLI_MCP_JSON_BASE_PATH, REQ-TIED_CLIENT_PATH_ENV_MIGRATION  
- **related_to:** REQ-TIED_PROJECT_IDENTITY_MARKER_ROUTING (display-only marker section)  
- Do **not** mutate REQ-TIED_RUNTIME_DISK_CONFIG status; optional cross-link in REQ rationale only.

---

## Implement sequence (after gate)

1. Author REQ/ARCH/IMPL + pseudocode (token comments on `buildTiedConfigReport`, CLI main, MCP handler).
2. RED bootstrap tests → builder + CLI.
3. RED MCP tests → tool + import wrapper.
4. Docs + vocab RECORD (`config report`, `tied_config_report`).
5. Close-out: `lint_yaml`, `tied_validate_consistency`, persist CITDP, verification gate.

---

## Out of scope (v1)

- Config mutation or install refresh logic changes
- Full env dump or undocumented secret patterns
- Replacing `tied_config_get_base_path`
- `@tied/cli` top-level `config` subcommand (document as future umbrella hook)
