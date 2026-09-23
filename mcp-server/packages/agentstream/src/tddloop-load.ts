/**
 * [IMPL-GOAGENT-TDDLOOP] [ARCH-GOAGENT-YAML-STEPS] [REQ-GOAGENT-YAML-STEP-RENDER]
 * TDD loop YAML → turns (Go tddloop parity subset, Phase 4a pipeline extension).
 */
import fs from "node:fs";

import yaml from "js-yaml";

import type { Turn } from "./checklist-load-turns.js";

type YamlStep = {
  id?: unknown;
  slug?: string;
  title?: string;
  stage?: string;
  goals?: string;
  tasks?: string[];
  outcomes?: string;
};

type YamlDoc = {
  steps?: YamlStep[];
  process_token?: string;
  name?: string;
  version?: string;
};

function stepPrimaryLabel(step: YamlStep): string {
  const slug = (step.slug ?? "").trim();
  if (slug !== "") {
    return slug;
  }
  const id = String(step.id ?? "");
  if (id === "" || id === "undefined") {
    return "unknown";
  }
  return id;
}

function formatStep(doc: YamlDoc, step: YamlStep, token: string): string {
  const label = stepPrimaryLabel(step);
  const title = step.title ?? "";
  const lines: string[] = [
    "Follow the TDD development loop for this workspace.",
    `Process token: ${token}`,
  ];
  if (doc.name || doc.version) {
    lines.push(`Document: ${doc.name ?? ""} (${doc.version ?? ""})`);
  }
  lines.push("", `## Step ${label}: ${title}`);
  if (step.stage) {
    lines.push(`Stage: ${step.stage}`);
  }
  lines.push("", "### Goals");
  if (step.goals) {
    lines.push(step.goals.trim());
  }
  lines.push("", "### Tasks");
  for (const t of step.tasks ?? []) {
    lines.push(`- ${t}`);
  }
  lines.push("", "### Expected outcomes");
  if (step.outcomes) {
    lines.push(step.outcomes.trim());
  }
  lines.push(
    "",
    "Execute this step now. Do not skip checklist items unless the repo state already satisfies them.",
  );
  return lines.join("\n");
}

export function loadTddTurns(path: string): Turn[] {
  const data = fs.readFileSync(path, "utf8");
  const root = yaml.load(data) as Record<string, unknown> | null;
  if (!root || !Array.isArray(root.steps)) {
    throw new Error(`invalid TDD YAML: missing "steps" array in ${path}`);
  }
  const doc = yaml.load(data) as YamlDoc;
  const steps = doc.steps ?? [];
  if (steps.length === 0) {
    return [];
  }
  let token = doc.process_token ?? "";
  if (token === "") {
    token = doc.name ?? "";
  }
  if (token === "") {
    token = "TDD loop";
  }
  return steps.map((step) => ({
    parts: [formatStep(doc, step, token)],
    chainFromPrevious: true,
    stepStub: "",
  }));
}
