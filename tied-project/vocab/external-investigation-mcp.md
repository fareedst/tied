# External investigation MCP (canonical)

**Scope:** Vocabulary for **dual MCP** client repos where **TIED YAML MCP** shares an IDE with an optional **external investigation MCP** (e.g. morluto/rea reverse-engineering tools). **Vocabulary only** — describes literacy when a sponsor **already** enabled an external investigation MCP. **Does not** cover installing REA, `rea-agents` setup, native engines, or **stdd CI** bundling — those belong to a **separate sponsor effort**, not `DOC-MORLUTO-REA-COMPARISON` methodology compose.

**Traceability:** Outreach — [morluto/rea × TIED](../../docs/comparisons/morluto-rea-reverse-engineering-vs-tied-agent-management.md) · [methodology composition matrix §2 row 19](../../docs/comparisons/methodology-composition-matrix.md#section-2-layer-c-adjacent-frameworks) · [DOC-MORLUTO-REA-COMPARISON](../working/DOC-MORLUTO-REA-COMPARISON/PLAN.md) (no REQ mint from comparison prose).

**See also:** [`tied-yaml-mcp.md`](tied-yaml-mcp.md) · [`quality-assurance.md`](quality-assurance.md) · [`feedback-to-tied.md`](feedback-to-tied.md) · [`sponsor-agent-relationship.md`](sponsor-agent-relationship.md) · [harness trace observation loop](../../tied-bundle/docs/harness-trace-observation-loop.md) · [Traefik harness/platform × TIED](../../docs/comparisons/traefik-harness-platform-vs-tied-agent-management.md) (distinct seam vocabulary).

---

## Preferred terms vs synonyms

| Preferred | Avoid | Notes |
| --- | --- | --- |
| **dual MCP seam** | dual server setup, two MCPs (alone) | Coexistence of **TIED YAML MCP** ( **`tied-project/` write authority** ) and an **external investigation MCP** (target read / investigation) in one agent client. Distinct from **harness/platform seam** (Traefik comparison): that row splits in-IDE harness tuning vs TIED governance for the **same** implementation repo. |
| **external investigation MCP** | REA MCP alone, reverse-engineering server | Optional MCP surface for third-party binaries, shipped artifacts, or retained investigation sessions. Does not replace **TIED YAML MCP** or **`tied-cli.sh`** for project indexes. |
| **external investigation evidence record** | investigation output, vendor evidence bundle | Neutral claim class: structured investigation result with explicit **limitations** and **unknowns**. Vendor instance: **REA Evidence** (morluto/rea). |
| **REA Evidence** | evidence record (unqualified), rea evidence | **REA-reported** vendor shape of **external investigation evidence record** (`docs/reference/mcp-contracts.md`, target-repo-observed). Cite proof boundary; not TIED effectiveness. |
| **investigation-to-add-feature handoff** | paste evidence as requirement, Evidence id as REQ, investigation-to-REQ (alone) | REA findings → mandatory **`@add-feature` event to the TIED system**; sponsor goal is either **R+A+I of the existing implementation** or **feature capture → new transform R+A+I for a different platform**. TIED workflows mint R/A/I — never from Evidence paste alone ([dual-mcp-operator-checklist.md](../working/DOC-MORLUTO-REA-COMPARISON/dual-mcp-operator-checklist.md)). |
| **TIED MCP write authority** | yaml authority, only tied may write | Only **TIED YAML MCP** (or **`tied-cli.sh`** with confirmed **TIED base path**) mutates `tied-project/` indexes and detail files. External investigation MCPs remain read/investigate for targets unless sponsor scopes otherwise. |
| **install order discipline** | commutative mcp merge | **`tied-install.sh`** and vendor **`rea setup`** (or peers) both touch client MCP config; merges are **not** assumed commutative — sponsor reviews backups and **`tied_config_get_base_path`** after setup. |

---

## Proof boundary (non-implication)

| External investigation evidence record / **REA Evidence** | TIED platform-adjacent proof |
| --- | --- |
| Conclusions about **external** or **shipped** targets with stated gaps | **`tied_checklist_gate_validate`** receipts |
| Session bundles, comparison authenticity checks (**vendor** semantics) | **`tied_validate_consistency`** on project YAML |
| Harness qualitative notes via **`tied_feedback_capture_observation`** | **`tied_verify`** when verification-gated |
| Motivates R/A/I only after **`@add-feature` to the TIED system** (investigation-to-add-feature handoff) | Automatic LEAP from investigation text alone |

Label vendor metrics and badges **REA-reported** / **`not_measured`** for stdd methodology effectiveness unless an independent cohort REQ exists.

---

## Operator compose (recorded 2026-11-08)

| Surface | Role |
| --- | --- |
| [client-development-index.md](../../tied-bundle/docs/client-development-index.md) | Quick-read dual-MCP literacy |
| [harness-trace-observation-loop.md](../../tied-bundle/docs/harness-trace-observation-loop.md) | **Dual MCP authority** failure-mode class |
| [rea-with-tied-operator-guide.md](../working/DOC-MORLUTO-REA-COMPARISON/rea-with-tied-operator-guide.md) | **Canonical** bootstrap, handoff, automation |
| [dual-mcp-operator-checklist.md](../working/DOC-MORLUTO-REA-COMPARISON/dual-mcp-operator-checklist.md) | Paste-friendly skim; **add-feature** handoff shapes |
| `@external-service-comparison` | Three-wave capture → analysis → improve TIED |

---

## Alphabetical index

| Term | Section |
| --- | --- |
| dual MCP seam | Preferred terms |
| external investigation evidence record | Preferred terms; Proof boundary |
| external investigation MCP | Preferred terms |
| install order discipline | Preferred terms |
| investigation-to-add-feature handoff | Preferred terms |
| REA Evidence | Preferred terms; Proof boundary |
| TIED MCP write authority | Preferred terms |
