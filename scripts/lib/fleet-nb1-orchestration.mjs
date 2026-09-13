/**
 * [IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION] [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE]
 * [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION]
 * How: Pure orchestration for RECORD_OD_P5_2_ACCEPTANCE and SELECT_NB1_WAVE_ONE_CLIENTS.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadInventoryClientsFromManifest } from "./fleet-g4-ci-checks.mjs";

export { loadInventoryClientsFromManifest };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(__dirname, "..", "..");

export const DEFAULT_ACCEPTANCE_PATH = path.join(
  REPO_ROOT,
  "working/fleet-constraint-v2/od-p5-2-acceptance.v1.json",
);
export const DEFAULT_ACCEPTANCE_SCHEMA_PATH = path.join(
  REPO_ROOT,
  "working/fleet-constraint-v2/od-p5-2-acceptance.v1.schema.json",
);
export const DEFAULT_INVENTORY_MANIFEST_PATH = path.join(
  REPO_ROOT,
  "working/fleet-constraint-v2/client-inventory-manifest.v1.yaml",
);

export const NB1_FAILURE_MODES = {
  invalid_acceptance: "invalid_acceptance",
  orchestrator_reverify_true: "orchestrator_reverify_true",
  tranche_over_cap: "tranche_over_cap",
  status_not_accepted: "status_not_accepted",
  acceptance_missing: "acceptance_missing",
  enrollment_mismatch: "enrollment_mismatch",
  client_not_in_manifest: "client_not_in_manifest",
  methodology_pin_mismatch: "methodology_pin_mismatch",
};

const DEFAULT_EXCLUDED_CLIENT_IDS = ["tied-win-diff"];

/**
 * @param {Record<string, number> | undefined} counts
 */
export function totalActiveSidecars(counts) {
  if (!counts || typeof counts !== "object") return 0;
  return Object.values(counts).reduce((sum, n) => sum + (Number(n) || 0), 0);
}

/**
 * @param {unknown} acceptance
 * @param {{ requireAccepted?: boolean; validateSchema?: boolean; schemaPath?: string; repoRoot?: string }} [options]
 */
export function recordOdP52Acceptance(acceptance, options = {}) {
  const {
    requireAccepted = true,
    validateSchema = false,
    schemaPath = DEFAULT_ACCEPTANCE_SCHEMA_PATH,
    repoRoot = REPO_ROOT,
  } = options;
  const violations = [];

  if (!acceptance || typeof acceptance !== "object") {
    return {
      ok: false,
      error: NB1_FAILURE_MODES.invalid_acceptance,
      violations: ["acceptance must be an object"],
    };
  }

  /** @type {Record<string, unknown>} */
  const doc = /** @type {Record<string, unknown>} */ (acceptance);

  if (doc.orchestrator_reverify !== false) {
    return {
      ok: false,
      error: NB1_FAILURE_MODES.orchestrator_reverify_true,
      violations: ["orchestrator_reverify must be false"],
    };
  }

  const waveIds = doc.wave_1_client_ids;
  const tranche = /** @type {{ max_clients?: number } | undefined} */ (doc.tranche_scope);
  const maxClients = tranche?.max_clients;
  if (!Array.isArray(waveIds) || typeof maxClients !== "number") {
    violations.push("wave_1_client_ids and tranche_scope.max_clients required");
  } else if (waveIds.length > maxClients) {
    return {
      ok: false,
      error: NB1_FAILURE_MODES.tranche_over_cap,
      violations: [`wave_1_client_ids length ${waveIds.length} exceeds max_clients ${maxClients}`],
    };
  }

  if (requireAccepted) {
    if (doc.status !== "accepted") {
      return {
        ok: false,
        error: NB1_FAILURE_MODES.status_not_accepted,
        violations: [`status must be accepted (got ${String(doc.status)})`],
      };
    }
    if (typeof doc.decided_at !== "string" || !doc.decided_at.trim()) {
      violations.push("decided_at required when status is accepted");
    }
    const signoff = /** @type {{ name?: string; rationale?: string } | undefined} */ (doc.sponsor_signoff);
    if (!signoff?.name?.trim() || !signoff?.rationale?.trim()) {
      violations.push("sponsor_signoff.name and sponsor_signoff.rationale required when accepted");
    }
  }

  if (validateSchema) {
    const schemaRel = path.isAbsolute(schemaPath)
      ? path.relative(repoRoot, schemaPath)
      : schemaPath;
    const dataRel = path.join(
      repoRoot,
      "working/fleet-constraint-v2/.nb1-acceptance-validate-tmp.json",
    );
    fs.writeFileSync(dataRel, JSON.stringify(doc, null, 2));
    try {
      const result = spawnSync(
        "npx",
        ["--yes", "ajv-cli", "validate", "-s", schemaRel, "-d", dataRel, "--spec=draft2020"],
        { cwd: repoRoot, encoding: "utf8", maxBuffer: 4 * 1024 * 1024 },
      );
      if (result.status !== 0) {
        violations.push(result.stdout || result.stderr || "ajv schema validation failed");
      }
    } finally {
      try {
        fs.unlinkSync(dataRel);
      } catch {
        /* ignore */
      }
    }
  }

  if (violations.length > 0) {
    return {
      ok: false,
      error: NB1_FAILURE_MODES.invalid_acceptance,
      violations,
    };
  }

  return {
    ok: true,
    acceptance_id: String(doc.acceptance_id ?? ""),
    wave_1_client_ids: /** @type {string[]} */ (waveIds),
  };
}

