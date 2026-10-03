# Factory field client — external validation ([REQ-TIED_TWO_FOLDER_LAYOUT])

**Client root:** `/Users/fareed/Documents/dev/test/1791037288`  
**Factory id:** `1791037288` (timestamp-style disposable client)  
**Captured:** 2026-10-03  
**Sponsor assessment:** App works; treated as success for updated TIED onboarding + two-folder layout.

## Product

- **Name:** `mac-displays-cli` (`REQ-MACOS_DISPLAY_CLI`)
- **Stack:** TypeScript CLI via Koffi / Core Graphics; linked install from store `/Users/fareed/Documents/dev/chatgpt/stdd`
- **Install profile:** `linked`, harness `both`, schema `tied-install.v2` (`tied-bundle/install.json`)

## Two-folder layout (SC-TFL-*)

| Check | Result |
| --- | --- |
| No top-level `tied/` | pass |
| `tied-project/config.yaml` committed | pass (not gitignored) |
| `tied-bundle/` gitignored (install.json) | pass |
| G4 audit `two_folder_layout.ok` | pass — receipt at client `tied-project/working/tied-new-client-audit.v1.json` (copy: [factory-field-client-audit.v1.json](factory-field-client-audit.v1.json)) |

## Executable proof (this close-out session)

```text
cd /Users/fareed/Documents/dev/test/1791037288
bun run test          # 12/12 pass — see factory-field-client-1791037288-tests.stdout.txt
bun run lint:ts       # exit 0
bun run mac-displays  # live table output on darwin (sponsor: app works)
```

## Traceability

Committed working under `tied-project/working/REQ-MACOS_DISPLAY_CLI/`; methodology symlinks under `tied-bundle/` to store corpus. Demonstrates end-to-end: factory → linked two-folder client → TIED-tracked feature → shipping CLI.
