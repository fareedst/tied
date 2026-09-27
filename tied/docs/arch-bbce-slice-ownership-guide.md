# Optional ARCH sections for BBCE slice ownership

**Scope:** STDD / TIED clients using Behavior-Bounded Change Engineering (BBCE) **advisory** hooks. This guide is **not** a methodology rule and does not create REQ tokens.

**When to use:** You are writing or updating an `[ARCH-*]` detail file for a feature that has a clear “owning” behavior (usually one `[REQ-*]`). You want architects to record where change is expected to stay local before implementation.

## Quick path

1. Open the paste-in template: [`templates/architecture-decisions/ARCH-BBCE_SLICE_OWNERSHIP_SNIPPET.yaml`](../../templates/architecture-decisions/ARCH-BBCE_SLICE_OWNERSHIP_SNIPPET.yaml) (repo root; copied to clients via methodology refresh for structure only).
2. Copy the optional YAML sections into your **project** ARCH detail under `tied/architecture-decisions/`.
3. Point `slice_map_ref` at your slice map if you maintain one (see [`tied/analysis/README.md`](../analysis/README.md)).

## What each section means (plain language)

| Section | You document |
| --- | --- |
| `owning_slice_req` | Which requirement “owns” this change (the behavior users care about). |
| `public_behavioral_boundaries` | How the feature is invoked from outside (CLI, HTTP, job, MCP tool, etc.). |
| `shared_mechanisms_touched` | Shared infrastructure you expect to edit (logging, paths, auth helpers) — not feature rules hiding in generic code. |
| `anticipated_cross_slice_deps` | Other behaviors or modules you might touch; needs an explicit ARCH reason if you leave the owning slice. |
| `slice_map_ref` | Path to `tied/analysis/*-slice-map.yaml` when the project uses one. |

## What this does **not** do

- Does not replace composition tests, REQ acceptance, or verification-gate.
- Does not require a particular folder layout (“one folder per slice”).
- Does not block CI or commits by itself.

**See also:** [`tied/vocab/behavior-bounded-change-engineering.md`](../vocab/behavior-bounded-change-engineering.md) · [`docs/tied-bbce-alignment-plan.md`](../../docs/tied-bbce-alignment-plan.md) · sponsor decisions `working/PLAN-TIED-BBCE-ALIGNMENT/w4-refine/w4-promotion-decisions.md`
