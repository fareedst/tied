/**
 * [IMPL-TIED_FILES] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP]
 * How: Fail-closed verification gates; js-yaml index walk (replaces Ruby).
 */
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { jsonSafeAbsolute } from "./paths.mjs";
import { sayOk, sayWarn, sayErr } from "./console.mjs";
import { resolveTiedLayout } from "./layout.mjs";
import { bundleRelativeVerifyPath } from "./methodology-bundle.mjs";

function isUsableDetailFile(value) {
  if (value == null) return false;
  const trimmed = String(value).trim();
  if (!trimmed) return false;
  return trimmed !== "null" && trimmed !== "~";
}

/**
 * @param {string} verifyRoot
 * @param {string} tiedBasePathValue
 * @param {string} tiedCliDest
 * @param {{ bundleLayout?: boolean }} [options]
 */
export function verifyFidelityMethodology(verifyRoot, tiedBasePathValue, tiedCliDest, options = {}) {
  const relPath = (rel) =>
    options.bundleLayout ? bundleRelativeVerifyPath(rel) : rel;
  const required = [
    "methodology/requirements/REQ-TIED_FIDELITY_RESEARCH.yaml",
    "methodology/architecture-decisions/ARCH-TIED_FIDELITY_RESEARCH.yaml",
    "methodology/implementation-decisions/IMPL-TIED_FIDELITY_RESEARCH.yaml",
    "methodology/implementation-decisions/IMPL-TIED_FIDELITY_RESEARCH-pseudocode.md",
    "docs/tied-fidelity-research.md",
    "docs/pseudocode-fidelity-audit-agent-prompt.md",
    "methodology/vocab/fidelity-research.md",
  ];
  sayWarn("MUST verify fidelity research methodology artifacts before completion.");
  let missing = 0;
  for (const rel of required) {
    const p = path.join(verifyRoot, relPath(rel));
    if (!fs.existsSync(p)) {
      sayErr(`MISSING mandatory fidelity methodology artifact: ${p}`);
      missing = 1;
    }
  }
  if (missing) {
    sayErr("Fidelity research methodology verification failed; client bootstrap is incomplete.");
    throw new Error("FIDELITY_GATE_FAILED");
  }
  sayOk("MUST verify fidelity research methodology artifacts: complete.");
  sayWarn(
    `CAN run structural validation: TIED_BASE_PATH=${tiedBasePathValue} ${tiedCliDest} tied_validate_consistency.`
  );
  sayWarn(
    `CAN run the read-only audit: ${path.join(verifyRoot, relPath("docs/pseudocode-fidelity-audit-agent-prompt.md"))} (Stages 0-4).`,
  );
  sayWarn("CAN refresh methodology vocabulary with: tied-install --refresh --merge-vocab /path/to/client.");
}

/**
 * @param {string} verifyRoot
 * @param {{ bundleLayout?: boolean }} [options]
 */
export function verifyAdversarialInquiryMethodology(verifyRoot, options = {}) {
  const relPath = (rel) =>
    options.bundleLayout ? bundleRelativeVerifyPath(rel) : rel;
  const required = [
    "methodology/requirements/REQ-TIED_ADVERSARIAL_INQUIRY.yaml",
    "methodology/architecture-decisions/ARCH-TIED_ADVERSARIAL_INQUIRY.yaml",
    "methodology/implementation-decisions/IMPL-TIED_ADVERSARIAL_INQUIRY.yaml",
    "methodology/implementation-decisions/IMPL-TIED_ADVERSARIAL_INQUIRY-pseudocode.md",
    "methodology/implementation-decisions/IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST.yaml",
    "methodology/implementation-decisions/IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST-pseudocode.md",
  ];
  sayWarn("MUST verify adversarial inquiry methodology artifacts before completion.");
  let missing = 0;
  for (const rel of required) {
    const p = path.join(verifyRoot, relPath(rel));
    if (!fs.existsSync(p)) {
      sayErr(`MISSING mandatory adversarial inquiry methodology artifact: ${p}`);
      missing = 1;
    }
  }
  if (missing) {
    sayErr("Adversarial inquiry methodology verification failed; client bootstrap is incomplete.");
    throw new Error("ADVERSARIAL_INQUIRY_GATE_FAILED");
  }
  sayOk("MUST verify adversarial inquiry methodology artifacts: complete.");
  sayWarn(
    `CAN run the read-only inquiry: ${path.join(verifyRoot, relPath("docs/adversarial-inquiry-adoption.md"))}.`,
  );
}

