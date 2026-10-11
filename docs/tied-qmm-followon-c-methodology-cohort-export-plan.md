# QMM follow-on (c) — methodology learning cohort export

## Status and authority

This is a **plan-only child plan** for the authorized QMM follow-on (c).
It is implementation-ready for a later `/plan-new-feature` → `/build-plan`
pass, but it does not authorize RED tests, production code, a product
`REQ/ARCH/IMPL` stack, or edits to `tied-bundle/`.

- Plan-only token: `PLAN-TIED-QMM-FOLLOWON-C`
- Future implement REQ: `REQ-METHODOLOGY-LEARNING-COHORT-EXPORT`
- Sponsor authority:
  `tied-project/working/PLAN-TIED-QMM-METHODOLOGY-LEARNING/evidence/sponsor-authority-followon-c-shareable-hashed-20261010.md`
- Working evidence:
  `tied-project/working/PLAN-TIED-QMM-FOLLOWON-C/`
- Plan-only CITDP:
  `tied-project/citdp/CITDP-PLAN-TIED-QMM-FOLLOWON-C.yaml`

The parent QMM program is closed. Follow-on (b), Kaizen Phase 3 transport,
remains deferred and is not reopened by this plan.

## 0. RESOLVE — canonical terms and sponsor decisions

| Sponsor wording | Canonical term | Boundary |
| --- | --- | --- |
| cross-client cohort export | **methodology learning cohort export** | Explicit artifact/MCP path; not transport |
| shareable_hashed | **privacy tier** `shareable_hashed` | Hashed identity; no absolute paths or source trees |
| experiment records | **methodology learning experiment** | W1 `methodology-learning-experiment.v1` records |
| rollup machinery | **evidence chain statistics report** + **client cohort** | Reuse W4; no report redesign |
| input list | **report input manifest** | Explicit paths/IDs; no repository or client discovery |
| what export proves | **proof boundary** | Partition and redaction claims only |
| redaction owner | **sponsor** | Human intent owner; not an agent-selected waiver |

The sponsor-owned costly decisions are resolved for this plan:

- redaction owner: **sponsor**;
- policy expiry: **2027-10-10**;
- pilot: **stdd** until the sponsor broadens it;
- privacy tier: **`shareable_hashed`** for this scoped future export.

RESOLVE canonicalizes names only. It does not broaden sponsor scope, authorize
Kaizen transport, or substitute an agent default for a costly decision.

## 1. Delegated work envelope and explicit plan-only posture

### Allowed in this pass

- Refine this child plan and its linked plan.
- Create/update the scoped committed working folder, plan-only CITDP, and
  non-activation gate receipt.
- Record future module contracts, test strategy, binding inventory obligations,
  privacy constraints, diagnostics, and implementation handoff.

### Forbidden in this pass

- Minting `REQ-METHODOLOGY-LEARNING-COHORT-EXPORT` or any `ARCH-*`/`IMPL-*`
  record, or changing `semantic-tokens.yaml`.
- Runtime code, RED tests, W1/W4 behavior changes, or MCP/tool registration.
- Editing project methodology YAML under `tied-bundle/`.
- Live client discovery, repository traversal, Kaizen Phase 3 transport,
  finding-ledger append, canonical methodology promotion, or project YAML
  mutation.
- Claiming W2 methodology effectiveness from a cohort export.

Plan-only evidence describes readiness and boundaries. It is not implement
activation evidence and cannot authorize RED, code, verification, or close-out.

## 2. Change definition and proof boundary

### Current behavior

W1 persists methodology-learning experiments, normally at
`privacy_tier: operator_local`. W4 consumes an explicit
`evidence-chain-report-inputs.v1` manifest and already-generated
`evidence-chain-profile.v1` artifacts to produce compatibility-partitioned
client-cohort statistics. No first-class bounded path joins experiment
identity, profile artifacts, W4 partitions, and shareable redaction.

### Desired behavior for the future implement pass

1. The caller supplies an explicit **methodology cohort export manifest**
   (`schema_version: methodology-cohort-export-manifest.v1`) naming experiment
   IDs, profile artifact paths (same explicit boundary as
   `evidence-chain-report-inputs.v1`), and optional envelope rows.
