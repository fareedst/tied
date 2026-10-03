#!/usr/bin/env node
/**
 * [IMPL-TIED_TWO_FOLDER_LAYOUT] [REQ-TIED_TWO_FOLDER_LAYOUT]
 * Layout-aware working paths for shell scripts (tied-post-session.sh).
 */
import {
  committedWorkingRelPrefix,
  listRequestWorkingTokens,
  resolveGlobalLocalWorkingPath,
  resolveWorkingPath,
  workingPathRelativeToProject,
} from "./working-root.mjs";

function usage() {
  console.error(`Usage: node working-paths-cli.mjs <command> <projectRoot> [args...]

Commands:
  list-req-tokens          Print REQ-* tokens (one per line)
  rel <token> <parts...>   Posix path relative to project root
  post-session-out         Default post-session output directory (posix)
  envelope-artifact <token> Posix path to request-evidence-envelope.v1.json
`);
  process.exit(2);
}

const [, , command, projectRoot, ...rest] = process.argv;
if (!command || !projectRoot) usage();

switch (command) {
  case "list-req-tokens":
    for (const t of listRequestWorkingTokens(projectRoot)) {
      console.log(t);
    }
    break;
  case "rel": {
    const token = rest.shift();
    if (!token) usage();
    console.log(workingPathRelativeToProject(projectRoot, token, ...rest));
    break;
  }
  case "post-session-out": {
    const base = resolveGlobalLocalWorkingPath(projectRoot, "post-session");
    console.log(base);
    break;
  }
  case "envelope-artifact": {
    const token = rest[0];
    if (!token) usage();
    console.log(
      workingPathRelativeToProject(
        projectRoot,
        token,
        "evidence",
        "request-evidence-envelope.v1.json",
      ),
    );
    break;
  }
  case "committed-prefix":
    console.log(committedWorkingRelPrefix(projectRoot));
    break;
  default:
    usage();
}
