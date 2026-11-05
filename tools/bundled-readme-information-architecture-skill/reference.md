# README Information Architecture and Visual Continuity (reference)

Canonical procedure body for `@readme-information-architecture`. Version **1.0** (sponsor-supplied skill).

## Mission

Transform an **accurate, complete** Markdown document into a document that is easier to orient within, scan, navigate, and read across changes of subject. Preserve the knowledge, accuracy, and intent of the original.

**Primary principle:** Optimize how readers encounter information, not how much information exists. Context should remain apparent as the reader moves through the document.

This skill is applicable to hand-authored Markdown and to Markdown produced by templates, code, prompts, or other documentation-generation systems. It is not tied to a particular repository or methodology.

## When to activate

Use this skill when any of the following are true:

- The README is informative but visually monotonous or difficult to scan.
- Substantially different subjects follow one another with insufficient transition.
- A reader cannot quickly distinguish explanation, operating procedure, onboarding, and reference material.
- The document has many headings or links but lacks useful routes for different readers.
- A generator produces complete documentation with poor visual organization.

Do not use this skill as permission to summarize, remove, reinterpret, or redesign the underlying system. A request to improve presentation is **not** a request to simplify the subject matter.

## Nonnegotiable invariants

1. **Content fidelity:** Retain all substantive claims, requirements, caveats, warnings, examples, commands, identifiers, and cross-references unless the task explicitly authorizes their change.
2. **Semantic fidelity:** Do not alter modality or scope. In particular, do not silently change `must` to `should`, remove exceptions, or strengthen unsupported claims.
3. **Link integrity:** Keep existing destinations reachable. Preserve stable heading anchors when possible; update every affected internal link when headings change.
4. **Operational correctness:** Preserve code blocks, command order, code syntax, paths, configuration keys, and runnable instructions.
5. **Source-of-truth integrity:** If Markdown is generated, implement durable improvements in the generator, template, or presentation source rather than only patching output that will be overwritten.
6. **Platform compatibility:** Use constructs actually supported by the target renderer. Favor plain GitHub-flavored Markdown for GitHub READMEs.
7. **No decorative filler:** Every structural or visual device must improve orientation, navigation, comparison, or comprehension.
8. **No unnecessary scope expansion:** Inspect linked documents for context, but do not rewrite them unless needed and authorized. Keep non-documentation behavior unchanged.

## Inputs and defaults

Discover inputs from the working repository, task, and existing generator before asking questions.

| Input | Default if unspecified |
| --- | --- |
| Target document | The README or Markdown document named by the task |
| Renderer | GitHub README rendering for a GitHub repository |
| Preservation mode | Strict content and semantic preservation |
| Related documents | Follow directly linked documents for context and link verification |
| Navigation audience | Newcomer, practitioner, maintainer, and reference reader, as applicable |
| Editing scope | Document presentation and its generating source, if one exists |
| Visual style | Restrained, accessible, Markdown-native, minimal decoration |

If the target cannot be read, do not fabricate a section inventory. Explain the access limitation and work only from confirmed content.

## Workflow

### Phase 1 — Discover document ownership and reading context

1. Read the entire target document, including headings, tables, code blocks, diagram definitions, and links.
2. Inspect directly linked documents sufficiently to understand their purpose and whether the README should route readers to them.
3. Determine whether the target is hand-authored or generated. Look for generator entry points, templates, prompts, configuration, output paths, and regeneration commands.
4. Establish the canonical source. In a generated workflow, identify which layer controls section order, headings, navigation, transitions, and formatting.
5. Identify reader tasks: **understand**, **apply**, **get started**, **operate**, **reference**, **extend**. Keep only those relevant to the document.
6. Capture a baseline: heading outline, local and external links, code fences, code content, diagrams, and a map of substantive topics.

**Deliverable:** A short inventory of subject areas, reader entry points, and source files responsible for rendering them.

### Phase 2 — Diagnose usability friction

Read the document as a sequence of **contexts**, not only headings. Identify:

- Abrupt changes in abstraction: philosophy to procedure, architecture to installation, narrative to reference, or overview to advanced detail.
- Several unrelated topics presented at the same visual level.
- A long unbroken section that contains several different reader tasks.
- A table of contents that mirrors headings but does not help users choose where to start.
- Repeated navigation, ornamental banners, callouts, or diagrams that compete with content.
- Important instructions hidden beneath optional or highly specialized material.
- Headings that describe a topic but not its role in the reader journey.

Classify each major topic by intent and context. Then mark where the reader needs an explicit context transition.

### Phase 3 — Design the information architecture

Produce a proposed grouping **before** extensive edits.

