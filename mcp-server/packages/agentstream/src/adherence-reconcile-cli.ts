/**
 * [IMPL-TIED_UNIFIED_TOOLCHAIN] [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT]
 * CLI surface matching Go cmd/adherence-reconcile.
 */
import fs from "node:fs";

import yaml from "js-yaml";

import { computeProcessGrade } from "./adherence-process-grade.js";
import { reconcileAdherenceChain, type ReconcileReport } from "./adherence-reconcile.js";

export type AdherenceReconcileCliOptions = {
  ledger: string;
  tracker: string;
  gatesDir: string;
  workspace: string;
  citdpPath: string;
  requirementsIndex: string;
  implementationIndex: string;
  includeProcessGrade: boolean;
};

function loadOptionalYaml(filePath: string): Record<string, unknown> {
  const p = filePath.trim();
  if (!p) return {};
  const data = fs.readFileSync(p, "utf8");
  const doc = yaml.load(data) as Record<string, unknown>;
  if (!doc || typeof doc !== "object") {
    throw new Error(`invalid_yaml: ${p}`);
  }
  return doc;
}

export function parseAdherenceReconcileArgv(args: string[]): AdherenceReconcileCliOptions {
  const opts: AdherenceReconcileCliOptions = {
    ledger: "",
    tracker: "",
    gatesDir: "",
    workspace: "",
    citdpPath: "",
    requirementsIndex: "",
    implementationIndex: "",
    includeProcessGrade: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    const next = () => {
      const v = args[i + 1];
      if (v === undefined || v.startsWith("-")) {
        throw new Error(`missing value for ${arg}`);
      }
      i += 1;
      return v;
    };
    if (arg === "--ledger" || arg.startsWith("--ledger=")) {
      opts.ledger = arg.includes("=") ? arg.split("=")[1]! : next();
    } else if (arg === "--tracker" || arg.startsWith("--tracker=")) {
      opts.tracker = arg.includes("=") ? arg.split("=")[1]! : next();
    } else if (arg === "--gates-dir" || arg.startsWith("--gates-dir=")) {
      opts.gatesDir = arg.includes("=") ? arg.split("=")[1]! : next();
    } else if (arg === "--workspace" || arg.startsWith("--workspace=")) {
      opts.workspace = arg.includes("=") ? arg.split("=")[1]! : next();
    } else if (arg === "--citdp" || arg.startsWith("--citdp=")) {
      opts.citdpPath = arg.includes("=") ? arg.split("=")[1]! : next();
    } else if (arg === "--requirements-index" || arg.startsWith("--requirements-index=")) {
      opts.requirementsIndex = arg.includes("=") ? arg.split("=")[1]! : next();
    } else if (arg === "--implementation-index" || arg.startsWith("--implementation-index=")) {
      opts.implementationIndex = arg.includes("=") ? arg.split("=")[1]! : next();
    } else if (arg === "--include-process-grade") {
      opts.includeProcessGrade = true;
    }
  }

  if (!opts.tracker.trim()) {
    throw new Error("tracker_required");
  }
  return opts;
}

export function runAdherenceReconcileCli(args: string[]): {
  exitCode: number;
  stdout: string;
  stderr: string;
} {
  let opts: AdherenceReconcileCliOptions;
  try {
    opts = parseAdherenceReconcileArgv(args);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg === "tracker_required") {
      return {
        exitCode: 2,
        stderr: "DIAGNOSTIC: --tracker is required\n",
        stdout: "",
      };
    }
    return { exitCode: 2, stderr: `DIAGNOSTIC: ${msg}\n`, stdout: "" };
  }

  let workspace = opts.workspace.trim();
  if (!workspace) {
    workspace = process.cwd();
  }

  let citdp: Record<string, unknown>;
  try {
    citdp = loadOptionalYaml(opts.citdpPath);
  } catch (err) {
    return {
      exitCode: 2,
      stderr: `DIAGNOSTIC: citdp load failed: ${String(err)}\n`,
      stdout: "",
    };
  }

  const tiedIndexes: {
    requirements?: Record<string, unknown>;
    implementation?: Record<string, unknown>;
  } = {};

  try {
    if (opts.requirementsIndex.trim()) {
      tiedIndexes.requirements = loadOptionalYaml(opts.requirementsIndex);
    }
    if (opts.implementationIndex.trim()) {
      tiedIndexes.implementation = loadOptionalYaml(opts.implementationIndex);
    }
  } catch (err) {
    const msg = String(err);
    if (msg.includes("requirements")) {
      return {
        exitCode: 2,
        stderr: `DIAGNOSTIC: requirements index load failed: ${msg}\n`,
        stdout: "",
      };
    }
    return {
      exitCode: 2,
      stderr: `DIAGNOSTIC: implementation index load failed: ${msg}\n`,
      stdout: "",
    };
  }

  let report: ReconcileReport;
  try {
    report = reconcileAdherenceChain({
      ledgerPath: opts.ledger.trim(),
      trackerPath: opts.tracker.trim(),
      gatesDir: opts.gatesDir.trim(),
      workspace,
      citdp,
      tiedIndexes,
    });
  } catch (err) {
    return {
      exitCode: 2,
      stderr: `DIAGNOSTIC: reconcile failed: ${String(err)}\n`,
      stdout: "",
    };
  }

  report.read_only = true;
  if (opts.includeProcessGrade) {
    report.process_grade = computeProcessGrade(
      {
        ledgerPath: opts.ledger.trim(),
        trackerPath: opts.tracker.trim(),
        gatesDir: opts.gatesDir.trim(),
        workspace,
        citdp,
        tiedIndexes,
      },
      report,
    );
  }

  const body = JSON.stringify(toSnakeReport(report));
  return { exitCode: 0, stdout: `${body}\n`, stderr: "" };
}

/** Match Go json field names (snake_case tags). */
function toSnakeReport(report: ReconcileReport): Record<string, unknown> {
  return {
    request_token: report.request_token,
    findings: report.findings.map((f) => ({
      code: f.code,
      ...(f.detail ? { detail: f.detail } : {}),
    })),
    ledger_rows: report.ledger_rows,
    read_only: report.read_only,
    ...(report.process_grade ? { process_grade: report.process_grade } : {}),
  };
}
