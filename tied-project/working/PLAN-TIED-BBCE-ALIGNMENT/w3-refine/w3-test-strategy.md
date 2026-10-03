# W3 build-plan test strategy (refine spec)

**depth_tier:** integrated · **gate_policy:** advisory · **Proof boundary:** deterministic diff/slice classification — not REQ satisfaction.

## Unit tests (RED before production code)

| Module (proposed) | Validates |
| --- | --- |
| `mcp-server/src/analysis/bbce-shared-code-justification.ts` | Trigger detection (shared globs, outside declared surface, outside IMPL `code_locations` mock), schema `bbce-shared-code-justification.v1` |
| `mcp-server/src/analysis/bbce-boundary-violation-report.ts` | Path→slice classification vs `bbce-slice-map.v1`, crossing list distinct from traceability gaps |
| `mcp-server/src/analysis/bbce-schemas.ts` | Extend validators for new v1 event/record schemas |

## Composition / CLI

- Optional CLI entry under `mcp-server/src/cli/` mirroring locality pilot — dry-run only, no default MCP registration until sponsor promotes.
- Reuse `change-locality-pilot` git replay harness with **third scenario** touching `shared_mechanism_globs` (`paths.ts` historical or synthetic diff fixture).

## Dry-run acceptance (pilot)

1. Load `tied/analysis/agentstream-slice-map.yaml`.
2. Run B pass on diff touching `mcp-server/packages/agentstream/src/paths.ts`.
3. Run C report on same diff; assert boundary list ≠ plumb traceability_gap output shape.
4. Append optional JSONL lines (`bbce-shared-code-justification.v1`, `bbce-boundary-violation.v1`) to working-folder JSONL — not plumb audit v1.

## Not in W3 scope

- Checklist hard enforcement (Mechanism **D**, W4).
- CI hard fail on locality or shared touches.
- New MCP tool registration unless build-plan adds REQ (see CITDP LEAP note).

## Verification gate (W3 build-plan close)

- Unit tests pass; `lint_yaml` on changed YAML; `tied_validate_consistency` if project YAML touched.
- Re-run `tied_adversarial_inquiry_run` at **verification** phase with B/C implementation scope.
- `tied_checklist_gate_validate` verification at integrated/advisory with activation pairing.
