/**
 * [REQ-TIED_RUNTIME_DISK_CONFIG] SC-RDC-FIXTURE-PARITY — types for agentstream tsc imports.
 */

export interface TiedRuntimeFixtureManifestCase {
  id: string;
  runtimes: string[];
  layout: "monolithic" | "linked";
  mcpStoreRootEnv?: boolean;
  includeBundle?: boolean;
  shellEnv?: Record<string, string>;
}

export interface MaterializedTiedRuntimeFixture {
  workspaceRoot: string;
  storeRoot: string;
  processEnv: Record<string, string>;
  cleanup: () => void;
}

export function loadTiedRuntimeFixtureManifest(): {
  schema_version: string;
  cases: TiedRuntimeFixtureManifestCase[];
};

export function getTiedRuntimeFixtureCase(caseId: string): TiedRuntimeFixtureManifestCase;

export function materializeTiedRuntimeFixture(
  spec: TiedRuntimeFixtureManifestCase,
): MaterializedTiedRuntimeFixture;

export function materializeTiedRuntimeFixtureById(caseId: string): MaterializedTiedRuntimeFixture;

export function normalizeResolveSnapshot(
  cfg: Record<string, unknown> | null | undefined,
): Record<string, string> | null;

export function listSharedParityFixtureCases(): TiedRuntimeFixtureManifestCase[];

export function resolveTiedRuntimeFixtureCatalogRoot(): string;

export function resolveStoreRepoRootFromLoader(): string;
