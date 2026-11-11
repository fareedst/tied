# PLAN — REQ-TIED_PATH_DECLARED_COMPOSITION_MANDATE

**Linked Cursor plan:** `.cursor/plans/path-declared_composition_mandate_c9eaa94b.plan.md`  
**Track:** add-feature (deferred) → **`@refine-plan`** (this pass) → **`@build-plan`** → **`@close-out`**  
**plan_phase:** `post-build`  
**Taxonomy:** [proof-test-label-taxonomy.md](../REQ-TIED_TRIAL_PROOF_INTENT_STACK/evidence/proof-test-label-taxonomy.md)

---

## Sponsor intent (locked)

| Choice | Value |
| --- | --- |
| **Scope** | All TIED **`@build-plan`** work — not WF-orchestrator-only |
| **Declared bar** | Receipt **`composition_tests` > 0** via **path suffixes** only |
| **Coarse semantics** | **Unchanged** — no LEAP to roll headers/manifest into `composition_tests` ([G1](../REQ-TIED_PROJECT_SIZE_PROOF_PATH_SEMANTICS/evidence/g1-sponsor-checkpoint.md)) |
| **WF subcheck** | **Unchanged** — [REQ-WF_TRIAL_COMPOSITION_EVIDENCE_SUBCHECK](../../requirements/REQ-WF_TRIAL_COMPOSITION_EVIDENCE_SUBCHECK.yaml) may still **pass** on `composition_inferred_cases` alone |
| **Proof boundary** | Size evidence + dev discipline — not REQ Implemented, not auto grading rewrite |

---

## Locked decisions (refine-plan — gate policy)

| ID | Decision | Rationale |
| --- | --- | --- |
| **PDC-D1** | **`depth_tier`** for this store REQ: **`minimal`** at plan/refine; **`integrated`** optional at build-plan dogfood only with explicit sponsor opt-in | Eligibility table matches methodology/tooling class; integrated activation not required for plan-only |
| **PDC-D2** | **`gate_policy`** (checklist evidence gate): **`advisory`** for this REQ unless sponsor starts strict pilot | Aligns with PDC-D1; no Slice-1 blocking on pre_implementation without activation |
| **PDC-D3** | **`profile_depth`:** **`not_measured`** until close-out evidence-chain run | Not a synonym for `depth_tier` |
| **PDC-D4** | Validator MCP name: **`tied_path_declared_composition_validate`**; schema id **`path-declared-composition-validate.v1`** | Matches `tied_project_size_*` surface |
| **PDC-D5** | **`path_declared_composition.enforcement`** on CITDP + Tracker **`metadata`**: `advisory` \| `blocking` — **authoritative** for validator hook; not inferred solely from chat | Machine-readable gate seam |
| **PDC-D6** | **Default `enforcement` derivation** (build-plan writes CITDP/Tracker once): **`advisory`** when `execution_site` is **disposable WF client** OR tracker carries `workflow_trial_disposable: true`; **`blocking`** when **`composition-integration`** is **completed** or **in required scope** on store **`@build-plan`**; otherwise **`advisory`** until composition-integration is touched | WF minimal default; store implementation blocks when bindings are in scope |
| **PDC-D7** | **Sponsor override:** `path_declared_composition.enforcement: blocking` on minimal disposable trial requires **costly choice** note in handoff § Recommendations | Prevents silent trial breakage |
| **PDC-D8** | **`tied_path_declared_composition_validate` hook phases:** run at **`verification-gate`** (primary); emit **advisory** receipt at **`close_out`** via `run-close-out-gates.mjs` when `enforcement: advisory` and mandate unsatisfied | Mirrors checklist gate layering |
| **PDC-D9** | **Rejected:** coupling validator pass to **`wf_composition_evidence_subcheck`** pass rule | Sponsor locked subcheck unchanged |
| **PDC-D10** | **Rejected:** mandatory blocking on **`pre_implementation`** checklist gate for this REQ at minimal depth | Plan leaves stay advisory |

### Enforcement matrix (normative)

| Context | Typical `depth_tier` | Default `enforcement` | Fails `verification-gate`? |
| --- | --- | --- | --- |
| Disposable WF trial (`@build-plan` on client tree) | `minimal` | `advisory` | No — diagnostics + handoff third completion signal |
| Store implementation of this REQ | `minimal` | `blocking` when composition-integration in scope | Yes when mandate applies and unsatisfied |
| Store feature REQ with bindings (standard sponsor profile) | `minimal` or `integrated` | `blocking` after composition-integration complete | Yes |
| Single-module waiver (documented) | any | N/A (`mandate_applies: false`) | No |

---

## Problem (today)