/**
 * @param {{ acceptancePath?: string; acceptanceSchemaPath?: string; requireAccepted?: boolean; validateSchema?: boolean }} [options]
 */
export function recordOdP52AcceptanceFromFile(options = {}) {
  const acceptancePath = options.acceptancePath ?? DEFAULT_ACCEPTANCE_PATH;
  if (!fs.existsSync(acceptancePath)) {
    return {
      ok: false,
      error: NB1_FAILURE_MODES.acceptance_missing,
      violations: [`acceptance file missing: ${acceptancePath}`],
    };
  }
  const raw = fs.readFileSync(acceptancePath, "utf8");
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    return {
      ok: false,
      error: NB1_FAILURE_MODES.invalid_acceptance,
      violations: [`invalid JSON: ${/** @type {Error} */ (err).message}`],
    };
  }
  return recordOdP52Acceptance(parsed, {
    requireAccepted: options.requireAccepted ?? true,
    validateSchema: options.validateSchema ?? false,
    schemaPath: options.acceptanceSchemaPath ?? DEFAULT_ACCEPTANCE_SCHEMA_PATH,
  });
}

/**
 * @param {unknown[]} clients
 * @param {{ maxClients?: number; overrideClientIds?: string[]; excludeClientIds?: string[]; methodologyPin?: string }} [options]
 */
