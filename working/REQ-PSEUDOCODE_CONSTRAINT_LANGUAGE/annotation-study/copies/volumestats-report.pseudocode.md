# [IMPL-VOLUMESTATS-REPORT] [ARCH-VOLUMESTATS-MODULES] [REQ-VOLUMESTATS-OUTPUT]
# How: Serialize VolumeStats as a deterministic table or raw-byte machine-readable array.
Contract:
  INPUT: volume_stats (list of VolumeStats), output_format, writer
  PRE: writer accepts output bytes; output_format is table, json, or yaml
  OUTPUT: success | error
  POST: selected representation is written; machine formats preserve raw byte integers
  FAILURE_MODES: ENCODE_FAILED; WRITE_FAILED
  EFFECTS: IO
  TERMINATION: total

# [IMPL-VOLUMESTATS-REPORT] [ARCH-VOLUMESTATS-MODULES] [REQ-VOLUMESTATS-OUTPUT]
# How: Scale bytes to binary units only for terminal presentation.
procedure FORMAT_BYTES:
  IF bytes less than 1024: RETURN bytes with B suffix
  scale bytes by 1024 through units KiB, MiB, GiB, TiB as needed
  RETURN one-decimal scaled value with unit suffix

# [IMPL-VOLUMESTATS-REPORT] [ARCH-VOLUMESTATS-MODULES] [REQ-VOLUMESTATS-OUTPUT]
# How: Write fixed columns and human-readable sizes for terminal users.
procedure WRITE_TABLE:
  WRITE header Mount, FS, Total, Used, Avail, Use%
  FOR row IN volume_stats:
    WRITE row mount point, filesystem, formatted total, formatted used, formatted available, formatted percentage
  FLUSH writer
  RETURN success or WRITE_FAILED

# [IMPL-VOLUMESTATS-REPORT] [ARCH-VOLUMESTATS-MODULES] [REQ-VOLUMESTATS-OUTPUT]
# How: Delegate machine-readable encoding while retaining numeric byte fields.
procedure WRITE_JSON:
  ENCODE volume_stats as JSON array
  WRITE encoded bytes and newline
  RETURN success or ENCODE_FAILED/WRITE_FAILED

# [IMPL-VOLUMESTATS-REPORT] [ARCH-VOLUMESTATS-MODULES] [REQ-VOLUMESTATS-OUTPUT]
# How: Delegate machine-readable encoding while retaining numeric byte fields.
procedure WRITE_YAML:
  # [IMPL-VOLUMESTATS-REPORT] [ARCH-VOLUMESTATS-MODULES] [REQ-VOLUMESTATS-OUTPUT]
  ENCODE volume_stats as YAML array
  WRITE encoded bytes
  RETURN success or ENCODE_FAILED/WRITE_FAILED