2. The validator resolves every experiment ID in the W1 store and rejects
   missing, duplicate, malformed, or incompatible rows.
3. The policy gate requires an export-permitted privacy tier, sponsor owner
   metadata, unexpired policy, and the `stdd` pilot boundary.
4. The W4 adapter invokes existing report logic over the declared profile set,
   preserving client cohorts and denominator subcohorts.
5. The redactor emits shareable output with hashed identity, repository-relative
   or basename-only references, no absolute paths, no source trees, and no
   forbidden fields.
6. The output includes stable diagnostics and metadata for policy owner,
   expiry, pilot, input manifest, compatibility partitions, exclusions, and
   proof boundaries.

### Unchanged behavior

- W4 `v1` defaults and byte-stability remain unchanged.
- W4 compatibility keys and v2 denominator-fingerprint partitioning remain
  authoritative; incompatible rows are not merged.
- W1 experiment validation and W2 conformance/effectiveness pairing remain
  authoritative for their existing behavior.
- `tied_verify` remains the authority for methodology effectiveness/status.
- Existing operator-local paths remain local and are never silently upgraded.

### Proof boundary

A successful export proves only that the declared inputs were resolved,
partitioned into compatible cohorts/subcohorts, and rendered under the
declared shareable redaction policy. It can prove count/partition diagnostics
and redaction properties for those inputs.

It does **not** prove that a methodology rule worked, that a cohort is
representative, that methodology effectiveness improved, that W2 pairing is
complete, that a maturity level or ranking exists, or that transport or live
client discovery occurred. W2 outcome observations and `tied_verify` remain
the effectiveness authority.

## 3. Future module contracts and independent validation

The implement pass must author token-commented IMPL pseudo-code before RED.
Each changed Active procedure must declare `INPUT`, `OUTPUT`, `PRE`, `POST`,
`EFFECTS`, and applicable `FAILURE_MODES`, `DATA_TRANSITION`, and
`TERMINATION`. Each module passes unit/contract/edge/error validation before
composition code is written.

| Module | Contract boundary | Independent validation |
| --- | --- | --- |
| Export manifest validator | `INPUT` explicit manifest; `OUTPUT` normalized experiment/profile/envelope rows; `EFFECTS` read-only IO; reject traversal, duplicates, empty rows, forbidden fields, and malformed schema | Unit tests for schema, missing/duplicate IDs, path escape, empty/minimal/maximal rows, deterministic ordering |
| W1 experiment resolver | `INPUT` experiment IDs; `OUTPUT` validated `methodology-learning-experiment.v1` records; `PRE` IDs exist in the declared store; `EFFECTS` read-only IO | Mock-store contract tests for missing, duplicate, malformed, unsupported privacy tier, and read failure |
| Export policy gate | `INPUT` resolved records plus owner/expiry/pilot policy; `OUTPUT` allow or stable blocking diagnostic; `EFFECTS` pure | Table tests for `shareable_hashed`, `operator_local` rejection/upgrade policy, expiry, missing owner, pilot mismatch, and metadata mismatch |
| W4 report adapter | `INPUT` explicit profile paths and report options; `OUTPUT` existing W4 report/cohort partitions; `EFFECTS` read-only report computation and bounded output write | Contract tests with golden profiles, incompatible compatibility keys, denominator fingerprints, strict/partial modes, and no client traversal |
| Shareable redactor | `INPUT` accepted report plus policy metadata; `OUTPUT` shareable export; `EFFECTS` pure transformation | Privacy tests for hashed identity, no absolute paths/source trees, forbidden-field rejection, stable redaction, and no maturity/ranking fields |
| Metadata/diagnostic renderer | `INPUT` report, exclusions, policy, and proof boundary; `OUTPUT` deterministic YAML/optional Markdown projection | Snapshot tests for stable codes, ordering, owner/expiry/pilot, proof-boundary text, and YAML/Markdown agreement |
| MCP/CLI façade | `INPUT` request envelope; `OUTPUT` tool/CLI result; `EFFECTS` orchestration only | Composition tests for binding, argument mapping, exit codes, read-only store behavior, and output-path safety; no UI/E2E |

