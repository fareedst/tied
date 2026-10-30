#!/usr/bin/env node
/**
 * Generate bullet inventory tables for software-engineering-degree-vs-tied.md
 * from Sponsor-proposed capture. Pattern IDs per PLAN-refine-pass3.md.
 */
import fs from "node:fs";
import path from "node:path";
import {
  buildInterpretation,
  observanceWithAnchor,
} from "./interpret-degree-rows.mjs";

const ROOT = path.resolve(import.meta.dirname, "../../../..");
const CAPTURE = path.join(
  ROOT,
  "docs/comparisons/software-engineering-degree.md",
);
const OUT = path.join(
  ROOT,
  "docs/comparisons/software-engineering-degree-vs-tied.md",
);

const PATTERNS = {
  "P-A-impl": {
    observance:
      "**M:** —; **A:** expected when implementing/testing client code; **C:** Defer labs/CI unless client REQ",
    disposition: "Composable",
    plane: "A",
  },
  "P-A-algo": {
    observance:
      "**M:** —; **A:** select/analyze implementations in client work; **C:** Defer formal course assessment",
    disposition: "Gap",
    plane: "A",
  },
  "P-A-llm-gap": {
    observance:
      "**M:** — (no LLM product/runtime in methodology); **A:** client ML/LLM integration when scoped; **C:** Defer training/infra",
    disposition: "Gap",
    plane: "A",
  },
  "P-M-trace": {
    observance:
      "**M:** REQ/ARCH/IMPL + \`tied_validate_consistency\`; **A:** token comments in tests/code",
    disposition: "Align",
    plane: "M,A",
  },
  "P-M-tdd": {
    observance:
      "**M:** \`[PROC-TIED_DEV_CYCLE]\`; **A:** write failing tests before production code",
    disposition: "Align",
    plane: "M,A",
  },
  "P-M-spec": {
    observance:
      "**M:** IMPL PRE/POST/EFFECTS + \`pseudocode_validate\`; **A:** honor contracts in code",
    disposition: "Align",
    plane: "M,A",
  },
  "P-M-vocab": {
    observance:
      "**M:** \`[PROC-VOCABULARY_INDEX]\` RESOLVE/RECORD; **A:** consistent naming in artifacts",
    disposition: "Align",
    plane: "M,A",
  },
  "P-M-agent": {
    observance:
      "**M:** bounded MCP + prompt-type skills + sponsor ladder; **A:** least-privilege tool use",
    disposition: "Composable",
    plane: "M,A",
  },
  "P-C-ops": {
    observance:
      "**M:** —; **A:** apply when client owns pipeline; **C:** Defer as TIED methodology core",
    disposition: "Defer",
    plane: "C",
  },
  "P-M-evidence": {
    observance:
      "**M:** gates, envelopes, proof boundaries; **A:** reproducible commands in client repo",
    disposition: "Align",
    plane: "M,A",
  },
  "P-framing": {
    observance:
      "**M:** three-wave comparison labels; **A:** interpret curriculum as **Sponsor-proposed** input to agent judgment",
    disposition: "Composable",
    plane: "M,A",
  },
};

