/**
 * [IMPL-AGENTSTREAM_OPERATOR_STDERR_ELAPSED] [ARCH-AGENTSTREAM_OPERATOR_STDERR_ELAPSED]
 * [REQ-AGENTSTREAM_OPERATOR_STDERR_ELAPSED] [REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE]
 * Elapsed-second prefix and category texture for operator DEBUG/DIAGNOSTIC stderr lines.
 */
export type OperatorStderrLevel = "DEBUG" | "DIAGNOSTIC";

const ALREADY_PREFIXED = /^\d{4} (DEBUG|DIAGNOSTIC):/;

let processEpochMs: number | null = null;

function getProcessEpochMs(): number {
  if (processEpochMs === null) {
    processEpochMs = Date.now();
  }
  return processEpochMs;
}

export function operatorElapsedEnabled(): boolean {
  const v = process.env.AGENTSTREAM_OPERATOR_ELAPSED?.trim();
  return v !== "0";
}

export function resolveOperatorEpochMs(): number {
  const env = process.env.TIED_OPERATOR_EPOCH_MS?.trim();
  if (env && /^\d+$/.test(env)) {
    return Number(env);
  }
  return getProcessEpochMs();
}

export function operatorStderrUseColor(): boolean {
  if (!operatorElapsedEnabled()) {
    return false;
  }
  const noColor = process.env.NO_COLOR?.trim();
  if (noColor !== undefined && noColor !== "") {
    return false;
  }
  if (process.env.TIED_CLI_PLAIN === "1") {
    return false;
  }
  return process.stderr.isTTY === true;
}

function formatOffsetSeconds(atMs: number): string {
  const epoch = resolveOperatorEpochMs();
  const sec = Math.max(0, Math.floor((atMs - epoch) / 1000));
  const clamped = Math.min(sec, 9999);
  return String(clamped).padStart(4, "0");
}

export function formatOperatorStderrLine(
  level: OperatorStderrLevel,
  body: string,
  atMs?: number,
): string {
  const trimmed = body.replace(/\n$/, "");
  if (ALREADY_PREFIXED.test(trimmed)) {
    return `${trimmed}\n`;
  }
  if (!operatorElapsedEnabled()) {
    return `${level}: ${trimmed}\n`;
  }
  const now = atMs ?? Date.now();
  const offset = formatOffsetSeconds(now);
  const plain = `${offset} ${level}: ${trimmed}`;
  if (!operatorStderrUseColor()) {
    return `${plain}\n`;
  }
  const dim = "\x1b[2m";
  const cyan = "\x1b[36m";
  const yellow = "\x1b[33m";
  const reset = "\x1b[0m";
  const offsetPart = `${dim}${cyan}${offset}${reset}`;
  const levelPart =
    level === "DEBUG"
      ? `${dim}${yellow}${level}:${reset}`
      : `${dim}${level}:${reset}`;
  return `${offsetPart} ${levelPart} ${trimmed}\n`;
}

export function operatorDiagnostic(body: string, atMs?: number): string {
  return formatOperatorStderrLine("DIAGNOSTIC", body, atMs);
}

export function operatorDebug(body: string, atMs?: number): string {
  return formatOperatorStderrLine("DEBUG", body, atMs);
}

export function writeOperatorStderrLine(
  level: OperatorStderrLevel,
  body: string,
): void {
  process.stderr.write(formatOperatorStderrLine(level, body));
}

/** Strip optional elapsed prefix for payload comparisons. */
export function operatorStderrPayload(line: string): string {
  return line.replace(/^\d{4} (DEBUG|DIAGNOSTIC): ?/, "");
}

export function lineLooksLikeOperatorDiagnostic(
  line: string,
  payloadPrefix: string,
): boolean {
  const payload = operatorStderrPayload(line.replace(/^\s+/, ""));
  return (
    payload.startsWith(payloadPrefix) ||
    line.includes(`DIAGNOSTIC: ${payloadPrefix}`)
  );
}