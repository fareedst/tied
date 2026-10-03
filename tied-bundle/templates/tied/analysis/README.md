# TIED analysis artifacts (BBCE / locality)

Optional change-footprint encodings for Behavior-Bounded Change Engineering (BBCE) Mechanism A. **Advisory only** — checklist authority and gate blocking are unchanged.

## Starter files (bootstrap `--with-bbce` / `--full-tools`)

| Path | Purpose |
| --- | --- |
| `slice-map.yaml` | Client-owned binding → owning REQ slice map (`bbce-slice-map.v1`) |
| `examples/declared-change-surface.v1.example.yaml` | Example declared surface for CITDP / `working/{CHANGE-ID}/` |

## Usage

1. Copy or adapt `examples/declared-change-surface.v1.example.yaml` into `working/{REQ-TOKEN}/`.
2. Set CITDP `risk_analysis.bbce_alignment.declared_change_surface_ref` and optional `slice_map_ref: tied/analysis/slice-map.yaml`.
3. Run checklist BBCE sub-procedures at verification when the operator opts in.

See `tied-project/vocab/behavior-bounded-change-engineering.md` (methodology) and `tied-bundle/docs/fresh-client-prompt-activation-map.md`.
