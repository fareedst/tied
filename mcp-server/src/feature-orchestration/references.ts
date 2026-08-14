export type ReferenceLayer = "requirements" | "architecture" | "implementations";

export interface CanonicalReference {
  token: string;
  layer: ReferenceLayer;
}

export type CanonicalIndexes = {
  [Layer in ReferenceLayer]: Record<string, Record<string, unknown>>;
};

export type LinkError = {
  category:
    | "MALFORMED_REFERENCE"
    | "DANGLING_REFERENCE"
    | "WRONG_TOKEN_TYPE"
    | "DUPLICATE_REFERENCE"
    | "INCONSISTENT_GRAPH";
  token?: string;
};

export type ReferenceResult =
  | { ok: true; links: Array<CanonicalReference & { record: Record<string, unknown> }>; error?: never }
  | { ok: false; error: LinkError };

function tokenLayer(token: string): ReferenceLayer | undefined {
  if (token.startsWith("REQ-")) return "requirements";
  if (token.startsWith("ARCH-")) return "architecture";
  if (token.startsWith("IMPL-")) return "implementations";
  return undefined;
}

// [IMPL-FEAT_REFERENCE_LINKER] [ARCH-FEAT_CANONICAL_LINK_BOUNDARY] [REQ-FEAT_CANONICAL_LINKS] — How: resolve references, enforce token type, and validate the REQ→ARCH→IMPL graph.
export function resolveCanonicalReferences(
  manifestReferences: CanonicalReference[],
  canonicalIndexes: CanonicalIndexes
): ReferenceResult {
  const seen = new Set<string>();
  const links: Array<CanonicalReference & { record: Record<string, unknown> }> = [];
  for (const reference of manifestReferences) {
    // [IMPL-FEAT_REFERENCE_LINKER] [ARCH-FEAT_CANONICAL_LINK_BOUNDARY] [REQ-FEAT_CANONICAL_LINKS] — How: resolve each typed reference and preserve canonical ownership.
    if (
      !reference ||
      typeof reference.token !== "string" ||
      !["requirements", "architecture", "implementations"].includes(reference.layer)
    ) {
      return { ok: false, error: { category: "MALFORMED_REFERENCE" } };
    }
    if (seen.has(reference.token)) return { ok: false, error: { category: "DUPLICATE_REFERENCE", token: reference.token } };
    seen.add(reference.token);
    const expectedLayer = tokenLayer(reference.token);
    if (!expectedLayer) return { ok: false, error: { category: "MALFORMED_REFERENCE", token: reference.token } };
    if (expectedLayer !== reference.layer) return { ok: false, error: { category: "WRONG_TOKEN_TYPE", token: reference.token } };
    const record = canonicalIndexes[reference.layer][reference.token];
    if (!record) return { ok: false, error: { category: "DANGLING_REFERENCE", token: reference.token } };
    links.push({ ...reference, record });
  }

  const linkedLayers = new Set(links.map((link) => link.layer));
  if (linkedLayers.has("requirements") && linkedLayers.has("implementations") && !linkedLayers.has("architecture")) {
    return { ok: false, error: { category: "INCONSISTENT_GRAPH" } };
  }
  return { ok: true, links };
}
