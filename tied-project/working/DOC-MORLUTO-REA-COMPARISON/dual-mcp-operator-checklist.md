# Dual-MCP operator checklist — TIED writes vs external investigation

**Initiative:** [DOC-MORLUTO-REA-COMPARISON](./PLAN.md) (doc-only compose — **no REQ mint** from this checklist)  
**Full guide:** [rea-with-tied-operator-guide.md](./rea-with-tied-operator-guide.md) (bootstrap, automation, handoff)  
**Skim time:** under two minutes before turns that enable **TIED YAML MCP** and an **external investigation MCP** (e.g. morluto/rea) together.

**Vocabulary:** [external-investigation-mcp.md](../../vocab/external-investigation-mcp.md) · **Distinct seam:** [authority-boundary operator checklist](../REQ-TIED_HARNESS_PLATFORM_SEAM/authority-boundary-operator-checklist.md) (harness vs platform-adjacent TIED).

| When | External investigation (tune here) | TIED governance (do not replace) |
| --- | --- | --- |
| **Before session** | Confirm sponsor scoped **third-party / shipped targets** only; source-available **stdd** work stays on git + TIED tools. | **`tied_config_get_base_path`** → intended **`tied-project/`** before any YAML write. |
| | Review MCP config merge after vendor setup — **install order discipline**; backups not assumed commutative. | Only **TIED YAML MCP** or **`tied-cli.sh`** (confirmed base path) mutates `tied-project/` indexes and detail files. |
| **Before turn** | PRELOAD [routing.md](../../vocab/routing.md) + [external-investigation-mcp.md](../../vocab/external-investigation-mcp.md). | PRELOAD [sponsor-agent-relationship.md](../../vocab/sponsor-agent-relationship.md) for costly choices. |
| | Pick compact/full investigation profile when context is tight — operator pattern only. | Use [activation map §0](../../../tied-bundle/docs/fresh-client-prompt-activation-map.md) for TIED depth (`full` / `minimal` / `none`). |
| **During investigation** | Treat vendor output as **external investigation evidence record** (**REA Evidence** when using REA); keep **unknowns** and **limitations** in the thread. | Do not paste Evidence ids, investigation prose, or vendor badges as `[REQ-*]` / gate receipts. |
| | Qualitative harness notes → **`tied_feedback_capture_observation`** ([harness trace observation loop](../../../tied-bundle/docs/harness-trace-observation-loop.md)). | Observations ≠ **`tied_checklist_gate_validate`** outcomes. |
| **After findings (TIED traceability)** | Stop — findings do **not** become R/A/I by citation alone. | Present findings as an **`@add-feature` event to the TIED system** (sponsor-authored scope) — see **REA → TIED add-feature** below. |
| **Before close-out** | Label target conclusions **REA-reported** / **target-repo-observed** where applicable. | Shipped claims still need checklist gates, **`tied_validate_consistency`** after YAML edits, **`tied_verify`** when verification-gated. |

---

## REA → TIED add-feature (required handoff)

**Rule:** When using REA (or a peer external investigation MCP) with TIED, **findings must be presented as an `@add-feature` event to the TIED system** — the same intake path as any other feature request. Evidence bundles and chat summaries do **not** substitute for that event; CITDP, refine-plan, build-plan, and checklist gates mint or extend **R/A/I** in `tied-project/`.

| Step | Operator action |
| --- | --- |
| 1 | Capture investigation output with explicit gaps; attach paths or Evidence ids **for human context only**. |
| 2 | Sponsor phrases scoped intent (working token, implementation repo, non-goals) and invokes **`@add-feature`** **to TIED** — not a parallel ad-hoc YAML edit from investigation prose. |
| 3 | Run **add-feature → refine-plan / build-plan** (and CITDP when promoted) so the TIED stack records outcomes — never reverse-import R/A/I from Evidence text alone. |

### add-feature goals (sponsor picks one)

| Goal | Typical use | What the TIED add-feature should capture |
| --- | --- | --- |
| **Existing implementation (R + A + I)** | REA informs what is **already shipped or in scope** in the **current** implementation (brownfield discovery, gap-fill, align tests/docs with observed behavior). | New or extended **REQ**, **ARCH**, and **IMPL** for that **same** implementation repo and platform — one coherent R+A+I stack under normal LEAP. |
| **Transform for another platform (R + A + I)** | REA extracts **features** from an external or reference target; sponsor wants a **re-platform, port, or parallel product** on a **different** platform/client. | A **new transform R+A+I**: requirements derived from investigated **features**, architecture and implementation **transformed** for the **target** platform (often a separate client/repo or explicit transform slice in sponsor text) — not silent copying of foreign artifacts into the source client’s IMPL without scoped build. |

**Anti-patterns**

- Pasting **REA Evidence** ids into `requirements.yaml` or CITDP as if they were acceptance criteria.
- LEAP or status changes triggered only by reverse-engineering conclusions (no CITDP / no tests).
- Using external investigation MCP to **write** `tied-project/` YAML (wrong MCP authority).

**Composable patterns**

- Doc-only outreach (comparisons, matrix rows, operator checklists): **`build-plan`** / **`non-tied-close`** under a working token — still **no** R/A/I mint from comparison prose unless sponsor promotes a **separate** add-feature for enforcement.

---

## Reference

- [morluto/rea × TIED (Wave 2)](../../../docs/comparisons/morluto-rea-reverse-engineering-vs-tied-agent-management.md) · [Wave 1 capture](../../../docs/comparisons/morluto-rea-reverse-engineering.md)
- [methodology composition matrix §2 row 19](../../../docs/comparisons/methodology-composition-matrix.md#section-2-layer-c-adjacent-frameworks)
- [Agent req implementation checklist](../../../tied-bundle/docs/agent-req-implementation-checklist.md) (`[PROC-AGENT_REQ_CHECKLIST]`)

**Out of scope for this checklist:** Installing REA, `rea-agents`, native engines, or stdd CI bundling — separate sponsor effort ([PLAN.md](./PLAN.md) § Out of scope).
