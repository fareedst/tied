/**
 * [IMPL-TIED_DAE_INCORPORATION] [ARCH-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION]
 * How: W2b flag host-language leakage in IMPL essence_pseudocode unless DATA block or leakage-ok comment.
 */

export type LeakageDiagnostic = {
  severity: "error" | "warning";
  code: "HOST_SYNTAX_LEAK";
  message: string;
  line: number;
  pattern: string;
};

const LEAKAGE_PATTERNS: { id: string; regex: RegExp }[] = [
  { id: "function_kw", regex: /\bfunction\s/ },
  { id: "arrow_fn", regex: /=>/ },
  { id: "sql_select", regex: /\bSELECT\s/i },
  { id: "http_url", regex: /http:\/\// },
  { id: "abs_users_path", regex: /\/Users\// },
  { id: "import_kw", regex: /\bimport\s/ },
];

function isDataBlockHeader(line: string): boolean {
  return /^\s*DATA(?:\s|$)/i.test(line);
}

function isLeakageOkComment(line: string): boolean {
  return /\/\/\s*leakage-ok:/i.test(line);
}

/** Returns diagnostics for host-syntax patterns outside DATA blocks and leakage-ok lines. */
export function lintPseudocodeLeakage(
  pseudocode: string,
  options?: { gate_mode?: boolean },
): { diagnostics: LeakageDiagnostic[]; ok: boolean } {
  const lines = pseudocode.split(/\r?\n/);
  const diagnostics: LeakageDiagnostic[] = [];
  let inDataBlock = false;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (isDataBlockHeader(line)) {
      inDataBlock = true;
      continue;
    }

    if (inDataBlock) {
      if (trimmed === "" || /^\s/.test(line)) {
        continue;
      }
      inDataBlock = false;
    }

    if (isLeakageOkComment(line)) {
      continue;
    }

    for (const pattern of LEAKAGE_PATTERNS) {
      if (pattern.regex.test(line)) {
        diagnostics.push({
          severity: options?.gate_mode ? "error" : "warning",
          code: "HOST_SYNTAX_LEAK",
          message: `Host syntax leakage (${pattern.id}) in pseudo-code; use DATA example or // leakage-ok: comment.`,
          line: index + 1,
          pattern: pattern.id,
        });
      }
    }
  }

  const ok = !diagnostics.some((d) => d.severity === "error");
  return { diagnostics, ok };
}
