/**
 * [IMPL-TIED_CLAUDE_HARNESS] [ARCH-TIED_CLAUDE_HARNESS] [REQ-TIED_CLAUDE_HARNESS] [REQ-GOAGENT-AGENT-EXECUTOR]
 * How: SELECT_AGENT_HARNESS — map --harness to cursor, claude, or dry_run; never treat --agent-path as harness selection.
 */
export type AgentHarnessProfile = "cursor" | "claude" | "dry_run";

function readHarnessFlag(argv: string[]): string | undefined {
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--harness") {
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith("-")) {
        return next;
      }
    }
    if (arg.startsWith("--harness=")) {
      return arg.slice("--harness=".length);
    }
  }
  return undefined;
}

function argvImpliesDryRun(argv: string[]): boolean {
  return argv.some(
    (a) => a === "--dry-run" || a === "-d" || a.startsWith("--dry-run="),
  );
}

/**
 * Pure harness profile selection from argv and optional dry-run hint (parsed config).
 */
export function selectAgentHarness(
  argv: string[],
  options: { dryRun?: boolean } = {},
): AgentHarnessProfile {
  const harness = readHarnessFlag(argv);
  if (harness === "claude") {
    return "claude";
  }
  if (options.dryRun === true || argvImpliesDryRun(argv)) {
    return "dry_run";
  }
  return "cursor";
}

/** Default agent executable when --agent-path is unset, per harness profile. */
export function defaultAgentBinForHarness(harness: AgentHarnessProfile): string {
  if (harness === "claude") {
    return "claude";
  }
  return "agent";
}
