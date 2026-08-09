# TIED fidelity research methodology

**Status:** Active methodology  
**Audience:** TIED client projects and agents performing read-only defect-origin analysis  
**Traceability:** `REQ-TIED_FIDELITY_RESEARCH` → `ARCH-TIED_FIDELITY_RESEARCH` → `IMPL-TIED_FIDELITY_RESEARCH`

## Purpose

This procedure distinguishes behavioral correctness from translation fidelity across:

`domain vocabulary → REQ → ARCH → IMPL pseudo-code → tests → code → documentation`

It must not classify every observation as a product bug. Approved specification changes,
implementation lag, missing specification, translation defects, binding defects, and
unresolved cases remain distinct.

## Client operating modes

- **Integrated agent profile:** warn-first observations during ordinary development.
- **Human research profile:** complete, read-only analysis with evidence matrices and
  independent adjudication.

Both modes use the same finding lifecycle:

`observed → triaged → confirmed / dismissed / deferred → linked → remediated → verified`

## Read-only boundary

Before analysis, confirm that `tied_config_get_base_path` resolves to the analyzed
project’s absolute `tied/` directory. A research pass:

- does not write audited project source, tests, project YAML, or methodology YAML;
- keeps the research dataset outside the audited project TIED tree;
- excludes `tied/methodology/`, templates, examples, fixtures, and generated output;
- records structural validators as artifact-consistency evidence only;
- requires explicit human or policy promotion before REQ/ARCH/IMPL mutation.

Remediation is a separate LEAP operation: IMPL → ARCH → REQ, followed by test/code
alignment and revalidation.

## Per-change procedure

1. Establish prior and current approved specification state before treating tests or
   code as regression evidence.
2. Create a bounded project manifest with project root, TIED base path, versions,
   language/test classifiers, and ignore rules.
3. Snapshot the selected revision range and retain hashes, commands, paths, and
   provenance without modifying the audited project.
4. Run structural checks:
   `tied_validate_consistency`, `pseudocode_validate`, traceability-gap analysis,
   dependency cycles, binding inventory validation, and applicable test adequacy.
5. Audit each IMPL block in both directions:
   pseudo-code → test/code evidence for reliability, and test/code evidence →
   pseudo-code for completeness.
6. Audit composition seams separately from unit behavior. Verify trigger, channel,
   callee, arguments, effects, ordering, failure behavior, and UI-free evidence.
7. Append candidate findings with lifecycle, severity, confidence, visibility,
   evidence references, and proof boundaries. Link duplicates instead of overwriting
   the original observation.
8. Require independent reviewer decisions before promoting a confirmed finding to a
   case report.
9. Re-run the same revision and configuration to verify deterministic evidence and
   duplicate-link behavior.

## Evidence and classification

Every finding records its discovery layer, suspected origin layer, first divergent
edge, current behavior, desired behavior, evidence paths and revisions, confidence,
reviewer decision, and proof boundary.

Structural success does not prove runtime correctness. Fidelity evidence measures
the specification transform; it does not by itself establish a user-visible defect.

## TIED client use

`copy_files.sh` installs this guide, the fidelity vocabulary, and the methodology
REQ/ARCH/IMPL records into the client’s inherited methodology view. Client-specific
findings and CITDP records remain client-owned. The client may add project-specific
analysis adapters or a research dataset without editing `tied/methodology/`.

The bundled `pseudocode-fidelity-audit-agent-prompt.md` provides the detailed
Stages 0–4 read-only audit report and optional Stage 5 LEAP remediation procedure.
