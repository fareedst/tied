# Test strategy — TIED methodology release 4.3.0

**Profile:** minimal · non-TIED store release  
**VRAI/RDB:** V3 asserts frozen paths per [evidence/version-inventory.md](evidence/version-inventory.md).

| ID | Assertion |
|----|-----------|
| V1 | `readTiedMethodologyVersion` → `4.3.0` |
| V2 | `server_info` example JSON + Ajv → `4.3.0` |
| V3 | Frozen fixtures unchanged per version-inventory |
| V4 | After refresh, `tied-bundle/install.json` `store_methodology_version` and `tied_version` === `4.3.0` |
| V5 | `CHANGELOG.md` has `[4.3.0]`; empty `[Unreleased]`; **Added** leads with `[REQ-TIED_AS_OPERATED_BASELINE]` |
| V6 | README **Release highlights (4.3.0)**; `store-readme-structure.test.ts` passes |

## Close-out battery

```bash
npm test --prefix mcp-server -- src/tied-methodology-version.test.ts src/server-info/server-info.test.ts src/store-readme-structure.test.ts
./tied-install.sh --refresh .
jq -r '.store_methodology_version, .tied_version' tied-bundle/install.json
node scripts/conversation-adherence-score.test.mjs
```

**Note:** `server-info.test.ts` reads live `VERSION` from fixture repo root, not only the example JSON pin.