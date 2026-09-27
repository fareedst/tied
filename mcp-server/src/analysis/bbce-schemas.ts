/**
 * BBCE Mechanism A — stable schema validators (declared surface, slice map, locality events).
 * Proof boundary: structure validation and diff-scope metrics only — not REQ satisfaction.
 */

import { z } from "zod";

export const DeclaredChangeSurfaceSchema = z.object({
  schema_version: z.literal("bbce-declared-change-surface.v1"),
  scenario_id: z.string().min(1),
  owning_slice_req: z.string().min(1),
  binding_ids: z.array(z.string()).default([]),
  expected_path_globs: z.array(z.string().min(1)).min(1),
  proof_boundary: z.string().min(1),
  behavior: z.string().min(1).optional(),
  public_behavioral_boundary: z.string().min(1).optional(),
  expected_tests: z.array(z.string().min(1)).optional(),
  anticipated_shared_deps: z.array(z.string().min(1)).optional(),
  notes: z.string().optional(),
});

export const SliceBindingSchema = z.object({
  binding_id: z.string().min(1),
  owning_slice_req: z.string().min(1),
  path_globs: z.array(z.string().min(1)),
});

export const SliceMapSchema = z.object({
  schema_version: z.literal("bbce-slice-map.v1"),
  change_id: z.string().min(1),
  shared_mechanism_globs: z.array(z.string()).default([]),
  bindings: z.array(SliceBindingSchema),
  maintenance_rule_ref: z.string().optional(),
  inventory_ref: z.string().optional(),
});

export const LocalityEventSchema = z.object({
  schema_version: z.literal("bbce-locality-event.v1"),
  timestamp: z.string().datetime(),
  source: z.enum(["plumb-audit-gate", "locality-pilot", "manual"]),
  attempt_id: z.string().optional(),
  scenario_id: z.string().min(1),
  owning_slice_req: z.string().min(1),
  declared_change_surface_ref: z.string().optional(),
  slice_map_ref: z.string().optional(),
  metrics: z.object({
    total_changed_files: z.number().int().nonnegative(),
    in_declared_surface_files: z.number().int().nonnegative(),
    change_locality: z.number().min(0).max(1),
  }),
  unexpected_paths_count: z.number().int().nonnegative(),
  shared_mechanism_touches_count: z.number().int().nonnegative(),
  slice_crossings_count: z.number().int().nonnegative(),
  proof_boundary: z.string().min(1),
});

export type DeclaredChangeSurfaceV1 = z.infer<typeof DeclaredChangeSurfaceSchema>;
export type SliceMapV1 = z.infer<typeof SliceMapSchema>;
export type BbceLocalityEventV1 = z.infer<typeof LocalityEventSchema>;

export const SharedCodeTriggerSchema = z.object({
  kind: z.enum(["shared_mechanism_glob", "outside_declared_surface", "outside_impl_code_locations"]),
  touched_paths: z.array(z.string().min(1)),
  matched_glob: z.string().min(1).optional(),
  impl_tokens: z.array(z.string().min(1)).optional(),
});

export const SharedCodeJustificationSchema = z.object({
  schema_version: z.literal("bbce-shared-code-justification.v1"),
  timestamp: z.string().datetime(),
  change_id: z.string().min(1),
  scenario_id: z.string().min(1),
  owning_slice_req: z.string().min(1),
  declared_change_surface_ref: z.string().optional(),
  triggers: z.array(SharedCodeTriggerSchema).min(1),
  consumers: z.array(
    z.object({
      binding_id: z.string().min(1),
      owning_slice_req: z.string().min(1).optional(),
    })
  ),
  blast_radius_summary: z.string().min(1),
  local_alternative_considered: z.string().min(1),
  waiver_ref: z.string().nullable().optional(),
  review_status: z.enum(["pending_human", "approved", "waived"]),
  proof_boundary: z.string().min(1),
});

