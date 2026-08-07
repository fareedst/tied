# TIED methodology (canonical)

**Scope:** Core TIED layout, semantic tokens, module validation, bootstrap (`copy_files.sh`), methodology vs project YAML, agent operating guides, and `[PROC-*]` process token names used across this repository. **Vocabulary only** — file-copy mechanics and validation algorithms live in IMPL pseudo-code and [`../docs/processes.md`](../docs/processes.md).

**Traceability:** [REQ-TIED_SETUP](../requirements/REQ-TIED_SETUP.yaml) · [REQ-MODULE_VALIDATION](../requirements/REQ-MODULE_VALIDATION.yaml) · [ARCH-TIED_STRUCTURE](../architecture-decisions/ARCH-TIED_STRUCTURE.yaml) · [ARCH-MODULE_VALIDATION](../architecture-decisions/ARCH-MODULE_VALIDATION.yaml) · [IMPL-TIED_FILES](../implementation-decisions/IMPL-TIED_FILES.yaml) · [IMPL-MODULE_VALIDATION](../implementation-decisions/IMPL-MODULE_VALIDATION.yaml)

**See also:** [`routing.md`](routing.md) (primary entry / PRELOAD) · [`domain-references.md`](domain-references.md) (full catalog, on-demand) · [`tied-yaml-mcp.md`](tied-yaml-mcp.md) · [`pseudocode-and-citdp.md`](pseudocode-and-citdp.md) · [`../docs/vocabulary-index-analysis-and-standards.md`](../docs/vocabulary-index-analysis-and-standards.md)

---

## Preferred terms vs synonyms

