/**
 * [IMPL-TIED_BOUNDED_TRAJECTORY_EVIDENCE] [ARCH-TIED_BOUNDED_COMPOSITION] [REQ-TIED_BOUNDED_COMPOSITION]
 * Local trajectory placement under working-root classification.
 */

import path from "node:path";

import { resolveWorkingPath } from "../working-root.js";
import { assertPathSafeSegment } from "./path-safe-id.js";

export type WrongBasePathError = { code: "WrongBasePath"; detail: string };

export function normalizeTiedProjectBase(tiedBasePath: string): string {
  return path.resolve(tiedBasePath);
}

export function assertTiedBasePathMatchesProject(
  projectRoot: string,
  tiedBasePath: string,
): WrongBasePathError | null {
  const root = path.resolve(projectRoot);
  const expected = path.join(root, "tied-project");
  const actual = normalizeTiedProjectBase(tiedBasePath);
  if (actual !== expected) {
    return {
      code: "WrongBasePath",
      detail: `TIED base path must resolve to ${expected}, got ${actual}`,
    };
  }
  return null;
}

export function resolveLocalTrajectoryPath(
  projectRoot: string,
  requestToken: string,
  ...segments: string[]
): WrongBasePathError | { absolute: string; relative: string } {
  for (const segment of segments) {
    if (assertPathSafeSegment(segment) == null) {
      return { code: "WrongBasePath", detail: `Unsafe trajectory segment: ${segment}` };
    }
  }
  const absolute = resolveWorkingPath(projectRoot, requestToken, "trajectories", ...segments);
  const relative = path.relative(path.resolve(projectRoot), absolute).split(path.sep).join("/");
  return { absolute, relative };
}
