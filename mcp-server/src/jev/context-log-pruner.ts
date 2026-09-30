/**
 * [IMPL-TIED_JEV_CONTEXT_LOG_PRUNING] [ARCH-TIED_JEV_CONTEXT_LOG_PRUNING] [REQ-TIED_JEV_CONTEXT_LOG_PRUNING]
 */

import type { JevClientConfig } from "./client.js";
import { jevDecide } from "./client.js";
import type { JevDecideResult } from "./types.js";

export type BenchmarkArm =
  | "raw_before"
  | "deterministic_only"
  | "pruner_jev_off"
  | "pruner_jev_on"
  | "pruner_jev_unavailable";

export type ContextLogPruningConfig = {
  enabled: boolean;
  passThroughLines: number;
  chunkLines: number;
  fatalThreshold: number;
  boilerplateThreshold: number;
  surroundLines: number;
};

export type ChunkDescriptor = {
  startIndex: number;
  endIndexExclusive: number;
  text: string;
};

export type ChunkDisposition = {
  fatal_noul: number;
  boilerplate_noul: number;
  keep: boolean;
  jev_skipped: boolean;
  latency_ms: number;
};

export type ContextLogPruneMetrics = {
  arm: BenchmarkArm;
  input_lines: number;
  output_lines: number;
  input_bytes: number;
  output_bytes: number;
  input_chars: number;
  output_chars: number;
  estimated_tokens_in: number;
  estimated_tokens_out: number;
  pass_through: boolean;
  chunk_count: number;
  jev_calls: number;
  jev_skipped_chunks: number;
  jev_latency_ms_total: number;
  jev_latency_ms_p95: number;
  chunks_kept: number;
  chunks_dropped: number;
};

export type PruneContextLogOptions = {
  arm: BenchmarkArm;
  config?: Partial<ContextLogPruningConfig>;
  jevConfig?: JevClientConfig;
  /** When set, used instead of live jevDecide (tests and replay mock arm). */
  mockDecide?: (
    chunkText: string,
  ) => Promise<Pick<ChunkDisposition, "fatal_noul" | "boilerplate_noul" | "jev_skipped" | "latency_ms">>;
};

const DEFAULT_CONFIG: ContextLogPruningConfig = {
  enabled: false,
  passThroughLines: 30,
  chunkLines: 10,
  fatalThreshold: 0.4,
  boilerplateThreshold: 0.6,
  surroundLines: 2,
};

export function resolveContextLogPruningConfig(
  env: NodeJS.ProcessEnv = process.env,
  manifestFlag = false,
): ContextLogPruningConfig {
  // [IMPL-TIED_JEV_CONTEXT_LOG_PRUNING] [ARCH-TIED_JEV_CONTEXT_LOG_PRUNING] [REQ-TIED_JEV_CONTEXT_LOG_PRUNING] How: map sponsor defaults 30/10/0.40/0.60/±2 and opt-in env.
  const enabled =
    env.TIED_JEV_CONTEXT_LOG_PRUNING === "1" ||
    env.TIED_JEV_CONTEXT_LOG_PRUNING === "true" ||
    manifestFlag;
  return { ...DEFAULT_CONFIG, enabled };
}

export function splitLogLines(log: string): string[] {
  if (log.length === 0) return [];
  const parts = log.split("\n");
  return parts;
}

export function countLines(log: string): number {
  if (log.length === 0) return 0;
  return splitLogLines(log).length;
}

export function shouldPassThrough(log: string, passThroughLines: number): boolean {
  return countLines(log) <= passThroughLines;
}

export function splitIntoChunks(lines: string[], chunkLines: number): ChunkDescriptor[] {
  // [IMPL-TIED_JEV_CONTEXT_LOG_PRUNING] [ARCH-TIED_JEV_CONTEXT_LOG_PRUNING] [REQ-TIED_JEV_CONTEXT_LOG_PRUNING] How: contiguous chunkLines slices; last chunk may be shorter.
  if (chunkLines <= 0) throw new Error("chunkLines must be positive");
  const chunks: ChunkDescriptor[] = [];
  for (let start = 0; start < lines.length; start += chunkLines) {
    const end = Math.min(start + chunkLines, lines.length);
    chunks.push({
      startIndex: start,
      endIndexExclusive: end,
      text: lines.slice(start, end).join("\n"),
    });
  }
  return chunks;
}

const FATAL_PATTERNS: RegExp[] = [
  /\b(error|ERROR|Error)\b/,
  /\bFAIL(?:ED|URE)?\b/,
  /\bAssertionError\b/,
  /\bpanic!\b/,
  /\berror TS\d+/,
  /\berror\[E\d+\]/,
  /:\d+:\d+:\s*error:/,
  /Test.*FAILED/,
  /✗|✘/,
];

const BOILERPLATE_PATTERNS: RegExp[] = [
  /^[\s✓✔·.]+$/,
  /Running tests?\.\.\./i,
  /^\s*\d+\/\d+\s*tests?/i,
  /^\.{3,}$/,
  /Compiling /i,
  /^\s*PASS\s+/,
];