Use a small number of coherent chapters or visual regions. A common pattern is:

1. **Identity and purpose:** What the project/document is and why it exists.
2. **Orientation and navigation:** Which path suits which reader.
3. **Conceptual foundation:** Principles, terminology, model, rationale, boundaries.
4. **Practical application:** Setup, workflow, operations, verification, examples.
5. **Reference and extension:** Tools, implementation details, linked specifications, development.

This is a pattern, **not** a required set of headings. Derive chapter names and order from the actual material. Combine or split chapters when doing so creates clearer contextual units. Do not force a chapter that has no corresponding content.

For each chapter, specify:

- Reader goal and scope.
- Existing sections that belong there.
- The context the reader is entering from.
- A one- to three-sentence orientation or transition, if needed.
- A next-step link, when there is a natural route forward.

Use **progressive disclosure** without removing essential material: orient readers first, present operational detail when needed, and link to deeper existing documentation. Do not move important safety, limitations, or prerequisites out of sight.

### Phase 4 — Implement visible context boundaries

Use a consistent hierarchy with the following roles:

| Visual device | Function | Use selectively |
| --- | --- | --- |
| `#` title and brief opening | Establish the document's identity | Once at the top |
| Reader-oriented navigation | Offer clear paths by intent | Near the top of longer documents |
| `##` chapter headings | Signal major context changes | Whenever the reader's task or subject changes materially |
| `###` section headings | Organize topics within a chapter | Within a stable context |
| Short chapter introduction | Explain the transition and what follows | At major boundaries; usually 1–3 sentences |
| Horizontal rule | Reinforce major separation | Sparingly; not between every heading |
| Small comparison table | Make choices and tradeoffs scannable | When columns clarify distinctions |
| Mermaid diagram | Show relationships, flows, or ownership | Only when it conveys more than prose |
| Collapsible `<details>` | Hide optional long examples or specialized reference material | Never for essential first-use instructions |

**Required outcome:** A reader can tell, at any point, which broad subject they are in and how it relates to the prior subject.

A useful chapter-boundary pattern is:

```markdown
---

## Applying the Method

The preceding chapter explains the principles and constraints. This chapter
turns those ideas into repeatable workflows, setup steps, and verification.

### Choose a starting point

- [New project](#new-project)
- [Existing project](#existing-project)
```

Treat this as a structural example only. Do not inject these topics into unrelated documents or introduce dangling links.

### Phase 5 — Add navigation by reader intent

Create or improve a compact navigation area near the beginning when document length warrants it.

- Prefer **questions or tasks** (for example, "Why does it exist?", "How does it work?", "How do I start?") to a flat, exhaustive list of headings.
- Route to existing section anchors or directly relevant linked documents.
- Use meaningful destination descriptions, not repeated "Learn more" links.
- Keep the choices few enough to scan quickly; group secondary destinations under reference material.
- Make it clear which path is introductory and which is advanced, if both exist.
- Do not duplicate the renderer's entire automatic heading outline unless it adds material value.

Choose link text and chapter introductions that set expectations honestly. Do not imply a tutorial is a specification or that an architectural example is normative.

### Phase 6 — Add explanatory visuals only where justified

Prefer **semantic diagrams** over decorative graphics:

- A lifecycle diagram when the material describes stages, decisions, or gates.
- An architecture or ownership diagram when multiple repositories, components, or data stores have distinct roles.
- A traceability diagram when relationships between requirements, design, implementation, tests, and evidence are central.
- A decision table when readers must compare setup paths, modes, or constraints.

Rules for new diagrams:

1. Derive every node, edge, label, and constraint from documented facts.
2. Do not silently invent architectural relationships, guarantees, or ordering.
3. Make diagrams understandable to screen-reader and text-only readers by providing nearby prose.
4. Keep labels concise and use a consistent visual vocabulary.
5. Keep styling minimal; do not depend on color alone for meaning.
6. Confirm rendering with the target Markdown platform.

If a diagram cannot convey additional information clearly, omit it.

### Phase 7 — Integrate with the documentation generator

If the target README is generated, changes **must survive regeneration**.

1. Locate the highest authoritative layer responsible for the document's presentation: content model, section metadata, ordering rules, templates, or rendering logic.
2. Express navigation groups, chapter boundaries, transition text, and visual conventions as reusable generator features when appropriate. Avoid one-off conditionals bound to the current README's names.
3. Preserve separation between **source content** and **presentation structure**. Do not make the generator rewrite meaning to create transitions.
4. If reusable metadata is introduced, make it optional and provide sensible behavior when it is absent.
5. Preserve existing behavior for unrelated documents; use test fixtures or representative examples to check for regressions.
6. Generate the target document, inspect the rendered Markdown, then regenerate again to verify stable, deterministic output.
7. Avoid manual changes to generated output unless explicitly part of an approved workflow; otherwise they create divergence.

