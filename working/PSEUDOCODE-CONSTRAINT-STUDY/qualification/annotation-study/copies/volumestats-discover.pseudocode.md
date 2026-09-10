# [IMPL-VOLUMESTATS-DISCOVER] [ARCH-VOLUMESTATS-MODULES] [REQ-VOLUMESTATS-DARWIN-MOUNTS]
# How: Produce deterministic root and /Volumes mount points while skipping inaccessible entries.
Contract:
  INPUT: volumes_directory (path), diagnostics (writer)
  PRE: volumes_directory identifies the directory to enumerate; diagnostics accepts text output
  OUTPUT: mount_points (list of paths) | error
  POST: mount_points includes root; successful entries are direct subdirectories; results are deduplicated and sorted
  FAILURE_MODES: VOLUMES_READ_FAILED
  EFFECTS: IO
  TERMINATION: total

# [IMPL-VOLUMESTATS-DISCOVER] [ARCH-VOLUMESTATS-MODULES] [REQ-VOLUMESTATS-DARWIN-MOUNTS]
# How: Include root, inspect direct entries, and retain only accessible directories.
procedure LIST_DARWIN_VOLUMES:
  mount_points := [root]
  entries := READ_DIRECTORY(volumes_directory)
  ON error: WRITE diagnostics `DEBUG: unable to read volumes directory`; RETURN mount_points, VOLUMES_READ_FAILED
  FOR entry IN entries:
    candidate := JOIN(volumes_directory, entry.name)
    IF entry is not a directory: CONTINUE
    info := STAT(candidate)
    IF info fails: WRITE diagnostics `DEBUG: skipping inaccessible volume`; CONTINUE
    ADD candidate to mount_points using lowercase candidate as deduplication key
  SORT mount_points lexicographically
  RETURN mount_points, nil

# [IMPL-VOLUMESTATS-DISCOVER] [ARCH-VOLUMESTATS-MODULES] [REQ-VOLUMESTATS-DARWIN-MOUNTS]
# How: Keep platform-specific failure explicit for callers while preserving the root candidate.
procedure NON_DARWIN_DISCOVERY:
  # [IMPL-VOLUMESTATS-DISCOVER] [ARCH-VOLUMESTATS-MODULES] [REQ-VOLUMESTATS-DARWIN-MOUNTS]
  RETURN empty mount_points, UNSUPPORTED_PLATFORM