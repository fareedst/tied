#!/usr/bin/env node
/**
 * [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [IMPL-QUALITY_EVIDENCE_COLLECTION] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-QUALITY_ASSURANCE_EVIDENCE]
 * Canonical close-out gate runner — gate validate + envelope build/validate with auto-hydration.
 *
 * Usage:
 *   node tools/bootstrap/templates/run-close-out-gates.mjs \
 *     --project-root /path/to/repo \
 *     --request-token REQ-EXAMPLE \
 *     --tracker-path working/REQ-EXAMPLE/wave-tracker.yaml \
 *     --citdp-path working/REQ-EXAMPLE/CITDP-wave.yaml \
 *     --phase close_out \
 *     --run-id close-out-run-20260910
 */

import { mkdirSync, readFileSync, readdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import yaml from "js-yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../../..");
const MCP_DIST = path.join(REPO_ROOT, "mcp-server/dist");

function parseArgs(argv) {
  if (argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write(`run-close-out-gates.mjs — canonical gate + envelope close-out runner

Options:
  --project-root PATH       Project root (default: parent of tools/bootstrap)
  --request-token TOKEN     REQ token (required)
  --tracker-path PATH       Authoritative tracker YAML relative to project-root or absolute
  --citdp-path PATH         CITDP YAML path
  --phase PHASE             pre_implementation | verification | close_out (default: close_out)
  --run-id ID               Inquiry run_id for activation collect (optional)
  --envelope-blocking       Validate envelope with fail_on_error_gaps after build
  --skip-manifest           Skip quality evidence manifest collection
  --help                    Show this help
`);
    process.exit(0);
  }
  const get = (flag) => {
    const index = argv.indexOf(flag);
    return index >= 0 && argv[index + 1] ? argv[index + 1] : undefined;
  };
  const projectRoot = get("--project-root") ?? REPO_ROOT;
  const requestToken = get("--request-token");
  if (!requestToken) {
    throw new Error("missing --request-token");
  }
  return {
    projectRoot: path.resolve(projectRoot),
    requestToken,
    trackerPath: get("--tracker-path"),
    citdpPath: get("--citdp-path"),
    phase: get("--phase") ?? "close_out",
    runId: get("--run-id"),
    envelopeBlocking: argv.includes("--envelope-blocking"),
    skipManifest: argv.includes("--skip-manifest"),
  };
}

function resolveGitCommit(projectRoot) {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: projectRoot,
      encoding: "utf8",
    }).trim();
  } catch {
    return "unknown";
  }
}

function buildQualityRows(citdp) {
  const profiles = citdp?.risk_analysis?.quality_profiles ?? ["baseline-functional"];
  return profiles.map((profile) => ({
    id: profile,
    attribute: profile,
    applicability: "applicable",
    rationale: "CITDP quality profile matrix",
    evidence_method: "command",
    result: "pending",
  }));
}

async function collectQualityManifest(args, citdp) {
  const commands = citdp?.evidence?.commands;
  if (!Array.isArray(commands) || commands.length === 0) {
    return { ok: false, skipped: true, reason: "no_citdp_commands" };
  }
  const qualityCollection = await import(
    pathToFileURL(path.join(MCP_DIST, "quality-evidence-collection.js")).href
  );
  const artifactDir = path.join(
    args.projectRoot,
    "working",
    args.requestToken,
    "evidence",
    "quality-manifest",
  );
  mkdirSync(artifactDir, { recursive: true });
  const runId = args.runId ?? `close-out-${Date.now()}`;
  const manifestRelativePath = path.join(
    "working",
    args.requestToken,
    "evidence",
    "verification-evidence-manifest.v1.json",
  );
  const manifest = await qualityCollection.collectVerificationEvidence({
    run_id: runId,
    commit: resolveGitCommit(args.projectRoot),
    environment: { project_root: args.projectRoot },
    commands: commands.map((command, index) => ({
      id: `citdp-evidence-${index + 1}`,
      argv: ["bash", "-lc", String(command)],
      cwd: args.projectRoot,
      artifact_dir: artifactDir,
    })),
    quality_rows: buildQualityRows(citdp),
    covered_tokens: citdp?.impact_analysis?.tied_tokens_affected ?? [args.requestToken],
    proof_boundaries: citdp?.evidence?.proof_boundaries ?? ["command result only"],
    envelope_patch: {
      request_token: args.requestToken,
      project_root: args.projectRoot,
      manifest_relative_path: manifestRelativePath,
    },
  });
  return {
    ok: true,
    manifest_path: manifestRelativePath,
    schema_version: manifest.schema_version,
  };
}

function loadCitdpRecord(citdpPath, projectRoot) {
  const absolute = path.isAbsolute(citdpPath) ? citdpPath : path.join(projectRoot, citdpPath);
  const doc = yaml.load(readFileSync(absolute, "utf8"));
  if (doc && typeof doc === "object" && !Array.isArray(doc)) {
    const key = Object.keys(doc).find((item) => item.startsWith("CITDP-"));
    return (key ? doc[key] : doc);
  }
  return doc;
}

