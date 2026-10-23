/**
 * [IMPL-TIED_TWO_FOLDER_LAYOUT] [ARCH-TIED_TWO_FOLDER_LAYOUT] [REQ-TIED_TWO_FOLDER_LAYOUT]
 * How: Collapse legacy root working/** gitignore globs to tied-bundle/working/** with optional undivided store mirror.
 */
import { LOCAL_WORKING_GITIGNORE_GLOBS } from "./working-root.mjs";

export const GITIGNORE_LOCAL_WORKING_BEGIN = "# BEGIN TIED LOCAL WORKING (managed)";
export const GITIGNORE_LOCAL_WORKING_END = "# END TIED LOCAL WORKING (managed)";
export const GITIGNORE_UNDIVIDED_MIRROR_BEGIN =
  "# BEGIN TIED UNDIVIDED STORE MIRROR (REQ-TIED_TWO_FOLDER_LAYOUT p6 — remove after git mv)";
export const GITIGNORE_UNDIVIDED_MIRROR_END = "# END TIED UNDIVIDED STORE MIRROR";
export const GITIGNORE_STORE_LOCAL_WORKING_BEGIN =
  "# BEGIN TIED STORE LOCAL WORKING (managed)";
export const GITIGNORE_STORE_LOCAL_WORKING_END = "# END TIED STORE LOCAL WORKING (managed)";
/** [IMPL-TIED_COMMITTED_WORKING_GIT_HYGIENE] [REQ-TIED_COMMITTED_WORKING_GIT_HYGIENE] */
export const GITIGNORE_COMMITTED_WORKING_REGENERABLE_BEGIN =
  "# BEGIN TIED COMMITTED WORKING REGENERABLE (managed)";
export const GITIGNORE_COMMITTED_WORKING_REGENERABLE_END =
  "# END TIED COMMITTED WORKING REGENERABLE (managed)";
/** Negations preserved when merging committed-working regenerable block. */
export const COMMITTED_WORKING_REGENERABLE_NEGATIONS = [
  "!tied-project/working/REQ-TIED_EDPC_COMPREHENSION/evidence/",
  "!tied-project/working/REQ-TIED_EDPC_COMPREHENSION/evidence/**",
];
/** Matches {@link GITIGNORE_BLOCK_BEGIN} in gitignore-block.mjs (avoid import cycle). */
const GITIGNORE_INSTALL_MANAGED_BEGIN = "# BEGIN TIED INSTALL MANAGED";
const GITIGNORE_INSTALL_MANAGED_END = "# END TIED INSTALL MANAGED";

/** @type {readonly string[]} Whole-root store local working ignore (not client install block). */
export const STORE_LOCAL_WORKING_GITIGNORE_GLOBS = [
  "tied-bundle/working/",
  "tied-bundle/install.json",
];

/** @type {readonly string[]} Expanded local-only globs (divided clients + store tied-bundle/working). */
export const EXPANDED_LOCAL_WORKING_GITIGNORE_GLOBS = [
  ...LOCAL_WORKING_GITIGNORE_GLOBS,
  "tied-bundle/working/jev-decide-trace/",
  /** Store migration: operator trace was tracked under committed working by mistake. */
  "tied-project/working/jev-decide-trace/",
  "tied-bundle/working/**/context-pruning-benchmark-live.v1.json",
  "tied-bundle/working/*-CLIENT-*/",
  "tied-bundle/working/**/gate-*.json",
  "tied-bundle/working/**/gate-args*.json",
  "tied-bundle/working/**/activation-*.json",
  "tied-bundle/working/**/pseudocode-analysis/",
  "tied-bundle/working/**/*-remediation-log.yaml",
  "tied-bundle/working/**/tied-verify-*.json",
  "tied-bundle/working/**/g*-dogfood/",
  "tied-bundle/working/client-*/",
  "tied-bundle/working/**/tied-mcp-metrics*.jsonl",
  "tied-bundle/working/**/adherence-ledger.jsonl",
  "tied-bundle/working/**/citdp-doc-*.json",
  "tied-bundle/working/**/citdp-write-payload.json",
  "tied-bundle/working/**/citdp-record-body.json",
  "tied-bundle/working/**/citdp-p*-*.json",
  "tied-bundle/working/**/tied-create-*.json",
  "tied-bundle/working/**/token-create-*.json",
  "tied-bundle/working/**/create-arch.json",
  "tied-bundle/working/**/create-impl.json",
  "tied-bundle/working/**/create-req.json",
  "tied-bundle/working/**/validate-consistency.json",
  "tied-bundle/working/**/tied-validate-consistency*.json",
  "tied-bundle/working/**/p*-yaml-updates.json",
  "tied-bundle/working/**/adversarial-inquiry-p*-run.json",
  "tied-bundle/working/**/pre_implementation-*.json",
  "tied-bundle/working/**/verification-*.json",
  "tied-bundle/working/**/close_out-*.json",
  "tied-bundle/working/**/run-*-gates.mjs",
  "tied-bundle/working/**/run-*-gate.mjs",
  "tied-bundle/working/**/run-phase*-tied-verify.mjs",
  "tied-bundle/working/**/gates/quality-*-profile-result.json",
  "tied-bundle/working/**/track-*-close-out-evidence.json",
  "tied-bundle/working/**/run-*-close-out*.mjs",
  "tied-bundle/working/**/sync-*-close-out*.mjs",
  "tied-bundle/working/*-close-out-summary.json",
  "tied-bundle/working/**/evidence/quality/**/*.stdout.txt",
  "tied-bundle/working/**/evidence/quality/**/*.stderr.txt",
  "tied-bundle/working/**/evidence/psa-*.json",
  "tied-bundle/working/**/evidence/pseudocode-validate-*.json",
  "tied-bundle/working/**/doc-*-checklist.yaml",
  "tied-bundle/working/**/CITDP-REQ-*-diff-or-stage.yaml",
  "tied-bundle/working/post-session/",
];

