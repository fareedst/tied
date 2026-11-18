# Stub capture policy — no in-repo source copy (Waves 1–3)

| Field | Value |
| --- | --- |
| **request_token** | `REQ-TIED_EXTERNAL_SERVICE_COMPARISON` |
| **work_item** | `stub-capture-policy` (LEAP kaizen on implemented REQ) |
| **Linked Cursor plan** | `.cursor/plans/esc_no-source-copy_policy_686e0a31.plan.md` |
| **Parent PLAN** | [PLAN.md](PLAN.md) (original skill delivery; close-out complete) |
| **CITDP** | [CITDP-REQ-TIED_EXTERNAL_SERVICE_COMPARISON-stub-policy.yaml](../../citdp/CITDP-REQ-TIED_EXTERNAL_SERVICE_COMPARISON-stub-policy.yaml) |
| **Tracker** | [checklist-tracker-stub-capture-policy.yaml](checklist-tracker-stub-capture-policy.yaml) |
| **Test strategy** | [test-strategy-stub-capture-policy.md](test-strategy-stub-capture-policy.md) |
| **Retrofit inventory** | [evidence/retrofit-inventory.md](evidence/retrofit-inventory.md) |
| **Refined** | 2026-11-17 |
| **plan_phase** | `post-build` (implementation landed; close-out deferred) |
| **depth_tier / gate_policy** | `minimal` / `advisory` |
| **methodology_surface_change_class** | `prompt_type_workflow` · `surface_ref: external-service-comparison` |

---

## Refine (Touchpoint 1 — RESOLVE)

### Intent authority

Codify **stub capture** as normative for `@external-service-comparison`: committed outreach must be **link + metadata + paraphrased TL;DR** across Waves **1–3**, not offline mirrors of vendor articles, README dumps, extract sidecars, or vendored source trees. Align bundled skill, methodology template, contract tests, and LEAP stack with practice already used on HackerNoon, LangChain goal engineering, Furmanov, Open Governance, Ludanyi, and Heimsbakk captures.

**RESOLVE charter:** Wording and batch order may change; intent authority is **redistribution / compose-only outreach** without replacing checklist gates or MCP YAML authority.

### RESOLVE table

| Informal | Canonical | Disposition |
| --- | --- | --- |
| “Don’t copy the article” | **No-source-copy stub policy** | Required skill + template |
| Wave 1 full capture | **External reference index (stub)** | Replace template “full article sections” |
| Repo README in repo | **Paraphrased target-repo-observed summary** | Allowed; no vendor tree under `docs/` |
| Sponsor curriculum in repo | **Sponsor-proposed exempt** | `software-engineering-degree.md` unchanged |
| TIED-owned synthesis | **Exempt** | `system-one-jev-taxonomy-and-opportunities.md`, `jev-for-tied-improvement.md` |

### Consequence ladder

| Decision | Class | Default |
| --- | --- | --- |
| Skill + template + contract test LEAP | Reversible | Proceed |
| Static stub inventory bootstrap test | Reversible | Proceed (recommended) |
| Retrofit all legacy article captures in one commit | **Costly** | **Batch** by cluster (see inventory) |
| Trim Wave 2 analysis bodies | Defer | Only if grep finds vendor paste blocks |
| CHANGELOG historical rewrite | Defer | One-line note on implement close-out only |

### Compose-don’t-replace

| Tune (this work item) | Unchanged platform authority |
| --- | --- |
| Skill `Forbidden` / `Verify` / reference grep checks | `tied_checklist_gate_validate`, `tied_verify` |
| Template Wave 1–3 anti-patterns | Project YAML via MCP only after `add-feature` |
| Retrofit `docs/comparisons/*` stubs | Sponsor costly choices on matrix rows |

---

## Policy normative text (for skill §Procedure)

### Wave 1 — stub only

- Path unchanged: `docs/comparisons/{vendor}-{topic}.md`
- **Purpose** metadata must state: link + summary only; **does not reproduce** article body
- Required section: **Why this file has no article body** (or equivalent)
- **TL;DR:** paraphrase only; label **{Vendor}-reported**
- **Evidence:** `tied-project/working/DOC-{SLUG}-COMPARISON/evidence/url-fetch-receipt.md` — themes only, no pasted body
- **Forbidden:** scraped sections, hero+full prose, companion `.txt` / HTML extracts in repo

