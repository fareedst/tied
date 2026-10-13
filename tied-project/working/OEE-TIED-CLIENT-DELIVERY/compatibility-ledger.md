# Compatibility ledger — OEE-TIED-CLIENT-DELIVERY

**OEE id:** OEE-TIED-CLIENT-DELIVERY  
**Last updated:** 2026-10-12

| Target | Stance | Rationale | Consumer comms | Owner | Expiry | Waiver ref |
| --- | --- | --- | --- | --- | --- | --- |
| WF-001 MCP tool names + required args for YAML write | **preserve** | Fleet scripts and skills hard-code tool ids | CHANGELOG + methodology migration doc | methodology maintainers | — | — |
| WF-001 `tied_config_get_base_path` semantics | **preserve** | Session bootstrap contract in AGENTS.md | Highlight in release notes when behavior changes | methodology maintainers | — | — |
| WF-002 default `--mode linked` layout | **migrate** | Brownfield `--migrate-layout` cohorts differ | `tied-install` README + offline runbook | bootstrap owners | 2027-06-30 | — |
| WF-003 gate exit codes `0/1/2` | **preserve** | CI and `tied gate check` depend on codes | Document in DAE / gate enforcement REQ | gate owners | — | — |
| WF-004 rename of skill prefix (`/build-plan`) | **migrate** | Harness-specific install paths | Prompt Composer + install matrix | prompt-type owners | — | — |
| WF-005 agentstream receipts as gate substitute | **break** (intentional non-equivalence) | Interactive MCP ≠ automation receipts | agentstream README non-implication | agentstream owners | — | — |
| OEE artifact filenames in spec §9 | **preserve** | Pilot copy template for clients | This pilot folder + spec version | doc owners | 2026-12-31 | pilot-only |

## Costly choices (needs sponsor before implement)

1. **Mandatory OEE** for all methodology-surface changes — currently convention + pilot only.
2. **Breaking** MCP tool rename without deprecation shim — affects entire fleet.
3. **Auto-enroll** `operating_environment_externalities` Tracker field in all new Trackers — schema promotion.

Recommended default for (1): **defer** until one client program completes OEE copy with verification gate citation.