When ownership is unclear, report which file appears authoritative and what must be confirmed; do not overwrite canonical content speculatively.

### Phase 8 — Validate the result

Perform both **mechanical** and **reader-experience** checks.

#### Mechanical checks

- [ ] Valid Markdown and, if present, valid YAML frontmatter.
- [ ] Correct heading nesting, one clear document title, no skipped structural levels without reason.
- [ ] Internal anchors and relative paths resolve after reorganization.
- [ ] External link targets remain unchanged unless a fix is justified.
- [ ] Existing fenced blocks and inline code retain their syntax and content.
- [ ] Existing tables, diagrams, and collapsible regions still render as intended.
- [ ] No substantive topic, prerequisite, example, warning, exception, or requirement was lost.
- [ ] No unsupported new factual assertion was introduced in an orientation paragraph or diagram.
- [ ] Generated documents remain stable after a second run, if generation is available.
- [ ] Changes outside authorized documentation and generator files are absent.

Use available repository tests, link checkers, Markdown linters, and generator commands. If these are unavailable, report manual checks and their limitations instead of claiming automated validation.

#### Reader-experience checks

Test at least these reading paths, where relevant:

1. **New reader:** Can they understand the project's identity and choose a sensible entry point without scrolling through everything?
2. **Conceptual reader:** Can they follow ideas without being surprised by configuration or installation details?
3. **Practitioner:** Can they locate first-use instructions and operational procedures quickly?
4. **Reference reader:** Can they jump to exact details without traversing a tutorial?
5. **Maintainer:** Can they locate the authoritative specifications, tooling, and development notes?

Review the rendered page at both wide and narrow widths if a preview is available. Prefer readability and accessible contrast over decorative complexity.

## Decision rules

- **Abrupt subject change?** Insert a meaningful chapter boundary and short orientation before adding any ornament.
- **Too many peer headings?** Group them by reader task and subject, retaining the detail below each group.
- **Too much scrolling?** Improve navigation first; use collapse or linked detail only for optional content.
- **Several user types?** Provide intent-based entry points; do not fork or duplicate the whole document.
- **Complex relationship?** Add a trustworthy diagram or comparison table, then verify it against the source material.
- **README is generated?** Change generator-level structure and verify regeneration, not merely the output file.
- **Content is already complete?** Do not shorten it to manufacture simplicity.
- **Proposed visual device adds no navigational or explanatory value?** Do not add it.

## Anti-patterns to avoid

- Converting every section into a styled banner or callout.
- Inserting separators after every heading and making boundaries meaningless.
- Adding emojis, badges, or colors as substitutes for document structure.
- Replacing precise prose with vague summaries, or removing caveats for apparent brevity.
- Forcing every document into the same fixed chapter count.
- Duplicating existing content to create multiple reading paths.
- Hiding critical instructions in collapsible sections.
- Breaking inbound anchors casually when renaming headings.
- Adding a diagram that falsely implies causality, sequencing, or guaranteed outcomes.
- Editing a generated README without fixing its source or validating regeneration.

## Output contract

When executing this skill on a repository, produce:

1. **Result:** The revised Markdown or the authoritative generator changes that produce it, within the authorized scope.
2. **Information-architecture map:** A compact mapping of original topics to their resulting chapters or entry points.
3. **Change summary:** New chapter boundaries, navigation paths, transitions, and visuals, with rationale.
4. **Preservation report:** What was checked to show that factual and operational content was retained; explicitly mention any intentional changes.
5. **Verification report:** Rendering, link, Markdown, and regeneration checks that ran, their results, and what could not be checked.

If only an assessment is requested, deliver a proposed map and precise recommendations instead of silently modifying files.

## Acceptance criteria

This skill succeeds when all of the following hold:

- **Orientation:** The reader can identify the current subject and its purpose.
- **Continuity:** Major context changes are signposted instead of jarring.
- **Findability:** Readers can choose routes based on their goals.
- **Cohesion:** Related topics appear together under consistent structure.
- **Fidelity:** All substantive information and operational behavior remain accurate and available.
- **Portability:** The document renders in the target Markdown environment without dependence on unsupported styling.
- **Durability:** For generated documents, improvements are produced by the canonical system and survive regeneration.

**Final directive:** Do not solve a presentation problem by removing knowledge. Restructure its encounter with the reader, preserve its meaning, and verify that the improvement survives the way the document is built.
