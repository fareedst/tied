# REQ-TIED_STORE_README_EXPERIENCE_HUB — normative alignment

| Field | Value |
| --- | --- |
| **Request token** | `REQ-TIED_STORE_README_EXPERIENCE_HUB` |
| **Scope** | LEAP README IA stack to match hub commit `22c8450e` |
| **Depth** | minimal · documentation + TIED YAML only |
| **Status** | Implemented (add-feature normative alignment) |

## Satisfaction criteria

| ID | Evidence |
| --- | --- |
| SC-HUB-README-BAND | README + structure test |
| SC-HUB-INDEX-LINKS | Hub describe block in structure test |
| SC-HUB-NARRATIVE-SPLIT | docs/tied-experience lenses |
| SC-HUB-LEAP-STACK | REQ/ARCH/IMPL detail YAML |

## Verify

```bash
cd mcp-server && npx tsx --test src/store-readme-structure.test.ts
.cursor/skills/tied-yaml/scripts/tied-cli.sh tied_validate_consistency
```
