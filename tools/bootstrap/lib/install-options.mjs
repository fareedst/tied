/**
 * [IMPL-TIED_LAYERED_CLIENT_INSTALL] [ARCH-TIED_LAYERED_CLIENT_INSTALL] [REQ-TIED_LAYERED_CLIENT_INSTALL]
 * How: Parse factory install passthrough flags/env for tied-install argv.
 */

/**
 * @param {NodeJS.ProcessEnv} env
 */
export function installOptionsFromEnv(env = process.env) {
  /** @type {{ mode?: string; layers?: string[]; harness?: string; methodologyBundle?: string; doctorAfter?: boolean }} */
  const out = {};
  const mode = env.TIED_INSTALL_MODE?.trim();
  if (mode === "linked" || mode === "full") out.mode = mode;
  const layersRaw = env.TIED_INSTALL_LAYERS?.trim();
  if (layersRaw) {
    out.layers = layersRaw.split(",").map((s) => s.trim()).filter(Boolean);
  }
  const harness = env.TIED_INSTALL_HARNESS?.trim();
  if (harness === "cursor" || harness === "claude" || harness === "both") {
    out.harness = harness;
  }
  const bundle = env.TIED_METHODOLOGY_BUNDLE?.trim();
  if (bundle === "live" || bundle === "pinned") out.methodologyBundle = bundle;
  if (env.TIED_INSTALL_DOCTOR_AFTER === "1" || env.TIED_INSTALL_DOCTOR_AFTER === "true") {
    out.doctorAfter = true;
  }
  return out;
}

/**
 * @param {string[]} argv
 * @param {NodeJS.ProcessEnv} env
 */
export function parseInstallPassthroughFlags(argv, env = process.env) {
  const fromEnv = installOptionsFromEnv(env);
  const args = [...argv];
  /** @type {typeof fromEnv} */
  const options = { ...fromEnv };

  while (args.length > 0 && args[0].startsWith("-")) {
    const flag = args[0];
    if (flag === "--install-mode") {
      options.mode = args[1];
      args.splice(0, 2);
    } else if (flag === "--install-layers") {
      options.layers = (args[1] ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      args.splice(0, 2);
    } else if (flag === "--install-harness") {
      options.harness = args[1];
      args.splice(0, 2);
    } else if (flag === "--methodology-bundle") {
      options.methodologyBundle = args[1];
      args.splice(0, 2);
    } else if (flag === "--doctor-after") {
      options.doctorAfter = true;
      args.shift();
    } else {
      break;
    }
  }
  return { options, remainingArgv: args };
}

/**
 * @param {string} sourceRoot
 * @param {"cursor"|"claude"} harnessProfile
 * @param {ReturnType<typeof installOptionsFromEnv>} installOptions
 */
export function buildTiedInstallArgv(sourceRoot, harnessProfile, installOptions = {}) {
  const harness =
    installOptions.harness ??
    (harnessProfile === "claude" ? "claude" : "both");
  const mode = installOptions.mode ?? "linked";
  /** @type {string[]} */
  const argv = ["--mode", mode, "--harness", harness, "--store", sourceRoot];
  if (installOptions.layers?.length) {
    argv.push("--layers", installOptions.layers.join(","));
  }
  if (installOptions.methodologyBundle) {
    argv.push("--methodology-bundle", installOptions.methodologyBundle);
  }
  if (installOptions.doctorAfter === true) {
    argv.push("--doctor");
  }
  return argv;
}
