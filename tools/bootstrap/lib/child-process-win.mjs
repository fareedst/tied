/**
 * [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP]
 * How: Hide ephemeral console windows for bootstrap subprocesses on Windows (Git Bash, cmd, git.exe).
 */

/**
 * @param {import("node:child_process").SpawnSyncOptions | import("node:child_process").SpawnOptions} [options]
 */
export function childProcessSpawnOptions(options = {}) {
  if (process.platform !== "win32") {
    return options;
  }
  return { ...options, windowsHide: true };
}
