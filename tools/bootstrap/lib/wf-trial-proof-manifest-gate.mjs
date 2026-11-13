/**
 * [REQ-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE] [REQ-WF_TRIAL_RANGE_PROOF_MANIFEST_MANDATE]
 * [ARCH-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE] [ARCH-WF_TRIAL_RANGE_PROOF_MANIFEST_MANDATE]
 * [IMPL-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE] [SC-PMG-11] [SC-PMG-12] [SC-PMG-13]
 * [SC-RPM-05] [SC-RPM-09] [SC-RPM-10]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const PROOF_FACET_MANIFEST_SCHEMA_VERSION = "proof-facet-manifest.v1";

export const VALID_PROOF_SUBTYPES = new Set([
  "unit.default",
  "unit.colocated",
  "composition.general",
  "composition.wiring",
  "composition.integration",
  "composition.contract",
  "binding_inventory.table",
  "e2e.ui",
  "e2e.platform_constrained",
]);

/** Coarse receipt facets — not valid proof_subtype values (common agent mistake). */
export const COARSE_PROOF_FACETS = new Set(["unit", "composition", "e2e", "binding_inventory"]);

// [IMPL-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE] [SC-PMG-11] [SC-PMG-12] Per-row proof_subtype; FACET_AS_SUBTYPE for coarse facets.
export function proofSubtypeValidationError(index, value, rowKind = "files") {
  const loc = `${rowKind}[${index}].proof_subtype`;
  if (typeof value !== "string" || !value.trim()) {
    return {
      code: "SUBTYPE_MISSING",
      message: `${loc} required (fine label, e.g. unit.default)`,
    };
  }
  if (COARSE_PROOF_FACETS.has(value)) {
    return {
      code: "FACET_AS_SUBTYPE",
      message:
        `${loc} "${value}" is proof_facet not proof_subtype; ` +
        `use fine labels (e.g. unit.default, composition.wiring, e2e.ui)`,
    };
  }
  if (!VALID_PROOF_SUBTYPES.has(value)) {
    return {
      code: "UNKNOWN_SUBTYPE",
      message: `${loc} invalid: "${value}"`,
    };
  }
  return null;
}

const PRIMARY_REL = "tied-project/working/proof-facet-manifest/evidence/proof-facet-manifest.v1.json";

export function discoverManifestPath(repoRoot) {
  const primary = path.join(repoRoot, PRIMARY_REL);
  if (fs.existsSync(primary)) {
    return PRIMARY_REL;
  }
  const working = path.join(repoRoot, "tied-project/working");
  if (!fs.existsSync(working)) {
    return null;
  }
  for (const entry of fs.readdirSync(working, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const candidate = path.join(
      working,
      entry.name,
      "evidence",
      "proof-facet-manifest.v1.json",
    );
    if (fs.existsSync(candidate)) {
      return path.relative(repoRoot, candidate);
    }
  }
  return null;
}

export function validateMinManifestShape(manifest, expectedPromptId) {
  const errors = [];
  if (!manifest || typeof manifest !== "object") {
    return { ok: false, errors: [{ code: "NOT_OBJECT", message: "Manifest must be a JSON object" }] };
  }
  if (manifest.schema_version !== PROOF_FACET_MANIFEST_SCHEMA_VERSION) {
    errors.push({
      code: "SCHEMA_VERSION",
      message: `schema_version must be ${PROOF_FACET_MANIFEST_SCHEMA_VERSION}`,
    });
  }
  if (typeof manifest.prompt_id !== "string" || manifest.prompt_id !== expectedPromptId) {
    errors.push({
      code: "PROMPT_ID",
      message: `prompt_id must be ${expectedPromptId}`,
    });
  }
  const files = manifest.files;
  if (!Array.isArray(files) || files.length === 0) {
    errors.push({ code: "FILES_EMPTY", message: "files[] must contain at least one row" });
  } else {
    // [IMPL-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE] [SC-PMG-11] Validate every files[] row before FILE_EXISTS / FILE_COVERAGE.
    for (let i = 0; i < files.length; i++) {
      const row = files[i];
      if (!row || typeof row !== "object") {
        errors.push({ code: "FILE_ROW", message: `files[${i}] must be an object` });
        continue;
      }
      if (typeof row.path !== "string" || !row.path.trim()) {
        errors.push({ code: "FILE_PATH", message: `files[${i}].path required` });
      }
      const subtypeErr = proofSubtypeValidationError(i, row.proof_subtype);
      if (subtypeErr) {
        errors.push(subtypeErr);
      }
    }
  }
  const bindings = manifest.bindings;
  if (Array.isArray(bindings)) {
    for (let i = 0; i < bindings.length; i++) {
      const b = bindings[i];
      const st = b?.proof_subtype;
      if (st === undefined) continue;
      const subtypeErr = proofSubtypeValidationError(i, st, "bindings");
      if (subtypeErr) errors.push(subtypeErr);
    }
  }
  return { ok: errors.length === 0, errors };
}

export function countColocatedTestFiles(workspace) {
  const src = path.join(workspace, "src");
  if (!fs.existsSync(src)) {
    return 0;
  }
  let count = 0;
  const walk = (dir) => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(p);
      } else if (ent.name.endsWith(".test.ts")) {
        count += 1;
      }
    }
  };
  walk(src);
  return count;
}