export function deterministicChunkDisposition(chunkText: string): {
  fatal_noul: number;
  boilerplate_noul: number;
} {
  // [IMPL-TIED_JEV_CONTEXT_LOG_PRUNING] [ARCH-TIED_JEV_CONTEXT_LOG_PRUNING] [REQ-TIED_JEV_CONTEXT_LOG_PRUNING] How: regex/heuristic fatal and boilerplate scores in [0,1] without vendor.
  const lines = chunkText.split("\n").filter((l) => l.length > 0);
  if (lines.length === 0) {
    return { fatal_noul: 0, boilerplate_noul: 0.9 };
  }
  let fatalHits = 0;
  let boilerHits = 0;
  for (const line of lines) {
    if (FATAL_PATTERNS.some((p) => p.test(line))) fatalHits += 1;
    if (BOILERPLATE_PATTERNS.some((p) => p.test(line))) boilerHits += 1;
  }
  const fatal_noul = Math.min(1, fatalHits / Math.max(1, lines.length) + (fatalHits > 0 ? 0.35 : 0));
  const boilerplate_noul = Math.min(1, boilerHits / lines.length);
  return { fatal_noul, boilerplate_noul };
}

export function shouldKeepChunk(
  fatal_noul: number,
  boilerplate_noul: number,
  config: ContextLogPruningConfig,
  arm: BenchmarkArm,
  forceKeepChunk: boolean,
): boolean {
  // [IMPL-TIED_JEV_CONTEXT_LOG_PRUNING] [ARCH-TIED_JEV_CONTEXT_LOG_PRUNING] [REQ-TIED_JEV_CONTEXT_LOG_PRUNING] How: keep if fatal_noul >= fatalThreshold AND boilerplate_noul < boilerplateThreshold.
  if (arm === "deterministic_only") return true;
  if (forceKeepChunk) return true;
  return (
    fatal_noul >= config.fatalThreshold && boilerplate_noul < config.boilerplateThreshold
  );
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[Math.max(0, idx)] ?? 0;
}

export function estimateTokensFromChars(chars: number): number {
  return Math.ceil(chars / 4);
}

export function mergeKeptRegionsWithSurround(
  lines: string[],
  keptChunks: ChunkDescriptor[],
  surroundLines: number,
): string[] {
  // [IMPL-TIED_JEV_CONTEXT_LOG_PRUNING] [ARCH-TIED_JEV_CONTEXT_LOG_PRUNING] [REQ-TIED_JEV_CONTEXT_LOG_PRUNING] How: expand kept chunk indices by ±surroundLines; merge overlaps; emit pruned line array deterministically.
  if (keptChunks.length === 0) return [];
  const ranges: { start: number; end: number }[] = [];
  for (const c of keptChunks) {
    const start = Math.max(0, c.startIndex - surroundLines);
    const end = Math.min(lines.length, c.endIndexExclusive + surroundLines);
    ranges.push({ start, end });
  }
  ranges.sort((a, b) => a.start - b.start);
  const merged: { start: number; end: number }[] = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (!last || r.start > last.end) {
      merged.push({ ...r });
    } else {
      last.end = Math.max(last.end, r.end);
    }
  }
  const out: string[] = [];
  for (const r of merged) {
    for (let i = r.start; i < r.end; i++) {
      out.push(lines[i]!);
    }
  }
  return out;
}

async function jevChunkFanout(
  chunkText: string,
  jevConfig: JevClientConfig,
  forceUnavailable: boolean,
): Promise<ChunkDisposition> {
  // [IMPL-TIED_JEV_CONTEXT_LOG_PRUNING] [ARCH-TIED_JEV_CONTEXT_LOG_PRUNING] [REQ-TIED_JEV_CONTEXT_LOG_PRUNING] How: one jevDecide per chunk with fatal_or_diagnostic and pure_boilerplate nouls; fallback keeps chunk on skip/error.
  const t0 = performance.now();
  if (forceUnavailable) {
    return {
      fatal_noul: 1,
      boilerplate_noul: 0,
      keep: true,
      jev_skipped: true,
      latency_ms: performance.now() - t0,
    };
  }
  let result: JevDecideResult;
  try {
    result = await jevDecide(
      { chunk: chunkText.slice(0, 8000) },
      {
        fatal_or_diagnostic: {
          type: "noul",
          instructions:
            "Does this block contain a fatal error, failed test assertion, or compiler diagnostic?",
        },
        pure_boilerplate: {
          type: "noul",
          instructions: "Is this block purely progress or boilerplate with no actionable signal?",
        },
      },
      jevConfig,
    );
  } catch {
    return {
      fatal_noul: 1,
      boilerplate_noul: 0,
      keep: true,
      jev_skipped: true,
      latency_ms: performance.now() - t0,
    };
  }
  const latency_ms = performance.now() - t0;
  if (!result.ok) {
    return {
      fatal_noul: 1,
      boilerplate_noul: 0,
      keep: true,
      jev_skipped: true,
      latency_ms,
    };
  }
  const fatal = result.response.answers.fatal_or_diagnostic;
  const boil = result.response.answers.pure_boilerplate;
  const fatal_noul = fatal?.type === "noul" ? fatal.noul : 0;
  const boilerplate_noul = boil?.type === "noul" ? boil.noul : 0;
  return {
    fatal_noul,
    boilerplate_noul,
    keep: false,
    jev_skipped: false,
    latency_ms,
  };
}

