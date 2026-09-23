/**
 * [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-GOAGENT-YAML-STEPS] [REQ-GOAGENT-YAML-STEP-RENDER]
 * Checklist YAML → agent turns (Go checklist/checklist.go parity for dry-run slice 2a).
 */
import fs from "node:fs";

import yaml from "js-yaml";

import {
  expandThenStub,
  hasResidualChecklistPlaceholder,
  trimExpandThenStub,
} from "./checklist-placeholders.js";

export type Turn = {
  parts: string[];
  chainFromPrevious: boolean;
  stepStub: string;
};

type YamlBool = boolean;

type YamlStep = {
  slug?: string;
  title?: string;
  goals?: string;
  preconditions?: string[];
  tasks?: string[];
  outcomes?: string;
  references?: unknown[];
  flow?: Record<string, unknown>;
  tracking?: Record<string, unknown>;
  agentstream_new_session?: YamlBool | string;
};

type YamlSub = {
  slug?: string;
  title?: string;
  goals?: string;
  preconditions?: string[];
  tasks?: string[];
  outcomes?: string;
  invoked_by?: string[];
  flow?: Record<string, unknown>;
  agentstream_new_session?: YamlBool | string;
};

type YamlGateContract = {
  phases?: string[];
  dispositions?: string[];
  required_artifacts?: string[];
  depth_selection_before_inquiry?: YamlBool | string;
  loop_back_invalidates_downstream_evidence?: YamlBool | string;
  fail_closed?: YamlBool | string;
};

type YamlDoc = {
  steps?: YamlStep[];
  sub_procedures?: YamlSub[];
  gate_contract?: YamlGateContract;
  process_token?: string;
  name?: string;
  version?: string;
};

export type ChecklistLoadOptions = {
  includeSubProcedures: boolean;
  stepFromId?: string;
  stepToId?: string;
  vars?: Record<string, string>;
  checklistVarStrict?: boolean;
};

function parseYamlBool(v: YamlBool | string | undefined): boolean {
  if (v === undefined) {
    return false;
  }
  if (typeof v === "boolean") {
    return v;
  }
  const s = String(v).trim().toLowerCase();
  return s === "true" || s === "yes" || s === "1" || s === "on";
}

function sameStringSet(got: string[] | undefined, want: string[]): boolean {
  if (!got || got.length !== want.length) {
    return false;
  }
  const expected = new Set(want);
  for (const value of got) {
    if (!expected.has(value)) {
      return false;
    }
    expected.delete(value);
  }
  return expected.size === 0;
}

function validateGateContract(contract: YamlGateContract | undefined, path: string): void {
  if (!contract) {
    return;
  }
  const wantPhases = ["pre_implementation", "verification", "close_out"];
  const wantDispositions = ["pending", "completed", "not_applicable", "waived"];
  const wantArtifacts = [
    "obligation-report.json",
    "finding-ledger.jsonl",
    "gate-result.json",
    "evidence-provenance.json",
  ];
  if (!sameStringSet(contract.phases, wantPhases)) {
    throw new Error(
      `checklist gate_contract.phases must be pre_implementation, verification, close_out in ${path}`,
    );
  }
  if (!sameStringSet(contract.dispositions, wantDispositions)) {
    throw new Error(
      `checklist gate_contract.dispositions must be pending, completed, not_applicable, waived in ${path}`,
    );
  }
  if (!sameStringSet(contract.required_artifacts, wantArtifacts)) {
    throw new Error(`checklist gate_contract.required_artifacts is incomplete in ${path}`);
  }
  if (
    !parseYamlBool(contract.depth_selection_before_inquiry) ||
    !parseYamlBool(contract.loop_back_invalidates_downstream_evidence) ||
    !parseYamlBool(contract.fail_closed)
  ) {
    throw new Error(
      `checklist gate_contract must select depth first, invalidate loop-back evidence, and fail closed in ${path}`,
    );
  }
}

function validateStepsHaveSlugs(steps: YamlStep[], path: string): void {
  for (let i = 0; i < steps.length; i++) {
    if ((steps[i]?.slug ?? "").trim() === "") {
      throw new Error(
        `checklist step at "steps" index ${i} missing required "slug" in ${path}`,
      );
    }
  }
}

function validateSubsHaveSlugs(subs: YamlSub[], path: string): void {
  for (let i = 0; i < subs.length; i++) {
    if ((subs[i]?.slug ?? "").trim() === "") {
      throw new Error(
        `checklist sub_procedures index ${i} missing required "slug" in ${path}`,
      );
    }
  }
}