export function selectNb1WaveOneClients(clients, options = {}) {
  const maxClients = options.maxClients ?? 5;
  const exclude = new Set(options.excludeClientIds ?? DEFAULT_EXCLUDED_CLIENT_IDS);
  const methodologyPin = options.methodologyPin;

  if (!Array.isArray(clients)) {
    return {
      ok: false,
      error: NB1_FAILURE_MODES.invalid_acceptance,
      violations: ["clients must be an array"],
    };
  }

  /** @type {Map<string, Record<string, unknown>>} */
  const byId = new Map(
    clients.map((row) => [String(/** @type {Record<string, unknown>} */ (row).client_id), /** @type {Record<string, unknown>} */ (row)]),
  );

  const override = options.overrideClientIds;
  if (override?.length) {
    for (const clientId of override) {
      const row = byId.get(clientId);
      if (!row) {
        return {
          ok: false,
          error: NB1_FAILURE_MODES.client_not_in_manifest,
          client_id: clientId,
        };
      }
      if (row.phase_4_enrollment !== "not_enrolled_phase_4") {
        return {
          ok: false,
          error: NB1_FAILURE_MODES.enrollment_mismatch,
          client_id: clientId,
        };
      }
      if (row.aggregate_migration_state !== "header-only-v2") {
        return {
          ok: false,
          error: NB1_FAILURE_MODES.enrollment_mismatch,
          client_id: clientId,
          detail: "aggregate_migration_state must be header-only-v2",
        };
      }
      if (methodologyPin && row.methodology_pin !== methodologyPin) {
        return {
          ok: false,
          error: NB1_FAILURE_MODES.methodology_pin_mismatch,
          client_id: clientId,
        };
      }
    }
    return { ok: true, client_ids: [...override] };
  }

  const candidates = clients
    .filter((row) => /** @type {Record<string, unknown>} */ (row).phase_4_enrollment === "not_enrolled_phase_4")
    .filter((row) => /** @type {Record<string, unknown>} */ (row).aggregate_migration_state === "header-only-v2")
    .filter((row) => !exclude.has(String(/** @type {Record<string, unknown>} */ (row).client_id)))
    .filter(
      (row) =>
        totalActiveSidecars(
          /** @type {Record<string, number>} */ (
            /** @type {Record<string, unknown>} */ (row).sidecar_counts_by_state
          ),
        ) <= 1,
    )
    .sort((a, b) => {
      const ta = totalActiveSidecars(
        /** @type {Record<string, number>} */ (
          /** @type {Record<string, unknown>} */ (a).sidecar_counts_by_state
        ),
      );
      const tb = totalActiveSidecars(
        /** @type {Record<string, number>} */ (
          /** @type {Record<string, unknown>} */ (b).sidecar_counts_by_state
        ),
      );
      if (ta !== tb) return ta - tb;
      return String(/** @type {Record<string, unknown>} */ (a).client_id).localeCompare(
        String(/** @type {Record<string, unknown>} */ (b).client_id),
      );
    });

  const selected = candidates.slice(0, maxClients).map((row) => String(/** @type {Record<string, unknown>} */ (row).client_id));
  return { ok: true, client_ids: selected };
}

/**
 * NB-1-A gate: signed acceptance JSON on disk (plan §2.7 item 1).
 * @param {{ acceptancePath?: string; validateSchema?: boolean }} [options]
 */
export function evaluateNb1AcceptanceGate(options = {}) {
  const acceptancePath = options.acceptancePath ?? DEFAULT_ACCEPTANCE_PATH;
  const report = recordOdP52AcceptanceFromFile({
    acceptancePath,
    requireAccepted: true,
    validateSchema: options.validateSchema ?? false,
  });
  return {
    gate_id: "NB-1-A",
    acceptance_path: acceptancePath,
    allowed: report.ok,
    report,
    sponsor_unblock:
      "Copy working/fleet-constraint-v2/od-p5-2-acceptance.v1.template.json to od-p5-2-acceptance.v1.json; set status accepted, decided_at (ISO-8601), and sponsor_signoff name/rationale.",
  };
}

/**
 * @param {{ manifestPath?: string; acceptancePath?: string }} [options]
 */
export function buildNb1OrchestrationSnapshot(options = {}) {
  const manifestPath = options.manifestPath ?? DEFAULT_INVENTORY_MANIFEST_PATH;
  const acceptanceGate = evaluateNb1AcceptanceGate({
    acceptancePath: options.acceptancePath,
    validateSchema: false,
  });
  const clients = loadInventoryClientsFromManifest(manifestPath);
  let selection = selectNb1WaveOneClients(clients, { maxClients: 5 });
  if (acceptanceGate.allowed && acceptanceGate.report.ok) {
    const acceptanceDoc = JSON.parse(
      fs.readFileSync(options.acceptancePath ?? DEFAULT_ACCEPTANCE_PATH, "utf8"),
    );
    selection = selectNb1WaveOneClients(clients, {
      maxClients: acceptanceDoc.tranche_scope?.max_clients ?? 5,
      overrideClientIds: acceptanceGate.report.wave_1_client_ids,
      methodologyPin: acceptanceDoc.methodology_pin,
    });
  }
  return {
    schema_version: "fleet-nb1-orchestration.v1",
    acceptance_gate: acceptanceGate,
    wave_one_selection: selection,
    track_b_execution_blocked: !acceptanceGate.allowed,
  };
}

