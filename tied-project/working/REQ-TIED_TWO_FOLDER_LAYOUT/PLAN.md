# PLAN — Two-folder TIED layout (`tied-project/` + `tied-bundle/`; no client `tied/` dir)

**Prompt type:** refine-plan (2026-10-02) → **build in progress**; Implement via `/build-plan`; close-out via `plan-close-out`.
**Proposed tokens:** [REQ-TIED_TWO_FOLDER_LAYOUT] · [ARCH-TIED_TWO_FOLDER_LAYOUT] · [ARCH-TIED_PROJECT_CONFIG_OWNERSHIP] · [IMPL-TIED_TWO_FOLDER_LAYOUT]
**Supersedes / amends:** [REQ-TIED_LAYERED_CLIENT_INSTALL] (linked/full become the only profiles), [IMPL-TIED_FILES] (BOOTSTRAP_TIED retired), [ARCH-TIED_STRUCTURE], [REQ-TIED_SETUP], [PROC-TIED_METHODOLOGY_READONLY], [REQ-TIED_CLIENT_REFRESH_PARITY] (full mode only), [REQ-TIED_NEW_CLIENT_ADHERENCE] (G4 path assertions).
**Date:** 2026-10-02. **Status:** **Close-out complete (2026-10-03)** — Phases **0–8** done; unified `close_out` `allowed: true` (`run_id=phase8-verify-2026-10-02`); envelope blocking_gaps=0; [plan-close-out-handoff.md](plan-close-out-handoff.md). **Field success:** factory client `/Users/fareed/Documents/dev/test/1791037288` (`mac-displays-cli`, 12/12 tests, live CLI) — [evidence/factory-field-client-1791037288-evidence.md](evidence/factory-field-client-1791037288-evidence.md). **Next:** sponsor commit **done** (`03c10a4`, 2026-10-03); local `main` ahead 21, **no push**. **Costly choices (§8):** treated as **accepted on implementation** — **`tied-project/`** + flattened **`tied-bundle/`**, two-file config, working split, hard-cut migrate, `copy_files.*` removed, store commits `tied-bundle/` corpus. **Process note:** build preceded refreshed pre_implementation gate receipts; LEAP in CITDP `leap_feedback`. `TIED_BASE_PATH` → `<project>/tied-project`.

---

## 0. Historical — store self-install incident (resolved)

During initial Refine (2026-10-02 morning), `tied-install` ran with `projectRoot == storeRoot`, staging linked stubs over legacy methodology paths. **Resolution:** store self-migration (Phase 6) moved the methodology corpus to committed **`tied-bundle/`**, removed legacy `copy_files.*`, and store MCP runs in **store mode** (`TIED_BASE_PATH` → `tied-project/`). **`GUARD_SELF_INSTALL`** ([SC-TFL-SELF-INSTALL-GUARD]) is covered by `tools/bootstrap/lib/self-install-guard.test.mjs`. Do not re-run a full self-install on the store without `--allow-self-install`.

---

## 1. Overview

Split every TIED client (and this source repo, which is a client of itself) into two sibling folders with a single invariant each:

- **`tied/`** — the **TIED project root** ([`tied/vocab/tied-methodology.md`](../../tied/vocab/tied-methodology.md) naming bridge; `TIED_BASE_PATH`): committed project traceability store (indexes, detail YAML, IMPL sidecars, CITDP — informal **tied-db**), plus client vocab, constitution, analysis, features, **`tied/working/`** (committed process evidence), and **`tied/config.yaml`**. **Nothing under `tied/` is gitignored.** Do not rename this directory to `tied-db/` (collides with install layer `db`, mislabels non-YAML content).
- **`tied-bundle/`** — the **TIED bundle root**: local-only materialization of shared resources (methodology YAML, docs, templates, install config, local working evidence). Methodology indexes and inherited detail files (bundle shape, flattened), methodology vocab, methodology docs, templates (incl. the sidecar template), the **install config** `tied-bundle/install.json`, the **local working root** `tied-bundle/working/`, and reports. **Everything under `tied-bundle/` is gitignored by one line** — except in the TIED source repo, where `tied-bundle/` is the committed canonical methodology corpus (documented exception, §6).

Root-level TIED config collapses from `.tied-yaml.yaml` + `tied/.tied-install.json` + `.tied/…report.json` + two `*.example.json` files to **two files with disjoint key ownership**: `tied/config.yaml` (committed) and `tied-bundle/install.json` (local). Harness files (`.cursor/mcp.json`, `.mcp.json`, `.cursor/skills/`, `.claude/*`, `AGENTS.md`, `.cursorrules`, `CLAUDE.md`) stay where the harnesses require. The legacy committed profile (`copy_files.*`, `copy-files.mjs`, `--legacy-bootstrap`, `TIED_BOOTSTRAP_LEGACY`) is deleted; `tied-install` linked/full is the only install path, with `tied-install --migrate-layout` for existing clients and for this repo.

**Folder names (decision):** `tied/` + `tied-bundle/` (refine-plan 2026-10-02). Rationale: non-dotted so IDE/agent file search indexes them; shared `tied-` prefix; **`tied-bundle`** aligns with `TIED_METHODOLOGY_BUNDLE_PATH` and holds docs/templates/install as well as methodology YAML (broader than `tied-methodology/` or `tied-method/`). Dotted variants rejected (agents/`rg` skip dot-dirs).

---

## 2. Refine — RESOLVE / RECORD

PRELOADed: `tied/vocab/tied-methodology.md` (canonical; routing row 1 matched "TIED layout, bootstrap, tied-install, methodology vs project YAML"), `tied/vocab/prompt-composer.md` (per agent prompt), plus `tied-yaml-mcp.md` rows for `TIED_BASE_PATH` / `.tied-yaml.yaml`. Methodology routing in this repo is currently a self-stub (§0); canonical read from `HEAD`.

**Sponsor terms → canonical terms**

