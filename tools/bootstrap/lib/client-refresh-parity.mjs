/**
 * [IMPL-TIED_CLIENT_REFRESH_PARITY] [ARCH-TIED_CLIENT_REFRESH_PARITY] [REQ-TIED_CLIENT_REFRESH_PARITY]
 * How: Parity A (templates vs methodology) and Parity B (DOCS_TO_COPY hashes); JSON report v1.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { loadManifest } from "./constants.mjs";
import { TIED_REPO_ROOT } from "./constants.mjs";
import { sayWarn, sayErr } from "./console.mjs";
import {
  isMethodologyTemplateOnlyPath,
  METHODOLOGY_TEMPLATE_ONLY_PATHS,
} from "./methodology-template-only-allowlist.mjs";

export { METHODOLOGY_TEMPLATE_ONLY_PATHS };

const PARITY_A_SUBDIRS = [
  "requirements",
  "architecture-decisions",
  "implementation-decisions",
];

const YAML_EXT = /\.(ya?ml)$/i;

/**
 * @param {string} filePath
 */
function sha256File(filePath) {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(filePath));
  return hash.digest("hex");
}

/**
 * @param {string} root
 * @param {string} prefix relative prefix (posix)
 * @param {string[]} out
 */
function collectFilesUnder(root, prefix, out) {
  if (!fs.existsSync(root)) return;
  for (const name of fs.readdirSync(root)) {
    const abs = path.join(root, name);
    const stat = fs.lstatSync(abs);
    if (!stat.isFile()) continue;
    const rel = prefix ? `${prefix}/${name}` : name;
    out.push(rel.replace(/\\/g, "/"));
  }
}

/**
 * @param {string} tiedSourceRoot
 * @param {string} clientProjectRoot
 * @param {{ semanticYamlCompare?: boolean }} options
 */
export function computeParityA(tiedSourceRoot, clientProjectRoot, options = {}) {
  const templatesDir = path.join(tiedSourceRoot, "templates");
  const methodologyDir = path.join(clientProjectRoot, "tied", "methodology");
  const manifest = loadManifest();
  /** @type {import('./client-refresh-parity-types.js').ParityEntry[]} */
  const entries = [];
  const relativePaths = new Set(METHODOLOGY_TEMPLATE_ONLY_PATHS);

  for (const sub of PARITY_A_SUBDIRS) {
    const acc = [];
    collectFilesUnder(path.join(templatesDir, sub), sub, acc);
    for (const p of acc) {
      relativePaths.add(p);
    }
  }

  for (const indexName of manifest.INDEX_YAML_FILES ?? []) {
    relativePaths.add(indexName);
  }

  for (const rel of [...relativePaths].sort()) {
    if (isMethodologyTemplateOnlyPath(rel)) {
      entries.push({
        relative_path: rel,
        disposition: "preserved_by_policy",
        notes: "METHODOLOGY_TEMPLATE_ONLY allowlist",
      });
      continue;
    }

    const sourcePath = path.join(templatesDir, rel);
    const clientPath = path.join(methodologyDir, rel);

    if (!fs.existsSync(sourcePath) && !fs.existsSync(clientPath)) {
      continue;
    }
    if (!fs.existsSync(sourcePath)) {
      entries.push({ relative_path: rel, disposition: "missing", notes: "missing source template" });
      continue;
    }
    if (!fs.existsSync(clientPath)) {
      entries.push({ relative_path: rel, disposition: "missing", notes: "missing client methodology file" });
      continue;
    }

    let disposition = "matched";
    let compareMode = "sha256";
    let sourceSha;
    let clientSha;

    if (options.semanticYamlCompare && YAML_EXT.test(rel)) {
      compareMode = "semantic_yaml";
      const semanticOk = runSemanticYamlCompareForFile(tiedSourceRoot, templatesDir, methodologyDir, rel);
      disposition = semanticOk ? "matched" : "drifted";
    } else {
      sourceSha = sha256File(sourcePath);
      clientSha = sha256File(clientPath);
      disposition = sourceSha === clientSha ? "matched" : "drifted";
    }

    entries.push({
      relative_path: rel,
      disposition,
      compare_mode: compareMode,
      ...(sourceSha ? { source_sha256: sourceSha } : {}),
      ...(clientSha ? { client_sha256: clientSha } : {}),
    });
  }

  return {
    label: "templates_vs_methodology",
    entries,
  };
}

