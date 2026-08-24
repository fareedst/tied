# CITDP record policy: when to create vs skip

**Audience**: Teams using `[PROC-AGENT_REQ_CHECKLIST]` and the `persist-citdp-record` step. Process anchor: `tied/docs/processes.md` § `[PROC-CITDP]`.

This file is **project-owned**. After `copy_files.sh`, it lives at `tied/docs/citdp-policy.md` in client workspaces. Adjust the bullets below for your team; the checklist references this path for “create vs skip” decisions.

## Default: persist

**Create** a CITDP YAML record under `tied/citdp/` (see checklist for naming) when the work is **behavior-changing** on an existing codebase: new or altered runtime paths, APIs, security, data, configuration, or anything that would change what you test or how you roll back. For every persisted behavior-changing record, select the applicable assurance profiles before REQ/ARCH/IMPL design and include a quality evidence matrix.

## Reasonable skips

You may **skip** a full CITDP file when all of the following hold:

- The change does **not** alter behavior under test (e.g. typo in comments, pure formatting, non-executable docs with no TIED token or traceability impact).
- Risk is negligible and the commit message (or PR description) is enough audit trail for your process.
- The team explicitly treats the session as a **throwaway spike** and accepts that history will be thinner.

If you skip when the default would be “persist,” record that decision briefly (commit body, ticket, or team norm) so reviewers know it was intentional.

## Quality evidence matrix

The matrix is risk-triggered rather than universal. Each quality attribute or selected profile records:

- `applicability` (`applicable`, `not_applicable`, or `accepted_risk`) and a rationale;
- risk, bounded scenarios, and abuse cases when a relevant boundary exists;
- evidence method, exact command or test, threshold, result, owner, limitation, and evidence provenance;
- waiver, owner, and expiry for an unmet obligation or accepted residual risk.

At minimum consider `baseline-functional`; select external-input/security, data-integrity/migration, stateful-reliability, performance/scale/cost, user-facing/accessibility, regulated/privacy, and AI-enabled profiles only when their triggers are present. `tied_validate_consistency` is evidence of TIED artifact and traceability integrity only; it is not proof of runtime security, performance, usability, compliance, resilience, privacy, or product correctness.

## Adversarial inquiry depth

For every behavior-changing CITDP record, populate `risk_analysis.adversarial_inquiry.depth_tier`
with one of:

- `minimal`: record manual counterexamples and falsification questions; no MCP inquiry is required.
- `integrated`: run the checklist inquiry pass with explicit scope and advisory policy, invoke
  `tied_adversarial_inquiry_run` when MCP is available, and persist the bounded report, finding
  ledger, gate result, and evidence provenance under `working/{REQ-TOKEN}/adversarial-inquiry/`.
- `strict_candidate`: prepare the same bounded evidence plus negative controls, deterministic
  execution, proof boundaries, waiver ownership and expiry, and pilot evidence. This remains
  warn-only until strict eligibility and explicit human approval are recorded.

Keep `research_profile`, `assurance_profile`, and `gate_policy` separate. The default depth for
behavior-changing work is `minimal`; selecting `baseline-functional` does not silently activate
integrated inquiry. A tool call without the required bounded artifacts is incomplete activation.
Observed findings remain outside canonical TIED YAML and do not trigger LEAP until confirmed.

### Eligibility triggers and integrated waiver

When behavior-changing work matches an eligibility trigger (external input, auth, network,
persistence, strict close-out — see `docs/integrated-activation-checklist-enforcement-plan.md`
§7), default `depth_tier` is `integrated`. Selecting `minimal` on triggered work requires
**sponsor confirmation** recorded as `risk_analysis.adversarial_inquiry.integrated_waiver` with
real `owner`, `expiry`, `rationale`, and `approval` values. Agents must not silently waive
integrated on triggered work; placeholder (`~`), empty, or incomplete waiver fields block
progression at `risk-assessment` and at every checklist gate phase.

Record matched triggers at `risk-assessment` in
`risk_analysis.adversarial_inquiry.eligibility_triggers_matched` (string array). When
this array is non-empty and `depth_tier` is `minimal` without a complete
`integrated_waiver`, `tied_checklist_gate_validate` emits the warn-only diagnostic
`minimal_depth_missing_waiver`. Under `gate_policy: advisory` the diagnostic does not
block progression; it is distinct from `depth_downgrade_requires_waiver`.

## Shared progression gate

Behavior-changing workflows use the same fail-closed gate at
`pre_implementation`, `verification`, and `close_out`. Tracker dispositions
are limited to `pending`, `completed`, `not_applicable`, and `waived`;
`completed` requires evidence, `not_applicable` requires policy and rationale,
and `waived` requires owner, expiry, approval, and residual risk. A loop-back
clears dependent downstream dispositions and evidence before re-entry.

At `integrated` depth, activation is valid only when a successful
`tied_adversarial_inquiry_run` receipt is paired with
`obligation-report.json`, `finding-ledger.jsonl`, `gate-result.json`, and
`evidence-provenance.json`; request, project, run, phase, scope, and artifact
hashes must match. Missing, malformed, stale, or unjustified process evidence
blocks progression even when the inquiry policy is advisory.

### Waiver field hygiene

Unused waiver maps (`integrated_waiver`, `depth_change_waiver`,
`close_out_inquiry_waiver`) should be **omitted** or set to **`null`**. Never
use tilde (`~`) or empty strings as placeholder waiver values — the checklist
evidence gate treats those as absent and will not accept them as valid waivers.
When a waiver applies, every required field must contain a real value (owner,
expiry, rationale, approval, and `referenced_verification_run_id` for
close-out inquiry waivers).

At `integrated` depth, `activation.expected` may be omitted from gate payloads
when `activation.receipt` carries a complete identity (including matching
`scope_hash`); the gate derives expected from the receipt and still requires
artifact pairing.

At `minimal` depth, `sub-adversarial-inquiry-pass` must be `not_applicable` or
`waived` with rationale — **`pending` fails** at every gate phase.

### Open-record persistence vs progression gates

`citdp_record_write` validates the **open-record shape** for persistence only.
It is not a substitute for `tied_checklist_gate_validate`. At `integrated`
depth, activation may be omitted while the request is pre-inquiry; upgrading
from an on-disk `minimal` record requires `prior_depth_tier: minimal`. Partial
or malformed activation is rejected when supplied. Verification and close-out
gates still require paired inquiry evidence. See
`docs/adversarial-inquiry-adoption.md` § Depth upgrade path.

## Middle ground

For small but real behavior changes, some teams still want a **short** CITDP record (minimal fields) rather than skipping entirely. That is valid if your validators and reviewers agree.

After `copy_files.sh`, use the layout in **`./tied/docs/citdp-record-template.yaml`** when creating `tied/citdp/CITDP-{change_request_id}.yaml` (see **persist-citdp-record** in `agent-req-implementation-checklist.yaml`).

## References

- `tied/docs/processes.md` § `[PROC-CITDP]` (especially step 8 — persistence).
- `tied/docs/agent-req-implementation-checklist.md` — `persist-citdp-record` and earlier CITDP-style steps.
- At repository root, `docs/leap-tied-citdp-costs-and-benefits.md` expands on tradeoffs (not always mirrored under `tied/docs/`).
