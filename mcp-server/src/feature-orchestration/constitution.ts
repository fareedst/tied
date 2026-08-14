import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

export type ConstitutionScope = "requirements" | "architecture" | "implementation" | "task_plans" | "citdp";
export type Constitution = {
  schema_version: "project-constitution.v1";
  constitution_version: number;
  project: string;
  articles: Array<{ id: string; title: string; rule: string; scope: ConstitutionScope[]; enforcement: "required" | "advisory"; exceptions: string[]; rationale: string }>;
  exceptions: Array<{ id: string; article_id: string; owner: string; rationale: string; approver: string | null; review_status: "proposed" | "approved" | "rejected" | "expired"; expires_at: string | null }>;
  amendment_history: Array<{ version: number; amended_at: string; amendments: string; compatibility: "compatible" | "requires_review" | "incompatible" }>;
};
export type ArtifactProjection = { kind: ConstitutionScope; path: string; data: Record<string, unknown> };
export type ConstitutionFinding = { artifact_path: string; article_id: string; code: string; severity: "error" | "warning" | "info"; location: string; remediation: string; blocking: boolean };

const scopes = new Set<ConstitutionScope>(["requirements", "architecture", "implementation", "task_plans", "citdp"]);

// [IMPL-FEAT_CONSTITUTION_VALIDATOR] [ARCH-FEAT_CONSTITUTION_STORAGE] [REQ-FEAT_CONSTITUTION_SCHEMA] — Enforce deterministic schema and semantic constraints.
export function normalizeConstitution(raw: unknown, now = new Date()): { ok: true; constitution: Constitution } | { ok: false; error: string; diagnostics: string[] } {
  if (!raw || typeof raw !== "object") return { ok: false, error: "INVALID_SCHEMA", diagnostics: ["Constitution must be an object"] };
  const candidate = raw as Constitution;
  if (candidate.schema_version !== "project-constitution.v1" || !Number.isInteger(candidate.constitution_version) || candidate.constitution_version < 1 || !candidate.project?.trim() || !Array.isArray(candidate.articles) || !Array.isArray(candidate.exceptions) || !Array.isArray(candidate.amendment_history)) return { ok: false, error: "INVALID_SCHEMA", diagnostics: ["Invalid constitution envelope"] };
  const articleIds = new Set<string>();
  for (const article of candidate.articles) {
    if (!article.id || articleIds.has(article.id) || !article.title?.trim() || !article.rule?.trim() || !article.rationale?.trim() || !article.scope?.length || article.scope.some((scope) => !scopes.has(scope)) || !["required", "advisory"].includes(article.enforcement)) return { ok: false, error: "INVALID_ARTICLE", diagnostics: [`Invalid article ${article.id ?? "<unknown>"}`] };
    articleIds.add(article.id);
  }
  const exceptionIds = new Set<string>();
  for (const exception of candidate.exceptions) {
    if (!exception.id || exceptionIds.has(exception.id) || !articleIds.has(exception.article_id) || !exception.owner?.trim() || !exception.rationale?.trim() || !["proposed", "approved", "rejected", "expired"].includes(exception.review_status)) return { ok: false, error: "INVALID_EXCEPTION", diagnostics: [`Invalid exception ${exception.id ?? "<unknown>"}`] };
    if (exception.review_status === "approved" && (!exception.approver?.trim() || !exception.expires_at || new Date(exception.expires_at) <= now)) return { ok: false, error: "INVALID_EXCEPTION", diagnostics: [`Approved exception ${exception.id} needs approver and future expiry`] };
    exceptionIds.add(exception.id);
  }
  for (const article of candidate.articles) if (article.exceptions.some((id) => !exceptionIds.has(id))) return { ok: false, error: "INVALID_EXCEPTION_REFERENCE", diagnostics: [`Article ${article.id} references an unknown exception`] };
  if (!candidate.amendment_history.some((item) => item.version === candidate.constitution_version) || candidate.amendment_history.some((item) => item.compatibility === "incompatible" && item.version === candidate.constitution_version)) return { ok: false, error: "INCOMPATIBLE_AMENDMENT", diagnostics: ["Active constitution version is not compatible"] };
  return { ok: true, constitution: { ...candidate, project: candidate.project.trim(), articles: [...candidate.articles].sort((a, b) => a.id.localeCompare(b.id)), exceptions: [...candidate.exceptions].sort((a, b) => a.id.localeCompare(b.id)) } };
}

