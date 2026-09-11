/**
 * [IMPL-REQUEST_EVIDENCE_ENVELOPE] [ARCH-REQUEST_EVIDENCE_ENVELOPE] [REQ-REQUEST_EVIDENCE_ENVELOPE]
 * BUILD_REQUEST_EVIDENCE_ENVELOPE — read-only working-folder scan.
 */

import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

import {
  validateFindingDisposition,
  validateProvenanceComplete,
  type GatePhase,
} from "../checklist-validator.js";
import { resolveProjectIdentity } from "../project-identity.js";
import { mapCorpusInventoryString } from "./gap-codes.js";
import { detectProcessAdherenceGaps } from "./process-adherence-gaps.js";
import { normalizeEnvelope, serializeEnvelope } from "./normalize.js";
import type {
  ArtifactKind,
  ArtifactStatus,
  BuildRequestEvidenceEnvelopeInput,
  BuildRequestEvidenceEnvelopeResult,
  DepthTier,
  EnvelopeArtifact,
  EnvelopeGap,
  EnvelopeRun,
  RequestEvidenceEnvelope,
} from "./types.js";
import { ENVELOPE_SCHEMA_VERSION } from "./types.js";

const REQUEST_TOKEN_RE = /^REQ-[A-Z0-9][A-Z0-9_-]*$/u;
const PHASE_DIR_RE = /^phase-(pre_implementation|verification|close_out)$/u;
const INQUIRY_ARTIFACTS = [
  "evidence-provenance.json",
  "obligation-report.json",
  "gate-result.json",
  "finding-ledger.jsonl",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function contentHashHex(contents: string | Buffer): string {
  const hash = createHash("sha256").update(contents).digest("hex");
  return `sha256:${hash}`;
}

function relPath(projectRoot: string, absolute: string): string {
  return path.relative(projectRoot, absolute).split(path.sep).join("/");
}

async function readOptional(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

async function fileHash(filePath: string): Promise<string | null> {
  const contents = await readOptional(filePath);
  return contents == null ? null : contentHashHex(contents);
}

function classifyInquiryArtifact(filename: string): ArtifactKind | null {
  switch (filename) {
    case "evidence-provenance.json":
      return "adversarial_inquiry_provenance";
    case "obligation-report.json":
      return "adversarial_inquiry_obligation";
    case "gate-result.json":
      return "adversarial_inquiry_gate";
    case "finding-ledger.jsonl":
      return "adversarial_inquiry_ledger";
    default:
      return null;
  }
}

function parsePhaseFromDir(name: string): GatePhase | null {
  const match = PHASE_DIR_RE.exec(name);
  return match ? (match[1] as GatePhase) : null;
}

async function readSchemaVersion(filePath: string): Promise<string | null> {
  const contents = await readOptional(filePath);
  if (!contents) return null;
  try {
    const doc = JSON.parse(contents) as Record<string, unknown>;
    const version = doc.schema_version ?? doc.schemaVersion;
    return typeof version === "string" ? version : null;
  } catch {
    return null;
  }
}

type DiscoveredFile = {
  absolute: string;
  relative: string;
  kind: ArtifactKind;
  phase: GatePhase | null;
  status: ArtifactStatus;
  proof_boundaries: string[];
};

const INQUIRY_ARTIFACT_KINDS = new Set<ArtifactKind>([
  "adversarial_inquiry_gate",
  "adversarial_inquiry_ledger",
  "adversarial_inquiry_provenance",
  "adversarial_inquiry_obligation",
]);

function inferGateReceiptPhase(filename: string): GatePhase | null {
  if (filename.includes("verification")) return "verification";
  if (filename.includes("close_out")) return "close_out";
  if (filename.includes("pre_implementation") || filename.includes("pre-implementation")) {
    return "pre_implementation";
  }
  return null;
}

function gateReceiptPreferenceScore(relativePath: string): number {
  const base = path.basename(relativePath);
  if (base.startsWith("wave5-")) return 100;
  return 0;
}

async function dedupeGateReceiptDiscoveries(discovered: DiscoveredFile[]): Promise<DiscoveredFile[]> {
  const gateReceipts = discovered.filter(
    (item) => item.kind === "checklist_gate_receipt" && item.phase != null,
  );
  const others = discovered.filter(
    (item) => !(item.kind === "checklist_gate_receipt" && item.phase != null),
  );
  const byPhase = new Map<GatePhase, DiscoveredFile[]>();
  for (const item of gateReceipts) {
    const phase = item.phase as GatePhase;
    const list = byPhase.get(phase) ?? [];
    list.push(item);
    byPhase.set(phase, list);
  }
  const kept: DiscoveredFile[] = [];
  for (const items of byPhase.values()) {
    const ranked = await Promise.all(items.map(async (item) => ({
      item,
      score: gateReceiptPreferenceScore(item.relative),
      mtime: (await fs.stat(item.absolute)).mtimeMs,
    })));
    ranked.sort((a, b) => b.score - a.score || b.mtime - a.mtime);
    kept.push(ranked[0].item);
  }
  return [...others, ...kept];
}

async function discoverWorkingArtifacts(
  projectRoot: string,
  requestToken: string,
): Promise<DiscoveredFile[]> {
  const workingRoot = path.join(projectRoot, "working", requestToken);
  const discovered: DiscoveredFile[] = [];
  const inquiryRoot = path.join(workingRoot, "adversarial-inquiry");
  let hasPhaseDirs = false;

  try {
    const inquiryEntries = await fs.readdir(inquiryRoot, { withFileTypes: true });
    for (const entry of inquiryEntries) {
      if (entry.isDirectory() && parsePhaseFromDir(entry.name)) {
        hasPhaseDirs = true;
        const phase = parsePhaseFromDir(entry.name)!;
        for (const filename of INQUIRY_ARTIFACTS) {
          const absolute = path.join(inquiryRoot, entry.name, filename);
          if (await readOptional(absolute)) {
            const kind = classifyInquiryArtifact(filename)!;
            discovered.push({
              absolute,
              relative: relPath(projectRoot, absolute),
              kind,
              phase,
              status: "present",
              proof_boundaries: kind === "adversarial_inquiry_provenance" ? ["provenance_identity"] : ["gate_decision_only"],
            });
          }
        }
      }
    }
    for (const entry of inquiryEntries) {
      if (entry.isFile() && INQUIRY_ARTIFACTS.includes(entry.name as (typeof INQUIRY_ARTIFACTS)[number])) {
        const absolute = path.join(inquiryRoot, entry.name);
        const kind = classifyInquiryArtifact(entry.name)!;
        discovered.push({
          absolute,
          relative: relPath(projectRoot, absolute),
          kind,
          phase: null,
          status: hasPhaseDirs ? "stale_projection" : "present",
          proof_boundaries: ["discovery_only"],
        });
      }
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  const trackerPath = path.join(workingRoot, "agent-req-implementation-checklist.yaml");
  if (await readOptional(trackerPath)) {
    discovered.push({
      absolute: trackerPath,
      relative: relPath(projectRoot, trackerPath),
      kind: "checklist_tracker",
      phase: null,
      status: "present",
      proof_boundaries: ["tracker_disposition_only"],
    });
  }

  const citdpWorking = path.join(workingRoot, `CITDP-${requestToken}.yaml`);
  if (await readOptional(citdpWorking)) {
    discovered.push({
      absolute: citdpWorking,
      relative: relPath(projectRoot, citdpWorking),
      kind: "citdp_record",
      phase: null,
      status: "present",
      proof_boundaries: ["citdp_snapshot_only"],
    });
  }

  const citdpTied = path.join(projectRoot, "tied", "citdp", `CITDP-${requestToken}.yaml`);
  if (await readOptional(citdpTied)) {
    discovered.push({
      absolute: citdpTied,
      relative: relPath(projectRoot, citdpTied),
      kind: "citdp_record",
      phase: null,
      status: "present",
      proof_boundaries: ["citdp_snapshot_only"],
    });
  }

  const gatesDir = path.join(workingRoot, "gates");
  try {
    const gateFiles = await fs.readdir(gatesDir);
    for (const name of gateFiles.filter((item) => item.endsWith(".json"))) {
      const absolute = path.join(gatesDir, name);
      discovered.push({
        absolute,
        relative: relPath(projectRoot, absolute),
        kind: "checklist_gate_receipt",
        phase: inferGateReceiptPhase(name),
        status: "present",
        proof_boundaries: ["gate_decision_only"],
      });
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  const evidenceDir = path.join(workingRoot, "evidence");
  try {
    const evidenceEntries = await fs.readdir(evidenceDir, { withFileTypes: true });
    for (const entry of evidenceEntries) {
      if (!entry.isFile()) continue;
      const name = entry.name;
      const absolute = path.join(evidenceDir, name);
      let kind: ArtifactKind = "unknown";
      if (name === "request-evidence-envelope.v1.json") kind = "request_evidence_envelope";
      else if (name.includes("verification-evidence-manifest")) kind = "verification_evidence_manifest";
      else if (name.includes("not-applicable-receipt")) kind = "not_applicable_receipt";
      else if (name.includes("evidence-chain-profile")) kind = "evidence_chain_profile";
      discovered.push({
        absolute,
        relative: relPath(projectRoot, absolute),
        kind,
        phase: null,
        status: "present",
        proof_boundaries: kind === "unknown" ? ["discovery_only"] : ["artifact_presence_only"],
      });
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  const psaRoot = path.join(workingRoot, "pseudocode-analysis");
  try {
    const psaEntries = await fs.readdir(psaRoot);
    for (const name of psaEntries.filter((item) => item.endsWith(".v1.json"))) {
      const absolute = path.join(psaRoot, name);
      if (await readOptional(absolute)) {
        discovered.push({
          absolute,
          relative: relPath(projectRoot, absolute),
          kind: "pseudocode_analysis_report",
          phase: null,
          status: "present",
          proof_boundaries: ["pseudocode_gate_only"],
        });
      }
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  const legacyWrapper = path.join(workingRoot, "citdp-closeout.json");
  if (await readOptional(legacyWrapper)) {
    discovered.push({
      absolute: legacyWrapper,
      relative: relPath(projectRoot, legacyWrapper),
      kind: "unknown",
      phase: null,
      status: "present",
      proof_boundaries: ["discovery_only"],
    });
  }

  return dedupeGateReceiptDiscoveries(discovered);
}

async function toEnvelopeArtifacts(discovered: DiscoveredFile[]): Promise<EnvelopeArtifact[]> {
  const artifacts: EnvelopeArtifact[] = [];
  for (const item of discovered) {
    const hash = await fileHash(item.absolute);
    if (!hash) continue;
    artifacts.push({
      kind: item.kind,
      schema_version: await readSchemaVersion(item.absolute),
      path: item.relative,
      content_hash: hash,
      phase: item.phase,
      status: item.status,
      proof_boundaries: item.proof_boundaries,
    });
  }
  return artifacts;
}

function gapFromCode(
  code: string,
  detail: string,
  options: Partial<EnvelopeGap> = {},
): EnvelopeGap {
  return {
    code,
    artifact_kind: options.artifact_kind ?? null,
    phase: options.phase ?? null,
    detail,
    severity: options.severity ?? "error",
    source: options.source,
  };
}

async function detectGaps(input: {
  projectRoot: string;
  requestToken: string;
  artifacts: EnvelopeArtifact[];
  depthTier: DepthTier;
  gatePolicy?: string;
  corpusInventory?: string[];
}): Promise<EnvelopeGap[]> {
  const gaps: EnvelopeGap[] = [];
  const workingRoot = path.join(input.projectRoot, "working", input.requestToken);

  for (const inventory of input.corpusInventory ?? []) {
    gaps.push(
      gapFromCode(mapCorpusInventoryString(inventory), inventory, {
        source: "corpus-manifest",
        severity: "error",
      }),
    );
  }

  for (const artifact of input.artifacts) {
    if (artifact.status === "stale_projection") {
      gaps.push(
        gapFromCode("artifact_path_root_projection_rejected", `Root projection stale: ${artifact.path}`, {
          artifact_kind: artifact.kind,
          phase: artifact.phase,
          source: "discovery",
        }),
      );
    }
    if (artifact.path.endsWith("citdp-closeout.json")) {
      gaps.push(
        gapFromCode("legacy_json_in_json_wrapper", "citdp-closeout.json wrapper detected", {
          artifact_kind: "unknown",
          source: "discovery",
        }),
      );
    }
  }

  async function readInquiryRunId(phase: GatePhase): Promise<string | null> {
    const provenancePath = path.join(
      workingRoot,
      "adversarial-inquiry",
      `phase-${phase}`,
      "evidence-provenance.json",
    );
    const contents = await readOptional(provenancePath);
    if (!contents) return null;
    try {
      const doc = JSON.parse(contents) as Record<string, unknown>;
      const envelope = isRecord(doc.provenance) ? doc.provenance : doc;
      const runId = envelope.run_id ?? envelope.runId;
      return typeof runId === "string" && runId.trim().length > 0 ? runId.trim() : null;
    } catch {
      return null;
    }
  }

  const phaseArtifacts = input.artifacts.filter((a) => a.phase != null);
  const hashByInquiryKind = new Map<string, { hash: string; phase: GatePhase }>();
  const inquiryRunIdCache = new Map<GatePhase, string | null>();
  const cachedInquiryRunId = async (phase: GatePhase): Promise<string | null> => {
    if (!inquiryRunIdCache.has(phase)) {
      inquiryRunIdCache.set(phase, await readInquiryRunId(phase));
    }
    return inquiryRunIdCache.get(phase) ?? null;
  };
  for (const artifact of phaseArtifacts) {
    if (!INQUIRY_ARTIFACT_KINDS.has(artifact.kind) || artifact.phase == null) continue;
    const prior = hashByInquiryKind.get(artifact.kind);
    if (prior && prior.hash === artifact.content_hash && prior.phase !== artifact.phase) {
      const priorRunId = await cachedInquiryRunId(prior.phase);
      const currentRunId = await cachedInquiryRunId(artifact.phase);
      const distinctRuns = priorRunId && currentRunId && priorRunId !== currentRunId;
      if (!distinctRuns) {
        gaps.push(
          gapFromCode("evidence_stale", `Identical hash across phases for ${artifact.kind}`, {
            artifact_kind: artifact.kind,
            phase: artifact.phase,
            source: "hash-compare",
          }),
        );
      }
    }
    hashByInquiryKind.set(artifact.kind, {
      hash: artifact.content_hash,
      phase: artifact.phase,
    });
  }

  for (const phase of ["pre_implementation", "verification", "close_out"] as GatePhase[]) {
    const provenancePath = path.join(
      workingRoot,
      "adversarial-inquiry",
      `phase-${phase}`,
      "evidence-provenance.json",
    );
    const provenanceContents = await readOptional(provenancePath);
    if (provenanceContents) {
      try {
        const provenance = JSON.parse(provenanceContents) as unknown;
        const result = validateProvenanceComplete(provenance);
        if (!result.ok) {
          gaps.push(
            gapFromCode("provenance_incomplete", result.diagnostics.join("; "), {
              artifact_kind: "adversarial_inquiry_provenance",
              phase,
              source: "A3",
            }),
          );
        }
      } catch {
        gaps.push(
          gapFromCode("provenance_incomplete", "Malformed evidence-provenance.json", {
            artifact_kind: "adversarial_inquiry_provenance",
            phase,
            source: "A3",
          }),
        );
      }
    }

    const gatePath = path.join(workingRoot, "adversarial-inquiry", `phase-${phase}`, "gate-result.json");
    const ledgerPath = path.join(workingRoot, "adversarial-inquiry", `phase-${phase}`, "finding-ledger.jsonl");
    const gateContents = await readOptional(gatePath);
    const ledgerContents = await readOptional(ledgerPath);
    if (gateContents || ledgerContents) {
      let gateResult: unknown;
      if (gateContents) {
        try {
          gateResult = JSON.parse(gateContents) as unknown;
        } catch {
          gateResult = undefined;
        }
      }
      const findingResult = validateFindingDisposition({
        gateResult,
        findingLedger: ledgerContents ?? undefined,
        gatePolicy: input.gatePolicy,
      });
      const findingDiagnostics = findingResult.advisoryDiagnostics ?? findingResult.diagnostics;
      if (!findingResult.ok || findingResult.advisoryDiagnostics?.length) {
        for (const diagnostic of findingDiagnostics) {
          if (diagnostic === "finding_unresolved" || diagnostic === "warn_not_success") {
            gaps.push(
              gapFromCode("finding_unresolved", diagnostic, {
                artifact_kind: "adversarial_inquiry_gate",
                phase,
                source: "A5",
                severity: input.gatePolicy === "advisory" ? "warn" : "error",
              }),
            );
          }
        }
      }
    }
  }

  if (input.depthTier === "minimal") {
    const naReceipt = input.artifacts.some((a) => a.kind === "not_applicable_receipt");
    if (!naReceipt) {
      gaps.push(
        gapFromCode("not_applicable_receipt_missing", "Minimal depth without not-applicable-receipt", {
          source: "depth-contract",
        }),
      );
    }
  }

  const profileArtifact = input.artifacts.find((a) => a.kind === "evidence_chain_profile");
  if (input.depthTier === "integrated" || input.depthTier === "strict_candidate") {
    if (!profileArtifact) {
      gaps.push(
        gapFromCode("expected_artifact_missing", "Integrated depth expects evidence-chain-profile artifact", {
          artifact_kind: "evidence_chain_profile",
          source: "profile-cross-link",
        }),
      );
    }
  }

  const trackerPath = path.join(workingRoot, "agent-req-implementation-checklist.yaml");
  const trackerContents = await readOptional(trackerPath);
  let trackerDoc: Record<string, unknown> | null = null;
  if (trackerContents) {
    try {
      const parsed = yaml.load(trackerContents);
      trackerDoc = isRecord(parsed) ? parsed : null;
    } catch {
      trackerDoc = null;
    }
  }
  const trackerArtifact = input.artifacts.find((a) => a.kind === "checklist_tracker");
  const processGaps = await detectProcessAdherenceGaps({
    projectRoot: input.projectRoot,
    requestToken: input.requestToken,
    tracker: trackerDoc,
    artifacts: input.artifacts,
    currentTrackerHash: trackerArtifact?.content_hash ?? null,
    depthTier: input.depthTier,
  });
  gaps.push(...processGaps);

  const seen = new Set<string>();
  return gaps.filter((gap) => {
    const key = `${gap.code}:${gap.phase}:${gap.detail}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractRuns(artifacts: EnvelopeArtifact[]): EnvelopeRun[] {
  const runs: EnvelopeRun[] = [];
  for (const artifact of artifacts) {
    if (artifact.kind !== "adversarial_inquiry_provenance" || !artifact.phase) continue;
    runs.push({
      run_id: `run-${artifact.phase}`,
      phase: artifact.phase,
      started_at: null,
      generator: "request_evidence_envelope_build",
    });
  }
  return runs;
}

export async function buildRequestEvidenceEnvelope(
  input: BuildRequestEvidenceEnvelopeInput,
): Promise<BuildRequestEvidenceEnvelopeResult> {
  if (!REQUEST_TOKEN_RE.test(input.request_token)) {
    return { ok: false, stage: "identity", error: "InvalidRequestToken" };
  }
  const resolvedTied = path.resolve(input.tied_base_path);
  const confirmed = path.resolve(input.confirmed_tied_base_path);
  if (resolvedTied !== confirmed) {
    return { ok: false, stage: "identity", error: "WrongTiedBasePath" };
  }

  const projectRoot = path.resolve(input.project_root);
  const workingRoot = path.join(projectRoot, "working", input.request_token);
  try {
    await fs.access(workingRoot);
  } catch {
    return { ok: false, stage: "discover", error: "WorkingFolderMissing" };
  }

  const discovered = await discoverWorkingArtifacts(projectRoot, input.request_token);
  const artifacts = await toEnvelopeArtifacts(discovered);
  const depthTier = input.depth_tier ?? "integrated";
  const gaps = await detectGaps({
    projectRoot,
    requestToken: input.request_token,
    artifacts,
    depthTier,
    gatePolicy: input.gate_policy,
    corpusInventory: input.corpus_inventory,
  });

  const tracker = artifacts.find((a) => a.kind === "checklist_tracker");
  const citdp = artifacts.find((a) => a.kind === "citdp_record" && a.path.includes("working/"));
  const profile = artifacts.find((a) => a.kind === "evidence_chain_profile");

  const identity = resolveProjectIdentity(resolvedTied);
  const envelope: RequestEvidenceEnvelope = normalizeEnvelope({
    schema_version: ENVELOPE_SCHEMA_VERSION,
    envelope_meta: {
      generated_at: input.generated_at ?? new Date().toISOString(),
      generator: "request_evidence_envelope_build",
      revision: 1,
    },
    identity: {
      request_token: input.request_token,
      project_id: identity.project_id,
      depth_tier: depthTier,
      gate_policy: input.gate_policy ?? "advisory",
      methodology_snapshot_id: "3.0.0",
    },
    runs: extractRuns(artifacts),
    artifacts,
    cross_links: {
      tracker_path: tracker?.path ?? null,
      tracker_hash: tracker?.content_hash ?? null,
      citdp_path: citdp?.path ?? null,
      evidence_chain_profile_path: profile?.path ?? null,
    },
    gaps,
  });

  if (input.output_mode === "file") {
    const envelopePath = path.join(workingRoot, "evidence", "request-evidence-envelope.v1.json");
    await fs.mkdir(path.dirname(envelopePath), { recursive: true });
    await fs.writeFile(envelopePath, serializeEnvelope(envelope), "utf8");
    return { ok: true, envelope, envelope_path: relPath(projectRoot, envelopePath) };
  }

  return { ok: true, envelope };
}
