import path from "node:path";

export interface ProjectManifestInput {
  projectRoot: string;
  tiedBasePath: string;
  version: string;
  languages: string[];
  testClassifiers: string[];
  ignoreRules: string[];
}

export interface ProjectManifest {
  projectRoot: string;
  tiedBasePath: string;
  version: string;
  languages: string[];
  testClassifiers: string[];
  ignoreRules: string[];
}

export type ProjectManifestResult =
  | { ok: true; manifest: ProjectManifest }
  | { ok: false; error: "InvalidManifest" | "WrongTiedBasePath" };

// [IMPL-TIED_FIDELITY_RESEARCH] [ARCH-TIED_FIDELITY_RESEARCH] [REQ-TIED_FIDELITY_RESEARCH]
// Resolves one project boundary and prevents cross-project TIED access.
export function resolveProjectManifest(
  input: ProjectManifestInput,
): ProjectManifestResult {
  if (
    !path.isAbsolute(input.projectRoot) ||
    !path.isAbsolute(input.tiedBasePath) ||
    input.version.length === 0 ||
    input.languages.length === 0 ||
    input.testClassifiers.length === 0 ||
    input.languages.some((language) => language.length === 0) ||
    input.testClassifiers.some((classifier) => classifier.length === 0)
  ) {
    return { ok: false, error: "InvalidManifest" };
  }

  const projectRoot = path.resolve(input.projectRoot);
  const tiedBasePath = path.resolve(input.tiedBasePath);
  const expectedTiedBasePath = path.join(projectRoot, "tied");

  if (tiedBasePath !== expectedTiedBasePath) {
    return { ok: false, error: "WrongTiedBasePath" };
  }

  return {
    ok: true,
    manifest: {
      projectRoot,
      tiedBasePath,
      version: input.version,
      languages: [...input.languages],
      testClassifiers: [...input.testClassifiers],
      ignoreRules: [...input.ignoreRules],
    },
  };
}
