# TIED analysis artifacts (BBCE / locality)

**Scope:** Optional change-footprint encodings that support Behavior-Bounded Change Engineering (BBCE) Mechanism A. These files do **not** replace REQ/ARCH/IMPL authority or checklist gate blocking (W2: advisory only).

## Files

| Path | Schema | Purpose |
| --- | --- | --- |
| `agentstream-slice-map.yaml` | `bbce-slice-map.v1` | Repo-promoted binding → owning REQ slice map for `@tied/agentstream` |
| `examples/declared-change-surface.v1.example.yaml` | `bbce-declared-change-surface.v1` | Example per-request declared surface for CITDP / working folders |

## Maintenance rule (STDD — sponsor 2026-09-27)

1. **Required in this repo:** When you change `@tied/agentstream`, mcp-server analysis modules under `mcp-server/src/analysis/bbce-*`, or `tied/docs/composition-coverage.md` **Project inventory** rows for agentstream bindings, update `agentstream-slice-map.yaml` in the same change (or record an explicit deferral in the working CITDP with reason).
2. Keep `inventory_ref` and binding IDs aligned with composition-coverage binding labels.
3. `shared_mechanism_globs` lists cross-slice infrastructure (paths, repo-root, shared constants) — touches here are expected but should appear in `anticipated_shared_deps` on declared surfaces.
4. Per-request **declared change surfaces** stay under `working/{CHANGE-ID}/` until sponsor promotion; reference them from CITDP `risk_analysis.bbce_alignment.declared_change_surface_ref` (optional W2+).

## Longitudinal metrics (W2 spike)

- Working JSONL: `working/PLAN-TIED-BBCE-ALIGNMENT/change-locality/*.jsonl` (`bbce-locality-event.v1`)
- Optional plumb audit v2 dual-write: `plumb-audit-gate-log.v2` with `locality_summary_ref` when `PLUMB_AUDIT_LOCALITY=1` or `--locality-report` (default off)

**W4 + sponsor approval:** This repository treats `agentstream-slice-map.yaml` as the **live** map for agentstream/analysis work (not optional for those paths). Other TIED clients **opt in** with `tied/analysis/{project}-slice-map.yaml` and CITDP `slice_map_ref` — no mandatory vertical-slice directories.

**JSONL operator paths (optional):**

| Use | Path |
| --- | --- |
| Per-change pilot | `working/{CHANGE-ID}/change-locality/*.jsonl` (`bbce-locality-event.v1`) |
| Optional repo operator | `plumb-audit/audit-log.jsonl` when `PLUMB_AUDIT_LOCALITY=1` or `--locality-report` (default **off**) |

W4 build-plan documents paths in `docs/plumb-audit-gate.md`; **no** CI mandate.

See `docs/tied-bbce-alignment-plan.md` and `tied/vocab/behavior-bounded-change-engineering.md`.
