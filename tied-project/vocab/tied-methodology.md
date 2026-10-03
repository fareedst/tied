# TIED methodology (canonical)

**Scope:** Core TIED layout, semantic tokens, registry atoms and distributed facets, module validation, bootstrap (`tied-install.sh`), methodology vs project YAML, agent operating guides, and `[PROC-*]` process token names used across this repository. **Vocabulary only** — file-copy mechanics and validation algorithms live in IMPL pseudo-code and [`../docs/processes.md`](../../tied-bundle/docs/processes.md).

**Traceability:** [REQ-TIED_SETUP](../requirements/REQ-TIED_SETUP.yaml) · [REQ-MODULE_VALIDATION](../requirements/REQ-MODULE_VALIDATION.yaml) · [ARCH-TIED_STRUCTURE](../architecture-decisions/ARCH-TIED_STRUCTURE.yaml) · [ARCH-MODULE_VALIDATION](../architecture-decisions/ARCH-MODULE_VALIDATION.yaml) · [IMPL-TIED_FILES](../implementation-decisions/IMPL-TIED_FILES.yaml) · [IMPL-MODULE_VALIDATION](../implementation-decisions/IMPL-MODULE_VALIDATION.yaml)

**See also:** [`routing.md`](routing.md) (the Vocab directory routing index / PRELOAD) · [`domain-references.md`](domain-references.md) (full catalog, on-demand) · [`tied-yaml-mcp.md`](tied-yaml-mcp.md) · [`pseudocode-and-citdp.md`](pseudocode-and-citdp.md) · [`../docs/vocabulary-index-analysis-and-standards.md`](../../tied-bundle/docs/vocabulary-index-analysis-and-standards.md)

---

## Preferred terms vs synonyms

