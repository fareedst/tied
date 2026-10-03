# Envelope investigation — PLAN-* tokens (2026-09-27)

## Symptom

`request_evidence_envelope_build` returned `InvalidRequestToken` for `PLAN-TIED-RESIDUALITY-ANALYSIS` because identity regex allowed only `REQ-*`.

## Root cause

Shared regex in:

- `mcp-server/src/request-evidence-envelope/build.ts`
- `mcp-server/src/checklist-activation-collect.ts`
- `mcp-server/src/adversarial-inquiry/checklist-integration.ts`

Pattern was `/^REQ-[A-Z0-9][A-Z0-9_-]*$/u` — methodology analysis plans use `working/PLAN-*` folders per residuality pilot and CITDP working records.

## Fix

- New module `mcp-server/src/working-request-token.ts` — `WORKING_REQUEST_TOKEN_RE` accepts **`REQ-*`** and **`PLAN-*`**.
- Unit + MCP tests added.
- `tied/docs/citdp-policy.md` documents both prefixes for working-folder IDs and residuality attach pattern.

## Verification

- `bun test` on `working-request-token.test.ts` and `request-evidence-envelope.mcp.test.ts` — pass.
- Post-fix MCP `request_evidence_envelope_build` for `PLAN-TIED-RESIDUALITY-ANALYSIS` — see `envelope-build-post-fix-result.json` in this folder (if present).

## Prior waiver

`request-evidence-envelope-waiver.v1.json` remains historical evidence for pre-fix close-out; new builds should use envelope tools when MCP server is rebuilt.
