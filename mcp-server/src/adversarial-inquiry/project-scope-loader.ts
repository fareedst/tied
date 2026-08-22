import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

import { resolveProjectManifest, type ProjectManifest } from "../fidelity-research/manifest.js";

type JsonObject = Record<string, unknown>;

export type ProjectScopeLoaderInput = {
  projectRoot: string;
  tiedBasePath?: string;
  requestToken: string;
  implToken: string;
  testPath: string;
  productionPath: string;
  productionEvidencePath?: string;
  productionEvidence?: unknown;
};

export type ProjectScopeErrorCode =
  | "INVALID_INPUT"
  | "INVALID_MANIFEST"
  | "WRONG_TIED_BASE_PATH"
  | "UNSAFE_PATH"
  | "MISSING_FILE"
  | "NON_FILE"
  | "INVALID_YAML"
  | "INVALID_JSON"
  | "MISSING_RECORD"
  | "MISSING_PSEUDOCODE"
  | "READ_ERROR";

export type ProjectScopeError = {
  code: ProjectScopeErrorCode;
  message: string;
  path?: string;
};

export type ProjectScopeRevisions = {
  requirements: string;
  architecture: string;
  implementation: string;
  semanticTokens: string;
  requirementDetail: string;
  architectureDetail: string;
  implementationDetail: string;
  implementationPseudocode: string;
  test: string;
  production: string;
  productionEvidence?: string;
};

export type LoadedProjectScope = {
  manifest: ProjectManifest;
  requestToken: string;
  implToken: string;
  requirement: JsonObject;
  architecture: JsonObject;
  implementation: JsonObject;
  implementationPseudocode: string;
  testSource: string;
  productionSource: string;
  productionEvidence?: unknown;
  revisions: ProjectScopeRevisions;
};

export type ProjectScopeLoadResult =
  | { ok: true; scope: LoadedProjectScope }
  | { ok: false; error: ProjectScopeError };

const TOKEN_RE = /^(REQ|ARCH|IMPL)-[A-Z0-9][A-Z0-9_-]*$/u;

function error(
  code: ProjectScopeErrorCode,
  message: string,
  filePath?: string,
): { ok: false; error: ProjectScopeError } {
  return { ok: false, error: { code, message, path: filePath } };
}

function revision(bytes: string): string {
  return createHash("sha256").update(bytes, "utf8").digest("hex").slice(0, 16);
}

function isObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function unwrapRecord(value: unknown, token: string): JsonObject | undefined {
  if (!isObject(value)) return undefined;
  const nested = value[token];
  return isObject(nested) ? nested : value;
}

