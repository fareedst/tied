# Design-system agent plane operator checklist

**Traceability:** [REQ-TIED_META_ASTRYX_DESIGN_SYSTEM_WAVE3](PLAN.md) · [meta-astryx-ds-agent-plane-compose.md](../../../tied-bundle/docs/meta-astryx-ds-agent-plane-compose.md)

**Reference line:** [Meta Astryx design system × TIED](../../../docs/comparisons/meta-astryx-design-system-vs-tied-agent-management.md) · [HPS authority-boundary operator checklist](../REQ-TIED_HARNESS_PLATFORM_SEAM/authority-boundary-operator-checklist.md)

| When | Astryx signal | TIED action | Proof artifact |
| --- | --- | --- | --- |
| Open CITDP / **change_definition** | UI vs delivery plane split | State governing artifact in PR description | CITDP YAML + plane table in compose guide |
| Adopting **`astryx init`** in product repo | Agent blocks added beside components | Keep TIED client **`tied-install`** path unchanged in methodology repo | Install receipts separate from init log |
| Spec PR updates knowledge record | **`current`** record promoted | Do not mirror as REQ detail without LEAP | Product `docs/specs/` only |
| Vibe-test or convention CI green | Instruction QA pass | Run **`tied_verify`** / gates on delivery scope separately | Vibe log + gate JSON |
| Before **YAML write** | Risk of wrong-tree MCP | **`tied_config_get_base_path`**; pair HPS checklist | Config receipt |
| Citing Meta scale / vibe wins | **Meta-reported** narrative | Label **`not_measured`** in docs and CITDP | Compose guide proof boundary |

**CITDP prompt:** See compose guide [§ CITDP prompt](../../../tied-bundle/docs/meta-astryx-ds-agent-plane-compose.md#citdp-prompt).