### Stable diagnostic contract

The future IMPL must define and test stable machine-readable codes, including:

`invalid_manifest`, `missing_experiment`, `duplicate_experiment`,
`invalid_experiment_record`, `missing_profile_artifact`,
`invalid_profile_artifact`, `incompatible_cohort_key`,
`forbidden_field`, `privacy_tier_not_exportable`,
`redaction_owner_missing`, `privacy_policy_expired`,
`pilot_scope_violation`, `output_path_forbidden`, and `w4_report_failure`.

Codes are stable API diagnostics; human messages may add bounded context but
must not replace the code or disclose absolute paths/secrets.

## 4. Composition and binding inventory

Before composition code, the implement pass must persist a binding inventory
for every trigger → callee connection. Each row records:
`trigger`, `callee`, `arguments`, `effect`, `ordering`, and
`failure_behavior`, plus the matching REQ/ARCH/IMPL block.

Minimum inventory:

1. MCP/CLI request → export manifest validator.
2. Validator → W1 experiment resolver.
3. Resolved records → export policy gate.
4. Declared profile paths → W4 report adapter.
5. W4 report → shareable redactor.
6. Redacted report → metadata/diagnostic renderer.
7. Optional envelope rows → existing W4/envelope batch machinery, only when
   explicitly present in the manifest.

Each binding gets a failing composition test before wiring. No UI invocation
is needed: every binding is callable below E2E. The façade remains thin and
must not implement validation, redaction, cohort math, or persistence.

## 5. Privacy, path, and data-integrity constraints

- `shareable_hashed` is an explicit export boundary, not a default upgrade
  for `operator_local`.
- No absolute paths, source trees, credentials, raw operator-local records, or
  forbidden export fields may appear in shareable output.
- Stable identity is a hashed project identity; optional client aliases remain
  non-authoritative labels.
- The future CITDP must record the redaction owner, approval/review status,
  evidence path, expiry, pilot scope, and proof boundary as a complete hinge
  field. No placeholder waiver is valid.
- Export reads declared W1/W4 artifacts and writes only the declared export
  artifact. It does not mutate W1 records, project YAML, evidence profiles,
  finding ledgers, or canonical methodology.
- Strict mode fails closed on invalid input and must not leave a misleading
  successful output. Partial mode preserves explicit exclusions and
  diagnostics; it never coerces missing data to zero.
- Any hash algorithm, salt/domain policy, retention, or externally compatible
  output contract that would be costly to change must be surfaced to the
  sponsor with a recommended default before implementation locks it.

## 6. Costly vs reversible choices

| Choice | Classification | Plan default / authority |
| --- | --- | --- |
| Redaction owner | Costly | **Sponsor**, resolved by authority artifact |
| Privacy tier | Costly | `shareable_hashed`, resolved only for this scoped export |
| Policy expiry | Costly | `2027-10-10`, sponsor re-review after expiry |
| Pilot scope | Costly | `stdd` until sponsor broadens it |
| W2 effectiveness authority | Costly boundary | Remains W2/`tied_verify`; export cannot replace it |
| W4 report version | Reversible | Reuse existing v1 default; v2 only through existing explicit path |
| Cohort incompatibility handling | Reversible | Partition and diagnose; never merge |
| Optional Markdown projection | Reversible | Include only if it is a deterministic projection of authoritative YAML |
| Exact MCP/CLI surface name | Reversible | Resolve in implement REQ/ARCH/IMPL pass before registration |
| Hash implementation details | Costly if output-compatible | Implement default must preserve stable identity/privacy; ask sponsor if compatibility or retention becomes durable |

The first four costly choices are resolved. No unresolved sponsor choice blocks
this plan-only pass; the implement CITDP must carry the authority reference and
reopen any costly choice whose consequence has changed.

## 7. CITDP, depth, assurance, and gate policy

### Plan-only selection