export async function pruneContextLog(
  log: string,
  options: PruneContextLogOptions,
): Promise<{ text: string; metrics: ContextLogPruneMetrics }> {
  // [IMPL-TIED_JEV_CONTEXT_LOG_PRUNING] [ARCH-TIED_JEV_CONTEXT_LOG_PRUNING] [REQ-TIED_JEV_CONTEXT_LOG_PRUNING] How: orchestrate arms raw_before (no op), deterministic_only, pruner_jev_off/on/unavailable via BenchmarkArm parameter.
  const config: ContextLogPruningConfig = {
    ...DEFAULT_CONFIG,
    ...options.config,
  };
  const arm = options.arm;
  const input_bytes = Buffer.byteLength(log, "utf8");
  const input_chars = log.length;
  const lines = splitLogLines(log);
  const input_lines = lines.length;

  const baseMetrics = (): ContextLogPruneMetrics => ({
    arm,
    input_lines,
    output_lines: input_lines,
    input_bytes,
    output_bytes: input_bytes,
    input_chars,
    output_chars: input_chars,
    estimated_tokens_in: estimateTokensFromChars(input_chars),
    estimated_tokens_out: estimateTokensFromChars(input_chars),
    pass_through: false,
    chunk_count: 0,
    jev_calls: 0,
    jev_skipped_chunks: 0,
    jev_latency_ms_total: 0,
    jev_latency_ms_p95: 0,
    chunks_kept: 0,
    chunks_dropped: 0,
  });

  if (arm === "raw_before") {
    const m = baseMetrics();
    m.pass_through = true;
    return { text: log, metrics: m };
  }

  if (shouldPassThrough(log, config.passThroughLines)) {
    const m = baseMetrics();
    m.pass_through = true;
    return { text: log, metrics: m };
  }

  const chunks = splitIntoChunks(lines, config.chunkLines);
  const kept: ChunkDescriptor[] = [];
  const latencies: number[] = [];
  let jev_calls = 0;
  let jev_skipped_chunks = 0;

  for (const chunk of chunks) {
    let fatal_noul = 0;
    let boilerplate_noul = 0;
    let forceKeep = false;
    let jev_skipped = true;

    if (arm === "pruner_jev_off") {
      const d = deterministicChunkDisposition(chunk.text);
      fatal_noul = d.fatal_noul;
      boilerplate_noul = d.boilerplate_noul;
    } else if (arm === "deterministic_only") {
      fatal_noul = 0;
      boilerplate_noul = 0;
    } else if (options.mockDecide) {
      const mocked = await options.mockDecide(chunk.text);
      fatal_noul = mocked.fatal_noul;
      boilerplate_noul = mocked.boilerplate_noul;
      jev_skipped = mocked.jev_skipped;
      latencies.push(mocked.latency_ms);
      if (!jev_skipped) jev_calls += 1;
      else jev_skipped_chunks += 1;
    } else {
      const disp = await jevChunkFanout(
        chunk.text,
        options.jevConfig ?? {},
        arm === "pruner_jev_unavailable",
      );
      fatal_noul = disp.fatal_noul;
      boilerplate_noul = disp.boilerplate_noul;
      forceKeep = disp.jev_skipped;
      jev_skipped = disp.jev_skipped;
      latencies.push(disp.latency_ms);
      if (!jev_skipped) jev_calls += 1;
      else jev_skipped_chunks += 1;
    }

    const keep = shouldKeepChunk(
      fatal_noul,
      boilerplate_noul,
      config,
      arm,
      forceKeep,
    );
    if (keep) kept.push(chunk);
  }

  const prunedLines = mergeKeptRegionsWithSurround(lines, kept, config.surroundLines);
  const text = prunedLines.join("\n");
  const output_bytes = Buffer.byteLength(text, "utf8");
  const output_chars = text.length;
  const sortedLat = [...latencies].sort((a, b) => a - b);

  const metrics: ContextLogPruneMetrics = {
    ...baseMetrics(),
    output_lines: prunedLines.length,
    output_bytes,
    output_chars,
    estimated_tokens_out: estimateTokensFromChars(output_chars),
    pass_through: false,
    chunk_count: chunks.length,
    jev_calls,
    jev_skipped_chunks,
    jev_latency_ms_total: latencies.reduce((a, b) => a + b, 0),
    jev_latency_ms_p95: percentile(sortedLat, 95),
    chunks_kept: kept.length,
    chunks_dropped: chunks.length - kept.length,
  };

  return { text, metrics };
}