// [IMPL-FEAT_CONSTITUTION_ANALYZER] [ARCH-FEAT_CONSTITUTION_ANALYZER] [REQ-FEAT_CONSTITUTION_COMPLIANCE] — Evaluate rule scope and precedence before implementation.
export function analyzeConstitutionCompliance(constitution: Constitution, projections: ArtifactProjection[], now = new Date()): ConstitutionFinding[] {
  const findings: ConstitutionFinding[] = [];
  for (const artifact of projections) {
    for (const article of constitution.articles.filter((item) => item.scope.includes(artifact.kind))) {
      const exception = constitution.exceptions.find((item) => item.article_id === article.id && item.review_status === "approved" && item.expires_at && new Date(item.expires_at) > now);
      const expired = constitution.exceptions.some((item) => item.article_id === article.id && item.review_status === "approved" && (!item.expires_at || new Date(item.expires_at) <= now));
      const match = /^require:(.+)$/.exec(article.rule);
      const compliant = match ? Boolean(artifact.data[match[1]]) : Array.isArray(artifact.data.compliant_rules) && (artifact.data.compliant_rules as unknown[]).includes(article.rule);
      if (expired) findings.push({ artifact_path: artifact.path, article_id: article.id, code: "EXPIRED_EXCEPTION", severity: "error", location: artifact.path, remediation: "Renew or remove the expired exception", blocking: true });
      if (!compliant && !exception) findings.push({ artifact_path: artifact.path, article_id: article.id, code: "CONSTITUTION_RULE_FAILED", severity: article.enforcement === "required" ? "error" : "warning", location: artifact.path, remediation: `Satisfy ${article.rule}`, blocking: article.enforcement === "required" });
      if (!compliant && exception) findings.push({ artifact_path: artifact.path, article_id: article.id, code: "APPROVED_EXCEPTION", severity: "info", location: artifact.path, remediation: `Review exception ${exception.id} before expiry`, blocking: false });
      if (compliant && !expired) findings.push({ artifact_path: artifact.path, article_id: article.id, code: "CONSTITUTION_RULE_PASSED", severity: "info", location: artifact.path, remediation: "No action required", blocking: false });
    }
  }
  return findings;
}

// [IMPL-FEAT_CONSTITUTION_DIAGNOSTICS] [ARCH-FEAT_CONSTITUTION_ANALYZER] [REQ-FEAT_CONSTITUTION_COMPLIANCE] — Make diagnostic ordering and blocker status stable.
export function orderConstitutionDiagnostics(findings: ConstitutionFinding[]): ConstitutionFinding[] & { ready: boolean } {
  const ordered = [...findings].sort((a, b) => `${a.artifact_path}\0${a.article_id}\0${a.code}\0${a.location}`.localeCompare(`${b.artifact_path}\0${b.article_id}\0${b.code}\0${b.location}`)) as ConstitutionFinding[] & { ready: boolean };
  ordered.ready = !ordered.some((item) => item.blocking);
  return ordered;
}

export class ProjectConstitutionStore {
  readonly path: string;
  constructor(projectRoot: string) { this.path = path.join(path.resolve(projectRoot), "tied", "constitution.yaml"); }
  load(): Constitution {
    const result = normalizeConstitution(yaml.load(fs.readFileSync(this.path, "utf8")));
    if (!result.ok) throw new Error("READ_FAILED");
    return result.constitution;
  }
  // [IMPL-FEAT_CONSTITUTION_STORE] [ARCH-FEAT_CONSTITUTION_STORAGE] [REQ-FEAT_CONSTITUTION_SCHEMA] — Publish compatible constitution revisions atomically.
  publish(candidate: Constitution, expectedVersion: number): Constitution {
    const currentVersion = fs.existsSync(this.path) ? this.load().constitution_version : 0;
    if (currentVersion !== expectedVersion) throw new Error("STALE_VERSION");
    const result = normalizeConstitution({ ...candidate, constitution_version: expectedVersion + 1, amendment_history: [...candidate.amendment_history, { version: expectedVersion + 1, amended_at: new Date().toISOString(), amendments: "Published amendment", compatibility: "compatible" }] });
    if (!result.ok) throw new Error(result.error);
    fs.mkdirSync(path.dirname(this.path), { recursive: true });
    const temporary = `${this.path}.${process.pid}.${crypto.randomUUID()}.tmp`;
    fs.writeFileSync(temporary, yaml.dump(result.constitution, { sortKeys: true, lineWidth: -1 }), "utf8");
    fs.renameSync(temporary, this.path);
    return result.constitution;
  }
}
