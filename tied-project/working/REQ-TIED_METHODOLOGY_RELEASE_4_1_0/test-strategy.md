# Test strategy — REQ-TIED_METHODOLOGY_RELEASE_4_1_0

**Profile:** minimal · advisory

| ID | Assertion |
|----|-----------|
| V1 | `readTiedMethodologyVersion` → `4.1.0` |
| V2 | `server_info` + Ajv example → `4.1.0` |
| V3 | Live envelope/unit pins updated; frozen fixtures excluded per inventory |
| V4 | After refresh, `tied-bundle/install.json` has `tied_version: "4.1.0"` (close-out evidence) |
| V5 | `CHANGELOG.md` has `[4.1.0]`; no duplicate bullets left under empty `[Unreleased]` mistake |
| V6 | README **Release highlights (4.1.0)** present; `store-readme-structure.test.ts` passes |

## Close-out battery

```bash
npm test --prefix mcp-server -- src/tied-methodology-version.test.ts src/server-info/server-info.test.ts
./tied-install.sh --refresh .
node -e "const j=require('./tied-bundle/install.json'); if(j.tied_version!=='4.1.0') process.exit(1)"
```
