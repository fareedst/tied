#!/usr/bin/env node
/**
 * [IMPL-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
 * CLI entry for Cursor hooks and composition tests (append-only action_attempted bridge).
 */
import { runAdherenceAppendCli } from "../hooks/adherence-append-action-attempted.js";

process.exit(runAdherenceAppendCli(process.argv.slice(2)));
