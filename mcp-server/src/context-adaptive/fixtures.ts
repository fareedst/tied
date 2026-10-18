/**
 * [REQ-TIED_CONTEXT_ADAPTIVE_ENGINEERING] test/dogfood fixtures
 */

import { PRACTICE_CONTRACT_SCHEMA } from "./constants.js";
import type { PracticeContractV1 } from "./contracts.js";

export const FIXTURE_PRACTICES: PracticeContractV1[] = [
  {
    schema_version: PRACTICE_CONTRACT_SCHEMA,
    id: "PRACTICE-STRICT-TDD",
    name: "Strict TDD",
    applicability: { criticality: ["MEDIUM", "HIGH", "UNKNOWN"] },
  },
  {
    schema_version: PRACTICE_CONTRACT_SCHEMA,
    id: "PRACTICE-INTEGRATED-INQUIRY",
    name: "Integrated inquiry",
    applicability: { criticality: ["HIGH", "UNKNOWN"] },
    prerequisites: ["PRACTICE-STRICT-TDD"],
  },
  {
    schema_version: PRACTICE_CONTRACT_SCHEMA,
    id: "PRACTICE-LOW-ONLY",
    name: "Low criticality only",
    applicability: { criticality: ["LOW"] },
  },
];
