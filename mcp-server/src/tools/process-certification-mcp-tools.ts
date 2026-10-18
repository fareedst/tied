/**
 * [REQ-TIED_PROCESS_CERTIFICATION_READINESS] read-only MCP tools
 */

import { z } from "zod";
import path from "node:path";
import { textContent } from "../types.js";
import { runAdaptiveEffectivenessExperimentV1 } from "../process-certification-readiness/adaptive-experiment.js";
import { evaluateCapabilityProfileV1 } from "../process-certification-readiness/capability-model.js";
import { evaluateConformanceMatrixV1 } from "../process-certification-readiness/conformance-engine.js";
import {
  buildAssessorAgreementReportV1,
  loadIndependentAssessmentRecordFromFile,
} from "../process-certification-readiness/independent-assessment.js";
import {
  composeCertifiabilityReadinessV1,
  generateAssessorPackV1,
} from "../process-certification-readiness/readiness-report.js";
import {
  defaultBundleRoot,
  loadProcessCertificationBundleV1,
} from "../process-certification-readiness/spec-loader.js";
import type { EdseProcessRecordV1 } from "../process-certification-readiness/types.js";

export const processCertificationMcpTools = [
  {
    name: "tied_certification_spec_validate",
    config: {
      description: "Validate EDSE spec, mappings, capability model, and conformance catalog. [REQ-TIED_PROCESS_CERTIFICATION_READINESS]",
      inputSchema: z.object({
        bundle_root: z.string().optional(),
      }),
    },
    handler: async (args: { bundle_root?: string }) => {
      const root = args.bundle_root ? path.resolve(args.bundle_root) : defaultBundleRoot();
      const result = loadProcessCertificationBundleV1(root);
      return textContent(JSON.stringify(result, null, 2));
    },
  },
  {
    name: "tied_certification_conformance_evaluate",
    config: {
      description: "Evaluate process record conformance matrix. [REQ-TIED_PROCESS_CERTIFICATION_READINESS]",
      inputSchema: z.object({
        process_record: z.record(z.unknown()),
        bundle_root: z.string().optional(),
      }),
    },
    handler: async (args: { process_record: Record<string, unknown>; bundle_root?: string }) => {
      const root = args.bundle_root ? path.resolve(args.bundle_root) : defaultBundleRoot();
      const bundle = loadProcessCertificationBundleV1(root);
      if (!bundle.ok || !bundle.bundle) {
        return textContent(JSON.stringify(bundle, null, 2));
      }
      const result = evaluateConformanceMatrixV1({
        record: args.process_record as EdseProcessRecordV1,
        catalog: bundle.bundle.catalog,
        specContentHash: bundle.bundle.spec.content_hash,
      });
      return textContent(JSON.stringify(result, null, 2));
    },
  },
  {
    name: "tied_certification_capability_evaluate",
    config: {
      description: "Evaluate seven-dimension capability profile. [REQ-TIED_PROCESS_CERTIFICATION_READINESS]",
      inputSchema: z.object({
        process_record: z.record(z.unknown()),
        bundle_root: z.string().optional(),
        options: z.record(z.unknown()).optional(),
      }),
    },
    handler: async (args: {
      process_record: Record<string, unknown>;
      bundle_root?: string;
      options?: Record<string, unknown>;
    }) => {
      const root = args.bundle_root ? path.resolve(args.bundle_root) : defaultBundleRoot();
      const bundle = loadProcessCertificationBundleV1(root);
      if (!bundle.ok || !bundle.bundle) {
        return textContent(JSON.stringify(bundle, null, 2));
      }
      const result = evaluateCapabilityProfileV1({
        record: args.process_record as EdseProcessRecordV1,
        model: bundle.bundle.capabilityModel,
        specContentHash: bundle.bundle.spec.content_hash,
        options: args.options as never,
      });
      return textContent(JSON.stringify(result, null, 2));
    },
  },
  {
    name: "tied_certification_independent_assess",
    config: {
      description: "Validate assessor records and emit agreement report. [REQ-TIED_PROCESS_CERTIFICATION_READINESS]",
      inputSchema: z.object({
        record_paths: z.array(z.string()).min(1),
        author_identity: z.string(),
      }),
    },
    handler: async (args: { record_paths: string[]; author_identity: string }) => {
      const records = args.record_paths.map((p) =>
        loadIndependentAssessmentRecordFromFile(path.resolve(p), args.author_identity),
      );
      const failed = records.find((r) => !r.ok);
      if (failed) return textContent(JSON.stringify({ ok: false, records }, null, 2));
      const agreement = buildAssessorAgreementReportV1(records.map((r) => r.record!));
      return textContent(JSON.stringify({ ok: agreement.ok, records, agreement }, null, 2));
    },
  },
  {
    name: "tied_certification_adaptive_experiment_run",
    config: {
      description: "Run bounded three-arm adaptive effectiveness experiment. [REQ-TIED_PROCESS_CERTIFICATION_READINESS]",
      inputSchema: z.object({
        fixture_root: z.string(),
        held_out_case_ids: z.array(z.string()).optional(),
      }),
    },
    handler: async (args: { fixture_root: string; held_out_case_ids?: string[] }) => {
      const result = runAdaptiveEffectivenessExperimentV1({
        fixtureRoot: path.resolve(args.fixture_root),
        heldOutCaseIds: args.held_out_case_ids,
      });
      return textContent(JSON.stringify(result, null, 2));
    },
  },
  {
    name: "tied_certification_readiness_report_compose",
    config: {
      description: "Compose certifiability-readiness.v1. [REQ-TIED_PROCESS_CERTIFICATION_READINESS]",
      inputSchema: z.object({
        matrix: z.record(z.unknown()),
        profile: z.record(z.unknown()),
        agreement: z.record(z.unknown()).optional(),
        adaptive: z.record(z.unknown()).optional(),
      }),
    },
    handler: async (args: {
      matrix: Record<string, unknown>;
      profile: Record<string, unknown>;
      agreement?: Record<string, unknown>;
      adaptive?: Record<string, unknown>;
    }) => {
      const result = composeCertifiabilityReadinessV1({
        matrix: args.matrix as never,
        profile: args.profile as never,
        agreement: args.agreement as never,
        adaptive: args.adaptive as never,
      });
      return textContent(JSON.stringify(result, null, 2));
    },
  },
  {
    name: "tied_certification_assessor_pack_generate",
    config: {
      description: "Generate assessor-pack.v1. [REQ-TIED_PROCESS_CERTIFICATION_READINESS]",
      inputSchema: z.object({
        readiness: z.record(z.unknown()),
        bundle_spec_version: z.string(),
      }),
    },
    handler: async (args: { readiness: Record<string, unknown>; bundle_spec_version: string }) => {
      const pack = generateAssessorPackV1({
        readiness: args.readiness as never,
        bundleSpecVersion: args.bundle_spec_version,
      });
      return textContent(JSON.stringify({ ok: true, pack }, null, 2));
    },
  },
];