Checklist **[composition-integration](../../../tied-bundle/docs/agent-req-implementation-checklist.md)** requires binding tests but not **path-declared** names for project-size `comp`. [wf-trial-proof-naming-adjunct.md](../../../tools/bundled-prompt-type-skills/prompt-shared/wf-trial-proof-naming-adjunct.md) is WF-scoped and not linked from [build-plan/SKILL.md](../../../tools/bundled-prompt-type-skills/build-plan/SKILL.md). Disposable clients ship `cli.test.ts` → **`composition_tests: 0`**, **`comp_inferred` only**.

---

## Policy (normative)

**Mandate applies when** any of:

1. Tracker includes slug **`composition-integration`** (completed or in scope), or  
2. CITDP / binding inventory documents **≥1** composition-testable binding ([composition-coverage.md](../../../tied-bundle/docs/composition-coverage.md)), or  
3. IMPL pseudo-code includes an explicit **wiring/composition** block (impact discovery).

**Mandate satisfied when:**

- **≥1** `src/**/*.test.ts` classifies as **composition** via [classifyTestFile](../../../mcp-server/src/project-size/proof-test-classify.ts) with **≥1** `node:test` case, and  
- Plan or handoff **names** those files (`composition_path_declared` field).

**Exempt when:** single-module (no inventory rows, composition-integration **N/A** with waiver), or stack outside TS `src/**/*.test.ts` (follow-on).

---

## Architecture

| Layer | Responsibility |
| --- | --- |
| **L1 (exists)** | Path → `composition_tests` in snapshot-builder |
| **L2 (new)** | **`tied_path_declared_composition_validate`** — read-only policy + snapshot → `mandate_applies`, `satisfied`, `composition_tests`, `exempt`, diagnostics |
| **L3 (optional)** | Manifest adjunct; manifest does **not** satisfy `comp` without path suffix |
| **Process** | Generalized naming adjunct + checklist step |

---

## Build-plan scope (phased)

| Phase | Slug | Deliverable |
| --- | --- | --- |
| 1 | `mcp-validator-tdd` | `path-declared-composition-validate.ts` + register MCP/CLI |
| 2 | `skills-checklist` | `tied-composition-test-naming-adjunct.md`; wire build-plan, tied-implement, four-phase preload |
| 3 | `verification-gate` | Hook validator; [completion-signals-handoff.md](../../../tools/bundled-prompt-type-skills/prompt-shared/completion-signals-handoff.md) third signal |
| 4 | `tied-enroll-close` | REQ/ARCH/IMPL YAML, pseudo-code, `tied_validate_consistency`, close-out |

### TIED tokens (proposed — enroll at build-plan)

| Artifact | Token |
| --- | --- |
| REQ | `REQ-TIED_PATH_DECLARED_COMPOSITION_MANDATE` |
| ARCH | `ARCH-TIED_PATH_DECLARED_COMPOSITION_MANDATE` |
| IMPL | `IMPL-TIED_PATH_DECLARED_COMPOSITION_VALIDATE`, `IMPL-TIED_COMPOSITION_TEST_NAMING_SKILL` |

**Cross-links:** [REQ-TIED_PROJECT_SIZE_PROOF_PATH_SEMANTICS](../../requirements/REQ-TIED_PROJECT_SIZE_PROOF_PATH_SEMANTICS.yaml), [REQ-MODULE_VALIDATION](../../../tied-bundle), [REQ-WF_TRIAL_COMPOSITION_PROMPTS](../../requirements/REQ-WF_TRIAL_COMPOSITION_PROMPTS.yaml).

### Explicit non-changes

- No change to `wf-composition-evidence-subcheck.ts` pass rule  
- No default `WF_TRIAL_REQUIRE_PROOF_MANIFEST=1`  
- No snapshot merge of manifest/headers into coarse `composition_tests`

---

## Test strategy (design)

See [test-strategy.md](test-strategy.md). Scenario IDs **SC-PDC-01** … **SC-PDC-05** unchanged from add-feature draft.

---

## Risks

| Risk | Mitigation |
| --- | --- |
| Over-blocking minimal disposable trials | PDC-D6 default **advisory** on disposable WF |
| Brownfield legacy test names | Exempt until composition-integration touched |
| Methodology bundle read-only in clients | Skill changes via store + `tied-install --refresh` |

---

## Authoritative artifacts

| Artifact | Path |
| --- | --- |
| CITDP (draft) | [CITDP-REQ-TIED_PATH_DECLARED_COMPOSITION_MANDATE.draft.yaml](CITDP-REQ-TIED_PATH_DECLARED_COMPOSITION_MANDATE.draft.yaml) |
| Tracker stub | [checklist-tracker.yaml](checklist-tracker.yaml) |
| Handoff | [evidence/session-handoff.md](evidence/session-handoff.md) |
