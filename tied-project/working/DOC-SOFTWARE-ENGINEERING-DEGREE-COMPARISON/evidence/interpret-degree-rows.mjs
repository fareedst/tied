/**
 * Point-specific Interpretation + sparse Observance anchors (Courses 7–15).
 * PLAN-refine-pass3: vary Interpretation; pattern Observance templates elsewhere.
 */

const FRAMING = {
  Course:
    "A **course** is the comparison’s coarse grain (16 bodies of knowledge); Wave 2 maps each **detailed coverage** bullet under modules — not course titles alone.",
  Module:
    "A **module** groups one teachable subject; TIED observance applies at **detailed coverage** rows, with module titles as context only.",
  "Detailed coverage":
    "Each hyphenated **detailed coverage** line becomes one Interpretation + Observance row (**887** total including three framing definitions).",
};

/** Ordered rules: first match wins (courses 7–16 + framing). */
const RULES = [
  {
    courses: [0],
    test: () => true,
    text: (ctx) => FRAMING[ctx.framingKey] || FRAMING["Detailed coverage"],
  },
  {
    courses: [7],
    re: /underlying needs|stated requests|separating stated/,
    text: () =>
      "Needs versus requests: a graduate engineer challenges ambiguous intent. Agents must not treat conversation as REQ; sponsor-owned tokens and checklist steps hold authority.",
  },
  {
    courses: [7],
    re: /assumption|uncertaint|conflict/,
    text: () =>
      "Explicit assumptions and conflicts belong in CITDP risk-assessment and REQ detail — silent ambiguity is an anti-pattern for both graduate RE and TIED sponsors.",
  },
  {
    courses: [7],
    re: /interview|workshop|observation|document analysis/,
    text: () =>
      "Discovery techniques inform sponsor intake; durable intent still lands in tied-project REQ/ARCH after RESOLVE — workshops are not a substitute for tokens.",
  },
  {
    courses: [7, 8],
    re: /stakeholder|users, operators|affected parties/,
    text: () =>
      "Elicitation discipline: graduate engineers separate sponsors, users, and affected parties before design. TIED maps this to sponsor prompts, vocab RESOLVE, and CITDP scope — not informal chat as authority.",
  },
  {
    courses: [7],
    re: /scope|boundar|purpose/,
    text: () =>
      "Scope control mirrors CITDP change-definition and impact-discovery: what is in/out of a request token before ARCH/IMPL work expands.",
  },
  {
    courses: [7],
    re: /nonfunctional|performance|reliabilit|security requirement|maintainabilit|usability|acceptance threshold/,
    text: () =>
      "Quality attributes belong in REQ/ARCH detail and tests — not ad-hoc agent assertions. Measurable thresholds align with verification-gated status when enrolled.",
  },
  {
    courses: [7],
    re: /implementation choices|behaviors, inputs, outputs/,
    text: () =>
      "Behavioral requirements stay at REQ/ARCH layers; IMPL and code follow via TDD — preserving the curriculum’s separation of requirements from implementation.",
  },
  {
    courses: [7],
    re: /ubiquitous language|bounded context|aggregate|domain event|invariant/,
    text: () =>
      "Domain-driven design language maps directly to tied-project vocab RECORD and RESOLVE before minting semantic tokens — bounded contexts are not optional naming polish.",
  },
  {
    courses: [7],
    re: /use case|user stor|scenario|actor|flow/,
    text: () =>
      "Scenarios inform CITDP and tests; durable intent still lives in REQ/ARCH/IMPL — not story cards alone.",
  },
  {
    courses: [7, 15],
    re: /prototyp|wireframe|mockup|usability|accessibility/,
    text: () =>
      "UX exploration is **A** in client products; methodology **M** still requires traceable REQ if behavior changes ship.",
  },
  {
    courses: [8],
    re: /layer|tier|microservice|monolith|deployable unit/,
    text: () =>
      "Structural decomposition aligns with ARCH module boundaries and `[REQ-MODULE_VALIDATION]` — architecture decisions precede integration code.",
  },
  {
    courses: [8],
    re: /pattern|style|quality attribute|tradeoff|tactic/,
    text: () =>
      "Architectural tradeoffs belong in ARCH records with explicit consequences — same graduate judgment TIED expects before costly choices.",
  },
  {
    courses: [8, 9],
    re: /refactor|technical debt|comprehension|legacy|evolution/,
    text: () =>
      "Evolutionary change runs through CITDP + LEAP when code/tests diverge from IMPL — comprehension work is not drive-by edits.",
  },
  {
    courses: [9],
    re: /static analysis|metric|clone|complexity|smell/,
    text: () =>
      "Analysis tools support **A** judgment; TIED adds token-linked tests and optional source-graph tooling — metrics alone are not proof.",
  },
  {
    courses: [9],
    re: /document|comment|knowledge transfer|onboard/,
    text: () =>
      "Documentation complements REQ/ARCH/IMPL; pseudo-code and vocab glossaries are the methodology-preferred durable knowledge.",
  },
  {
    courses: [10],
    re: /unit test|integration test|system test|regression|coverage|mock/,
    text: () =>
      "Test levels match `[PROC-TIED_DEV_CYCLE]`: unit first, composition before UI, E2E only when justified — graduate V&V rhythm without skipping RED.",
  },
  {
    courses: [10],
    re: /static|formal|model check|proof|verification/,
    text: () =>
      "Formal methods compose with `pseudocode_validate` and claims-evidence patterns — TIED does not replace full model checking in core methodology.",
  },
  {
    courses: [10, 11],
    re: /review|inspect|walkthrough|audit/,
    text: () =>
      "Human review maps to sponsor/reviewer person-branch and gate receipts — not optional social ritual after agent output.",
  },
  {
    courses: [11],
    re: /threat|vulnerabilit|attack|encrypt|auth|sanitiz/,
    text: () =>
      "Security engineering is **A** in client code plus proof-boundary discipline in **M**; TIED cites tool-safety and adversarial inquiry when enrolled — not universal pen-test certification.",
  },
  {
    courses: [11],
    re: /safety|hazard|fail.?safe|critical/,
    text: () =>
      "Safety-critical systems need client REQ scope; TIED gates reduce unverified agent change — they do not certify hazard analysis.",
  },
  {
    courses: [12],
    re: /pipeline|ci\/cd|deploy|container|kubernetes|terraform|monitor|sre|incident|rollback|distributed trace|request correlation|observability|structured log|metric|histogram|dashboard|alert|service-level|error budget|load generation|saturation|scaling|backup|disaster recovery|runbook|postmortem|provisioning|artifact|rollback|canary|blue-green|feature flag|infrastructure as code/,
    text: () =>
      "Delivery and operations are plane **C**: client-owned pipelines. stdd may exemplify CI; TIED methodology does not mandate a cloud product.",
  },
  {
    courses: [1],
    re: /standard input|pipes|exit codes|shell integration|command-line|environment variable|stdin|stdout|stderr/,
    text: () =>
      "CLI and shell integration are graduate **A** skills when building client tools; TIED does not replace runtime labs — traced REQ/ARCH/IMPL applies when shipped behavior changes.",
  },
  {
    courses: [13],
    re: /transformer|attention|token|llm|language model|pretrain|fine.?tun|embedding/,
    text: () =>
      "LLM mechanics are **Gap M**: TIED orchestrates agents but does not ship model training or inference product coursework; **A** applies when client code integrates models.",
  },
  {
    courses: [13],
    re: /prompt|rag|retriev|hallucin|guardrail|eval/,
    text: () =>
      "Applied LLM patterns overlap harness themes (LangChain sibling **Defer** for duplicate prose): bounded tools, proof boundaries, **not_measured** effectiveness unless client tests.",
  },
  {
    courses: [13],
    re: /machine learning|neural|dataset|overfit|supervised/,
    text: () =>
      "ML literacy is graduate **A** competence for client features; TIED **M** does not certify model quality — only traced change to client repos.",
  },
  {
    courses: [14],
    re: /mcp|tool.?call|function call|api key|permission/,
    text: () =>
      "Tool interfaces mirror bounded TIED YAML MCP: least privilege, `tied_config_get_base_path` before writes, diagnostics on failure — not unbounded vendor tool sprawl.",
  },
  {
    courses: [14],
    re: /delegat|sub.?agent|multi.?agent|orchestr/,
    text: () =>
      "Delegation must stay inside prompt-type skills and Task envelopes with sponsor visibility — graduate agentic practice without autonomy that bypasses gates.",
  },
  {
    courses: [14, 15],
    re: /guardrail|human.in.the.loop|oversight|approval/,
    text: () =>
      "Oversight aligns with sponsor-agent relationship and consequence ladder: costly choices escalate to sponsor, not silent agent commit.",
  },
  {
    courses: [15],
    re: /evidence|envelope|reproduc|audit trail|provenance/,
    text: () =>
      "Evidence-first delivery matches request evidence envelopes, gate receipts, and reproducible commands — graduate process engineering on the **M** plane.",
  },
  {
    courses: [15],
    re: /checklist|gate|pre_implementation|verification/,
    text: () =>
      "Process gates are **TIED-existing** checklist enforcement — curriculum process themes align here more tightly than anywhere else in the grid.",
  },
  {
    courses: [15],
    re: /traceabilit|requirement|change control|version/,
    text: () =>
      "Change control is LEAP + git hygiene + tied-project YAML — the operational form of graduate traceability practice.",
  },
  {
    courses: [16],
    re: /integrat|capstone|team|present|deliver/,
    text: () =>
      "Integrative capstone maps to client project + CITDP working folders + sponsor review — TIED supports the process; it is not a degree-granting institution.",
  },
  {
    courses: [16],
    re: /risk|ethic|professional|standard/,
    text: () =>
      "Professional responsibility includes proof boundaries, honest gate notes, and not claiming **not_measured** outcomes as certification.",
  },
];