function validateDuplicateSlugs(steps: YamlStep[], path: string): void {
  const seen = new Map<string, number>();
  for (let i = 0; i < steps.length; i++) {
    const slug = (steps[i]?.slug ?? "").trim();
    const j = seen.get(slug);
    if (j !== undefined) {
      throw new Error(
        `checklist duplicate slug ${JSON.stringify(slug)} at "steps" indices ${j} and ${i} in ${path}`,
      );
    }
    seen.set(slug, i);
  }
}

function stepPrimaryLabel(step: YamlStep): string {
  const slug = (step.slug ?? "").trim();
  return slug !== "" ? slug : "unknown";
}

function findMainStepIndex(steps: YamlStep[], path: string, want: string): number {
  const trimmed = want.trim();
  if (trimmed === "") {
    throw new Error(`checklist step lookup: empty slug in ${path}`);
  }
  const matches: number[] = [];
  for (let i = 0; i < steps.length; i++) {
    const slug = (steps[i]?.slug ?? "").trim();
    if (slug !== "" && slug === trimmed) {
      matches.push(i);
    }
  }
  if (matches.length === 1) {
    return matches[0]!;
  }
  if (matches.length === 0) {
    throw new Error(`checklist step slug not found in ${path}: ${JSON.stringify(want)}`);
  }
  throw new Error(
    `checklist step slug is ambiguous in ${path}: ${JSON.stringify(want)} matches multiple main steps`,
  );
}

function sliceMainSteps(
  steps: YamlStep[],
  path: string,
  fromId: string,
  toId: string,
): YamlStep[] {
  const fromTrim = fromId.trim();
  const toTrim = toId.trim();
  if (fromTrim === "" && toTrim === "") {
    return steps;
  }
  if (steps.length === 0) {
    throw new Error(`invalid checklist YAML: empty "steps" in ${path}`);
  }
  let start = 0;
  let end = steps.length - 1;
  if (fromTrim !== "") {
    start = findMainStepIndex(steps, path, fromTrim);
  }
  if (toTrim !== "") {
    end = findMainStepIndex(steps, path, toTrim);
  }
  if (start > end) {
    throw new Error(
      `checklist step range invalid in ${path}: from ${JSON.stringify(fromTrim)} (index ${start}) after to ${JSON.stringify(toTrim)} (index ${end})`,
    );
  }
  return steps.slice(start, end + 1);
}

function buildStubAliasMap(doc: YamlDoc): Record<string, string> {
  const m: Record<string, string> = {};
  for (const s of doc.steps ?? []) {
    const slug = (s.slug ?? "").trim();
    if (slug !== "") {
      m[slug] = slug;
    }
  }
  for (const sub of doc.sub_procedures ?? []) {
    const slug = (sub.slug ?? "").trim();
    if (slug !== "") {
      m[slug] = slug;
    }
  }
  return m;
}

function sortedStubKeys(stubMap: Record<string, string>): string[] {
  const keys = Object.keys(stubMap);
  keys.sort((a, b) => {
    const la = a.length;
    const lb = b.length;
    if (la !== lb) {
      return lb - la;
    }
    return a.localeCompare(b);
  });
  return keys;
}

function resolveFlowRef(v: unknown, stubMap: Record<string, string>): string {
  const s = String(v ?? "").trim();
  if (s === "" || s === "<nil>") {
    return s;
  }
  if (stubMap[s] !== undefined) {
    return stubMap[s]!;
  }
  return s;
}

function formatRefRaw(r: unknown): string {
  if (typeof r === "string") {
    return r;
  }
  if (r && typeof r === "object") {
    const o = r as Record<string, unknown>;
    return `${String(o.document ?? "")} — ${String(o.provides ?? "")}`;
  }
  return String(r);
}

function appendFlow(
  lines: string[],
  flow: Record<string, unknown>,
  vars: Record<string, string>,
  stubMap: Record<string, string>,
  stubKeys: string[],
): string[] {
  const out = [...lines];
  if ("return_to" in flow) {
    out.push(`- return_to: ${resolveFlowRef(flow.return_to, stubMap)}`);
  }
  if ("next" in flow) {
    out.push(`- next: ${resolveFlowRef(flow.next, stubMap)}`);
  }
  if ("next_when_all_blocks_done" in flow) {
    out.push(
      `- next_when_all_blocks_done: ${resolveFlowRef(flow.next_when_all_blocks_done, stubMap)}`,
    );
  }
  const br = flow.branches;
  if (Array.isArray(br)) {
    for (const b of br) {
      if (b && typeof b === "object") {
        const bm = b as Record<string, unknown>;
        const cond = expandThenStub(String(bm.condition ?? ""), vars, stubMap, stubKeys);
        const act = expandThenStub(String(bm.action ?? ""), vars, stubMap, stubKeys);
        const tgt = resolveFlowRef(bm.target, stubMap);
        out.push(`- IF ${cond} THEN ${act} (target: ${tgt})`);
      }
    }
  }
  const calls = flow.calls;
  if (Array.isArray(calls)) {
    for (const c of calls) {
      out.push(`- CALL ${resolveFlowRef(c, stubMap)}`);
    }
  }
  return out;
}

