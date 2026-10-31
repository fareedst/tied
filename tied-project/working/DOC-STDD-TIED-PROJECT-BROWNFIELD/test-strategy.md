# Test strategy — DOC-STDD-TIED-PROJECT-BROWNFIELD

**Change class:** EDPC comprehension + hygiene · **profile_depth:** minimal · **no REQ mint**

| Check | Command / action | Pass criteria |
| --- | --- | --- |
| MCP base path | `tied_config_get_base_path` | `base_path` ends with `stdd/tied-project` |
| Corpus consistency | `tied_validate_consistency` (read-only) | Receipt saved; failures → claims ledger **Unknown** / matrix **unresolved** (does not block doc pass) |
| EDPC validate | `tied_edpc_access_validate`, `tied_edpc_engagement_validate` | No blocking errors for chartered tier |
| Publish shape | `tied_edpc_publish_build`, `brownfield_intent_evidence_validate` (report_only) | Manifest + validation receipt; explicit `gaps[]` |
| Toolchain observed | `cd mcp-server && npm test -- --test-path-pattern='source-graph|brownfield-intent-evidence|working-root'` (or project-equivalent) | Green for scoped suites used in ledger **Observed** rows |
| CITDP dedupe | SHA-256 compare script / manual receipt | Only **identical** files removed; log lists path + hash; **35** divergent retained |
| Corpus map | Manual | Links to AGENTS.md, client-development-index, vocab routing, working-artifact-placement; store vs client callout |
| Envelope sample | `request_evidence_envelope_batch_collect` on fixed token list | Regenerate [envelope-gap-report.v1.yaml](../evaluation/envelope-gap-report.v1.yaml); document timestamp in DOC evidence |
| Workflows doc | If `@workflow-visualization` run | `docs/stdd-workflows.md` includes B4 + I* meta-views; dashed edges for unverified |
| Index hygiene | `git diff` review | No changes under `tied-project/requirements.yaml`, detail indexes, `semantic-tokens.yaml`, `tied-project/citdp/` |
| Local dogfood marker | `git status` | Repo-root `project-identity.v1.yaml` **not** staged |

**Envelope batch sample REQ tokens (representative, not exhaustive):**

- `REQ-TIED_INTENT_CONTROL_PLANE`
- `REQ-TIED_EDPC_COMPREHENSION`
- `REQ-TIED_TWO_FOLDER_LAYOUT`
- `REQ-TIED_CHECKLIST_GATE_ENFORCEMENT`
- `REQ-REQUEST_EVIDENCE_ENVELOPE`
- `REQ-TIED_WORKFLOW_VISUALIZATION_SKILL`
- `REQ-TIED_BROWNFIELD_INTENT_ELEVATION`
- `REQ-TIED_SOURCE_GRAPH_COMPREHENSION`
- `REQ-TIED_LAYERED_CLIENT_INSTALL`
- `REQ-TIED_MCP_LEAP_PROPOSAL_QUEUE` (or `REQ-LEAP_PROPOSAL_QUEUE` if alias in index)

**RED command(s):** not_applicable unless dedupe automation added under `tools/` (deferred).

**Proof boundary:** Comprehension does not certify full-store health or every REQ’s implementation status.
