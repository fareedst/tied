---
name: readme-information-architecture
description: "Improve navigation, visual hierarchy, and context transitions of an accurate README or technical Markdown document without changing meaning. Store TIED repo: README, docs/, and linked specs. Explicit /readme-information-architecture or @readme-information-architecture. Not methodology; docs and generator presentation only."
disable-model-invocation: true
---

# readme-information-architecture

**Audience:** maintainers working in the **TIED methodology store** (or sponsor-authorized doc repos) who need presentation-layer improvements to README or long-form Markdown.

**When:** Content is complete and accurate but hard to scan, navigate, or follow across subject changes — especially the store `README.md`, `docs/`, and generator-owned Markdown.

Explicit invocation only (`/readme-information-architecture`, `@readme-information-architecture`).

[REQ-TIED_STORE_README_IA_SKILL] · [REQ-TIED_CLIENT_BOOTSTRAP_SKILLS] · [REQ-TIED_STORE_README_EXPERIENCE_HUB]

## Boundaries

| Surface | Role |
|---------|------|
| **This skill** | Markdown presentation and authorized generator/template layers |
| **Methodology (`tied-bundle/`)** | **Out of scope** — do not install or copy this skill into inherited methodology; it is **store-only** via `STORE_FACILITATOR_SKILLS` |
| **TIED YAML / REQ–ARCH–IMPL** | Do not mint or edit project tokens unless the sponsor scopes a separate TIED change |
| **`src/` / product code** | No edits unless the sponsor explicitly ties generator fixes to presentation |

**Runtime prohibitions:** No summarizing away substantive content; no modality weakening (`must` → `should`); no invented architecture in diagrams; no disposable-client bootstrap of this skill.

## Procedure

1. **Strip prefix** — Remove `/readme-information-architecture` or `@readme-information-architecture`. Remainder names the **target document** (default: path in task, else sponsor-named file) and optional flags: `assess-only`, `renderer: github`, `preserve: strict`.

2. **Workspace gate** — Confirm you are editing the intended repo. For store README work, prefer the TIED store root; call `tied_config_get_base_path` when TIED MCP is in play so YAML writes are not mis-targeted.

3. **Execute reference workflow** — Follow [reference.md](./reference.md) Phases 1–8 (discover → diagnose → design IA → implement boundaries → intent navigation → visuals → generator integration → validate).

4. **Store defaults** — Primary targets: root `README.md`, `docs/tied-experience/` hub pages, and other store docs linked from README IA work under [REQ-TIED_STORE_README_EXPERIENCE_HUB]. If Markdown is generated, fix the **generator/template** layer and re-run generation twice.

5. **Deliverables** — Per reference **Output contract**: revised Markdown (or generator changes), IA map, change summary, preservation report, verification report. Place optional working notes under `tied-project/working/{REQ}/evidence/` only when the sponsor scoped a TIED-tracked README initiative.

6. **Summarize** — List files touched, checks run, and any anchors intentionally renamed (with link updates).

## Related

- **Procedure (full):** [reference.md](./reference.md)
- **Bootstrap:** `tools/bootstrap/manifest.json` → `STORE_FACILITATOR_SKILLS` (self-install on store only, parallel to `@record-gf-trial` / `@record-wf-trial`)