const PATTERN_FALLBACK = {
  "P-A-impl":
    "Foundations implementation skill expected in client code and tests; TIED methodology does not substitute for labs or runtime drills.",
  "P-A-algo":
    "Algorithmic and complexity literacy is plane **A** when coding; **Gap M** for methodology core — TIED does not certify this course.",
  "P-M-trace":
    "Intent must flow REQ → ARCH → IMPL with consistency validation before merge-ready claims.",
  "P-M-tdd":
    "Verification discipline: failing tests precede production code at the appropriate test level.",
  "P-M-spec":
    "Contracts and pre/post conditions belong in IMPL pseudo-code before implementation.",
  "P-M-vocab":
    "Shared language is resolved and recorded in vocab before tokens and public names harden.",
  "P-M-agent":
    "Agentic execution composes with bounded MCP/skills and sponsor authority — not unbounded autonomy.",
  "P-C-ops":
    "Operations and platform concerns defer to client infra unless explicitly in client REQ.",
  "P-M-evidence":
    "Claims require gate-quality evidence and explicit proof-boundary labeling.",
  "P-A-llm-gap":
    "AI/ML runtime and model engineering are outside TIED methodology core (**Gap M**); client integration remains plane **A**.",
  "P-framing": "",
};

const OBS_ANCHOR = [
  {
    courses: [7, 15],
    re: /stakeholder|sponsor|human|oversight|approval/,
    suffix: "; **Anchor:** sponsor-agent-relationship vocab.",
  },
  {
    courses: [14],
    re: /mcp|tool|skill|delegat/,
    suffix: "; **Anchor:** LangChain harness comparison (defer duplicate prose).",
  },
  {
    courses: [10, 15],
    re: /checklist gate|pre_implementation|verification gate|agent-req-implementation/,
    suffix: "; **Anchor:** agent-req-implementation-checklist.",
  },
  {
    courses: [8],
    re: /architect|module boundary|deployable unit/,
    suffix: "; **Anchor:** module validation + ARCH decisions.",
  },
];

