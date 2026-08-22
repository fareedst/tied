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

## Initial configuration

### Mode A — supported today

The currently supported MCP contract is **normalized-input inquiry (Mode A)**:
the caller supplies the normalized `graph`, `fidelity`, and `scope` inputs.
The analysis reads caller-provided normalized records and produces generated
evidence; it does not scan project paths or write project YAML.

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

The four stable artifacts are `obligation-report.json`,
`finding-ledger.jsonl`, `gate-result.json`, and
`evidence-provenance.json`. Snapshot files are atomically replaced, the
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
