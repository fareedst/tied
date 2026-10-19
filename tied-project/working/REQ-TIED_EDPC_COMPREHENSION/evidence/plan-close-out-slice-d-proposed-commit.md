# Proposed commit — Slice D (plan-close-out)

**Do not commit from agent.** Sponsor runs `git add` / `git commit` when ready.

## Proposed message

```
Add EDPC Workflow D OFSM validate/build and ops routing (Slice D v1.1).

Ship fail-closed Operational Failure State Model MCP tools, extended workflow
routes for operational questions, publish ofsm/health gaps, and integrated
close-out evidence for REQ-TIED_EDPC_COMPREHENSION Slice D.
```

## Scope (expected staged paths)

- `mcp-server/src/edpc/failure-state-*.ts` + tests + MCP registration  
- `mcp-server/src/edpc/workflow-route.ts`, `publish-build.ts`  
- `tied-project/` REQ/ARCH/IMPL tokens, `semantic-tokens`, CITDP delta  
- `tied-bundle/docs/processes.md`, templates, vocab  
- `tied-project/working/REQ-TIED_EDPC_COMPREHENSION/evidence/*slice-d*`  
- `CHANGELOG.md`
