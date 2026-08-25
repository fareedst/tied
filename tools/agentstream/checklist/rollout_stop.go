// Observational rollout stop evaluator for controlled-client adherence pilots.
// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
// How: EVALUATE_ROLLOUT_STOP maps Tracker integrity, reconcile findings, and checklist bytes to stop reasons.
package checklist

import (
	"fmt"
	"os"
	"strings"
)

const (
	stopWriterCorruptsTracker           = "writer_corrupts_tracker"
	stopTurnAdvancesWithoutBoundReceipt = "turn_advances_without_bound_receipt"
	stopStatusChangeWithoutReceipt      = "status_change_without_verification_receipt"
	stopCompletedWithUnresolvedEvidence = "completed_with_unresolved_evidence"
	stopCanonicalChecklistBytesChanged  = "canonical_checklist_bytes_changed"
)

// RolloutStopInput configures deterministic rollout stop evaluation.
type RolloutStopInput struct {
	Tracker                 map[string]interface{}
	DefinitionPath          string
	RequestToken            string
	BaselineDefinitionHash  string
	ReconcileReport         ReconcileReport
}

// RolloutStopResult is the observational rollout stop decision.
type RolloutStopResult struct {
	ShouldStop bool     `json:"should_stop"`
	Reasons    []string `json:"reasons"`
}

// EvaluateRolloutStop returns stop=true when any controlled-client pilot stop condition fires.
func EvaluateRolloutStop(input RolloutStopInput) (RolloutStopResult, error) {
	result := RolloutStopResult{Reasons: []string{}}

	if corrupt, detail := DetectTrackerWriterCorruption(input.Tracker); corrupt {
		result.ShouldStop = true
		result.Reasons = append(result.Reasons, stopWriterCorruptsTracker+": "+detail)
	}
	if strings.TrimSpace(input.DefinitionPath) != "" && strings.TrimSpace(input.RequestToken) != "" {
		if err := ValidateTrackerIdentity(input.Tracker, input.DefinitionPath, input.RequestToken); err != nil {
			result.ShouldStop = true
			result.Reasons = append(result.Reasons, stopWriterCorruptsTracker+": "+err.Error())
		}
	}
	if changed, err := DefinitionBytesChanged(input.BaselineDefinitionHash, input.DefinitionPath); err != nil {
		return result, err
	} else if changed {
		result.ShouldStop = true
		result.Reasons = append(result.Reasons, stopCanonicalChecklistBytesChanged)
	}

	for _, finding := range input.ReconcileReport.Findings {
		switch finding.Code {
		case findingRenderedWithoutAck:
			result.ShouldStop = true
			result.Reasons = append(result.Reasons, stopTurnAdvancesWithoutBoundReceipt)
		case findingStatusChangeWithoutReceipt:
			result.ShouldStop = true
			result.Reasons = append(result.Reasons, stopStatusChangeWithoutReceipt)
		case findingCompletedWithUnresolved:
			result.ShouldStop = true
			result.Reasons = append(result.Reasons, stopCompletedWithUnresolvedEvidence)
		}
	}
	result.Reasons = dedupeStrings(result.Reasons)
	return result, nil
}

// DetectTrackerWriterCorruption reports whether Tracker state appears corrupted by the writer.
func DetectTrackerWriterCorruption(tracker map[string]interface{}) (bool, string) {
	if tracker == nil {
		return true, "nil tracker"
	}
	if sv, _ := tracker["schema_version"].(string); sv != TrackerSchemaVersion {
		return true, fmt.Sprintf("invalid schema_version %q", sv)
	}
	stepsRaw, ok := tracker["steps"].([]interface{})
	if !ok || len(stepsRaw) == 0 {
		return true, "missing steps"
	}
	if ee, ok := tracker["execution_evidence"].(map[string]interface{}); ok {
		if completed, ok := ee["completed"].([]interface{}); ok && len(completed) > 0 {
			override := make([]string, 0, len(completed))
			for _, item := range completed {
				if slug, ok := item.(string); ok && strings.TrimSpace(slug) != "" {
					override = append(override, slug)
				}
			}
			if ExecutionEvidenceCompletedOverride(tracker, override) {
				return true, "execution_evidence.completed override mismatch"
			}
		}
	}
	return false, ""
}

// DefinitionContentHash returns sha256:hex for checklist definition bytes.
func DefinitionContentHash(path string) (string, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return "", err
	}
	return fileContentHash(data), nil
}

// DefinitionBytesChanged compares current definition bytes to a baseline content hash.
func DefinitionBytesChanged(baselineHash, definitionPath string) (bool, error) {
	baselineHash = strings.TrimSpace(baselineHash)
	definitionPath = strings.TrimSpace(definitionPath)
	if baselineHash == "" || definitionPath == "" {
		return false, nil
	}
	current, err := DefinitionContentHash(definitionPath)
	if err != nil {
		return false, err
	}
	return current != baselineHash, nil
}

func dedupeStrings(values []string) []string {
	if len(values) == 0 {
		return values
	}
	seen := make(map[string]struct{}, len(values))
	out := make([]string, 0, len(values))
	for _, value := range values {
		if _, ok := seen[value]; ok {
			continue
		}
		seen[value] = struct{}{}
		out = append(out, value)
	}
	return out
}
