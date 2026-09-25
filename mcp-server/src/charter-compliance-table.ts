/**
 * [IMPL-TIED_DAE_INCORPORATION] [ARCH-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION]
 * How: W5b charter compliance table at author-architecture / risk-assessment.
 */

export type CharterComplianceRow = {
  scope: string;
  kind: "requirement" | "architecture" | "implementation";
  immutable: boolean;
  touched: boolean;
  remediated: boolean;
  note?: string;
};

export type CharterComplianceTable = {
  rows: CharterComplianceRow[];
  immutable_touch_without_remediation: boolean;
  ok: boolean;
};

export type CharterComplianceInput = {
  immutable_categories?: string[];
  immutable_req_tokens?: string[];
  touch_set?: {
    requirements?: string[];
    architecture?: string[];
    implementation?: string[];
  };
  arch_tokens?: string[];
  new_arch_tokens?: string[];
  human_approval_evidence?: unknown;
  req_categories?: Record<string, string>;
};

function isNonEmptyEvidence(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0 && value.trim() !== "~";
  if (typeof value === "object") return Object.keys(value as object).length > 0;
  return true;
}

function reqIsImmutable(token: string, input: CharterComplianceInput): boolean {
  if (input.immutable_req_tokens?.includes(token)) return true;
  const category = input.req_categories?.[token];
  if (category && input.immutable_categories?.includes(category)) return true;
  return false;
}

export function buildCharterComplianceTable(
  input: CharterComplianceInput,
): CharterComplianceTable {
  const touchReq = input.touch_set?.requirements ?? [];
  const touchArch = input.touch_set?.architecture ?? [];
  const touchImpl = input.touch_set?.implementation ?? [];
  const rows: CharterComplianceRow[] = [];
  const hasNewArch = (input.new_arch_tokens?.length ?? 0) > 0;
  const hasApproval = isNonEmptyEvidence(input.human_approval_evidence);
  const remediated = hasNewArch || hasApproval;

  for (const token of touchReq) {
    const immutable = reqIsImmutable(token, input);
    rows.push({
      scope: token,
      kind: "requirement",
      immutable,
      touched: true,
      remediated: !immutable || remediated,
      note: immutable && !remediated
        ? "Immutable REQ touched without new ARCH token or human approval evidence"
        : undefined,
    });
  }
  for (const token of touchArch) {
    rows.push({
      scope: token,
      kind: "architecture",
      immutable: false,
      touched: true,
      remediated: true,
    });
  }
  for (const token of touchImpl) {
    rows.push({
      scope: token,
      kind: "implementation",
      immutable: false,
      touched: true,
      remediated: true,
    });
  }

  for (const arch of input.arch_tokens ?? []) {
    if (rows.some((r) => r.scope === arch)) continue;
    rows.push({
      scope: arch,
      kind: "architecture",
      immutable: false,
      touched: false,
      remediated: true,
    });
  }

  const immutable_touch_without_remediation = rows.some(
    (r) => r.immutable && r.touched && !r.remediated,
  );
  return {
    rows,
    immutable_touch_without_remediation,
    ok: !immutable_touch_without_remediation,
  };
}

export function charterComplianceBlocksPseudocodeGate(
  input: CharterComplianceInput,
): { blocked: boolean; table: CharterComplianceTable; diagnostics: string[] } {
  const table = buildCharterComplianceTable(input);
  const diagnostics: string[] = [];
  if (table.immutable_touch_without_remediation) {
    diagnostics.push("charter_compliance_immutable_touch_without_arch_approval");
  }
  return {
    blocked: !table.ok,
    table,
    diagnostics,
  };
}