function loadPseudocodeReports(projectRoot, requestToken, citdp) {
  const psaDir = path.join(projectRoot, "working", requestToken, "pseudocode-analysis");
  if (!existsSync(psaDir)) return {};
  const inventory = citdp?.impact_analysis?.impl_inventory ?? [];
  const implTokens = inventory.map((entry) => (
    typeof entry === "string" ? entry : entry?.impl_token
  )).filter(Boolean);
  const reports = {};
  for (const implToken of implTokens) {
    const filePath = path.join(psaDir, `${implToken}.v1.json`);
    if (existsSync(filePath)) {
      reports[implToken] = JSON.parse(readFileSync(filePath, "utf8"));
    }
  }
  if (Object.keys(reports).length > 0) return reports;
  for (const name of readdirSync(psaDir).filter((item) => item.endsWith(".v1.json"))) {
    const implToken = name.replace(/\.v1\.json$/u, "");
    reports[implToken] = JSON.parse(readFileSync(path.join(psaDir, name), "utf8"));
  }
  return reports;
}

async function loadModules() {
  const validator = await import(pathToFileURL(path.join(MCP_DIST, "checklist-validator.js")).href);
  const hydration = await import(pathToFileURL(path.join(MCP_DIST, "checklist-gate-evidence-hydration.js")).href);
  const activation = await import(pathToFileURL(path.join(MCP_DIST, "checklist-activation-collect.js")).href);
  const envelopeBuild = await import(pathToFileURL(path.join(MCP_DIST, "request-evidence-envelope/build.js")).href);
  const envelopeValidate = await import(pathToFileURL(path.join(MCP_DIST, "request-evidence-envelope/validate.js")).href);
  const yamlLoader = await import(pathToFileURL(path.join(MCP_DIST, "yaml-loader.js")).href);
  return { validator, hydration, activation, envelopeBuild, envelopeValidate, yamlLoader };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const {
    validator,
    hydration,
    activation,
    envelopeBuild,
    envelopeValidate,
    yamlLoader,
  } = await loadModules();

  if (!args.trackerPath || !args.citdpPath) {
    throw new Error("missing --tracker-path or --citdp-path");
  }

  const trackerAbsolute = path.isAbsolute(args.trackerPath)
    ? args.trackerPath
    : path.join(args.projectRoot, args.trackerPath);
  const tracker = yaml.load(readFileSync(trackerAbsolute, "utf8"));
  const citdp = loadCitdpRecord(args.citdpPath, args.projectRoot);
  const depth = citdp?.risk_analysis?.adversarial_inquiry?.depth_tier ?? "integrated";
  const requiredStepSlugs = validator.derivePhaseAwareSlugs(depth, args.phase);

  let activationPayload;
  if (args.runId) {
    const collected = await activation.collectChecklistActivation({
      requestToken: args.requestToken,
      phase: args.phase,
      runId: args.runId,
      projectRoot: args.projectRoot,
    });
    if (!collected.ok) {
      throw new Error(`activation collect failed: ${collected.diagnostics.join(", ")}`);
    }
    activationPayload = {
      receipt: collected.receipt,
      artifacts: collected.artifacts,
      expected: collected.expected,
    };
  }

  const pseudocodeReports = loadPseudocodeReports(args.projectRoot, args.requestToken, citdp);
  const hydrationResult = await hydration.hydrateGateEvidenceFromActivation({
    phase: args.phase,
    activation: activationPayload,
    evidence: {
      trackerSource: "authoritative_file",
      requestToken: args.requestToken,
      pseudocodeReports,
    },
    projectRoot: args.projectRoot,
  });

  let manifestResult = { ok: false, skipped: true, reason: "not_requested" };
  if (!args.skipManifest) {
    manifestResult = await collectQualityManifest(args, citdp);
  }

  const gate = validator.validateChecklistGate({
    phase: args.phase,
    tracker,
    citdp,
    requiredStepSlugs,
    activation: activationPayload,
    evidence: hydrationResult.evidence,
  });

  const tiedBase = yamlLoader.getBasePath?.() ?? path.join(args.projectRoot, "tied");
  const buildResult = await envelopeBuild.buildRequestEvidenceEnvelope({
    request_token: args.requestToken,
    project_root: args.projectRoot,
    tied_base_path: tiedBase,
    confirmed_tied_base_path: tiedBase,
    gate_policy: citdp?.risk_analysis?.adversarial_inquiry?.gate_policy ?? "advisory",
    depth_tier: depth,
    output_mode: "file",
  });

  let envelopeValidation = { ok: true, diagnostics: [] };
  if (buildResult.ok) {
    envelopeValidation = await envelopeValidate.validateRequestEvidenceEnvelope({
      envelope: buildResult.envelope,
      fail_on_error_gaps: args.envelopeBlocking,
    });
  }

  const summary = {
    phase: args.phase,
    quality_manifest: manifestResult,
    gate: {
      allowed: gate.allowed,
      blocking: gate.blocking,
      diagnostics: gate.diagnostics,
      evidence_hydrated: hydrationResult.hydrated,
    },
    envelope: buildResult.ok
      ? {
          ok: envelopeValidation.ok,
          path: buildResult.envelope_path,
          blocking_gap_count: envelopeValidation.blocking_gap_count,
          advisory_gap_count: envelopeValidation.advisory_gap_count,
          diagnostics: envelopeValidation.diagnostics,
        }
      : { ok: false, error: buildResult.error, stage: buildResult.stage },
  };

  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
  if (!gate.allowed || !buildResult.ok || !envelopeValidation.ok) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
