export type FixtureOwner = "manifest" | "lifecycle" | "references";

export interface FixtureCase {
  name: string;
  owner: FixtureOwner;
  input: unknown;
  expected: { ok: boolean; category?: string };
}

export type FixtureValidator = (input: unknown) => { ok: boolean; error?: { category?: string } };

export interface FixtureValidationResult {
  ok: boolean;
  error?: { category: string; scenario?: string };
  results?: Array<{ name: string; ok: boolean }>;
  coverage_report?: { required: string[]; present: string[]; missing: string[] };
}

export const REQUIRED_SCENARIOS = [
  "greenfield",
  "brownfield",
  "ambiguous",
  "multi-module",
  "multi-approach",
  "stale-view",
  "partial-write",
  "migration",
  "invalid-reference",
];

export const BATCH_0_FIXTURE_CASES: FixtureCase[] = [
  {
    name: "greenfield",
    owner: "manifest",
    input: {
      schema_version: "feature-manifest.v1",
      feature_id: "FEAT-003",
      slug: "chat-system",
      title: "Chat",
      mode: "greenfield",
      status: "draft",
      revision: 1,
      created_at: "2026-08-13T12:00:00.000Z",
      updated_at: "2026-08-13T12:00:00.000Z",
      canonical_tokens: { requirements: [], architecture: [], implementations: [] },
    },
    expected: { ok: true },
  },
  {
    name: "brownfield",
    owner: "manifest",
    input: {
      schema_version: "feature-manifest.v1",
      feature_id: "FEAT-004",
      slug: "legacy-chat",
      title: "Legacy chat",
      mode: "brownfield",
      status: "draft",
      revision: 1,
      created_at: "2026-08-13T12:00:00.000Z",
      updated_at: "2026-08-13T12:00:00.000Z",
      canonical_tokens: { requirements: [], architecture: [], implementations: [] },
    },
    expected: { ok: true },
  },
  ...(["ambiguous", "multi-module", "multi-approach", "stale-view", "partial-write", "migration", "invalid-reference"] as const).map(
    (name): FixtureCase => ({
      name,
      owner: "manifest",
      input: {
        schema_version: name === "migration" ? "feature-manifest.v0" : "feature-manifest.v1",
        feature_id: name === "partial-write" ? "FEAT-0" : "FEAT-005",
        slug: name === "ambiguous" ? "not safe" : "valid-fixture",
        title: "Fixture",
        mode: "greenfield",
        status: "draft",
        revision: name === "partial-write" ? 0 : 1,
        created_at: "2026-08-13T12:00:00.000Z",
        updated_at: "2026-08-13T12:00:00.000Z",
        canonical_tokens: {
          requirements: name === "invalid-reference" ? ["bad"] : [],
          architecture: [],
          implementations: [],
        },
      },
      expected:
        name === "multi-module" || name === "multi-approach" || name === "stale-view"
          ? { ok: true }
          : {
              ok: false,
              category:
                name === "migration"
                  ? "UNSUPPORTED_VERSION"
                  : name === "invalid-reference"
                    ? "INVALID_REFERENCE_SHAPE"
                    : "INVALID_IDENTITY",
            },
    })
  ),
];

function sameOutcome(actual: { ok: boolean; error?: { category?: string } }, expected: FixtureCase["expected"]): boolean {
  return actual.ok === expected.ok && (expected.ok || actual.error?.category === expected.category);
}

// [IMPL-FEAT_FIXTURE_VALIDATORS] [ARCH-FEAT_FIXTURE_CORPUS] [REQ-FEAT_FIXTURE_VALIDATION] — How: execute each fixture against its isolated validator and compare deterministic evidence.
export function validateFixtureCorpus(
  fixtureCases: FixtureCase[],
  validatorModules: Partial<Record<FixtureOwner, FixtureValidator>>
): FixtureValidationResult {
  const present = [...new Set(fixtureCases.map((fixture) => fixture.name))];
  const missing = REQUIRED_SCENARIOS.filter((scenario) => !present.includes(scenario));
  if (missing.length > 0) return { ok: false, error: { category: "MISSING_SCENARIO", scenario: missing[0] } };

  const results: Array<{ name: string; ok: boolean }> = [];
  for (const fixture of fixtureCases) {
    const validator = validatorModules[fixture.owner];
    if (!validator) return { ok: false, error: { category: "MISSING_SCENARIO", scenario: fixture.name } };
    const first = validator(fixture.input);
    const second = validator(fixture.input);
    if (JSON.stringify(first) !== JSON.stringify(second)) {
      return { ok: false, error: { category: "UNSTABLE_DIAGNOSTIC", scenario: fixture.name } };
    }
    if (!sameOutcome(first, fixture.expected)) {
      return {
        ok: false,
        error: {
          category: fixture.expected.ok ? "UNEXPECTED_REJECTION" : "UNEXPECTED_ACCEPTANCE",
          scenario: fixture.name,
        },
      };
    }
    results.push({ name: fixture.name, ok: true });
  }
  return {
    ok: true,
    results,
    coverage_report: { required: [...REQUIRED_SCENARIOS], present, missing: [] },
  };
}
