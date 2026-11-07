# Test strategy — TIED methodology release 4.2.0

**Profile:** minimal · non-TIED store release

| ID | Assertion |
|----|-----------|
| V1 | `readTiedMethodologyVersion` → `4.2.0` |
| V2 | `server_info` example JSON + Ajv → `4.2.0` |
| V3 | Frozen fixtures unchanged per [evidence/version-inventory.md](evidence/version-inventory.md) |
| V4 | After refresh, `tied-bundle/install.json` `tied_version === "4.2.0"` (evidence) |
| V5 | `CHANGELOG.md` has `[4.2.0]`; empty `[Unreleased]` |
| V6 | README **Release highlights (4.2.0)**; `store-readme-structure.test.ts` passes |

## Close-out battery

```bash
npm test --prefix mcp-server -- src/tied-methodology-version.test.ts src/server-info/server-info.test.ts src/store-readme-structure.test.ts
./tied-install.sh --refresh .
jq -r .tied_version tied-bundle/install.json
node scripts/conversation-adherence-score.test.mjs
```
