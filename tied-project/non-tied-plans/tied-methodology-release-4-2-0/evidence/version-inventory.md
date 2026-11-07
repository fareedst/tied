# Version inventory — tied-methodology-release-4-2-0

**Date:** 2026-11-07 · **from:** 4.1.0 · **to:** 4.2.0

## Live (update in this release)

| Path | Role |
|------|------|
| `VERSION` | Authoritative semver |
| `AGENTS.md` | **TIED Methodology Version** line |
| `README.md` | Version line; **Release highlights (4.2.0)** blurb |
| `docs/tied-experience/index.md` | Hub version line |
| `mcp-server/contracts/server_info/server_info.response.example.json` | `extensions.tied.methodology.version` |
| `scripts/conversation-adherence-score.test.mjs` | `expectedMethodologyVersion` for live store |
| `tied-project/vocab/tied-methodology.md` | **methodology release** glossary row |
| `tied-bundle/install.json` | `tied_version` after `./tied-install.sh --refresh` (witness) |

## Frozen (do not rewrite)

| Pattern | Rationale |
|---------|-----------|
| `docs/demos/**` | Historical trial readouts |
| `tied-project/working/FACILITATOR-*` | Facilitator snapshots |
| `tied-project/working/**/evidence/request-evidence-envelope.v1.json` | Point-in-time close-out envelopes |
| `mcp-server/test/fixtures/adversarial-inquiry*/**` | Frozen fixtures @ older semver |
| `tied-project/working/REQ-TIED_METHODOLOGY_RELEASE_4_1_0/**` | 4.1.0 release archaeology |
| `CHANGELOG.md` sections `[4.1.0]` and older | Historical release notes |
| `mcp-server/package.json` `js-yaml ^4.1.0` | npm dependency, not methodology semver |

## Test notes

- `tied-methodology-version.test.ts` isolated dirs may use arbitrary fixture semver strings.
- `server-info.test.ts` reads live `VERSION` via fixture repo root, not a hardcoded pin.
