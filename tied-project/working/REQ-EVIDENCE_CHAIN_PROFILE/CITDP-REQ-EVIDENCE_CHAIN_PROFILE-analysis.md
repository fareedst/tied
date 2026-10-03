# CITDP analysis — Evidence chain profile

Status: **pre-implementation analysis** for [REQ-EVIDENCE_CHAIN_PROFILE] (token not yet created).  
Canonical persist of `tied/citdp/CITDP-REQ-EVIDENCE_CHAIN_PROFILE.yaml` is **deferred** until after product implementation (`citdp-policy.md`: persist after behavior-changing implementation).

Refine-plan date: 2026-08-22  
Tracker: `working/REQ-EVIDENCE_CHAIN_PROFILE/REQ-EVIDENCE_CHAIN_PROFILE_20260822.yaml`

## Change definition

**Current behavior:** Validators and fidelity modules exist separately (`tied_scoped_analysis_run`, Layer B validators, quality evidence manifest, `runFirstSlice` / `runFidelityResearchPilot`, `tied_adversarial_inquiry_run`). No `evidence_chain*` symbol or unified **evidence chain profile** artifact exists.

**Desired behavior:** One read-only MCP/CLI generator produces a versioned **evidence chain profile** (`evidence-chain-profile.v1`) for one TIED client at both **evidence-chain profile depths** (`integrated` and `human_research`). The artifact reports completeness, provenance, denominators, and **proof boundaries**. Dedicated tokens `[REQ-EVIDENCE_CHAIN_PROFILE]`, `[ARCH-EVIDENCE_CHAIN_PROFILE]`, `[IMPL-EVIDENCE_CHAIN_PROFILE]`, `[PROC-EVIDENCE_CHAIN]` are created during build-plan Phase 1.

**Unchanged behavior:** Existing fidelity, quality, and adversarial-inquiry tools remain independently callable. Project REQ/ARCH/IMPL YAML is never mutated by generation. Opt-in **usage metrics** remain off by default. No universal maturity score.

**Non-goals (locked):** Block-level IMPL↔test three-way matrices; cross-project cohort aggregator; automatic TIED mutation; vocabulary drift automation beyond presence/linkage; writing finding ledgers or promoting case reports as a side effect of profile generation.

**Success criteria:** Deterministic MCP/CLI profiles at both depths; schema-valid `generator: manual` Path B; fail closed on wrong **TIED base path**; every ratio has denominator + scope; every result cites source + proof boundary; metrics remain opt-in/sanitized; lint, pseudo-code validation, and `tied_validate_consistency` pass after implementation.

## Impact and IMPL inventory

**New tokens (build-plan Phase 1):** REQ/ARCH/IMPL-EVIDENCE_CHAIN_PROFILE, PROC-EVIDENCE_CHAIN.

**Affected existing tokens (compose, do not replace):** [REQ-QUALITY_ASSURANCE_EVIDENCE], [REQ-TIED_FIDELITY_RESEARCH], [ARCH-QUALITY_ASSURANCE_PROFILES], [ARCH-TIED_FIDELITY_RESEARCH], [IMPL-TIED_FIDELITY_RESEARCH], [IMPL-QUALITY_EVIDENCE_MANIFEST], [PROC-QUALITY_EVIDENCE_PROVENANCE], [REQ-MCP_USAGE_METRICS] / [IMPL-MCP_USAGE_METRICS].

**Verified-present composition seams:**

| IMPL / module | Path | Role for profile |
|---|---|---|
| PROJECT_MANIFEST | `mcp-server/src/fidelity-research/manifest.ts` | Fail closed on wrong TIED base path |
| RUN_STRUCTURAL_ANALYSIS | `structural-analysis.ts` | Consistency, pseudo-code, cycles, binding inventory, test adequacy |
| AUDIT_IMPL_FIDELITY | `fidelity-audit.ts` | `human_research` depth only |
| ANALYZE_BINDING_EVIDENCE | `binding-analysis.ts` | `human_research` depth only |
| ANALYZE_SPECIFICATION_STATE | `specification-state.ts` | `human_research` when change context supplied |
| RUN_FIRST_SLICE | `first-slice.ts` | **Do not call wholesale** — always runs fidelity, finding append, and promotion |
| RUN_FIDELITY_RESEARCH_PILOT | `pilot.ts` | Adapter catalog only; do not emit research-dataset writes |
| usage metrics | `usage-metrics.ts` | Opt-in extra fields |
| tools index | `mcp-server/src/tools/index.ts` | Register `evidence_chain_profile_generate` |

**Protected boundaries:** `tied/methodology/`; project intent YAML; finding-ledger append; case promotion; cohort aggregation.

## Risk assessment

**Assurance profiles:** `baseline-functional` (required). `external-input-security` (CLI/MCP args, `output_path`, `tied_base_path`, `roots` — path and wrong-base-path cases). `ai-enabled` not triggered (no new model boundary). `regulated-privacy` not triggered if `project_id` is a hash and metrics stay opt-in.

**Adversarial inquiry:** `depth_tier: minimal` for this refine-plan analysis; product CITDP may stay `minimal` unless build-plan raises it. Keep `research_profile`, **assurance profile**, and **evidence-chain profile depth** as separate fields.

**Risks:**

1. Calling `runFirstSlice` for `integrated` would run fidelity/promotion and violate depth and read-only constraints.
2. Wrong TIED base path silently analyzing another repo (existing RISK-010 class) — fail closed.
3. Missing optional `change_context` treated as failure instead of `not_measured` / `not_applicable` on `change_fidelity`.
4. Silent zeros instead of `not_measured` / `unknown`.
5. Metrics collection without opt-in or with raw client path as identity.
6. Manual Path B claiming MCP validator results that were not run.
7. Phase 4 sibling-repo pilot unavailable — do not block Phases 1–3; stdd is the required pilot.

## Test strategy (for build-plan)

1. **Unit RED first:** `normalizeEvidenceChainProfile` — N/A, denominators, stable sort, malformed input, proof-boundary preservation, no maturity field.
2. **Unit RED:** `generateEvidenceChainProfile` stage gating — `integrated` never invokes fidelity/binding/spec adapters; `human_research` without `change_context` marks `change_fidelity` `not_measured` and still returns `ok`.
3. **Unit RED:** WrongTiedBasePath fail-closed; output never written to project YAML paths.
4. **Unit RED:** Manual fixture with `generator: manual` passes schema/normalizer; missing `assumptions`/`unsupported_checks` fails.
5. **Composition RED:** MCP/CLI trigger → orchestrator → normalized profile; no UI; no YAML mutation; deterministic rerun equivalence.
6. **No E2E-only path** justified (CLI is composition-testable).
7. After implementation: `pseudocode_validate`, language lint, `tied_validate_consistency`, then persist CITDP.

## Quality evidence matrix (planned)

| Attribute | Applicability | Evidence | Proof boundary |
|---|---|---|---|
| baseline-functional | applicable | New unit + composition tests | `executable_behavior` for generator; `traceability_structure` for reported chain rows |
| external-input-security | applicable | Wrong-base-path, path traversal on `output_path` rejection or sandbox-to-working | `executable_behavior` |
| performance-scale-cost | not_applicable | v1 is one-project, on-demand | — |
| user-facing-accessibility | not_applicable | No UI | — |
