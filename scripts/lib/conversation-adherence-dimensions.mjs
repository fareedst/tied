/**
 * [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] W7-D1 dimension detectors — transcript observation only.
 * proof_boundary: transcript_observation_only (not a gate substitute).
 */

export const DIMENSION_IDS = [
  "early_exit_at_gate",
  "call_mention_without_execution",
  "completion_verb_without_artifacts",
  "depth_tier_avoidance",
  "build_without_closeout_skill",
  "dual_write_turn_shape",
  "stdout_without_manifest",
];

const COMPLETION_VERB_RE =
  /\b(implementation complete|work complete|task complete|fully implemented|shipped|done implementing)\b/giu;
const GATE_ALLOWED_RE = /\ballowed:\s*true\b|\bgate passed\b|\bverification gate.*allowed\b/giu;
const ENVELOPE_VALIDATE_RE =
  /request_evidence_envelope_validate|run-close-out-gates\.mjs|sub-close-out-evidence-sync/giu;
const CALL_SYNC_RE = /\bCALL\s+sub-close-out-evidence-sync\b/giu;
const CALL_EXEC_SYNC_RE =
  /sub-close-out-evidence-sync|run-close-out-gates\.mjs|request_evidence_envelope_validate/giu;
const BUILD_PLAN_RE = /\bbuild-plan\b|\bprompt-type:\s*build-plan\b/giu;
const CLOSEOUT_SKILL_RE = /\bplan-close-out\b|\bleap-diff-promote\b|\bammend-commit\b/giu;
const TEST_STDOUT_RE = /\b(npm test|go test|node --test|tests pass|test suite)\b/giu;
const MANIFEST_PATH_RE = /verification-evidence-manifest\.v1\.json/giu;
const MINIMAL_DEPTH_RE = /depth_tier:\s*minimal\b/giu;
const INTEGRATED_TRIGGER_RE
  = /\bstrict-close-out\b|\bmethodology-tooling-change\b|\bintegrated depth\b|\bdepth_tier:\s*integrated\b/giu;
const EXECUTION_EVIDENCE_ONLY_RE
  = /execution_evidence[\s\S]{0,400}?completed:[\s\S]{0,200}?(disposition|evidence_refs)/giu;

/** @typedef {{ role: string, text: string, tools: string[] }} TranscriptTurn */

/**
 * @param {unknown} raw
 * @returns {TranscriptTurn[]}
 */
export function parseTranscriptLines(raw) {
  const turns = [];
  const lines = String(raw).split("\n").filter((line) => line.trim());
  for (const line of lines) {
    let doc;
    try {
      doc = JSON.parse(line);
    } catch {
      continue;
    }
    const role = doc?.role ?? "unknown";
    const parts = doc?.message?.content ?? [];
    const textParts = [];
    const tools = [];
    if (Array.isArray(parts)) {
      for (const part of parts) {
        if (part?.type === "text" && typeof part.text === "string") textParts.push(part.text);
        if (part?.type === "tool_use" && typeof part.name === "string") tools.push(part.name);
      }
    } else if (typeof doc?.message === "string") {
      textParts.push(doc.message);
    }
    turns.push({ role, text: textParts.join("\n"), tools });
  }
  return turns;
}

function assistantTexts(turns) {
  return turns.filter((t) => t.role === "assistant").map((t) => t.text);
}

function allToolNames(turns) {
  return turns.flatMap((t) => t.tools);
}

function allText(turns) {
  return turns.map((t) => t.text).join("\n");
}

/**
 * @param {TranscriptTurn[]} turns
 */
export function scoreEarlyExitAtGate(turns) {
  const texts = assistantTexts(turns);
  let gateIndex = -1;
  for (let i = 0; i < texts.length; i += 1) {
    if (GATE_ALLOWED_RE.test(texts[i])) {
      gateIndex = i;
      break;
    }
  }
  const denominator = gateIndex >= 0 ? texts.length - gateIndex : 0;
  if (denominator === 0) {
    return { numerator: 0, denominator: 0, flagged: false, evidence_refs: [] };
  }
  const tail = texts.slice(gateIndex + 1).join("\n");
  const hasCloseOut = ENVELOPE_VALIDATE_RE.test(tail);
  return {
    numerator: hasCloseOut ? 0 : 1,
    denominator: 1,
    flagged: !hasCloseOut,
    evidence_refs: hasCloseOut ? [] : ["early_exit_after_gate_allowed"],
  };
}

/**
 * @param {TranscriptTurn[]} turns
 */
