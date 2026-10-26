# [IMPL-TIED_CHANGE_IMPACT_PROFILE] [ARCH-TIED_CHANGE_IMPACT_PROFILE] [REQ-TIED_OPEN_ONTOLOGIES_WAVE3] — Opt-in change-impact profile and impact-preview.v2 legs

Grammar-Version: v2

## change-impact-profile.v1 load and validate

- [IMPL-TIED_CHANGE_IMPACT_PROFILE] [ARCH-TIED_CHANGE_IMPACT_PROFILE] [REQ-TIED_OPEN_ONTOLOGIES_WAVE3] Parse client-owned YAML; proof_boundary required; legs with path_globs.
- Contract:
  - INPUT: absolute_or_resolved profile file path
  - PRE: path is readable when load attempted
  - OUTPUT: { ok: profile } | { ok: false, diagnostics[] }
  - POST:
    - success: schema_version literal change-impact-profile.v1
    - failure: diagnostics non-empty
  - EFFECTS: IO
procedure LOAD_CHANGE_IMPACT_PROFILE:
  # [IMPL-TIED_CHANGE_IMPACT_PROFILE] [ARCH-TIED_CHANGE_IMPACT_PROFILE] [REQ-TIED_OPEN_ONTOLOGIES_WAVE3] How: read YAML, Zod validate, return diagnostics on failure
  READ file bytes from INPUT path
  PARSE YAML to raw object
  IF Zod validate fails THEN RETURN { ok: false, diagnostics: formatted issues }
  RETURN { ok: true, profile: validated }

## impact legs from touched paths

- [IMPL-TIED_CHANGE_IMPACT_PROFILE] [ARCH-TIED_CHANGE_IMPACT_PROFILE] [REQ-TIED_OPEN_ONTOLOGIES_WAVE3] Match repo-relative touched paths against leg path_globs via shared matchPathAgainstGlobs; semantics not_measured.
procedure COMPUTE_IMPACT_LEGS:
  # [IMPL-TIED_CHANGE_IMPACT_PROFILE] [ARCH-TIED_CHANGE_IMPACT_PROFILE] [REQ-TIED_OPEN_ONTOLOGIES_WAVE3] How: deterministic sorted matched_touched_paths per leg_id
  Contract:
    INPUT: profile.legs[], touched_paths[] (repo-relative, forward slashes)
    OUTPUT: impact_legs[] with matched_count, semantics not_measured
    PRE: profile.load_ok true
    POST: matched_touched_paths sorted lexicographically per leg_id
    EFFECTS: pure
  FOR each leg in profile.legs sorted by leg_id
    matched := FILTER touched_paths WHERE matchPathAgainstGlobs(path, leg.path_globs)
    SORT matched lexicographically
    APPEND leg row with matched_touched_paths, matched_count, semantics not_measured
  RETURN impact_legs

## plumb diff impact preview v1 core and v2 wrapper

- [IMPL-TIED_CHANGE_IMPACT_PROFILE] [ARCH-TIED_CHANGE_IMPACT_PROFILE] [REQ-TIED_OPEN_ONTOLOGIES_WAVE3] Default callers unchanged (v1); opt-in profile emits v2 superset.
procedure RUN_PLUMB_DIFF_IMPACT_PREVIEW:
  # [IMPL-TIED_CHANGE_IMPACT_PROFILE] [ARCH-TIED_CHANGE_IMPACT_PROFILE] [REQ-TIED_OPEN_ONTOLOGIES_WAVE3] How: buildV1Core then optional profile load and v2 envelope
  Contract:
    INPUT: PlumbDiffImpactPreviewArgs including optional profile_path, use_default_profile
    OUTPUT: impact-preview.v1 | impact-preview.v2
    PRE: git cwd valid for diff scan
    POST:
      - no profile opt-in: impact-preview.v1 only
      - profile opt-in: impact-preview.v2 never silent downgrade to v1 on load failure
    EFFECTS: IO, subprocess git
  core := BUILD_V1_CORE(args)  # existing token/registry logic unchanged
  IF NOT profile_path AND NOT use_default_profile THEN RETURN v1 report from core
  IF profile_path AND use_default_profile THEN resolved := profile_path wins over default
  ELSE IF profile_path THEN resolved := resolve profile_path from cwd/git root
  ELSE resolved := gitRoot/tied-project/change-impact-profile.v1.yaml
  load := LOAD_CHANGE_IMPACT_PROFILE(resolved)
  touched := MAP core.touched_files TO path strings
  legs := IF load.ok THEN COMPUTE_IMPACT_LEGS(load.profile, touched) ELSE []
  path_touch_summary := counts from legs + profile.proof_boundary when load.ok else empty boundary from diagnostics
  human_readable_summary := core summary + deterministic v2 appendix sorted by leg_id
  RETURN impact-preview.v2 superset of core fields plus profile, impact_legs, path_touch_summary
  ON load failure WHEN opt-in requested: still v2 with profile.load_ok false, never silent downgrade to v1
