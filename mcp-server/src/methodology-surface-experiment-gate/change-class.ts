/**
 * [IMPL-METHODOLOGY-SURFACE-EXPERIMENT-GATE] [ARCH-METHODOLOGY-SURFACE-EXPERIMENT-GATE]
 * [REQ-METHODOLOGY-SURFACE-EXPERIMENT-GATE]
 */

import {
  METHODOLOGY_SURFACE_CHANGE_CLASSES,
  type MethodologySurfaceChangeClassRead,
} from "./constants.js";

const classSet = new Set<string>(METHODOLOGY_SURFACE_CHANGE_CLASSES);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Pure CITDP read; absent ⇒ legacy none; no path inference. */
export function readMethodologySurfaceChangeClass(
  citdp: unknown,
): MethodologySurfaceChangeClassRead {
  if (!isRecord(citdp)) {
    return { kind: "absent" };
  }
  const changeDef = isRecord(citdp.change_definition) ? citdp.change_definition : undefined;
  const raw = changeDef?.methodology_surface_change_class;
  if (raw === undefined || raw === null) {
    return { kind: "absent" };
  }
  if (typeof raw !== "string" || !raw.trim()) {
    return { kind: "unknown", raw: String(raw) };
  }
  const normalized = raw.trim();
  if (!classSet.has(normalized)) {
    return { kind: "unknown", raw: normalized };
  }
  return {
    kind: "known",
    value: normalized as (typeof METHODOLOGY_SURFACE_CHANGE_CLASSES)[number],
  };
}

export function isLegacyMethodologySurfaceClass(read: MethodologySurfaceChangeClassRead): boolean {
  if (read.kind === "absent") return true;
  if (read.kind === "known" && read.value === "none") return true;
  return false;
}
