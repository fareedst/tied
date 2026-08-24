# Adversarial inquiry activation recommendation

**Audience:** TIED methodology maintainers  
**Evidence:** client pilots `1787416567` (Ruby/VolumeStats) and `1787507684` (Go/ROOTJOBS),
plus the existing `[REQ-TIED_ADVERSARIAL_INQUIRY]` stack  
**Date:** 2026-08-24 (updated after H5 live replay and pilot client refresh)

## Executive summary

Two integrated pilots now establish activation on different stacks:

1. **VolumeStats (`1787416567`)** — post-hoc integrated pilot (2026-08-22): seven
   `tied_adversarial_inquiry_run` calls via normalized input; four working artifacts;
   advisory gate; `depth_tier: integrated` in CITDP. Exposed the non-Ruby
   project-input adapter gap (documented limitation).

2. **ROOTJOBS (`1787507684`)** — H5 live operator replay (2026-08-24): Mode A builder
   (`build_adversarial_inquiry_from_tied.rb`) emits inquiry JSON without hand-authored
   envelopes; three phased runs with `tied_checklist_activation_collect` pairing and
   `tied_checklist_gate_validate` → all `allowed: true`; phase-scoped artifact dirs;
   `integrated_activation_complete: true` for `REQ-ROOTJOBS` via metrics analyzer.
   Runbook: `working/client-1787507684-activation-audit/replay-integrated-activation.sh`.

Adversarial inquiry should be considered **activated (integrated)** only when depth is
selected, the inquiry call is scoped to the request with distinct phase `run_id`s, the
four bounded artifacts exist per phase (or authoritative phase dirs), and gate pairing
succeeds. Checklist text and a passing TIED consistency check are specification or
structural evidence, not activation evidence.

**Methodology rollout:** `./copy_files.sh` was re-run on both pilot clients
(2026-08-24) to refresh skills, methodology indexes, vocabulary, and adversarial
inquiry artifacts without overwriting project-owned TIED data.

## Pilot evidence — VolumeStats (`1787416567`)

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

## Pilot evidence — ROOTJOBS (`1787507684`, H5)

Live replay on 2026-08-24 against `/Users/fareed/Documents/dev/test/1787507684` /
`REQ-ROOTJOBS`:

| Phase | run_id | Gate |
|-------|--------|------|
| pre_implementation | `rootjobs-pre-001` | `allowed: true` |
| verification | `rootjobs-verify-001` | `allowed: true` |
| close_out | `rootjobs-close-001` | `allowed: true` |

Operator path: Mode A builder → `tied_adversarial_inquiry_run` →
`tied_checklist_activation_collect` → `tied_checklist_gate_validate` (tracker
payload merges `sub_procedures` so `sub-adversarial-inquiry-pass` is visible).

Artifacts under `working/REQ-ROOTJOBS/adversarial-inquiry/phase-{phase}/`.
Metrics: `integrated_activation_complete: true` for `REQ-ROOTJOBS` with
`--project-root` analyzer pass.

Audit close-out: `working/client-1787507684-activation-audit/findings-report.yaml`;
Part **H5** checked in `docs/adversarial-inquiry-checklist-integration-checklist.md`.

## Activation maturity model

| State | Required evidence |
|---|---|
| **Specified** | Checklist, vocabulary, REQ/ARCH/IMPL records, and MCP registration exist. |
| **Conventional risk** | Normal CITDP risks, scenarios, and baseline tests exist; inquiry is not required. |
| **Activated (minimal)** | `depth_tier: minimal` plus explicit negative cases and falsification questions. |
| **Activated (integrated)** | Matching request-scoped inquiry metric, four working artifacts per phase (or phase dirs), executed checklist inquiry pass, and gate pairing when depth is integrated. |
| **Activated (strict)** | Integrated evidence plus strict eligibility, human approval, and scoped blocking. |

