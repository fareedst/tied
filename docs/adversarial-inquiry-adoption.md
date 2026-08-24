# Adversarial inquiry adoption

This guide applies to `[REQ-TIED_ADVERSARIAL_INQUIRY]`,
`[ARCH-TIED_ADVERSARIAL_INQUIRY]`, and
`[IMPL-TIED_ADVERSARIAL_INQUIRY]`.

Checklist integration is owned by `[PROC-AGENT_REQ_CHECKLIST]` and uses the
focused `[IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST]`. It does not create a
second process token or workflow.

## Checklist integration

Adversarial inquiry extends the canonical agent requirement implementation checklist
(`tied/docs/agent-req-implementation-checklist.yaml`) through existing step slugs and
`sub-adversarial-inquiry-pass` — no parallel workflow.

| Step slug | Integration role |
|---|---|
| `session-bootstrap` | PRELOAD `fidelity-research.md` and `quality-assurance.md` when work touches fidelity or obligation evidence |
| `translate-sponsor-intent` | Anti-examples, ambiguity probes, unchanged-behavior checklist |
| `change-definition` | Counterexamples and falsification questions for success criteria |
| `impact-discovery` | Obligation inventory; proof-boundary class per matrix row |
| `author-requirement` | Positive and negative (counterexample) case per satisfaction criterion |
| `author-architecture` | REQ criterion → ARCH constraint; invalid-state analysis |
| `catalog-pseudocode-contracts` | Closed failure/state/ordering/termination catalog per block |
| `flag-insufficient-specs` / `flag-contradictory-specs` | Counterexample-derived findings → ledger; CALL sub-procedure (`structural`) |
| `gate-pseudocode-validation` | CALL sub-procedure (`pre_red`); no runtime claim |
| `risk-assessment` | Adversarial depth tier; strict-eligibility prerequisites |
| `test-strategy` | Independent oracle sources; bounded command rows (`RUN_BOUNDED_COMMAND`) |
| `unit-test-red` | Fault matrix row with expected failure reason |
| `unit-test-green` / `three-way-alignment-unit` | Bidirectional adapter check (warn-only) |
| `composition-integration` | Binding-local cases; controlled fault rows (`CONTROLLED_COMPOSITION_FAULT`) |
| `verification-gate` | Full fidelity matrix; CALL sub-procedure (`verification`); scoped strict blocking |
| `sync-tied-stack` | LEAP only for **confirmed** findings |
| `traceable-commit` | Evidence provenance, open findings, waivers, proof boundaries |
| `persist-citdp-record` | Pilot evidence when gate policy is strict-candidate or strict-approved |
| `sub-adversarial-inquiry-pass` | Binds the five IMPL checklist blocks behind one CALL |

Full step-by-step table: [`tied/vocab/fidelity-research.md`](../tied/vocab/fidelity-research.md) § Checklist integration.

## Three independent dimensions

Do not conflate:

1. **Research profile** — `integrated-agent` for ordinary warn-first work or
   `human-research` for a complete evidence-rich study.
2. **Assurance profile** — `baseline-functional` by default, with specialized
   profiles selected only by risk trigger.
3. **Gate policy** — `advisory`, `strict-candidate`, or `strict-approved`.

The default policy is `advisory`. `strict-candidate` remains warn-only.
`strict-approved` can block only the declared scope after strict eligibility
and an explicit human approval record are both valid.

## Activation maturity model

“Specified” and “activated” are different states. Checklist text, inherited
tokens, and a registered MCP tool prove that the capability exists; they do not
prove that a feature used it.

| State | Meaning | Observable signals |
|---|---|---|
| **Specified** | The checklist, vocabulary, and MCP surface describe inquiry. | Template text and registered `tied_adversarial_inquiry_run`; no request-scoped artifacts required. |
| **Conventional risk** | Ordinary CITDP and test planning consider normal risks without adversarial inquiry. | `baseline-functional`, risks or scenarios, but no inquiry call or finding ledger. |
| **Activated (minimal)** | Manual adversarial thinking is recorded without requiring MCP. | Negative cases and falsification questions; `depth_tier: minimal`. |
| **Activated (integrated)** | Tool-backed inquiry produces auditable request-scoped evidence. | An MCP inquiry call with matching `request_token`, all four bounded artifacts, and a completed checklist pass at integrated depth. |
| **Activated (strict)** | Eligible evidence supports scoped blocking. | Integrated signals plus strict eligibility, human approval, and a scoped `gate-result.json` with blocking policy. |