function pickPattern(courseNum, bullet, moduleTitle) {
  const b = bullet.toLowerCase();
  const m = (moduleTitle || "").toLowerCase();
  const bm = `${b} ${m}`;
  if (courseNum === 0) return "P-framing";

  // Plane **C** ops before methodology patterns (avoid "traces" / CI "gates" false positives).
  if (
    /deploy|ci\/cd|pipeline|cloud|sre|monitor|kubernetes|docker|infra|devops|sla|incident|distributed trace|request correlation|observability|structured log|error budget|service-level|artifact integrity|rollback|canary|terraform|runbook|postmortem|provisioning|load generation|saturation|scaling polic|backup|disaster recovery/.test(
      bm,
    )
  )
    return "P-C-ops";

  if (
    (courseNum === 10 ||
      /unit test|integration test|system test|regression test|test-driven|tdd|test coverage|acceptance test/.test(
        bm,
      )) &&
    /test|tdd|regression|coverage|acceptance|mock|stub/.test(bm)
  )
    return "P-M-tdd";
  if (
    /req|requirement|stakeholder|domain model|specification|contract|traceabilit/.test(
      bm,
    )
  )
    return "P-M-trace";
  if (/vocab|terminology|ambigu|glossary|naming|ontology/.test(bm))
    return "P-M-vocab";
  if (/precondition|postcondition|invariant|pseudo|formal|contract|assert/.test(b))
    return "P-M-spec";
  if (
    courseNum >= 14 &&
    /agent|mcp|tool|skill|delegat|autonom|guardrail|human.in.the.loop/.test(bm)
  )
    return "P-M-agent";
  if (courseNum === 13 && /prompt|rag|guardrail|tool|eval|agent/.test(bm))
    return "P-A-llm-gap";
  if (
    /evidence|envelope|audit|proof|reproduc|checklist|sponsor|review/.test(bm) ||
    (/gate/.test(bm) &&
      !/pipeline|ci\/cd|continuous integration|quality gate/.test(bm))
  )
    return "P-M-evidence";
  if (
    /complex|algorithm|graph|sorting|sorted|quicksort|mergesort|heap sort|binary search|dynamic programming|complexity|\bhash\b|\btree\b|\bnp\b/.test(
      bm,
    ) &&
    courseNum <= 2
  )
    return "P-A-algo";

  const byCourse = {
    1: "P-A-impl",
    2: "P-A-algo",
    3: "P-M-spec",
    4: "P-A-impl",
    5: "P-A-impl",
    6: "P-C-ops",
    7: "P-M-trace",
    8: "P-M-trace",
    9: "P-M-trace",
    10: "P-M-tdd",
    11: "P-M-evidence",
    12: "P-C-ops",
    13: "P-A-llm-gap",
    14: "P-M-agent",
    15: "P-M-evidence",
    16: "P-M-evidence",
  };
  return byCourse[courseNum] || "P-A-impl";
}

