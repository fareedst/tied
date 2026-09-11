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
import {
  resolveDepthTier,
  shouldCollectActivation,
} from "./run-close-out-gates-activation.mjs";

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
  --fail-on-process-gaps    Validate envelope with fail_on_process_gaps (Wave 5 process-strict)
  --sync-dispositions       Run sync-tracker-dispositions.mjs before gates
  --reconcile               Run tied_adherence_reconcile_run (read-only) before gates
  --rebuild-envelope-only   Build/validate envelope only; skip gate validate
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
    failOnProcessGaps: argv.includes("--fail-on-process-gaps"),
    syncDispositions: argv.includes("--sync-dispositions"),
    reconcile: argv.includes("--reconcile"),
    rebuildEnvelopeOnly: argv.includes("--rebuild-envelope-only"),
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
  const reconcileRunner = await import(pathToFileURL(path.join(MCP_DIST, "tools/adherence-reconcile-runner.js")).href);
  const yamlLoader = await import(pathToFileURL(path.join(MCP_DIST, "yaml-loader.js")).href);
  return { validator, hydration, activation, envelopeBuild, envelopeValidate, reconcileRunner, yamlLoader };
}

function runSyncDispositions(trackerAbsolute, projectRoot, requestToken, runId) {
  const script = path.join(REPO_ROOT, "tools/bootstrap/templates/sync-tracker-dispositions.mjs");
  const ledgerPath = path.join("working", requestToken, "gates", "ledger.jsonl");
  execFileSync(process.execPath, [
    script,
    "--tracker",
    trackerAbsolute,
    "--project-root",
    projectRoot,
    "--ledger-path",
    ledgerPath,
    "--run-id",
    runId ?? `close-out-sync-${Date.now()}`,
  ], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

async function generateSubstanceProfile(args, citdp, manifestResult, pseudocodeReports) {
  const psaCount = Object.keys(pseudocodeReports ?? {}).length;
  if (!manifestResult.ok || psaCount === 0) {
    return { ok: false, skipped: true, reason: psaCount === 0 ? "no_psa_reports" : "manifest_not_collected" };
  }
  const profileModule = await import(
    pathToFileURL(path.join(MCP_DIST, "fidelity-research/evidence-chain-profile.js")).href
  );
  const liveValidators = await import(
    pathToFileURL(path.join(MCP_DIST, "fidelity-research/live-structural-validators.js")).href
  );
  const outputPath = path.join(
    args.projectRoot,
    "working",
    args.requestToken,
    "evidence",
    "evidence-chain-profile.v1.json",
  );
  mkdirSync(path.dirname(outputPath), { recursive: true });
  const tiedBase = path.join(args.projectRoot, "tied");
  const tokens = citdp?.impact_analysis?.tied_tokens_affected ?? [args.requestToken];
  const result = profileModule.generateEvidenceChainProfile({
    project_root: args.projectRoot,
    tied_base_path: tiedBase,
    confirmed_tied_base_path: tiedBase,
    profile_depth: "integrated",
    output_mode: "file",
    output_path: outputPath,
    observed_at: new Date().toISOString(),
    run_metadata: {
      run_id: args.runId ?? `close-out-profile-${Date.now()}`,
      commit: resolveGitCommit(args.projectRoot),
    },
    scope: {
      requirement_tokens: tokens.filter((t) => String(t).startsWith("REQ-")),
      implementation_tokens: (citdp?.impact_analysis?.impl_inventory ?? [])
        .map((entry) => (typeof entry === "string" ? entry : entry?.impl_token))
        .filter(Boolean),
      impl_tokens_for_pseudocode: Object.keys(pseudocodeReports),
      quality_plan: {
        selected_profiles: citdp?.risk_analysis?.quality_profiles ?? ["baseline-functional"],
        checks: [],
      },
    },
    structural_validators: liveValidators.createLiveStructuralValidators({
      requirement_tokens: tokens.filter((t) => String(t).startsWith("REQ-")),
      implementation_tokens: (citdp?.impact_analysis?.impl_inventory ?? [])
        .map((entry) => (typeof entry === "string" ? entry : entry?.impl_token))
        .filter(Boolean),
      impl_tokens_for_pseudocode: Object.keys(pseudocodeReports),
    }),
    manifest_reference: manifestResult.manifest_path,
  });
  return result.ok
    ? { ok: true, path: path.relative(args.projectRoot, outputPath), validators_observed: true }
    : { ok: false, error: result.error, stage: result.stage };
}

function envelopeGapsFromEnvelope(envelope) {
  if (!envelope || !Array.isArray(envelope.gaps)) return [];
  return envelope.gaps.map((gap) => ({
    code: gap.code,
    artifact_kind: gap.artifact_kind,
    severity: gap.severity,
  }));
}

function mergeCloseOutDecision(gate, envelopeValidation) {
  const gateAllowed = gate?.allowed !== false;
  const envelopeOk = envelopeValidation?.ok !== false;
  return {
    allowed: gateAllowed && envelopeOk,
    gate_allowed: gateAllowed,
    envelope_ok: envelopeOk,
    blocking: !(gateAllowed && envelopeOk),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const {
    validator,
    hydration,
    activation,
    envelopeBuild,
    envelopeValidate,
    reconcileRunner,
    yamlLoader,
  } = await loadModules();

  if (!args.trackerPath) {
    throw new Error("missing --tracker-path");
  }
  if (!args.rebuildEnvelopeOnly && !args.citdpPath) {
    throw new Error("missing --citdp-path");
  }

  const trackerAbsolute = path.isAbsolute(args.trackerPath)
    ? args.trackerPath
    : path.join(args.projectRoot, args.trackerPath);
  let tracker = yaml.load(readFileSync(trackerAbsolute, "utf8"));
  if (args.syncDispositions) {
    runSyncDispositions(trackerAbsolute, args.projectRoot, args.requestToken, args.runId);
    tracker = yaml.load(readFileSync(trackerAbsolute, "utf8"));
  }
  const citdp = args.citdpPath ? loadCitdpRecord(args.citdpPath, args.projectRoot) : {};
  const depth = resolveDepthTier(citdp, tracker);
  const failOnProcessGaps = args.failOnProcessGaps;
  const requiredStepSlugs = validator.derivePhaseAwareSlugs(depth, args.phase);

  let reconcileResult = { ok: false, skipped: true };
  if (args.reconcile) {
    const ledgerPath = path.join(args.projectRoot, "working", args.requestToken, "gates", "ledger.jsonl");
    const gatesDir = path.join(args.projectRoot, "working", args.requestToken, "gates");
    reconcileResult = await reconcileRunner.runAdherenceReconcile({
      ledger_path: ledgerPath,
      tracker_path: trackerAbsolute,
      gates_dir: gatesDir,
      workspace: args.projectRoot,
      citdp_path: args.citdpPath
        ? (path.isAbsolute(args.citdpPath) ? args.citdpPath : path.join(args.projectRoot, args.citdpPath))
        : undefined,
      include_process_grade: true,
      repo_root: REPO_ROOT,
    });
  }

  let activationPayload;
  const activationDecision = shouldCollectActivation({
    runId: args.runId,
    depth,
    citdp,
    tracker,
  });
  let activationCollect = {
    skipped: !activationDecision.collect,
    reason: activationDecision.reason,
    run_id: activationDecision.run_id,
  };
  if (activationDecision.collect) {
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
    activationCollect = { skipped: false, reason: "collect", run_id: args.runId };
  }

  const pseudocodeReports = loadPseudocodeReports(args.projectRoot, args.requestToken, citdp);

  let manifestResult = { ok: false, skipped: true, reason: "not_requested" };
  if (!args.skipManifest) {
    manifestResult = await collectQualityManifest(args, citdp);
  }

  let profileResult = { ok: false, skipped: true, reason: "not_requested" };
  if (!args.rebuildEnvelopeOnly) {
    profileResult = await generateSubstanceProfile(args, citdp, manifestResult, pseudocodeReports);
  }

  const tiedBase = path.join(args.projectRoot, "tied");
  const buildResult = await envelopeBuild.buildRequestEvidenceEnvelope({
    request_token: args.requestToken,
    project_root: args.projectRoot,
    tied_base_path: tiedBase,
    confirmed_tied_base_path: tiedBase,
    gate_policy: citdp?.risk_analysis?.adversarial_inquiry?.gate_policy ?? "advisory",
    depth_tier: depth,
    output_mode: "file",
  });

  let envelopeValidation = { ok: true, diagnostics: [], blocking_gap_count: 0, advisory_gap_count: 0 };
  if (buildResult.ok) {
    envelopeValidation = await envelopeValidate.validateRequestEvidenceEnvelope({
      envelope: buildResult.envelope,
      fail_on_error_gaps: args.envelopeBlocking,
      fail_on_process_gaps: failOnProcessGaps,
    });
  }

  const envelopeGaps = buildResult.ok ? envelopeGapsFromEnvelope(buildResult.envelope) : [];

  let gate = { allowed: true, blocking: false, diagnostics: [], evidence_hydrated: false };
  let hydrationResult = { evidence: {}, hydrated: [], diagnostics: [] };
  if (!args.rebuildEnvelopeOnly) {
    hydrationResult = await hydration.hydrateGateEvidenceFromActivation({
      phase: args.phase,
      activation: activationPayload,
      evidence: {
        trackerSource: "authoritative_file",
        requestToken: args.requestToken,
        pseudocodeReports,
        envelopeGaps,
        envelopeBlocking: args.envelopeBlocking,
      },
      projectRoot: args.projectRoot,
    });
    gate = validator.validateChecklistGate({
      phase: args.phase,
      tracker,
      citdp,
      requiredStepSlugs,
      activation: activationPayload,
      evidence: hydrationResult.evidence,
    });
  }

  const mergedDecision = mergeCloseOutDecision(gate, envelopeValidation);

  const summary = {
    phase: args.phase,
    depth_tier: depth,
    activation_collect: activationCollect,
    reconcile: reconcileResult,
    quality_manifest: manifestResult,
    evidence_chain_profile: profileResult,
    merged_decision: mergedDecision,
    gate: {
      allowed: gate.allowed,
      blocking: gate.blocking,
      diagnostics: gate.diagnostics,
      evidence_hydrated: hydrationResult.hydrated?.length > 0,
      hydration_diagnostics: hydrationResult.diagnostics,
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
  if (
    (!args.rebuildEnvelopeOnly && !mergedDecision.allowed)
    || !buildResult.ok
    || (args.reconcile && reconcileResult.ok === false && !reconcileResult.skipped)
  ) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