The default for behavior-changing work is `minimal`; `baseline-functional` is
an assurance profile, not an activation signal. Integrated activation is
incomplete when a `tied_adversarial_inquiry_run` call lacks the four artifacts
under `working/{REQ-TOKEN}/adversarial-inquiry/`. Metrics should therefore
report the MCP call and artifact presence as paired signals. Observed findings
remain review-gated and do not trigger LEAP.

## Depth upgrade path (minimal → integrated)

Integrated activation has two distinct validation surfaces:

1. **Open-record persistence** (`citdp_record_write`) — records the selected
   `depth_tier` and upgrade history. At `integrated` depth, activation may be
   **omitted** while the request is still pre-inquiry. When upgrading from an
   on-disk `minimal` record, set `prior_depth_tier: minimal` in
   `risk_analysis.adversarial_inquiry`. Subsequent overwrites preserve
   `prior_depth_tier` when the incoming payload omits it.
2. **Progression gates** (`tied_checklist_gate_validate`) — unchanged fail-closed
   behavior at `verification` and `close_out`. Integrated depth still requires
   paired inquiry receipt and four phase-scoped artifacts unless a valid
   close-out inquiry waiver applies.

**Operator sequence** (matches client `1787507684` replay; avoids direct YAML bypass):

1. **Write depth** — `citdp_record_write` with `depth_tier: integrated` and
   `prior_depth_tier: minimal` when upgrading; activation omitted.
2. **Inquiry per phase** — call `tied_adversarial_inquiry_run` with
   `activation.phase` set to `pre_implementation`, `verification`, and
   `close_out` as the checklist requires.
3. **Collect/assemble** — gather `{ receipt, artifacts, expected }` from each
   phase directory under `working/{REQ-TOKEN}/adversarial-inquiry/phase-{phase}/`
   (collector MCP in Batch 2 Slice 2; manual assembly until then).
4. **Gate** — `tied_checklist_gate_validate` with the phase-appropriate activation
   payload; verification/close_out fail without pairing.
5. **Cite verification activation** — persist `completion_criteria.activation`
   on the CITDP only after verification pairing succeeds; close-out may reuse
   verification findings via `close_out_inquiry_waiver` but not by submitting a
   verification receipt as close-out activation.

Do not supply partial activation (receipt without artifacts, or placeholders)
to `citdp_record_write` — malformed activation is rejected even when omitted
activation would have been accepted.

## Initial configuration

### Mode A — supported today

The currently supported MCP contract is **normalized-input inquiry (Mode A)**:
the caller supplies the normalized `graph`, `fidelity`, and `scope` inputs.
The analysis reads caller-provided normalized records and produces generated
evidence; it does not scan project paths or write project YAML.

For non-Ruby projects whose project-input adapter is not available, use the
repository’s Mode A payload builder. It keeps the graph and fidelity evidence
language-neutral while removing hand-authored JSON envelope work:

```bash
ruby scripts/build_adversarial_inquiry_mode_a.rb \
  --graph /tmp/volumestats-graph.json \
  --fidelity /tmp/volumestats-fidelity.json \
  --provenance /tmp/volumestats-provenance.json \
  --scope IMPL-VOLUMESTATS-CLI#RUN_VOLUMESTATS \
  --project-root /absolute/path/to/project \
  --request-token REQ-VOLUMESTATS-CLI \
  > /tmp/volumestats-inquiry.json
.cursor/skills/tied-yaml/scripts/tied-cli.sh \
  tied_adversarial_inquiry_run @/tmp/volumestats-inquiry.json
```

The graph, fidelity, and provenance files remain the caller’s evidence inputs;
the builder only assembles the normalized Mode A request. Use `policy:
advisory` for a first pilot and inspect the four artifacts before claiming
integrated activation. This is the documented fallback for Go and other
stacks until a native project-input adapter exists.

### Mode B — supported bounded project-input inquiry

**Project-input inquiry (Mode B)** is an additive adapter in the live handler.
It accepts an explicit project boundary and declared repository-relative paths,
loads canonical TIED data read-only, and converts those inputs into the
existing normalized core.

The first Mode B slice is limited to one deterministic Ruby Minitest fixture
and does not promote strict status. It uses the supported assertion subset:

- `assert`
- `assert_equal`
- `assert_empty`
- `assert_raises`
- `refute`

Unsupported assertions are `UNRESOLVED` with an `unsupported_adapter`
diagnostic. Do not convert an unresolved result into a waiver without recording
an owner, expiry, proof boundary, rationale, and residual risk.

