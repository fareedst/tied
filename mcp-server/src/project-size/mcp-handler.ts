/**
 * [IMPL-TIED_PROJECT_SIZE_SNAPSHOT] [ARCH-TIED_PROJECT_SIZE_SNAPSHOT] [REQ-TIED_PROJECT_SIZE_LAYERS]
 */

import { buildProjectSizeSnapshot } from "./snapshot-builder.js";

export async function tiedProjectSizeSnapshot(args: {
  repo_root: string;
  tied_project_rel?: string;
  include_trial_factors?: boolean;
}) {
  return buildProjectSizeSnapshot(args);
}
