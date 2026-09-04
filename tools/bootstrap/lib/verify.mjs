/**
 * [IMPL-TIED_FILES] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP]
 * How: Fail-closed verification gates; js-yaml index walk (replaces Ruby).
 */
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { jsonSafeAbsolute } from "./paths.mjs";
import { sayOk, sayWarn, sayErr } from "./console.mjs";

function isUsableDetailFile(value) {
  if (value == null) return false;
  const trimmed = String(value).trim();
  if (!trimmed) return false;
  return trimmed !== "null" && trimmed !== "~";
}

export function verifyFidelityMethodology(tiedDir, tiedBasePathValue, tiedCliDest) {
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
    const p = path.join(tiedDir, rel);
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
  sayWarn(`CAN run the read-only audit: ${path.join(tiedDir, "docs", "pseudocode-fidelity-audit-agent-prompt.md")} (Stages 0-4).`);
  sayWarn("CAN refresh methodology vocabulary with: copy_files --merge-vocab /path/to/client.");
}

export function verifyAdversarialInquiryMethodology(tiedDir) {
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
    const p = path.join(tiedDir, rel);
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
  sayWarn(`CAN run the read-only inquiry: ${path.join(tiedDir, "docs", "adversarial-inquiry-adoption.md")}.`);
}

export function verifyFeatureOrchestrationMethodology(projectRoot, tiedDir, tiedBasePathValue, tiedCliDest) {
  const required = [
    { rel: "tied/docs/tied-feature-onboarding.md", base: projectRoot },
    { rel: "tied/constitution.example.yaml", base: projectRoot },
    { rel: "tied/methodology/vocab/feature-orchestration.md", base: projectRoot },
    { rel: ".cursor/skills/tied-yaml/scripts/tied.sh", base: projectRoot },
  ];
  sayWarn("MUST verify feature orchestration methodology artifacts before completion.");
  let missing = 0;
  for (const { rel, base } of required) {
    const p = path.join(base, rel);
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
  sayWarn(`CAN run onboarding smoke: (cd ${projectRoot} && .cursor/skills/tied-yaml/scripts/tied.sh init).`);
  sayWarn(
    `CAN run structural validation: TIED_BASE_PATH=${tiedBasePathValue} ${tiedCliDest} tied_validate_consistency.`
  );
}

export function verifyInheritedDetailFiles(tiedDir, manifestRequired) {
  sayWarn("MUST verify inherited methodology detail-file integrity before completion.");
  let missing = 0;
  for (const rel of manifestRequired) {
    const p = path.join(tiedDir, rel);
    if (!fs.existsSync(p)) {
      sayErr(`MISSING mandatory inherited detail artifact: ${p}`);
      missing = 1;
    }
  }
  for (const indexName of ["requirements", "architecture-decisions", "implementation-decisions"]) {
    const indexPath = path.join(tiedDir, "methodology", `${indexName}.yaml`);
    if (!fs.existsSync(indexPath)) continue;
    const data = yaml.load(fs.readFileSync(indexPath, "utf8"));
    if (!data || typeof data !== "object") continue;
    for (const [token, rec] of Object.entries(data)) {
      if (!rec || typeof rec !== "object") continue;
      const detailFile = rec.detail_file;
      if (!isUsableDetailFile(detailFile)) continue;
      const df = String(detailFile);
      const resolved = path.join(tiedDir, "methodology", df);
      const methodologyPrefix = path.join(tiedDir, "methodology") + path.sep;
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
        sayErr(`INDEX detail_file unresolved: ${indexName}.yaml ${token} -> ${path.join(tiedDir, "methodology", df)}`);
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

export function tiedCliDestFor(projectRoot) {
  return path.join(projectRoot, ".cursor", "skills", "tied-yaml", "scripts", "tied-cli.sh");
}

export function tiedBasePathValueFor(projectRoot) {
  return jsonSafeAbsolute(path.join(projectRoot, "tied"));
}
