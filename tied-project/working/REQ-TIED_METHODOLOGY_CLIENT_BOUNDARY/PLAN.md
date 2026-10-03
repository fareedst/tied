# Methodology client boundary — executable program plan

| Field | Value |
| --- | --- |
| **REQ** | [REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY](../../tied/requirements/REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY.yaml) (**Implemented**) |
| **ARCH** | [ARCH-TIED_METHODOLOGY_CLIENT_BOUNDARY](../../tied/architecture-decisions/ARCH-TIED_METHODOLOGY_CLIENT_BOUNDARY.yaml) |
| **IMPL** | [IMPL-TIED_METHODOLOGY_CLIENT_BOUNDARY](../../tied/implementation-decisions/IMPL-TIED_METHODOLOGY_CLIENT_BOUNDARY.yaml) · [pseudo-code sidecar](../../tied/implementation-decisions/IMPL-TIED_METHODOLOGY_CLIENT_BOUNDARY-pseudocode.md) |
| **CITDP** | [CITDP-REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY.yaml](../../tied/citdp/CITDP-REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY.yaml) (`phase: closed`) |
| **Tracker** | [checklist-tracker.yaml](./checklist-tracker.yaml) |
| **Parent context** | DAE residual **R4** — separate stack; **no** merge into [REQ-TIED_DAE_INCORPORATION](../../tied/requirements/REQ-TIED_DAE_INCORPORATION.yaml) |
| **Promoted** | **2026-09-24** via `plan-new-feature` (advisory memo → tracked TIED stack) |
| **Phase A** | **Shipped 2026-09-25** (`build-plan`) — opt-in `--methodology-readonly`, `--install-methodology-hook`, CI doc § methodology-boundary-ci-guard |
| **Phase B** | **Shipped 2026-09-25** (`build-plan`) — `TIED_METHODOLOGY_BUNDLE_PATH` read spike, parity tests, migration gates below |

## Refine gate (resolved)

| Sponsor term | Resolution |
| --- | --- |
| **Near term** | Pattern **#4**: optional bootstrap Unix read-only `tied/methodology/`, installable **client git hook template** rejecting staged `tied/methodology/**`, documented **CI path guard** — composed with existing MCP write blocks ([PROC-TIED_METHODOLOGY_READONLY]). |
| **Strategic** | Pattern **#2**: spike **MCP bundled methodology read** + `tied-cli` parity; **do not** remove `copy_files.sh` tree until migration gates pass. |
| **Non-goals** | No DAE token coupling; no project YAML promotion rule changes; no default-on chmod; hooks do not replace `detail-loader` / `yaml-loader` rejection. |

### Open questions (sponsor)

1. **Phase A default:** Should bootstrap expose `--methodology-readonly` as opt-in only (CITDP assumption) or document a recommended client cohort default?
2. **Windows Phase A:** Ship hook-only on Windows first, or block Phase A close-out until ACL helper/script exists?
3. **Phase B entry:** Run Phase B spike immediately after Phase A, or defer until a client pilot requests virtualization?

## Problem (retained from advisory)

TIED clients receive shared foundational REQ/ARCH/IMPL via `copy_files.sh` under read-only **`tied/methodology/`**, while **project YAML** and client glossaries under **`tied/vocab/`** remain writable. Agents and MCP must consume inherited methodology without mutating it.

## Vocabulary (RESOLVE)

| Term | Layer | Meaning |
| --- | --- | --- |
| **methodology YAML** | TIED glossary | Read-only inherited indexes/details under `tied/methodology/` |
| **project YAML** | TIED glossary | Writable client REQ/ARCH/IMPL under `tied/` root |
| **methodology-first read** | IMPL/MCP | Resolve detail paths methodology tree, then project fallback |
| **project-only writes** | [PROC-TIED_METHODOLOGY_READONLY] | MCP/agents never persist into `tied/methodology/` |
| **client refresh** | Bootstrap | Re-run `copy_files.sh`; overwrites `tied/methodology/` only |
| **methodology consumption pattern** | [REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY](../../tied/requirements/REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY.yaml) | How a client obtains and protects inherited R+A+I at rest and at read time |

## Pattern comparison (advisory baseline)