/** NB-2 Track B tranche one — [REQ-PSEUDOCODE_FLEET_NB2_TRANCHE_ONE] */
export const DEFAULT_NB2_ACCEPTANCE_PATH = path.join(
  REPO_ROOT,
  "working/fleet-constraint-v2/od-nb2-acceptance.v1.json",
);
export const DEFAULT_NB2_ACCEPTANCE_SCHEMA_PATH = path.join(
  REPO_ROOT,
  "working/fleet-constraint-v2/od-nb2-acceptance.v1.schema.json",
);
export const DEFAULT_NB1_CLOSE_OUT_RECEIPT_PATH = path.join(
  REPO_ROOT,
  "working/fleet-constraint-v2/NB-1/gates/machine-close-out-2026-09-13.json",
);

export const NB2_FAILURE_MODES = {
  ...NB1_FAILURE_MODES,
  already_migrated: "already_migrated",
  nb1_close_out_missing: "nb1_close_out_missing",
  prior_batch_mismatch: "prior_batch_mismatch",
};

/**
 * @param {unknown} acceptance
 * @param {{ requireAccepted?: boolean; validateSchema?: boolean; schemaPath?: string; repoRoot?: string; nb1CloseOutReceiptPath?: string; requireNb1Receipt?: boolean }} [options]
 */
export function recordNb2Acceptance(acceptance, options = {}) {
  const {
    requireAccepted = true,
    validateSchema = false,
    schemaPath = DEFAULT_NB2_ACCEPTANCE_SCHEMA_PATH,
    repoRoot = REPO_ROOT,
    nb1CloseOutReceiptPath = DEFAULT_NB1_CLOSE_OUT_RECEIPT_PATH,
    requireNb1Receipt = true,
  } = options;
  const violations = [];

  if (!acceptance || typeof acceptance !== "object") {
    return {
      ok: false,
      error: NB2_FAILURE_MODES.invalid_acceptance,
      violations: ["acceptance must be an object"],
    };
  }

  /** @type {Record<string, unknown>} */
  const doc = /** @type {Record<string, unknown>} */ (acceptance);

  if (doc.orchestrator_reverify !== false) {
    return {
      ok: false,
      error: NB2_FAILURE_MODES.orchestrator_reverify_true,
      violations: ["orchestrator_reverify must be false"],
    };
  }

  const prior = /** @type {{ batch_id?: string } | undefined} */ (doc.prior_batch_complete);
  if (prior?.batch_id !== "NB-1") {
    return {
      ok: false,
      error: NB2_FAILURE_MODES.prior_batch_mismatch,
      violations: [`prior_batch_complete.batch_id must be NB-1 (got ${String(prior?.batch_id)})`],
    };
  }

  const waveIds = doc.wave_2_client_ids;
  const tranche = /** @type {{ max_clients?: number } | undefined} */ (doc.tranche_scope);
  const maxClients = tranche?.max_clients;
  if (!Array.isArray(waveIds) || typeof maxClients !== "number") {
    violations.push("wave_2_client_ids and tranche_scope.max_clients required");
  } else if (waveIds.length > maxClients) {
    return {
      ok: false,
      error: NB2_FAILURE_MODES.tranche_over_cap,
      violations: [`wave_2_client_ids length ${waveIds.length} exceeds max_clients ${maxClients}`],
    };
  }

  if (requireAccepted) {
    if (doc.status !== "accepted") {
      return {
        ok: false,
        error: NB2_FAILURE_MODES.status_not_accepted,
        violations: [`status must be accepted (got ${String(doc.status)})`],
      };
    }
    if (typeof doc.decided_at !== "string" || !doc.decided_at.trim()) {
      violations.push("decided_at required when status is accepted");
    }
    const signoff = /** @type {{ name?: string; rationale?: string } | undefined} */ (doc.sponsor_signoff);
    if (!signoff?.name?.trim() || !signoff?.rationale?.trim()) {
      violations.push("sponsor_signoff.name and sponsor_signoff.rationale required when accepted");
    }
  }

  if (requireNb1Receipt && !fs.existsSync(nb1CloseOutReceiptPath)) {
    return {
      ok: false,
      error: NB2_FAILURE_MODES.nb1_close_out_missing,
      violations: [`NB-1 close-out receipt missing: ${nb1CloseOutReceiptPath}`],
    };
  }

  if (validateSchema) {
    const schemaRel = path.isAbsolute(schemaPath)
      ? path.relative(repoRoot, schemaPath)
      : schemaPath;
    const dataRel = path.join(
      repoRoot,
      "working/fleet-constraint-v2/.nb2-acceptance-validate-tmp.json",
    );
    fs.writeFileSync(dataRel, JSON.stringify(doc, null, 2));
    try {
      const result = spawnSync(
        "npx",
        ["--yes", "ajv-cli", "validate", "-s", schemaRel, "-d", dataRel, "--spec=draft2020"],
        { cwd: repoRoot, encoding: "utf8", maxBuffer: 4 * 1024 * 1024 },
      );
      if (result.status !== 0) {
        violations.push(result.stdout || result.stderr || "ajv schema validation failed");
      }
    } finally {
      try {
        fs.unlinkSync(dataRel);
      } catch {
        /* ignore */
      }
    }
  }

  if (violations.length > 0) {
    return {
      ok: false,
      error: NB2_FAILURE_MODES.invalid_acceptance,
      violations,
    };
  }

  return {
    ok: true,
    acceptance_id: String(doc.acceptance_id ?? ""),
    wave_2_client_ids: /** @type {string[]} */ (waveIds),
  };
}

