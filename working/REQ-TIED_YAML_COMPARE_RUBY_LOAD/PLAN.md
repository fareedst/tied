# Slice A — Ruby YAML compare load fix

| Field | Value |
| --- | --- |
| **REQ** | [REQ-TIED_YAML_COMPARE_RUBY_LOAD](../../tied/requirements/REQ-TIED_YAML_COMPARE_RUBY_LOAD.yaml) |
| **IMPL** | [IMPL-TIED_FILES](../../tied/implementation-decisions/IMPL-TIED_FILES.yaml) · [HOIST block](../../tied/implementation-decisions/IMPL-TIED_FILES-pseudocode.md) |
| **CITDP** | [CITDP-REQ-TIED_YAML_COMPARE_RUBY_LOAD.yaml](../../tied/citdp/CITDP-REQ-TIED_YAML_COMPARE_RUBY_LOAD.yaml) |
| **Tracker** | [checklist-tracker.yaml](./checklist-tracker.yaml) |
| **Parent program** | [working/REQ-TIED_CLIENT_REFRESH_PARITY/PLAN.md](../REQ-TIED_CLIENT_REFRESH_PARITY/PLAN.md) Phase A |

## Scope boundary (merge-safe)

| In scope | Out of scope |
| --- | --- |
| Hoist `YamlSemanticCompare::DEFAULT_RECORD_LIST_KEYS` above `DifferenceWalker` in `scripts/yaml_semantic_compare.rb` | Node bootstrap, parity gate, manifest |
| RED: `scripts/yaml_semantic_compare_load_test.rb` | Semantic compare algorithm changes |
| Extend `scripts/compare_yaml_dirs_test.rb` load smoke | TypeScript port of compare |

**Proof:** `ruby scripts/compare_yaml_dirs.rb --help` exits 0; existing `yaml_list_sorter_test.rb` / `compare_yaml_dirs_test.rb` remain green.

**Rollback:** revert single-file hoist; no client-facing behavior change except restored CLI.

**CI:** Run Ruby tests in existing `scripts/*_test.rb` harness (same job as YAML edit-loop tests); no disposable client required for Slice A.

## build-plan invocation

```
build-plan Slice A — REQ-TIED_YAML_COMPARE_RUBY_LOAD: hoist DEFAULT_RECORD_LIST_KEYS; first RED scripts/yaml_semantic_compare_load_test.rb
```

After Slice A green, run program build-plan per parent PLAN (B1→B4).

## plan-refine status

Pre-implementation planning complete (2026-09-27); implementation deferred to build-plan.
