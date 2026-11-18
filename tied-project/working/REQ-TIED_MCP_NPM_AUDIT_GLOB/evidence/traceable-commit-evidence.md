# Traceable commit — REQ-TIED_MCP_NPM_AUDIT_GLOB

**date:** 2026-11-17  
**prompt_type:** close-out  
**request_token:** REQ-TIED_MCP_NPM_AUDIT_GLOB

## VALIDATE (vocab)

Scoped diff uses existing terms (Node toolchain, glob file discovery); no new vocab file required.

## Gates

- **depth_tier:** minimal · **gate_policy:** advisory
- **close_out:** sponsor-requested commit after build-plan verification witness
- **Envelope:** not required at minimal depth; npm-test-audit-witness.md is command evidence

## Hygiene

- `tied_git_hygiene` plan_close_out preview: ok (apply=false)
- Receipt: `evidence/git-hygiene-receipt-2026-11-17.md`

## Staging map (this REQ only)

- `CHANGELOG.md`
- `mcp-server/package.json`, `package-lock.json`, `bun.lock`
- `mcp-server/scripts/run-mcp-tests.mjs`
- `mcp-server/src/**` glob migration call sites
- `tied-project/citdp/CITDP-REQ-TIED_MCP_NPM_AUDIT_GLOB.yaml`
- `tied-project/requirements/REQ-TIED_NODE_TOOLCHAIN_DEFAULT.yaml`
- `tied-project/implementation-decisions/IMPL-TIED_NODE_TOOLCHAIN_DEFAULT.yaml`
- `tied-project/implementation-decisions/IMPL-TIED_NODE_TOOLCHAIN_DEFAULT-pseudocode.md`
- `tied-project/working/REQ-TIED_MCP_NPM_AUDIT_GLOB/**`

## Excluded unrelated drift

Other modified CITDP, vocab visual-encoding, wave3 trackers left unstaged (documented in git status).

## Feedback capture

N/A — maintenance wave; no MCP feedback receipt required.