#!/usr/bin/env node
/**
 * [REQ-TIED_QMM_METHODOLOGY_CLIENT_RESOURCES] [IMPL-TIED_FILES]
 * One-shot phase-1 QMM corpus promotion from tied-project to tied-bundle (A4b pattern).
 */
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const projectRoot = path.join(repoRoot, "tied-project");
const bundleRoot = path.join(repoRoot, "tied-bundle");

const REQ_TOKENS = [
  "REQ-METHODOLOGY-LEARNING-EXPERIMENT",
  "REQ-METHODOLOGY-CONFORMANCE-EFFECTIVENESS-PAIRING",
  "REQ-METHODOLOGY-KAIZEN-EXPERIMENT-BRIDGE",
  "REQ-EVIDENCE_CHAIN_REPORT",
  "REQ-METHODOLOGY-PRODUCTION-SYSTEM-ENROLLMENT",
  "REQ-METHODOLOGY-SURFACE-EXPERIMENT-GATE",
];

function archToken(req) {
  return req.replace(/^REQ-/, "ARCH-");
}
function implToken(req) {
  return req.replace(/^REQ-/, "IMPL-");
}

const ALL_TOKENS = [
  ...REQ_TOKENS,
  ...REQ_TOKENS.map(archToken),
  ...REQ_TOKENS.map(implToken),
  "REQ-TIED_QMM_METHODOLOGY_CLIENT_RESOURCES",
  "ARCH-TIED_CLIENT_METHODOLOGY_RESOURCE_MANIFEST",
];

function loadYaml(p) {
  return yaml.load(fs.readFileSync(p, "utf8")) ?? {};
}

function writeYaml(p, doc) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, yaml.dump(doc, { lineWidth: 120, noRefs: true }), "utf8");
}

function mergeIndex(bundleIndexPath, projectIndexPath, tokens) {
  const bundle = loadYaml(bundleIndexPath);
  const project = loadYaml(projectIndexPath);
  for (const token of tokens) {
    if (project[token]) bundle[token] = project[token];
  }
  writeYaml(bundleIndexPath, bundle);
}

function copyDetail(relFromProject) {
  const src = path.join(projectRoot, relFromProject);
  const dest = path.join(bundleRoot, relFromProject);
  if (!fs.existsSync(src)) {
    throw new Error(`missing project detail: ${src}`);
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function main() {
  const reqTokens = REQ_TOKENS;
  const archTokens = reqTokens.map(archToken);
  const implTokens = reqTokens.map(implToken);

  mergeIndex(
    path.join(bundleRoot, "requirements.yaml"),
    path.join(projectRoot, "requirements.yaml"),
    [...reqTokens, "REQ-TIED_QMM_METHODOLOGY_CLIENT_RESOURCES"],
  );
  mergeIndex(
    path.join(bundleRoot, "architecture-decisions.yaml"),
    path.join(projectRoot, "architecture-decisions.yaml"),
    [...archTokens, "ARCH-TIED_CLIENT_METHODOLOGY_RESOURCE_MANIFEST"],
  );
  mergeIndex(
    path.join(bundleRoot, "implementation-decisions.yaml"),
    path.join(projectRoot, "implementation-decisions.yaml"),
    implTokens,
  );

  for (const req of reqTokens) {
    const arch = archToken(req);
    const impl = implToken(req);
    copyDetail(`requirements/${req}.yaml`);
    copyDetail(`architecture-decisions/${arch}.yaml`);
    copyDetail(`implementation-decisions/${impl}.yaml`);
    const pseudo = `implementation-decisions/${impl}-pseudocode.md`;
    if (fs.existsSync(path.join(projectRoot, pseudo))) {
      copyDetail(pseudo);
    }
  }
  copyDetail("requirements/REQ-TIED_QMM_METHODOLOGY_CLIENT_RESOURCES.yaml");
  copyDetail("architecture-decisions/ARCH-TIED_CLIENT_METHODOLOGY_RESOURCE_MANIFEST.yaml");

  const projectSt = loadYaml(path.join(projectRoot, "semantic-tokens.yaml"));
  const bundleSt = loadYaml(path.join(bundleRoot, "semantic-tokens.yaml"));
  for (const token of ALL_TOKENS) {
    if (projectSt[token]) bundleSt[token] = projectSt[token];
    else if (!bundleSt[token]) {
      const type = token.startsWith("REQ-") ? "REQ" : token.startsWith("ARCH-") ? "ARCH" : "IMPL";
      const sourceIndex =
        type === "REQ"
          ? "requirements.yaml"
          : type === "ARCH"
            ? "architecture-decisions.yaml"
            : "implementation-decisions.yaml";
      bundleSt[token] = {
        cross_references: [],
        description: `Promoted ${token} (phase-1 QMM bundle)`,
        name: token,
        source_index: sourceIndex,
        status: "Active",
        type,
      };
      projectSt[token] = { ...bundleSt[token] };
    }
  }
  writeYaml(path.join(bundleRoot, "semantic-tokens.yaml"), bundleSt);
  writeYaml(path.join(projectRoot, "semantic-tokens.yaml"), projectSt);

  console.log("promoted", reqTokens.length, "REQ stacks + minted closure tokens");
}

main();