| Preferred | Avoid in docs/code | Notes |
|-----------|-------------------|-------|
| **semantic token** | token string alone | Always `[REQ-*]`, `[ARCH-*]`, `[IMPL-*]`, or `[PROC-*]` in prose when naming the registry entry |
| **project YAML** | client YAML, root yaml | Writable REQ/ARCH/IMPL under `tied/` root (not `tied/methodology/`) |
| **methodology YAML** | template yaml, inherited yaml | Read-only under `tied/methodology/`; refreshed by `copy_files.sh` |
| **detail file** | sidecar yaml (for REQ/ARCH/IMPL index rows) | YAML under `tied/requirements/`, `tied/architecture-decisions/`, `tied/implementation-decisions/` |
| **pseudo-code sidecar** | essence in index body | Plain Markdown `IMPL-*-pseudocode.md`; not YAML |
| **module validation** | unit testing (alone) | Independent validation before integration per [REQ-MODULE_VALIDATION](../requirements/REQ-MODULE_VALIDATION.yaml) |
| **binding inventory** | glue list, wiring notes (alone) | Table of trigger→callee→arguments→effect seams; see [`../docs/composition-coverage.md`](../docs/composition-coverage.md) |
| **composition evidence** | E2E covers wiring | UI-free composition/integration/contract test proving a binding before integration |
| **contract precision** | INPUT/OUTPUT only (for new Active blocks) | PRE/POST/EFFECTS required on new/changed Active procedure blocks; FAILURE_MODES/DATA_TRANSITION/TERMINATION when applicable |
| **Observing AI principles!** | (omit) | Mandatory session acknowledgment per [REQ-TIED_SETUP](../requirements/REQ-TIED_SETUP.yaml) |
| **yaml_tool** | yaml lint script, yq wrapper (alone) | Compatibility frontend for the shared **canonical YAML profile** in `scripts/yaml_tool.sh` per [PROC-YAML_EDIT_LOOP](../docs/processes.md) |
| **lint_yaml** | lint yaml (generic) | Backward-compatible wrapper; delegates to **yaml_tool** |
| **YAML canonicalization** | YAML normalization, pretty-printing | Deterministic transformation under profile `tied-yaml-canonical-v1`; recursively orders map keys, applies ordered-list exceptions, preserves scalar types, and keeps opaque text unchanged |
| **canonical YAML profile** | serializer policy, YAML format convention | The named `tied-yaml-canonical-v1` contract shared by TIED YAML MCP writers and compatibility frontends |
| **scalar style** | quote style, YAML wrapping | Repository policy selecting `unwrapped` or `wrapped` scalar emission for the shared canonical YAML serializer |
| **wrapped** | quoted YAML, double-quoted output | Scalar style that double-quotes string scalars only while preserving boolean, number, and null types |
| **unwrapped** | plain YAML, plain scalars | Default scalar style that emits strings plain when safe while preserving typed scalar values |
| **repository YAML style** | local YAML format, `.tied-yaml.yaml` | Project-root `scalar_style` configuration that overrides global style fallbacks for lint and MCP writes |
| **ordered-list key** | protected list key, ordering field | A map key matching `order`, `order_*`, `*_order`, or `*_order_*`; all-string lists under these keys preserve their original order |
| **scalar-type preservation** | typed round trip, coercion after load | Boolean, number, null, and string scalar types remain their parsed types through canonicalization |
| **format metadata** | serializer metadata, format details | Stable `yaml_format` response object describing the active canonical YAML profile |
| **opaque text** | raw text, unparsed body | Block-scalar bodies and IMPL pseudo-code sidecars are preserved as text rather than recursively normalized |
| **recursive key sort (canonicalization)** | default `--sort-keys`, key sort via Ruby only | Locale-independent lexical ordering of map keys at every nested map level under the canonical YAML profile |
| **qualifying list group** | yaml list, bullet group | 2+ consecutive lines with same indent, each starting with `- `; sortable by **yaml_list_sorter**, except when the owning map key matches an ordered-list key |
| **sort map keys** | hash key sort, key normalization | Canonicalization recursively orders map keys; compatibility `--sort-keys` remains accepted by the sorter frontend; block-scalar bodies stay opaque |
| **yaml_semantic_compare** | YAML equality check, deep YAML diff (alone) | Library: `scripts/yaml_semantic_compare.rb`; compares loaded YAML values (key order ignored; optional unordered arrays); used by **yaml_list_sorter** post-sort validation |
| **compare_yaml_dirs** | directory YAML diff, recursive yaml compare | CLI: `scripts/compare_yaml_dirs.rb LEFT_DIR RIGHT_DIR`; relative-path pairing; reports missing files and semantic differences |
| **routing.md** / **routing index** | `domain-references-routing.md`, bootstrap via full catalog | Primary `tied/vocab/` PRELOAD entry; keyword → glossary table. Full catalog remains [`domain-references.md`](domain-references.md) (on-demand) |
| **methodology migration** | client upgrade, methodology refresh (alone) | Controlled refresh of inherited methodology content that preserves project YAML and client-owned documentation |
| **client refresh** | rerun bootstrap (alone) | A `copy_files.sh` execution against an existing client project |
| **inherited methodology snapshot** | copied methodology, stale methodology | The exact current template-derived contents of `tied/methodology/`, refreshed as an inherited read-only tree |
| **promoted quality record** | quality template, copied quality YAML | A quality REQ/ARCH/IMPL detail record installed into the inherited methodology view from canonical templates |
| **vocabulary merge mode** | overwrite vocab, vocab sync (alone) | Additive `copy_files.sh --merge-vocab` behavior that copies absent glossary files without replacing existing client files |
| **vocabulary layer** | glossary-only documentation, terminology notes (alone) | Agent-control layer that resolves, preloads, records, and validates canonical domain terms across the TIED workflow |
| **agent-control layer** | agent guidance (alone), vocabulary policy (alone) | Peer control layer alongside semantic tokens and IMPL pseudo-code; owned by `[PROC-VOCABULARY_INDEX]` |

---

## Naming bridge: TIED layout

