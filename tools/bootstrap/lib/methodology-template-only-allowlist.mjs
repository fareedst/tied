/**
 * [IMPL-TIED_CLIENT_REFRESH_PARITY] [ARCH-TIED_CLIENT_REFRESH_PARITY] [REQ-TIED_CLIENT_REFRESH_PARITY]
 * How: Source of truth for template paths excluded from Parity A sha256 drift (copied elsewhere or not into methodology).
 */

/** @type {readonly string[]} Paths relative to `templates/` root. */
export const METHODOLOGY_TEMPLATE_ONLY_PATHS = Object.freeze([
  ".tied-yaml.yaml",
  "agent-req-checklist-feat-spawned-phase5.v1.yaml",
  "impl-essence-pseudocode-template.md",
  "processes.md",
]);

/**
 * @param {string} relativePath posix-style path under templates/
 */
export function isMethodologyTemplateOnlyPath(relativePath) {
  const normalized = relativePath.replace(/\\/g, "/");
  return METHODOLOGY_TEMPLATE_ONLY_PATHS.includes(normalized);
}
