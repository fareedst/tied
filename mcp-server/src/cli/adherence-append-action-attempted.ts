#!/usr/bin/env node
/**
 * [IMPL-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
 * CLI entry mirroring scripts/adherence_append_action_attempted.rb for hooks and tests.
 */
import { runAdherenceAppendCli } from "../hooks/adherence-append-action-attempted.js";

process.exit(runAdherenceAppendCli(process.argv.slice(2)));