A Mode B request declares `project_root`, `request_token`, `impl_token`,
repository-relative `test_path` and `production_path`, plus either inline
`production_evidence` or a repository-relative
`production_evidence_path`. The loader validates the project/TIED boundary and
realpath confinement before reading. Production source supplies a locus only;
runtime behavior enters the core only through structured observations.

```json
{
  "mode": "project",
  "project_root": "/absolute/project",
  "request_token": "REQ-FIXTURE-ADVERSARIAL",
  "impl_token": "IMPL-FIXTURE-ADVERSARIAL",
  "test_path": "test/sample_divide_good_test.rb",
  "production_path": "lib/sample_divide.rb",
  "production_evidence_path": "production-evidence/sample-divide-good.json"
}
```

## Proof and execution boundaries

Identity and obligation graphs establish structural traceability only. Fidelity
verdicts compare normalized evidence and require review before they become
product-defect claims. Executable assurance is risk-triggered and must use
argv-only commands, a project-bounded working directory, timeout and output
limits, captured seed/version/threshold metadata, and redaction.

`PASS` is reserved for reliable and complete evidence in both test and
production directions. Inventory rows, token presence, source locations, and
successful adapter discovery are not runtime proof.

Generated evidence is bounded working data, not canonical intent. Persist it
only below:

`working/{REQ-TOKEN}/adversarial-inquiry/`

When `activation.phase` is present on `tied_adversarial_inquiry_run`, the
**authoritative** four artifacts are written under:

`working/{REQ-TOKEN}/adversarial-inquiry/phase-{phase}/`

where `{phase}` is one of `pre_implementation`, `verification`, or
`close_out`. Each inquiry phase gets its own directory; later phases do not
overwrite earlier ones. Receipts and `activation.artifacts` paths reference
only that phase directory.

The four files at the adversarial-inquiry **root**
(`obligation-report.json`, `finding-ledger.jsonl`, `gate-result.json`,
`evidence-provenance.json`) are a **latest/close-out convenience projection**
only. They are copied from the most recent phase-scoped run and must **never**
be used to satisfy another phase's gate pairing. Integrated activation gates
reject artifact paths that point at the root projection or at a sibling
`phase-{other}/` directory.

When no `activation.phase` is supplied, persistence continues to use the root
directory directly (legacy and non-integrated paths).

Snapshot files in the authoritative directory are atomically replaced, the
finding ledger is append-only with deterministic duplicate links, sensitive
values are redacted, and canonical TIED YAML remains byte-for-byte unchanged.

## Offline operation

The core identity, graph, normalization, fidelity, finding, eligibility, and
pilot modules run without network access. Offline runs should retain their
source revisions, evidence references, adapter diagnostics, and generated
report locally. If an assurance command cannot run, report `UNRESOLVED` or
`not_applicable` with a named limitation; never infer success from the command
inventory.

## Strict-mode promotion

New semantic rules remain non-blocking until the supported subset has:

1. negative controls for each blocking detector;
2. deterministic or bounded execution;
3. explicit proof boundaries and deterministic scope;
4. documented false-positive handling;
5. owned, expiring waivers;
6. representative pilot evidence and acceptable reviewer agreement.

The human approval must additionally name the reviewer, exact approved scope,
thresholds, waiver owner and expiry, rollback criteria, and approval revision.
Observed-only findings never trigger LEAP. Confirmed findings route to existing
checklist owners: `author-requirement`, `author-architecture`,
`resolve-pseudocode`, `unit-test-red`, `composition-integration`, or
`test-strategy`.

The live MCP tool is `tied_adversarial_inquiry_run`. Source registration is not
enough: rebuild/reload the server, verify tool discovery, and perform a
read-only smoke call before treating adoption as complete.

## Operator-only adoption evidence

The following checks require a human-operated CLI/Cursor MCP process and are
not asserted by the automated source tests:

```text
status: not_run
command: .cursor/skills/tied-yaml/scripts/tied-cli.sh tied_adversarial_inquiry_run @/tmp/inquiry-smoke.json
server: project-0-stdd-tied-yaml
timestamp: <record when run>
result: <record ok, verdict, gate, and artifact paths>
limitation: Automated tests prove source registration and handler behavior;
  they cannot prove that a separately running Cursor MCP process reloaded.
```

After rebuilding, reload the configured Cursor MCP server, confirm the tool in
its catalog, run the read-only smoke payload, and compare canonical TIED file
bytes before and after. Replace `status: not_run` with
`status: operator_verified` only after those steps are actually performed.

Keep local execution within five minutes and CI execution within fifteen
minutes. Two consecutive budget breaches stop subset expansion.