function appendAsyncMethodologyHighlight(lines: string[], slug: string): string[] {
  switch (slug) {
    case "catalog-pseudocode-contracts":
      return [
        ...lines,
        "",
        "### Async methodology highlight (Phase B)",
        "When async_in_scope is true, CALL catalog-async-boundaries: produce the closed eight-column async catalog per async-marked block (Boundary kind, Await/message/event, Timeout, Cancellation, Retry/idempotency, Shared DATA, Termination/order). Missing rows block RED. Proof boundary: structural contracts only — not race-freedom.",
      ];
    case "composition-integration":
      return [
        ...lines,
        "",
        "### Async methodology highlight (Phase G)",
        "For async seams, binding inventory rows must include async_semantics, ordering, failure_behavior, cancellation when applicable, and composition_test. Event/message triggers require async_semantics; retry/at-least-once requires idempotency evidence. Use CONTROLLED_COMPOSITION_FAULT patterns (ordering, timeout, duplicate delivery) in UI-free tests. Evidence means binding exercised — never system is race-free.",
      ];
    default:
      return lines;
  }
}

function formatMainStep(
  doc: YamlDoc,
  step: YamlStep,
  token: string,
  vars: Record<string, string>,
  stubMap: Record<string, string>,
  stubKeys: string[],
): string {
  let lines: string[] = [
    "Execute this LEAD+TIED agent requirement implementation checklist step in the current workspace.",
    `Process token: ${token}`,
  ];
  if ((doc.name ?? "") !== "" || (doc.version ?? "") !== "") {
    lines.push(`Checklist: ${doc.name ?? ""} (v${doc.version ?? ""})`);
  }
  let title = (step.title ?? "").trim();
  if (title !== "") {
    title = expandThenStub(title, vars, stubMap, stubKeys);
  }
  const stepHead = `## Step ${stepPrimaryLabel(step)}: ${title}`;
  lines.push("", stepHead);
  let body = appendAsyncMethodologyHighlight(lines, stepPrimaryLabel(step));
  body.push("", "### Goals");
  lines = body;
  if (step.goals) {
    lines.push(trimExpandThenStub(step.goals, vars, stubMap, stubKeys));
  }
  if (step.preconditions && step.preconditions.length > 0) {
    lines.push("", "### Preconditions");
    for (const p of step.preconditions) {
      lines.push(`- ${expandThenStub(p, vars, stubMap, stubKeys)}`);
    }
  }
  lines.push("", "### Tasks");
  for (const t of step.tasks ?? []) {
    lines.push(`- ${expandThenStub(t, vars, stubMap, stubKeys)}`);
  }
  lines.push("", "### Expected outcomes");
  if (step.outcomes) {
    lines.push(trimExpandThenStub(step.outcomes, vars, stubMap, stubKeys));
  }
  if (step.references && step.references.length > 0) {
    lines.push("", "### References");
    for (const r of step.references) {
      lines.push(`- ${expandThenStub(formatRefRaw(r), vars, stubMap, stubKeys)}`);
    }
  }
  if (step.flow && Object.keys(step.flow).length > 0) {
    const flowLines = appendFlow([], step.flow, vars, stubMap, stubKeys);
    lines.push("", "### Flow", ...flowLines);
  }
  if (step.tracking) {
    const c = step.tracking.consideration_before_proceeding;
    if (typeof c === "string" && c.trim() !== "") {
      lines.push("", "### Before proceeding", trimExpandThenStub(c, vars, stubMap, stubKeys));
    }
  }
  lines.push(
    "",
    "Complete this step now. Follow GOTO/CALL/RETURN semantics from the checklist when they apply.",
  );
  return lines.join("\n");
}

function subPrimaryLabel(sub: YamlSub): string {
  const slug = (sub.slug ?? "").trim();
  return slug !== "" ? slug : "unknown";
}

