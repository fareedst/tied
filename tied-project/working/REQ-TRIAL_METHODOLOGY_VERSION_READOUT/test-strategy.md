# Test strategy — [REQ-TRIAL_METHODOLOGY_VERSION_READOUT]

**depth_tier:** minimal · **gate_policy:** advisory · **Proof boundary:** store facilitator + batch contract (not live matrix cohort).

## RED-first tests (author before implementation)

| ID | Layer | File | Assert |
| --- | --- | --- | --- |
| T-TMV-YAML-01 | Composition | `tools/bootstrap/lib/trial-methodology-version-readout-contract.test.mjs` | `docs/demos/traditional-four-phase-agentstream.yaml` turn-1 `goal` contains `server_info` and `tied-methodology-version.session.v1.json` |
| T-TMV-REF-WF-01 | Contract | same | `tools/bundled-record-wf-trial-skill/reference.md` requires metadata **TIED methodology version (session)** and documents resolution order (≥4 steps) |
| T-TMV-REF-GF-01 | Contract | same | `tools/bundled-record-gf-trial-skill/reference.md` parity for metadata + discovery |
| T-TMV-JSON-01 | Contract | same | `mcp-server/contracts/trial-methodology-version/tied-methodology-version.session.example.json` exists; `schema` equals `tied-methodology-version.session.v1` |
| T-TMV-PROMPT-01 | Contract | same | `tools/bundled-prompt-type-skills/prompt-shared/trial-session-methodology-version-capture.md` references `extensions.tied.methodology` |

## Optional (build-plan if orchestrator DIAGNOSTIC ships)

| ID | Layer | Assert |
| --- | --- | --- |
| T-TMV-SHELL-01 | Composition | WF wrapper stderr includes `DIAGNOSTIC: tied_methodology_version=` when process log enabled |

## Explicitly not tested here

- Live disposable client agent compliance (field matrix; future methodology learning cohort).
- Duplicate `readTiedMethodologyVersion` logic — covered by `mcp-server/src/tied-methodology-version.test.ts`.

## Verification command (close-out)

```bash
node --test tools/bootstrap/lib/trial-methodology-version-readout-contract.test.mjs
```
