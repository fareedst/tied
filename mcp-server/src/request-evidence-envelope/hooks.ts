/**
 * [IMPL-REQUEST_EVIDENCE_ENVELOPE] [ARCH-REQUEST_EVIDENCE_ENVELOPE] [REQ-REQUEST_EVIDENCE_ENVELOPE]
 * Fail-safe producer hooks gated by TIED_ENVELOPE_HOOKS=1 (RISK-001).
 */

import { promises as fs } from "node:fs";
import path from "node:path";

import { getBasePath } from "../yaml-loader.js";
import { contentHashHex, patchRequestEvidenceEnvelope } from "./patch.js";
import type {
  ArtifactKind,
  EnvelopeRun,
  GatePhase,
  PatchArtifactEntry,
  PatchRequestEvidenceEnvelopeInput,
} from "./types.js";

export function isEnvelopeHooksEnabled(): boolean {
  return process.env.TIED_ENVELOPE_HOOKS === "1";
}

function relPath(projectRoot: string, absolute: string): string {
  return path.relative(projectRoot, absolute).split(path.sep).join("/");
}

export async function hashFileAt(absolutePath: string): Promise<string> {
  const contents = await fs.readFile(absolutePath, "utf8");
  return contentHashHex(contents);
}

export async function hashStringContents(contents: string): Promise<string> {
  return contentHashHex(contents);
}

export type TryPatchEnvelopeInput = Omit<
  PatchRequestEvidenceEnvelopeInput,
  "tied_base_path" | "confirmed_tied_base_path"
> & {
  tied_base_path?: string;
  confirmed_tied_base_path?: string;
};

/** Inner artifact write must succeed even if envelope patch fails (RISK-001). */
export async function tryPatchRequestEvidenceEnvelope(input: TryPatchEnvelopeInput): Promise<void> {
  if (!isEnvelopeHooksEnabled()) return;
  const tiedBasePath = input.tied_base_path ?? getBasePath();
  const confirmed = input.confirmed_tied_base_path ?? tiedBasePath;
  try {
    const result = await patchRequestEvidenceEnvelope({
      ...input,
      tied_base_path: tiedBasePath,
      confirmed_tied_base_path: confirmed,
    });
    if (!result.ok) {
      const codes = result.gaps.map((gap) => gap.code).join(", ") || result.error || "unknown";
      console.warn(`DIAGNOSTIC: envelope patch failed for ${input.artifact.path}: ${codes}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`DIAGNOSTIC: envelope patch threw for ${input.artifact.path}: ${message}`);
  }
}

export async function tryPatchArtifactFile(input: {
  request_token: string;
  project_root: string;
  absolute_path: string;
  kind: ArtifactKind;
  phase?: GatePhase | null;
  schema_version?: string | null;
  proof_boundaries?: string[];
  run?: EnvelopeRun;
  status?: PatchArtifactEntry["status"];
}): Promise<void> {
  if (!isEnvelopeHooksEnabled()) return;
  const projectRoot = path.resolve(input.project_root);
  const artifactPath = relPath(projectRoot, input.absolute_path);
  try {
    const content_hash = await hashFileAt(input.absolute_path);
    await tryPatchRequestEvidenceEnvelope({
      request_token: input.request_token,
      project_root: projectRoot,
      artifact: {
        kind: input.kind,
        path: artifactPath,
        content_hash,
        phase: input.phase ?? null,
        schema_version: input.schema_version ?? null,
        proof_boundaries: input.proof_boundaries,
        status: input.status,
      },
      run: input.run,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`DIAGNOSTIC: envelope patch threw for ${artifactPath}: ${message}`);
  }
}

export function requestTokenFromCitdpFilename(filename: string): string | null {
  const base = path.basename(filename);
  const match = /^CITDP-(REQ-[A-Z0-9][A-Z0-9_-]*)\.yaml$/u.exec(base);
  return match?.[1] ?? null;
}

export function projectRootFromTiedBase(tiedBasePath?: string): string {
  const base = tiedBasePath ?? getBasePath();
  return path.resolve(base, "..");
}
