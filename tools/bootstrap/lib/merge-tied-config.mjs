/**
 * [IMPL-TIED_TWO_FOLDER_LAYOUT] [ARCH-TIED_PROJECT_CONFIG_OWNERSHIP] [REQ-TIED_TWO_FOLDER_LAYOUT]
 * How: MERGE_TIED_CONFIG — disjoint ownership with install_defaults overlay only.
 */
import { PROJECT_CONFIG_TOP_LEVEL_KEYS } from "./project-config.mjs";
import { INSTALL_CONFIG_TOP_LEVEL_KEYS } from "./layers/install-config.mjs";

const INSTALL_ACTUAL_KEYS = new Set(["mode", "harness", "layers", "methodology_bundle"]);

/**
 * @param {Record<string, unknown>|null|undefined} project
 * @param {Record<string, unknown>|null|undefined} install
 */
export function assertConfigKeyOwnership(project, install) {
  if (install && typeof install === "object") {
    for (const key of Object.keys(install)) {
      if (PROJECT_CONFIG_TOP_LEVEL_KEYS.has(key) && key !== "schema") {
        const err = new Error(`CONFIG_KEY_OWNERSHIP_VIOLATION:install:${key}`);
        err.code = "CONFIG_KEY_OWNERSHIP_VIOLATION";
        throw err;
      }
      if (!INSTALL_CONFIG_TOP_LEVEL_KEYS.has(key)) {
        const err = new Error(`CONFIG_UNKNOWN_KEY:install:${key}`);
        err.code = "CONFIG_UNKNOWN_KEY";
        throw err;
      }
    }
  }
  if (project && typeof project === "object") {
    for (const key of Object.keys(project)) {
      if (INSTALL_ACTUAL_KEYS.has(key)) {
        const err = new Error(`CONFIG_KEY_OWNERSHIP_VIOLATION:project:${key}`);
        err.code = "CONFIG_KEY_OWNERSHIP_VIOLATION";
        throw err;
      }
    }
  }
}

/**
 * @param {Record<string, unknown>|null|undefined} project
 * @param {Record<string, unknown>|null|undefined} install
 */
export function mergeTiedConfig(project, install) {
  assertConfigKeyOwnership(project ?? null, install ?? null);
  const defaults =
    project && typeof project.install_defaults === "object" && project.install_defaults
      ? /** @type {Record<string, unknown>} */ (project.install_defaults)
      : {};
  const effective = {
    ...(project ?? {}),
    install: {
      ...defaults,
      ...(install ?? {}),
    },
  };
  return effective;
}