### Wave 2

- **Source summary** and §2+ are TIED paraphrase; sibling stub link; no re-pasting capture body
- Anti-pattern row in analysis: “Pasting vendor article into repository paths”

### Wave 3

- Compose docs/skills use TIED-owned prose; cite URL, do not paste vendor README/article into `tied-bundle/docs/` or skills

### Exemptions (no retrofit to stub shell)

| Path | Reason |
| --- | --- |
| `software-engineering-degree.md` | Sponsor-proposed curriculum |
| `system-one-jev-taxonomy-and-opportunities.md` | TIED canonical reference |
| `jev-for-tied-improvement.md` | TIED synthesis |
| `onono-research-capture-index.md` | Index only |
| Repo summaries without article paste | e.g. `open-ontologies-repository.md`, `morluto-rea-reverse-engineering.md`, `ndtp-ai-ontology-extension.md`, `apache-ossie.md` — trim only if future grep flags verbatim README blocks |

---

## Implementation slices (build-plan order)

| Order | Slice | Deliverable |
| ---: | --- | --- |
| 0 | **Spec** | `tied_config_get_base_path` → LEAP REQ/ARCH/IMPL; `STUB_CAPTURE_POLICY` block in [IMPL-TIED_EXTERNAL_SERVICE_COMPARISON-pseudocode.md](../../implementation-decisions/IMPL-TIED_EXTERNAL_SERVICE_COMPARISON-pseudocode.md); `pseudocode_validate` |
| 1 | **RED** | Extend [external-service-comparison-skill.test.mjs](../../../tools/bootstrap/lib/external-service-comparison-skill.test.mjs); add [comparison-capture-stub-policy.test.mjs](../../../tools/bootstrap/lib/comparison-capture-stub-policy.test.mjs) with exempt list |
| 2 | **GREEN** | [SKILL.md](../../../tools/bundled-prompt-type-skills/external-service-comparison/SKILL.md), `reference.md`, `examples.md` |
| 3 | **Template** | [external-service-three-wave-comparison-template.md](../../../tied-bundle/docs/external-service-three-wave-comparison-template.md) + light index cross-links |
| 4 | **Retrofit batch A** | LangChain harness, Traefik, Netflix, Cursor, Google skills, Anthropic appendix (see inventory) |
| 5 | **Retrofit batch B** | Onono essay cluster, Persante, LangWatch, Alibaba, Open Specter, NVIDIA methodology capture (paraphrase trim if article-like) |
| 6 | **Verify** | test-strategy commands, `tied_validate_consistency`, link grep, optional `CHANGELOG.md` one-liner |

**Inventory rule:** No changes to `LEAF_SKILLS` or router; methodology harness skill only.

---

## Retrofit batches (sponsor confirmed)

See [evidence/retrofit-inventory.md](evidence/retrofit-inventory.md) for file-level **stub / retrofit / exempt** table.

**Batch A (harness-adjacent articles, high traffic):** `langchain-improving-deep-agents-harness-engineering.md`, `traefik-harness-engineering-vs-platform-engineering.md`, `netflix-ontology-driven-observability.md` (drop Local extract row), `cursor-continually-improving-agent-harness.md`, `google-agent-skills-ship-like-products.md`, `anthropic-llm-formal-verification-appendix.md`.

**Batch B:** all `onono-*.md` captures except index; `persante-sdd-skills.md`, `langwatch-rebuilding-langwatch-in-51-days.md`, `alibaba-open-code-review.md`, `open-specter-legal-workspace.md`, `nvidia-auto-ontology.md` (if article-like body present).

**Already stubbed (verify only):** hackernoon, afurmanov, langchain-goal-engineering, open-governance, ludanyi, heimsbakk, arun (confirm line budget).

---

## Verification

See [test-strategy-stub-capture-policy.md](test-strategy-stub-capture-policy.md).

---

## Refine-plan boundary

This pass updates PLAN, CITDP addendum, Tracker, test strategy, retrofit inventory, and session handoff only — **no** skill edits, RED tests, YAML index writes, or capture retrofits until **`@build-plan`**.

**Next:** `@build-plan` on this file (`PLAN-stub-capture-policy.md`).

**Forbidden:** `pbpaste`/`pbcopy`, automatic git, direct project YAML when MCP available, methodology `tied-bundle/` index YAML mutations.