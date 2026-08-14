# [IMPL-FEAT_IDENTIFIER_ALLOCATOR] [ARCH-FEAT_IDENTIFIER_ALLOCATION] [REQ-FEAT_IDENTIFIER_ALLOCATION]

## Summary contract
# [IMPL-FEAT_IDENTIFIER_ALLOCATOR] [ARCH-FEAT_IDENTIFIER_ALLOCATION] [REQ-FEAT_IDENTIFIER_ALLOCATION] — How: normalize a title and allocate a deterministic unused feature identifier and directory name.
Contract:
  INPUT: title; existing_feature_directories
  PRE: title is a string
  OUTPUT: { feature_identifier, slug, directory_name } | allocation_error
  POST: success returns a zero-padded identifier not present in existing directories
  FAILURE_MODES: EMPTY_TITLE; EMPTY_SLUG; INVALID_DIRECTORY
  EFFECTS: pure
  TERMINATION: total

## GENERATE_FEATURE_SLUG
# [IMPL-FEAT_IDENTIFIER_ALLOCATOR] [ARCH-FEAT_IDENTIFIER_ALLOCATION] [REQ-FEAT_IDENTIFIER_ALLOCATION] — How: apply one stable normalization pipeline to equivalent titles.
procedure GENERATE_FEATURE_SLUG(title):
  # [IMPL-FEAT_IDENTIFIER_ALLOCATOR] [ARCH-FEAT_IDENTIFIER_ALLOCATION] [REQ-FEAT_IDENTIFIER_ALLOCATION] — How: apply one stable normalization pipeline to equivalent titles.
  Trim surrounding whitespace.
  Normalize Unicode to the selected canonical form.
  Convert runs of separators and punctuation to one hyphen.
  Lowercase the result.
  Remove leading and trailing hyphens.
  IF the result is empty: RETURN EMPTY_SLUG.
  RETURN slug.

## ALLOCATE_FEATURE_IDENTIFIER
# [IMPL-FEAT_IDENTIFIER_ALLOCATOR] [ARCH-FEAT_IDENTIFIER_ALLOCATION] [REQ-FEAT_IDENTIFIER_ALLOCATION] — How: scan existing directories and choose the lowest unused FEAT number.
procedure ALLOCATE_FEATURE_IDENTIFIER(title, existing_feature_directories):
  # [IMPL-FEAT_IDENTIFIER_ALLOCATOR] [ARCH-FEAT_IDENTIFIER_ALLOCATION] [REQ-FEAT_IDENTIFIER_ALLOCATION] — How: scan existing directories and choose the lowest unused FEAT number.
  Generate slug.
  IF title is empty: RETURN EMPTY_TITLE.
  IF slug is empty: RETURN EMPTY_SLUG.
  Extract valid FEAT numbers from existing directory names.
  Select the lowest positive number not in the extracted set.
  Format the number with three digits.
  RETURN { feature_identifier, slug, directory_name }.
