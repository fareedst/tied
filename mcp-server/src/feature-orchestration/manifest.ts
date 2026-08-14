export type LifecyclePhase =
  | "draft"
  | "refining"
  | "specified"
  | "planned"
  | "tasked"
  | "verifying"
  | "closed"
  | "abandoned";

export type ManifestMode = "greenfield" | "brownfield";

export interface CanonicalTokens {
  requirements: string[];
  architecture: string[];
  implementations: string[];
}

export interface FeatureManifest {
  schema_version: "feature-manifest.v1";
  feature_id: string;
  slug: string;
  title: string;
  mode: ManifestMode;
  status: LifecyclePhase;
  revision: number;
  created_at: string;
  updated_at: string;
  canonical_tokens: CanonicalTokens;
  artifacts?: string[];
  open_questions?: string[];
  dependencies?: string[];
  tasks?: string[];
  history?: unknown[];
}

export type ManifestValidationError = {
  category:
    | "UNSUPPORTED_VERSION"
    | "INVALID_IDENTITY"
    | "EMBEDDED_CANONICAL_BODY"
    | "INVALID_REFERENCE_SHAPE";
  field?: string;
};

export type ManifestValidationResult =
  | { ok: true; manifest: FeatureManifest; error?: never }
  | { ok: false; error: ManifestValidationError };

const phases = new Set<LifecyclePhase>([
  "draft",
  "refining",
  "specified",
  "planned",
  "tasked",
  "verifying",
  "closed",
  "abandoned",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stableStrings(value: unknown): string[] | undefined {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) return undefined;
  return [...new Set(value)].sort((left, right) => left.localeCompare(right));
}

function normalizeManifest(manifest: FeatureManifest): FeatureManifest {
  // [IMPL-FEAT_MANIFEST_VALIDATOR] [ARCH-FEAT_MANIFEST_CONTRACT] [REQ-FEAT_MANIFEST_SCHEMA] — How: normalize accepted manifest data for deterministic comparison.
  return {
    ...manifest,
    canonical_tokens: {
      requirements: [...manifest.canonical_tokens.requirements],
      architecture: [...manifest.canonical_tokens.architecture],
      implementations: [...manifest.canonical_tokens.implementations],
    },
    ...(manifest.artifacts ? { artifacts: [...manifest.artifacts].sort() } : {}),
    ...(manifest.open_questions ? { open_questions: [...manifest.open_questions].sort() } : {}),
    ...(manifest.dependencies ? { dependencies: [...manifest.dependencies].sort() } : {}),
    ...(manifest.tasks ? { tasks: [...manifest.tasks].sort() } : {}),
  };
}

// [IMPL-FEAT_MANIFEST_VALIDATOR] [ARCH-FEAT_MANIFEST_CONTRACT] [REQ-FEAT_MANIFEST_SCHEMA] — How: enforce version, identity, mode, lifecycle, references, revision, and ownership.
export function validateManifest(rawManifest: unknown): ManifestValidationResult {
  if (!isRecord(rawManifest)) return { ok: false, error: { category: "INVALID_IDENTITY" } };
  if (rawManifest.schema_version !== "feature-manifest.v1") {
    return { ok: false, error: { category: "UNSUPPORTED_VERSION", field: "schema_version" } };
  }

  const embeddedBody =
    (isRecord(rawManifest.title) && "body" in rawManifest.title) ||
    "requirement_bodies" in rawManifest ||
    "architecture_bodies" in rawManifest ||
    "implementation_bodies" in rawManifest;
  if (embeddedBody) return { ok: false, error: { category: "EMBEDDED_CANONICAL_BODY" } };

  const featureId = rawManifest.feature_id;
  const slug = rawManifest.slug;
  const title = rawManifest.title;
  const revision = rawManifest.revision;
  const mode = rawManifest.mode;
  const status = rawManifest.status;
  if (
    typeof featureId !== "string" ||
    !/^FEAT-\d{3,}$/.test(featureId) ||
    typeof slug !== "string" ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
    typeof title !== "string" ||
    title.trim() === "" ||
    typeof revision !== "number" ||
    !Number.isInteger(revision) ||
    revision < 1 ||
    !phases.has(status as LifecyclePhase) ||
    (mode !== "greenfield" && mode !== "brownfield") ||
    typeof rawManifest.created_at !== "string" ||
    typeof rawManifest.updated_at !== "string"
  ) {
    return { ok: false, error: { category: "INVALID_IDENTITY" } };
  }

  if (!isRecord(rawManifest.canonical_tokens)) {
    return { ok: false, error: { category: "INVALID_REFERENCE_SHAPE", field: "canonical_tokens" } };
  }
  const requirements = stableStrings(rawManifest.canonical_tokens.requirements);
  const architecture = stableStrings(rawManifest.canonical_tokens.architecture);
  const implementations = stableStrings(rawManifest.canonical_tokens.implementations);
  if (
    !requirements?.every((token) => /^REQ-[A-Z0-9_]+$/.test(token)) ||
    !architecture?.every((token) => /^ARCH-[A-Z0-9_]+$/.test(token)) ||
    !implementations?.every((token) => /^IMPL-[A-Z0-9_]+$/.test(token))
  ) {
    return { ok: false, error: { category: "INVALID_REFERENCE_SHAPE", field: "canonical_tokens" } };
  }

  const optionalArrays = ["artifacts", "open_questions", "dependencies", "tasks"] as const;
  for (const field of optionalArrays) {
    if (field in rawManifest && !stableStrings(rawManifest[field])) {
      return { ok: false, error: { category: "INVALID_REFERENCE_SHAPE", field } };
    }
  }

  const normalized: FeatureManifest = {
    schema_version: "feature-manifest.v1",
    feature_id: featureId,
    slug,
    title,
    mode,
    status: status as LifecyclePhase,
    revision,
    created_at: rawManifest.created_at,
    updated_at: rawManifest.updated_at,
    canonical_tokens: { requirements, architecture, implementations },
    ...(stableStrings(rawManifest.artifacts) ? { artifacts: stableStrings(rawManifest.artifacts) } : {}),
    ...(stableStrings(rawManifest.open_questions) ? { open_questions: stableStrings(rawManifest.open_questions) } : {}),
    ...(stableStrings(rawManifest.dependencies) ? { dependencies: stableStrings(rawManifest.dependencies) } : {}),
    ...(stableStrings(rawManifest.tasks) ? { tasks: stableStrings(rawManifest.tasks) } : {}),
    ...(Array.isArray(rawManifest.history) ? { history: [...rawManifest.history] } : {}),
  };
  return { ok: true, manifest: normalizeManifest(normalized) };
}
