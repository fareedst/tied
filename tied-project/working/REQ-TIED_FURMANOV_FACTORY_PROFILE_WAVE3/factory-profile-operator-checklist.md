# Factory profile operator checklist

**Traceability:** [REQ-TIED_FURMANOV_FACTORY_PROFILE_WAVE3](PLAN.md) · [furmanov-factory-profile-compose.md](../../../tied-bundle/docs/furmanov-factory-profile-compose.md)

**Reference line:** [Furmanov harness-profiler × TIED](../../../docs/comparisons/afurmanov-harness-profiler-vs-tied-agent-management.md) · [HPS authority-boundary operator checklist](../REQ-TIED_HARNESS_PLATFORM_SEAM/authority-boundary-operator-checklist.md)

| When | Signal (Furmanov-reported literacy) | TIED action | Proof artifact |
| --- | --- | --- | --- |
| Open CITDP / **change_definition** | Factory **invariants** (order, fork rules) | List invariants beside gate/test proof | CITDP YAML + [citdp-policy](../../../tied-bundle/docs/citdp-policy.md) |
| After multi-skill / Task session | Sequence profile or transcript available | Optional `@harness-trace-review`; not implement-complete | HTOL observation optional |
| Sub-skill reports **PASS** | Validator first-line PASS | Confirm **`tied_verify`** / gates for **shipped** behavior | Gate JSON + test log |
| Profile shows duplicate children | Same validators under both bars | **`tied_feedback_capture_observation`**; fix harness | Kaizen idempotency key |
| Before **YAML write** | Risk of wrong-tree MCP | **`tied_config_get_base_path`**; pair HPS checklist | Config receipt |

**CITDP prompt:** See compose guide [§ CITDP prompt](../../../tied-bundle/docs/furmanov-factory-profile-compose.md#citdp-prompt).