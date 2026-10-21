# Authority boundary operator checklist — harness vs platform-adjacent TIED

**Request:** [REQ-TIED_HARNESS_PLATFORM_SEAM](../../requirements/REQ-TIED_HARNESS_PLATFORM_SEAM.yaml)  
**Skim time:** under two minutes before turns that touch YAML, gates, or batch agentstream.

| When | Harness (tune here) | Platform-adjacent authority (do not replace) |
| --- | --- | --- |
| **Before turn** | Pick prompt type / Task subagent; PRELOAD vocab from [routing.md](../../vocab/routing.md). | Confirm scope is not a **costly choice** without sponsor sign-off ([sponsor-agent-relationship.md](../../vocab/sponsor-agent-relationship.md)). |
| | Use [activation map §0](../../../tied-bundle/docs/fresh-client-prompt-activation-map.md) for TIED applicability (`full` / `minimal` / `none`). | Delegation ≠ gate waiver; `gate_policy: advisory` still needs receipts where checklist requires. |
| | Opt-in agentstream preflight only when you want layout checks ([README](../../../mcp-server/packages/agentstream/README.md)). | Default preflight stays **off**; Jev fail-closed Shell block is not checklist authority. |
| **Before YAML write** | Read domain context; RESOLVE names in vocab. | **`tied_config_get_base_path`** → intended **`tied-project/`**; then TIED MCP or **`tied-cli.sh`**. |
| | — | No routine bypass of MCP for project indexes/detail YAML ([AGENTS.md](../../../AGENTS.md)). |
| | On CLI failure, note **`DIAGNOSTIC: TIED_CLI_HINDRANCE`** ([REQ-TIED_TOOL_INPUT_COMPATIBILITY](../../requirements/REQ-TIED_TOOL_INPUT_COMPATIBILITY.yaml)). | **`yaml_index_validate`** / **`tied_validate_consistency`** after mutations. |
| **After session batch** | Optional `@harness-trace-review` → **`tied_feedback_capture_observation`** ([harness trace observation loop](../../../tied-bundle/docs/harness-trace-observation-loop.md)). | Observations are not gate receipts; implement claims still need checklist gates. |
| **Before close-out** | Harness traces under `tied-bundle/working/`; Kaizen observations. | **`tied_checklist_gate_validate`** `verification` / `close_out`; **`tied_verify`** when verification-gated. |
| | Agentstream batch: opt-in DAE/Jev middleware only. | **`sub-close-out-evidence-sync`**, envelope validate, adherence reconcile; committed rationale under `tied-project/working/`. |
| | — | Do not claim merge/ship from chat without gate receipts. |

**Reference:** [Traefik harness/platform × TIED](../../../docs/comparisons/traefik-harness-platform-vs-tied-agent-management.md) · [PLAN.md](PLAN.md)