/**
 * @param {string} tiedSourceRoot
 * @param {string} templatesDir
 * @param {string} methodologyDir
 * @param {string} rel file path under methodology/templates mapping
 */
function runSemanticYamlCompareForFile(tiedSourceRoot, templatesDir, methodologyDir, rel) {
  const parentRel = path.posix.dirname(rel);
  const leftDir = parentRel === "." ? templatesDir : path.join(templatesDir, parentRel);
  const rightDir = parentRel === "." ? methodologyDir : path.join(methodologyDir, parentRel);
  const compareScript = path.join(tiedSourceRoot, "scripts", "compare_yaml_dirs.rb");
  if (!fs.existsSync(compareScript)) {
    throw new Error(`CLIENT_REFRESH_PARITY_INTERNAL: missing ${compareScript}`);
  }
  const result = spawnSync("ruby", [compareScript, leftDir, rightDir], {
    encoding: "utf8",
    cwd: tiedSourceRoot,
  });
  return result.status === 0;
}

/**
 * @param {string} tiedSourceRoot
 * @param {string} clientProjectRoot
 */
export function computeParityB(tiedSourceRoot, clientProjectRoot) {
  const manifest = loadManifest();
  const docsRoot = path.join(tiedSourceRoot, "tied", "docs");
  const clientDocs = path.join(clientProjectRoot, "tied", "docs");
  /** @type {import('./client-refresh-parity-types.js').ParityEntry[]} */
  const entries = [];

  for (const docName of manifest.DOCS_TO_COPY ?? []) {
    const sourcePath = path.join(docsRoot, docName);
    const clientPath = path.join(clientDocs, docName);

    if (!fs.existsSync(clientPath)) {
      entries.push({
        relative_path: docName,
        disposition: "missing",
        notes: "client doc absent; bootstrap copy-when-missing policy",
      });
      continue;
    }
    if (!fs.existsSync(sourcePath)) {
      entries.push({
        relative_path: docName,
        disposition: "missing",
        notes: "source doc absent",
      });
      continue;
    }

    const sourceSha = sha256File(sourcePath);
    const clientSha = sha256File(clientPath);
    if (sourceSha === clientSha) {
      entries.push({
        relative_path: docName,
        disposition: "matched",
        compare_mode: "sha256",
        source_sha256: sourceSha,
        client_sha256: clientSha,
      });
    } else {
      entries.push({
        relative_path: docName,
        disposition: "drifted",
        compare_mode: "sha256",
        source_sha256: sourceSha,
        client_sha256: clientSha,
      });
    }
  }

  return {
    label: "docs_to_copy_hashes",
    entries,
  };
}

/**
 * @param {object} parityA
 * @param {object} parityB
 */
export function summarizeParityReport(parityA, parityB) {
  const all = [...parityA.entries, ...parityB.entries];
  let methodologyDrift = 0;
  let docDrift = 0;
  let missing = 0;
  let preserved = 0;

  for (const entry of parityA.entries) {
    if (entry.disposition === "drifted") methodologyDrift += 1;
    if (entry.disposition === "missing") missing += 1;
    if (entry.disposition === "preserved_by_policy") preserved += 1;
  }
  for (const entry of parityB.entries) {
    if (entry.disposition === "drifted") docDrift += 1;
    if (entry.disposition === "missing") missing += 1;
    if (entry.disposition === "preserved_by_policy") preserved += 1;
  }

  return {
    methodology_drift_count: methodologyDrift,
    doc_drift_count: docDrift,
    missing_count: missing,
    preserved_by_policy_count: preserved,
    total_entries: all.length,
  };
}