| Canonical concept | Doc label | Storage path | CLI/env | TIED token |
|-------------------|-----------|--------------|---------|------------|
| TIED project root | TIED base | `tied/` | `TIED_BASE_PATH` (absolute) | [REQ-TIED_SETUP](../requirements/REQ-TIED_SETUP.yaml) |
| Requirements index | requirements index | `tied/requirements.yaml` | `yaml_index_*` index=`requirements` | [REQ-TIED_SETUP](../requirements/REQ-TIED_SETUP.yaml) |
| Architecture index | architecture index | `tied/architecture-decisions.yaml` | index=`architecture` | [ARCH-TIED_STRUCTURE](../architecture-decisions/ARCH-TIED_STRUCTURE.yaml) |
| Implementation index | implementation index | `tied/implementation-decisions.yaml` | index=`implementation` | [IMPL-TIED_FILES](../implementation-decisions/IMPL-TIED_FILES.yaml) |
| Token registry | semantic tokens | `tied/semantic-tokens.yaml` | index=`semantic-tokens` | [REQ-TIED_SETUP](../requirements/REQ-TIED_SETUP.yaml) |
| Methodology merge view | merged TIED view | read via MCP resources | `tied://requirements` etc. | [PROC-TIED_METHODOLOGY_READONLY](../docs/processes.md) |
| Agent operating guide | AGENTS | `AGENTS.md` | — | [REQ-TIED_SETUP](../requirements/REQ-TIED_SETUP.yaml) |
| Client development index | core seven | `tied/docs/client-development-index.md` | minimal CITDP+LEAP+TIED doc set, including domain vocabulary | [PROC-AGENT_REQ_CHECKLIST](../docs/processes.md) |
| Bootstrap script | copy_files | `copy_files.sh` | `./copy_files.sh /path/to/client` | [IMPL-TIED_FILES](../implementation-decisions/IMPL-TIED_FILES.yaml) |
| Methodology migration guide | migration guide | `tied/docs/methodology-migration.md` | Existing-client upgrade procedure | [REQ-TIED_SETUP](../requirements/REQ-TIED_SETUP.yaml) |
| Vocabulary merge mode | copy-missing-vocab | `copy_files.sh --merge-vocab` | Additive vocabulary installation | [IMPL-TIED_FILES](../implementation-decisions/IMPL-TIED_FILES.yaml) |
| Domain vocabulary index | vocab index | `tied/vocab/*.md` | checklist `VOCAB_INDEX` | [PROC-VOCABULARY_INDEX](../docs/processes.md) |
| Vocab directory routing index | routing index | `tied/vocab/routing.md` | PRELOAD primary entry | [PROC-VOCABULARY_INDEX](../docs/processes.md) |
| Domain vocabulary full catalog | full catalog | `tied/vocab/domain-references.md` | on-demand cross-topic / Priority table | [PROC-VOCABULARY_INDEX](../docs/processes.md) |
| Vocabulary control layer | vocabulary layer / agent-control layer | `tied/vocab/*.md` plus checklist touchpoints | RESOLVE / PRELOAD / RECORD / VALIDATE | [PROC-VOCABULARY_INDEX](../docs/processes.md) |
| Per-request checklist copy | working folder checklist | `<working_folder>/REQ-*_<timestamp>.yaml` | — | [PROC-AGENT_REQ_CHECKLIST](../docs/processes.md) |
| Composition coverage guide | binding inventory / E2E exclusion | `tied/docs/composition-coverage.md` | checklist `composition-integration` | [REQ-MODULE_VALIDATION](../requirements/REQ-MODULE_VALIDATION.yaml) |
| YAML canonicalization | canonical YAML profile | `scripts/yaml_tool.sh` and TIED YAML MCP | `tied-yaml-canonical-v1`; compatibility flags retained | [REQ-TIED_YAML_CANONICALIZATION](../requirements/REQ-TIED_YAML_CANONICALIZATION.yaml) |
| Format metadata | yaml_format | MCP write responses | profile id, scalar style, style source, key ordering, ordered-list pattern, string-list rule, scalar and opaque-text policy | [REQ-TIED_YAML_STYLE_CONFIGURATION](../requirements/REQ-TIED_YAML_STYLE_CONFIGURATION.yaml) |
| YAML lint wrapper | lint_yaml | `scripts/lint_yaml.sh` | delegates to yaml_tool | [PROC-YAML_EDIT_LOOP](../docs/processes.md) |
| List group sorter | yaml_list_sorter | `scripts/yaml_list_sorter.rb` | `--sort-keys` optional; invoked by yaml_tool `--sort-lists`; post-sort **yaml_semantic_compare** | [PROC-YAML_EDIT_LOOP](../docs/processes.md) |
| Semantic YAML compare | yaml_semantic_compare | `scripts/yaml_semantic_compare.rb` | library + `YamlSemanticCompare.compare` | [PROC-YAML_EDIT_LOOP](../docs/processes.md) |
| YAML directory compare | compare_yaml_dirs | `scripts/compare_yaml_dirs.rb` | `LEFT_DIR RIGHT_DIR`; `--unordered-arrays`; `--[no-]missing` | [PROC-YAML_EDIT_LOOP](../docs/processes.md) |

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
| `[PROC-VOCABULARY_INDEX]` | Domain vocabulary discipline (`tied/vocab/`) |
| `[PROC-TIED_METHODOLOGY_READONLY]` | Do not write `tied/methodology/` |
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
| YAML canonicalization | `CANONICALIZE_YAML_FILE` | [IMPL-TIED_FILES](../implementation-decisions/IMPL-TIED_FILES.yaml) |
| YAML path lint | `LINT_YAML_PATHS` | [IMPL-TIED_FILES](../implementation-decisions/IMPL-TIED_FILES.yaml) |
| typed YAML value canonicalization | `CANONICALIZE_YAML_VALUE` | [IMPL-TIED_YAML_CANONICALIZER](../implementation-decisions/IMPL-TIED_YAML_CANONICALIZER.yaml) |
| YAML format metadata | `REPORT_YAML_FORMAT` | [IMPL-TIED_YAML_CANONICALIZER](../implementation-decisions/IMPL-TIED_YAML_CANONICALIZER.yaml) |
| atomic YAML write | `WRITE_CANONICAL_YAML_ATOMIC` | [IMPL-TIED_YAML_CANONICALIZER](../implementation-decisions/IMPL-TIED_YAML_CANONICALIZER.yaml) |

