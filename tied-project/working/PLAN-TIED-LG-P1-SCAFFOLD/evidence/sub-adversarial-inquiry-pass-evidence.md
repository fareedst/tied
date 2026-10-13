# sub-adversarial-inquiry-pass — PLAN-TIED-LG-P1-SCAFFOLD

**Date:** 2026-10-12 · **depth_tier:** integrated

Structured pass at pre-RED (no MCP `tied_adversarial_inquiry_run` — pilot not yet on disk).

| Falsification question | Disposition |
| --- | --- |
| Can mocked CI tests hide wrong repo MCP writes? | CI uses mock transport only; live smoke documented separately |
| Does SQLite default path write outside run dir? | Graph accepts explicit `run_directory`; test asserts under tmp_path |
| Does P0 program gate authorize this RED? | P1 child CITDP + sponsor authority + fresh pre_implementation gate |

Counterexamples recorded in CITDP `adversarial_inquiry` block.