/**
 * @param {string} tiedSourceRoot
 * @param {string} clientProjectRoot
 * @param {{
 *   strictRefresh?: boolean,
 *   semanticYamlCompare?: boolean,
 *   parityGateReportOnly?: boolean,
 *   skipParityGate?: boolean,
 *   reportPath?: string,
 * }} options
 * @returns {{ exitCode: number, report: object | null }}
 */
export function runClientRefreshParityGate(tiedSourceRoot, clientProjectRoot, options = {}) {
  if (options.skipParityGate) {
    return { exitCode: 0, report: null };
  }

  const tiedDir = path.join(clientProjectRoot, "tied");
  if (!fs.existsSync(tiedDir)) {
    sayErr("CLIENT_REFRESH_PARITY: client tied/ directory missing");
    return { exitCode: 2, report: null };
  }

  try {
    const parityA = computeParityA(tiedSourceRoot, clientProjectRoot, {
      semanticYamlCompare: options.semanticYamlCompare === true,
    });
    const parityB = computeParityB(tiedSourceRoot, clientProjectRoot);
    const summary = summarizeParityReport(parityA, parityB);

    const report = {
      schema_version: "client-refresh-parity-report.v1",
      generated_at: new Date().toISOString(),
      source_root: tiedSourceRoot,
      client_root: clientProjectRoot,
      options: {
        strict_refresh: options.strictRefresh === true,
        semantic_yaml_compare: options.semanticYamlCompare === true,
        report_only: options.parityGateReportOnly === true,
      },
      parity_a: parityA,
      parity_b: parityB,
      summary: {
        methodology_drift_count: summary.methodology_drift_count,
        doc_drift_count: summary.doc_drift_count,
        missing_count: summary.missing_count,
        preserved_by_policy_count: summary.preserved_by_policy_count,
      },
    };

    const reportPath =
      options.reportPath ??
      path.join(clientProjectRoot, ".tied", "client-refresh-parity-report.json");
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

    printHumanSummary(report, summary);

    if (options.parityGateReportOnly) {
      return { exitCode: 0, report };
    }

    if (summary.methodology_drift_count > 0) {
      sayErr(
        `CLIENT_REFRESH_PARITY: ${summary.methodology_drift_count} methodology drift path(s); see ${reportPath}`,
      );
      return { exitCode: 1, report };
    }

    if (summary.doc_drift_count > 0) {
      sayWarn(
        `CLIENT_REFRESH_PARITY: ${summary.doc_drift_count} doc drift path(s); see ${reportPath}`,
      );
      if (options.strictRefresh) {
        return { exitCode: 1, report };
      }
      return { exitCode: 0, report };
    }

    return { exitCode: 0, report };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    sayErr(`CLIENT_REFRESH_PARITY_INTERNAL: ${message}`);
    return { exitCode: 2, report: null };
  }
}

/**
 * @param {object} report
 * @param {object} summary
 */
function printHumanSummary(report, summary) {
  const driftA = report.parity_a.entries.filter((e) => e.disposition === "drifted").slice(0, 5);
  const driftB = report.parity_b.entries.filter((e) => e.disposition === "drifted").slice(0, 5);
  sayWarn(
    `DEBUG: CLIENT_REFRESH_PARITY summary methodology_drift=${summary.methodology_drift_count} doc_drift=${summary.doc_drift_count} missing=${summary.missing_count} preserved=${summary.preserved_by_policy_count}`,
  );
  for (const entry of driftA) {
    sayWarn(`DEBUG: Parity A drift: ${entry.relative_path}`);
  }
  for (const entry of driftB) {
    sayWarn(`DEBUG: Parity B drift: ${entry.relative_path}`);
  }
}

/** Default tied source root for CLI when not overridden. */
export function defaultTiedSourceRoot() {
  return TIED_REPO_ROOT;
}
