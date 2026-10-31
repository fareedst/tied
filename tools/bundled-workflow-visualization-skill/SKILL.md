---
name: workflow-visualization
description: "Generate sponsor-facing workflow Markdown with Mermaid from EDPC/comprehension artifacts or bounded static source reads. Outputs docs/<project>-workflows.md (optional output_dir). Use after brownfield comprehension or standalone via /workflow-visualization or @workflow-visualization. Docs-only: no TIED writes, no src edits, no connection strings."
disable-model-invocation: true
---

# workflow-visualization

**Audience:** sponsor or operator who wants **discoverable** workflow diagrams under `docs/` after program comprehension or a static baseline read.

Explicit invocation only (`/workflow-visualization`, `@workflow-visualization`).

## Boundaries

| Surface | Role |
|---------|------|
| **`@workflow-visualization`** | Writes user-facing `docs/*` on the **target implementation repo** only |
| **EDPC F / H** | Consumes publish manifest and client assessment; does **not** replace machine evidence under `tied-project/working/` |
| **`@handoff`** | Use after comprehension to continue; this skill may be suggested in Do next |
| **`@non-tied-plan`** | One-off doc without this bundled procedure |

**Runtime prohibitions:** Do not mint REQ/ARCH/IMPL; do not edit `src/`; do not paste connection strings, secrets, or production host literals; do not claim runtime behavior above the recorded evidence tier.

## Procedure

1. **Strip prefix** — Remove `/workflow-visualization`. Parse remainder for: `request_token`, `output_dir` (default `docs/`), `project` slug override, `hub_only: true`, `migrate_reports: true` (step 9 only).

2. **Scope target repo** — Prefer `edpc_engagement.target_repository_root` or charter target path when present; else the client implementation repo root. Comprehension artifacts are read from that repo’s `tied-project/working/{REQ}/`.

3. **Resolve inputs (read-only)** — in order:
   - Sponsor-named paths.
   - `tied-project/working/{REQ}/evidence/edpc/` (charter, SCM shell, claims ledger, publish manifest, queues).
   - Sibling `evidence/reports/` (system map, architecture summaries, inventory JSON/YAML).
   - Optional client assessment (workflow **H**).
   - If thin: bounded static read of `src/` and root manifests; record baseline revision (sponsor-pasted git context only — **no automatic git**); default tier **`source_static`**.

4. **Resolve `<project>` slug** — override → package/pyproject/pom name → directory basename; kebab-case `[a-z0-9-]+`.

5. **Build workflow inventory** — dedupe flows from charter journeys, `claims-ledger.v1.yaml`, `edpc-queues.v1.yaml`, EASAR inventory entry points, reports, CAM assertions, static hosts (APIs, consumers, schedulers, CLIs). Classify: **critical domain**, **integration boundary**, **operator**, **batch/ops**, **supporting**.

6. **Compose** — Follow [reference.md](./reference.md) **Visualization catalog**. Populate hub **Workflow inventory** table. **Must include** diagrams for: all integration flows, all critical domain flows, primary operator path (A4). **Never invent services**; use dashed edges for unverified config/endpoints; solid edges need inventory, report, or static citation in prose (**Derived** vs **Declared**).

7. **Write outputs**
   - `{output_dir}/<project>-workflows.md` (hub) — include **Verification gaps** (no build/test/DB unless evidenced, unverified integrations, config ≠ production truth).
   - Optional `{output_dir}/<project>-workflows-<domain-slug>.md`, `{output_dir}/<project>-integrations.md` per reference packaging rules.
   - `{output_dir}/README.md` when the folder is new.

8. **Optional step 9** — When `migrate_reports: true`: move selected `working/.../evidence/reports/` markdown into `docs/`, retarget links; sponsor review required.

9. **Summarize** — paths written, inventory count, gaps, optional `@handoff`.

## Mermaid

- Prefer `flowchart`; use `sequenceDiagram` for cross-system timing when helpful.
- camelCase node IDs; quote edge labels when needed.
- Link sibling `docs/` and machine evidence paths; do not duplicate long tables.

## Related

- **Catalog:** [reference.md](./reference.md)
- **[REQ-TIED_WORKFLOW_VISUALIZATION_SKILL]** · **[REQ-TIED_CLIENT_BOOTSTRAP_SKILLS]** · **[PROC-EDPC_COMPREHENSION]**
