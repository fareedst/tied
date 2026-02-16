/**
 * Generate detail markdown files from parsed monolithic sections.
 * Preserves original content and adds standard headers/footers plus migration footnote.
 * [IMPL] Optionally renders extra keys from parsed.fields in an "Other fields" section.
 */

import type {
  ParsedRequirement,
  ParsedArchitectureDecision,
  ParsedImplementationDecision,
} from "./parser.js";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Keys already rendered in the main requirement detail; others go under "Other fields". */
const REQUIREMENT_RENDERED_KEYS = new Set([
  "description", "rationale", "satisfaction_criteria", "validation_criteria", "implementation_notes",
  "priority", "category", "status",
]);
/** Keys already rendered in architecture detail. */
const ARCHITECTURE_RENDERED_KEYS = new Set([
  "decision", "rationale", "alternatives_considered", "implementation_approach", "token_coverage", "status",
]);
/** Keys already rendered in implementation detail. */
const IMPLEMENTATION_RENDERED_KEYS = new Set([
  "decision", "rationale", "implementation_approach", "implementation_details", "code_markers",
  "token_coverage", "validation_evidence", "status",
  "location", "result_type_fields", "item_error_fields", "population", "availability",
]);

function formatFieldValue(v: string | string[]): string {
  if (typeof v === "string") return v;
  return v.map((s) => `- ${s}`).join("\n");
}

function otherFieldsSection(
  fields: Record<string, string | string[]> | undefined,
  renderedKeys: Set<string>
): string {
  if (!fields || Object.keys(fields).length === 0) return "";
  const extra = Object.keys(fields).filter((k) => !renderedKeys.has(k)).sort();
  if (extra.length === 0) return "";
  const lines = extra.map((k) => `### ${k.replace(/_/g, " ")}\n\n${formatFieldValue(fields[k])}`);
  return `
## Other fields (from YAML)

${lines.join("\n\n")}
`;
}

/**
 * Build requirement detail markdown. Preserves body or fills from parsed fields.
 */
export function requirementDetailMarkdown(
  parsed: ParsedRequirement,
  sourceFileName: string
): string {
  const date = today();
  const statusStr =
    parsed.status?.includes("Implemented") || parsed.status?.includes("✅")
      ? "✅ Implemented"
      : "⏳ Planned";
  const priorityStr = parsed.priority || "P1";
  const categoryStr = parsed.category || "Functional";
  const archList = parsed.traceability_arch?.length
    ? parsed.traceability_arch.map((a) => `[${a}]`).join(", ")
    : "—";
  const implList = parsed.traceability_impl?.length
    ? parsed.traceability_impl.map((i) => `[${i}]`).join(", ")
    : "—";
  const dependsList = parsed.related_depends_on?.length
    ? parsed.related_depends_on.map((r) => `[${r}]`).join(", ")
    : "None";

  const description = parsed.description || parsed.body;
  const rationale = parsed.rationale || parsed.body;
  const satisfaction = parsed.satisfaction_criteria || parsed.body;
  const validation = parsed.validation_criteria || parsed.body;

  const implementationNotesSection =
    parsed.implementation_notes != null && parsed.implementation_notes !== ""
      ? `
## Implementation Notes

${parsed.implementation_notes}

`
      : "";

  const otherFields = otherFieldsSection(parsed.fields, REQUIREMENT_RENDERED_KEYS);
  const originalSectionBlock =
    parsed.body !== ""
      ? `

---

## Original section (from monolithic source)

<details>
<summary>Full section content from monolithic source</summary>

\`\`\`\`
${parsed.body}
\`\`\`\`

</details>
`
      : "";

  return `# [${parsed.token}] ${parsed.title}

**Category**: ${categoryStr}
**Priority**: ${priorityStr}
**Status**: ${statusStr}
**Created**: ${date}
**Last Updated**: ${date}

---

## Description

${description}

## Rationale

${rationale}

## Satisfaction Criteria

${satisfaction}

## Validation Criteria

${validation}
${implementationNotesSection}## Traceability

- **Architecture**: ${archList} (see \`architecture-decisions.yaml\`)
- **Implementation**: ${implList} (see \`implementation-decisions.yaml\`)
- **Tests**: See validation criteria
- **Code**: Annotations \`[${parsed.token}]\`

## Related Requirements

- **Depends on**: ${dependsList}
- **Related to**: —
- **Supersedes**: —
${otherFields}
${originalSectionBlock}

---

*Migrated from monolithic ${sourceFileName} on ${date}. Full section content from monolithic source is included when structured fields were not extracted.*
`;
}