export function framingKey(bullet) {
  if (bullet.startsWith("Course:")) return "Course";
  if (bullet.startsWith("Module:")) return "Module";
  return "Detailed coverage";
}

export function buildInterpretation(courseNum, moduleTitle, bullet, patternId) {
  const ctx = {
    courseNum,
    moduleTitle,
    bullet,
    framingKey: framingKey(bullet),
    combined: `${moduleTitle} ${bullet}`.toLowerCase(),
  };

  for (const rule of RULES) {
    if (!rule.courses.includes(courseNum)) continue;
    if (rule.re && !rule.re.test(ctx.combined)) continue;
    const text = typeof rule.text === "function" ? rule.text(ctx) : rule.text;
    if (text) return text;
  }

  if (courseNum >= 7) {
    const fb = PATTERN_FALLBACK[patternId] || PATTERN_FALLBACK["P-M-trace"];
    return `In “${moduleTitle}”, this **Sponsor-proposed** point emphasizes ${bullet.replace(/\.$/, "")}. ${fb}`;
  }

  if (courseNum >= 1 && courseNum <= 6) {
    const fb = PATTERN_FALLBACK[patternId] || PATTERN_FALLBACK["P-A-impl"];
    return `Foundations (Course ${courseNum}): ${fb} Applies directly when the agent implements or tests client code reflecting this topic.`;
  }

  return PATTERN_FALLBACK[patternId] || "Graduate-engineer judgment under TIED lens.";
}

export function observanceWithAnchor(baseObservance, courseNum, moduleTitle, bullet) {
  const combined = `${moduleTitle} ${bullet}`.toLowerCase();
  for (const a of OBS_ANCHOR) {
    if (!a.courses.includes(courseNum)) continue;
    if (a.re.test(combined)) return baseObservance + a.suffix;
  }
  return baseObservance;
}
