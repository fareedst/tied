/**
 * [REQ-PSEUDOCODE_MIGRATION_TOOLING] Migration waiver registry load and expiry checks.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { REPO_ROOT } from "./constants.ts";
import { yaml } from "./yaml-io.ts";

export type WaiverScope = {
  kind: "client" | "sidecar_list" | "procedure_ids";
  client_id?: string;
  repository_root?: string;
  sidecar_paths?: string[];
  procedure_ids?: string[];
  outcome_classes?: string[];
};

export type MigrationWaiver = {
  schema_version: number;
  waiver_id: string;
  owner: string;
  reason: string;
  issued_at: string;
  expires_at: string;
  scope: WaiverScope;
  status: "active" | "expired" | "superseded" | "revoked";
  remediation_req?: string;
  renewal_of?: string;
  stdd_audit_note?: string;
};

export type MigrationWaiverRegistry = {
  schema_version: number;
  registry_id: string;
  updated_at: string;
  waivers: MigrationWaiver[];
  notes?: string;
  $schema?: string;
};

const DEFAULT_REGISTRY_PATH = join(
  REPO_ROOT,
  "working/fleet-constraint-v2/migration-waiver-registry.v1.yaml",
);

export async function loadWaiverRegistry(
  path = DEFAULT_REGISTRY_PATH,
): Promise<MigrationWaiverRegistry> {
  const raw = await readFile(path, "utf8");
  const doc = yaml.load(raw) as MigrationWaiverRegistry;
  if (doc.schema_version !== 1) {
    throw new Error(`DIAGNOSTIC: unsupported waiver registry schema_version ${doc.schema_version}`);
  }
  if (!Array.isArray(doc.waivers)) {
    throw new Error("DIAGNOSTIC: waivers must be an array");
  }
  return doc;
}

export function listActiveWaivers(
  registry: MigrationWaiverRegistry,
  asOf: Date = new Date(),
): MigrationWaiver[] {
  return registry.waivers.filter((w) => isWaiverActive(w, asOf));
}

function isWaiverActive(waiver: MigrationWaiver, asOf: Date): boolean {
  if (waiver.status !== "active") return false;
  const expires = Date.parse(waiver.expires_at);
  if (Number.isNaN(expires)) return false;
  return expires >= asOf.getTime();
}

/** Waivers that block wave close-out (expired active rows or status expired). */
export function findExpiredWaivers(
  registry: MigrationWaiverRegistry,
  asOf: Date = new Date(),
): MigrationWaiver[] {
  if (registry.waivers.length === 0) return [];
  const blocking: MigrationWaiver[] = [];
  for (const waiver of registry.waivers) {
    if (waiver.status === "expired") {
      blocking.push(waiver);
      continue;
    }
    if (waiver.status !== "active") continue;
    const expires = Date.parse(waiver.expires_at);
    if (!Number.isNaN(expires) && expires < asOf.getTime()) {
      blocking.push(waiver);
    }
  }
  return blocking;
}

export function assertNoBlockingWaivers(
  registry: MigrationWaiverRegistry,
  asOf: Date = new Date(),
): { ok: true } | { ok: false; expired_waiver_ids: string[] } {
  const expired = findExpiredWaivers(registry, asOf);
  if (expired.length === 0) return { ok: true };
  return { ok: false, expired_waiver_ids: expired.map((w) => w.waiver_id) };
}

export { DEFAULT_REGISTRY_PATH };
