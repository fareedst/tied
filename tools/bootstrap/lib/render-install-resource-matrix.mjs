/**
 * [IMPL-TIED_TWO_FOLDER_LAYOUT] [REQ-TIED_LAYERED_CLIENT_INSTALL]
 * Emit install-resource-matrix.md header from layout.mjs constants (operator sync check).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  PROJECT_DIR_NAME,
  BUNDLE_DIR_NAME,
  resolveTiedLayout,
} from "./layout.mjs";
import { GITIGNORE_MANAGED_PATHS } from "./layers/gitignore-block.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../../..");
const MATRIX_PATH = path.join(
  REPO_ROOT,
  "tied-project",
  "working",
  "REQ-TIED_LAYERED_CLIENT_INSTALL",
  "install-resource-matrix.md",
);

/**
 * @returns {string[]}
 */
export function installMatrixKeyPaths(repoRoot = REPO_ROOT) {
  const layout = resolveTiedLayout(repoRoot);
  return [
    `${PROJECT_DIR_NAME}/config.yaml`,
    `${PROJECT_DIR_NAME}/requirements.yaml`,
    `${BUNDLE_DIR_NAME}/install.json`,
    `${BUNDLE_DIR_NAME}/docs/`,
    `${BUNDLE_DIR_NAME}/templates/impl-essence-pseudocode-template.md`,
    ...GITIGNORE_MANAGED_PATHS.filter((p) => p.startsWith(BUNDLE_DIR_NAME) || p.startsWith(".")),
    layout.projectConfigPath.replace(repoRoot + path.sep, "").replace(/\\/g, "/"),
  ];
}

/**
 * Verify committed matrix doc mentions two-folder roots (non-destructive).
 * @param {string} repoRoot
 */
export function verifyInstallResourceMatrixDoc(repoRoot = REPO_ROOT) {
  if (!fs.existsSync(MATRIX_PATH)) {
    return { ok: false, detail: `missing ${MATRIX_PATH}` };
  }
  const text = fs.readFileSync(MATRIX_PATH, "utf8");
  const required = [
    PROJECT_DIR_NAME,
    BUNDLE_DIR_NAME,
    "tied-install",
    "--migrate-layout",
  ];
  const missing = required.filter((s) => !text.includes(s));
  if (missing.length) {
    return { ok: false, detail: `matrix missing tokens: ${missing.join(", ")}` };
  }
  return { ok: true, key_paths: installMatrixKeyPaths(repoRoot) };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  const v = verifyInstallResourceMatrixDoc();
  if (!v.ok) {
    console.error(v.detail);
    process.exit(1);
  }
  console.log("DEBUG: install-resource-matrix.md sync ok");
  for (const p of v.key_paths ?? []) {
    console.log(`  ${p}`);
  }
}
