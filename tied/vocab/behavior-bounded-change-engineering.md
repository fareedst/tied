# Behavior-Bounded Change Engineering (BBCE)

**Scope:** Change-locality and behavioral-slice vocabulary for TIED clients. Program reference: `PLAN-TIED-BBCE-ALIGNMENT` (W0–W4 advisory pilot). Terms **do not** replace REQ/ARCH/IMPL authority.

**W2 encodings:** Repo slice map [`../analysis/agentstream-slice-map.yaml`](../analysis/agentstream-slice-map.yaml) · declared surface example [`../analysis/examples/declared-change-surface.v1.example.yaml`](../analysis/examples/declared-change-surface.v1.example.yaml) · checklist optional field `declared_change_surface` · CITDP `risk_analysis.bbce_alignment.declared_change_surface_ref`.

**W3 build (advisory pilot):** `sub-shared-code-change-justification-pass` · modules `bbce-shared-code-justification.ts` / `bbce-boundary-violation-report.ts` · schemas `bbce-shared-code-justification.v1` / `bbce-boundary-violation.v1` · CITDP refs `shared_code_justification_ref`, `boundary_violation_report_ref` · pilot `working/PLAN-TIED-BBCE-ALIGNMENT/pilot/w3-*.json`.

**W4 build (Mechanism D promotion):** Checklist **`sub-bbce-advisory-verification-pass`** · Tracker flag **`bbce_advisory_enforced`** (STDD **rule B**: default **true** when new `[REQ-*]` or any `[ARCH-*]` detail change; default **false** for existing-REQ bug fixes with no ARCH changes; when true at verification-gate, CALL declared-surface validate, locality compare default off, B pass, C report — still advisory) · ARCH help: `templates/architecture-decisions/ARCH-BBCE_SLICE_OWNERSHIP_SNIPPET.yaml` + [`tied/docs/arch-bbce-slice-ownership-guide.md`](../docs/arch-bbce-slice-ownership-guide.md) · STDD: maintain `tied/analysis/agentstream-slice-map.yaml` when agentstream / mcp-server analysis bindings change; other clients **opt in** with `tied/analysis/{project}-slice-map.yaml`.

**Status:** Approved for this repository (sponsor 2026-09-27). Re-VALIDATE on glossary edits per `[PROC-VOCABULARY_INDEX]`.

**See also:** [`routing.md`](routing.md) (row **5i**) · [`tied-methodology.md`](tied-methodology.md) · [`quality-assurance.md`](quality-assurance.md) · [`pseudocode-and-citdp.md`](pseudocode-and-citdp.md) · [`residuality.md`](residuality.md) (contrast) · [`../../docs/bbce-and-tied-excerpt.md`](../../docs/bbce-and-tied-excerpt.md) · full synthesis (gitignored locally) [`../../docs/comparisons/tied-vs-behavior-bounded-change-engineering.md`](../../docs/comparisons/tied-vs-behavior-bounded-change-engineering.md) · source [`../../docs/methodologies/Behavior-Bounded-Change-Engineering-BBCE.md`](../../docs/methodologies/Behavior-Bounded-Change-Engineering-BBCE.md)

---

## Preferred terms vs synonyms

