# G4 evidence — offline/air-gap sponsor sign-off + operator runbook

| Field | Value |
| --- | --- |
| REQ | REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY |
| Slice | build-plan G4 |
| Date | 2026-09-25 |
| depth_tier | minimal |
| TIED_BASE_PATH (MCP) | `/Users/fareed/Documents/dev/chatgpt/stdd/tied` |

## Policy accepted

- Offline and air-gapped clients **retain** `./copy_files.sh` refresh of `tied/methodology/`.
- `TIED_METHODOLOGY_BUNDLE_PATH` (G2/G3) remains **optional** until cohort opt-in.
- Non-goals: org-wide removal of local methodology tree; mandatory bundle-only deployment.

## pre_implementation gate

```bash
cd mcp-server
node dist/cli/gate-check.js \
  --request-token REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY \
  --phase pre_implementation \
  --tracker /Users/fareed/Documents/dev/chatgpt/stdd/working/REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY/checklist-tracker.yaml \
  --citdp /Users/fareed/Documents/dev/chatgpt/stdd/tied/citdp/CITDP-REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY.yaml \
  --project-root /Users/fareed/Documents/dev/chatgpt/stdd \
  --json-only
```

Result: `allowed: true`, `exit_code: 0`.

## Deliverables

| Artifact | Path |
| --- | --- |
| Operator runbook | `tied/docs/methodology-client-boundary-offline-runbook.md` |
| Sign-off receipt (example) | `working/REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY/evidence/methodology-offline-policy-signoff.v1.json` |
| Receipt validator | `mcp-server/src/methodology-offline-policy-signoff.ts` |

## Tests

```bash
cd mcp-server
npm run build
node --test dist/methodology-offline-policy-signoff.test.js
npm test
```

## verification gate

```bash
node dist/cli/gate-check.js \
  --request-token REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY \
  --phase verification \
  --tracker /Users/fareed/Documents/dev/chatgpt/stdd/working/REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY/checklist-tracker.yaml \
  --citdp /Users/fareed/Documents/dev/chatgpt/stdd/tied/citdp/CITDP-REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY.yaml \
  --project-root /Users/fareed/Documents/dev/chatgpt/stdd \
  --json-only
```

## tied_validate_consistency

MCP `tied_validate_consistency`: **`ok: true`** (post CITDP edit).

## pseudocode

Sidecar updated with `DOCUMENT_OFFLINE_COPY_FILES_POLICY` ([PROC-PSEUDOCODE_VALIDATION] — re-run via MCP `pseudocode_validate` on `IMPL-TIED_METHODOLOGY_CLIENT_BOUNDARY` before REQ close-out if gate requires).

## Cross-links

- `tied/docs/client-development-index.md` — offline runbook link
- `mcp-server/methodology-bundle/README.md` — G4 offline cohort pointer
- `working/REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY/PLAN.md` — G4 **Met**