function isWithin(root: string, candidate: string): boolean {
  const relative = path.relative(path.resolve(root), path.resolve(candidate));
  return relative === ""
    || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

async function readFileText(
  filePath: string,
  missingPath: string,
): Promise<{ ok: true; text: string } | { ok: false; error: ProjectScopeError }> {
  try {
    return { ok: true, text: await fs.readFile(filePath, "utf8") };
  } catch (cause) {
    const code = (cause as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return error("MISSING_FILE", `File not found: ${missingPath}`, missingPath);
    return error("READ_ERROR", `Unable to read ${missingPath}.`, missingPath);
  }
}

async function resolveDeclaredFile(
  projectRoot: string,
  userPath: string,
): Promise<{ ok: true; filePath: string } | { ok: false; error: ProjectScopeError }> {
  if (!userPath.trim() || path.isAbsolute(userPath) || userPath.includes("\0")) {
    return error("UNSAFE_PATH", `Declared path must be a non-empty repository-relative file: ${userPath}`, userPath);
  }
  const candidate = path.resolve(projectRoot, userPath);
  if (!isWithin(projectRoot, candidate)) {
    return error("UNSAFE_PATH", `Declared path escapes project root: ${userPath}`, userPath);
  }
  let realPath: string;
  try {
    realPath = await fs.realpath(candidate);
  } catch (cause) {
    if ((cause as NodeJS.ErrnoException).code === "ENOENT") {
      return error("MISSING_FILE", `Declared file does not exist: ${userPath}`, userPath);
    }
    return error("READ_ERROR", `Unable to resolve declared path: ${userPath}`, userPath);
  }
  if (!isWithin(projectRoot, realPath)) {
    return error("UNSAFE_PATH", `Declared path resolves outside project root: ${userPath}`, userPath);
  }
  try {
    if (!(await fs.stat(realPath)).isFile()) {
      return error("NON_FILE", `Declared path is not a regular file: ${userPath}`, userPath);
    }
  } catch {
    return error("READ_ERROR", `Unable to inspect declared path: ${userPath}`, userPath);
  }
  return { ok: true, filePath: realPath };
}

async function readYamlRecord(
  tiedBasePath: string,
  indexName: "requirements" | "architecture-decisions" | "implementation-decisions",
  token: string,
  indexBytes: string,
): Promise<
  { ok: true; record: JsonObject; detail: JsonObject; detailBytes: string }
  | { ok: false; error: ProjectScopeError }
> {
  let indexData: unknown;
  try {
    indexData = yaml.load(indexBytes);
  } catch {
    return error("INVALID_YAML", `Invalid YAML in ${indexName}.yaml`, `${indexName}.yaml`);
  }
  if (!isObject(indexData) || !isObject(indexData[token])) {
    return error("MISSING_RECORD", `Token ${token} is absent from ${indexName}.yaml`, `${indexName}.yaml`);
  }
  const record = unwrapRecord(indexData[token], token);
  if (!record) return error("MISSING_RECORD", `Token ${token} has no index record.`, `${indexName}.yaml`);
  const detailFile = typeof record.detail_file === "string"
    ? record.detail_file
    : `${indexName}/${token}.yaml`;
  const detailResult = await resolveDeclaredFile(tiedBasePath, detailFile);
  if (!detailResult.ok) return detailResult;
  const detailRead = await readFileText(detailResult.filePath, detailFile);
  if (!detailRead.ok) return detailRead;
  let detailData: unknown;
  try {
    detailData = yaml.load(detailRead.text);
  } catch {
    return error("INVALID_YAML", `Invalid YAML in ${detailFile}`, detailFile);
  }
  const detail = unwrapRecord(detailData, token);
  if (!detail) return error("MISSING_RECORD", `Token ${token} has no detail record.`, detailFile);
  return { ok: true, record, detail, detailBytes: detailRead.text };
}

async function readPseudocode(
  tiedBasePath: string,
  implToken: string,
  implementation: JsonObject,
): Promise<{ ok: true; text: string; bytes: string } | { ok: false; error: ProjectScopeError }> {
  const configuredPath = typeof implementation.essence_pseudocode_path === "string"
    ? implementation.essence_pseudocode_path
    : `implementation-decisions/${implToken}-pseudocode.md`;
  const sidecar = await resolveDeclaredFile(tiedBasePath, configuredPath);
  if (sidecar.ok) {
    const read = await readFileText(sidecar.filePath, configuredPath);
    if (!read.ok) return read;
    return { ok: true, text: read.text, bytes: read.text };
  }
  if (typeof implementation.essence_pseudocode === "string" && implementation.essence_pseudocode.length > 0) {
    return {
      ok: true,
      text: implementation.essence_pseudocode,
      bytes: implementation.essence_pseudocode,
    };
  }
  if (sidecar.error.code === "MISSING_FILE") {
    return error("MISSING_PSEUDOCODE", `Pseudo-code sidecar not found for ${implToken}.`, configuredPath);
  }
  return sidecar;
}

function manifestFor(input: ProjectScopeLoaderInput): ProjectManifest | ProjectScopeError {
  const tiedBasePath = input.tiedBasePath ?? path.join(input.projectRoot, "tied");
  const result = resolveProjectManifest({
    projectRoot: input.projectRoot,
    tiedBasePath,
    version: "mode-b-fixture",
    languages: ["ruby"],
    testClassifiers: ["minitest"],
    ignoreRules: [],
  });
  return result.ok
    ? result.manifest
    : {
      code: result.error === "WrongTiedBasePath" ? "WRONG_TIED_BASE_PATH" : "INVALID_MANIFEST",
      message: result.error,
    };
}

// [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY] How: validate an explicit project boundary, load declared read-only inputs, and normalize one supported Ruby Minitest fixture into the existing inquiry core.
export async function loadProjectScope(input: ProjectScopeLoaderInput): Promise<ProjectScopeLoadResult> {
  if (
    !input
    || typeof input.projectRoot !== "string"
    || typeof input.requestToken !== "string"
    || typeof input.implToken !== "string"
    || typeof input.testPath !== "string"
    || typeof input.productionPath !== "string"
    || !TOKEN_RE.test(input.requestToken)
    || !TOKEN_RE.test(input.implToken)
    || !input.requestToken.startsWith("REQ-")
    || !input.implToken.startsWith("IMPL-")
  ) {
    return error("INVALID_INPUT", "Mode B requires valid REQ/IMPL tokens and declared source paths.");
  }

  const manifestValue = manifestFor(input);
  if ("code" in manifestValue) return { ok: false, error: manifestValue };

  let realProjectRoot: string;
  try {
    realProjectRoot = await fs.realpath(manifestValue.projectRoot);
  } catch {
    return error("INVALID_MANIFEST", "Project root does not exist.", input.projectRoot);
  }
  const declared = await Promise.all([
    resolveDeclaredFile(realProjectRoot, input.testPath),
    resolveDeclaredFile(realProjectRoot, input.productionPath),
  ]);
  const testFile = declared[0];
  const productionFile = declared[1];
  if (!testFile.ok) return testFile;
  if (!productionFile.ok) return productionFile;

  const indexNames = ["requirements", "architecture-decisions", "implementation-decisions", "semantic-tokens"] as const;
  const indexReads = await Promise.all(indexNames.map(async (indexName) => {
    const relative = `${indexName}.yaml`;
    const fileResult = await resolveDeclaredFile(realProjectRoot, path.join("tied", relative));
    if (!fileResult.ok) return fileResult;
    const read = await readFileText(fileResult.filePath, path.join("tied", relative));
    return read.ok ? { ok: true as const, text: read.text } : read;
  }));
  for (const index of indexReads) {
    if (!index.ok) return index;
  }
  const requirementIndex = indexReads[0]!;
  const architectureIndex = indexReads[1]!;
  const implementationIndex = indexReads[2]!;
  const semanticTokensIndex = indexReads[3]!;
  if (
    !requirementIndex.ok
    || !architectureIndex.ok
    || !implementationIndex.ok
    || !semanticTokensIndex.ok
  ) {
    return error("READ_ERROR", "Unable to load the explicit TIED index set.");
  }

  const tiedBasePath = path.join(realProjectRoot, "tied");
  const requirementResult = await readYamlRecord(
    tiedBasePath,
    "requirements",
    input.requestToken,
    requirementIndex.text,
  );
  if (!requirementResult.ok) return requirementResult;
  const architectureToken = (
    isObject(requirementResult.detail.traceability)
      ? requirementResult.detail.traceability.architecture
      : undefined
  );
  const architectureTokens = Array.isArray(architectureToken)
    ? architectureToken.filter((token): token is string => typeof token === "string")
    : [];
  const selectedArchitectureToken = architectureTokens[0];
  if (!selectedArchitectureToken) {
    return error("MISSING_RECORD", `Requirement ${input.requestToken} has no architecture traceability.`);
  }
  const architectureResult = await readYamlRecord(
    tiedBasePath,
    "architecture-decisions",
    selectedArchitectureToken,
    architectureIndex.text,
  );
  if (!architectureResult.ok) return architectureResult;
  const implementationResult = await readYamlRecord(
    tiedBasePath,
    "implementation-decisions",
    input.implToken,
    implementationIndex.text,
  );
  if (!implementationResult.ok) return implementationResult;
  const pseudocode = await readPseudocode(
    tiedBasePath,
    input.implToken,
    implementationResult.detail,
  );
  if (!pseudocode.ok) return pseudocode;

  const testRead = await readFileText(testFile.filePath, input.testPath);
  if (!testRead.ok) return testRead;
  const productionRead = await readFileText(productionFile.filePath, input.productionPath);
  if (!productionRead.ok) return productionRead;

  let productionEvidence: unknown = input.productionEvidence;
  let productionEvidenceRevision: string | undefined;
  if (input.productionEvidencePath) {
    const evidenceFile = await resolveDeclaredFile(realProjectRoot, input.productionEvidencePath);
    if (!evidenceFile.ok) return evidenceFile;
    const evidenceRead = await readFileText(evidenceFile.filePath, input.productionEvidencePath);
    if (!evidenceRead.ok) return evidenceRead;
    try {
      productionEvidence = JSON.parse(evidenceRead.text) as unknown;
    } catch {
      return error("INVALID_JSON", `Invalid production evidence JSON: ${input.productionEvidencePath}`, input.productionEvidencePath);
    }
    productionEvidenceRevision = revision(evidenceRead.text);
  }

  return {
    ok: true,
    scope: {
      manifest: manifestValue,
      requestToken: input.requestToken,
      implToken: input.implToken,
      requirement: requirementResult.detail,
      architecture: architectureResult.detail,
      implementation: implementationResult.detail,
      implementationPseudocode: pseudocode.text,
      testSource: testRead.text,
      productionSource: productionRead.text,
      productionEvidence,
      revisions: {
        requirements: revision(requirementIndex.text),
        architecture: revision(architectureIndex.text),
        implementation: revision(implementationIndex.text),
        semanticTokens: revision(semanticTokensIndex.text),
        requirementDetail: revision(requirementResult.detailBytes),
        architectureDetail: revision(architectureResult.detailBytes),
        implementationDetail: revision(implementationResult.detailBytes),
        implementationPseudocode: revision(pseudocode.bytes),
        test: revision(testRead.text),
        production: revision(productionRead.text),
        productionEvidence: productionEvidenceRevision,
      },
    },
  };
}
