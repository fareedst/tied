# Gitignore close-out hygiene — REQ-TIED_EDPC_COMPREHENSION

**Date:** 2026-10-19 · **[PROC-GITIGNORE_CLOSE_OUT]**

| Class | Paths | Action |
| --- | --- | --- |
| **ignore** | `tied-bundle/working/REQ-TIED_EDPC_COMPREHENSION/**` (adversarial-inquiry, pseudocode-analysis, quality-collect stdout) | Local working root — whole tree under `tied-bundle/working/` |
| **ignore** | `tied-project/working/**/evidence/quality-collect/` | Regenerable collect logs — do not recreate under committed root |
| **ignore** | `mcp-server/working/`, `mcp-server/tied-bundle/` | Wrong MCP cwd mirrors |
| **track** | `tied-project/working/REQ-TIED_EDPC_COMPREHENSION/**` (PLAN, gate trackers, slug evidence, envelope, manifests, authoritative gate receipts + ledger) | Committed process evidence |
| **track** | `.gitignore` negation `!tied-project/working/REQ-TIED_EDPC_COMPREHENSION/evidence/**` | Envelope file matches global `tied-project/working/**/evidence/request-evidence-envelope.v1.json` ignore |

**Applied:** `.gitignore` EDPC negation block + `quality-collect/` under committed root; moved collect stdout to `tied-bundle/working/.../quality-collect/`; authoritative gate receipts only (pre_impl `17-15-20-407Z`, verification `17-15-07-441Z`, close_out `17-16-21-639Z`) with matching [gate-ledger.jsonl](../gate-ledger.jsonl).