/**
 * Build architecture decision detail markdown.
 * Preserves token_coverage from source and appends original section body for fidelity.
 */
export function architectureDetailMarkdown(
  parsed: ParsedArchitectureDecision,
  sourceFileName: string
): string {
  const date = today();
  const reqRefs = parsed.req_refs.length
    ? parsed.req_refs.map((r) => `[${r}]`).join(", ")
    : "—";
  const statusStr =
    parsed.status != null && parsed.status.trim() !== ""
      ? parsed.status
      : "Active";
  const decision = parsed.decision || parsed.body;
  const rationale = parsed.rationale || parsed.body;
  const alternatives =
    parsed.alternatives_considered != null && parsed.alternatives_considered.trim() !== ""
      ? parsed.alternatives_considered
      : "—";
  const approach = parsed.implementation_approach || parsed.body;

  const tokenCoverageSection =
    parsed.token_coverage != null && parsed.token_coverage.trim() !== ""
      ? `
## Token Coverage \`[PROC-TOKEN_AUDIT]\`

${parsed.token_coverage}
`
      : `
## Token Coverage \`[PROC-TOKEN_AUDIT]\`

- [ ] Code and tests carry \`[${parsed.token}]\` and related tokens
`;

  const otherFields = otherFieldsSection(parsed.fields, ARCHITECTURE_RENDERED_KEYS);
  const originalSectionBlock =
    parsed.body != null && parsed.body.trim() !== ""
      ? `

---

## Original section (from monolithic source)

<details>
<summary>Full section content from monolithic source</summary>

\`\`\`\`
${parsed.body}
\`\`\`\`

</details>
`
      : "";

  return `# [${parsed.token}] ${parsed.title}

**Cross-References**: ${reqRefs}
**Status**: ${statusStr}
**Created**: ${date}
**Last Updated**: ${date}

---

## Decision

${decision}

## Rationale

${rationale}

## Alternatives Considered

${alternatives}

## Implementation Approach

${approach}
${tokenCoverageSection}
## Validation Evidence \`[PROC-TOKEN_VALIDATION]\`

| Date | Result | Notes |
|------|--------|-------|
| ${date} | Migrated | Converted from monolithic |

## Related Decisions

- Depends on: ${reqRefs}
- Informs: (see implementation decisions)
- See also: —
${otherFields}
${originalSectionBlock}

---

*Migrated from monolithic ${sourceFileName} on ${date}. Full section content from monolithic source is included when structured fields were not extracted.*
`;
}

/**
 * Build implementation decision detail markdown.
 */