See original five-pattern analysis (package #1, MCP virtualization #2, submodule #3, OS/hooks #4, compiled bundle #5) in git history of this file before promotion. **Selected:** near-term **#4**, strategic **#2**; optional parallel **#1/#3** where org maturity supports.

## Phase contracts (build-plan entry)

### Phase A — mechanical enforcement (#4)

| Field | Contract |
| --- | --- |
| **INPUT** | Client project after bootstrap; explicit flags for read-only + hook install |
| **OUTPUT** | Optional Unix read-only tree; hook template; CI doc section in [client-development-index.md](../../tied/docs/client-development-index.md) |
| **Anchors** | `tools/bootstrap/`, `copy_files.sh` methodology overwrite semantics, [IMPL-TIED_FILES-pseudocode.md](../../tied/implementation-decisions/IMPL-TIED_FILES-pseudocode.md) boundary checks |
| **Compose** | [mcp-server/src/detail-loader.ts](../../mcp-server/src/detail-loader.ts), [mcp-server/src/yaml-loader.ts](../../mcp-server/src/yaml-loader.ts) — extend tests, do not fork write policy |
| **RED first** | Bootstrap harness test for opt-in read-only; hook staged-path rejection test |
| **build-plan remainder** | `Phase A` or `slice A` |

Active procedures (IMPL sidecar): `INSTALL_METHODOLOGY_READONLY_BOOTSTRAP_FLAG`, `INSTALL_CLIENT_HOOK_TEMPLATE`, `DOCUMENT_CI_METHODOLOGY_PATH_GUARD`, `COMPOSE_WITH_EXISTING_MCP_WRITE_GUARDS`.

### Phase B — MCP bundled read spike (#2)

| Field | Contract |
| --- | --- |
| **INPUT** | Pinned methodology corpus in MCP release artifact; fixture client with copied tree |
| **OUTPUT** | Parity report + migration gate list in this PLAN; spike tests proving methodology-first + sentinel semantics match loaders |
| **Non-goals** | Remove local `tied/methodology/`; change project-only write rules |
| **RED first** | Bundled read parity fixture test |
| **build-plan remainder** | `Phase B` or `slice B` |

Active procedures: `SPIKE_BUNDLED_METHODOLOGY_READ`, `DOCUMENT_MIGRATION_FROM_COPIED_TREE`.

### Phase B — parity report (2026-09-25 spike)

| Probe | Disk (`tied/methodology/`) | Bundled (`TIED_METHODOLOGY_BUNDLE_PATH`) | Match |
| --- | --- | --- | --- |
| Methodology-first detail (`REQ-METH-ONLY`) | Reads under `methodology/requirements/` | Same relative path under bundle root | Yes |
| Sentinel `detail_file: null` (`REQ-SENTINEL-ONLY`) | Excluded from `listDetailTokens` | Same | Yes |
| Methodology index + missing methodology file → project fallback (`REQ-FALLBACK`) | Methodology copy, then project after unlink | Same after bundle detail removed | Yes |
| Merged index (methodology + project override) | Project index wins on key collision | Same merge when bundle supplies methodology index | Yes |
| Project-only token (`REQ-PROJECT-ONLY`) | Project detail path | Unchanged (project base) | Yes |
| MCP write rejection for methodology-owned tokens | Unchanged | Unchanged (writes never target bundle) | Yes |

**Implementation anchors:** `mcp-server/src/yaml-loader.ts` (`resolveBundledMethodologyPath`, bundled precedence in `getMethodologyBasePath`), `mcp-server/src/bundled-methodology-read.ts`, `mcp-server/src/bundled-methodology-read.test.ts`, release layout note `mcp-server/methodology-bundle/README.md`.

**Operator env (spike):** `TIED_METHODOLOGY_BUNDLE_PATH=/abs/path/to/methodology-corpus` (directory layout = `tied/methodology/` contents, not the parent `tied/` folder).

### Migration gates (do not remove `copy_files.sh` tree until all pass)

| Gate | Status | Evidence |
| --- | --- | --- |
| G1 — Bundled vs copied-tree parity fixture tests green in CI | **Met (spike)** | `bundled-methodology-read.test.ts` |
| G2 — `tied-cli` / MCP read parity on a pilot client with bundle env only (no local `tied/methodology/`) | **Met (2026-09-25)** | `mcp-server/test/tied-cli-bundled-methodology-pilot.test.cjs` + shared fixture in `bundled-methodology-read.ts` (`omitLocalMethodology`); in-process loaders vs `tied-cli` for `yaml_detail_read`, `yaml_index_list_tokens`, `yaml_index_read` |
| G3 — Release pipeline publishes pinned corpus + version manifest beside `@tied/mcp` | **Met (2026-09-25)** | `npm run methodology-bundle:pack` → `mcp-server/src/methodology-bundle-pack.ts`, `mcp-server/src/cli/methodology-bundle-pack.ts`, `mcp-server/src/methodology-bundle-pack.test.js` in CI; `mcp-server/methodology-bundle/README.md` |
| G4 — Sponsor sign-off on offline/air-gapped clients still served by `copy_files.sh` refresh | **Met (2026-09-25)** | [Offline runbook](../../tied/docs/methodology-client-boundary-offline-runbook.md); [sign-off receipt](./evidence/methodology-offline-policy-signoff.v1.json); [g4-sponsor-signoff-2026-09-25.md](./evidence/g4-sponsor-signoff-2026-09-25.md) |
| G5 — Rollback documented: unset bundle env + `copy_files.sh` refresh restores local tree | **Met (spike)** | Bundle is read-only overlay; refresh overwrites `tied/methodology/` |

## Profile depth and gates

| Field | Value |
| --- | --- |
| `profile_depth` / `depth_tier` | **minimal** |
| `gate_policy` | **advisory** |
| Adversarial inquiry | `sub_adversarial_inquiry_pass: not_applicable` (CITDP) |

**pre_implementation:** Run `tied_checklist_gate_validate` on [checklist-tracker.yaml](./checklist-tracker.yaml) + CITDP before Phase A/B RED tests at **build-plan**.

**Recommended next:** Migration gates **G1–G4** met (G5 rollback documented). **REQ close-out** via **`/plan-close-out`** or **`build-plan`** close-out slice — envelope validate + `sub-close-out-evidence-sync` before marking REQ verified. Enable Phase A locally: `git config core.hooksPath .githooks` after bootstrap with `--install-methodology-hook`.

## References

- [AGENTS.md](../../AGENTS.md) — [PROC-TIED_METHODOLOGY_READONLY]
- [tied/vocab/tied-methodology.md](../../tied/vocab/tied-methodology.md)
- [docs/methodology-detail-files-bootstrap-fix-plan.md](../../docs/methodology-detail-files-bootstrap-fix-plan.md)
- DAE residual [R4](../REQ-TIED_DAE_INCORPORATION/RESIDUAL-PLAN.md#r4--methodology-client-boundary-separate-program)