function formatSubProcedure(
  sub: YamlSub,
  token: string,
  vars: Record<string, string>,
  stubMap: Record<string, string>,
  stubKeys: string[],
): string {
  let subTitle = (sub.title ?? "").trim();
  if (subTitle !== "") {
    subTitle = expandThenStub(subTitle, vars, stubMap, stubKeys);
  }
  const lines: string[] = [
    "Sub-procedure (invoke when CALL references this slug from a main step).",
    `Process token: ${token}`,
    "",
    `## ${(sub.slug ?? "unknown").trim()}: ${subTitle}`,
    "",
    "### Goals",
  ];
  if (sub.goals) {
    lines.push(trimExpandThenStub(sub.goals, vars, stubMap, stubKeys));
  }
  if (sub.preconditions && sub.preconditions.length > 0) {
    lines.push("", "### Preconditions");
    for (const p of sub.preconditions) {
      lines.push(`- ${expandThenStub(p, vars, stubMap, stubKeys)}`);
    }
  }
  lines.push("", "### Tasks");
  for (const t of sub.tasks ?? []) {
    lines.push(`- ${expandThenStub(t, vars, stubMap, stubKeys)}`);
  }
  lines.push("", "### Expected outcomes");
  if (sub.outcomes) {
    lines.push(trimExpandThenStub(sub.outcomes, vars, stubMap, stubKeys));
  }
  if (sub.invoked_by && sub.invoked_by.length > 0) {
    lines.push("", "### Invoked by");
    for (const s of sub.invoked_by) {
      lines.push(`- ${expandThenStub(s, vars, stubMap, stubKeys)}`);
    }
  }
  if (sub.flow && Object.keys(sub.flow).length > 0) {
    const flowLines = appendFlow([], sub.flow, vars, stubMap, stubKeys);
    lines.push("", "### Flow", ...flowLines);
  }
  lines.push(
    "",
    "Run this sub-procedure when a step says CALL this slug; then RETURN to the caller.",
  );
  return lines.join("\n");
}

function validateStrictResidual(
  path: string,
  strict: boolean,
  text: string,
  stubLabel: string,
): void {
  if (!strict) {
    return;
  }
  if (hasResidualChecklistPlaceholder(text)) {
    throw new Error(
      `checklist ${path}: unresolved {{NAME}} placeholder(s) in step ${JSON.stringify(stubLabel)} (--checklist-var-strict)`,
    );
  }
}

/** Rendered message bodies only (Go checklist.MessagesFromYAML parity). */
export function messagesFromChecklistYaml(
  path: string,
  opts: ChecklistLoadOptions,
): string[] {
  return loadChecklistTurns(path, opts).map((t) => t.parts[0] ?? "");
}

export function loadChecklistTurns(
  path: string,
  opts: ChecklistLoadOptions,
): Turn[] {
  const data = fs.readFileSync(path, "utf8");
  const doc = yaml.load(data) as YamlDoc;
  if (!doc.steps) {
    throw new Error(`invalid checklist YAML: missing "steps" array in ${path}`);
  }
  validateStepsHaveSlugs(doc.steps, path);
  validateSubsHaveSlugs(doc.sub_procedures ?? [], path);
  validateGateContract(doc.gate_contract, path);
  validateDuplicateSlugs(doc.steps, path);

  let token = doc.process_token ?? "";
  if (token === "") {
    token = doc.name ?? "";
  }
  if (token === "") {
    token = "LEAD+TIED checklist";
  }

  const stubMap = buildStubAliasMap(doc);
  const stubKeys = sortedStubKeys(stubMap);
  const vars = opts.vars ?? {};
  const strict = opts.checklistVarStrict ?? false;

  const mainSteps = sliceMainSteps(
    doc.steps,
    path,
    opts.stepFromId ?? "",
    opts.stepToId ?? "",
  );

  const rendered: Array<{
    text: string;
    stub: string;
    chainFromPrevious: boolean;
  }> = [];

  for (const step of mainSteps) {
    const text = formatMainStep(doc, step, token, vars, stubMap, stubKeys);
    validateStrictResidual(path, strict, text, stepPrimaryLabel(step));
    rendered.push({
      text,
      stub: stepPrimaryLabel(step),
      chainFromPrevious: !parseYamlBool(step.agentstream_new_session),
    });
  }

  if (opts.includeSubProcedures) {
    for (const sub of doc.sub_procedures ?? []) {
      const text = formatSubProcedure(sub, token, vars, stubMap, stubKeys);
      validateStrictResidual(path, strict, text, subPrimaryLabel(sub));
      rendered.push({
        text,
        stub: subPrimaryLabel(sub),
        chainFromPrevious: !parseYamlBool(sub.agentstream_new_session),
      });
    }
  }

  return rendered.map((m) => ({
    parts: [m.text],
    chainFromPrevious: m.chainFromPrevious,
    stepStub: m.stub,
  }));
}
