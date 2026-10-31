# Sponsor decisions — Wave 6 Path 3

**Recorded:** 2026-10-30  
**Sponsor instruction:** select path 3

| Decision | Recorded choice | Ladder |
| --- | --- | --- |
| **Routing policy** | **Path 3 `marker_only`** — marker `writable_root` wins over IDE/env project path at runtime | Reversible via `identity.routing: env_dual_read` |
| **S1 Dogfood this repo** | **Yes** — `tied-project/config.yaml` sets `identity.routing: marker_only` | Reversible |
| **S2 Discovery** | **Cwd walk only** (no new env key) | Locked for v1 |
| **S3 Legacy `tied/`** | **Yes** — same tied-root candidates as layout resolution | Locked |

**Build reference:** [PLAN-WAVE6-PATH3-MARKER-ONLY-ROUTING.md](../PLAN-WAVE6-PATH3-MARKER-ONLY-ROUTING.md)
