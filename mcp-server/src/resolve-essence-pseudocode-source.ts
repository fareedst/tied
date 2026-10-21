/**
 * [IMPL-PSEUDOCODE_VALIDATE_PATH_INPUT] [ARCH-PSEUDOCODE_INPUT_RESOLUTION] [REQ-PSEUDOCODE_VALIDATE_PATH_INPUT]
 * Read-only essence pseudocode source resolution under TIED_BASE_PATH.
 */
import { readTextFromPseudocodePath, resolvePseudocodePathUnderTiedBase } from "./impl-pseudocode-input.js";

const IMPL_TOKEN_PATTERN = /^IMPL-[A-Z0-9_-]+$/;

export type EssencePseudocodeResolveArgs = {
  token: string;
  pseudocode?: string;
  essence_pseudocode_path?: string;
  pseudocode_path?: string;
};

export type EssencePseudocodeSourceKind = "inline" | "path" | "default_sidecar";

export type EssencePseudocodeResolveSuccess = {
  ok: true;
  content: string;
  sourceKind: EssencePseudocodeSourceKind;
};

export type EssencePseudocodeResolveFailure = {
  ok: false;
  error: string;
};

export type EssencePseudocodeResolveResult =
  | EssencePseudocodeResolveSuccess
  | EssencePseudocodeResolveFailure;

function mapPathResolutionError(message: string): string {
  if (message.includes("TIED_BASE_PATH")) {
    return "PATH_NOT_UNDER_TIED_BASE";
  }
  return message;
}

function readFromRelativePath(
  userPath: string,
  basePath: string,
  sourceKind: EssencePseudocodeSourceKind,
): EssencePseudocodeResolveResult {
  const resolved = resolvePseudocodePathUnderTiedBase(userPath, basePath);
  if (!resolved.ok) {
    return { ok: false, error: mapPathResolutionError(resolved.error) };
  }
  const read = readTextFromPseudocodePath(resolved.absolutePath);
  if (!read.ok) {
    return { ok: false, error: read.error };
  }
  return { ok: true, content: read.content, sourceKind };
}

/**
 * Resolve pseudocode text from inline body, explicit path (or validate-only alias), or IMPL default sidecar.
 */
export function resolveEssencePseudocodeSource(
  basePath: string,
  args: EssencePseudocodeResolveArgs,
): EssencePseudocodeResolveResult {
  const hasEssencePath =
    typeof args.essence_pseudocode_path === "string" && args.essence_pseudocode_path.trim().length > 0;
  const hasPseudocodePath =
    typeof args.pseudocode_path === "string" && args.pseudocode_path.trim().length > 0;

  if (hasEssencePath && hasPseudocodePath) {
    return { ok: false, error: "AMBIGUOUS_INPUT" };
  }

  const trimmedInline = typeof args.pseudocode === "string" ? args.pseudocode.trim() : "";
  const hasInline = trimmedInline.length > 0;
  const hasAnyPath = hasEssencePath || hasPseudocodePath;

  if (hasInline && hasAnyPath) {
    return { ok: false, error: "AMBIGUOUS_INPUT" };
  }

  if (hasInline) {
    return { ok: true, content: trimmedInline, sourceKind: "inline" };
  }

  const pathUser = hasEssencePath
    ? args.essence_pseudocode_path!.trim()
    : hasPseudocodePath
      ? args.pseudocode_path!.trim()
      : "";

  if (pathUser.length > 0) {
    return readFromRelativePath(pathUser, basePath, "path");
  }

  if (IMPL_TOKEN_PATTERN.test(args.token)) {
    const defaultRel = `implementation-decisions/${args.token}-pseudocode.md`;
    return readFromRelativePath(defaultRel, basePath, "default_sidecar");
  }

  return { ok: false, error: "MISSING_INPUT" };
}
