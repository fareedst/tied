# Adversarial inquiry activation recommendation

**Audience:** TIED methodology maintainers  
**Evidence:** client pilot `1787416567` and the existing
`[REQ-TIED_ADVERSARIAL_INQUIRY]` stack  
**Date:** 2026-08-22

## Executive summary

The VolumeStats pilot first completed a conventional TIED flow: 38 successful
MCP calls, passing pseudo-code and consistency validation, and a
`baseline-functional` CITDP. It did not invoke adversarial inquiry.

After the gap was acknowledged, the client performed a bounded, post-hoc
integrated pilot. Seven `tied_adversarial_inquiry_run` calls, four working
artifacts, three CITDP writes, and final consistency validation established
that integrated inquiry can activate. The pilot also exposed the remaining
non-Ruby project-input adapter gap.

Adversarial inquiry should be considered activated only when depth is selected,
negative or adversarial cases are recorded, the inquiry call is scoped to the
request, and the four bounded artifacts are present. Checklist text and a
passing TIED consistency check are specification or structural evidence, not
activation evidence.

## Pilot evidence

The remedy phase ran from `17:22:33Z` through `17:29:48Z` and targeted:

`/Users/fareed/Documents/dev/test/1787416567/tied`

The client:

- rechecked the TIED base path;
- read the affected REQ/ARCH/IMPL details and ran a traceability gap report;
- attempted project-input inquiry twice, then used normalized-input inquiry;
- invoked `tied_adversarial_inquiry_run` seven times with advisory policy;
- persisted `obligation-report.json`, `finding-ledger.jsonl`,
  `gate-result.json`, and `evidence-provenance.json`;
- recorded `depth_tier: integrated` and the pilot limitation in CITDP; and
- ran final `tied_validate_consistency` and `yaml_index_validate` checks.

The inquiry result was `UNRESOLVED` with `status: warn` and `blocking: false`.
Two observed semantic-fidelity findings were retained in the append-only
finding ledger. Canonical TIED YAML was not mutated by inquiry.

## Activation maturity model

| State | Required evidence |
|---|---|
| **Specified** | Checklist, vocabulary, REQ/ARCH/IMPL records, and MCP registration exist. |
| **Conventional risk** | Normal CITDP risks, scenarios, and baseline tests exist; inquiry is not required. |
| **Activated (minimal)** | `depth_tier: minimal` plus explicit negative cases and falsification questions. |
| **Activated (integrated)** | Matching request-scoped inquiry metric, four working artifacts, and an executed checklist inquiry pass. |
| **Activated (strict)** | Integrated evidence plus strict eligibility, human approval, and scoped blocking. |

The default for behavior-changing work is `minimal`. `baseline-functional` is
an assurance profile, not an adversarial activation signal. `strict-candidate`
remains warn-only, and `strict-approved` may block only after eligibility and
human approval are both valid.

## Root causes and responses

1. **Adversarial tokens were not inherited by every client.** The bootstrap
   templates now include the adversarial REQ/ARCH/IMPL records, sidecars, and a
   fail-closed client verification step.
2. **The canonical checklist contained methodology close-out evidence.** Its
   `execution_evidence` is now neutral and includes copy hygiene instructions.
3. **Depth was implicit.** The CITDP template now requires an explicit
   `risk_analysis.adversarial_inquiry.depth_tier`.
4. **Metrics did not expose paired activation signals.** The metrics analyzer
   now reports inquiry counts per client and, when given `--project-root`,
   checks all four request artifacts.
5. **Go project-input adaptation is incomplete.** The repository now provides a
   documented Mode A payload builder as a bounded fallback. A native Go
   project-input adapter remains follow-up work.

## Operating contract

At `risk-assessment`, record the depth tier independently from research and
assurance profiles. At integrated depth:

1. invoke the checklist sub-procedure with explicit request scope and advisory
   policy;
2. invoke `tied_adversarial_inquiry_run` when MCP is available;
3. persist only under `working/{REQ-TOKEN}/adversarial-inquiry/`;
4. preserve proof boundaries and evidence provenance;
5. keep observed findings outside canonical TIED YAML; and
6. route only confirmed findings through LEAP and their owning checklist step.

A call without all four bounded artifacts is incomplete activation.

## Rollout priorities

### P0

- Inherit the adversarial stack and verify it during `copy_files.sh`.
- Neutralize per-request checklist bootstrap state.
- Require CITDP depth selection.
- Pair inquiry metrics with request-scoped artifact checks.

### P1

- Use the documented Mode A builder for non-Ruby projects.
- Pilot integrated depth on a second non-Ruby client without hand-authoring the
  request envelope.
- Track client activation evidence in Part H of the integration checklist.
- Keep the operating contract in both methodology guidance and copied
  `AGENTS.md` / `ai-principles.md`.

### P2

- Add a native Go evidence adapter.
- Run strict eligibility and human-approval pilots.
- Keep automated YAML/Markdown parity as optional hardening unless adoption
  evidence shows it is needed.

## Release acceptance

A methodology release must not claim that adversarial inquiry is live until:

- a fresh client has the adversarial REQ/ARCH/IMPL records and a neutral
  checklist execution state;
- behavior-changing CITDP records expose `depth_tier`;
- a non-Ruby integrated pilot produces the inquiry metric and four artifacts
  using either a native adapter or the documented builder; and
- the metrics runbook defines inquiry calls and artifact presence as paired
  signals.
