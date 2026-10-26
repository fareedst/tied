# NDTP AI Ontology Extension — repository summary (read-only capture)

| Field | Value |
| --- | --- |
| **Source** | [National-Digital-Twin/ndtp-ai-ontology-extension](https://github.com/National-Digital-Twin/ndtp-ai-ontology-extension) (Apache-2.0 code; OGL-UK-3.0 documentation per README) |
| **Local path** | `/Users/fareed/Downloads/ndtp-ai-ontology-extension-main` (**target-repo-observed** during stdd authoring) |
| **Maintainer** | National Digital Twin Programme (NDTP), UK Department for Business, Innovation, Science and Trade (BIST) — **NDTP-reported** |
| **Purpose** | Read-only repository summary for comparison and architecture reference — **external content**; this document does not mint REQ/ARCH/IMPL tokens. |
| **Captured** | 2026-10-26 |
| **Analysis (sibling)** | [ndtp-ai-ontology-extension-vs-tied-agent-management.md](ndtp-ai-ontology-extension-vs-tied-agent-management.md) |
| **Related (governance engine)** | [Open Ontologies capture](open-ontologies-repository.md) — plan/apply/MCP lifecycle; this capture covers **HITL extension authoring** |
| **Related (meaning ownership)** | [Heimsbakk × TIED](veronika-heimsbakk-ai-generated-ontologies-vs-tied-agent-management.md) — essay on LLM ontology **meaning** |

---

## TL;DR

- **Streamlit wizard** — Four anchored sections in `app/main.py`: data input, processing, extension generation, validation (**target-repo-observed**).
- **Human-in-the-loop ontology extension** — Combines data profiling, NER (spaCy), embeddings (FAISS), and OpenAI LLM calls to extract, match, and generate ontology fragments (**NDTP-reported** in README).
- **IES-aligned prompts** — Generation templates under `app/templates/` (e.g. `instructions.txt`) describe extending the **Information Exchange Standard (IES) Common Ontology** with Turtle/OWL snippets, 4D entity/state patterns, and metadata conventions (**target-repo-observed**).
- **Validation stack** — `src/validation/validator.py`: Owlready2 reasoning, optional SHACL (pyshacl), format conversion; **LLM-assisted TTL repair** with a configurable fix cap (`max_chatgpt_fixes`, default **2** in module docstring — **target-repo-observed**).
- **Optional multi-agent evaluation** — `src/validation/abm.py` loads personas, chunks text, and simulates multi-agent discussion via OpenAI (**target-repo-observed**).
- **Dependencies** — Python 3.8+, `streamlit`, `openai`, `rdflib`, `owlrl`, `pyshacl`, `spacy`, `faiss-cpu`, etc. in `requirements.txt` (**target-repo-observed**); **OpenAI API key** required (**NDTP-reported**).
- **No agent MCP harness** — Operator entry is `streamlit run app/main.py`, not an MCP tool plane (**target-repo-observed**).

---

## What it is

The **AI Ontology Extension Generator** is an open-source, NDTP-funded tool for **automated generation and extension of ontologies** from CSV, JSON, and RDF/Turtle sources through a browser UI (**NDTP-reported**).

### Repository layout (summary)

| Area | Role |
| --- | --- |
| **`app/`** | Streamlit UI: `views/` (data_input, processing, generation, evaluation), `components/` (cache, config, processors, evaluators), `templates/` (prompts, personas), `state.py` (`AppState` dataclass for iteration history and validation outputs) |
| **`src/ingestion/`** | Extract entities, embeddings, ontology loading, processing helpers |
| **`src/generation/`** | `generator.py` (BORO-framed LLM prompts with ontologist feedback fields), `llm_interface.py`, `iteration.py` |
| **`src/validation/`** | `validator.py`, `comparison.py`, `abm.py` |
| **`scripts/`** | CLI helpers (`analyse_ontology.py`, `extract_entities.py`, `generate_ontology.py`, …) |
| **`tests/`** | `test_ingestion.py`, `test_generation.py`, `test_validation.py` (pytest; mocks OpenAI in validation tests — **target-repo-observed**) |

### Central application state

`AppState` (**target-repo-observed** in `app/state.py`) tracks CSV uploads, processing results, generated snippets, **iteration count and history**, cleaned ontology output, error logs, and optional ABM discussion results — supporting iterative refinement in the UI rather than a persisted plan/apply lifecycle.

---

## How it is used

### Quick start (README)

1. Clone repo, create venv, `pip install -r requirements.txt`.
2. Set `OPENAI_API_KEY` (environment and `.streamlit/secrets.toml`).
3. `python -m spacy download en_core_web_sm`.
4. `streamlit run app/main.py`.

### Wizard flow (**NDTP-reported** / **target-repo-observed** in README and `app/main.py`)

1. **Data input** — Upload CSV, JSON, or RDF; preview and configure processing.
2. **Data processing** — NER and AI extraction, fuzzy matching, review candidates.
3. **Extension generation** — Configure generation parameters; produce ontology snippets; iterate with feedback.
4. **Validation** — Review output, compare with references, export results.

Generation prompts include **ontologist feedback** and **previous iteration** blocks (`generate_ontology_prompt` in `src/generation/generator.py` — **target-repo-observed**), aligning with a human curator loop rather than one-shot LLM output.

---

## Validation and evaluation (target-repo-observed)

From `src/validation/validator.py` module documentation:

- Bidirectional Turtle ↔ OWL/XML conversion.
- Consistency checking with Owlready2 / OWL-RL semantics.
- Optional SHACL validation (including auto-generated shapes).
- **Automated TTL repair** via LLM suggestions (`iterative_chatgpt_fix_ttl`), bounded by `max_chatgpt_fixes`.

From `src/validation/abm.py`:

- Persona-driven chunk ranking and **multi-agent discussion** simulation for qualitative review — distinct from formal proof or checklist gates.

---

## CI and quality signals

- **`.github/workflows/oss-checker.yml`** — OSPO open-source compliance helper workflow (GitHub App tokens, summary table output — **target-repo-observed**). This is **supply-chain/compliance** automation, not a documented ontology correctness gate matrix like Open Ontologies `docs/ci-gates.md`.
- **Unit tests** — pytest modules under `tests/`; stdd did **not** execute them during capture.

---

## Observation boundary (stdd)

| Fact class | Label |
| --- | --- |
| Structure and docs read from local tree **2026-10-26** | **target-repo-observed** |
| Product/feature claims in README (RAM, “AI-powered”, programme funding) | **NDTP-reported** |
| stdd execution | **Did not** run `pytest`, Streamlit, OpenAI API calls, or target GitHub Actions during this capture |

---

## Target proof limits (inferred from code/docs)

Summarized from `validator.py` docstring and README (**target-repo-observed**; not independently verified in stdd):

- **Reasoner / SHACL green** indicates technical consistency against loaded shapes and OWL semantics — **not** that the ontology matches real-world domain truth or sponsor intent.
- **LLM TTL repair** may fix syntax locally; capped iterations limit but do not eliminate model error risk.
- **ABM persona discussion** produces narrative review material — **not** a formal verification certificate or adversarial inquiry obligation graph.

---

## Notes for stdd readers

- For **TIED agent-management mapping**, read the sibling [Wave 2 analysis](ndtp-ai-ontology-extension-vs-tied-agent-management.md).
- For **ontology change governance** (plan/apply, Lean certs, large MCP surface), read [Open Ontologies × TIED](open-ontologies-repository-vs-tied-agent-management.md) — **do not conflate** with this authoring wizard.
- For **meaning ownership before machine-readable graphs**, read [Heimsbakk × TIED](veronika-heimsbakk-ai-generated-ontologies-vs-tied-agent-management.md).
- Process template: [external-service-three-wave-comparison-template.md](../../tied-bundle/docs/external-service-three-wave-comparison-template.md).
