#!/usr/bin/env node
/**
 * [IMPL-TIED_ISOLATED_VERIFICATION_RUNNER] [ARCH-TIED_ISOLATED_VERIFICATION_RUNNER] [REQ-TIED_ISOLATED_VERIFICATION_RUNNER]
 * Dedicated local verification runner (REQ-CTRL-009 Option B).
 */

import { runIsolatedVerificationRunnerMain } from "../isolated-verification-runner.js";

runIsolatedVerificationRunnerMain()
  .then((code) => process.exit(code))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
