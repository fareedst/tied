#!/usr/bin/env node
/**
 * [IMPL-TIED_CLAUDE_ADHERENCE_HOOKS] [REQ-TIED_CLAUDE_ADHERENCE_HOOKS]
 */
import { runClaudeAdherenceBridgeCli } from "../hooks/claude-adherence-bridge.js";

process.exit(runClaudeAdherenceBridgeCli(process.argv.slice(2)));