export function validateManifestFilePresence(manifest, workspace) {
  const errors = [];
  const files = manifest?.files;
  if (!Array.isArray(files)) {
    return { ok: true, errors };
  }
  for (let i = 0; i < files.length; i++) {
    const row = files[i];
    const rel = row?.path;
    if (typeof rel !== "string" || !rel.trim()) {
      continue;
    }
    const abs = path.join(workspace, rel);
    if (!fs.existsSync(abs)) {
      errors.push({
        code: "FILE_EXISTS",
        message: `files[${i}].path not found under workspace: ${rel}`,
      });
    }
  }
  const testCount = countColocatedTestFiles(workspace);
  if (testCount > 0 && files.length < testCount) {
    errors.push({
      code: "FILE_COVERAGE",
      message: `manifest files[] length ${files.length} < src/**/*.test.ts count ${testCount}`,
    });
  }
  return { ok: errors.length === 0, errors };
}

export function runProofManifestGate({ workspace, wfId, repoRoot }) {
  const wfNorm = wfId.toUpperCase().replace(/^PROMPT-/, "");
  if (!/^WF-(0[1-9]|1[0-2])$/.test(wfNorm)) {
    return { ok: false, skipped: true, reason: "invalid_wf_id" };
  }
  const expectedPromptId = `PROMPT-${wfNorm}`;
  const rel = discoverManifestPath(workspace);
  if (!rel) {
    return {
      ok: false,
      errors: [{ code: "MANIFEST_MISSING", message: `No manifest under ${PRIMARY_REL} or working/*/evidence/` }],
      expected_path: PRIMARY_REL,
      prompt_id: expectedPromptId,
    };
  }
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(path.join(workspace, rel), "utf8"));
  } catch (e) {
    return {
      ok: false,
      errors: [{ code: "MANIFEST_READ", message: e instanceof Error ? e.message : String(e) }],
      manifest_path: rel,
    };
  }
  const shape = validateMinManifestShape(manifest, expectedPromptId);
  if (!shape.ok) {
    return {
      ok: false,
      errors: shape.errors,
      manifest_path: rel,
      prompt_id: expectedPromptId,
    };
  }
  const presence = validateManifestFilePresence(manifest, workspace);
  return {
    ok: presence.ok,
    errors: presence.errors,
    manifest_path: rel,
    prompt_id: expectedPromptId,
  };
}

function parseArgv(argv) {
  const out = { workspace: "", wfId: "", repoRoot: "" };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--workspace") out.workspace = argv[++i] ?? "";
    else if (a === "--wf-id") out.wfId = argv[++i] ?? "";
    else if (a === "--repo-root") out.repoRoot = argv[++i] ?? "";
  }
  return out;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isMain) {
  const { workspace, wfId, repoRoot } = parseArgv(process.argv.slice(2));
  const result = runProofManifestGate({
    workspace: path.resolve(workspace),
    wfId,
    repoRoot: path.resolve(repoRoot),
  });
  if (!result.ok) {
    for (const err of result.errors ?? []) {
      process.stderr.write(`ERROR: WF trial proof manifest gate: ${err.message}\n`);
    }
    // [IMPL-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE] [SC-PMG-13] Operator taxonomy + MCP validate hints (DIAGNOSTIC, not ERROR).
    if (result.errors?.some((e) => e.code === "FACET_AS_SUBTYPE" || e.code === "UNKNOWN_SUBTYPE")) {
      process.stderr.write(
        "DIAGNOSTIC: proof_subtype taxonomy: tied-project/working/REQ-TIED_TRIAL_PROOF_INTENT_STACK/evidence/proof-test-label-taxonomy.md\n",
      );
      process.stderr.write(
        "DIAGNOSTIC: validate before close-out: MCP tied_wf_proof_manifest_validate (repo_root + manifest_path)\n",
      );
    }
    if (result.expected_path) {
      process.stderr.write(
        `DIAGNOSTIC: expected path=${result.expected_path} prompt_id=${result.prompt_id ?? ""}\n`,
      );
    } else if (result.manifest_path) {
      process.stderr.write(`DIAGNOSTIC: manifest_path=${result.manifest_path}\n`);
    }
    process.exit(1);
  }
  process.exit(0);
}
