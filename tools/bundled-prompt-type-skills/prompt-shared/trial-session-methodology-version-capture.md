# Trial session methodology version capture

[REQ-TRIAL_METHODOLOGY_VERSION_READOUT] [REQ-TIED_METHODOLOGY_VERSION_ON_DEMAND] [REQ-MCP_SERVER_INFO]

Disposable trial clients must persist methodology semver for facilitator readouts (`@record-wf-trial`, `@record-gf-trial`). Orchestrator **process logs do not record MCP `server_info` payloads** ([REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG]).

## Agent sequence (turn 1 or session bootstrap)

1. Call **`tied_config_get_base_path`**; confirm writable `tied-project/`.
2. Call MCP **`server_info`** (preferred) or **`tied-cli.sh server_info '{}`** when IDE MCP is absent.
3. Read **`extensions.tied.methodology.version`** and **`.source`** (see `mcp-server/contracts/server_info/server_info.response.example.json`).
4. Write **`tied-project/working/{REQ-TOKEN}/evidence/tied-methodology-version.session.v1.json`**:

| Field | Required |
| --- | --- |
| `schema` | `tied-methodology-version.session.v1` |
| `version` | Semver string |
| `source` | e.g. `version_file`, `install_json`, `agents_md` |
| `captured_at` | ISO UTC |
| `capture_path` | `mcp_server_info` or `tied_cli_server_info` |
| `turn` | Optional: `add-feature`, `plan-new-feature` |

5. **WF only:** copy `tied_methodology_version` and `tied_methodology_version_source` onto `trial-workflow-interaction-inventory.v1.json` when seeding/updating inventory.
6. One line in the phase handoff citing the evidence path.

Do **not** reintroduce per-turn `TIEDv{semver}:` stamps in assistant chat.

## Facilitator discovery (store)

Documented in `tools/bundled-record-wf-trial-skill/reference.md` and `tools/bundled-record-gf-trial-skill/reference.md`.
