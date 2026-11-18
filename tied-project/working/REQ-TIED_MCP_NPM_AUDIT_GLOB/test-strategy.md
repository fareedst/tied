# Test strategy — `REQ-TIED_MCP_NPM_AUDIT_GLOB`

**Anchor:** [PLAN.md](./PLAN.md) · **[REQ-TIED_NODE_TOOLCHAIN_DEFAULT](../../requirements/REQ-TIED_NODE_TOOLCHAIN_DEFAULT.yaml)**  
**Mode:** Plan-mode design only — **do not** add RED files until `@build-plan` unless sponsor requests early guard.

---

## Objectives

1. Prove **glob migration** did not break file discovery used by MCP tooling.
2. Prove **`npm audit`** is clean post-change (**SC-NODE-MCP-AUDIT-CLEAN** draft).
3. Preserve **[SC-NODE-ONLY-NPM-TEST]** — full `npm test` still green.

---

## Verification matrix (GREEN / regression)

| ID | Layer | Procedure | Pass condition |
| --- | --- | --- | --- |
| **T-AUDIT-01** | Supply chain | `cd mcp-server && npm audit` | Exit 0; `found 0 vulnerabilities` |
| **T-INSTALL-01** | Supply chain | `cd mcp-server && npm ci` (or fresh `npm install`) | Exit 0; `prepare` build succeeds |
| **T-TSC-01** | Unit compile | `cd mcp-server && npx tsc -p .` | Exit 0 |
| **T-NPM-TEST-01** | Integration | `cd mcp-server && npm test` | Exit 0 (includes tsx test graph via `run-mcp-tests.mjs`) |
| **T-GLOB-SMOKE-01** | Smoke (manual or one-liner) | `node -e "import {glob} from 'glob'; const r=await glob('package.json',{cwd:'mcp-server'}); console.log(r)"` from repo root | Non-empty array |

---

## High-value implicit coverage (existing tests)

These suites **already exercise** migrated `glob` paths — no new RED unless a failure appears in **T-NPM-TEST-01**:

| Module | Behavior under test |
| --- | --- |
| `src/project-size/project-size.test.ts` | Snapshot / inventory globs |
| `src/node-only-controlled-runners.test.ts` | `globSync` for replay script inventory |
| Source/corpus graph builders | Repo-wide `**/*.{ts,…}` scans |
| `closure-join-report.ts` | Sync glob for test/code file joins |

---

## Optional future guard (not required for this wave)

| ID | RED intent | Trigger |
| --- | --- | --- |
| **T-CONTRACT-DEPS-01** | Fail if `mcp-server/package.json` lists `fast-glob` or `npm audit` JSON reports any vulnerability | Sponsor wants CI gate on audit regression |

Design sketch: extend **`node-only-controlled-runners.test.ts`** or small `dependency-audit.contract.test.ts` parsing `package.json` + spawning `npm audit --json` (slow; run in CI only).

---

## Security / ops notes

- **Do not** run `npm audit fix --force` in CI for this repo.
- **`install-scripts` warnings** (esbuild, fsevents) are orthogonal — document as advisory only unless sponsor scopes allowlist work.

---

## Evidence outputs (`@build-plan`)

| File | Content |
| --- | --- |
| `evidence/npm-test-audit-witness.md` | Timestamped command transcripts for T-AUDIT-01, T-NPM-TEST-01, T-TSC-01 |
| `evidence/test-strategy-evidence.md` | Checklist mapping table IDs → pass/fail |
| `evidence/verification-evidence-manifest.v1.json` | Optional manifest row when closing |