| Preferred | Avoid in docs/code | Notes |
|-----------|-------------------|-------|
| **semantic token** | token string alone | Always `[REQ-*]`, `[ARCH-*]`, `[IMPL-*]`, or `[PROC-*]` in prose when naming the registry entry |
| **TIED base path** | workspace path, repo root | Absolute `tied-project/` directory used as the project data boundary; the client project root is its parent |
| **project YAML** | client YAML, root yaml | Writable REQ/ARCH/IMPL under `tied/` root (not `tied-bundle/`) |
| **methodology YAML** | template yaml, inherited yaml | Read-only under `tied-bundle/`; refreshed by `tied-install.sh` |
| **detail file** | sidecar yaml (for REQ/ARCH/IMPL index rows) | YAML under `tied-project/requirements/`, `tied-project/architecture-decisions/`, `tied-project/implementation-decisions/` |
| **usable detail path** | resolvable path, real detail path | A `detail_file` value that is a non-sentinel relative path to an on-disk YAML (or IMPL sidecar) under the inherited or project tree |
| **sentinel** | null string, tilde path, placeholder detail | Unusable `detail_file` values (`null`, `"null"`, `"~"`, whitespace) treated as absent, never as `with_detail_file` |
| **inherited detail** | copied detail, template detail (alone) | Methodology-owned detail artifact installed under `tied-bundle/` (or source `templates/`) by `tied-install.sh` |
| **methodology-first** | methodology then project | Read order: inherited methodology detail, then project fallback when the inherited path is absent or a **sentinel** |
| **project fallback** | client override read | Second-choice read of a project-owned detail file when methodology-first does not yield a **usable detail path** |
| **project-only writes** | write to methodology | MCP and agents mutate only project YAML; inherited methodology files remain read-only |
| **methodology consumption pattern** | delivery pattern (alone) | How a client obtains and protects inherited R+A+I at rest and at read time; compared in [REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY](../requirements/REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY.yaml) (near-term mechanical #4, strategic MCP virtualization #2) |
| **pseudo-code sidecar** | essence in index body | Plain Markdown `IMPL-*-pseudocode.md`; not YAML |
| **module validation** | unit testing (alone) | Independent validation before integration per [REQ-MODULE_VALIDATION](../requirements/REQ-MODULE_VALIDATION.yaml) |
| **binding inventory** | glue list, wiring notes (alone) | Table of trigger→callee→arguments→effect seams; see [`../docs/composition-coverage.md`](../../tied-bundle/docs/composition-coverage.md) |
| **composition evidence** | E2E covers wiring | UI-free composition/integration/contract test proving a binding before integration |
| **contract precision** | INPUT/OUTPUT only (for new Active blocks) | PRE/POST/EFFECTS required on new/changed Active procedure blocks; FAILURE_MODES/DATA_TRANSITION/TERMINATION when applicable |
| **Observing AI principles!** | (omit) | Mandatory session acknowledgment per [REQ-TIED_SETUP](../requirements/REQ-TIED_SETUP.yaml) |
| **yaml_tool** | yaml lint script, yq wrapper (alone) | Compatibility frontend for the shared **canonical YAML profile** in `scripts/yaml_tool.sh` per [PROC-YAML_EDIT_LOOP](../../tied-bundle/docs/processes.md) |
| **lint_yaml** | lint yaml (generic) | Backward-compatible wrapper; delegates to **yaml_tool** |
| **YAML canonicalization** | YAML normalization, pretty-printing | Deterministic transformation under profile `tied-yaml-canonical-v1`; recursively orders map keys, applies ordered-list exceptions, preserves scalar types, and keeps opaque text unchanged |
| **canonical YAML profile** | serializer policy, YAML format convention | The named `tied-yaml-canonical-v1` contract shared by TIED YAML MCP writers and compatibility frontends |
| **scalar style** | quote style, YAML wrapping | Repository policy selecting `unwrapped` or `wrapped` scalar emission for the shared canonical YAML serializer |
| **wrapped** | quoted YAML, double-quoted output | Scalar style that double-quotes string scalars only while preserving boolean, number, and null types |
| **unwrapped** | plain YAML, plain scalars | Default scalar style that emits strings plain when safe while preserving typed scalar values |
| **repository YAML style** | local YAML format, `tied-project/config.yaml` | Project-root `scalar_style` configuration that overrides global style fallbacks for lint and MCP writes |
| **ordered-list key** | protected list key, ordering field | A map key matching `order`, `order_*`, `*_order`, or `*_order_*`; all-string lists under these keys preserve their original order |
| **scalar-type preservation** | typed round trip, coercion after load | Boolean, number, null, and string scalar types remain their parsed types through canonicalization |
| **format metadata** | serializer metadata, format details | Stable `yaml_format` response object describing the active canonical YAML profile |
| **opaque text** | raw text, unparsed body | Block-scalar bodies and IMPL pseudo-code sidecars are preserved as text rather than recursively normalized |
| **unchanged path reporting** | zero-modification output, unchanged-file noise | Normal stdout omits a YAML path when no list group or map was modified |
| **modified path reporting** | changed-file summary, modification log | Normal stdout retains validation and modification summaries for paths changed by sorting |
| **case-insensitive-primary ordering** | case-insensitive sort, downcase-only sort | Locale-independent ordering that compares Unicode-lowercased values before applying the original-value tie-break |
| **original-value tie-break** | stable sort alone, case-folded equality | Case-sensitive lexical comparison of original values when their lowercased forms are equal |
| **recursive key sort (canonicalization)** | default `--sort-keys`, key sort via Ruby only | Case-insensitive-primary, locale-independent lexical ordering with original-value tie-breaking for map keys at every nested map level under the canonical YAML profile |
| **qualifying list group** | yaml list, bullet group | 2+ consecutive lines with same indent, each starting with `- `; sortable by **yaml_list_sorter** using case-insensitive-primary, locale-independent lexical ordering with original-value tie-breaking, except when the owning map key matches an ordered-list key |
| **recognized record list** | schema record array, mapping-record list | Mapping array under a **record-list registry** parent key; map items with a configured sort field sort as whole blocks; string shorthand items sort in tier 0 |
| **record-list registry** | record list keys, schema-backed list registry | Normative table in `[ARCH-TIED_YAML_CANONICAL_PROFILE]`: `satisfaction_criteria` → `criterion`; `validation_criteria` → `method`; `alternatives_considered` → `name`; `files` → `description`, `path`; `functions` → `description`, `name`; `risks` → `description`, `mitigation` |
| **heterogeneous list tier** | tier-0/tier-1 list sort, mixed list ordering | Canonical list policy: tier 0 (strings, arrays, keyless maps) precede tier 1 (maps with registry or heuristic sort field); each tier sorted by `fieldName.fieldValue` using case-insensitive-primary ordering |
| **whole-block sorting** | atomic record sort, block-preserving list sort | Ruby `--sort-lists` moves entire list-item blocks—including continuation lines for optional fields—as atomic units |
| **record_list_rule** | record list metadata | Stable `yaml_format` field describing recognized mapping-record list sorting policy |
| **sort map keys** | hash key sort, key normalization | Canonicalization recursively orders map keys; compatibility `--sort-keys` remains accepted by the sorter frontend; block-scalar bodies stay opaque |
| **yaml_semantic_compare** | YAML equality check, deep YAML diff (alone) | Library: `scripts/yaml_semantic_compare.rb`; compares loaded YAML values (key order ignored; optional unordered arrays); used by **yaml_list_sorter** post-sort validation |
| **compare_yaml_dirs** | directory YAML diff, recursive yaml compare | CLI: `scripts/compare_yaml_dirs.rb LEFT_DIR RIGHT_DIR`; relative-path pairing; reports missing files and semantic differences |
| **routing.md** / **routing index** | `domain-references-routing.md`, bootstrap via full catalog | Source methodology PRELOAD entry; in clients, `tied-project/vocab/routing.md` dispatches to the refreshable `tied-bundle/vocab/routing.md` and the client glossary table |
| **methodology migration** | client upgrade, methodology refresh (alone) | Controlled refresh of inherited methodology content that preserves project YAML and client-owned documentation |
| **client refresh** | rerun bootstrap (alone) | A `tied-install.sh` execution against an existing client project |
| **TIED project root** | tied-db folder, project store path (alone) | Committed **`tied-project/`** traceability tree (`TIED_BASE_PATH`); informal **tied-db** = YAML indexes + detail + sidecars only — [REQ-TIED_TWO_FOLDER_LAYOUT](../requirements/REQ-TIED_TWO_FOLDER_LAYOUT.yaml) |
| **TIED bundle root** | methodology folder, local bundle (alone) | Gitignored **`tied-bundle/`** (flattened methodology indexes, docs, templates, `install.json`, local **working/**) — [REQ-TIED_TWO_FOLDER_LAYOUT](../requirements/REQ-TIED_TWO_FOLDER_LAYOUT.yaml) |
| **committed working root** | committed working folder (alone) | **`tied-project/working/`** — PLAN, tracker, envelope, slug evidence md, handoffs; never gitignored — [REQ-TIED_WORKING_ARTIFACT_PLACEMENT](../requirements/REQ-TIED_WORKING_ARTIFACT_PLACEMENT.yaml) |
| **local working root** | local working folder (alone) | **`tied-bundle/working/`** — gates, ledgers, inquiry, adherence, JEV; gitignored in clients — [REQ-TIED_WORKING_ARTIFACT_PLACEMENT](../requirements/REQ-TIED_WORKING_ARTIFACT_PLACEMENT.yaml) |
| **process evidence facet** | working evidence (alone) | Committed working artifacts explaining *why* (not a second product spec) — [working-artifact-placement.md](../../tied-bundle/docs/working-artifact-placement.md) |
| **ephemeral artifact** | temporary file (alone) | Safe to delete; no audit value — local working, tooling scratch, or OS temp — [REQ-TIED_WORKING_ARTIFACT_PLACEMENT](../requirements/REQ-TIED_WORKING_ARTIFACT_PLACEMENT.yaml) |
| **tooling scratch root** | MCP scratch (alone) | Paths such as `mcp-server/working/`, `TIED_TEST_ROOT/` — see [working-artifact-placement.md](../../tied-bundle/docs/working-artifact-placement.md) |
| **two-folder invariant** | dual tree layout (alone) | After install/migrate: **`tied-project/`** committed, **`tied-bundle/`** ignored; **no** top-level legacy **`tied/`** — SC-TFL-NO-LEGACY-TIED-DIR |
| **layout migration** | migrate-layout (alone) | `tied-install --migrate-layout` (brownfield hard cut; idempotent) — [REQ-TIED_TWO_FOLDER_LAYOUT](../requirements/REQ-TIED_TWO_FOLDER_LAYOUT.yaml) |
| **self-install guard** | store self-install (alone) | Installer refuses `projectRoot === storeRoot` unless explicit allow — SELF_INSTALL_REFUSED |
| **layered installer** | tied-install, install layers (alone) | `tied-install.sh` / `install-layers.mjs` — capability layers (`db`, `mcp`, `skills`, `methodology`) with **`install mode`** `linked` (default stubs) or `full` (gitignored copies); sole install path after [REQ-TIED_TWO_FOLDER_LAYOUT](../requirements/REQ-TIED_TWO_FOLDER_LAYOUT.yaml) — [REQ-TIED_LAYERED_CLIENT_INSTALL](../requirements/REQ-TIED_LAYERED_CLIENT_INSTALL.yaml) |
| **install mode** | linked mode, full mode (alone) | `linked`: store-path stubs + MCP bundle env; `full`: offline materialized tree (gitignored); see **`install manifest`** at `tied/.tied-install.json` |
| **install dispatch** | installer dispatcher, unified install entry | `tools/bootstrap/tied-install-dispatch.mjs` — resolves CLI `tied install` vs `install-layers.mjs`; [IMPL-TIED_LAYERED_CLIENT_INSTALL](../implementation-decisions/IMPL-TIED_LAYERED_CLIENT_INSTALL.yaml) block **RUN_TIED_INSTALL_ENTRYPOINT** |
| **install shell shim** | installer wrapper | Thin `.sh` / `.cmd` / `.ps1` that probes Node and delegates to one Node script (no bootstrap logic) |
| **PowerShell shim** | ps1 wrapper | `.ps1` install shell shim: `$PSScriptRoot`, `Get-Command node`, `@args`, `exit $LASTEXITCODE` |
| **Windows install entry points** | windows bash and powershell | Git Bash `tied-install.sh`, CMD `tied-install.cmd`, PowerShell `tied-install.ps1` → **install dispatch** |
| **no-MCP skill surface** | skill surface without IDE MCP (alone) | Harness-local `SKILL.md` stubs + `tied-cli.sh` stdio path when IDE MCP is absent — layered linked install acceptance criterion |
| **client refresh parity gate** | methodology parity check, post-refresh verify | Node gate after bootstrap verify* (`verifyMethodologyPseudocodeTokenRefs`); compares TIED source `templates/` to client `tied-bundle/` (sha256 default, optional `--semantic-yaml-compare`) and hash-compares `DOCS_TO_COPY` docs; JSON `client-refresh-parity-report.v1`; distinct from G4 grammar audit — [REQ-TIED_CLIENT_REFRESH_PARITY](../requirements/REQ-TIED_CLIENT_REFRESH_PARITY.yaml) |
| **doc drift report** | preserved docs queue, DOCS_TO_COPY mismatch | Parity B section of the parity gate report listing client `tied-bundle/docs/` entries classified `drifted` vs source while copy-when-missing policy kept the client copy authoritative (default bootstrap exit 0 unless `--strict-refresh`) |
| **inherited methodology snapshot** | copied methodology, stale methodology | The exact current template-derived contents of `tied-bundle/`, refreshed as an inherited read-only tree |
| **promoted quality record** | quality template, copied quality YAML | A quality REQ/ARCH/IMPL detail record installed into the inherited methodology view from canonical templates |
| **vocabulary merge mode** | overwrite vocab, vocab sync (alone) | `tied-install.sh --merge-vocab` refresh behavior that replaces methodology vocabulary while preserving client glossaries |
| **vocabulary index validator** | vocab lint script, glossary checker | Layer-aware structural gate that checks methodology and client routing/catalog membership, glossary markers, links, and alphabetical-index definitions |
| **vocabulary layer** | glossary-only documentation, terminology notes (alone) | Agent-control layer that resolves, preloads, records, and validates canonical domain terms across the TIED workflow; sponsor/agent/reviewer roles defined in [`sponsor-agent-relationship.md`](sponsor-agent-relationship.md) |
| **agent-control layer** | agent guidance (alone), vocabulary policy (alone) | Peer control layer alongside semantic tokens and IMPL pseudo-code; owned by `[PROC-VOCABULARY_INDEX]`; sponsor/agent/reviewer roles defined in [`sponsor-agent-relationship.md`](sponsor-agent-relationship.md) |
| **managed bootstrap artifact** | copied file, installed file (alone) | Canonical client artifact refreshed by `tied-install.sh` and checked for client edits before replacement |
| **copy timestamp normalization** | artificial timestamp, fixed copy time | Apply the source item's local calendar-date midnight only to the managed client copy after `cp -p`/`cp -pR`; source mtimes remain unchanged |
| **CURSOR_CLI_NAME** | Cursor agent CLI basename (alone) | Env var for `resolveCursorAgentCli` during **new-tied-client** MCP enable; default **`agent`**; probe order preferred → `agent` → `cursor`; superseded by **TIED_CURSOR_AGENT_CMD** when set |
| **client-modification warning** | refresh warning (alone) | Diagnostic emitted when an existing managed destination mtime is not truncated to local calendar-date midnight |
| **Windows bootstrap entry point** | copy_files.bat, Windows shell script (alone) | `tied-install.cmd` at TIED repo root; PATHEXT resolves `copy_files` for neighboring client repos |
| **coordinator guide** | DAE mechanisms doc (alone), comparison backlog | Full-project status/anti-pattern guide under `docs/comparisons/dae-mechanisms-for-tied-improvement.md`; executable waves live in the **linked plan** — [REQ-TIED_DAE_INCORPORATION](../requirements/REQ-TIED_DAE_INCORPORATION.yaml) |
| **DAE incorporation wave** | DAE phase, engineer checkpoint (alone) | One of Waves 0–5 in the DAE→TIED linked plan; entered via `build-plan` with slice contracts |
| **gate check** | Step 0 script, dae_handoff (alone) | `tied gate check` CLI composing `tied_checklist_gate_validate` into a single exit code — Wave 1a |
| **tied next** | /engineer.next (alone) | `tied next` CLI recommending one checklist slug + open REQ tokens — Wave 1b |
| **handoff-shaped phase YAML** | DAE handoff frontmatter (alone) | Additive `working/{REQ}/handoffs/{phase}.yaml` criterion evidence; does not replace request-evidence envelope |
| **four-way closure join** | AC↔Gherkin join (alone) | Mechanical report: REQ criteria ↔ IMPL blocks ↔ tests ↔ code block-leads — Wave 3a |
| **pseudocode leakage lint** | spec-guardian (alone) | Lint pass flagging host syntax/SQL/paths in `essence_pseudocode` unless DATA / leakage-ok — Wave 2b |
| **express lane** | XS one-pass (alone) | CITDP `size: XS` + `express_lane` with charter safety override — Wave 2c |
| **build-plan readiness** | execution backlog (alone) | PLAN section listing per-wave prerequisites, first RED test paths, fixtures, and single-REQ multi-wave policy before `build-plan` |
| **diff-scoped change-risk report** | diff-scoped CRAP, CRAP score, complexity gate (alone); bare **CRAP** in sponsor/UI prose | Optional report on changed paths combining complexity and coverage metadata; block at `verification-gate` or warn at `traceable-commit` when CITDP `diff_scoped_crap: true` (default off) — Wave 2d. Upstream alias: DAE CP7 / `crap-analyzer` (Change Risk Anti-Pattern metric). Stable machine ids: `diff_scoped_crap`, `crap_threshold`, schema `diff-scoped-crap.v1`. |
| **agentstream gate preflight** | DAE Step 0 hook (alone) | Optional post-`tiedpreflight` call to `tied gate check` before first agentstream turn when env/manifest opt-in — W1 tail |
| **unified TIED toolchain** | single-language tools (alone) | Developer/operator suite (MCP, agentstream, bootstrap, YAML CLIs) targeting one primary language; traceability [REQ-TIED_UNIFIED_TOOLCHAIN] |
| **deferred push (toolchain)** | unpushed commits (alone) | Sponsor policy to keep local commits until Phase 3b strangler complete (slices 2a–2d) before first `git push`; [REQ-TIED_UNIFIED_TOOLCHAIN] PLAN 2026-09-22 |
| **strangler slice order** | migration phase order (alone) | Phase 3b port sequence 2a executor dry-run → 2b pipeline → 2c checklist render → 2d adherence; sponsor-confirmed [REQ-TIED_UNIFIED_TOOLCHAIN] |
| **shared bootstrap engine** | Node copy script (alone) | `tools/bootstrap/` Node implementation of BOOTSTRAP_TIED; sole bootstrap logic owner |
| **bootstrap manifest** | inline bash arrays (alone) | `tools/bootstrap/manifest.json` single source for DOCS_TO_COPY, skill dirs, verify lists |
| **windows_copy_proven_in_ci** | Windows symlink unlock, CI copy proof flag | Boolean gate on `installClaudeSkills` (`skills.mjs`): Unix symlink opt-in throws `SYMLINK_WITHOUT_CI_WINDOWS_PROOF` until Windows CI proves `.claude/skills/` copy path. Flip only after smoke asserts Claude artifacts. Owner: [REQ-TIED_CLAUDE_BOOTSTRAP_OPS](../requirements/REQ-TIED_CLAUDE_BOOTSTRAP_OPS.yaml). |
| **skills/ re-root** | shared skills folder, dual-harness skills root | Optional Phase-3-style relocate of managed skills to repo-root `skills/` for both harnesses; ship only after Windows copy proof and ARCH decision. Owner: [REQ-TIED_CLAUDE_BOOTSTRAP_OPS](../requirements/REQ-TIED_CLAUDE_BOOTSTRAP_OPS.yaml) (slice B3; default off). |
| **disposable TIED client** | throwaway demo project (alone) | Timestamped bootstrapped client under `TIED_TEST_ROOT/<unix-seconds>` for smoke and feature demos |
| **new-tied-client** | make client script (alone) | Windows `scripts/new-tied-client.cmd` or Node `tools/bootstrap/new-tied-client.mjs`; explicit client directory pipeline |
| **test-new-tied-client** | disposable client alias (alone) | Windows `scripts/test-new-tied-client.cmd`; creates disposable client via `CREATE_DISPOSABLE_TIED_CLIENT` |
| **full-tools bootstrap** | `--full-tools` (alone) | Optional bootstrap flag alias for Jev plan-skills repo config, DAE CRAP starter threshold, and BBCE `tied/analysis/` starter files; does not install secrets or change G4 audit |
| **tool use profile** | bootstrap tool flags (alone) | Parsed `{ jev, dae, bbce, forceToolConfig }` from CLI/env; applied create-only on `tied-project/config.yaml` unless `--force-tool-config` merges tool keys only |
| **registry atom** | source of truth file (alone), canonical record (alone) | Authoritative obligation or term: token detail YAML, `semantic-tokens.yaml` row + detail, `(canonical)` glossary definition, merged `essence_pseudocode` for an IMPL, `[PROC-*]` in `processes.md` |
| **distributed facet** | duplicate spec (alone), miniature copy (alone) | Non-authoritative expression that must align with registry atoms: traceability lists, code/test token comments, literal block leads, index rows, working-folder evidence — not a second full spec of the product |
| **atomized traceability graph** | holographic model (alone), whole-in-every-file (alone) | Countable nodes (tokens, blocks) and explicit edges; rationality and completeness are **graph closure** via `[PROC-TOKEN_VALIDATION]` and `[PROC-LEAP]`, not reconstruction from one file |
| **registry atoms with distributed facets** | holographic TIED (alone) | Authoring view: mint or edit atoms; echoes (facets) spread across YAML, tests, code, and working artifacts |
| **declared facet** | paper traceability (alone) | Planned alignment in YAML (`traceability`, `code_locations`, `code_annotations`, `token_coverage`) |
| **materialized facet** | grep target (alone) | On-disk alignment in managed code, tests, and literal pseudo-code block leads |
| **three-way alignment** | two-way sync (alone) | IMPL pseudo-code block ↔ test ↔ production code share the same block lead and token set per `[PROC-IMPL_CODE_TEST_SYNC]` |

---

## Registry atoms and distributed facets

TIED keeps product integrity **without** making every file a **miniature copy of the whole system**. Obligations are **registry atoms**; partial views that point at or repeat atoms are **distributed facets**. Coherence is **graph closure** (validation + LEAP), not holographic redundancy.

### Registry atoms (edit here)

| Atom kind | Storage |
|-----------|---------|
| Semantic token registry + detail | `semantic-tokens.yaml`; `requirements/`, `architecture-decisions/`, `implementation-decisions/*.yaml` |
| IMPL logic record | `IMPL-*-pseudocode.md` (merged as `essence_pseudocode`) |
| Preferred domain term | `(canonical)` glossary body under `tied-project/vocab/` (methodology) or client `tied-project/vocab/` |
| Process law | `[PROC-*]` definitions in [`../docs/processes.md`](../../tied-bundle/docs/processes.md) |

### Facet types (align with atoms)

Facets are **vocabulary labels** for artifact roles TIED creates or maintains; they are not a separate schema enum.

| Facet role | Examples |
|------------|----------|
| **Graph facets** | `traceability.*`, `cross_references`, `related_requirements`, `related_decisions`, `code_locations`, `token_coverage` on REQ/ARCH/IMPL detail ([`../docs/detail-files-schema.md`](../../tied-bundle/docs/detail-files-schema.md)) |
| **Index facets** | Summary rows in `requirements.yaml`, `architecture-decisions.yaml`, `implementation-decisions.yaml` (`detail_file` pointer) |
| **Literal-copy facets** | Pseudo-code block token comments (`[PROC-IMPL_PSEUDOCODE_TOKENS]`); block leads copied into tests and managed code ([`../docs/pseudocode-writing-and-validation.md`](../../tied-bundle/docs/pseudocode-writing-and-validation.md)) |
| **Executable facets** | Managed-code `[IMPL-*] [ARCH-*] [REQ-*]` comments; test names/sections carrying REQ tokens (`[PROC-TOKEN_AUDIT]`) |
| **Vocabulary facets** | Glossary traceability blocks, naming bridges, cross-links, `routing.md` keyword rows (dispatch only) |
| **Workflow facets** | CITDP records, `working/{REQ-*}/` checklist and evidence, `agent-preload-contract.yaml`; non-canonical LEAP proposals until promoted ([`leap-proposal-queue.md`](leap-proposal-queue.md)) |
| **Proof facets** | `validation_evidence`, gate receipts, consistency/lint outputs, request-evidence envelopes |

**Declared vs materialized:** YAML traceability and `code_annotations` declare intent; code, tests, and block leads materialize it. Close-out checklist steps reconcile both ([`../docs/agent-req-implementation-checklist.yaml`](../../tied-bundle/docs/agent-req-implementation-checklist.yaml) — `three-way-alignment-unit`, `verification-gate`).

### Two lenses on the same discipline

| Lens | Use when |
|------|----------|
| **Registry atoms with distributed facets** | Authoring: add one REQ at a time; edit detail files and sidecars; spread aligned echoes |
| **Atomized traceability graph** | Judging rationality and completeness: impact, cross-REQ links, `tied_validate_consistency`, satisfaction gates |

Incremental human workflow: specify **atoms** in sequence; stay satisfied when the **graph** closes, not when every file grows into a full product spec.

**Process tokens:** `[PROC-TOKEN_VALIDATION]`, `[PROC-LEAP]`, `[PROC-IMPL_CODE_TEST_SYNC]`, `[PROC-VOCABULARY_INDEX]`. Outreach: [`../docs/vocabulary-layer-tied-leap-citdp.md`](../../tied-bundle/docs/vocabulary-layer-tied-leap-citdp.md).

---

## Naming bridge: TIED layout

| Canonical concept | Doc label | Storage path | CLI/env | TIED token |
|-------------------|-----------|--------------|---------|------------|
| TIED project root | TIED base | `tied-project/` | `TIED_BASE_PATH` (absolute) | [REQ-TIED_SETUP](../requirements/REQ-TIED_SETUP.yaml) |
| Requirements index | requirements index | `tied-project/requirements.yaml` | `yaml_index_*` index=`requirements` | [REQ-TIED_SETUP](../requirements/REQ-TIED_SETUP.yaml) |
| Architecture index | architecture index | `tied-project/architecture-decisions.yaml` | index=`architecture` | [ARCH-TIED_STRUCTURE](../architecture-decisions/ARCH-TIED_STRUCTURE.yaml) |
| Implementation index | implementation index | `tied-project/implementation-decisions.yaml` | index=`implementation` | [IMPL-TIED_FILES](../implementation-decisions/IMPL-TIED_FILES.yaml) |
| Token registry | semantic tokens | `tied-project/semantic-tokens.yaml` | index=`semantic-tokens` | [REQ-TIED_SETUP](../requirements/REQ-TIED_SETUP.yaml) |
| Methodology merge view | merged TIED view | read via MCP resources | `tied://requirements` etc. | [PROC-TIED_METHODOLOGY_READONLY](../../tied-bundle/docs/processes.md) |
| Agent operating guide | AGENTS | `AGENTS.md` | — | [REQ-TIED_SETUP](../requirements/REQ-TIED_SETUP.yaml) |
| Repository YAML style config | repository YAML style file | `tied-project/config.yaml` at client project root | create-if-absent bootstrap from `templates/tied-project/config.yaml` | [REQ-TIED_YAML_STYLE_CONFIGURATION](../requirements/REQ-TIED_YAML_STYLE_CONFIGURATION.yaml) |
| Client development index | core seven | `tied-bundle/docs/client-development-index.md` | minimal CITDP+LEAP+TIED doc set, including domain vocabulary | [PROC-AGENT_REQ_CHECKLIST](../../tied-bundle/docs/processes.md) |
| Bootstrap script | copy_files | `tied-install.sh` / `tied-install.cmd` | `./tied-install.sh` or `..\tied\copy_files` | [IMPL-TIED_FILES](../implementation-decisions/IMPL-TIED_FILES.yaml) |
| Windows bootstrap entry point | tied-install.cmd | `tied-install.cmd` | PATHEXT `copy_files` from sibling checkout | [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM](../architecture-decisions/ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM.yaml) |
| Shared bootstrap engine | Node bootstrap | `tools/bootstrap/` | `node tools/bootstrap/copy-files.mjs` | [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM](../architecture-decisions/ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM.yaml) |
| Bootstrap manifest | manifest.json | `tools/bootstrap/manifest.json` | read at engine startup | [IMPL-TIED_FILES](../implementation-decisions/IMPL-TIED_FILES.yaml) |
| Prompt-type skill installation | managed bootstrap artifact | `.cursor/skills/<prompt-type>/SKILL.md` | source-date midnight + pre-refresh warning | [REQ-PROMPT_TYPE_GLOBAL_SKILLS](../requirements/REQ-PROMPT_TYPE_GLOBAL_SKILLS.yaml) |
| Prompt-type Task wrapper (TIED source) | TIED-source development artifact | `.cursor/agents/<prompt-type>.md` | static contract tests only; not installed into clients | [REQ-PROMPT_TYPE_SUBAGENT](../requirements/REQ-PROMPT_TYPE_SUBAGENT.yaml) |
| Copy timestamp normalization | copy timestamp normalization | managed bootstrap paths | source-date local midnight | [IMPL-TIED_FILES](../implementation-decisions/IMPL-TIED_FILES.yaml) |
| Client-modification warning | client-modification warning | `tied-install.sh` diagnostics | `Client-modified managed copy detected` for non-midnight mtime | [IMPL-TIED_FILES](../implementation-decisions/IMPL-TIED_FILES.yaml) |
| Methodology migration guide | migration guide | `tied-bundle/docs/methodology-migration.md` | Existing-client upgrade procedure | [REQ-TIED_SETUP](../requirements/REQ-TIED_SETUP.yaml) |
| Vocabulary merge mode | copy-missing-vocab | `tied-install.sh --merge-vocab` | Additive vocabulary installation | [IMPL-TIED_FILES](../implementation-decisions/IMPL-TIED_FILES.yaml) |
| Client domain vocabulary index | client vocab index | `tied-project/vocab/*.md` | checklist `VOCAB_INDEX` | [PROC-VOCABULARY_INDEX](../../tied-bundle/docs/processes.md) |
| Client vocab routing handoff | routing handoff | `tied-project/vocab/routing.md` | PRELOAD dispatch entry | [PROC-VOCABULARY_INDEX](../../tied-bundle/docs/processes.md) |
| Methodology vocab routing index | methodology routing index | `tied-bundle/vocab/routing.md` | PRELOAD TIED route | [PROC-VOCABULARY_INDEX](../../tied-bundle/docs/processes.md) |
| Domain vocabulary full catalogs | full catalogs | matching `domain-references.md` in each layer | on-demand cross-topic / Priority table | [PROC-VOCABULARY_INDEX](../../tied-bundle/docs/processes.md) |
| Vocabulary control layer | vocabulary layer / agent-control layer | both vocabulary trees plus checklist touchpoints | RESOLVE / PRELOAD / RECORD / VALIDATE | [PROC-VOCABULARY_INDEX](../../tied-bundle/docs/processes.md) |
| Per-request checklist copy | working folder checklist | `<working_folder>/REQ-*_<timestamp>.yaml` | — | [PROC-AGENT_REQ_CHECKLIST](../../tied-bundle/docs/processes.md) |
| Composition coverage guide | binding inventory / E2E exclusion | `tied-bundle/docs/composition-coverage.md` | checklist `composition-integration` | [REQ-MODULE_VALIDATION](../requirements/REQ-MODULE_VALIDATION.yaml) |
| YAML canonicalization | canonical YAML profile | `scripts/yaml_tool.sh` and TIED YAML MCP | `tied-yaml-canonical-v1`; compatibility flags retained | [REQ-TIED_YAML_CANONICALIZATION](../requirements/REQ-TIED_YAML_CANONICALIZATION.yaml) |
| Format metadata | yaml_format | MCP write responses | profile id, scalar style, style source, key ordering, ordered-list pattern, string-list rule, scalar and opaque-text policy | [REQ-TIED_YAML_STYLE_CONFIGURATION](../requirements/REQ-TIED_YAML_STYLE_CONFIGURATION.yaml) |
| YAML lint wrapper | lint_yaml | `scripts/lint_yaml.sh` | delegates to yaml_tool | [PROC-YAML_EDIT_LOOP](../../tied-bundle/docs/processes.md) |
| List group sorter | yaml_list_sorter | `scripts/yaml_list_sorter.rb` | `--sort-keys` optional; invoked by yaml_tool `--sort-lists`; post-sort **yaml_semantic_compare** | [PROC-YAML_EDIT_LOOP](../../tied-bundle/docs/processes.md) |
| Semantic YAML compare | yaml_semantic_compare | `scripts/yaml_semantic_compare.rb` | library + `YamlSemanticCompare.compare` | [PROC-YAML_EDIT_LOOP](../../tied-bundle/docs/processes.md) |
| YAML directory compare | compare_yaml_dirs | `scripts/compare_yaml_dirs.rb` | `LEFT_DIR RIGHT_DIR`; `--unordered-arrays`; `--[no-]missing` | [PROC-YAML_EDIT_LOOP](../../tied-bundle/docs/processes.md) |

---

## Core `[PROC-*]` process names (catalog)

Exact spellings for checklist and docs cross-reference:

| Token | Purpose |
|-------|---------|
| `[PROC-AGENT_REQ_CHECKLIST]` | Primary implementation checklist |
| `[PROC-CITDP]` | Change impact and test design |
| `[PROC-TIED_DEV_CYCLE]` | Session workflow: tests → TDD → glue → E2E |
| `[PROC-IMPL_CODE_TEST_SYNC]` | Three-way alignment IMPL ↔ tests ↔ code |
| `[PROC-LEAP]` | Logic elevation and propagation |
| `[PROC-YAML_EDIT_LOOP]` | Safe YAML edit + **yaml_tool** (lint_yaml wrapper) |
| `[PROC-IMPL_PSEUDOCODE_TOKENS]` | Block comment rules in essence_pseudocode |
| `[PROC-PSEUDOCODE_VALIDATION]` | Pseudo-code validation gates |
| `[PROC-TOKEN_AUDIT]` | Token audit in code/tests |
| `[PROC-TOKEN_VALIDATION]` | Registry + consistency validation |
| `[PROC-TEST_STRATEGY]` | Coverage and E2E justification |
| `[PROC-COMMIT_MESSAGES]` | Traceable commit format |
| `[PROC-VOCABULARY_INDEX]` | Domain vocabulary discipline (`tied-project/vocab/`) |
| `[PROC-TIED_METHODOLOGY_READONLY]` | Do not write `tied-bundle/` |
| `[PROC-YAML_DB_OPERATIONS]` | MCP YAML CRUD patterns |
| `[PROC-TIED_VERIFICATION_GATED]` | Status derived from `tied_verify` |

---

## Semantic token prefixes (this project)

| Prefix | Domain glossary |
|--------|-----------------|
| `REQ-TIED_*`, `REQ-MODULE_*` | This file |
| `REQ-GOAGENT-*` | [`agentstream.md`](agentstream.md) |
| `REQ-ATDD-*` | [`agent-stream-ruby.md`](agent-stream-ruby.md) |
| `REQ-FEEDBACK_*` | [`feedback-to-tied.md`](feedback-to-tied.md) |
| `REQ-LEAP_*` | [`leap-proposal-queue.md`](leap-proposal-queue.md) |
| `REQ-CONFIG_*` | [`config-discovery.md`](config-discovery.md) |

---

## Pseudo-code block names

| Preferred term | UPPER_SNAKE block | Owning IMPL |
|----------------|-------------------|-------------|
| module validation lifecycle | `MODULE_VALIDATION_LIFECYCLE` | [IMPL-MODULE_VALIDATION](../implementation-decisions/IMPL-MODULE_VALIDATION.yaml) |
| composition binding validation | `COMPOSITION_BINDING_VALIDATION` | [IMPL-MODULE_VALIDATION](../implementation-decisions/IMPL-MODULE_VALIDATION.yaml) |
| TIED bootstrap | `BOOTSTRAP_TIED` | [IMPL-TIED_FILES](../implementation-decisions/IMPL-TIED_FILES.yaml) |
| TIED YAML skill installation | `INSTALL_TIED_YAML_SKILL` | [IMPL-TIED_FILES](../implementation-decisions/IMPL-TIED_FILES.yaml) |
| TIED CLI repository-root patch | `PATCH_TIED_CLI_REPO_ROOT` | [IMPL-TIED_FILES](../implementation-decisions/IMPL-TIED_FILES.yaml) |
| domain vocabulary seed | `SEED_DOMAIN_VOCAB` | [IMPL-TIED_FILES](../implementation-decisions/IMPL-TIED_FILES.yaml) |
| domain vocabulary merge | `MERGE_DOMAIN_VOCAB` | [IMPL-TIED_FILES](../implementation-decisions/IMPL-TIED_FILES.yaml) |
| implementation pseudo-code sidecar copy | `COPY_IMPLEMENTATION_PSEUDOCODE_SIDECARS` | [IMPL-TIED_FILES](../implementation-decisions/IMPL-TIED_FILES.yaml) |
| managed attribute-preserving copy | `COPY_WITH_ATTRIBUTES` | [IMPL-TIED_FILES](../implementation-decisions/IMPL-TIED_FILES.yaml) |
| source-date midnight calculation | `CALCULATE_SOURCE_DATE_MIDNIGHTS` | [IMPL-TIED_FILES](../implementation-decisions/IMPL-TIED_FILES.yaml) |
| copied timestamp normalization | `NORMALIZE_COPIED_PATH_TIMESTAMPS` | [IMPL-TIED_FILES](../implementation-decisions/IMPL-TIED_FILES.yaml) |
| client modification detection | `WARN_ON_MODIFIED_COPY_TARGET` | [IMPL-TIED_FILES](../implementation-decisions/IMPL-TIED_FILES.yaml) |
| YAML canonicalization | `CANONICALIZE_YAML_FILE` | [IMPL-TIED_FILES](../implementation-decisions/IMPL-TIED_FILES.yaml) |
| YAML path lint | `LINT_YAML_PATHS` | [IMPL-TIED_FILES](../implementation-decisions/IMPL-TIED_FILES.yaml) |
| typed YAML value canonicalization | `CANONICALIZE_YAML_VALUE` | [IMPL-TIED_YAML_CANONICALIZER](../implementation-decisions/IMPL-TIED_YAML_CANONICALIZER.yaml) |
| canonical text comparison | `COMPARE_CANONICAL_TEXT` | [IMPL-TIED_YAML_CANONICALIZER](../implementation-decisions/IMPL-TIED_YAML_CANONICALIZER.yaml) |
| YAML format metadata | `REPORT_YAML_FORMAT` | [IMPL-TIED_YAML_CANONICALIZER](../implementation-decisions/IMPL-TIED_YAML_CANONICALIZER.yaml) |
| atomic YAML write | `WRITE_CANONICAL_YAML_ATOMIC` | [IMPL-TIED_YAML_CANONICALIZER](../implementation-decisions/IMPL-TIED_YAML_CANONICALIZER.yaml) |

---

## Alphabetical index

| Term | Section |
|------|---------|
| AGENTS.md | Naming bridge |
| agent-control layer | Preferred terms |
| atomized traceability graph | Preferred terms; Registry atoms and distributed facets |
| declared facet | Preferred terms; Registry atoms and distributed facets |
| distributed facet | Preferred terms; Registry atoms and distributed facets |
| materialized facet | Preferred terms; Registry atoms and distributed facets |
| registry atom | Preferred terms; Registry atoms and distributed facets |
| three-way alignment | Preferred terms; Registry atoms and distributed facets |
| atomic YAML write | Pseudo-code block names |
| binding inventory | Preferred terms |
| canonical text comparison | Pseudo-code block names |
| canonical YAML profile | Preferred terms |
| case-insensitive-primary ordering | Preferred terms |
| client refresh | Preferred terms |
| client-modification warning | Preferred terms |
| coordinator guide | Preferred terms |
| copy timestamp normalization | Preferred terms |
| DAE incorporation wave | Preferred terms |
| diff-scoped change-risk report | Preferred terms |
| express lane | Preferred terms |
| four-way closure join | Preferred terms |
| gate check | Preferred terms |
| handoff-shaped phase YAML | Preferred terms |
| pseudocode leakage lint | Preferred terms |
| tied next | Preferred terms |
| CALCULATE_SOURCE_DATE_MIDNIGHTS | Pseudo-code block names |
| COPY_WITH_ATTRIBUTES | Pseudo-code block names |
| managed bootstrap artifact | Preferred terms |
| NORMALIZE_COPIED_PATH_TIMESTAMPS | Pseudo-code block names |
| WARN_ON_MODIFIED_COPY_TARGET | Pseudo-code block names |
| compare_yaml_dirs | Preferred terms |
| composition evidence | Preferred terms |
| composition-coverage.md | Naming bridge |
| contract precision | Preferred terms |
| tied-install.sh | Naming bridge |
| detail file | Preferred terms |
| domain-references.md | Naming bridge |
| full catalog | Naming bridge |
| format metadata | Preferred terms |
| inherited detail | Preferred terms |
| inherited methodology snapshot | Preferred terms |
| methodology-first | Preferred terms |
| lint_yaml | Preferred terms |
| methodology YAML | Preferred terms |
| methodology migration | Preferred terms |
| module validation | Preferred terms |
| Observing AI principles! | Preferred terms |
| promoted quality record | Preferred terms |
| PROC-AGENT_REQ_CHECKLIST | PROC catalog |
| PROC-VOCABULARY_INDEX | PROC catalog |
| project fallback | Preferred terms |
| project-only writes | Preferred terms |
| project YAML | Preferred terms |
| sentinel | Preferred terms |
| qualifying list group | Preferred terms |
| modified path reporting | Preferred terms |
| opaque text | Preferred terms |
| ordered-list key | Preferred terms |
| original-value tie-break | Preferred terms |
| routing index | Preferred terms |
| routing.md | Preferred terms |
| semantic token | Preferred terms |
| usable detail path | Preferred terms |
| unchanged path reporting | Preferred terms |
| scalar-type preservation | Preferred terms |
| sort map keys | Preferred terms |
| TIED base path | Naming bridge |
| tied-project/vocab | Naming bridge |
| VOCAB_INDEX | Naming bridge |
| Vocab directory routing index | Naming bridge |
| vocabulary merge mode | Preferred terms |
| vocabulary index validator | Preferred terms |
| vocabulary layer | Preferred terms |
| yaml_list_sorter | Naming bridge |
| yaml_semantic_compare | Preferred terms |
| yaml_tool | Preferred terms |
| YAML canonicalization | Preferred terms |
