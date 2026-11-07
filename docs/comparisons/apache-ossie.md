# Apache Ossie (incubating)

| Field | Value |
| --- | --- |
| **Source** | [apache/ossie](https://github.com/apache/ossie) — Apache **incubating** project |
| **Authors** | Apache Ossie community (ASF) |
| **Published** | Ongoing; core spec **0.2.0.dev0** (**spec-observed**, draft) |
| **Purpose** | Read-only repository capture for comparison and architecture reference — **external content**; this document does not mint REQ/ARCH/IMPL tokens. |
| **Captured** | 2026-11-07 |
| **Former name** | **Open Semantic Interchange (OSI)** (**Ossie-reported** in README) |
| **Analysis (sibling)** | [apache-ossie-vs-tied-agent-management.md](apache-ossie-vs-tied-agent-management.md) |
| **Related captures** | [nvidia-auto-ontology.md](nvidia-auto-ontology.md) (NVIDIA cites Ossie interop), [open-ontologies-repository.md](open-ontologies-repository.md) |

## TL;DR

All bullets **Ossie-reported** or **spec-observed** unless labeled **roadmap-reported**.

- **Goal:** Vendor-neutral **JSON/YAML** interchange for **semantic models** across analytics, AI, and BI so KPIs and business logic stay consistent as data moves between tools (**Ossie-reported**).
- **Problem:** Same KPI defined differently across tools; manual reconciliation; AI outputs grounded in inconsistent business semantics (**Ossie-reported**).
- **Artifacts:** `core-spec/` (semantic model spec), `ontology/` (concept layer), `validation/`, `compliance/` (portability grader), `python/` SDK, `examples/` (e.g. TPC-DS), external [apache/ossie-converters](https://github.com/apache/ossie-converters) (**spec-observed**).
- **Semantic model document:** `version`, `name`, `datasets`, optional `metrics`, `relationships`, `custom_extensions`, optional **`ai_context`** for AI tools (**spec-observed**).
- **Dialect:** `OSSIE_SQL_2026` is the portable SQL expression language defined by the spec; other dialect strings are opaque to the core (**spec-observed**).
- **Roadmap:** Active work on **metric semantics** (grain, aggregation, relationships); **catalog integration**; **ontology & conceptual interoperability** above physical layout; **AI-native** semantic layer (`ai_context`, verified queries); **governance** (stable IDs, certification hooks) (**roadmap-reported**).
- **Structural vs conceptual:** README/roadmap distinguish **structural** interoperability (common file format) from **conceptual** interoperability (shared business concepts across models) — latter is future WG focus (**roadmap-reported**).

---

## Problem and vision

Apache Ossie positions itself as a collaborative effort to **standardize semantic model exchange** in the data analytics, AI, and BI ecosystem (**Ossie-reported**). The stated vision is a **vendor-agnostic** specification that acts as a **single source of truth** for definitions as they move between AI agents, BI platforms, and other tools (**Ossie-reported** — evaluation readers should treat SoT language as **narrative**, not TIED proof).

Pain points called out in README: duplicate KPI definitions, reconciliation labor, unreliable agent answers when business logic diverges (**Ossie-reported**).

---

## Repository map

| Path | Role (**spec-observed**) |
| --- | --- |
| `core-spec/` | `spec.md`, `spec.yaml`, `ossie-schema.json` — semantic **model** interchange |
| `ontology/` | `ontology.md`, schemas — **concept** models above datasets |
| `validation/` | `validate.py` — schema, references, SQL syntax checks |
| `compliance/` | Portability grader and relational query interface tests |
| `python/` | Pydantic v2 SDK for parse/validate/serialize |
| `examples/` | Sample models (e.g. TPC-DS) |
| `extensions/` | Dialect and vendor token registry |
| `bi-sql-examples/` | SQL query shapes BI tools may emit |
| `scripts/` | Spec tooling (e.g. type generation) |
| **External** | [apache/ossie-converters](https://github.com/apache/ossie-converters) — hub-and-spoke format conversion |

---

## Semantic model (core spec)

Each standalone JSON or YAML document is **one semantic model** (**spec-observed**).

Required root fields include **`version`**, **`name`**, and non-empty **`datasets`**. Common optional fields:

- **`description`** — human summary
- **`ai_context`** — string or structured hints for AI consumers
- **`relationships`** — joins between logical datasets
- **`metrics`** — model-scoped measures (including cross-dataset cases per metric scoping rules)
- **`custom_extensions`** — vendor-specific payloads without breaking core parsers

Bulk exchange uses separate model documents; the spec does not define a bundle format for cross-model references in one file (**spec-observed**).

**Data types** include portable names (`String`, `Integer`, `Decimal`, …, `DateTimeTz`, `Opaque`) aligned with ontology value types where applicable (**spec-observed**).

---

## Ontology specification

The ontology spec describes **enterprise concepts** (entity types vs value types, built-ins like `String`/`Integer`, multiplicities, hierarchical grouping of relationships under concepts) (**spec-observed**).

Roadmap motivation: tools like Palantir or Goldman Sachs Legend use ontologies for meaning; Ossie today emphasizes **structural** interchange; **conceptual** alignment across models is an explicit forward effort (**roadmap-reported**).

Inline `ontology_mappings` on ontology documents is **deprecated** in favor of separate **mapping documents** (**spec-observed**).

---

## Dialects and portable SQL

The `dialect` field is free-form; only **`OSSIE_SQL_2026`** semantics are normatively defined in the spec family (`expression_language.md`) (**spec-observed**). Other dialect values identify vendor languages that implementations **may** ignore (**spec-observed**). Registration in `extensions/` does not imply query execution support.

---

## Validation and compliance

**validation/validate.py** (described in ROADMAP): validates YAML against JSON Schema, unique names, references, and SQL syntax scope (**roadmap-reported** / **spec-observed** from repo layout).

**compliance/** hosts portability grader and relational query interface test material (**spec-observed** from README).

---

## Community and maturity

- Apache **incubating**; GitHub Discussions, Issues, Slack invite in README (**Ossie-reported**).
- Spec marked **DRAFT** — schema may change before **0.2.0** release (**spec-observed**).
- Working groups (ROADMAP): metric semantics, catalog integration, ontology interoperability, future semantic query language / reference engine, governance and certification (**roadmap-reported**).

---

## Notes for stdd readers

| Item | Label |
| --- | --- |
| Evidence mode | **`static_only`** — README, `spec.md`, `ontology/ontology.md`, `ROADMAP.md` via network read; **not_measured** whether stdd ran `validate.py` locally |
| Effectiveness | TIED outcomes **not_measured**; this capture is not evaluation corpus enrollment |
| Proof boundary | Structural validation in Ossie ≠ runtime correctness or software REQ fidelity |
| Wave 2 | [apache-ossie-vs-tied-agent-management.md](apache-ossie-vs-tied-agent-management.md) — agent-management × TIED compose |
| Evaluation charter | [tied-methodology-evaluation-framework.md](../tied-methodology-evaluation-framework.md) — compose literacy only |
