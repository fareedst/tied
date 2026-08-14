import { applyAcceptedTransition, evaluateTransition, type TransitionEvidence } from "./lifecycle.js";
import type { LifecyclePhase } from "./manifest.js";
import { FeatureStore } from "./store.js";
import fs from "node:fs";
import path from "node:path";
import { ClarificationStore, evaluateClarificationGate } from "./clarification.js";

export type LifecycleCommand = "specify" | "refine" | "plan" | "tasks" | "verify" | "close_out";
export type CommandRequest = {
  command: string;
  feature_identifier: string;
  expected_revision?: number;
  command_input?: Record<string, unknown>;
};
export type CommandResult =
  | { ok: true; current_state: LifecyclePhase; revision: number; next_permitted_phase: LifecyclePhase | null; diagnostics: string[]; manifest: unknown }
  | { ok: false; error: "UNKNOWN_COMMAND" | "FEATURE_NOT_FOUND" | "STALE_REVISION"; diagnostics: string[] };

const commandPhases: Record<LifecycleCommand, LifecyclePhase> = {
  specify: "refining",
  refine: "specified",
  plan: "planned",
  tasks: "tasked",
  verify: "verifying",
  close_out: "closed",
};

function nextPhase(current: LifecyclePhase): LifecyclePhase | null {
  const phases: LifecyclePhase[] = ["draft", "refining", "specified", "planned", "tasked", "verifying", "closed"];
  const index = phases.indexOf(current);
  return index >= 0 && index < phases.length - 1 ? phases[index + 1] : null;
}

// [IMPL-FEAT_ORCHESTRATION_COMMANDS] [ARCH-FEAT_ORCHESTRATION_COMMANDS] [REQ-FEAT_ORCHESTRATION_COMMANDS] — How: map the command to a Batch 0 transition and delegate persistence.
export function executeLifecycleCommand(store: FeatureStore, request: CommandRequest): CommandResult {
  if (!(request.command in commandPhases)) {
    return { ok: false, error: "UNKNOWN_COMMAND", diagnostics: ["Supported commands: specify, refine, plan, tasks, verify, close_out"] };
  }
  let manifest;
  try {
    const directory = findDirectory(store, request.feature_identifier);
    if (!directory) return { ok: false, error: "FEATURE_NOT_FOUND", diagnostics: ["Feature manifest was not found"] };
    manifest = store.read(directory);
  } catch {
    return { ok: false, error: "FEATURE_NOT_FOUND", diagnostics: ["Feature manifest was not found"] };
  }
  const command = request.command as LifecycleCommand;
  const clarificationPath = path.join(store.root, findDirectory(store, request.feature_identifier)!, "clarifications.yaml");
  if (fs.existsSync(clarificationPath)) {
    const clarificationStore = new ClarificationStore(store.root);
    const gate = evaluateClarificationGate(
      manifest.revision,
      clarificationStore.read(findDirectory(store, request.feature_identifier)!),
      commandPhases[command],
      Array.isArray(request.command_input?.clarification_artifacts)
        ? request.command_input?.clarification_artifacts as never[]
        : ["requirements", "architecture", "implementations", "red_tests"],
    );
    if (!gate.ready) {
      console.debug(`DEBUG: clarification gate blocked ${command} for ${request.feature_identifier}`);
      return {
        ok: true,
        current_state: manifest.status,
        revision: manifest.revision,
        next_permitted_phase: nextPhase(manifest.status),
        diagnostics: gate.diagnostics,
        manifest,
      };
    }
  }
  const input = request.command_input ?? {};
  const evidence: TransitionEvidence = {
    validated: input.validated === true,
    planned: input.planned === true,
    tasked: input.tasked === true,
    verified: input.verified === true,
    dependencies_satisfied: input.dependencies_satisfied === true,
  };
  const decision = evaluateTransition(manifest.status, commandPhases[command], evidence, { approved: input.approved === true });
  if (decision.outcome !== "allow") {
    const diagnostics: string[] = [decision.reason];
    if (command === "plan" || command === "tasks" || command === "verify" || command === "close_out") {
      diagnostics.push("Batch 2 clarification and constitution gates are deferred; required evidence must be supplied by a later batch.");
    }
    return { ok: true, current_state: manifest.status, revision: manifest.revision, next_permitted_phase: nextPhase(manifest.status), diagnostics, manifest };
  }
  const candidate = applyAcceptedTransition(manifest, decision);
  if (!candidate.ok) return { ok: false, error: "STALE_REVISION", diagnostics: [candidate.error] };
  const mutation = store.mutate(manifest.feature_id, request.expected_revision ?? manifest.revision, candidate.manifest);
  if (!mutation.ok) {
    return { ok: false, error: mutation.error === "STALE_REVISION" ? "STALE_REVISION" : "FEATURE_NOT_FOUND", diagnostics: [mutation.error] };
  }
  return {
    ok: true,
    current_state: mutation.manifest.status,
    revision: mutation.manifest.revision,
    next_permitted_phase: mutation.next_permitted_phase as LifecyclePhase | null,
    diagnostics: [],
    manifest: mutation.manifest,
  };
}

function findDirectory(store: FeatureStore, featureIdentifier: string): string | undefined {
  return store.listDirectories().find((directory) => directory.startsWith(`${featureIdentifier}-`));
}