- `record_identity.depth_tier: minimal`
- `record_identity.profile_depth: integrated`
- `record_identity.gate_policy: advisory`
- `change_definition.methodology_surface_change_class: none`
- `risk_analysis.adversarial_inquiry.sub_adversarial_inquiry_pass: not_applicable`
  because this pass changes committed planning evidence only
- no activation evidence and no RED authorization

The plan-only gate is expected to return `allowed: false`. A plan-only receipt,
Jev shadow, prior W1/W4 receipt, or TIED consistency result is not activation
evidence.

### Future implement selection

- `depth_tier: integrated` because the feature accepts external manifests,
  reads persistence-backed records, and emits privacy-sensitive artifacts;
- `profile_depth: integrated` for the evidence-chain report scope;
- `gate_policy: per_citdp`;
- `research_profile` and `assurance_profile` recorded independently;
- baseline-functional, external-input-security, data-integrity-migration, and
  regulated-privacy applicability reviewed in the implement CITDP;
- `methodology_surface_change_class: none` remains explicit unless the
  implement pass changes a checklist step, prompt workflow, gate policy, or
  assurance profile. If it changes one, loop back, invalidate downstream
  evidence, and re-run the gate under the new class.

The future pass requires fresh identity-bound structural,
`pre_implementation`, verification, and close-out evidence under the local
`tied-bundle/working/REQ-METHODOLOGY-LEARNING-COHORT-EXPORT/` root. A valid
`pre_implementation` gate requires the future implement Tracker, implement
CITDP, complete pseudo-code validation, and matching identity-bound evidence.

## 8. Future TDD and implementation sequence

1. On authorized implement entry, mint the future REQ/ARCH/IMPL stack and
   semantic-token rows through the TIED tool surface.
2. Author the IMPL sidecar with token comments, precise contracts, failure
   modes, data transitions, and termination; run pseudo-code Layers A/B/C and
   `pseudocode_analyze` with `gate_mode: true`.
3. Copy a fresh authoritative Tracker from the canonical checklist, author the
   implement CITDP, run structural inquiry, and obtain an allowed integrated
   `pre_implementation` gate before RED.
4. Write RED unit tests for each module contract and stable diagnostic.
5. Implement and validate the manifest validator, W1 resolver, policy gate,
   W4 adapter, redactor, and renderer independently.
6. Write RED composition tests from the binding inventory, then wire the thin
   MCP/CLI façade.
7. Run W4 regression tests and a bounded `stdd` dogfood manifest. Do not
   discover clients or infer profile paths.
8. Run verification inquiry/gate, test/lint and privacy evidence, envelope and
   manifest validation, `tied_verify` where the REQ requires it, and
   `tied_validate_consistency`.
9. Run close-out evidence synchronization and close-out gate. Report machine
   close-out, process contract, and adherence ledger separately.

No E2E is planned because there is no UI boundary; any future E2E proposal
requires a named platform constraint and an IMPL `e2e_only_reason`.

## 9. Handoff artifacts and acceptance

Plan-only artifacts:

- child plan: `docs/tied-qmm-followon-c-methodology-cohort-export-plan.md`;
- committed working plan and Tracker under
  `tied-project/working/PLAN-TIED-QMM-FOLLOWON-C/`;
- plan-only CITDP:
  `tied-project/citdp/CITDP-PLAN-TIED-QMM-FOLLOWON-C.yaml`;
- non-activation gate receipt under
  `tied-project/working/PLAN-TIED-QMM-FOLLOWON-C/evidence/`.

The later implement handoff is blocked until:

- the future REQ/ARCH/IMPL stack is minted under sponsor authority;
- the IMPL sidecar and pseudo-code validation pass;
- a fresh implement Tracker/CITDP exists;
- all costly choices remain valid and are recorded as hinge fields;
- independent module validation and the binding inventory are complete;
- fresh identity-bound integrated activation evidence exists;
- `pre_implementation` returns `allowed: true`;
- RED → GREEN → composition → verification ordering is followed.

Plan acceptance means the child plan, Tracker, CITDP, and non-activation gate
receipt are present and internally consistent. It does not mean the export
exists, W2 effectiveness is established, or implementation is complete.
