# [IMPL-TIED_PROJECT_SIZE_OPERATIONAL_UTF8_MASS] [ARCH-TIED_PROJECT_SIZE_OPERATIONAL_UTF8_MASS] [REQ-TIED_PROJECT_SIZE_OPERATIONAL_UTF8_MASS] — UTF-8 byte mass beside line counts.

Grammar-Version: v2

## UTF-8 operational mass

- [IMPL-TIED_PROJECT_SIZE_OPERATIONAL_UTF8_MASS] [ARCH-TIED_PROJECT_SIZE_OPERATIONAL_UTF8_MASS] [REQ-TIED_PROJECT_SIZE_OPERATIONAL_UTF8_MASS] Single traversal with line counts in snapshot builder.
procedure SCAN_PSEUDOCODE_LINES:
  # [IMPL-TIED_PROJECT_SIZE_OPERATIONAL_UTF8_MASS] [IMPL-TIED_PROJECT_SIZE_SNAPSHOT] [REQ-TIED_PROJECT_SIZE_OPERATIONAL_UTF8_MASS] One pass for lines and UTF-8 bytes on trimmed non-empty lines.
  Contract:
    INPUT: sidecar_text, template_line_set
    OUTPUT: gross_lines, template_overlap_lines, gross_utf8_bytes, template_overlap_utf8_bytes
    PRE: template_line_set from methodology template body lines
    POST: applied_utf8_bytes equals gross_utf8_bytes minus template_overlap_utf8_bytes at aggregate level
    EFFECTS: pure
  FOR each physical line IN sidecar_text
    IF trim(line) empty THEN CONTINUE
    INCREMENT gross_lines
    ADD Buffer.byteLength(trim(line), utf8) TO gross_utf8_bytes
    IF trim(line) IN template_line_set THEN INCREMENT template_overlap_lines AND add bytes to template_overlap_utf8_bytes
  RETURN scan totals

procedure DERIVE_UTF8_CROSS_LAYER:
  # [IMPL-TIED_PROJECT_SIZE_OPERATIONAL_UTF8_MASS] [ARCH-TIED_PROJECT_SIZE_OPERATIONAL_UTF8_MASS] [REQ-TIED_PROJECT_SIZE_OPERATIONAL_UTF8_MASS] Same atom denominator as line ratio.
  Contract:
    INPUT: applied_utf8_bytes, atom_total
    OUTPUT: operational_intent_utf8_per_atom or null
    POST: null when atom_total is zero
    EFFECTS: pure
  IF atom_total greater than zero THEN RETURN applied_utf8_bytes divided by atom_total
  RETURN null
