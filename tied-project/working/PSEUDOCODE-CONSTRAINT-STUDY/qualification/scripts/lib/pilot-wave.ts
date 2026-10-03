/**
 * [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] Load stdd pilot wave sidecar list.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { REPO_ROOT } from "./constants.ts";

export type WaveSidecar = {
  impl_token: string;
  sidecar_path: string;
};

export type WaveManifest = {
  schema_version: number;
  client_id: string;
  methodology_pin: string;
  wave_id: string;
  sidecars: WaveSidecar[];
};

function parseWaveSidecarBlock(lines: string[]): WaveSidecar[] {
  const sidecars: WaveSidecar[] = [];
  let impl_token = "";
  let sidecar_path = "";
  for (const line of lines) {
    const tokenMatch = line.match(/^\s+-\s+impl_token:\s+"?([^"\n#]+)"?\s*$/);
    if (tokenMatch) {
      if (impl_token && sidecar_path) {
        sidecars.push({ impl_token, sidecar_path });
      }
      impl_token = tokenMatch[1].trim();
      sidecar_path = "";
      continue;
    }
    const pathMatch = line.match(/^\s+sidecar_path:\s+"?([^"\n#]+)"?\s*$/);
    if (pathMatch && impl_token) {
      sidecar_path = pathMatch[1].trim();
    }
  }
  if (impl_token && sidecar_path) {
    sidecars.push({ impl_token, sidecar_path });
  }
  return sidecars;
}

function parseWaveScalar(lines: string[], key: string): string | undefined {
  const re = new RegExp(`^${key}:\\s*"?([^"#\\n]+)"?`);
  for (const line of lines) {
    const m = line.match(re);
    if (m) return m[1].trim().replace(/^"|"$/g, "");
  }
  return undefined;
}

/** Repo-relative path to wave sidecar list YAML (generalized beyond stdd wave 1). */
export async function readWaveSidecarList(relativePath: string): Promise<WaveManifest> {
  const abs = relativePath.startsWith("/")
    ? relativePath
    : join(REPO_ROOT, relativePath);
  const raw = await readFile(abs, "utf8");
  const lines = raw.split("\n");
  const sidecars = parseWaveSidecarBlock(lines);
  const schemaRaw = parseWaveScalar(lines, "schema_version");
  return {
    schema_version: schemaRaw ? Number(schemaRaw) : 1,
    client_id: parseWaveScalar(lines, "client_id") ?? "unknown",
    methodology_pin: parseWaveScalar(lines, "methodology_pin") ?? "48d1fbb+",
    wave_id: parseWaveScalar(lines, "wave_id") ?? "unknown-wave",
    sidecars,
  };
}

export async function readStddWave1(): Promise<WaveManifest> {
  return readWaveSidecarList(
    "working/fleet-constraint-v2/pilots/stdd/wave-1-sidecars.yaml",
  );
}

export function waveEntryToManifestEntry(row: WaveSidecar): {
  id: string;
  token: string;
  sidecar_path: string;
  client_id: string;
  tier: string;
} {
  return fleetWaveEntryToManifestEntry(row, "stdd", "pilot-wave-1");
}

/** stdd lists use repo-relative paths; external fleet waves use absolute client paths. */
export function resolveSidecarAbsPath(sidecarPath: string): string {
  const normalized = sidecarPath.trim().replace(/^"|"$/g, "");
  if (normalized.startsWith("/")) {
    return normalized;
  }
  return join(REPO_ROOT, normalized);
}

export function fleetWaveEntryToManifestEntry(
  row: WaveSidecar,
  clientId: string,
  waveId: string,
): {
  id: string;
  token: string;
  sidecar_path: string;
  client_id: string;
  tier: string;
} {
  const abs = resolveSidecarAbsPath(row.sidecar_path);
  return {
    id: `fleet-${clientId}-${waveId}-${row.impl_token}`,
    token: row.impl_token,
    sidecar_path: abs,
    client_id: clientId,
    tier: waveId,
  };
}
