/**
 * [IMPL-TIED_BOUNDED_TRAJECTORY_EVIDENCE] [ARCH-TIED_BOUNDED_COMPOSITION] [REQ-TIED_BOUNDED_COMPOSITION]
 * Path-safe segment validation for trajectory and run identifiers.
 */

const SAFE_SEGMENT_RE = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,127}$/u;

export function isPathSafeSegment(segment: string): boolean {
  if (!segment || segment.includes("..")) return false;
  if (segment.includes("/") || segment.includes("\\")) return false;
  return SAFE_SEGMENT_RE.test(segment);
}

export function assertPathSafeSegment(segment: string): string | null {
  return isPathSafeSegment(segment) ? segment : null;
}
