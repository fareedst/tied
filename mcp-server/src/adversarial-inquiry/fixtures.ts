import type { EvidenceObservation, FidelityStatement } from "./types.js";

export type LanguageNeutralFixture = {
  name: string;
  purpose: "positive" | "negative" | "boundary" | "unsupported";
  specification: FidelityStatement[];
  testEvidence: EvidenceObservation[];
  productionEvidence: EvidenceObservation[];
};

const specification: FidelityStatement[] = [
  { id: "input", kind: "precondition", value: "input is present", order: 1 },
  { id: "output", kind: "effect", value: "return normalized output", order: 2 },
];

function observation(
  direction: "test" | "production",
  statement: FidelityStatement,
  value = statement.value,
): EvidenceObservation {
  return {
    id: `${direction}-${statement.id}`,
    direction,
    statementId: statement.id,
    kind: statement.kind,
    value,
    order: statement.order,
    reliable: true,
    source: { location: `${direction}-fixture.ts:${statement.order}` },
    provenance: `${direction}-fixture`,
    blockRevision: "fixture-revision-1",
  };
}

export const ADVERSARIAL_INQUIRY_FIXTURES: readonly LanguageNeutralFixture[] = [
  {
    name: "known-good-complete",
    purpose: "positive",
    specification,
    testEvidence: specification.map((statement) => observation("test", statement)),
    productionEvidence: specification.map((statement) => observation("production", statement)),
  },
  {
    name: "known-bad-missing-effect",
    purpose: "negative",
    specification,
    testEvidence: [observation("test", specification[0]!)],
    productionEvidence: specification.map((statement) => observation("production", statement)),
  },
  {
    name: "negative-control-false-statement",
    purpose: "negative",
    specification,
    testEvidence: [
      observation("test", specification[0]!),
      observation("test", specification[1]!, "return unnormalized output"),
    ],
    productionEvidence: specification.map((statement) => observation("production", statement)),
  },
  {
    name: "boundary-unsupported-evidence",
    purpose: "unsupported",
    specification,
    testEvidence: [{
      ...observation("test", specification[0]!),
      unresolvedReason: "unsupported_adapter",
    }],
    productionEvidence: specification.map((statement) => observation("production", statement)),
  },
];
