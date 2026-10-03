/**
 * [IMPL-TIED_TWO_FOLDER_LAYOUT] [REQ-TIED_TWO_FOLDER_LAYOUT]
 * Intentional legacy path mentions (migration history, legacy markers in code, inherited methodology tokens).
 */

/** @type {readonly { glob: string, patternIds?: readonly string[], reason: string }[]} */
export const STALE_LAYOUT_ALLOWLIST = [
  { glob: "**/*.test.mjs", reason: "tests may reference legacy fixtures and names" },
  { glob: "**/*.test.ts", reason: "tests may reference legacy fixtures and names" },
  { glob: "mcp-server/test/**", reason: "MCP fixtures" },
  {
    glob: "tools/bootstrap/lib/layers/gitignore-block.mjs",
    reason: "v1 managed path list for migration",
  },
  {
    glob: "tools/bootstrap/lib/layers/install-config.mjs",
    reason: "v1 manifest path segments",
  },
  {
    glob: "tools/bootstrap/lib/methodology-client-boundary.mjs",
    reason: "legacy path detection",
  },
  {
    glob: "scripts/lib/tied-two-folder-audit.mjs",
    patternIds: ["legacy_tied_yaml"],
    reason: "audit checks absence of legacy file",
  },
  {
    glob: "mcp-server/src/tied-layout.d.ts",
    patternIds: ["tied_methodology"],
    reason: "generated layout comments",
  },
  {
    glob: "mcp-server/src/tied-layout.js",
    patternIds: ["tied_methodology"],
    reason: "compiled layout comments",
  },
  {
    glob: "mcp-server/src/yaml-loader.ts",
    patternIds: ["root_templates", "tied_methodology"],
    reason: "legacy resolution comments",
  },
  {
    glob: "tools/bootstrap/templates/pre-commit-methodology-guard.sh",
    patternIds: ["tied_methodology"],
    reason: "hook path guard patterns",
  },
  {
    glob: "tied-project/architecture-decisions/**",
    reason: "historical path strings in ARCH records",
  },
  {
    glob: "tied-project/requirements/**",
    reason: "historical metrics in REQ records",
  },
  {
    glob: "tied-project/implementation-decisions/**",
    reason: "historical IMPL records and pseudocode",
  },
  {
    glob: "tied-project/vocab/tied-methodology.md",
    reason: "naming bridge includes retired terms",
  },
  {
    glob: "tied-project/implementation-decisions.yaml",
    reason: "index path fields",
  },
  {
    glob: "scripts/**",
    reason: "fleet/legacy script comments pending cleanup",
  },
  {
    glob: "mcp-server/src/**",
    patternIds: ["copy_files", "copy_files_mjs", "tied_methodology", "root_templates"],
    reason: "runtime legacy detection and migration code paths",
  },
  {
    glob: "mcp-server/packages/**",
    patternIds: ["copy_files_mjs"],
    reason: "CLI path constants",
  },
  {
    glob: "tools/bootstrap/lib/**",
    patternIds: ["root_templates", "copy_files", "tied_methodology", "tied_install_json", "linked_methodology_view"],
    reason: "bootstrap engine legacy compatibility",
  },
  {
    glob: "tools/bundled-tied-yaml-skill/**",
    patternIds: ["root_templates"],
    reason: "skill prose examples",
  },
  {
    glob: "tied-bundle/templates/**",
    reason: "methodology template headers",
  },
  {
    glob: "tools/bootstrap/lib/lint-stale-layout.mjs",
    reason: "lint defines stale patterns",
  },
  {
    glob: "tools/bootstrap/lib/stale-layout-allowlist.mjs",
    reason: "allowlist catalog",
  },
  {
    glob: "tools/bootstrap/lib/layout.mjs",
    patternIds: ["legacy_tied_dir", "legacy_tied_yaml"],
    reason: "LEGACY_LAYOUT_MARKERS and LEGACY_PROJECT_DIR_NAME",
  },
  {
    glob: "tools/bootstrap/lib/migrate-layout.mjs",
    reason: "MIGRATE_LAYOUT dry-run plan strings",
  },
  {
    glob: "tools/bootstrap/lib/migrate-layout.test.mjs",
    reason: "legacy fixture paths",
  },
  {
    glob: "tools/bootstrap/lib/rewrite-two-folder-paths.mjs",
    reason: "rewrite pair definitions",
  },
  {
    glob: "tools/bootstrap/lib/project-config.mjs",
    patternIds: ["legacy_tied_yaml"],
    reason: "legacy root config fallback",
  },
  {
    glob: "tools/bootstrap/lib/layers/install-config.mjs",
    reason: "v1 manifest path segments",
  },
  {
    glob: "mcp-server/src/tied-layout.ts",
    patternIds: ["legacy_tied_yaml"],
    reason: "LEGACY_LAYOUT_MARKERS mirror",
  },
  {
    glob: "mcp-server/packages/agentstream/src/tied-layout.ts",
    patternIds: ["legacy_tied_yaml", "tied_methodology", "legacy_tied_dir"],
    reason: "LEGACY_LAYOUT_MARKERS mirror + comment",
  },
  {
    glob: "mcp-server/src/tied-layout.ts",
    patternIds: ["tied_methodology", "legacy_tied_dir"],
    reason: "layout resolution comments",
  },
  {
    glob: "mcp-server/packages/agentstream/src/dispatch-go.ts",
    patternIds: ["root_working"],
    reason: "historical phase path in error message",
  },
  {
    glob: "mcp-server/packages/agentstream/**/README.md",
    patternIds: ["root_working"],
    reason: "historical evidence path examples",
  },
  {
    glob: "tied-project/working/**",
    reason: "process evidence paths",
  },
  {
    glob: "mcp-server/src/tied-project-config.ts",
    patternIds: ["legacy_tied_yaml"],
    reason: "legacy config resolution",
  },
  {
    glob: "mcp-server/packages/agentstream/src/jev-harness-shared.ts",
    patternIds: ["legacy_tied_yaml"],
    reason: "legacy config resolution",
  },
  {
    glob: "tied-bundle/docs/methodology-migration.md",
    reason: "documented migration history",
  },
  {
    glob: "tied-bundle/**/IMPL-TIED_FILES*.md",
    reason: "superseded bootstrap IMPL history",
  },
  {
    glob: "tied-bundle/**/IMPL-TIED_FILES*.yaml",
    reason: "superseded bootstrap IMPL history",
  },
  {
    glob: "tied-bundle/**/ARCH-TIED_BOOTSTRAP*.yaml",
    reason: "cross-platform bootstrap ARCH history",
  },
  {
    glob: "tied-bundle/requirements/REQ-TIED_SETUP.yaml",
    reason: "inherited setup REQ wording",
  },
  {
    glob: "tied-project/**/REQ-TIED_TWO_FOLDER_LAYOUT/**",
    reason: "plan and CITDP draft historical inventory",
  },
  {
    glob: "tied-project/working/**",
    reason: "process evidence may cite pre-migration paths",
  },
  {
    glob: "tied-project/citdp/**",
    reason: "historical CITDP records",
  },
];

/**
 * @param {string} relPosix path relative to repo root
 * @param {string} patternId
 */
export function isAllowlistedStaleHit(relPosix, patternId) {
  const norm = relPosix.replace(/\\/g, "/");
  for (const entry of STALE_LAYOUT_ALLOWLIST) {
    if (!globMatch(entry.glob, norm)) continue;
    if (!entry.patternIds || entry.patternIds.includes(patternId)) {
      return true;
    }
  }
  return false;
}

/**
 * Simple glob: ** and * only.
 * @param {string} glob
 * @param {string} path
 */
export function globMatch(glob, path) {
  const re = new RegExp(
    `^${glob
      .replace(/[.+^${}()|[\]\\]/g, "\\$&")
      .replace(/\*\*/g, "§§")
      .replace(/\*/g, "[^/]*")
      .replace(/§§/g, ".*")}$`,
  );
  return re.test(path);
}
