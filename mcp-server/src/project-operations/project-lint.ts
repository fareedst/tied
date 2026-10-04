/**
 * [IMPL-TIED_PROJECT_LINT] [ARCH-TIED_PROJECT_LINT_BOUNDARY] [REQ-TIED_PROJECT_LINT]
 * How: read-only aggregation of index, consistency, CITDP DAE, optional pseudocode validation.
 */

import fs from "node:fs";
import path from "node:path";
import { validateConsistency } from "../consistency-validator.js";
import { validateCitdpDaeSizingFields } from "../citdp-express-lane.js";
import { validateEssencePseudocode } from "../analysis/pseudocode-validator.js";
import { getBasePath, validateIndex, type IndexName } from "../yaml-loader.js";
import { getDetailPath } from "../detail-loader.js";

const INDEX_NAMES: IndexName[] = [
  "requirements",
  "architecture",
  "implementation",
  "semantic-tokens",
];

export type ProjectLintInput = {
  citdp?: Record<string, unknown>;
  impl_tokens?: string[];
  include_pseudocode?: boolean;
};

export type ProjectLintSection = {
  ok: boolean;
  diagnostics?: string[];
  detail?: unknown;
};

export type ProjectLintResult = {
  ok: boolean;
  base_path: string;
  sections: {
    indexes: Record<string, ProjectLintSection>;
    consistency: ProjectLintSection;
    citdp_dae?: ProjectLintSection;
    pseudocode?: Record<string, ProjectLintSection>;
  };
  diagnostics: string[];
};

function readSidecarPseudocode(implToken: string): string | null {
  const sidecarPath = path.join(
    getBasePath(),
    "implementation-decisions",
    `${implToken}-pseudocode.md`,
  );
  if (!fs.existsSync(sidecarPath)) {
    return null;
  }
  return fs.readFileSync(sidecarPath, "utf8");
}

export function runProjectLint(input: ProjectLintInput = {}): ProjectLintResult {
  const basePath = getBasePath();
  const diagnostics: string[] = [];
  const indexes: Record<string, ProjectLintSection> = {};
  let ok = true;

  for (const name of INDEX_NAMES) {
    const result = validateIndex(name);
    indexes[name] = {
      ok: result.valid,
      diagnostics: result.error ? [result.error] : [],
    };
    if (!result.valid) {
      ok = false;
      if (result.error) diagnostics.push(`index:${name}:${result.error}`);
    }
  }

  const consistencyReport = validateConsistency();
  const consistencyOk = consistencyReport.ok;
  if (!consistencyOk) {
    ok = false;
    diagnostics.push("consistency:failed");
  }
  const consistency: ProjectLintSection = {
    ok: consistencyOk,
    detail: {
      token_reference_issues: consistencyReport.token_references.length,
      traceability_issues: consistencyReport.traceability.length,
    },
  };

  let citdp_dae: ProjectLintSection | undefined;
  if (input.citdp) {
    const projectRoot = path.resolve(basePath, "..");
    const dae = validateCitdpDaeSizingFields(input.citdp, { project_root: projectRoot });
    citdp_dae = {
      ok: dae.ok,
      diagnostics: dae.diagnostics,
    };
    if (!dae.ok) {
      ok = false;
      diagnostics.push(...dae.diagnostics.map((d) => `citdp_dae:${d}`));
    }
  }

  const pseudocode: Record<string, ProjectLintSection> = {};
  if (input.include_pseudocode && input.impl_tokens?.length) {
    for (const token of input.impl_tokens) {
      const body = readSidecarPseudocode(token);
      if (!body) {
        pseudocode[token] = { ok: false, diagnostics: ["missing_sidecar"] };
        ok = false;
        diagnostics.push(`pseudocode:${token}:missing_sidecar`);
        continue;
      }
      const validation = validateEssencePseudocode({
        token,
        pseudocode: body,
        gate_mode: true,
      });
      const sectionOk = validation.ok === true;
      pseudocode[token] = {
        ok: sectionOk,
        diagnostics: validation.diagnostics?.map((d) => d.message ?? String(d)) ?? [],
        detail: { issue_count: validation.diagnostics?.length ?? 0 },
      };
      if (!sectionOk) {
        ok = false;
        diagnostics.push(`pseudocode:${token}:gate_failed`);
      }
    }
  }

  return {
    ok,
    base_path: basePath,
    sections: {
      indexes,
      consistency,
      ...(citdp_dae ? { citdp_dae } : {}),
      ...(Object.keys(pseudocode).length ? { pseudocode } : {}),
    },
    diagnostics,
  };
}

/** Test seam: ensure detail paths resolve without writes. */
export function resolveImplDetailPath(implToken: string): string {
  return getDetailPath(implToken) ?? "";
}
