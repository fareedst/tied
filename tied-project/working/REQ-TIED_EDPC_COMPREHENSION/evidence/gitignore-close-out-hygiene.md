# Gitignore close-out hygiene — REQ-TIED_EDPC_COMPREHENSION

**Date:** 2026-10-19 · **[PROC-GITIGNORE_CLOSE_OUT]**

| Class | Paths | Action |
| --- | --- | --- |
| **ignore** | `tied-bundle/working/REQ-TIED_EDPC_COMPREHENSION/**` (adversarial-inquiry, pseudocode-analysis, quality-collect stdout) | Local working root — whole tree under `tied-bundle/working/` |
| **ignore** | `tied-project/working/**/evidence/quality-collect/` | Regenerable collect logs — do not recreate under committed root |
| **ignore** | `mcp-server/working/`, `mcp-server/tied-bundle/` | Wrong MCP cwd mirrors |
| **track** | `tied-project/working/REQ-TIED_EDPC_COMPREHENSION/**` (PLAN, gate trackers, slug evidence, envelope, manifests, authoritative gate receipts + ledger) | Committed process evidence |
| **track** | `.gitignore` negation `!tied-project/working/REQ-TIED_EDPC_COMPREHENSION/evidence/**` | Envelope file matches global `tied-project/working/**/evidence/request-evidence-envelope.v1.json` ignore |

**Applied (unstaged):** `.gitignore` EDPC negation block + `quality-collect/` under committed root; moved collect stdout to `tied-bundle/working/.../quality-collect/`; removed duplicate non-authoritative gate receipts (retain pre_impl `15-51-46-424Z`, verification `16-12-36-116Z`, close_out `16-25-28-150Z`).