| Preferred | Avoid | Notes |
|-----------|-------|-------|
| **behavioral slice** | vertical slice folder (alone), feature folder (alone) | Externally meaningful use case with owning boundary; in TIED usually REQ-scoped traceability, not mandatory repo layout |
| **owning slice** | owner team (alone) | Behavioral unit expected to absorb an ordinary change without touching unrelated behaviors |
| **public behavioral boundary** | entry point (vague) | HTTP, CLI, message handler, job trigger — aligns with composition **binding trigger** column |
| **declared change surface** | scope doc (alone) | Pre-implementation declaration: behavior, slice, files/globs, boundary, tests, shared deps (BBCE §39) |
| **change locality** | local change score (alone) | `files_in_slice / total_files_changed`; proves diff-scope discipline, not correctness |
| **blast radius** | impact radius (alone) | Post-change propagation to unrelated slices or shared components |
| **boundary crossing** | cross-cutting edit (alone) | Edit or dependency leaving declared owning slice without ARCH justification |
| **boundary violation** | traceability gap (alone) | Cross-slice dependency or shared-infra feature logic not declared — distinct from missing token comments in files |
| **shared mechanism** | shared service (alone) | Cross-cutting infrastructure without feature-specific branches (auth, logging, serialization) |
| **shared feature decision-making** | shared business logic (vague) | Feature-specific rules in generic helpers — BBCE forbids; ARCH rationale must separate mechanism from meaning |
| **agent context locality** | small context (alone) | Relevant behavior tokens / total loaded context tokens (BBCE §30) |
| **BBCE locality loop** | slice workflow (alone) | Identify behavior → declare surface → minimal context → implement locally → compare planned vs actual → record metrics |

## Critical contrasts (do not conflate)

| BBCE term | TIED term | Distinction |
|-----------|-----------|-------------|
| **behavioral slice** | **module** (`[REQ-MODULE_VALIDATION]`) | Module = independent validation boundary before integration. Slice = change-ownership unit (often one REQ), may span multiple modules. |
| **behavioral boundary test** | **composition test** | Composition proves binding trigger→callee without UI. Behavioral test adds routing/serialization/persistence at public boundary — often integration, still UI-free. |
| **blast radius** | **impact-discovery** | Impact-discovery is pre-change token/module inventory. Blast radius is post-change regression propagation metric. |
| **change locality metric** | **plumb diff impact preview** | Preview maps semantic tokens in diff today; locality needs declared surface + path/slice classification (Mechanism A, W1+). |
| **boundary violation** | **traceability gap** | Gap = missing REQ/ARCH/IMPL token linkage in changed files. Violation = cross-slice edit not declared in ARCH or binding inventory. |
| **change_locality → 1.0** | **REQ satisfied** | High locality does not prove behavior matches intent; composition and unit tests remain authoritative. |

## Naming bridge (future mechanisms — not shipped in W0)

| Concept | Artifact / hook | Wave |
|---------|-----------------|------|
| Declared surface field | CITDP or Tracker `declared_change_surface` | W2 (Mechanism A) |
| Locality append | `plumb-audit/audit-log.jsonl` schema extension | W1–W2 |
| Shared-code pass | `sub-shared-code-change-justification-pass` (advisory pilot) | W3 shipped (Mechanism B) |
| Boundary violation report | `bbce-boundary-violation-report` analysis module | W3 build-plan (Mechanism C) |
| Shared-code record schema | `bbce-shared-code-justification.v1` | W3 refine example |
| Boundary report schema | `bbce-boundary-violation.v1` | W3 refine example |
| Checklist hook | `bbce_advisory_enforced` + `sub-bbce-advisory-verification-pass` | W4 build-plan shipped (Mechanism D, advisory) |
| Tracker flag | `bbce_advisory_enforced` | Opt-in verification bundle; not CI hard fail without separate REQ |
| Program Change ID | `PLAN-TIED-BBCE-ALIGNMENT` | W0 planning only |

## Authority boundary

1. BBCE **measures and constrains** how change spreads in repositories TIED already specifies.
2. TIED **owns** vocabulary → REQ → ARCH → IMPL → tests → code → quality evidence → LEAP.
3. Locality metrics, declared surfaces, and boundary heuristics remain **review-gated evidence** until promoted via LEAP and optional REQ tokens (`[REQ-TIED_FIDELITY_RESEARCH]` boundary).
4. BBCE does **not** mandate vertical-slice directory layout, replace `[REQ-*]` with informal slice names, or weaken existing TIED rules where TIED is stricter.

## Integration recommendation (W0 default)

**Adopt (revise):** Optional locality pass and metrics feeding existing checklist and plumb audit gates after W1 pilot calibration. Do not treat change locality as a CI hard fail or substitute for module validation and composition evidence.
