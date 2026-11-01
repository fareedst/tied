# T6 acceptance — trial client `1793549271`

**Client root:** `/Users/fareed/Documents/dev/test/1793549271`  
**Store MCP:** `TIED_STORE_ROOT` → stdd; no client root `VERSION` (semver via `AGENTS.md` → `4.0.0`)  
**Date:** 2026-11-01

| Check | Command / surface | Result |
|-------|-------------------|--------|
| T6.1 Semver without `VERSION` | `readTiedMethodologyVersion({ project_root, tied_base_path })` from client | `4.0.0` |
| T6.2 Path validate | `tied-cli` `pseudocode_validate` + `pseudocode_path: tied-project/implementation-decisions/IMPL-HARD_DRIVE_REPORT-pseudocode.md` | **2 blocks** (same count as inline) |
| T6.3 Inline parity | same token, inline body | **2 blocks** |
| T6.4 Gate | `tied gate check --project-root <client> --phase close_out` + closeout tracker | **allowed true**, exit **0** |
| T6.5 Envelope | `buildRequestEvidenceEnvelope` from client root | **ok true**, `methodology_snapshot_id: 4.0.0` |
| T6.6 Sub procedures | `validateChecklistGate` synthetic tracker (sub only under `sub_procedures`) | no `missing_required_step:sub-adversarial-inquiry-pass` |
| T6.7 App tests | `npm test` in client | **7/7 pass** |

### Client gate recheck (envelope + consistency)

| Check | Result |
|-------|--------|
| `request_evidence_envelope_validate` (`fail_on_error_gaps: true`) | **ok: true**, blocking_gaps **0**, advisory_gaps **1** |
| `yaml_index_validate` (REQ + CITDP) | **valid** |
| `tied_validate_consistency` (scoped tokens) | **ok: true** |

**Advisory gap (`evidence_stale`, warn):** Envelope `cross_links.tracker_path` is the **master** copy `agent-req-implementation-checklist.yaml` (`tracker_hash` `sha256:830169d9…`), while the **close_out** gate receipt was taken against **`checklist-tracker-closeout.yaml`** (`input_hashes.tracker_hash` `sha256:e3282a5…`). That is expected when gate and envelope disagree on the authoritative tracker file; it does **not** block under `gate_policy: advisory` and `fail_on_error_gaps: true`.

**To clear the advisory (optional):** Re-run envelope build/patch so `cross_links.tracker_path` and `tracker_hash` match the tracker used for `tied gate check --phase close_out`, or run gate check against the same path already stored in the envelope.

**Note:** Client MCP points at `stdd/mcp-server/dist/index.js`; rebuild store dist after operator-tooling merges if binaries lag source.
