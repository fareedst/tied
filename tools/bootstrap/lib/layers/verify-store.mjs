/**
 * [IMPL-TIED_LAYERED_CLIENT_INSTALL] [ARCH-TIED_LAYERED_CLIENT_INSTALL] [REQ-TIED_LAYERED_CLIENT_INSTALL]
 * [IMPL-TIED_TWO_FOLDER_LAYOUT] [ARCH-TIED_TWO_FOLDER_LAYOUT] [REQ-TIED_TWO_FOLDER_LAYOUT]
 * How: VERIFY_STORE against client tied-bundle/ (no synthetic symlink dir).
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { loadManifest } from "../constants.mjs";
import {
  verifyFidelityMethodology,
  verifyAdversarialInquiryMethodology,
  verifyFeatureOrchestrationMethodology,
  verifyInheritedDetailFiles,
  verifyMethodologyPseudocodeTokenRefs,
  tiedCliDestFor,
  tiedBasePathValueFor,
} from "../verify.mjs";
import { runClientRefreshParityGate } from "../client-refresh-parity.mjs";
import { sayOk, sayErr } from "../console.mjs";
import { resolveMethodologyBundlePath } from "./store.mjs";
import { resolveTiedLayout } from "../layout.mjs";

/**
 * @param {string} projectRoot
 * @param {{
 *   storeRoot: string;
 *   mode: "linked"|"full";
 *   methodologyBundle: "live"|"pinned";
 *   skipParityGate?: boolean;
 *   parityGateReportOnly?: boolean;
 *   parityReport?: string;
 * }} options
 */
export function runPostInstallVerification(projectRoot, options) {
  const layout = resolveTiedLayout(projectRoot);
  const tiedDir = layout.tiedDir;
  const tiedBasePathValue = tiedBasePathValueFor(projectRoot);
  const cursorSkills = path.join(projectRoot, ".cursor", "skills");
  const tiedCliDest = tiedCliDestFor(projectRoot, cursorSkills);
  const bundlePath = resolveMethodologyBundlePath(
    options.methodologyBundle,
    options.storeRoot,
    projectRoot,
  );
  const verifyOpts = { bundleLayout: true };

  if (options.mode === "full") {
    verifyFidelityMethodology(bundlePath, tiedBasePathValue, tiedCliDest, verifyOpts);
    verifyAdversarialInquiryMethodology(bundlePath, verifyOpts);
    verifyFeatureOrchestrationMethodology(projectRoot, tiedDir, tiedBasePathValue, tiedCliDest);
    const manifest = loadManifest();
    verifyInheritedDetailFiles(bundlePath, manifest.INHERITED_DETAIL_REQUIRED ?? [], verifyOpts);
    verifyMethodologyPseudocodeTokenRefs(bundlePath, verifyOpts);

    const defaultReport = path.join(layout.reportsDir, "client-refresh-parity-report.json");
    const parityResult = runClientRefreshParityGate(options.storeRoot, projectRoot, {
      skipParityGate: options.skipParityGate === true,
      parityGateReportOnly: options.parityGateReportOnly === true,
      reportPath: options.parityReport ?? defaultReport,
    });
    if (parityResult.exitCode === 1) {
      throw new Error("CLIENT_REFRESH_PARITY_FAILED");
    }
    return { parity: "full_applicable", parityResult };
  }

  verifyFidelityMethodology(bundlePath, tiedBasePathValue, tiedCliDest, verifyOpts);
  verifyAdversarialInquiryMethodology(bundlePath, verifyOpts);
  verifyInheritedDetailFiles(bundlePath, loadManifest().INHERITED_DETAIL_REQUIRED ?? [], verifyOpts);
  verifyMethodologyPseudocodeTokenRefs(bundlePath, verifyOpts);
  verifyFeatureOrchestrationMethodology(projectRoot, tiedDir, tiedBasePathValue, tiedCliDest);

  sayOk("Linked install verification complete (parity not_applicable_linked).");
  return { parity: "not_applicable_linked" };
}

/**
 * @param {string} projectRoot
 * @param {{ storeRoot: string; methodologyBundle: "live"|"pinned" }} options
 */
export function runDoctor(projectRoot, options) {
  const tiedCli = tiedCliDestFor(projectRoot, path.join(projectRoot, ".cursor", "skills"));
  if (!fs.existsSync(tiedCli)) {
    throw new Error(`DOCTOR_FAILED: missing tied-cli wrapper ${tiedCli}`);
  }
  const bundlePath = resolveMethodologyBundlePath(
    options.methodologyBundle,
    options.storeRoot,
    projectRoot,
  );
  if (!fs.existsSync(bundlePath)) {
    throw new Error(`DOCTOR_FAILED: bundle path missing ${bundlePath}`);
  }

  const result = spawnSync("bash", [tiedCli, "yaml_index_list_tokens", '{"index":"requirements"}'], {
    cwd: projectRoot,
    encoding: "utf8",
    env: {
      ...process.env,
      TIED_BASE_PATH: resolveTiedLayout(projectRoot).tiedDir,
      TIED_METHODOLOGY_BUNDLE_PATH: bundlePath,
    },
    stdio: "pipe",
  });
  if (result.status !== 0) {
    sayErr(result.stderr || result.stdout);
    throw new Error("DOCTOR_TIED_CLI_FAILED");
  }
  sayOk("Doctor: tied-cli yaml_index_list_tokens succeeded with bundle env.");
  return { ok: true, bundlePath };
}