/**
 * @param {string} glob tied-bundle/working/...
 * @returns {string}
 */
export function undividedMirrorGlob(glob) {
  if (!glob.startsWith("tied-bundle/working/")) {
    return glob;
  }
  return glob.replace(/^tied-bundle\/working\//, "working/");
}

/**
 * @param {readonly string[]} globs
 */
export function buildLocalWorkingGitignoreBlock(globs, { undividedMirror = false } = {}) {
  const lines = [GITIGNORE_LOCAL_WORKING_BEGIN, ...globs, GITIGNORE_LOCAL_WORKING_END, ""];
  if (undividedMirror) {
    lines.push(GITIGNORE_UNDIVIDED_MIRROR_BEGIN);
    for (const g of globs) {
      lines.push(undividedMirrorGlob(g));
    }
    lines.push(GITIGNORE_UNDIVIDED_MIRROR_END, "");
  }
  return lines.join("\n");
}

/** @param {string} literal */
function escapeRegExp(literal) {
  return literal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const LOCAL_WORKING_BLOCK_REGEX = new RegExp(
  `${escapeRegExp(GITIGNORE_LOCAL_WORKING_BEGIN)}[\\s\\S]*?${escapeRegExp(GITIGNORE_LOCAL_WORKING_END)}\\n?`,
  "m",
);
const UNDIVIDED_MIRROR_BLOCK_REGEX = new RegExp(
  `${escapeRegExp(GITIGNORE_UNDIVIDED_MIRROR_BEGIN)}[\\s\\S]*?${escapeRegExp(GITIGNORE_UNDIVIDED_MIRROR_END)}\\n?`,
  "m",
);
const STORE_LOCAL_WORKING_BLOCK_REGEX = new RegExp(
  `${escapeRegExp(GITIGNORE_STORE_LOCAL_WORKING_BEGIN)}[\\s\\S]*?${escapeRegExp(GITIGNORE_STORE_LOCAL_WORKING_END)}\\n?`,
  "m",
);
const COMMITTED_WORKING_REGENERABLE_BLOCK_REGEX = new RegExp(
  `${escapeRegExp(GITIGNORE_COMMITTED_WORKING_REGENERABLE_BEGIN)}[\\s\\S]*?${escapeRegExp(GITIGNORE_COMMITTED_WORKING_REGENERABLE_END)}\\n?`,
  "m",
);
const INSTALL_MANAGED_BLOCK_REGEX = new RegExp(
  `${escapeRegExp(GITIGNORE_INSTALL_MANAGED_BEGIN)}[\\s\\S]*?${escapeRegExp(GITIGNORE_INSTALL_MANAGED_END)}\\n?`,
  "m",
);

/**
 * Remove managed LOCAL WORKING and UNDIVIDED STORE MIRROR blocks; preserve other lines.
 * @param {string} content
 */
export function removeLegacyWorkingGitignoreBlocks(content) {
  return content
    .replace(UNDIVIDED_MIRROR_BLOCK_REGEX, "")
    .replace(LOCAL_WORKING_BLOCK_REGEX, "")
    .replace(STORE_LOCAL_WORKING_BLOCK_REGEX, "");
}

/**
 * @param {{ undividedMirror?: boolean }} [options]
 */
export function buildStoreLocalWorkingGitignoreBlock(options = {}) {
  const lines = [
    GITIGNORE_STORE_LOCAL_WORKING_BEGIN,
    ...STORE_LOCAL_WORKING_GITIGNORE_GLOBS,
    GITIGNORE_STORE_LOCAL_WORKING_END,
    "",
  ];
  if (options.undividedMirror) {
    lines.push(GITIGNORE_UNDIVIDED_MIRROR_BEGIN);
    for (const g of STORE_LOCAL_WORKING_GITIGNORE_GLOBS) {
      lines.push(undividedMirrorGlob(g));
    }
    lines.push(GITIGNORE_UNDIVIDED_MIRROR_END, "");
  }
  return lines.join("\n");
}

/**
 * @param {string} line
 */
function isStandaloneStoreLocalWorkingIgnoreLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    return false;
  }
  if (trimmed.startsWith("!")) {
    return (
      trimmed.includes("tied-bundle/working/") ||
      (trimmed.startsWith("!working/") && !trimmed.startsWith("!working/evaluation"))
    );
  }
  if (trimmed === "tied-bundle/") {
    return true;
  }
  if (trimmed.startsWith("tied-bundle/working")) {
    return true;
  }
  return false;
}

