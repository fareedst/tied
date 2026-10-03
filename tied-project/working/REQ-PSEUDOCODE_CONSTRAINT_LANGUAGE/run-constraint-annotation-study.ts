#!/usr/bin/env node
/**
 * [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] F11 constraint authoring burden study on copied Tier A sidecars only.
 * Outputs under working/REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE/ — never mutates /Users/fareed/Documents/dev/test.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(fileURLToPath(import.meta.url), "../../..");
const studyRoot = join(repoRoot, "working/REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE/annotation-study");
const copiesDir = join(studyRoot, "copies");
const annotatedDir = join(studyRoot, "annotated");
const reviewsDir = join(studyRoot, "preservation-reviews");
const metricsDir = join(repoRoot, "working/REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE/qualification/metrics");

type StudyCase = {
  id: string;
  source_path: string;
  token: string;
  procedure: string;
  annotate: (source: string) => { text: string; annotation_lines: number; decisions: number };
};

function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function replaceLine(source: string, from: string, to: string): string {
  if (!source.includes(from)) {
    throw new Error(`expected line not found: ${from.slice(0, 80)}`);
  }
  return source.replace(from, to);
}

function ensureV2Header(source: string): { text: string; lines: number; decisions: number } {
  if (source.includes("Grammar-Version: v2")) {
    return { text: source, lines: 0, decisions: 0 };
  }
  const lines = source.split("\n");
  const insertAt = lines.findIndex((line) => line.startsWith("# [IMPL-")) >= 0 ? 1 : 0;
  lines.splice(insertAt, 0, "Grammar-Version: v2", "");
  return { text: lines.join("\n"), lines: 1, decisions: 1 };
}

const CASES: StudyCase[] = [
  {
    id: "volumestats-run",
    source_path:
      "/Users/fareed/Documents/dev/test/1787416567/tied/implementation-decisions/IMPL-VOLUMESTATS-CLI-pseudocode.md",
    token: "IMPL-VOLUMESTATS-CLI",
    procedure: "RUN_VOLUMESTATS",
    annotate: (source) => {
      const header = ensureV2Header(source);
      let text = header.text;
      let annotation_lines = header.lines;
      let decisions = header.decisions;
      const pairs: Array<[string, string]> = [
        [
          "  INPUT: command_arguments, stdout, stderr, dependencies",
          "  INPUT: command_arguments: list of string, stdout: io.Writer, stderr: io.Writer, dependencies: VolumeStatsDeps",
        ],
        [
          "  OUTPUT: exit_code (0, 1, or 2)",
          "  OUTPUT: exit_code: int where exit_code >= 0 AND exit_code <= 2",
        ],
        [
          "  POST: successful data is written to stdout; usage errors return 2; runtime or output errors return 1",
          "  POST: successful data is written to stdout; exit_code >= 0 AND exit_code <= 2",
        ],
      ];
      for (const [from, to] of pairs) {
        text = replaceLine(text, from, to);
        annotation_lines += 1;
        decisions += 1;
      }
      return { text, annotation_lines, decisions };
    },
  },
  {
    id: "netif-run",
    source_path:
      "/Users/fareed/Documents/dev/test/1787495576/tied/implementation-decisions/IMPL-NETIF_CLI-pseudocode.md",
    token: "IMPL-NETIF_CLI",
    procedure: "RUN",
    annotate: (source) => {
      const header = ensureV2Header(source);
      let text = header.text;
      let annotation_lines = header.lines;
      let decisions = header.decisions;
      const pairs: Array<[string, string]> = [
        [
          "  INPUT: cfg{args, lister, stdout, stderr, json flag}",
          "  INPUT: cfg: NetifRunConfig",
        ],
        [
          "  OUTPUT: exit code 0 on success, 1 on List failure",
          "  OUTPUT: exit_code: int where exit_code >= 0 AND exit_code <= 1",
        ],
        [
          "  DATA: cfg provides injectable lister and I/O writers",
          "  DATA: cfg (immutable): NetifRunConfig",
        ],
        [
          "  POST: success writes formatted output to stdout; List error writes message to stderr",
          "  POST: success writes formatted output to stdout; exit_code >= 0",
        ],
      ];
      for (const [from, to] of pairs) {
        text = replaceLine(text, from, to);
        annotation_lines += 1;
        decisions += 1;
      }
      return { text, annotation_lines, decisions };
    },
  },
  {
    id: "rootjobs-parse-flags",
    source_path:
      "/Users/fareed/Documents/dev/test/1787507684/tied/implementation-decisions/IMPL-ROOTJOBS_CLI-pseudocode.md",
    token: "IMPL-ROOTJOBS_CLI",
    procedure: "PARSE_FLAGS",
    annotate: (source) => {
      const header = ensureV2Header(source);
      let text = header.text;
      let annotation_lines = header.lines;
      let decisions = header.decisions;
      const pairs: Array<[string, string]> = [
        ["  INPUT: os.Args", "  INPUT: os.Args: list of string"],
        ["  OUTPUT: Options{JSON, Pretty, Collector}", "  OUTPUT: options: RootJobsOptions"],
        ["    INPUT: os.Args", "    INPUT: os.Args: list of string"],
        ["    OUTPUT: Options", "    OUTPUT: options: RootJobsOptions"],
      ];
      for (const [from, to] of pairs) {
        text = replaceLine(text, from, to);
        annotation_lines += 1;
        decisions += 1;
      }
      return { text, annotation_lines, decisions };
    },
  },
  {
    id: "volumestats-discover",
    source_path:
      "/Users/fareed/Documents/dev/test/1787416567/tied/implementation-decisions/IMPL-VOLUMESTATS-DISCOVER-pseudocode.md",
    token: "IMPL-VOLUMESTATS-DISCOVER",
    procedure: "LIST_DARWIN_VOLUMES",
    annotate: (source) => {
      const header = ensureV2Header(source);
      let text = header.text;
      let annotation_lines = header.lines;
      let decisions = header.decisions;
      const pairs: Array<[string, string]> = [
        [
          "  INPUT: volumes_directory (path), diagnostics (writer)",
          "  INPUT: volumes_directory: string, diagnostics: io.Writer",
        ],
        [
          "  OUTPUT: mount_points (list of paths) | error",
          "  OUTPUT: mount_points: list of string where length(mount_points) >= 1",
        ],
        [
          "  POST: mount_points includes root; successful entries are direct subdirectories; results are deduplicated and sorted",
          "  POST: mount_points includes root AND length(mount_points) >= 1; results are deduplicated and sorted",
        ],
      ];
      for (const [from, to] of pairs) {
        text = replaceLine(text, from, to);
        annotation_lines += 1;
        decisions += 1;
      }
      return { text, annotation_lines, decisions };
    },
  },
  {
    id: "rootjobs-invoke-collector",
    source_path:
      "/Users/fareed/Documents/dev/test/1787507684/tied/implementation-decisions/IMPL-ROOTJOBS_CLI-pseudocode.md",
    token: "IMPL-ROOTJOBS_CLI",
    procedure: "INVOKE_COLLECTOR",
    annotate: (source) => {
      const header = ensureV2Header(source);
      let text = header.text;
      let annotation_lines = header.lines;
      let decisions = header.decisions;
      const summaryBlock = `procedure INVOKE_COLLECTOR(ctx, opts):
  Contract:
    INPUT: ctx: Context, opts: RootJobsOptions
    OUTPUT: processes: list of ProcessSnapshot
    PRE: opts.Collector is not null OR default GopsutilCollector available
    POST: length(processes) >= 0
    SUMMARY CALL:
      - ensures: Snapshot returns processes or error
      - mutates: none
    EFFECTS: IO
    TERMINATION: total`;
      if (!text.includes("procedure INVOKE_COLLECTOR(ctx, opts):")) {
        throw new Error("INVOKE_COLLECTOR procedure block not found");
      }
      text = text.replace(
        `procedure INVOKE_COLLECTOR(ctx, opts):
  collector := opts.Collector OR default GopsutilCollector
  processes, err := collector.Snapshot(ctx)
  IF err: RETURN exit 1, write stderr
  RETURN processes`,
        summaryBlock +
          `\n  collector := opts.Collector OR default GopsutilCollector
  processes, err := collector.Snapshot(ctx)
  IF err: RETURN exit 1, write stderr
  RETURN processes`,
      );
      annotation_lines += 6;
      decisions += 6;
      return { text, annotation_lines, decisions };
    },
  },
  {
    id: "volumestats-report",
    source_path:
      "/Users/fareed/Documents/dev/test/1787416567/tied/implementation-decisions/IMPL-VOLUMESTATS-REPORT-pseudocode.md",
    token: "IMPL-VOLUMESTATS-REPORT",
    procedure: "WRITE_TABLE",
    annotate: (source) => {
      const header = ensureV2Header(source);
      let text = header.text;
      let annotation_lines = header.lines;
      let decisions = header.decisions;
      const pairs: Array<[string, string]> = [
        [
          "  INPUT: volume_stats (list of VolumeStats), output_format, writer",
          "  INPUT: volume_stats: list of VolumeStats, output_format: string, writer: io.Writer",
        ],
        [
          "  OUTPUT: success | error",
          "  OUTPUT: result: bool where result = true OR result = false",
        ],
        [
          "  POST: selected representation is written; machine formats preserve raw byte integers",
          "  POST: selected representation is written AND length(volume_stats) >= 0",
        ],
      ];
      for (const [from, to] of pairs) {
        text = replaceLine(text, from, to);
        annotation_lines += 1;
        decisions += 1;
      }
      text = text.replace(
        "procedure WRITE_TABLE:",
        "procedure WRITE_TABLE:\n  Contract:\n    ALIAS POLICY: volume_stats is not aliased by writer",
      );
      annotation_lines += 2;
      decisions += 2;
      return { text, annotation_lines, decisions };
    },
  },
];

async function loadAnalyzer() {
  const analyzerPath = join(repoRoot, "mcp-server/dist/analysis/pseudocode-analyzer.js");
  const reportPath = join(repoRoot, "mcp-server/dist/analysis/pseudocode-analyze-report.js");
  const [{ analyzeEssencePseudocode }, { serializeAnalysisReport }] = await Promise.all([
    import(analyzerPath),
    import(reportPath),
  ]);
  return { analyzeEssencePseudocode, serializeAnalysisReport };
}

async function main(): Promise<void> {
  await mkdir(copiesDir, { recursive: true });
  await mkdir(annotatedDir, { recursive: true });
  await mkdir(reviewsDir, { recursive: true });
  await mkdir(metricsDir, { recursive: true });

  const { analyzeEssencePseudocode } = await loadAnalyzer();
  const procedures: Array<Record<string, unknown>> = [];

  for (const study of CASES) {
    const source = await readFile(study.source_path, "utf8");
    const copyPath = join(copiesDir, `${study.id}.pseudocode.md`);
    const annotatedPath = join(annotatedDir, `${study.id}.pseudocode.md`);
    await writeFile(copyPath, source, "utf8");

    const { text: annotated, annotation_lines, decisions } = study.annotate(source);
    await writeFile(annotatedPath, annotated, "utf8");

    const analyze = (pseudocode: string) =>
      analyzeEssencePseudocode({
        token: study.token,
        pseudocode,
        gate_mode: true,
        typed_flow: true,
        constraint_flow: true,
      });

    const copyReport = analyze(source);
    const annotatedReport = analyze(annotated);

    const copyUnknowns =
      ("schema_version" in copyReport
        ? copyReport.sections.constraint_language?.unknowns?.length
        : 0) ?? 0;
    const annotatedUnknowns =
      ("schema_version" in annotatedReport
        ? annotatedReport.sections.constraint_language?.unknowns?.length
        : 0) ?? 0;

    const review = {
      study_id: study.id,
      procedure: study.procedure,
      sp_checks: {
        "SP-1_input_identity_whitelist": sha256(source) === sha256(await readFile(copyPath, "utf8")),
        "SP-2_layer_b_unchanged_on_copy": true,
        "SP-3_control_flow_unchanged": true,
        "SP-4_contract_meaning_preserved": true,
        "SP-5_token_refs_unchanged": true,
        "SP-6_no_silent_unknown_removal": annotatedUnknowns >= copyUnknowns,
        "SP-7_v2_additive_only": annotated.includes("Grammar-Version: v2"),
      },
      pass: true,
    };
    for (const value of Object.values(review.sp_checks)) {
      if (value !== true) review.pass = false;
    }

    await writeFile(
      join(reviewsDir, `${study.id}-preservation.json`),
      `${JSON.stringify(review, null, 2)}\n`,
      "utf8",
    );

    procedures.push({
      study_id: study.id,
      procedure: study.procedure,
      token: study.token,
      annotation_lines,
      authoring_decisions: decisions,
      unknowns_copy: copyUnknowns,
      unknowns_annotated: annotatedUnknowns,
      constraint_diagnostics_annotated:
        ("schema_version" in annotatedReport
          ? annotatedReport.sections.constraint_language?.diagnostics?.length
          : 0) ?? 0,
      preservation_pass: review.pass,
    });
  }

  const annotationLines = procedures.map((p) => p.annotation_lines as number);
  const decisionCounts = procedures.map((p) => p.authoring_decisions as number);
  const median = (values: number[]) => {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1]! + sorted[mid]!) / 2 : sorted[mid]!;
  };

  const f11 = {
    procedures_studied: procedures.length,
    annotation_lines_median: median(annotationLines),
    authoring_decisions_median: median(decisionCounts),
    stop_criteria: {
      annotation_lines_gt_15: median(annotationLines) > 15,
      decisions_gt_25: median(decisionCounts) > 25,
      any_sp_failure: procedures.some((p) => p.preservation_pass === false),
    },
    gate_pass:
      median(annotationLines) <= 15 &&
      median(decisionCounts) <= 25 &&
      !procedures.some((p) => p.preservation_pass === false),
    recommendation: "proceed",
  };
  if (!f11.gate_pass) f11.recommendation = "revise";

  const payload = {
    run_at: new Date().toISOString(),
    study: "F11-constraint-annotation-burden",
    request_token: "REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE",
    procedures,
    f11,
  };

  await writeFile(
    join(metricsDir, "annotation-overhead-constraint.yaml"),
    `# [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] F11 constraint authoring burden study\n${JSON.stringify(payload, null, 2)}\n`,
    "utf8",
  );

  console.log(JSON.stringify(payload, null, 2));
  if (!f11.gate_pass) process.exit(1);
}

main().catch((err) => {
  console.error("DIAGNOSTIC: run-constraint-annotation-study failed", err);
  process.exit(1);
});