/**
 * @param {{ acceptancePath?: string; acceptanceSchemaPath?: string; requireAccepted?: boolean; validateSchema?: boolean; nb1CloseOutReceiptPath?: string }} [options]
 */
export function recordNb2AcceptanceFromFile(options = {}) {
  const acceptancePath = options.acceptancePath ?? DEFAULT_NB2_ACCEPTANCE_PATH;
  if (!fs.existsSync(acceptancePath)) {
    return {
      ok: false,
      error: NB2_FAILURE_MODES.acceptance_missing,
      violations: [`acceptance file missing: ${acceptancePath}`],
    };
  }
  const raw = fs.readFileSync(acceptancePath, "utf8");
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    return {
      ok: false,
      error: NB2_FAILURE_MODES.invalid_acceptance,
      violations: [`invalid JSON: ${/** @type {Error} */ (err).message}`],
    };
  }
  return recordNb2Acceptance(parsed, {
    requireAccepted: options.requireAccepted ?? true,
    validateSchema: options.validateSchema ?? false,
    schemaPath: options.acceptanceSchemaPath ?? DEFAULT_NB2_ACCEPTANCE_SCHEMA_PATH,
    nb1CloseOutReceiptPath: options.nb1CloseOutReceiptPath,
  });
}

/**
 * @param {unknown[]} clients
 * @param {{ maxClients?: number; overrideClientIds?: string[]; excludeClientIds?: string[]; methodologyPin?: string }} [options]
 */