/**
 * Remove tied-bundle/ from INSTALL MANAGED only (store profile); client block unchanged when applied separately.
 * @param {string} content
 */
export function stripTiedBundleFromInstallManagedBlock(content) {
  return content.replace(INSTALL_MANAGED_BLOCK_REGEX, (block) => {
    const lines = block.split("\n").filter((line) => line.trim() !== "tied-bundle/");
    return lines.join("\n");
  });
}

/**
 * [IMPL-TIED_STORE_BUNDLE_GIT_POLICY] [REQ-TIED_STORE_BUNDLE_GIT_POLICY]
 * Idempotent store .gitignore: STORE LOCAL WORKING block, no legacy LOCAL WORKING / UNDIVIDED, no tied-bundle/ in INSTALL MANAGED.
 * @param {string} content
 */
/**
 * [IMPL-TIED_COMMITTED_WORKING_GIT_HYGIENE] [REQ-TIED_COMMITTED_WORKING_GIT_HYGIENE]
 * Mirror tied-bundle/working regenerable globs onto tied-project/working/.
 * @returns {string[]}
 */
export function buildCommittedWorkingRegenerableGlobs() {
  /** @type {Set<string>} */
  const out = new Set();
  for (const g of EXPANDED_LOCAL_WORKING_GITIGNORE_GLOBS) {
    if (g.startsWith("tied-bundle/working/")) {
      out.add(g.replace(/^tied-bundle\/working\//, "tied-project/working/"));
    } else if (g.startsWith("tied-project/working/")) {
      out.add(g);
    }
  }
  return [...out].sort();
}

/**
 * @returns {string}
 */
export function buildCommittedWorkingRegenerableBlock() {
  return [
    GITIGNORE_COMMITTED_WORKING_REGENERABLE_BEGIN,
    ...buildCommittedWorkingRegenerableGlobs(),
    ...COMMITTED_WORKING_REGENERABLE_NEGATIONS,
    GITIGNORE_COMMITTED_WORKING_REGENERABLE_END,
    "",
  ].join("\n");
}

/**
 * [IMPL-TIED_COMMITTED_WORKING_GIT_HYGIENE] Store profile + committed-working regenerable managed block.
 * @param {string} content
 */
export function applyCommittedWorkingHygieneProfile(content) {
  let next = applyStoreGitignoreProfile(content);
  const block = buildCommittedWorkingRegenerableBlock();
  if (next.includes(GITIGNORE_COMMITTED_WORKING_REGENERABLE_BEGIN)) {
    next = next.replace(COMMITTED_WORKING_REGENERABLE_BLOCK_REGEX, block);
  } else if (STORE_LOCAL_WORKING_BLOCK_REGEX.test(next)) {
    next = next.replace(STORE_LOCAL_WORKING_BLOCK_REGEX, (storeBlock) => `${storeBlock}${block}`);
  } else {
    next =
      next.endsWith("\n") || next.length === 0 ? `${next}${block}` : `${next}\n${block}`;
  }
  return next;
}

export function applyStoreGitignoreProfile(content) {
  let next = removeLegacyWorkingGitignoreBlocks(content);
  const filtered = next
    .split("\n")
    .filter((line) => !isStandaloneStoreLocalWorkingIgnoreLine(line));
  next = filtered.join("\n");
  next = stripTiedBundleFromInstallManagedBlock(next);
  const storeBlock = buildStoreLocalWorkingGitignoreBlock({ undividedMirror: false });
  if (next.includes(GITIGNORE_STORE_LOCAL_WORKING_BEGIN)) {
    next = next.replace(STORE_LOCAL_WORKING_BLOCK_REGEX, storeBlock);
  } else if (INSTALL_MANAGED_BLOCK_REGEX.test(next)) {
    next = next.replace(INSTALL_MANAGED_BLOCK_REGEX, `${storeBlock}$&`);
  } else {
    next =
      next.endsWith("\n") || next.length === 0 ? `${next}${storeBlock}` : `${next}\n${storeBlock}`;
  }
  return next;
}

/**
 * Replace or append the managed local-working block in .gitignore content.
 * @param {string} content
 * @param {{ undividedMirror?: boolean, profile?: "client" | "store" }} options
 */
export function mergeLocalWorkingGitignoreBlock(content, options = {}) {
  const profile = options.profile ?? "store";
  if (profile === "client") {
    return removeLegacyWorkingGitignoreBlocks(content);
  }

  const blockBody = buildLocalWorkingGitignoreBlock(
    EXPANDED_LOCAL_WORKING_GITIGNORE_GLOBS,
    options,
  );
  let next = content.replace(UNDIVIDED_MIRROR_BLOCK_REGEX, "");
  if (next.includes(GITIGNORE_LOCAL_WORKING_BEGIN)) {
    next = next.replace(LOCAL_WORKING_BLOCK_REGEX, blockBody);
  } else {
    next = next.endsWith("\n") || next.length === 0 ? `${next}${blockBody}` : `${next}\n${blockBody}`;
  }
  return next;
}

/**
 * Remap a single ignore line from root working/ local globs to tied-bundle/working/.
 * Un-ignore (!) lines and comments are preserved.
 * @param {string} line
 */
export function collapseWorkingGitignoreLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("!")) {
    return line;
  }
  if (!trimmed.startsWith("working/")) {
    return line;
  }
  if (trimmed.startsWith("working/evaluation") || trimmed.startsWith("working/fleet-constraint-v2")) {
    return line;
  }
  if (trimmed.startsWith("working/evidence-chain/")) {
    return line;
  }
  if (trimmed.startsWith("working/PSEUDOCODE-") || trimmed.startsWith("working/REQ-PSEUDOCODE_")) {
    return line;
  }
  if (trimmed.startsWith("working/DOC-") || trimmed.startsWith("working/REFINE-")) {
    return line;
  }
  if (trimmed === "working/jev-decide-trace/") {
    return "tied-bundle/working/jev-decide-trace/";
  }
  const localNeedle = [
    "gates/",
    "gate-",
    "adversarial-inquiry/",
    "adherence",
    "jev/",
    "pseudocode-analysis/",
    "-ledger.jsonl",
    "-CLIENT-",
    "post-session/",
    "client-",
    "tied-mcp-metrics",
    "activation-",
    "tied-verify",
    "citdp-",
    "create-arch.json",
    "create-impl.json",
    "create-req.json",
    "validate-consistency",
    "pre_implementation-",
    "verification-",
    "close_out-",
    "run-*-gate",
    "context-pruning-benchmark-live",
  ];
  if (localNeedle.some((n) => trimmed.includes(n))) {
    return trimmed.replace(/^working\//, "tied-bundle/working/");
  }
  return line;
}

/**
 * Collapse repetitive local working/** ignore lines; keeps ! exceptions and program-specific trees.
 * @param {string} content
 */
export function collapseLegacyWorkingGitignorePatterns(content) {
  const lines = content.split("\n");
  const out = [];
  for (const line of lines) {
    if (
      line.includes(GITIGNORE_LOCAL_WORKING_BEGIN) ||
      line.includes(GITIGNORE_UNDIVIDED_MIRROR_BEGIN) ||
      line.includes(GITIGNORE_STORE_LOCAL_WORKING_BEGIN)
    ) {
      continue;
    }
    out.push(collapseWorkingGitignoreLine(line));
  }
  return applyStoreGitignoreProfile(out.join("\n"));
}
