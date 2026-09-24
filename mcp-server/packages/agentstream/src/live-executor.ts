/**
 * [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-GOAGENT-EXECUTOR] [REQ-TIED_UNIFIED_TOOLCHAIN]
 * LIVE_EXECUTOR_TS + CHECKLIST_RUN_TS: non-dry-run agent loop (Go cmd/agentstream parity, Phase 4a).
 */
import fs from "node:fs";
import path from "node:path";

import type { DryRunConfig } from "./dry-run-config.js";
import { trackerRequestTokenFromVars } from "./dry-run-config.js";
import { ACTION_GOTO, parseControl, validateControl } from "./control.js";
import { agentArgv } from "./executor-run.js";
import { bindLiveExecutorDriver } from "./live-driver-bind.js";
import { runTiedPreflight, type DryRunStreams } from "./executor-dry-run.js";
import { knownStepStubs, replaceRemainingFromStep } from "./pipeline-route.js";
import { chainBetween, sessionForTurn } from "./pipeline-session.js";
import { buildTurnsFromConfig } from "./run-pipeline-prep.js";
import {
  resolveEvidenceRefsSync,
} from "./adherence-evidence-resolve.js";
import {
  activeTurnMarkerPath,
  appendAgentAcknowledged,
  appendInstructionRendered,
  appendOutcomeVerified,
  bindingEnv,
  clearActiveTurnMarker,
  hashRenderedInstructionParts,
  hashSessionId,
  issueInstructionNonce,
  newRunId,
  sourceRevision,
  writeActiveTurnMarker,
  type InstructionCorrelation,
} from "./adherence-live.js";
import { ensureTracker } from "./tracker-ensure.js";
import {
  parseTrackerCompletionReceipt,
  receiptForEvidenceResolve,
  receiptHash,
  validateReceiptBinding,
  type IssuedInstruction,
} from "./tracker-receipt.js";
import {
  applyTrackerDisposition,
  invalidateTrackerDownstream,
  type TurnIdentity,
} from "./tracker-writer.js";

export type LiveRunStreams = DryRunStreams;

const TRACEABLE_COMMIT_SLUG = "traceable-commit";

function evaluateTraceableCommitEnvelope(input: {
  projectRoot: string;
  requestToken: string;
  stepSlug: string;
  enforceEnvelope: boolean;
  allowMissingEnvelope: boolean;
  integratedDepth: boolean;
}): { warn: boolean; block: boolean; message: string } {
  const stepSlug = input.stepSlug.trim();
  if (stepSlug !== TRACEABLE_COMMIT_SLUG) {
    return { warn: false, block: false, message: "" };
  }
  let enforce = input.enforceEnvelope;
  if (input.allowMissingEnvelope) {
    enforce = false;
  } else if (!enforce && input.integratedDepth) {
    enforce = true;
  }
  const token = input.requestToken.trim();
  if (token === "") {
    const msg = "traceable-commit requires REQUEST checklist var for envelope check";
    return { warn: !enforce, block: enforce, message: msg };
  }
  const envelopePath = path.join(
    input.projectRoot,
    "working",
    token,
    "evidence",
    "request-evidence-envelope.v1.json",
  );
  try {
    const st = fs.statSync(envelopePath);
    if (st.isFile()) {
      return { warn: false, block: false, message: "" };
    }
  } catch {
    /* missing */
  }
  const msg = `traceable-commit approached without request-evidence-envelope at ${envelopePath}; run sub-close-out-evidence-sync or request_evidence_envelope_backfill before close-out`;
  return { warn: !enforce, block: enforce, message: msg };
}

async function handleTrackerTurn(
  cfg: DryRunConfig,
  turnIndex: number,
  stepStub: string,
  finalText: string,
  controlOK: boolean,
  decisionAction: string | undefined,
  sessionId: string,
  issued: IssuedInstruction,
  correlation: InstructionCorrelation,
): Promise<string | null> {
  if (controlOK && decisionAction === ACTION_GOTO) {
    return null;
  }
  if (stepStub.trim() === "") {
    return null;
  }
  const parsed = parseTrackerCompletionReceipt(finalText, stepStub);
  if (!parsed.ok) {
    return `missing_receipt for step ${JSON.stringify(stepStub)}`;
  }
  try {
    validateReceiptBinding(parsed.receipt, issued);
  } catch (err) {
    return String(err);
  }
  const identity: TurnIdentity = {
    turnIndex: turnIndex + cfg.firstTurn,
    stepStub,
    sessionId,
  };
  const hash = receiptHash(parsed.receipt);
  if (parsed.receipt.disposition === "completed") {
    try {
      const resolved = resolveEvidenceRefsSync(
        receiptForEvidenceResolve(parsed.receipt),
        cfg.workspace,
      );
      if (cfg.adherenceLedger.trim() !== "") {
        for (const r of resolved) {
          appendOutcomeVerified(cfg.adherenceLedger, correlation, r, hash);
        }
      }
    } catch (err) {
      return String(err);
    }
  }
  try {
    applyTrackerDisposition(
      cfg.checklistTrackerYaml,
      parsed.receipt,
      identity,
      hash,
    );
  } catch (err) {
    return String(err);
  }
  if (cfg.adherenceLedger.trim() !== "") {
    try {
      appendAgentAcknowledged(
        cfg.adherenceLedger,
        correlation,
        hash,
        hashSessionId(sessionId),
      );
    } catch (err) {
      return String(err);
    }
  }
  return null;
}