export function selectNb2WaveTwoClients(clients, options = {}) {
  const maxClients = options.maxClients ?? 5;
  const exclude = new Set(options.excludeClientIds ?? DEFAULT_EXCLUDED_CLIENT_IDS);
  const methodologyPin = options.methodologyPin;

  if (!Array.isArray(clients)) {
    return {
      ok: false,
      error: NB2_FAILURE_MODES.invalid_acceptance,
      violations: ["clients must be an array"],
    };
  }

  /** @type {Map<string, Record<string, unknown>>} */
  const byId = new Map(
    clients.map((row) => [
      String(/** @type {Record<string, unknown>} */ (row).client_id),
      /** @type {Record<string, unknown>} */ (row),
    ]),
  );

  const override = options.overrideClientIds;
  if (override?.length) {
    for (const clientId of override) {
      const row = byId.get(clientId);
      if (!row) {
        return {
          ok: false,
          error: NB2_FAILURE_MODES.client_not_in_manifest,
          client_id: clientId,
        };
      }
      if (row.phase_4_enrollment !== "not_enrolled_phase_4") {
        return {
          ok: false,
          error: NB2_FAILURE_MODES.enrollment_mismatch,
          client_id: clientId,
        };
      }
      if (row.aggregate_migration_state !== "header-only-v2") {
        return {
          ok: false,
          error: NB2_FAILURE_MODES.already_migrated,
          client_id: clientId,
          detail: "aggregate_migration_state must be header-only-v2",
        };
      }
      if (methodologyPin && row.methodology_pin !== methodologyPin) {
        return {
          ok: false,
          error: NB2_FAILURE_MODES.methodology_pin_mismatch,
          client_id: clientId,
        };
      }
    }
    return { ok: true, client_ids: [...override] };
  }

  const candidates = clients
    .filter((row) => /** @type {Record<string, unknown>} */ (row).phase_4_enrollment === "not_enrolled_phase_4")
    .filter((row) => /** @type {Record<string, unknown>} */ (row).aggregate_migration_state === "header-only-v2")
    .filter((row) => !exclude.has(String(/** @type {Record<string, unknown>} */ (row).client_id)))
    .sort((a, b) => {
      const ta = totalActiveSidecars(
        /** @type {Record<string, number>} */ (
          /** @type {Record<string, unknown>} */ (a).sidecar_counts_by_state
        ),
      );
      const tb = totalActiveSidecars(
        /** @type {Record<string, number>} */ (
          /** @type {Record<string, unknown>} */ (b).sidecar_counts_by_state
        ),
      );
      if (ta !== tb) return ta - tb;
      return String(/** @type {Record<string, unknown>} */ (a).client_id).localeCompare(
        String(/** @type {Record<string, unknown>} */ (b).client_id),
      );
    });

  const selected = candidates.slice(0, maxClients).map((row) => String(/** @type {Record<string, unknown>} */ (row).client_id));
  return { ok: true, client_ids: selected };
}

/**
 * NB-2-A gate: signed od-nb2 acceptance on disk (plan §2.7).
 * @param {{ acceptancePath?: string; validateSchema?: boolean; nb1CloseOutReceiptPath?: string }} [options]
 */
export function evaluateNb2AcceptanceGate(options = {}) {
  const acceptancePath = options.acceptancePath ?? DEFAULT_NB2_ACCEPTANCE_PATH;
  const report = recordNb2AcceptanceFromFile({
    acceptancePath,
    requireAccepted: true,
    validateSchema: options.validateSchema ?? false,
    nb1CloseOutReceiptPath: options.nb1CloseOutReceiptPath,
  });
  return {
    gate_id: "NB-2-A",
    acceptance_path: acceptancePath,
    allowed: report.ok,
    report,
    sponsor_unblock:
      "Copy working/fleet-constraint-v2/od-nb2-acceptance.v1.template.json to od-nb2-acceptance.v1.json; set status accepted, decided_at (ISO-8601), and sponsor_signoff name/rationale.",
  };
}

/**
 * @param {{ manifestPath?: string; acceptancePath?: string }} [options]
 */
export function buildNb2OrchestrationSnapshot(options = {}) {
  const manifestPath = options.manifestPath ?? DEFAULT_INVENTORY_MANIFEST_PATH;
  const acceptanceGate = evaluateNb2AcceptanceGate({
    acceptancePath: options.acceptancePath,
    validateSchema: false,
  });
  const clients = loadInventoryClientsFromManifest(manifestPath);
  let selection = selectNb2WaveTwoClients(clients, { maxClients: 5 });
  if (acceptanceGate.allowed && acceptanceGate.report.ok) {
    const acceptanceDoc = JSON.parse(
      fs.readFileSync(options.acceptancePath ?? DEFAULT_NB2_ACCEPTANCE_PATH, "utf8"),
    );
    selection = selectNb2WaveTwoClients(clients, {
      maxClients: acceptanceDoc.tranche_scope?.max_clients ?? 5,
      overrideClientIds: acceptanceGate.report.wave_2_client_ids,
      methodologyPin: acceptanceDoc.methodology_pin,
    });
  }
  return {
    schema_version: "fleet-nb2-orchestration.v1",
    acceptance_gate: acceptanceGate,
    wave_two_selection: selection,
    track_b_execution_blocked: !acceptanceGate.allowed,
  };
}