function firstExistingPath(candidates) {
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return candidates[0];
}

export function verifyFeatureOrchestrationMethodology(projectRoot, tiedDir, tiedBasePathValue, tiedCliDest) {
  const tiedSh = path.join(path.dirname(tiedCliDest), "tied.sh");
  const layout = resolveTiedLayout(projectRoot);
  const required = [
    firstExistingPath([
      path.join(layout.docsDir, "tied-feature-onboarding.md"),
      path.join(tiedDir, "docs", "tied-feature-onboarding.md"),
    ]),
    firstExistingPath([
      path.join(layout.tiedDir, "constitution.example.yaml"),
      path.join(tiedDir, "constitution.example.yaml"),
    ]),
    firstExistingPath([
      path.join(layout.methodVocabDir, "feature-orchestration.md"),
      path.join(tiedDir, "methodology", "vocab", "feature-orchestration.md"),
    ]),
    tiedSh,
  ];
  sayWarn("MUST verify feature orchestration methodology artifacts before completion.");
  let missing = 0;
  for (const p of required) {
    if (!fs.existsSync(p)) {
      sayErr(`MISSING mandatory feature orchestration artifact: ${p}`);
      missing = 1;
    }
  }
  if (missing) {
    sayErr("Feature orchestration methodology verification failed; client bootstrap is incomplete.");
    throw new Error("FEATURE_ORCHESTRATION_GATE_FAILED");
  }
  sayOk("MUST verify feature orchestration methodology artifacts: complete.");
  sayWarn(`CAN run onboarding smoke: (cd ${projectRoot} && ${tiedSh} init).`);
  sayWarn(
    `CAN run structural validation: TIED_BASE_PATH=${tiedBasePathValue} ${tiedCliDest} tied_validate_consistency.`
  );
}

const METHODOLOGY_PSEUDOCODE_TOKEN_RE = /\[(REQ|ARCH|IMPL)-([A-Z0-9][A-Z0-9_-]*)\]/gu;

function loadMethodologyIndexKeys(verifyRoot, indexName, bundleLayout) {
  const indexPath = bundleLayout
    ? path.join(verifyRoot, `${indexName}.yaml`)
    : path.join(verifyRoot, "methodology", `${indexName}.yaml`);
  if (!fs.existsSync(indexPath)) return new Set();
  const data = yaml.load(fs.readFileSync(indexPath, "utf8"));
  if (!data || typeof data !== "object") return new Set();
  return new Set(Object.keys(data));
}

// [IMPL-TIED_FILES] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP] — How: fail closed when inherited methodology pseudo-code references tokens absent from methodology indexes (W4-D6).
/**
 * @param {string} verifyRoot
 * @param {{ bundleLayout?: boolean }} [options]
 */
