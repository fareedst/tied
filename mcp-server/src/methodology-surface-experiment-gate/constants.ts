/**
 * [IMPL-METHODOLOGY-SURFACE-EXPERIMENT-GATE] [ARCH-METHODOLOGY-SURFACE-EXPERIMENT-GATE]
 * [REQ-METHODOLOGY-SURFACE-EXPERIMENT-GATE]
 */

export const METHODOLOGY_SURFACE_CHANGE_CLASSES = [
  "checklist_step",
  "prompt_type_workflow",
  "gate_policy",
  "assurance_profile",
  "none",
] as const;

export type MethodologySurfaceChangeClass =
  (typeof METHODOLOGY_SURFACE_CHANGE_CLASSES)[number];

export type MethodologySurfaceChangeClassRead =
  | { kind: "known"; value: MethodologySurfaceChangeClass }
  | { kind: "absent" }
  | { kind: "unknown"; raw: string };