function escapeCell(s) {
  return s.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function row(bullet, courseNum, moduleTitle) {
  const pid = pickPattern(courseNum, bullet, moduleTitle);
  const p = PATTERNS[pid];
  const interp = escapeCell(
    buildInterpretation(courseNum, moduleTitle, bullet, pid),
  );
  let obs = p.observance;
  if (courseNum >= 7) {
    obs = observanceWithAnchor(obs, courseNum, moduleTitle, bullet);
  }
  obs = escapeCell(obs);
  const point = escapeCell(bullet);
  return `| ${point} | ${interp} | ${obs} | ${p.disposition} | ${p.plane} |`;
}

function parseCapture(text) {
  const lines = text.split("\n");
  const framing = [];
  let i = 0;
  while (i < lines.length && !lines[i].startsWith("# I.")) {
    const line = lines[i];
    if (
      line.startsWith("- Course:") ||
      line.startsWith("- Module:") ||
      line.startsWith("- Detailed coverage:")
    ) {
      framing.push(line.slice(2));
    }
    i++;
  }
  const parts = [];
  let currentPart = null;
  let currentCourse = null;
  let currentModule = null;

  for (; i < lines.length; i++) {
    const line = lines[i];
    if (/^# (I|II|III|IV)\./.test(line)) {
      currentPart = line.match(/^# (I|II|III|IV)\./)[1];
      const partTitle = line.replace(/^# [IVX]+\.\s*/, "");
      parts.push({ part: currentPart, partTitle, courses: [] });
      currentCourse = null;
      continue;
    }
    const courseM = line.match(/^## Course (\d+)\./);
    if (courseM) {
      currentCourse = {
        num: parseInt(courseM[1], 10),
        title: line.replace(/^## Course \d+\.\s*/, ""),
        modules: [],
      };
      parts[parts.length - 1].courses.push(currentCourse);
      currentModule = null;
      continue;
    }
    const modM = line.match(/^(\d+)\\?\.\s+(.+)/);
    if (modM && currentCourse) {
      currentModule = { num: modM[1], title: modM[2], bullets: [] };
      currentCourse.modules.push(currentModule);
      continue;
    }
    if (line.startsWith("- ") && currentModule) {
      currentModule.bullets.push(line.slice(2));
    }
  }
  return { framing, parts };
}

function countByCourse(parts) {
  const counts = {};
  for (const p of parts) {
    for (const c of p.courses) {
      counts[c.num] = (counts[c.num] || 0) + c.modules.reduce((s, m) => s + m.bullets.length, 0);
    }
  }
  return counts;
}

function slugHeading(text) {
  return text
    .toLowerCase()
    .replace(/[^\w]+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildCourseToc(courses) {
  return courses
    .map(
      (c) =>
        `- [Course ${c.num}. ${c.title}](#course-${c.num}-${slugHeading(c.title)})`,
    )
    .join("\n");
}

function buildInventorySection(title, courses, courseFilter) {
  let out = `\n## ${title}\n\n`;
  for (const c of courses) {
    if (courseFilter && !courseFilter(c.num)) continue;
    out += `### Course ${c.num}. ${c.title}\n\n`;
    for (const mod of c.modules) {
      out += `#### ${mod.num}. ${mod.title}\n\n`;
      out += "| Curriculum point | Interpretation | Observance | Disposition | Plane |\n";
      out += "| --- | --- | --- | --- | --- |\n";
      for (const b of mod.bullets) {
        out += row(b, c.num, mod.title) + "\n";
      }
      out += "\n";
    }
  }
  return out;
}

function scaffoldHeader(allCourses) {
  const courseToc = buildCourseToc(
    [...allCourses].sort((a, b) => a.num - b.num),
  );
  return `# Software engineering degree × TIED — graduate competency observance grid

| Field | Value |
| --- | --- |
| **Purpose** | Map **Sponsor-proposed** CS/software-engineering curriculum detail points to TIED **Interpretation** (graduate-engineer judgment) and **Observance** across planes **M** (methodology), **A** (agent implementation), **C** (client infra) — outreach persona, not accreditation. |
| **Audience** | Sponsors, methodology owners, educators comparing TIED to graduate SE competence |
| **Curriculum capture (sibling)** | [software-engineering-degree.md](software-engineering-degree.md) (**Sponsor-proposed**, captured **2026-10-26**) |
| **Evidence boundary** | No university accreditation; no assertion that TIED replaces labs, runtime courses, or certifies operators passed Course 2. Effectiveness **not_measured**. |
| **Status / date** | Wave 2 analysis snapshot **2026-10-26** — reference only; does **not** mint REQ/ARCH/IMPL |
| **Distinct from** | [TIED vs well-known methodologies](tied-vs-well-known-methodologies.md) (organizational process map); [AI-SDLC factory × TIED](ai-sdlc-atdd-software-factory-vs-tied.md); harness comparisons (LangChain, Cursor, Traefik) |
| **TIED anchors (reference only)** | [AGENTS.md](../../AGENTS.md), [agent-req-implementation-checklist.md](../../tied-bundle/docs/agent-req-implementation-checklist.md), [processes.md](../../tied-bundle/docs/processes.md), [sponsor-agent-relationship.md](../../tied-project/vocab/sponsor-agent-relationship.md), [external-service-three-wave-comparison-template.md](../../tied-bundle/docs/external-service-three-wave-comparison-template.md) |
| **Row target** | **887** analysis rows (**884** under courses 1–16 + **3** curriculum framing) |

---

## Executive summary

The **Sponsor-proposed** curriculum describes graduate software-engineering competence across **16 courses**, **167 numbered modules**, and **887** hyphenated detail points (see sibling capture). TIED’s center of gravity is **traceable agent-assisted change** in client repos: vocab discipline, CITDP, REQ → ARCH → IMPL pseudo-code, checklist gates, MCP-first project YAML, verification when enrolled, LEAP on divergence, and sponsor **consequence ladder** — not replacing CS foundations labs or certifying degree outcomes.

**Compose-don’t-replace:** Use the curriculum as a **competency persona** for what a TIED-guided agent should **understand** (plane **A**) while keeping **methodology authority** on plane **M**. Defer cloud, CI product ownership, and formal degree assessment to plane **C** or **Defer** unless client scope includes them.

| Center of gravity | Curriculum (**Sponsor-proposed**) | TIED (this repo) |
| --- | --- | --- |
| Primary artifact | Course modules + 887 detail bullets | REQ/ARCH/IMPL YAML + IMPL pseudo-code + tests |
| Proof of competence | Labs, exams, capstone (**not** in this doc) | Checklist gates, envelopes, \`tied_validate_consistency\` / \`tied_verify\` when enrolled |
| Agentic engineering | Courses 14–15 integrative themes | Bounded MCP, prompt-type skills, sponsor ladder |
| Foundations (1–6) | Programming, algorithms, systems | **Gap M**; **A** when implementing client code |
| Accreditation claim | Undergraduate degree intent | **Explicit non-adoption** — outreach persona only |

| Mastery dimension (capture) | TIED crosswalk | Primary plane |
| --- | --- | --- |
| Conceptual | IMPL contracts, ARCH decisions, proof boundaries | M, A |
| Practical | \`[PROC-TIED_DEV_CYCLE]\`, client implementation | A |
| Evaluative | Gates, envelopes, \`tied_verify\` when enrolled | M |

| Scale (capture) | TIED crosswalk | Disposition |
| --- | --- | --- |
| Algorithm | Client code quality when implementing | **Gap M** for core methodology |
| Component | Module validation, composition tests | **Composable** |
| Complete system | E2E justification, integration evidence | **Composable** |
| Engineering process | CITDP, checklist, LEAP | **Align** |

---

## Source summary

Bullets summarize the in-repo capture only (**Sponsor-proposed**). Module count in capture intro text cites “~175 instructional modules”; measurable **167** numbered module headings are used for verification (see [PLAN-refine-pass3.md](../../tied-project/working/DOC-SOFTWARE-ENGINEERING-DEGREE-COMPARISON/PLAN-refine-pass3.md)).

- **16 courses** in four parts: **I.** Computing Foundations; **II.** Software Engineering; **III.** AI and Agentic Software Engineering; **IV.** Integrative Engineering.
- **887** hyphenated detail points (**884** under courses + **3** framing definitions before Part I).
- Agentic programming integrated from Course 14 onward; process/evidence emphasis in Course 15.
- Mathematics and general education excluded by sponsor scope.
- No stdd run of external accreditation or educational effectiveness studies (**not_measured**).

---

## Relationship to sibling comparisons

| Sibling | What it owns | This document owns |
| --- | --- | --- |
| [TIED vs well-known methodologies](tied-vs-well-known-methodologies.md) | Agile/XP/QMM **organizational** frames | **CS curriculum grid** → TIED observance per bullet |
| [AI-SDLC factory × TIED](ai-sdlc-atdd-software-factory-vs-tied.md) | Executable spec factory, run records | Graduate **competency** mapping, not factory mechanics |
| [Open Ontologies × TIED](open-ontologies-repository-vs-tied-agent-management.md) | RDF plan/apply, certificates | Not ontology engine comparison |
| [LangChain harness × TIED](langchain-harness-engineering-vs-tied-agent-management.md) | Trace/benchmark harness loops | Course 14–15 agentic overlap only |
| Other harness docs (Traefik, Cursor) | Harness/platform seams | **Defer** duplicating harness prose |

---

## Competency themes → TIED surfaces

### Courses 7–12 (requirements through DevOps)

| Theme | TIED surface | Disposition |
| --- | --- | --- |
| Requirements & domain modeling | Vocab RESOLVE, REQ tokens, CITDP | **Align M** |
| Architecture & modularity | ARCH decisions, module validation | **Align M** |
| Maintenance & comprehension | Source graph tools, working folders | **Composable** |
| V&V / TDD / ATDD | \`[PROC-TIED_DEV_CYCLE]\`, \`tied_verify\` | **Align M** |
| Security & safety | Proof boundary, tool safety references | **Partial align** |
| DevOps / SRE | stdd CI exists; not methodology core | **Defer C** |

### Courses 14–15 (agentic engineering)

| Theme | TIED surface | Disposition |
| --- | --- | --- |
| Tool use & MCP | Bounded TIED YAML MCP, skill boundaries | **Partial align M** |
| Delegation & human oversight | Sponsor ladder, agency boundary | **Align M** |
| Process & evidence | Checklist gates, evidence envelopes | **Align M** |
| Chat as requirements | REQ/ARCH/IMPL stack required | **Tension** (anti-pattern) |

---

## Touchpoint 1 — RESOLVE

| Sponsor/source term | TIED preferred term / surface | Disposition |
| --- | --- | --- |
| **CS graduate software engineer** | Competency persona for TIED operator + agent | **Recommendation-only** |
| **Observance plane M/A/C** | Document-local column labels | **Composable** |
| **Interpretation / Observance** | Wave 2 table fields | Document-local |
| **Curriculum point** | Verbatim **Sponsor-proposed** bullet | Source label |
| **TIED-existing** | Committed stdd behavior cited in prose | Claim label |
| **Course 15 agentic process** | Prompt-type skills + checklist | **Partial align** |

**RESOLVE charter:** Names and mappings only; no RECORD of project vocab unless sponsor promotes. No token mint from comparison prose.

### Disposition key

| Disposition | Meaning |
| --- | --- |
| **Align** | TIED materially represents the curriculum intent (scoped). |
| **Composable** | Combine without equivalence or certification claims. |
| **Tension** | Partial overlap; proof boundary required. |
| **Gap** | Curriculum emphasis not in TIED methodology core. |
| **Defer** | Client infra, product, or sponsor-owned choice. |
| **N/A** | Not applicable to TIED lens for this point. |

---

## Primary capability matrix

| Course (concise) | TIED COG | Disposition | Primary plane |
| --- | --- | --- | --- |
| 1 Programming construction | IMPL contracts, TDD in clients | **Composable** | A |
| 2 Algorithms / complexity | — | **Gap M** | A |
| 3 Languages / compilers | pseudo-code grammar, lint | **Tension** | M/A |
| 4 Architecture / OS | DEBUG/TRACE in AGENTS.md | **Composable** | A/C |
| 5 Networking / distributed | async vocab, module boundaries | **Partial align** | A |
| 6 Databases / data eng | — | **Defer C** | A/C |
| 7 Requirements / domain | vocab RESOLVE, REQ tokens | **Align** | M |
| 8 Software architecture | ARCH decisions, module validation | **Align** | M |
| 9 Maintenance / comprehension | CITDP, source graph tools | **Composable** | M/A |
| 10 V&V / quality | PROC-TIED_DEV_CYCLE, tied_verify | **Align** | M |
| 11 Security / safety | proof boundary, tool safety refs | **Partial align** | M/A |
| 12 DevOps / SRE | stdd CI exists; not methodology core | **Defer** | C |
| 13 AI / LLM engineering | — product LLM course | **Gap M** | A |
| 14 Agentic programming | MCP, skills, delegation | **Partial align** | M |
| 15 Process / evidence / agentic dev | checklist, envelopes, sponsor ladder | **Align** | M |
| 16 Capstone | working folders + client project | **Composable** | M/A |

---

## Authority boundary

\`\`\`mermaid
flowchart TB
  subgraph curriculum [Sponsor-proposed curriculum competence]
    foundations[Courses 1-6 foundations labs]
    systems[Courses 4-6 systems data]
    practice[Courses 7-15 engineering practice]
    capstone[Course 16 integrative project]
  end
  subgraph planeA [Plane A agent implementation]
    impl[Client code tests debugging]
    algo[Algorithms OS networking when coding]
  end
  subgraph planeM [Plane M TIED methodology]
    trace[REQ ARCH IMPL pseudo-code]
    gates[Checklist gates MCP verify]
    vocab[Vocab RESOLVE RECORD]
    sponsor[Sponsor consequence ladder]
  end
  subgraph planeC [Plane C client infra Defer]
    cicd[CI CD cloud SRE labs]
  end
  curriculum --> planeA
  planeA --> planeM
  sponsor --> gates
  vocab --> trace
  gates --> trace
  curriculum --> planeC
\`\`\`

Graduate **competence** (curriculum) informs what agents should **apply** in client work (**A**). **M** holds authoritative traceability and gates. **C** is deferred unless client REQ owns infra.

---

## Anti-patterns

| Risk | Symptom | TIED-oriented remedy |
| --- | --- | --- |
| Consistency = CS mastery | \`tied_validate_consistency\` green implies algorithms/OS competence | Proof boundary; plane **M** vs **A**; **Gap M** for foundations |
| Curriculum = TIED certification | Wave 2 doc treated as accreditation | **Sponsor-proposed** + **not_measured**; explicit non-adoptions |
| Chat as requirements | Agent narrative replaces REQ/ARCH/IMPL | Course 7/15 crosswalk; token stack required |
| Unbounded agent autonomy | Skills/MCP without gates | Course 14–15 themes; sponsor ladder; pre_implementation gate |
| TIED ships DevOps/cloud/LLM runtime | Courses 12–13 read as product promises | **Defer C** / **Gap M**; client-owned infra |
| Comparison mints REQ | New tokens in markdown | Wave 3 via **add-feature** only |
| Single gate waives inquiry | Doc outreach claimed as integrated activation | Honest gate note; minimal depth |

---

## Compose-don’t-replace

| Tune with **graduate SE curriculum** lens (persona) | Keep **TIED** authority |
| --- | --- |
| Expect agents to debug, test, and structure client code (**A**) | **M** checklist + MCP YAML writes + LEAP |
| Use curriculum as review rubric for agent outputs | Sponsor costly choices; not automatic enforcement |
| Map V&V themes to TDD and gates | \`tied_verify\` when enrolled — not university exam |
| Agentic themes → bounded skills/MCP | Unbounded tool access **anti-pattern** |
| Capstone integrative thinking | Client project + CITDP — TIED is not a degree program |

---

## Bounded operator recommendations (Recommendation-only)

1. **Use plane columns in code review** — Label whether a finding is methodology (**M**), implementation (**A**), or client infra (**C**) before opening REQ scope.
2. **Cross-read Course 15 with AGENTS.md** — Process/evidence bullets align with checklist and sponsor ladder; do not treat as optional flavor text.
3. **Foundations courses 1–6** — Train agents on **A** expectations; do not add fake REQ tokens for algorithms labs.
4. **Optional client-development-index link** — **Defer** until sponsor wants methodology index cross-link.
5. **methodology-composition-matrix row** — **Defer** (costly).
6. **Wave 3 competency profile REQ** — **Defer** — requires scoped **add-feature**.

---

## Phased recommendations

| Phase | Action | Status |
| --- | --- | --- |
| **0** | Wave 1 normalize + this Wave 2 grid + git allowlist | **This build-plan (2026-10-26)** |
| **1** | Split Wave 2 into part files if review pain | **Defer** unless sponsor asks |
| **2** | Project vocab RECORD (\`graduate_engineer_persona\`, \`observance_plane\`) | **Defer** |
| **3** | REQ “TIED graduate competency profile” | **Defer** — **add-feature** |

---

## Explicit non-adoptions

- TIED as **accredited university program** or degree issuer
- Replacing **programming labs** (Courses 1–6) with checklist prose alone
- **Certifying** agents or operators passed formal course assessments via comparison doc
- Shipping **DevOps/cloud/LLM runtime** as universal TIED methodology core (Courses 12–13)
- **Unbounded** agent autonomy without checklist gates (Courses 14–15)
- Minting new \`[REQ-*]\` / \`[ARCH-*]\` / \`[IMPL-*]\` from comparison tables

---

## Proof boundary

- Curriculum content is **Sponsor-proposed** in-repo capture, not an external accredited syllabus verified by stdd.
- TIED surfaces cited are **TIED-existing** at authoring time; composability does not implement degree programs inside stdd.
- **\`tied_validate_consistency\`** was **not** run — no project YAML changed.
- Educational effectiveness and graduate outcomes **not_measured**.
- Wave 3 behavior requires normal TIED workflows — not comparison markdown alone.

---

## Related documents

- [Curriculum capture (sibling)](software-engineering-degree.md)
- [External three-wave comparison template](../../tied-bundle/docs/external-service-three-wave-comparison-template.md)
- [TIED vs well-known methodologies](tied-vs-well-known-methodologies.md)
- [Working plan pass 3](../../tied-project/working/DOC-SOFTWARE-ENGINEERING-DEGREE-COMPARISON/PLAN-refine-pass3.md)
- [Agent req implementation checklist](../../tied-bundle/docs/agent-req-implementation-checklist.md)

---

## Table of contents — bullet inventory

- [Curriculum framing (3 rows)](#curriculum-framing-3-rows)
- [Part III — AI and Agentic Software Engineering (Courses 13–15)](#part-iii--ai-and-agentic-software-engineering-courses-1315)
- [Part II — Software Engineering (Courses 7–12)](#part-ii--software-engineering-courses-712)
- [Part I — Computing Foundations (Courses 1–6)](#part-i--computing-foundations-courses-16)
- [Part IV — Integrative Engineering (Course 16)](#part-iv--integrative-engineering-course-16)

### Courses 1–16

${courseToc}

---

`;
}

function main() {
  const text = fs.readFileSync(CAPTURE, "utf8");
  const { framing, parts } = parseCapture(text);
  const counts = countByCourse(parts);
  counts.framing = framing.length;

  const allCourses = parts.flatMap((p) => p.courses);
  let body = scaffoldHeader(allCourses);

  body += "## Curriculum framing (3 rows)\n\n";
  body += "| Curriculum point | Interpretation | Observance | Disposition | Plane |\n";
  body += "| --- | --- | --- | --- | --- |\n";
  for (const f of framing) {
    body += row(f, 0, "") + "\n";
  }
  body += "\n";

  body += buildInventorySection(
    "Part III — AI and Agentic Software Engineering (Courses 13–15)",
    allCourses,
    (n) => [13, 14, 15].includes(n),
  );
  body += buildInventorySection(
    "Part II — Software Engineering (Courses 7–12)",
    allCourses,
    (n) => n >= 7 && n <= 12,
  );
  body += buildInventorySection(
    "Part I — Computing Foundations (Courses 1–6)",
    allCourses,
    (n) => n >= 1 && n <= 6,
  );
  body += buildInventorySection(
    "Part IV — Integrative Engineering (Course 16)",
    allCourses,
    (n) => n === 16,
  );

  fs.writeFileSync(OUT, body, "utf8");

  const totalBullets = allCourses.reduce(
    (s, c) => s + c.modules.reduce((s2, m) => s2 + m.bullets.length, 0),
    0,
  );
  const totalRows = totalBullets + framing.length;
  console.log(JSON.stringify({ counts, totalBullets, framing: framing.length, totalRows }, null, 2));
}

main();
