---
name: AI-SDLC ATDD Software Factory comparison
overview: Reconcile the completed Wave 2 comparison deliverables, preserve the document-only proof boundary, and identify the sponsor-owned next step without reopening TIED implementation work.
todos:
  - id: reconcile-deliverables
    content: Reconcile the plan with the existing comparison document and git allowlist
    status: completed
  - id: preserve-proof-boundary
    content: Preserve target-repo-observed, Factory-reported, and not_measured claim labels
    status: completed
  - id: record-gate-state
    content: Record the blocked outreach pre-implementation gate without treating it as implementation authorization
    status: completed
  - id: sponsor-next-step
    content: Sponsor chooses whether to commit the doc-only change or invoke close-out for envelope synchronization
    status: completed
isProject: false
---

# AI-SDLC ATDD Software Factory × TIED — refined plan (pass 2)

**Refined:** 2026-10-23  
**Prior pass:** [PLAN-refine-pass1.md](./PLAN-refine-pass1.md)  
**Working token:** `DOC-AI-SDLC-FACTORY-COMPARISON` (outreach document bundle; no REQ mint)  
**Tracker:** [checklist-tracker-refine.yaml](./checklist-tracker-refine.yaml)  
**Build handoff:** [evidence/build-plan-handoff.md](./evidence/build-plan-handoff.md)

## Refine — execution reconciliation

Pass 1 described the comparison and allowlist as future deliverables. Both now exist:

| Deliverable | Current state |
| --- | --- |
| [docs/comparisons/ai-sdlc-atdd-software-factory-vs-tied.md](../../../docs/comparisons/ai-sdlc-atdd-software-factory-vs-tied.md) | Done; Wave 2 analysis published as a working-tree change |
| [`.gitignore`](../../../.gitignore) allowlist | Done; comparison path is explicitly unignored |
| Target evidence | Read-only inspection only; target tests and run records were not re-executed |
| TIED YAML | Unchanged; no REQ/ARCH/IMPL token was minted |

The comparison correctly treats the target as a prototype/reference application: the
Software Factory is the product vision, PetClinic is the proving ground, and target
outcomes remain **Factory-reported** or **target-repo-observed/documented** unless
independently reproduced.

## Scope and gate reconciliation

The scope remains **Wave 2 document-only outreach**:

- `profile_depth: minimal`
- `gate_policy: outreach_doc_only`
- `change_class: comparisons_doc_only`
- `no_req_mint: true`
- no target `npm test`, `spec/run-all.js`, or run-record generation
- no TIED YAML, vocabulary, methodology, or MCP behavior changes

The read-only `tied_checklist_gate_validate` call for the current tracker returned:

```text
allowed: false
diagnostic: malformed_citdp:adversarial_inquiry
```

This is an honest limitation of the sparse outreach tracker, not a signal to add
integrated inquiry or behavior-changing evidence to a documentation-only comparison.
The tracker already records the outreach `pre_implementation` block and the build
handoff records that the document and allowlist are complete. Do not claim that the
blocked gate is a successful implementation gate; also do not reopen completed
deliverables merely to force a full feature workflow onto this outreach item.

## Resulting comparison content

The completed document contains:

1. Target identity, use, architecture, workflow, and evidence boundary.
2. The target’s specification-first sequence: frozen expectations → contracts →
   protected red tests → implementation → verification → reconstruction.
3. Crosswalks from Gherkin, OpenAPI/domain/runtime contracts, OBS/CTL rules,
   black-box HTTP tests, exact-tree run records, and reconstruction rehearsals to
   TIED vocabulary, REQ/ARCH/IMPL, module validation, checklist gates, and evidence.
4. An Align/Composable/Tension/Gap/Defer capability matrix and authority-boundary
   diagram.
5. Anti-patterns and explicit non-adoptions, including local-ID/token confusion,
   run-record overclaiming, and treating Factory outcomes as TIED effectiveness.
6. Bounded recommendations: operator crosswalks and experiment guidance now;
   run-record import, protected-spec profiles, traceability adapters, and
   reconstruction tooling only as future scoped work.

## Test strategy and evidence

The doc-only verification recorded in the build handoff remains authoritative for
this pass:

- section parity with the Wave 2 template;
- claim-label and proof-boundary review;
- link and scope review;
- token scan confirming no new project token;
- `tied_validate_consistency` not run because project YAML was not changed.

The target’s own `npm test`, `npm run test:verify`, reconstruction rehearsal, and
historical run records are not evidence produced by this session.

## Remaining work

No implementation work remains in this plan. The only open sponsor-owned choices are:

| Choice | Consequence |
| --- | --- |
| Commit the two doc-only changes | **Done** — `eb501dae` (2026-10-23); see traceable-commit evidence |
| Invoke close-out for envelope synchronization | Optional process work; not required to describe the Wave 2 comparison |
| Promote any recommendation to TIED behavior or YAML | Costly; requires a new scoped `add-feature`/`build-plan` workflow with REQ/ARCH/IMPL, tests, and gates |

Wave 3 candidates remain deferred: run-record/tree-hash integration with request
evidence, a protected-spec/runtime-contract client profile, a local-ID bridge, a
reconstruction runner, or factory-core methodology changes.

**Build-plan status:** Complete (pass 2 re-invocation 2026-10-23 confirmed idempotent; no new edits to comparison).  
**Close-out status:** Deferred; optional envelope sync only if sponsor explicitly requests **close-out**.
