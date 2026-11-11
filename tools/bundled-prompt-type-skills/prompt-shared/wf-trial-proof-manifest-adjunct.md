# WF trial proof-facet manifest (build-plan adjunct)

**When:** All **`PROMPT-WF-01` … `PROMPT-WF-12`** during `@build-plan` (orchestrated `workflow-trial-agentstream`).

**Primary path (orchestrator scaffold):** `tied-project/working/proof-facet-manifest/evidence/proof-facet-manifest.v1.json`

**Template:** [`tied-bundle/templates/proof-facet-manifest.v1.template.json`](../../../tied-bundle/templates/proof-facet-manifest.v1.template.json)

1. Complete the scaffolded manifest before `phase-handoff-build-plan.md`: fill **`files[]`** with one row per `src/**/*.test.ts` (`path` + `proof_subtype`).
2. Use taxonomy subtypes from [proof-test-label-taxonomy.md](../../../tied-project/working/REQ-TIED_TRIAL_PROOF_INTENT_STACK/evidence/proof-test-label-taxonomy.md); override path-only labels when agent intent differs.
3. Add `bindings[]` rows when a composition/wiring test maps to a trigger→callee story (WF-lite; not full binding inventory).
4. Validate on store: MCP `tied_wf_proof_manifest_validate` with `repo_root` + `manifest_path` (default **advisory**).
5. Pair with `tied_project_size_snapshot` — manifest overrides affect `label_case_counts` only, not path-declared `composition_tests`.

**Orchestrator gate:** post–four-phase min-shape check fails (non-zero exit) when `files[]` is empty or invalid unless operator set `WF_TRIAL_SKIP_PROOF_MANIFEST=1`.
