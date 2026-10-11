#!/usr/bin/env node
/**
 * [REQ-TIED_QMM_METHODOLOGY_CLIENT_RESOURCES] [REQ-METHODOLOGY-LEARNING-COHORT-EXPORT] [IMPL-TIED_FILES]
 * Phase-2 QMM cohort export corpus promotion + bundle envelope-graph trim.
 */
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const projectRoot = path.join(repoRoot, "tied-project");
const bundleRoot = path.join(repoRoot, "tied-bundle");

const REQ = "REQ-METHODOLOGY-LEARNING-COHORT-EXPORT";
const ARCH = "ARCH-METHODOLOGY-LEARNING-COHORT-EXPORT";
const IMPL = "IMPL-METHODOLOGY-LEARNING-COHORT-EXPORT";
const TOKENS = [REQ, ARCH, IMPL];

const ENVELOPE_REQ = "REQ-REQUEST_EVIDENCE_ENVELOPE";
const BUNDLE_GRAPH_NOTE =
  "Fleet bundle graph: REQ-REQUEST_EVIDENCE_ENVELOPE depends_on omitted from bundle index (store depends_on retained). Optional envelope batch coupling at runtime in full clients.";

function loadYaml(p) {
  return yaml.load(fs.readFileSync(p, "utf8")) ?? {};
}

function writeYaml(p, doc) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, yaml.dump(doc, { lineWidth: 120, noRefs: true }), "utf8");
}

/** @param {Record<string, unknown>} record */
function applyEnvelopeGraphTrim(record) {
  if (!record || typeof record !== "object") return record;
  const rr = record.related_requirements;
  if (!rr || typeof rr !== "object") return record;
  const depends = Array.isArray(rr.depends_on) ? [...rr.depends_on] : [];
  const related = Array.isArray(rr.related_to) ? [...rr.related_to] : [];
  if (!depends.includes(ENVELOPE_REQ) && !related.includes(ENVELOPE_REQ)) return record;
  rr.depends_on = depends.filter((t) => t !== ENVELOPE_REQ);
  rr.related_to = related.filter((t) => t !== ENVELOPE_REQ);
  record.metadata = record.metadata ?? {};
  if (typeof record.metadata === "object") {
    record.metadata.bundle_graph_note = BUNDLE_GRAPH_NOTE;
  }
  return record;
}

function trimReqDetailForBundle(doc) {
  const out = structuredClone(doc);
  const inner = out[REQ]?.[REQ] ?? out[REQ];
  if (inner && typeof inner === "object") {
    applyEnvelopeGraphTrim(inner);
    if (out[REQ]?.[REQ]) out[REQ][REQ] = inner;
    else out[REQ] = inner;
  }
  return out;
}

function trimIndexReqForBundle(entry) {
  const out = structuredClone(entry);
  applyEnvelopeGraphTrim(out);
  return out;
}

function mergeIndex(bundleIndexPath, projectIndexPath, token, { trimReqGraph = false } = {}) {
  const bundle = loadYaml(bundleIndexPath);
  const project = loadYaml(projectIndexPath);
  let row = project[token];
  if (!row) throw new Error(`missing project index row ${token}`);
  if (trimReqGraph && token === REQ) row = trimIndexReqForBundle(row);
  bundle[token] = row;
  writeYaml(bundleIndexPath, bundle);
}

function trimCohortPseudocodeForBundle(content) {
  return content.replace(
    "# [IMPL-METHODOLOGY-LEARNING-COHORT-EXPORT] [IMPL-REQUEST_EVIDENCE_ENVELOPE_BATCH] [REQ-REQUEST_EVIDENCE_ENVELOPE]",
    "# [IMPL-METHODOLOGY-LEARNING-COHORT-EXPORT] [ARCH-TIED_CLIENT_METHODOLOGY_RESOURCE_MANIFEST] [REQ-TIED_QMM_METHODOLOGY_CLIENT_RESOURCES] — fleet bundle omits envelope stack tokens; store sidecar retains full traceability",
  );
}

function copyDetail(relFromProject, { trimCohortReq = false, trimCohortPseudo = false } = {}) {
  const src = path.join(projectRoot, relFromProject);
  const dest = path.join(bundleRoot, relFromProject);
  if (!fs.existsSync(src)) throw new Error(`missing project detail: ${src}`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (trimCohortReq && relFromProject === `requirements/${REQ}.yaml`) {
    writeYaml(dest, trimReqDetailForBundle(loadYaml(src)));
    return;
  }
  if (trimCohortPseudo && relFromProject === `implementation-decisions/${IMPL}-pseudocode.md`) {
    fs.writeFileSync(dest, trimCohortPseudocodeForBundle(fs.readFileSync(src, "utf8")), "utf8");
    return;
  }
  fs.copyFileSync(src, dest);
}

function mergeSemanticTokens() {
  const projectSt = loadYaml(path.join(projectRoot, "semantic-tokens.yaml"));
  const bundleSt = loadYaml(path.join(bundleRoot, "semantic-tokens.yaml"));
  for (const token of TOKENS) {
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
        description: `Promoted ${token} (phase-2 QMM cohort export bundle)`,
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
}

function main() {
  mergeIndex(
    path.join(bundleRoot, "requirements.yaml"),
    path.join(projectRoot, "requirements.yaml"),
    REQ,
    { trimReqGraph: true },
  );
  mergeIndex(
    path.join(bundleRoot, "architecture-decisions.yaml"),
    path.join(projectRoot, "architecture-decisions.yaml"),
    ARCH,
  );
  mergeIndex(
    path.join(bundleRoot, "implementation-decisions.yaml"),
    path.join(projectRoot, "implementation-decisions.yaml"),
    IMPL,
  );

  copyDetail(`requirements/${REQ}.yaml`, { trimCohortReq: true });
  copyDetail(`architecture-decisions/${ARCH}.yaml`);
  copyDetail(`implementation-decisions/${IMPL}.yaml`);
  copyDetail(`implementation-decisions/${IMPL}-pseudocode.md`, { trimCohortPseudo: true });

  mergeSemanticTokens();

  for (const rel of [
    "requirements/REQ-TIED_QMM_METHODOLOGY_CLIENT_RESOURCES.yaml",
    "architecture-decisions/ARCH-TIED_CLIENT_METHODOLOGY_RESOURCE_MANIFEST.yaml",
  ]) {
    const src = path.join(projectRoot, rel);
    const dest = path.join(bundleRoot, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }

  console.log("promoted phase-2 cohort export stack with bundle envelope-graph trim");
}

main();
