/**
 * [IMPL-CITDP_ORDERED_KEY_VALIDATE] [ARCH-CITDP_ORDERED_LIST_KEYS] [REQ-CITDP_ORDERED_LIST_KEYS]
 * Reject deprecated ordered-command list keys on CITDP open records at write time.
 */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const EVIDENCE_DEPRECATED: Readonly<Record<string, string>> = {
  commands: "command_seq",
};

const TEST_STRATEGY_DEPRECATED: Readonly<Record<string, string>> = {
  commands: "command_seq",
  verification_commands: "verification_command_seq",
  integration_commands: "integration_command_seq",
  regression_commands: "regression_command_seq",
};

function pushDeprecated(
  diagnostics: string[],
  parent: string,
  deprecated: Readonly<Record<string, string>>,
  section: Record<string, unknown>,
): void {
  for (const key of Object.keys(deprecated)) {
    if (key in section) {
      diagnostics.push(`deprecated_citdp_key:${parent}.${key}`);
    }
  }
}

function renameSection(
  section: Record<string, unknown>,
  map: Readonly<Record<string, string>>,
): Record<string, unknown> {
  const out = { ...section };
  for (const [from, to] of Object.entries(map)) {
    if (from in out && !(to in out)) {
      out[to] = out[from];
      delete out[from];
    }
  }
  return out;
}

function transformCloseOutEvidence(section: Record<string, unknown>): Record<string, unknown> {
  let out = renameSection(section, TEST_STRATEGY_DEPRECATED);
  const verification = out.verification;
  if (isRecord(verification)) {
    out = { ...out, verification: renameSection(verification, EVIDENCE_DEPRECATED) };
  }
  return out;
}

function transformOperatorEvidenceBlock(section: Record<string, unknown>): Record<string, unknown> {
  const out = renameSection(section, EVIDENCE_DEPRECATED);
  for (const [key, value] of Object.entries(out)) {
    if (key.endsWith("_evidence") && isRecord(value)) {
      out[key] = renameSection(value, EVIDENCE_DEPRECATED);
    }
  }
  return out;
}

// [IMPL-CITDP_ORDERED_KEY_VALIDATE] — How: fail closed when evidence or test_strategy use legacy *commands keys.
export function validateCitdpOrderedListKeys(record: Record<string, unknown>): {
  ok: boolean;
  diagnostics: string[];
} {
  const diagnostics: string[] = [];
  if (isRecord(record.evidence)) {
    pushDeprecated(diagnostics, "evidence", EVIDENCE_DEPRECATED, record.evidence);
  }
  if (isRecord(record.adoption_evidence)) {
    pushDeprecated(diagnostics, "adoption_evidence", EVIDENCE_DEPRECATED, record.adoption_evidence);
  }
  if (isRecord(record.test_strategy)) {
    pushDeprecated(diagnostics, "test_strategy", TEST_STRATEGY_DEPRECATED, record.test_strategy);
  }
  const executionEvidence = record.execution_evidence;
  if (isRecord(executionEvidence)) {
    if (isRecord(executionEvidence.operator_evidence)) {
      pushDeprecated(
        diagnostics,
        "execution_evidence.operator_evidence",
        EVIDENCE_DEPRECATED,
        executionEvidence.operator_evidence,
      );
      for (const [key, value] of Object.entries(executionEvidence.operator_evidence)) {
        if (key.endsWith("_evidence") && isRecord(value)) {
          pushDeprecated(diagnostics, `execution_evidence.operator_evidence.${key}`, EVIDENCE_DEPRECATED, value);
        }
      }
    }
    if (isRecord(executionEvidence.close_out_evidence)) {
      pushDeprecated(
        diagnostics,
        "execution_evidence.close_out_evidence",
        TEST_STRATEGY_DEPRECATED,
        executionEvidence.close_out_evidence,
      );
      const verification = executionEvidence.close_out_evidence.verification;
      if (isRecord(verification)) {
        pushDeprecated(
          diagnostics,
          "execution_evidence.close_out_evidence.verification",
          EVIDENCE_DEPRECATED,
          verification,
        );
      }
    }
  }
  return { ok: diagnostics.length === 0, diagnostics };
}

/** Parent-aware renames for migration and fixtures. */
export function transformCitdpOrderedListKeys(record: Record<string, unknown>): Record<string, unknown> {
  const out = structuredClone(record) as Record<string, unknown>;
  if (isRecord(out.evidence)) {
    out.evidence = renameSection(out.evidence, EVIDENCE_DEPRECATED);
  }
  if (isRecord(out.adoption_evidence)) {
    out.adoption_evidence = renameSection(out.adoption_evidence, EVIDENCE_DEPRECATED);
  }
  if (isRecord(out.test_strategy)) {
    out.test_strategy = renameSection(out.test_strategy, TEST_STRATEGY_DEPRECATED);
  }
  const executionEvidenceIn = out.execution_evidence;
  if (isRecord(executionEvidenceIn)) {
    const executionEvidence = { ...executionEvidenceIn };
    const operatorEvidence = executionEvidence.operator_evidence;
    if (isRecord(operatorEvidence)) {
      executionEvidence.operator_evidence = transformOperatorEvidenceBlock(operatorEvidence);
    }
    const closeOutEvidence = executionEvidence.close_out_evidence;
    if (isRecord(closeOutEvidence)) {
      executionEvidence.close_out_evidence = transformCloseOutEvidence(closeOutEvidence);
    }
    out.execution_evidence = executionEvidence;
  }
  return out;
}