The default for behavior-changing work is `minimal`. `baseline-functional` is
an assurance profile, not an adversarial activation signal. `strict-candidate`
remains warn-only, and `strict-approved` may block only after eligibility and
human approval are both valid.

## Root causes and responses

1. **Adversarial tokens were not inherited by every client.** The bootstrap
   templates now include the adversarial REQ/ARCH/IMPL records, sidecars, and a
   fail-closed client verification step. Re-run `./copy_files.sh` on pilots after
   methodology changes.
2. **The canonical checklist contained methodology close-out evidence.** Its
   `execution_evidence` is now neutral and includes copy hygiene instructions.
3. **Depth was implicit.** The CITDP template now requires an explicit
   `risk_analysis.adversarial_inquiry.depth_tier`.
4. **Metrics did not expose paired activation signals.** The metrics analyzer
   now reports inquiry counts per client and, when given `--project-root`,
   checks phase subdirs and `integrated_activation_complete`.
5. **Go project-input adaptation is incomplete.** The repository provides a
   documented Mode A payload builder and operator replay runbook. H5 proved
   integrated activation without hand-authored envelopes. A native Go
   project-input adapter remains follow-up work (Slice G.2).

## Operating contract

At `risk-assessment`, record the depth tier independently from research and
assurance profiles. At integrated depth:

1. invoke the checklist sub-procedure with explicit request scope and advisory
   policy;
2. invoke `tied_adversarial_inquiry_run` when MCP is available;
3. persist only under `working/{REQ-TOKEN}/adversarial-inquiry/phase-{phase}/`
   (phase dirs are authoritative pairing locations);
4. use `tied_checklist_activation_collect` to assemble gate payloads when available;
5. preserve proof boundaries and evidence provenance;
6. keep observed findings outside canonical TIED YAML; and
7. route only confirmed findings through LEAP and their owning checklist step.

A call without all four bounded artifacts (or valid phase-dir pairing) is incomplete activation.

## Rollout priorities

### P0 — shipped

- Inherit the adversarial stack and verify it during `copy_files.sh`.
- Neutralize per-request checklist bootstrap state.
- Require CITDP depth selection.
- Pair inquiry metrics with request-scoped artifact checks (including phase dirs).

### P1 — shipped (2026-08-24)

- Documented Mode A builder for non-Ruby projects (`build_adversarial_inquiry_from_tied.rb`).
- Second non-Ruby integrated pilot without hand-authored envelope (**H5**, client `1787507684`).
- Operator replay runbook with collect + gate assembly.
- Part H pilots H1–H5 tracked in integration checklist.
- Pilot client refresh via `./copy_files.sh` on `1787416567` and `1787507684`.

### P2 — remaining

- Add a native Go evidence adapter (Mode B).
- Run strict eligibility and human-approval pilots.
- Keep automated YAML/Markdown parity as optional hardening unless adoption
  evidence shows it is needed.

## Release acceptance

A methodology release may claim integrated adversarial inquiry is operable when:

- [x] a fresh client has the adversarial REQ/ARCH/IMPL records and a neutral
  checklist execution state (`copy_files.sh` verification hooks pass);
- [x] behavior-changing CITDP records expose `depth_tier`;
- [x] a non-Ruby integrated pilot produces the inquiry metric, phase artifacts,
  and gate pairing using the documented Mode A builder (H5, `1787507684`); and
- [x] the metrics runbook defines inquiry calls and artifact presence as paired
  signals (`analyze_tied_mcp_metrics.rb --project-root`).

**Not required for integrated claim:** native Go project-input adapter (P2);
strict-approved blocking; retroactive upgrade of minimal-only clients such as
`1787503424`.

## Related artifacts

- Integration checklist Part H: `docs/adversarial-inquiry-checklist-integration-checklist.md`
- Operator friction plan §9: `docs/integrated-activation-enforcement-operator-friction-plan.md`
- H5 audit: `working/client-1787507684-activation-audit/findings-report.yaml`
- Adoption guide: `docs/adversarial-inquiry-adoption.md`
