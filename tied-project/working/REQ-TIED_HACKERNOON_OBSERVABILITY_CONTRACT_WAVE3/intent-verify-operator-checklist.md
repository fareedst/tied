# Intent vs verify operator checklist

**Traceability:** [REQ-TIED_HACKERNOON_OBSERVABILITY_CONTRACT_WAVE3](PLAN.md) · [hackernoon-observability-contract-compose.md](../../../tied-bundle/docs/hackernoon-observability-contract-compose.md)

**Reference line:** [HackerNoon × TIED](../../../docs/comparisons/hackernoon-observability-contract-ci-vs-tied-agent-management.md) · [HPS authority-boundary operator checklist](../REQ-TIED_HARNESS_PLATFORM_SEAM/authority-boundary-operator-checklist.md) · [pre-handoff verification charter](../../../tied-bundle/docs/pre-handoff-verification-charter.md)

| When | Signal (HackerNoon-reported literacy) | TIED action | Proof artifact |
| --- | --- | --- | --- |
| Start CITDP / **change-definition** | Manifest “required” on wiki only | Declare **intent** (PLAN, IMPL PRE) beside **verify** (tests, gates, manifest) | CITDP YAML + [citdp-policy](../../../tied-bundle/docs/citdp-policy.md) pointer |
| Before **implement-complete** | Green chat / calm CI story | Require **`tied_checklist_gate_validate`** (and **`tied_verify`** when enrolled)—not narrative | Gate JSON in working evidence |
| After **`tied_validate_consistency`** | Token graph feels complete | Attach **`commands[]`** manifest if enrolled folder `plan_phase: closed` | `evidence/verification-evidence-manifest.v1.json` |
| Before **YAML write** | Silent cross-repo mutation | Call **`tied_config_get_base_path`**; pair HPS checklist | MCP config receipt |
| Optional harness batch | Trace “felt productive” | HTOL **`tied_feedback_capture_observation`**—**not** receipt CI pass | Kaizen idempotency key |

**CITDP intent/verify prompt:** See compose guide [§ CITDP prompt](../../../tied-bundle/docs/hackernoon-observability-contract-compose.md#citdp-prompt).