export function verifyMethodologyPseudocodeTokenRefs(verifyRoot, options = {}) {
  const bundleLayout = options.bundleLayout === true;
  sayWarn("MUST verify inherited methodology pseudo-code token references before completion.");
  const indexKeys = {
    REQ: loadMethodologyIndexKeys(verifyRoot, "requirements", bundleLayout),
    ARCH: loadMethodologyIndexKeys(verifyRoot, "architecture-decisions", bundleLayout),
    IMPL: loadMethodologyIndexKeys(verifyRoot, "implementation-decisions", bundleLayout),
  };
  const sidecarDir = bundleLayout
    ? path.join(verifyRoot, "implementation-decisions")
    : path.join(verifyRoot, "methodology", "implementation-decisions");
  if (!fs.existsSync(sidecarDir)) {
    sayErr(`MISSING methodology implementation-decisions directory: ${sidecarDir}`);
    throw new Error("METHODOLOGY_PSEUDOCODE_TOKEN_GATE_FAILED");
  }
  let missing = 0;
  for (const name of fs.readdirSync(sidecarDir)) {
    if (!name.endsWith("-pseudocode.md")) continue;
    const sidecarPath = path.join(sidecarDir, name);
    const content = fs.readFileSync(sidecarPath, "utf8");
    const seen = new Set();
    for (const match of content.matchAll(METHODOLOGY_PSEUDOCODE_TOKEN_RE)) {
      const prefix = match[1];
      const token = `${prefix}-${match[2]}`;
      if (seen.has(token)) continue;
      seen.add(token);
      const index = indexKeys[prefix];
      if (!index?.has(token)) {
        sayErr(
          `MISSING methodology index token ${token} referenced in ${path.join("methodology", "implementation-decisions", name)}`,
        );
        missing = 1;
      }
    }
  }
  if (missing) {
    sayErr("Methodology pseudo-code token reference verification failed; client bootstrap is incomplete.");
    throw new Error("METHODOLOGY_PSEUDOCODE_TOKEN_GATE_FAILED");
  }
  sayOk("MUST verify inherited methodology pseudo-code token references: complete.");
}

/**
 * @param {string} verifyRoot
 * @param {string[]} manifestRequired
 * @param {{ bundleLayout?: boolean }} [options]
 */
export function verifyInheritedDetailFiles(verifyRoot, manifestRequired, options = {}) {
  const relPath = (rel) =>
    options.bundleLayout ? bundleRelativeVerifyPath(rel) : rel;
  sayWarn("MUST verify inherited methodology detail-file integrity before completion.");
  let missing = 0;
  for (const rel of manifestRequired) {
    const p = path.join(verifyRoot, relPath(rel));
    if (!fs.existsSync(p)) {
      sayErr(`MISSING mandatory inherited detail artifact: ${p}`);
      missing = 1;
    }
  }
  const methodologyPrefix = options.bundleLayout
    ? path.join(verifyRoot) + path.sep
    : path.join(verifyRoot, "methodology") + path.sep;
  for (const indexName of ["requirements", "architecture-decisions", "implementation-decisions"]) {
    const indexPath = options.bundleLayout
      ? path.join(verifyRoot, `${indexName}.yaml`)
      : path.join(verifyRoot, "methodology", `${indexName}.yaml`);
    if (!fs.existsSync(indexPath)) continue;
    const data = yaml.load(fs.readFileSync(indexPath, "utf8"));
    if (!data || typeof data !== "object") continue;
    for (const [token, rec] of Object.entries(data)) {
      if (!rec || typeof rec !== "object") continue;
      const detailFile = rec.detail_file;
      if (!isUsableDetailFile(detailFile)) continue;
      const df = String(detailFile);
      const resolved = options.bundleLayout
        ? path.join(verifyRoot, df)
        : path.join(verifyRoot, "methodology", df);
      if (!resolved.startsWith(methodologyPrefix)) {
        sayErr(`INDEX detail_file escapes methodology boundary: ${indexName}.yaml ${token} -> ${df}`);
        missing = 1;
        continue;
      }
      if (df.includes("..")) {
        sayErr(`INDEX detail_file traversal rejected: ${indexName}.yaml ${token} -> ${df}`);
        missing = 1;
        continue;
      }
      if (!fs.existsSync(resolved)) {
        sayErr(`INDEX detail_file unresolved: ${indexName}.yaml ${token} -> ${resolved}`);
        missing = 1;
      }
    }
  }
  if (missing) {
    sayErr("Inherited detail-file integrity verification failed; client bootstrap is incomplete.");
    throw new Error("INHERITED_DETAIL_GATE_FAILED");
  }
  sayOk("MUST verify inherited methodology detail-file integrity: complete.");
}

export function tiedCliDestFor(projectRoot, cursorSkillsInstallDir) {
  const skillsRoot =
    cursorSkillsInstallDir ?? path.join(projectRoot, ".cursor", "skills");
  return path.join(skillsRoot, "tied-yaml", "scripts", "tied-cli.sh");
}

export function tiedBasePathValueFor(projectRoot) {
  return jsonSafeAbsolute(resolveTiedLayout(projectRoot).tiedDir);
}