- "TIED db … anything else that is committed" → **project traceability store** (indexes + detail + sidecars + `citdp/`); path stays **`tied/`** (**TIED project root**); **tied-db** = informal alias for the traceability subgraph only; also under `tied/`: vocab, config, committed **working/**.
- "local-only copy or reference to common TIED resources" → methodology + docs + templates + install; RECORD **TIED bundle root** (`tied-bundle/`).
- "`working` would belong here" → `working/{REQ}/` (checklist tracker, PLAN, evidence envelope, handoffs) → RECORD **committed working root** (`tied/working/`) and **local working root** (`tied-bundle/working/`) — see ambiguity (a).
- "`templates` would belong here" → root `templates/` (store: whole methodology corpus; client: sidecar template only) → `tied-bundle/templates/` for template *files*; the corpus itself flattens into `tied-bundle/` root (bundle shape).
- "TIED config files at root" → today: **repository YAML style file** `.tied-yaml.yaml` (also carries `jev`, `dae`, `tool_safety`, `citdp` keys), **install manifest** `tied/.tied-install.json`, parity report `.tied/`, harness MCP JSON, MCP examples, and **loader files** (`AGENTS.md`, `.cursorrules`, `CLAUDE.md` — docs, not config). RECORD **project config** (`tied/config.yaml`) and **install config** (`tied-bundle/install.json`, replaces install manifest).
- "document store" (parent's phrasing) → avoid: **store** already means the TIED source checkout (`--store`, `TIED_STORE_ROOT`). Use **TIED project root** / **TIED bundle root**.
- Existing terms kept: **store**, **install mode** (`linked|full`), **install dispatch**, **install shell shim**, **methodology-first** / **project fallback**, **project-only writes**, **client refresh parity gate** (full mode only), **linked install stub** (RECORD as canonical name for the redirect file).
- New terms to RECORD in `tied/vocab/tied-methodology.md` (Preferred terms, Naming bridge, block-name table, alphabetical index): TIED project root, project traceability store (tied-db), TIED bundle root, project config, install config, committed working root, local working root, **store mode** (MCP with no install config → methodology view off), **self-install guard**, **stale-layout lint**, **layout migration** (`tied-install --migrate-layout`), **two-folder invariant**. Retire/annotate: client refresh (as `copy_files.sh` execution), managed bootstrap artifact, Windows bootstrap entry point (`copy_files.cmd`), vocabulary merge mode (`--merge-vocab`), copy timestamp normalization (keep only if full-mode copy retains it).
- VALIDATE status: pending (Touchpoint 3 at `traceable-commit`, build phase).

**Residual ambiguity resolved by the agent (sponsor may override):**

- (a) `.gitignore` has **103** `working/**` patterns (gate ledgers, `gates/`, `adversarial-inquiry/`, `adherence/`, Jev traces, live benchmarks, `*-CLIENT-*` disposable dirs). "Nothing under `tied/` gitignored" therefore forces a split: durable artifacts (PLAN, tracker, CITDP draft, evidence envelope, handoffs, audit receipts) → `tied/working/`; machine-generated local evidence → `tied-bundle/working/`. Chosen over weakening the invariant. **Costly** (§8).
- (b) `tied-bundle/` shape: **flattened** (indexes + detail dirs at its root, same shape as `mcp-server/methodology-bundle/corpus` and today's `.linked-methodology-view/`) so `tied-bundle/` itself is a valid `TIED_METHODOLOGY_BUNDLE_PATH`; `docs/`, `vocab/`, `templates/`, `working/`, `reports/`, `install.json` sit alongside and are ignored by bundle readers. Nested `tied-bundle/methodology/` rejected (extra hop, no benefit).
- (c) Store methodology vocab stays at store `tied/vocab/` (it is simultaneously the store's own client vocab with 305 relative traceability links into `tied/requirements/` etc.); install projects it to client `tied-bundle/vocab/` exactly as it projects to `tied/methodology/vocab/` today. Store `tied/vocab` links to `../docs/` must be rewritten to `../../tied-bundle/docs/` (installer `normalizeMethodologyVocabLinks` rewrites back to `../docs/` on install).
- (d) `.cursor/mcp.example.json` / `.mcp.example.json`: **drop**; replaced by `tied-install --print-mcp-config` (and doctor output). They embed a developer's absolute store path in committed files.
- (e) Install config format: **JSON** (machine-written, never hand-edited, existing readers are JSON). Project config: **YAML** (hand-edited, replaces a YAML file).
- (f) `copy_files.*`: **delete, no alias**. The name carries the legacy semantics (committed materialization); an alias would keep 107 live references "resolving" and defeat the stale-layout lint. Windows smoke / README point at `tied-install.*`.
- (g) Source-repo invariant exceptions found: `tied/features/` (gitignored), `tied/requirements/REQ-FEEDBACK_TO_TIED.yaml` (gitignored), `tied/docs/.markscope-preview-cache/`. Plan: dev FEAT scratch → `tied-bundle/working/features/`; un-ignore `tied/features/`; review why `REQ-FEEDBACK_TO_TIED.yaml` is ignored and either commit or move; cache follows docs into `tied-bundle/`.
- (h) Existing clients on the old layout: **hard cut** with migration tool — MCP and `tied-install` emit `LEGACY_LAYOUT_DETECTED` + the `--migrate-layout` command rather than silently reading both layouts (consistent with sponsor decision 2).
- (i) `.cursor/hooks.json` (install `hooksSource`) is untracked in the store today; move the canonical copy to `tied-bundle/templates/cursor-hooks.json` so installs from a fresh clone work.

---

## 3. Target layout

Legend: **C** committed · **G** gitignored (single `tied-bundle/` line or harness entries in the managed block) · **(abs)** absent by design.

### 3.1 Fresh client after `tied-install --mode linked` (default)

- `AGENTS.md` **C** (create-if-absent loader) · `.cursorrules` **C** · `CLAUDE.md` **G** (managed) · `.gitignore` **C** (managed block)
- `.cursor/mcp.json` **G** · `.cursor/skills/**` **G** (stubs + `tied-cli.sh` exec wrapper) · `.cursor/hooks.json` **G**
- `.mcp.json` **G** · `.claude/skills/**` **G** · `.claude/hooks/` **G** · `.claude/settings.json` **G**
- `tied/` **C — nothing ignored**
  - `tied/config.yaml` **C** (project config, schema `tied-project-config.v1`; replaces root `.tied-yaml.yaml`)
  - `tied/requirements.yaml`, `architecture-decisions.yaml`, `implementation-decisions.yaml`, `semantic-tokens.yaml` **C**
  - `tied/requirements/`, `architecture-decisions/`, `implementation-decisions/` (+ `IMPL-*-pseudocode.md` sidecars) **C**
  - `tied/vocab/routing.md`, `domain-references.md`, client glossaries **C** (routing handoff now points to `../../tied-bundle/vocab/routing.md`)
  - `tied/citdp/` **C** · `tied/constitution.example.yaml` **C** · `tied/agent-preload-contract.yaml` **C** (optional) · `tied/analysis/` **C** (with `--with-bbce`) · `tied/features/` **C**
  - `tied/working/{REQ}/PLAN.md`, `checklist-tracker.yaml`, `CITDP-*.yaml` (draft), `evidence/request-evidence-envelope.v1.json`, `handoffs/`, `tied/working/tied-new-client-audit.v1.json`, `tied-claude-client-validation.v1.json` **C**
- `tied-bundle/` **G — one gitignore line**
  - `tied-bundle/install.json` **G** (install config, schema `tied-install.v2`)
  - `tied-bundle/requirements.yaml`, `architecture-decisions.yaml`, `implementation-decisions.yaml`, `semantic-tokens.yaml` **G** (linked: symlink→store, copy fallback; full: copy)
  - `tied-bundle/requirements/`, `architecture-decisions/`, `implementation-decisions/` **G** (inherited detail + methodology sidecars)
  - `tied-bundle/vocab/*.md` **G** (methodology glossaries incl. `routing.md`; linked: stub or symlink)
  - `tied-bundle/docs/*.md|yaml` **G** (DOCS_TO_COPY; linked: stub or symlink)
  - `tied-bundle/templates/impl-essence-pseudocode-template.md`, `agent-req-checklist-feat-spawned-phase5.v1.yaml`, `tied/analysis/*` starters, `cursor-hooks.json`, `CLAUDE.md.template` **G**
  - `tied-bundle/working/{REQ}/gates/`, `gate-*.json`, `*-ledger.jsonl`, `adversarial-inquiry/`, `adherence/`, `jev/`, benchmarks, disposable `*-CLIENT-*/` **G** (local working root)
  - `tied-bundle/reports/client-refresh-parity-report.json` **G** (full mode only; replaces `.tied/`)
- **(abs)**: `tied/methodology/`, `tied/docs/`, `tied/.tied-install.json`, `tied/.linked-methodology-view/`, root `templates/`, root `working/`, `.tied-yaml.yaml`, `.tied/`, `.cursor/mcp.example.json`, `.mcp.example.json`, `copy_files.*`.

`--mode full` differs only in materialization (copies instead of symlinks/stubs) and adds the parity report. `--harness cursor|claude|both` selects which harness trees exist.

### 3.2 TIED source repository (this repo) after self-migration

- Root: `AGENTS.md` **C** · `.cursorrules` **C** · `CLAUDE.md` **G** · `README.md` **C** · `tied-install.sh|.cmd|.ps1` **C** · `test-new-tied-client.*` **C** · `.gitignore` **C** (managed block + store-specific `tied-bundle/working/`, `tied-bundle/install.json`)
- `.cursor/mcp.json` **G** · `.cursor/skills/` **G** (dev copy) · `.cursor/agents/` **C** (source dev artifacts) · `.mcp.json` **G** · `.claude/*` **G**
- `tied/` **C — nothing ignored** (store is a client of itself)
  - `tied/config.yaml` **C** (from `.tied-yaml.yaml`)
  - project indexes + `requirements/` (104) · `architecture-decisions/` (98) · `implementation-decisions/` (229) **C**
  - `tied/vocab/` **C** — canonical methodology glossaries + this repo's routing handoff (stays; see §2(c))
  - `tied/citdp/` **C** · `tied/constitution.example.yaml` **C** · `tied/agent-preload-contract.yaml` **C** · `tied/analysis/` **C** · `tied/features/` **C** (dev scratch moved out)
  - `tied/working/` **C** (git mv from root `working/`; local-only evidence moved to `tied-bundle/working/`)
- `tied-bundle/` **C — documented exception: canonical methodology corpus, committed only here**
  - `tied-bundle/requirements.yaml`, `architecture-decisions.yaml`, `implementation-decisions.yaml`, `semantic-tokens.yaml` **C** (git mv from `templates/*.yaml`)
  - `tied-bundle/requirements/` (9) · `architecture-decisions/` (11) · `implementation-decisions/` (33) **C** (git mv from `templates/*`)
  - `tied-bundle/docs/` **C** (git mv from `tied/docs/`, 56 files)
  - `tied-bundle/templates/` **C**: `impl-essence-pseudocode-template.md`, `agent-req-checklist-feat-spawned-phase5.v1.yaml`, `processes.md` (note: duplicates `docs/processes.md` — flag for later), `tied/analysis/*`, `cursor-hooks.json` (from untracked `.cursor/hooks.json`), `CLAUDE.md.template` (from `tools/bootstrap/templates/`)
  - `tied-bundle/vocab/` **(abs)** in the store — installer reads store `tied/vocab/` (§2(c)); `checkStoreReachable` must not require it
  - `tied-bundle/working/` **G** (store-local evidence) · `tied-bundle/install.json` **(abs)** → MCP **store mode**
- Removed: root `templates/`, root `working/`, `tied/docs/`, `tied/methodology/` (incl. the 4 tracked, diverged index YAMLs), `.tied-yaml.yaml`, `.tied/`, `copy_files.sh|.cmd|.ps1`, `tools/bootstrap/copy-files.mjs`, `scripts/refresh-tied-client.sh`, `.cursor/mcp.example.json`, `.mcp.example.json`.
- Unchanged: `mcp-server/methodology-bundle/corpus` (pinned bundle), `tools/bundled-*-skill(s)/`, root `docs/` (source-only essays), `scripts/`.

**Store resolution:** `--store` still resolves to the repo root; `checkStoreReachable` requires `tied-bundle/requirements.yaml`, `tied-bundle/docs/`, `tied-bundle/templates/impl-essence-pseudocode-template.md`, `tied/vocab/`, `tools/bundled-*`, `mcp-server/dist/index.js`. Client `tied-bundle/` is a projection of store `tied-bundle/` (+ store `tied/vocab` → client `tied-bundle/vocab`). `.linked-methodology-view/` is eliminated: the client `tied-bundle/` root is the bundle root.

---

## 4. Config consolidation

### 4.1 Inventory today (file → readers)

- `.tied-yaml.yaml` (root, committed; from `templates/.tied-yaml.yaml`): keys `scalar_style`, `client_formatter`, `jev.*` (`plan_skills`, `checklist_evidence_sufficiency`, provider keys), `dae.*` (`crap_threshold`, `branch_check`, `agentstream_gate_check`), `tool_safety`, express-lane keys. Readers: `mcp-server/src/yaml-style-config.ts`, `jev/repo-tied-yaml.ts`, `dae/branch-check.ts`, `diff-scoped-crap.ts`, `citdp-express-lane.ts`, `tools/tool-safety-mcp.ts`, `packages/agentstream/src/jev-harness-shared.ts`, `dae-gate-preflight.ts`, `tools/bootstrap/lib/client-tool-use-bootstrap.mjs`, `scripts/yaml_list_sorter.rb` / `lint_yaml` (scalar style), `scripts/windows-bootstrap-smoke.cmd`. 48 live files reference it.
- `tied/.tied-install.json` (gitignored; `tied-install.v1`): `store`, `layers`, `mode`, `harness`, `methodology_bundle`, `tool_profile`, `tied_version`, `timestamp`. Readers: `install-layers-core.mjs` (`--refresh`), G4 audit (`install_profile`), windows smoke. 9 files.
- `.tied/client-refresh-parity-report.json` — a report, not config (`client-refresh-parity.mjs`, `verify-client-methodology.mjs`, `refresh-tied-client.sh`). 6 files.
- `.cursor/mcp.json`, `.mcp.json` — harness-dictated; env `TIED_BASE_PATH`, `TIED_METHODOLOGY_BUNDLE_PATH`, `TIED_STORE_ROOT`, `TIED_MCP_HARNESS`, metrics. Keep.
- `.cursor/mcp.example.json`, `.mcp.example.json` — rendered by `layers/db.mjs`. Drop (§2(d)).
- `tied-cli.sh` wrapper marker `TIED_CLI_REPO_ROOT_MARKER` — install-time patch; now derived from install config.
- `~/.config/tied/yaml-format.yaml` (XDG) — user-global; unchanged, lowest precedence.
- Loader docs `AGENTS.md`, `.cursorrules`, `CLAUDE.md` — not config; unchanged locations.

### 4.2 Proposed design: two files, disjoint ownership, one explicit override allowlist

**`tied/config.yaml` — project config (committed, hand-edited, schema `tied-project-config.v1`)**

- `schema` — required literal.
- `yaml.scalar_style`, `yaml.client_formatter` — from `.tied-yaml.yaml` (still honoured by Ruby sorter / `lint_yaml` / MCP writers; `TIED_YAML_STYLE` env and XDG remain lower-precedence fallbacks exactly as today).
- `jev.*`, `dae.*`, `bbce.*`, `tool_safety.*`, `citdp.*` (express lane, `diff_scoped_crap`, `crap_threshold`) — team policy; moved verbatim.
- `methodology.min_version` — optional compatibility floor checked by `tied-install` / doctor.
- `install_defaults.mode|harness|layers|methodology_bundle` — **team defaults** for `tied-install` when no flag is given (the only keys with a counterpart in the local file).
- `working.local_patterns` — optional additive list of extra artifact globs routed to the local working root (defaults built in).

**`tied-bundle/install.json` — install config (local, machine-written, schema `tied-install.v2`)**

- `schema`, `store` (absolute), `store_methodology_version`, `installed_at`, `installer_version`.
- `mode`, `harness`, `layers`, `methodology_bundle` — the **actual** install (recorded; overrides `install_defaults` for `--refresh`/doctor).
- `materialization` — per-entry `symlink|copy|stub` record (Windows fallback evidence).
- `bundle_path` — resolved bundle root (normally `<project>/tied-bundle`).
- `applied_tool_profile` — snapshot of which `--with-*` flags were applied (audit only; the policy itself lives in `tied/config.yaml`).
- `mcp_env` — the env the installer wrote/expects in `.cursor/mcp.json` / `.mcp.json` (`TIED_BASE_PATH`, `TIED_STORE_ROOT`, optional `TIED_METHODOLOGY_BUNDLE_PATH`, `TIED_MCP_HARNESS`).

**Precedence rule (recommendation): disjoint-by-ownership, no intersection.**

- Every key has exactly one owning file. A key found in the non-owning file is a hard error `CONFIG_KEY_OWNERSHIP_VIOLATION` (fail-closed; no silent merge, no "intersection of keys").
- The single overlay: `install_defaults.*` (committed default) vs `mode|harness|layers|methodology_bundle` (local actual). Local actual wins because it describes what is on disk; `tied-install --doctor` reports divergence as a warning and `--refresh` re-applies the committed default only with `--reset-to-defaults`.
- Unknown top-level keys in either file → error (prevents config drift reappearing at root).
- Rationale: intersection semantics make "which value applies?" depend on two files and a merge order no human remembers; disjoint ownership lets each file be read standalone (`tied/config.yaml` alone answers "what does the team require?", `install.json` alone answers "what is installed here?").

**Harness MCP JSON:** unchanged location and shape; `tied-install` writes it (create/merge, `tied-yaml` entry only) and records `mcp_env` in `install.json`. `tied-install --doctor` validates `.cursor/mcp.json` / `.mcp.json` env against `install.json` (and `TIED_BASE_PATH` against `<project>/tied`), failing on mismatch. `TIED_METHODOLOGY_BUNDLE_PATH` becomes **optional**: the MCP derives the bundle root as env override → `<dirname(TIED_BASE_PATH)>/tied-bundle` when `tied-bundle/install.json` exists → **store mode** (project-only view) otherwise. `tied_config_get_base_path` returns `{ tied_base_path, bundle_root, store_root, mode }`.

---

## 5. Path-rewrite strategy

**Single source of truth:** new `tools/bootstrap/lib/layout.mjs` exporting `resolveTiedLayout(projectRoot)` → `{ tiedDir, methodDir, projectConfigPath, installConfigPath, methodologyIndexRoot, docsDir, methodVocabDir, templatesDir, workingCommittedRoot, workingLocalRoot, reportsDir }` plus `STORE_LAYOUT` for the store side; mirrored `mcp-server/src/tied-layout.ts` (same constants, a contract test asserts both agree on a fixture). All code paths below import from these; no string-joined `"tied"`, `"working"`, `"methodology"`, `"templates"` elsewhere (a lint test greps for violations).

**Stale-layout lint** (`tools/bootstrap/lint-stale-layout.mjs` + `node --test` wrapper, added to `test-all`): fails on `tied/docs/`, `tied/methodology/`, `tied/.tied-install`, `tied/.linked-methodology-view`, `.tied-yaml.yaml`, `.tied/`, root `templates/` (word-boundary), root `working/` (word-boundary, excluding `tied/working`), `copy_files`, `copy-files.mjs`, `--legacy-bootstrap`, `TIED_BOOTSTRAP_LEGACY` across **live surfaces**: `AGENTS.md`, `.cursorrules`, `README.md`, `tools/`, `scripts/`, `mcp-server/src|packages|test`, `tied-bundle/**`, `tied/vocab/`, `tied/requirements|architecture-decisions|implementation-decisions/` (+ indexes), `.github/`. Excluded as historical: `tied/working/**`, `tied/citdp/**`, `CHANGELOG.md`, root `docs/**`, `mcp-server/methodology-bundle/corpus` (pinned). An allowlist file holds the handful of intentional mentions (e.g. migration docs describing the old layout).

**Categories and live-file counts** (rg over live surfaces, excluding `working/`, `tied/citdp/`, `CHANGELOG.md`, root `docs/`, `node_modules`, `dist`):

- Code constants / bootstrap engine (`tools/bootstrap/**`): ≈25–30 unique files (`install-layers-core`, `layers/{db,mcp,methodology,methodology-view→delete,skills-linked,store,verify-store,install-manifest→install-config,gitignore-block}`, `constants.mjs manifestPaths`, `client-tool-use-bootstrap`, `client-refresh-parity`, `verify.mjs`, `docs.mjs`, `sidecar-template.mjs`, `new-tied-client-pipeline`, `new-tied-client.mjs`, `tied-install-dispatch`, `install-options`, tests).
- `tools/bootstrap/manifest.json`: 1 (prefix `methodology/` → root-relative of `tied-bundle/`; `tied/docs/` → `docs/`; `tied/constitution.example.yaml` unchanged; `.cursor/skills/tied-yaml/scripts/tied.sh` unchanged).
- Gitignore managed block: 1 code file + 1 test; collapses 5 `tied/*` + 103 `working/*` lines in this repo's `.gitignore` to `tied-bundle/` + harness entries.
- MCP server methodology/base resolution (`mcp-server/src`): 14 files for `tied/methodology`, 13 for `tied/docs`, 3 for `templates/` (`yaml-loader.ts getMethodologyBasePath`, `bundled-methodology-read.ts`, `yaml-client-formatter.ts`, `methodology-bundle-pack.ts`, `fidelity-research/evidence-chain-profile.ts`, `jev/merged-routing-baseline.ts`, `vocabulary-explorer/term-analysis.ts`, consistency validator, tools exposing base path).
- MCP server `.tied-yaml.yaml` readers: 13 `src` + 6 `packages` files (`yaml-style-config.ts`, `jev/repo-tied-yaml.ts`, `dae/branch-check.ts`, `diff-scoped-crap.ts`, `citdp-express-lane.ts`, `tools/tool-safety-mcp.ts`, agentstream `jev-harness-shared.ts`, `dae-gate-preflight.ts`, tests).
- Working-root writers/readers (`"working"` joins): 19 non-test files in `mcp-server/src|packages` (`adversarial-inquiry/checklist-integration`, `checklist-gate-evidence-hydration`, `request-evidence-envelope/{build,patch}`, `dae/{gate-check-composition,tied-next}`, `jev/{plan-skills-evidence,plan-skills-triage-mcp}`, `hooks/adherence-append-action-attempted`, `diff-scoped-crap`, agentstream `live-executor`, `adherence-live`, `adherence-process-grade`, `dry-run-config`) + 43 `src` files mentioning `working/` incl. tests + 8 `packages` + `scripts/fixtures` (7) + `scripts/build-commands.sh` (`close_out_req`, audit report path) + checklist YAML header `envelope_path` / `evidence_refs_format` examples.
- `tied-cli.sh` / skills: `tools/bundled-tied-yaml-skill` 6 files (`TIED_BASE_PATH` default stays `<root>/tied`; add `TIED_METHOD_ROOT`; `copy_files` wording); `tools/bundled-prompt-type-skills` ≈16 files (`copy_files.sh installs it` wording, `./tied/methodology/vocab/routing.md` → `./tied-bundle/vocab/routing.md`, `working/` paths, `tied/docs/` links).
- Docs cross-links (store `tied/docs` → `tied-bundle/docs`): 40 of 56 files contain `tied/docs/`, `tied/methodology/` or `templates/` references; relative `./x.md` links survive the move unchanged.
- Vocab: 19 files in `tied/vocab/`; 305 relative links (`../docs/` → `../../tied-bundle/docs/`; `../requirements/` unchanged); ≈12 files mention `tied/methodology`, `tied/docs`, `templates/`, `.tied-yaml.yaml`, `copy_files`; `routing.md` handoff target; naming-bridge rows.
- YAML `*_path` and path-bearing fields: 24 `_path:` occurrences in `templates/{requirements,architecture-decisions,implementation-decisions}` detail YAML; project detail YAML live mentions: ≈21 (`tied/methodology`), 18 (`tied/docs`), 17 (`templates/`), 48 (`working/`), 7 (`.tied-yaml.yaml`), 30 (`copy_files`) → ≈60–70 unique detail files + 2 index files. `essence_pseudocode_path` values are `tied/`-relative and unchanged.
- `AGENTS.md`, `.cursorrules`, `CLAUDE.md`, `README.md`, `tools/bootstrap/README.md`, `mcp-server/README.md`, `packages/agentstream/README.md`: 7.
- CI / shells: `.github/workflows/windows-bootstrap-smoke.yml`, `scripts/windows-bootstrap-smoke.cmd` (drop copy_files phases 1–3, add `git check-ignore` invariant asserts), `scripts/lint_yaml.sh|.cmd|.ps1` (`-F tied` → also `-F tied-bundle` in the store), `tools/bootstrap/lint-yaml.mjs`, Windows shims (`scripts/new-tied-client.ps1`, `test-new-tied-client.ps1`, `copy_files.ps1` delete), `scripts/tied-post-session.sh`: ≈10.
- G4 audit: `scripts/lib/tied-new-client-audit.mjs` (`CLIENT_TEMPLATE_REL`, report path, install_profile from `install.json`, new checks: two-folder invariant via `git check-ignore`, `tied/config.yaml` present, no `.tied-yaml.yaml`), `scripts/run-tied-new-client-audit.mjs`, `scripts/tied-new-client-audit.test.mjs`: 3.
- Parity allowlist / report: `lib/methodology-template-only-allowlist.mjs`, `client-refresh-parity.mjs`, `verify-client-methodology.mjs`, schema: 4.
- `how install-matrix` + `working/REQ-TIED_LAYERED_CLIENT_INSTALL/install-resource-matrix.md` → regenerated from `layout.mjs` + gitignore block; `close-out-req` paths: `scripts/build-commands.sh` 1.
- Total ≈ 250–300 live files edited, plus history-preserving `git mv` of ≈56 docs, ≈57 template files, and the whole `working/` tree.

---

## 6. Legacy removal (what goes, what replaces it)

- `copy_files.sh`, `copy_files.cmd`, `copy_files.ps1` → deleted; replaced by `tied-install.sh|.cmd|.ps1` (`--mode full` is the offline/materialized equivalent). No alias (§2(f)).
- `tools/bootstrap/copy-files.mjs`, `lib/bootstrap.mjs` `bootstrapTied` orchestration, `resolveLegacyBootstrapScript`, IMPL block `RESOLVE_LEGACY_BOOTSTRAP_SCRIPT` → deleted; shared libs still used by full mode (`copy-managed.mjs`, `docs.mjs`, `vocab.mjs`, `verify.mjs`, `claude-md.mjs`, `skills.mjs`) stay.
- `--legacy-bootstrap`, `TIED_BOOTSTRAP_LEGACY=1` in `install-options.mjs`, `new-tied-client-pipeline.mjs`, `new-tied-client.mjs`, `install-layers.mjs`, `tied-install.sh`, `scripts/build-commands.sh`, `AGENTS.md`, `tools/bootstrap/README.md`, `mcp-server/src/e2e/new-tied-client.test.ts` → removed; factory is linked-only with `--install-mode full` option.
- `--merge-vocab`, `--install-methodology-hook`, `--methodology-readonly` → keep only as `tied-install --mode full` options (methodology client boundary, [REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY] Phase A) or drop `--merge-vocab` (linked/full always project vocab non-destructively).
- `scripts/refresh-tied-client.sh` (uses `.tied/`) → deleted; `tied-install --refresh`.
- [REQ-TIED_LAYERED_CLIENT_INSTALL] criteria `SC-LCI-LEGACY-COPY`, `SC-LCI-WINDOWS-LEGACY-CMD` → removed; `SC-LCI-FACTORY-LINKED` reworded (no escape hatch); description "copy_files unchanged" → "sole install path".
- Install matrix legacy column, `how install-matrix` legacy lines, README "Profiles" paragraph and entry-point rows → removed/regenerated.
- `tied/docs/methodology-migration.md` (→ `tied-bundle/docs/`) → rewrite around `tied-install --migrate-layout` and `--refresh`; keep a short "history" note on `copy_files.sh` for readers of old CITDP records.
- [PROC-TIED_METHODOLOGY_READONLY] wording ("lives under `tied/methodology/`, refreshed by re-running `copy_files.sh`") → "lives under `tied-bundle/` (local, gitignored), refreshed by `tied-install --refresh`; do not write there". AGENTS.md §2 "Client inheritance of LEAP R+A+I via `copy_files.sh`" → via `tied-install`; the methodology R+A+I tokens remain **mandatory and present** — they ship under `tied-bundle/` (bundle shape) and are read through the merged view, so nothing about their mandatory status changes; only their on-disk location and delivery mechanism do.
- Vocab rows naming `copy_files.sh`, `copy_files.cmd`, client refresh, managed bootstrap artifact, Windows bootstrap entry point → retired or re-pointed (RECORD).
- Windows smoke phases that run `copy_files.cmd` and `copy-files.mjs` → replaced by `tied-install.cmd --mode linked`, `--mode full`, `--migrate-layout` on a legacy fixture, and invariant asserts.
- [IMPL-TIED_FILES] `BOOTSTRAP_TIED`, `INSTALL_TIED_YAML_SKILL`, `PATCH_TIED_CLI_REPO_ROOT`, `SEED_DOMAIN_VOCAB`, `MERGE_DOMAIN_VOCAB`, `COPY_IMPLEMENTATION_PSEUDOCODE_SIDECARS` → marked superseded by [IMPL-TIED_LAYERED_CLIENT_INSTALL] / [IMPL-TIED_TWO_FOLDER_LAYOUT] blocks (LEAP: IMPL → ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM → REQ-TIED_SETUP wording).

---

## 7. Self-hosting: migrating this repository

Executed by the same `MIGRATE_LAYOUT` block as clients, with a `--store` variant (dry-run first, prints the `git mv` script; run only after Phase 0 restore):

1. `git mv tied/docs tied-bundle/docs`
2. `git mv templates/requirements.yaml templates/architecture-decisions.yaml templates/implementation-decisions.yaml templates/semantic-tokens.yaml tied-bundle/` ; `git mv templates/requirements templates/architecture-decisions templates/implementation-decisions tied-bundle/`
3. `git mv templates/impl-essence-pseudocode-template.md templates/agent-req-checklist-feat-spawned-phase5.v1.yaml templates/processes.md templates/tied tied-bundle/templates/` ; `git mv tools/bootstrap/templates/CLAUDE.md.template tied-bundle/templates/` ; `git add` canonical `cursor-hooks.json`
4. `git mv working tied/working` then move local-only evidence (gitignored today, so untracked) to `tied-bundle/working/`
5. `git mv .tied-yaml.yaml tied/config.yaml` + transform to `tied-project-config.v1`
6. `git rm tied/methodology/*.yaml` (4 diverged copies), `git rm copy_files.* tools/bootstrap/copy-files.mjs scripts/refresh-tied-client.sh .cursor/mcp.example.json .mcp.example.json`
7. Rewrite references (§5), replace the 108 legacy `.gitignore` lines with the managed block + `tied-bundle/working/` + `tied-bundle/install.json`
8. Update `.cursor/mcp.json` / `.mcp.json` (no bundle path → store mode), rebuild `mcp-server`, run `tied_validate_consistency`, `lint_yaml -F tied -F tied-bundle`

**Store exception, stated explicitly:** `tied-bundle/` is gitignored in every client, but **committed in the TIED source repo**, because the source repo is the one place the methodology corpus is authored. The store's `.gitignore` ignores only `tied-bundle/working/` and `tied-bundle/install.json`. The store's MCP runs in **store mode** (no `install.json` → methodology view off → project-only reads), which also removes today's silent token overlap between `templates/*` (9/11/33 detail files, all also present in `tied/*`) and project YAML.

---

## 8. TIED tracking proposal

- **REQ** `REQ-TIED_TWO_FOLDER_LAYOUT` (`tied/requirements/REQ-TIED_TWO_FOLDER_LAYOUT.yaml`, category Infrastructure, P1). Criteria: SC-TFL-INVARIANT (no path under `tied/` ignored; every path under `tied-bundle/` ignored — `git check-ignore` in integration test and G4 audit), SC-TFL-CONFIG-TWO-FILES (only `tied/config.yaml` + `tied-bundle/install.json`; ownership violation fails), SC-TFL-MCP-ROOT (MCP resolves method root from base path; store mode), SC-TFL-SELF-INSTALL-GUARD, SC-TFL-MIGRATE (legacy fixture client → new layout, idempotent), SC-TFL-STALE-LINT (zero stale references on live surfaces), SC-TFL-LEGACY-REMOVED, SC-TFL-WINDOWS (symlink-or-copy under `tied-bundle/`, CI green), SC-TFL-STORE-SELF-HOSTED.
- **ARCH** `ARCH-TIED_TWO_FOLDER_LAYOUT` (layout, flattened bundle shape, store exception, working split, linked materialization policy) and `ARCH-TIED_PROJECT_CONFIG_OWNERSHIP` (two files, disjoint ownership, single overlay, fail-closed unknown keys, MCP env derivation/doctor).
- **IMPL** `IMPL-TIED_TWO_FOLDER_LAYOUT` with sidecar `tied/implementation-decisions/IMPL-TIED_TWO_FOLDER_LAYOUT-pseudocode.md` (`essence_pseudocode_path: implementation-decisions/IMPL-TIED_TWO_FOLDER_LAYOUT-pseudocode.md`).
- **Updates:** REQ/ARCH/IMPL-TIED_LAYERED_CLIENT_INSTALL (criteria, blocks `INSTALL_TIED_LAYERS`, `APPLY_GITIGNORE_MANAGED_BLOCK`, `RESOLVE_LINKED_METHODOLOGY_BUNDLE` → delegate to new blocks; delete `RESOLVE_LEGACY_BOOTSTRAP_SCRIPT`), IMPL-TIED_FILES (supersede bootstrap blocks), ARCH-TIED_STRUCTURE (two-folder structure), REQ-TIED_SETUP (delivery via tied-install), ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM (entry points), REQ-TIED_CLIENT_REFRESH_PARITY (full mode + report path), REQ-TIED_NEW_CLIENT_ADHERENCE (G4 checks), REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY (boundary = `tied-bundle/`), REQ-TIED_YAML_STYLE_CONFIGURATION (config file path), PROC-TIED_METHODOLOGY_READONLY in `processes.md`; `semantic-tokens.yaml` rows.
- **CITDP:** `tied/citdp/CITDP-REQ-TIED_TWO_FOLDER_LAYOUT.yaml` (persist after implementation per `citdp-policy.md`; draft kept at `tied/working/REQ-TIED_TWO_FOLDER_LAYOUT/CITDP-REQ-TIED_TWO_FOLDER_LAYOUT.yaml`).
- **Tracker:** `working/REQ-TIED_TWO_FOLDER_LAYOUT/checklist-tracker.yaml` (copied from `tied/docs/agent-req-implementation-checklist.yaml` at `HEAD`; moves to `tied/working/` in Phase 6).

**IMPL `essence_pseudocode` block outline** (each block carries `// [IMPL-TIED_TWO_FOLDER_LAYOUT] [ARCH-TIED_TWO_FOLDER_LAYOUT|ARCH-TIED_PROJECT_CONFIG_OWNERSHIP] [REQ-TIED_TWO_FOLDER_LAYOUT] — How: …` plus PRE/POST/EFFECTS/FAILURE_MODES):

- `RESOLVE_TIED_LAYOUT(projectRoot) -> layout` — pure; all folder/file paths from one place; POST paths are absolute; no EFFECTS.
- `GUARD_SELF_INSTALL(projectRoot, storeRoot, allow)` — FAILURE `SELF_INSTALL_REFUSED` when equal or nested unless `allow`.
- `LOAD_PROJECT_CONFIG(layout) -> cfg` — parse `tied/config.yaml`; FAILURE `PROJECT_CONFIG_INVALID`, `CONFIG_UNKNOWN_KEY`.
- `LOAD_INSTALL_CONFIG(layout) -> cfg|null` — null ⇒ store mode; FAILURE `INSTALL_CONFIG_INVALID`.
- `MERGE_TIED_CONFIG(project, install) -> effective` — disjoint ownership; overlay only `install_defaults`; FAILURE `CONFIG_KEY_OWNERSHIP_VIOLATION`.
- `RESOLVE_METHODOLOGY_ROOT(layout, env) -> path|null` — env override → `tied-bundle/` when install config present → null (store mode).
- `DETECT_LEGACY_LAYOUT(projectRoot)` — FAILURE `LEGACY_LAYOUT_DETECTED` with migrate hint.
- `MATERIALIZE_METHOD_FOLDER(projectRoot, storeRoot, mode, platform)` — linked: symlink, copy fallback, stub for docs/vocab; full: copy; EFFECTS only under `tied-bundle/`; records materialization.
- `APPLY_GITIGNORE_MANAGED_BLOCK(projectRoot)` — POST block = `tied-bundle/` + harness paths; invariant: no `tied/` entry; replaces v1 block.
- `WRITE_INSTALL_CONFIG(projectRoot, record)` / `DERIVE_MCP_ENV(layout, installCfg)` / `DOCTOR_VALIDATE(projectRoot)` — doctor checks mcp JSON env vs install config, invariant via `git check-ignore`, tied-cli stdio call.
- `RESOLVE_WORKING_ROOT(projectRoot, token, kind)` — `committed` → `tied/working/{token}`, `local` → `tied-bundle/working/{token}`; classification table built in + `working.local_patterns`.
- `LINT_STALE_LAYOUT_REFERENCES(repoRoot, scope, allowlist) -> findings` — TERMINATION on scan complete; non-zero exit on findings.
- `MIGRATE_LAYOUT(projectRoot, {store: bool, dryRun})` — git mv when repo, else fs rename; transforms config; rewrites gitignore; re-installs `tied-bundle/`; idempotent.
- `BUILD_FACTORY_INSTALL_ARGV` (existing, updated) — no legacy branch.

---

## 9. CITDP analysis

- **Change class:** structural migration + behavior-changing install/MCP surface; **size XL**; not express-lane eligible.
- **profile_depth / depth_tier:** `integrated` (triggers: persistence — on-disk layout and config; external input — parsed config files; strict close-out). **Gate policy:** advisory at structural and pre-RED inquiry passes; blocking at `verification-gate`. Adversarial artifacts under `tied/working/REQ-TIED_TWO_FOLDER_LAYOUT/adversarial-inquiry/` → by this plan's own rule these are **local** evidence → `tied-bundle/working/…` once Phase 4 lands (record the transition in CITDP).
- **Impact map:** bootstrap engine; MCP server base/method resolution, config readers, working-root writers; `tied-cli.sh` + both skill bundles; agentstream preflight (`.cursor/mcp.json` env expectations, `.tied-yaml.yaml` readers); G4 audit; parity gate; Windows shims + CI; all methodology docs/vocab/templates; project detail YAML path fields; AGENTS.md/.cursorrules/CLAUDE.md; `.gitignore`; existing clients.
- **Risks and mitigations:**
  - R1 Breaking existing clients (old layout, `.tied-yaml.yaml`) — `--migrate-layout` + `LEGACY_LAYOUT_DETECTED` fail-closed messages; migration fixture test; CHANGELOG entry.
  - R2 MCP `TIED_BASE_PATH` semantics: base path stays `tied/`; methodology root becomes derived — risk of reading the wrong tree in multi-root workspaces persists (CITDP RISK-010); doctor validates env; `tied_config_get_base_path` reports both roots.
  - R3 Store self-install / self-migration damage (already happened once) — self-install guard RED test first; Phase 0 restore; dry-run migration script reviewed before run.
  - R4 Windows symlinks under `tied-bundle/` — symlink-or-copy with recorded materialization; CI smoke on `windows-latest` asserts invariant; copy fallback is semantically `--mode full`.
  - R5 Token overlap in store (templates vs project detail) surfacing once `tied-bundle/` is a bundle root — store mode disables methodology view; test asserts no duplicate-token warnings in store.
  - R6 Evidence path changes (`working/{REQ}/evidence/...` in checklist header, envelope schema, gate receipts, fixtures) — layout helper + fixture regeneration; `scripts/fixtures` (7 files) and `mcp-server/test/fixtures` updated together; keep `working/`-relative strings inside envelopes relative to project root via the helper.
  - R7 Stale references in 250–300 files — stale-layout lint in `test-all`; mechanical rewrite scripted and reviewed.
  - R8 agentstream preflight false negatives — update expected env; keep preflight off by default (unchanged).
  - R9 Loss of `copy_files` for offline clients — `--mode full` covers offline materialization.
  - R10 Docs relative links break when `tied/docs` moves — only cross-folder links change (40 files); link-check test over `tied-bundle/docs` + `tied/vocab`.
- **Consequence ladder:**
  - **Costly (sponsor confirms before build):** folder names `tied/` + `tied-bundle/`; flattened bundle shape of `tied-bundle/`; project config filename/schema `tied/config.yaml` (`tied-project-config.v1`) and the disjoint-ownership + single-overlay precedence; committed vs local **working split** and its default classification table; hard-cut legacy layout (`LEGACY_LAYOUT_DETECTED`) with no dual-read compat; deleting `copy_files.*` with no alias; committing `tied-bundle/` in the source repo (exception).
  - **Reversible (proceed on defaults):** `install.json` JSON vs YAML; eliminating `.linked-methodology-view`; dropping `*.example.json`; stub vs symlink materialization for docs/vocab; parity report path `tied-bundle/reports/`; stale-lint scope/allowlist; store `tied/features` and `REQ-FEEDBACK_TO_TIED.yaml` handling; vocab staying in store `tied/vocab/`; moving `hooks.json` / `CLAUDE.md.template` into `tied-bundle/templates/`.
- **Test strategy** ([PROC-TEST_STRATEGY]):
  - **Unit (RED first):** `layout.test.mjs` (all paths, Windows separators, store layout); `gitignore-block.test.mjs` (no `tied/` entries, `tied-bundle/` present, v1→v2 block replacement, idempotent); `project-config.test.mjs` + `install-config.test.mjs` (schema, unknown keys, ownership violation, overlay precedence, store mode null); `self-install-guard.test.mjs`; `working-root.test.mjs` (classification); `lint-stale-layout.test.mjs` (fixture tree with planted stale refs, allowlist); mcp-server `tied-layout.test.ts` (mirror contract vs bootstrap constants fixture), `yaml-loader` method-root resolution (env override / install.json / store mode / `LEGACY_LAYOUT_DETECTED`), `yaml-style-config` reading `tied/config.yaml`, `repo-tied-yaml` + dae/jev readers, `tied_config_get_base_path` shape; Ruby `yaml_list_sorter_test.rb` config path.
  - **Composition:** `install-layers` → `verify-store` → `DERIVE_MCP_ENV` → mcp JSON contents → doctor passes; `tied-cli.sh` wrapper env (`TIED_BASE_PATH`, `TIED_METHOD_ROOT`, store dist); `new-tied-client-pipeline` → G4 audit invariant checks; `close-out-req` resolves `tied/working/{REQ}`; `how install-matrix` renders from `layout.mjs`; agentstream preflight with new env; adherence hook marker path under local working root.
  - **Integration:** `install-layers.integration.test.mjs` — fresh temp git repo: exact C/G tree, `git check-ignore` over every path, linked then `--refresh` idempotent, `--mode full` parity report path, `--migrate-layout` on a committed legacy fixture (old `tied/methodology`, `tied/docs`, root `working/`, `.tied-yaml.yaml`) → new layout with history (`git log --follow`), self-install refusal, Windows copy fallback (platform injected).
  - **Repo-level:** stale-layout lint over this repo; docs/vocab link check; `tied_validate_consistency`; `lint_yaml -F tied -F tied-bundle`.
  - **E2E (justified):** `test-new-tied-client` (linked, `--install-mode full`, `--harness claude`) and the Windows CI smoke — they cross process boundaries (shell shims → Node dispatch → `tied-cli` stdio → optional `agent mcp enable` → `git commit`) that no in-process test can exercise; each remains the sole proof for the shim/harness chain.

---

## 10. Phased todo list (Phase 0 = RED tests first)

| Phase | Status | Evidence (spot-check) |
|-------|--------|------------------------|
| 0a | **done** | No top-level client `tied/`; corpus under `tied-bundle/docs/` |
| 0b | **done** | `tied-project/requirements/REQ-TIED_TWO_FOLDER_LAYOUT.yaml`, ARCH×2, IMPL + sidecar; `tfl-*-create.json` |
| 0c–0d | **done** | Bootstrap + MCP RED/GREEN tests (`layout.test.mjs`, `tied-layout.test.ts`, …) |
| 1 | **done** | `tools/bootstrap/lib/layout.mjs`, `mcp-server/src/tied-layout.ts` |
| 2 | **done** | `project-config.mjs`, `install-config.mjs`, MCP config readers |
| 3 | **done** | Methodology materialization under `tied-bundle/` only |
| 4 | **done** | `working-root.mjs` / `working-root.ts` committed vs local split |
| 5 | **done** | `copy_files.*` removed; `--migrate-layout` |
| 6 | **done** | Store `git mv` to `tied-bundle/`; root `working` → `tied-project/working` |
| 7 | **done** | CHANGELOG Unreleased phases 7–8 slice; stale-layout + G4 audit |
| 8 | **done** | `test-all`, `validate_tied`, verification + close_out gates, manifest, `tied_verify`, CITDP persist; factory/Windows smoke optional (CI) |

**Phase 0 — Stabilize, record, RED**
- 0a (needs sponsor approval; git mutation): restore self-install damage per §0; delete `tied/.tied-install.json`, `tied/.linked-methodology-view/`, `tied/methodology/vocab/` stubs; fix `.cursor/mcp.json` / `.mcp.json` env.
- 0b: Create REQ/ARCH×2/IMPL via TIED YAML MCP (`tied_token_create_with_detail`), write sidecar `tied/implementation-decisions/IMPL-TIED_TWO_FOLDER_LAYOUT-pseudocode.md` with all blocks token-commented; `pseudocode_validate`; `semantic-tokens.yaml`; copy Tracker to `working/REQ-TIED_TWO_FOLDER_LAYOUT/checklist-tracker.yaml`; CITDP draft; RECORD vocab terms in `tied/vocab/tied-methodology.md`.
- 0c: `tied_checklist_gate_validate` `pre_implementation` (build phase only).
- 0d RED tests: `tools/bootstrap/lib/layout.test.mjs`, `layers/gitignore-block.test.mjs` (new assertions), `lib/project-config.test.mjs`, `layers/install-config.test.mjs`, `lib/self-install-guard.test.mjs`, `lib/working-root.test.mjs`, `lint-stale-layout.test.mjs`, `install-layers.integration.test.mjs` (new cases), `mcp-server/src/tied-layout.test.ts`, `yaml-loader` method-root tests, `yaml-style-config.test.ts`, `jev/repo-tied-yaml.test.ts`, `tools/tool-safety-mcp` config path test, `scripts/tied-new-client-audit.test.mjs` invariant checks.

**Phase 1 — Layout constants + guards (GREEN)**
- `tools/bootstrap/lib/layout.mjs`; `mcp-server/src/tied-layout.ts`; `GUARD_SELF_INSTALL` in `install-layers-core.mjs`; `gitignore-block.mjs` v2 (`tied-bundle/` + harness; remove `tied/*` and `templates/*` entries); `DETECT_LEGACY_LAYOUT`.

**Phase 2 — Config**
- `lib/project-config.mjs` (`tied/config.yaml` loader + `.tied-yaml.yaml` → v1 transform); `layers/install-config.mjs` (replaces `install-manifest.mjs`, `tied-install.v2`); `MERGE_TIED_CONFIG`; `client-tool-use-bootstrap.mjs` writes `tied/config.yaml`; `templates/.tied-yaml.yaml` → `tied-bundle/templates/config.yaml`; mcp-server readers (`yaml-style-config.ts`, `jev/repo-tied-yaml.ts`, `dae/branch-check.ts`, `diff-scoped-crap.ts`, `citdp-express-lane.ts`, `tools/tool-safety-mcp.ts`, agentstream `jev-harness-shared.ts`, `dae-gate-preflight.ts`); Ruby `yaml_list_sorter.rb` / `lint_yaml` style lookup; `DERIVE_MCP_ENV` + doctor validation; `tied_config_get_base_path` output.

**Phase 3 — Method folder + MCP resolution**
- `layers/methodology.mjs` → `MATERIALIZE_METHOD_FOLDER` (linked symlink/copy/stub; full copy) writing only under `tied-bundle/`; delete `methodology-view.mjs`; `layers/store.mjs` (`checkStoreReachable` new paths, bundle path = `tied-bundle/`); `verify-store.mjs` (drop synthetic symlink dir; verify against `tied-bundle/`); `manifest.json` prefixes; `constants.mjs manifestPaths`; `layers/db.mjs` (drop examples, write `tied/config.yaml`, routing handoff target); `skills-linked.mjs` wrappers (`TIED_METHOD_ROOT`); mcp-server `yaml-loader.ts getMethodologyBasePath` → `RESOLVE_METHODOLOGY_ROOT`, `bundled-methodology-read.ts`, `yaml-client-formatter.ts`, `methodology-bundle-pack.ts`, `evidence-chain-profile.ts`, `jev/merged-routing-baseline.ts`, `vocabulary-explorer/term-analysis.ts`, consistency validator; `tools/bundled-tied-yaml-skill/scripts/tied-cli.sh` + `SKILL.md`; parity gate report → `tied-bundle/reports/`.

**Phase 4 — Working split (costly; confirm first)**
- `RESOLVE_WORKING_ROOT` in both constants modules; update 19 mcp-server/agentstream writers/readers, `hooks/adherence-append-action-attempted.ts`, `scripts/build-commands.sh` (`close_out_req`, audit report), `scripts/lib/tied-new-client-audit.mjs`, `scripts/run-tied-claude-client-validation.mjs`, `scripts/tied-post-session.sh`, checklist YAML header `envelope_path`/`evidence_refs_format`, `scripts/fixtures` + `mcp-server/test/fixtures` paths; collapse `.gitignore` working patterns.

**Phase 5 — Legacy removal**
- Delete `copy_files.sh|.cmd|.ps1`, `tools/bootstrap/copy-files.mjs`, `bootstrapTied` entry, `resolveLegacyBootstrapScript`, `scripts/refresh-tied-client.sh`, `.cursor/mcp.example.json`, `.mcp.example.json`; strip `--legacy-bootstrap` / `TIED_BOOTSTRAP_LEGACY` from `install-options.mjs`, `new-tied-client*.mjs`, `install-layers.mjs`, `tied-install.sh`, `build-commands.sh`, `e2e/new-tied-client.test.ts`; `MIGRATE_LAYOUT` + `tied-install --migrate-layout` (+ `--store --dry-run`).

**Phase 6 — Store self-migration + path rewrite**
- Run §7 `git mv` script (dry-run reviewed); rewrite references per §5 across `AGENTS.md`, `.cursorrules`, `CLAUDE.md`, `README.md`, `tools/bootstrap/README.md`, `tied-bundle/docs/**` (40 files), `tied/vocab/**` (links + rows), `tied-bundle/templates/**` (24 `_path` fields + prose), project detail YAML (≈60–70 files via MCP `yaml_*`/`tied-cli`), both skill bundles, `.github/workflows/windows-bootstrap-smoke.yml`, `scripts/windows-bootstrap-smoke.cmd`, `scripts/lint_yaml.*`, Windows shims; `.cursor/mcp.json` / `.mcp.json` to store mode; regenerate `install-resource-matrix.md` and `how install-matrix`; `processes.md` PROC-TIED_METHODOLOGY_READONLY.

**Phase 7 — Lint, audit, matrix**
- `tools/bootstrap/lint-stale-layout.mjs` wired into `test-all`; G4 audit invariant + config checks; docs/vocab link check; `how install-matrix` from `layout.mjs`; CHANGELOG.

**Phase 8 — Verification and close-out**
- `source scripts/build-commands.sh && test-all` (incl. `test-bootstrap-layered-install`), `mcp-server` `npm test` + `tsc -b`, `lint_yaml -F tied-project -F tied-bundle`, `test-new-tied-client` (linked), `test-new-tied-client --install-mode full`, `test-new-claude-tied-client`, Windows CI smoke, `tied-install --doctor` on store and a disposable client, `tied_validate_consistency`, `tied_verify` with validated gate, persist `tied-project/citdp/CITDP-REQ-TIED_TWO_FOLDER_LAYOUT.yaml`, vocab VALIDATE, proposed commit message (no auto-commit).
- **Done (2026-10-03):** CITDP evidence commands use `lint_tied`; `verification-evidence-manifest.v1.json` on disk; close_out gate + envelope blocking pass. **Optional not run locally:** `test-new-tied-client`, Windows smoke, `tied-install --doctor` on disposable client (PLAN still lists them for release hardening).

---

## 11. Files read / verified for this plan

`AGENTS.md`; `tied-bundle/docs/ai-principles.md`; `tied-project/vocab/routing.md`; `tied-bundle/vocab/routing.md`; `tied-project/vocab/tied-methodology.md`; `tools/bundled-prompt-type-skills/plan-new-feature/SKILL.md`, `prompt-shared/tied-refine.md`, `prompt-shared/tied-plan-citdp.md`; `tools/bootstrap/README.md`; `working/REQ-TIED_LAYERED_CLIENT_INSTALL/install-resource-matrix.md`; `tools/bootstrap/lib/install-layers-core.mjs`, `lib/constants.mjs`, `manifest.json`, `lib/layers/{gitignore-block,store,install-manifest,methodology,methodology-view,verify-store}.mjs`; `mcp-server/src/yaml-loader.ts` (base/method resolution, merge semantics), `yaml-style-config.ts`, `jev/repo-tied-yaml.ts`; `tied/requirements/REQ-TIED_LAYERED_CLIENT_INSTALL.yaml`; `tied/implementation-decisions/IMPL-TIED_LAYERED_CLIENT_INSTALL-pseudocode.md`; `tied/docs/citdp-policy.md` and `agent-req-implementation-checklist.yaml` (HEAD headers); `.cursor/mcp.json`, `.mcp.json` env; `.gitignore` (staged managed block; 103 `working/` lines); `tied/.tied-install.json`; git index/worktree state (`git status`, `git diff --cached`, `git ls-files`); `rg` counts as reported in §5 (commands: `rg -l` per pattern with exclusions `node_modules`, `**/dist/**`, `working/**`, `tied-project/citdp/**`, `CHANGELOG.md`, `docs/**`).

---

## 12. Implement gate (refine-plan output — do not enter without sponsor go)

- **Enter:** `/build-plan` or explicit sponsor approval after this refine pass; use Phase 8 command block unchanged.
- **Exit:** `plan-close-out` with CHANGELOG, envelope sync, and proposed commit message (no automatic git).
- **Not in scope:** a “Phase 9” — phases are **0–8** only; §9 above is **CITDP analysis**, materialized in `CITDP-REQ-TIED_TWO_FOLDER_LAYOUT.yaml`.