export function scoreCallMentionWithoutExecution(turns) {
  const assistantTurns = turns.filter((t) => t.role === "assistant");
  const assistant = allText(assistantTurns);
  const mentions = (assistant.match(CALL_SYNC_RE) ?? []).length;
  const executionText = [
    allToolNames(turns).join("\n"),
    ...assistantTurns.flatMap((t) => t.tools.length > 0 ? [t.text] : []),
    allText(turns.filter((t) => t.role === "user")),
  ].join("\n");
  const executions = (executionText.match(CALL_EXEC_SYNC_RE) ?? []).length;
  const denominator = mentions;
  const flagged = mentions > 0 && executions === 0;
  return {
    numerator: flagged ? mentions : Math.max(0, mentions - executions),
    denominator,
    flagged,
    evidence_refs: flagged ? ["call_mention_without_execution"] : [],
  };
}

/**
 * @param {TranscriptTurn[]} turns
 * @param {{ envelopePath?: string, manifestPath?: string }} disk
 */
export function scoreCompletionVerbWithoutArtifacts(turns, disk = {}) {
  const text = allText(turns);
  const verbs = (text.match(COMPLETION_VERB_RE) ?? []).length;
  const denominator = verbs;
  if (denominator === 0) {
    return { numerator: 0, denominator: 0, flagged: false, evidence_refs: [] };
  }
  const hasEnvelope = Boolean(disk.envelopePath);
  const hasManifest = Boolean(disk.manifestPath);
  const flagged = !hasEnvelope || !hasManifest;
  return {
    numerator: flagged ? 1 : 0,
    denominator: 1,
    flagged,
    evidence_refs: flagged ? ["completion_verb_without_disk_proof"] : [],
  };
}

/**
 * @param {TranscriptTurn[]} turns
 */
export function scoreDepthTierAvoidance(turns) {
  const text = allText(turns);
  const minimal = MINIMAL_DEPTH_RE.test(text);
  const integratedTrigger = INTEGRATED_TRIGGER_RE.test(text);
  const denominator = integratedTrigger ? 1 : 0;
  const flagged = minimal && integratedTrigger;
  return {
    numerator: flagged ? 1 : 0,
    denominator,
    flagged,
    evidence_refs: flagged ? ["minimal_depth_with_integrated_triggers"] : [],
  };
}

/**
 * @param {TranscriptTurn[]} turns
 */
export function scoreBuildWithoutCloseoutSkill(turns) {
  const text = allText(turns);
  const hasBuild = BUILD_PLAN_RE.test(text);
  const hasCloseout = CLOSEOUT_SKILL_RE.test(text);
  const denominator = hasBuild ? 1 : 0;
  const flagged = hasBuild && !hasCloseout;
  return {
    numerator: flagged ? 1 : 0,
    denominator,
    flagged,
    evidence_refs: flagged ? ["build_plan_without_closeout_skill"] : [],
  };
}

/**
 * @param {TranscriptTurn[]} turns
 */
export function scoreDualWriteTurnShape(turns) {
  const text = allText(turns);
  const matches = text.match(EXECUTION_EVIDENCE_ONLY_RE) ?? [];
  const denominator = matches.length;
  return {
    numerator: denominator,
    denominator,
    flagged: denominator > 0,
    evidence_refs: denominator > 0 ? ["execution_evidence_completed_only_shape"] : [],
  };
}

/**
 * @param {TranscriptTurn[]} turns
 */
export function scoreStdoutWithoutManifest(turns) {
  const text = allText(turns);
  const stdoutHits = (text.match(TEST_STDOUT_RE) ?? []).length;
  const manifestMention = MANIFEST_PATH_RE.test(text);
  const denominator = stdoutHits > 0 ? 1 : 0;
  const flagged = stdoutHits > 0 && !manifestMention;
  return {
    numerator: flagged ? 1 : 0,
    denominator,
    flagged,
    evidence_refs: flagged ? ["stdout_without_manifest_path"] : [],
  };
}

/**
 * @param {TranscriptTurn[]} turns
 * @param {{ envelopePath?: string, manifestPath?: string }} [disk]
 */
export function scoreAllDimensions(turns, disk) {
  const scorers = {
    early_exit_at_gate: () => scoreEarlyExitAtGate(turns),
    call_mention_without_execution: () => scoreCallMentionWithoutExecution(turns),
    completion_verb_without_artifacts: () => scoreCompletionVerbWithoutArtifacts(turns, disk),
    depth_tier_avoidance: () => scoreDepthTierAvoidance(turns),
    build_without_closeout_skill: () => scoreBuildWithoutCloseoutSkill(turns),
    dual_write_turn_shape: () => scoreDualWriteTurnShape(turns),
    stdout_without_manifest: () => scoreStdoutWithoutManifest(turns),
  };
  return DIMENSION_IDS.map((id) => {
    const result = scorers[id]();
    return {
      id,
      hypothesis: id,
      numerator: result.numerator,
      denominator: result.denominator,
      flagged: result.flagged,
      proof_boundary: "transcript_observation_only",
      evidence_refs: result.evidence_refs,
    };
  });
}
