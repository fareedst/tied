# Version inventory — REQ-TIED_METHODOLOGY_RELEASE_4_1_0

**Date:** 2026-11-07 · **from:** 4.0.0 · **to:** 4.1.0

## Live (update in this release)

| Path | Role |
|------|------|
| `VERSION` | Authoritative semver |
| `AGENTS.md` | **TIED Methodology Version** line |
| `README.md` | **TIED Methodology Version** line; **Release highlights (4.1.0)** blurb |
| `docs/tied-experience/index.md` | Hub version line |
| `tied-bundle/docs/*.md` | Explicit **TIED Methodology Version** headers (not legacy `TIEDv4.0.0:` prompt examples) |
| `mcp-server/contracts/server_info/server_info.response.example.json` | Contract example `extensions.tied.methodology.version` |
| `scripts/conversation-adherence-score.test.mjs` | `expectedMethodologyVersion` for live store |
| `tied-bundle/install.json` | `tied_version` after `./tied-install.sh --refresh` (witness; not hand-edited) |

## Frozen (do not rewrite)

| Pattern | Rationale |
|---------|-----------|
| `docs/demos/**` | Historical trial readouts cite bootstrap semver at run time |
| `tied-project/working/FACILITATOR-*` | Facilitator CITDP snapshots |
| `mcp-server/test/fixtures/adversarial-inquiry*/**/request-evidence-envelope.v1.json` | Frozen envelope fixtures @ 4.0.0 |
| `tied-project/feedback.yaml`, historical working PLAN/CITDP | Point-in-time records |
| `tied-project/citdp/CITDP-REQ-TIED_SETUP-RESPONSE-STAMP.yaml` | 4.0.0 release archaeology |
| `CHANGELOG.md` body bullets mentioning "TIED 4.0.0 bootstrap" | Historical narrative inside promoted 4.1.0 section |

## Test notes

- `tied-methodology-version.test.ts` isolated temp dirs may keep arbitrary `4.0.0` fixture strings (not store pins).
- Hand-built envelope unit tests may use `methodology_snapshot_id: "4.0.0"` as schema-valid arbitrary semver; `buildRequestEvidenceEnvelope` reads live `VERSION` at runtime.