export const BoundaryCrossingSchema = z.object({
  path: z.string().min(1),
  kind: z.enum(["slice_crossing", "shared_mechanism_touch"]),
  classified_as: z.enum(["foreign_slice", "shared_mechanism", "unclassified"]),
  confidence: z.enum(["high", "medium", "low"]),
  owning_slice_req: z.string().nullable(),
  note: z.string().optional(),
});

export const BoundarySuppressedSchema = z.object({
  path: z.string().min(1),
  suppression_class: z.enum([
    "expected_test_surface",
    "traceability_gap_excluded",
    "import_heuristic_low_confidence",
  ]),
  reason: z.string().min(1),
});

export const BoundaryViolationReportSchema = z.object({
  schema_version: z.literal("bbce-boundary-violation.v1"),
  timestamp: z.string().datetime(),
  change_id: z.string().min(1),
  scenario_id: z.string().min(1),
  declared_owning_slice_req: z.string().min(1),
  slice_map_ref: z.string().min(1),
  traceability_gaps_excluded: z.literal(true),
  import_heuristics: z.array(z.unknown()).default([]),
  crossings: z.array(BoundaryCrossingSchema),
  suppressed: z.array(BoundarySuppressedSchema).default([]),
  proof_boundary: z.string().min(1),
});

export type SharedCodeTriggerV1 = z.infer<typeof SharedCodeTriggerSchema>;
export type SharedCodeJustificationV1 = z.infer<typeof SharedCodeJustificationSchema>;
export type BoundaryCrossingV1 = z.infer<typeof BoundaryCrossingSchema>;
export type BoundarySuppressedV1 = z.infer<typeof BoundarySuppressedSchema>;
export type BoundaryViolationReportV1 = z.infer<typeof BoundaryViolationReportSchema>;

export type BbceValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; issues: Array<{ path: string; message: string }> };

function zodIssues(err: z.ZodError): Array<{ path: string; message: string }> {
  return err.issues.map((i) => ({
    path: i.path.join(".") || "(root)",
    message: i.message,
  }));
}

export function validateDeclaredChangeSurface(raw: unknown): BbceValidationResult<DeclaredChangeSurfaceV1> {
  const parsed = DeclaredChangeSurfaceSchema.safeParse(raw);
  if (parsed.success) return { ok: true, value: parsed.data };
  return { ok: false, issues: zodIssues(parsed.error) };
}

export function validateSliceMap(raw: unknown): BbceValidationResult<SliceMapV1> {
  const parsed = SliceMapSchema.safeParse(raw);
  if (parsed.success) return { ok: true, value: parsed.data };
  return { ok: false, issues: zodIssues(parsed.error) };
}

export function validateLocalityEvent(raw: unknown): BbceValidationResult<BbceLocalityEventV1> {
  const parsed = LocalityEventSchema.safeParse(raw);
  if (parsed.success) return { ok: true, value: parsed.data };
  return { ok: false, issues: zodIssues(parsed.error) };
}

export function validateSharedCodeJustification(
  raw: unknown
): BbceValidationResult<SharedCodeJustificationV1> {
  const parsed = SharedCodeJustificationSchema.safeParse(raw);
  if (parsed.success) return { ok: true, value: parsed.data };
  return { ok: false, issues: zodIssues(parsed.error) };
}

export function validateBoundaryViolationReport(
  raw: unknown
): BbceValidationResult<BoundaryViolationReportV1> {
  const parsed = BoundaryViolationReportSchema.safeParse(raw);
  if (parsed.success) return { ok: true, value: parsed.data };
  return { ok: false, issues: zodIssues(parsed.error) };
}

export function parseDeclaredChangeSurface(raw: unknown): DeclaredChangeSurfaceV1 {
  return DeclaredChangeSurfaceSchema.parse(raw);
}

export function parseSliceMap(raw: unknown): SliceMapV1 {
  return SliceMapSchema.parse(raw);
}