---

## Alphabetical index

| Term | Section |
|------|---------|
| AGENTS.md | Naming bridge |
| agent-control layer | Preferred terms |
| atomic YAML write | Pseudo-code block names |
| binding inventory | Preferred terms |
| canonical YAML profile | Preferred terms |
| client refresh | Preferred terms |
| compare_yaml_dirs | Preferred terms |
| composition evidence | Preferred terms |
| composition-coverage.md | Naming bridge |
| contract precision | Preferred terms |
| copy_files.sh | Naming bridge |
| detail file | Preferred terms |
| domain-references.md | Naming bridge |
| full catalog | Naming bridge |
| format metadata | Preferred terms |
| inherited methodology snapshot | Preferred terms |
| lint_yaml | Preferred terms |
| methodology YAML | Preferred terms |
| methodology migration | Preferred terms |
| module validation | Preferred terms |
| Observing AI principles! | Preferred terms |
| promoted quality record | Preferred terms |
| PROC-AGENT_REQ_CHECKLIST | PROC catalog |
| PROC-VOCABULARY_INDEX | PROC catalog |
| project YAML | Preferred terms |
| qualifying list group | Preferred terms |
| opaque text | Preferred terms |
| ordered-list key | Preferred terms |
| routing index | Preferred terms |
| routing.md | Preferred terms |
| semantic token | Preferred terms |
| scalar-type preservation | Preferred terms |
| sort map keys | Preferred terms |
| TIED base path | Naming bridge |
| tied/vocab | Naming bridge |
| VOCAB_INDEX | Naming bridge |
| Vocab directory routing index | Naming bridge |
| vocabulary merge mode | Preferred terms |
| vocabulary layer | Preferred terms |
| yaml_list_sorter | Naming bridge |
| yaml_semantic_compare | Preferred terms |
| yaml_tool | Preferred terms |
| YAML canonicalization | Preferred terms |
