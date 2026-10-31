/**
 * Isolate TIED client path env for unit tests run inside a marker_only repo cwd.
 * [REQ-TIED_PROJECT_IDENTITY_MARKER_ROUTING] [REQ-TIED_CLIENT_PATH_ENV_MIGRATION]
 */
import fs from "node:fs";
import path from "node:path";
import {
  ENV_CLIENT_BUNDLE_PATH,
  ENV_CLIENT_PROJECT_PATH,
  LEGACY_ENV_CLIENT_BUNDLE_PATH,
  LEGACY_ENV_CLIENT_PROJECT_PATH,
} from "../tied-path-env.js";

export const CLIENT_PATH_ENV_KEYS = [
  ENV_CLIENT_PROJECT_PATH,
  ENV_CLIENT_BUNDLE_PATH,
  LEGACY_ENV_CLIENT_PROJECT_PATH,
  LEGACY_ENV_CLIENT_BUNDLE_PATH,
] as const;

export function snapshotClientPathEnv(): Record<string, string | undefined> {
  const saved: Record<string, string | undefined> = {};
  for (const k of CLIENT_PATH_ENV_KEYS) saved[k] = process.env[k];
  return saved;
}

export function restoreClientPathEnv(saved: Record<string, string | undefined>): void {
  for (const k of CLIENT_PATH_ENV_KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
}

/** Minimal index so env TIED_BASE_PATH wins over marker_only cwd discovery. */
export function writeMinimalProjectCorpus(tiedDir: string): void {
  fs.mkdirSync(tiedDir, { recursive: true });
  const req = path.join(tiedDir, "requirements.yaml");
  if (!fs.existsSync(req)) fs.writeFileSync(req, "{}\n", "utf8");
}

/** Legacy TIED_BASE_PATH only — clears IDE-injected canonical path overrides. */
export function useLegacyProjectPathOnly(tiedDir: string): void {
  delete process.env[ENV_CLIENT_PROJECT_PATH];
  delete process.env[ENV_CLIENT_BUNDLE_PATH];
  delete process.env[LEGACY_ENV_CLIENT_BUNDLE_PATH];
  process.env[LEGACY_ENV_CLIENT_PROJECT_PATH] = tiedDir;
}

/** Point writable corpus at tiedDir with a valid requirements index for Path 3 env gate. */
export function bindWritableProjectCorpus(tiedDir: string): void {
  writeMinimalProjectCorpus(tiedDir);
  useLegacyProjectPathOnly(tiedDir);
}