export function implementationDetailMarkdown(
  parsed: ParsedImplementationDecision,
  sourceFileName: string
): string {
  const date = today();
  const archRefs = parsed.arch_refs.length
    ? parsed.arch_refs.map((a) => `[${a}]`).join(", ")
    : "—";
  const reqRefs = parsed.req_refs.length
    ? parsed.req_refs.map((r) => `[${r}]`).join(", ")
    : "—";
  const statusStr =
    parsed.status != null && parsed.status.trim() !== ""
      ? parsed.status
      : "Active";
  const decision =
    parsed.decision != null && parsed.decision.trim() !== ""
      ? parsed.decision
      : "—";
  const rationale =
    parsed.rationale != null && parsed.rationale.trim() !== ""
      ? parsed.rationale
      : "Implements architecture and requirement tokens above.";
  const approach = parsed.implementation_approach || parsed.body;

  const implementationDetailsSection =
    parsed.implementation_details != null && parsed.implementation_details.trim() !== ""
      ? `
## Implementation Details

${parsed.implementation_details}
`
      : "";

  const yamlLines: string[] = [];
  if (parsed.location != null && parsed.location !== "")
    yamlLines.push("location: " + JSON.stringify(parsed.location));
  if (parsed.result_type_fields_structured != null && parsed.result_type_fields_structured.length > 0) {
    yamlLines.push("result_type_fields:");
    for (const e of parsed.result_type_fields_structured)
      yamlLines.push(`  - { name: ${JSON.stringify(e.name)}${e.type != null ? `, type: ${JSON.stringify(e.type)}` : ""} }`);
  }
  if (parsed.item_error_fields_structured != null && parsed.item_error_fields_structured.length > 0) {
    yamlLines.push("item_error_fields:");
    for (const e of parsed.item_error_fields_structured)
      yamlLines.push(`  - { name: ${JSON.stringify(e.name)}${e.type != null ? `, type: ${JSON.stringify(e.type)}` : ""} }`);
  }
  if (parsed.population != null && parsed.population !== "")
    yamlLines.push("population: " + JSON.stringify(parsed.population));
  if (parsed.availability != null && parsed.availability !== "")
    yamlLines.push("availability: " + JSON.stringify(parsed.availability));
  const structuredDataYaml = yamlLines.length > 0 ? yamlLines.join("\n") : "";
  const structuredDataSection =
    structuredDataYaml !== ""
      ? `
## Implementation approach data (STDD)

Headings and categories converted to data keys for REQ/ARCH/IMPL traceability:

\`\`\`yaml
${structuredDataYaml}
\`\`\`
`
      : "";

  const codeMarkersSection =
    parsed.code_markers != null && parsed.code_markers.trim() !== ""
      ? `
## Code Markers

${parsed.code_markers}
`
      : `
## Code Locations

- See traceability in \`implementation-decisions.yaml\`
`;

  const tokenCoverageSection =
    parsed.token_coverage != null && parsed.token_coverage.trim() !== ""
      ? `
## Token Coverage \`[PROC-TOKEN_AUDIT]\`

${parsed.token_coverage}
`
      : "";

  const validationEvidenceSection =
    parsed.validation_evidence != null && parsed.validation_evidence.trim() !== ""
      ? `
## Validation Evidence \`[PROC-TOKEN_VALIDATION]\`

${parsed.validation_evidence}
`
      : "";

  const otherFields = otherFieldsSection(parsed.fields, IMPLEMENTATION_RENDERED_KEYS);
  const originalSectionBlock =
    parsed.body != null && parsed.body.trim() !== ""
      ? `

---

## Original section (from monolithic source)

<details>
<summary>Full section content from monolithic source</summary>

\`\`\`\`
${parsed.body}
\`\`\`\`

</details>
`
      : "";

  return `# [${parsed.token}] ${parsed.title}

**Cross-References**: ${archRefs} ${reqRefs}
**Status**: ${statusStr}
**Created**: ${date}
**Last Updated**: ${date}

---

## Decision

${decision}

## Rationale

${rationale}

## Implementation Approach

${approach}
${implementationDetailsSection}
${structuredDataSection}
${codeMarkersSection}
${tokenCoverageSection}
${validationEvidenceSection}
## Related Decisions

- Depends on: ${archRefs} ${reqRefs}
- Supersedes: —
- See also: —
${otherFields}
${originalSectionBlock}

---

*Migrated from monolithic ${sourceFileName} on ${date}. Full section content from monolithic source is included when structured fields were not extracted.*
`;
}
