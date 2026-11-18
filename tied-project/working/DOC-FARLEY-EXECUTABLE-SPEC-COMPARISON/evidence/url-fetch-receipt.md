# URL fetch receipt — Farley “Spec Must Be Executable”

| Field | Value |
| --- | --- |
| **URL** | https://www.linkedin.com/pulse/spec-must-executable-dave-farley-jrnxe/ |
| **Fetched** | 2026-11-17 |
| **Policy** | Themes only — **no article body** committed |

## Themes (Farley-reported unless noted)

- Industry figures converge: when machines write code, humans must state **what** should happen in a form that **runs and verifies** (attributed quotes: Martin, Tornhill, Grove, Beck, Bache, Anthropic guidance).
- AI accelerates **code production** only; three enduring hard problems: precise specification, verification, small steps to detect drift.
- Verification is the bottleneck; tests written **after** code only confirm existing behavior (intent must be external).
- 2025 **spec-driven** tools (Spec Kit, Kiro, Tessl) diagnosed intent-as-truth but **markdown prose** does not fail when agents drift (Adzic, Böckeler, Eberhardt anecdotes **Farley-reported**).
- Eisele **Farley-reported**: BDD done well collapses spec writing and validation into one artifact.
- **Executable specification** definition: problem-language example that runs against real system, fails until behavior exists; describes WHAT not HOW (discount scenario pattern — paraphrase only, no long paste).
- **Four layers:** test cases → DSL → protocol drivers → SUT; LMAX-scale acceptance history **Farley-reported**.
- Developer role shift: agent takes last translation step; human owns story → examples → executable spec chain.
- **Three rules:** spec before agent + red; keep spec/tests out of agent edit reach; one scenario at a time.
- Objections addressed: not waterfall big-bang markdown; reading code sometimes still warranted; brittle UI-coupled tests fixed by layering; Ian Cooper on AI-written tests **Farley-reported**.
- ATDD naming: industry rediscovering executable specs; commercial ATDD course + agent skill offer **Farley-reported** (**not_measured** in stdd).