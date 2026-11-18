# Version inventory — tied-methodology-release-4-3-0

**Date:** 2026-11-18 · **from:** 4.2.2 · **to:** 4.3.0  
**Scan:** `rg '4\.2\.2'` → **127** file paths (store root)

## Live (VRAI — update in this release)

| Path | Role |
|------|------|
| `VERSION` | Authoritative semver |
| `AGENTS.md` | **TIED Methodology Version** line |
| `README.md` | Version line + **Release highlights (4.3.0)** |
| `docs/tied-experience/index.md` | Hub version line |
| `CHANGELOG.md` | Promote `[Unreleased]` → `[4.3.0]`; historical `## [4.2.2]` section unchanged |
| `mcp-server/contracts/server_info/server_info.response.example.json` | `extensions.tied.methodology.version` |
| `mcp-server/contracts/trial-methodology-version/tied-methodology-version.session.example.json` | Live contract example |
| `mcp-server/src/tied-methodology-version.test.ts` | `install.json` fixture pin |
| `tools/bootstrap/lib/agent-loader-sync.test.mjs` | Store seed semver in sync tests (align with `VERSION` after bump) |
| `tied-bundle/install.json` | `store_methodology_version` / `tied_version` after `./tied-install.sh --refresh .` |
| `tied-project/vocab/tied-methodology.md` | **methodology release** row (phase G) |

### Build-time verify (grep during phase C/E)

- `scripts/conversation-adherence-score.test.mjs` — update `expectedMethodologyVersion` **only if** the test is defined to track live store semver (currently `4.2.0`).
- Any failing test that hardcodes `4.2.2` outside isolated temp dirs → add to this table before editing.

## Frozen (RDB — do not rewrite)

| Pattern | Count (approx.) | Rationale |
|---------|-----------------|-----------|
| `docs/agent-harness-evaluation/readouts/**` | ~95 | Session readout metadata at run time |
| `docs/agent-harness-evaluation/catalogs/catalog-traditional-workflow-trial-prompts.md` | 1 | Catalog rows cite session semver |
| `tied-project/working/FACILITATOR-*/**` | ~15 | Facilitator verification snapshots |
| `tied-project/working/**/evidence/*` (stderr logs, build-plan evidence) | ~10 | Point-in-time operator evidence |
| `working/**` symlink duplicates of above | mirrors | Same RDB policy |
| `CHANGELOG.md` section `## [4.2.2]` and older | 1 region | Historical release notes |
| `tied-project/CHANGELOG.md` | 1 | Client mirror; promote separately only if sponsor asks (out of scope v1) |
| `tied-project/non-tied-plans/tied-methodology-release-4-2-0/**` | archaeology | Prior release plan |

## Explicit deny (phase A gate)

- No `sed`/bulk replace under `docs/agent-harness-evaluation/readouts/`.
- No edits to `methodology_snapshot_id` / `tied_methodology_version` inside committed close-out envelopes under `tied-project/working/**/evidence/request-evidence-envelope.v1.json`.

## Test notes

- `tied-methodology-version.test.ts` may use arbitrary semver in isolated temp project roots — only the documented fixture row moves to **4.3.0**.
- `js-yaml@4.3.0` in lockfiles is **npm**, not methodology — ignore.