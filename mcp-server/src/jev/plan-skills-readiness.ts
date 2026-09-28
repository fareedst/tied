/**
 * [IMPL-TIED_JEV_DECISION_COPROCESSOR] [ARCH-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR]
 * ASSESS_JEV_SERVICE_READINESS
 */

import type { JevDecideResult } from "./types.js";
import type { PlanSkillsFailureClass, PlanSkillsReadiness } from "./plan-skills-types.js";

export type ReadinessAssessment = {
  readiness: PlanSkillsReadiness;
  service_reachable: boolean;
  failure_class?: PlanSkillsFailureClass;
  skip_reason?: string;
  failure_excerpt_redacted?: string;
};

export function assessJevServiceReadinessBeforeCall(
  enabled: boolean,
  keyPresent: boolean,
): ReadinessAssessment {
  if (!enabled) {
    return { readiness: "disabled", service_reachable: false };
  }
  if (!keyPresent) {
    return { readiness: "configured_no_credentials", service_reachable: false };
  }
  return { readiness: "configured_unreachable", service_reachable: false };
}

export function assessJevServiceReadinessFromDecide(
  enabled: boolean,
  keyPresent: boolean,
  decideResult: JevDecideResult | undefined,
  opts: { timedOut?: boolean; answersUsable?: boolean; transportError?: string } = {},
): ReadinessAssessment {
  const pre = assessJevServiceReadinessBeforeCall(enabled, keyPresent);
  if (pre.readiness === "disabled" || pre.readiness === "configured_no_credentials") {
    return pre;
  }

  if (opts.timedOut) {
    return {
      readiness: "configured_unreachable",
      service_reachable: false,
      failure_class: "timeout",
    };
  }

  if (opts.transportError) {
    return {
      readiness: "configured_unreachable",
      service_reachable: false,
      failure_class: "transport",
      failure_excerpt_redacted: opts.transportError.slice(0, 500),
    };
  }

  if (!decideResult) {
    return {
      readiness: "configured_unreachable",
      service_reachable: false,
      failure_class: "transport",
    };
  }

  if (!decideResult.ok) {
    if (decideResult.skipped) {
      if (decideResult.reason === "state_too_large") {
        return {
          readiness: "locally_skipped",
          service_reachable: false,
          skip_reason: decideResult.reason,
        };
      }
      if (decideResult.reason === "no_credentials") {
        return { readiness: "configured_no_credentials", service_reachable: false };
      }
      return {
        readiness: "locally_skipped",
        service_reachable: false,
        skip_reason: decideResult.reason,
      };
    }
    return {
      readiness: "configured_unreachable",
      service_reachable: false,
      failure_class: "http_status",
      failure_excerpt_redacted: decideResult.error?.slice(0, 500),
    };
  }

  if (opts.answersUsable === false) {
    return {
      readiness: "configured_unreachable",
      service_reachable: false,
      failure_class: "invalid_answers",
    };
  }

  return { readiness: "ready", service_reachable: true };
}