export function qualifiesForTsNativeLiveRun(cfg: DryRunConfig): boolean {
  if (cfg.dryRun) {
    return false;
  }
  if (
    cfg.previewChecklistTrackerYaml ||
    cfg.previewFeatureSpecBatchYaml ||
    cfg.previewLeadChecklist
  ) {
    return false;
  }
  const hasChecklist = cfg.leadChecklistYaml.trim() !== "";
  const hasBatch = cfg.featureSpecBatchYamls.length > 0;
  const hasArgv = cfg.argvWords.length > 0;
  const hasPrompts = cfg.promptsFiles.length > 0;
  const hasTdd = cfg.tddYamls.length > 0;
  if (
    !hasChecklist &&
    !hasBatch &&
    !hasArgv &&
    !hasPrompts &&
    !hasTdd &&
    cfg.promptFiles.length === 0
  ) {
    return false;
  }
  return true;
}

/** Execute live agent loop when argv qualifies; throws on build errors (exit 2). */
export async function executeLiveRun(cfg: DryRunConfig): Promise<LiveRunStreams> {
  if (cfg.firstTurn > 1 && cfg.sessionId.trim() === "") {
    throw new Error("agentstream: --first-turn > 1 requires --session-id");
  }

  const { turns: built, originalTotal } = buildTurnsFromConfig(cfg);
  let turns = built.map((t) => ({
    ...t,
    parts: [...t.parts],
  }));

  const pre = runTiedPreflight(cfg);
  if (pre.exitCode !== 0) {
    return { stdout: "", stderr: pre.stderr, exitCode: pre.exitCode };
  }

  let stderrAcc = pre.stderr;
  const usingTracker = cfg.checklistTrackerYaml.trim() !== "";
  if (usingTracker) {
    const requestToken = trackerRequestTokenFromVars(cfg.checklistVars);
    try {
      ensureTracker(
        cfg.leadChecklistYaml,
        cfg.checklistTrackerYaml,
        requestToken,
      );
    } catch (err) {
      stderrAcc += `agentstream: tracker ensure failed: ${String(err)}\n`;
      return { stdout: "", stderr: stderrAcc, exitCode: 1 };
    }
  }
  let runID = cfg.runID.trim();
  if (runID === "") {
    runID = newRunId();
  }

  const liveBinding = bindLiveExecutorDriver({
    harnessProfile: cfg.agentHarness,
    agentPath: cfg.agentPath,
  });

  let running = "";

  for (let i = 0; i < turns.length; i++) {
    const t = turns[i]!;
    const chain = chainBetween(turns);
    const sess = sessionForTurn(i, cfg.sessionId, chain, running);
    let label = " (new session)";
    if (sess !== "") {
      label = ` (resume ${sess})`;
    }
    let stub = "";
    if (t.stepStub !== "") {
      stub = ` [${t.stepStub}]`;
    }
    stderrAcc += `\n--- turn ${cfg.firstTurn + i}/${originalTotal}${label}${stub} ---\n`;

    if (usingTracker && t.stepStub.trim() !== "") {
      const requestToken = trackerRequestTokenFromVars(cfg.checklistVars);
      const envelopeEval = evaluateTraceableCommitEnvelope({
        projectRoot: cfg.workspace,
        requestToken,
        stepSlug: t.stepStub,
        enforceEnvelope: cfg.enforceEnvelope,
        allowMissingEnvelope: cfg.allowMissingEnvelope,
        integratedDepth: cfg.integratedDepth,
      });
      if (envelopeEval.warn && envelopeEval.message) {
        stderrAcc += `DIAGNOSTIC: envelope pilot warn: ${envelopeEval.message}\n`;
      }
      if (envelopeEval.block) {
        stderrAcc += `agentstream: ${envelopeEval.message}\n`;
        return { stdout: "", stderr: stderrAcc, exitCode: 1 };
      }
    }

    let issued: IssuedInstruction = {
      nonce: "",
      hash: "",
      requestToken: "",
      runID: "",
    };
    let correlation: InstructionCorrelation = {
      requestToken: "",
      runID: "",
      turnIndex: cfg.firstTurn + i,
      stepSlug: t.stepStub,
      instructionHash: "",
      instructionNonce: "",
      sourceRevision: "",
    };
    let activeMarkerPath = "";

    if (usingTracker && t.stepStub.trim() !== "") {
      const requestToken = trackerRequestTokenFromVars(cfg.checklistVars);
      if (requestToken === "") {
        stderrAcc += "agentstream: tracker mode requires REQUEST checklist var\n";
        return { stdout: "", stderr: stderrAcc, exitCode: 1 };
      }
      const instructionHash = hashRenderedInstructionParts(t.parts);
      const instructionNonce = issueInstructionNonce(runID, cfg.firstTurn + i);
      issued = {
        nonce: instructionNonce,
        hash: instructionHash,
        requestToken,
        runID,
      };
      correlation = {
        requestToken,
        runID,
        turnIndex: cfg.firstTurn + i,
        stepSlug: t.stepStub,
        instructionHash,
        instructionNonce,
        sourceRevision: sourceRevision(cfg.workspace),
      };
      if (cfg.adherenceLedger.trim() !== "") {
        try {
          appendInstructionRendered(cfg.adherenceLedger, correlation);
        } catch (err) {
          stderrAcc += `agentstream: adherence ledger write failed: ${String(err)}\n`;
          return { stdout: "", stderr: stderrAcc, exitCode: 1 };
        }
        activeMarkerPath = activeTurnMarkerPath(cfg.workspace, requestToken);
        try {
          writeActiveTurnMarker(activeMarkerPath, {
            request_token: requestToken,
            run_id: runID,
            turn_index: cfg.firstTurn + i,
            step_slug: t.stepStub,
            instruction_nonce: instructionNonce,
            instruction_hash: instructionHash,
            adherence_ledger_path: cfg.adherenceLedger,
            source_revision: correlation.sourceRevision,
            workspace_root: cfg.workspace,
          });
        } catch (err) {
          stderrAcc += `agentstream: active-turn marker write failed: ${String(err)}\n`;
          return { stdout: "", stderr: stderrAcc, exitCode: 1 };
        }
      }
    }

    const clearMarker = (): void => {
      if (activeMarkerPath === "") {
        return;
      }
      try {
        clearActiveTurnMarker(activeMarkerPath);
      } catch (err) {
        stderrAcc += `DIAGNOSTIC: active-turn marker clear failed: ${String(err)}\n`;
      }
      activeMarkerPath = "";
    };

    const extraEnv =
      usingTracker && t.stepStub.trim() !== ""
        ? [
            ...bindingEnv(issued),
            ...(cfg.adherenceLedger.trim() !== ""
              ? [`ADHERENCE_WORKSPACE=${cfg.workspace}`]
              : []),
          ]
        : [];

    const argv = agentArgv(
      cfg.agentPath,
      cfg.workspace,
      cfg.model,
      sess,
      t.parts,
      cfg.agentHarness,
    );
    const { result, exitCode } = await liveBinding.runTurn(argv, extraEnv);
    if (exitCode !== 0) {
      clearMarker();
      return { stdout: "", stderr: stderrAcc, exitCode };
    }
    if (result.sessionId === "") {
      stderrAcc += "No session_id in stream; cannot continue with --resume\n";
      clearMarker();
      return { stdout: "", stderr: stderrAcc, exitCode: 1 };
    }
    stderrAcc += `session_id=${result.sessionId}\n`;
    running = result.sessionId;

    const parsed = parseControl(result.transcript);
    if (parsed.error) {
      clearMarker();
      stderrAcc += `agentstream: control parse error: ${parsed.error.message}\n`;
      return { stdout: "", stderr: stderrAcc, exitCode: 1 };
    }

    if (usingTracker) {
      const trackerErr = await handleTrackerTurn(
        cfg,
        i,
        t.stepStub,
        result.finalText,
        parsed.ok,
        parsed.ok ? parsed.decision.action : undefined,
        result.sessionId,
        issued,
        correlation,
      );
      if (trackerErr !== null) {
        clearMarker();
        stderrAcc += `agentstream: tracker composition failed: ${trackerErr}\n`;
        return { stdout: "", stderr: stderrAcc, exitCode: 1 };
      }
    }

    if (!parsed.ok) {
      clearMarker();
      continue;
    }

    const known = knownStepStubs(turns);
    const valErr = validateControl(parsed.decision, known);
    if (valErr) {
      clearMarker();
      stderrAcc += `agentstream: invalid control block: ${valErr.message}\n`;
      return { stdout: "", stderr: stderrAcc, exitCode: 1 };
    }

    if (parsed.decision.action === ACTION_GOTO) {
      const target = parsed.decision.target ?? "";
      if (usingTracker) {
        try {
          const cleared = invalidateTrackerDownstream(
            cfg.checklistTrackerYaml,
            cfg.leadChecklistYaml,
            target,
          );
          if (cleared.length > 0) {
            stderrAcc += `DIAGNOSTIC: agentstream_control goto ${target}; cleared tracker slugs: ${cleared.join(", ")}\n`;
          }
        } catch (err) {
          clearMarker();
          stderrAcc += `agentstream: tracker loop-back invalidation failed: ${String(err)}\n`;
          return { stdout: "", stderr: stderrAcc, exitCode: 1 };
        }
      }
      try {
        turns = replaceRemainingFromStep(turns, i, target);
      } catch (err) {
        clearMarker();
        stderrAcc += `agentstream: control routing failed: ${String(err)}\n`;
        return { stdout: "", stderr: stderrAcc, exitCode: 1 };
      }
      stderrAcc += `DIAGNOSTIC: agentstream_control goto ${target}: ${parsed.decision.reason ?? ""}\n`;
    }
    clearMarker();
  }

  return { stdout: "", stderr: stderrAcc, exitCode: 0 };
}
