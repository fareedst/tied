/**
 * [IMPL-TIED_LAYERED_CLIENT_INSTALL] [IMPL-TIED_TWO_FOLDER_LAYOUT]
 * How: Back-compat re-exports; v2 install config lives in install-config.mjs.
 */
export {
  INSTALL_CONFIG_SCHEMA_V2 as INSTALL_MANIFEST_SCHEMA,
  INSTALL_MANIFEST_SCHEMA_V1,
  readInstallConfig as readInstallManifest,
  writeInstallConfig as writeInstallManifest,
  installConfigPath as installManifestPath,
  legacyInstallManifestPath,
} from "./install-config.mjs";
