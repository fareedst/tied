// Tests for observational rollout stop evaluation (Stage L).
// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: each stop condition triggers/fails appropriately.
package checklist

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestEvaluateRolloutStop_writerCorruptsTracker(t *testing.T) {
	tracker := map[string]interface{}{
		"schema_version": TrackerSchemaVersion,
		"steps": []interface{}{
			map[string]interface{}{"slug": "alpha", "disposition": "completed"},
		},
		"execution_evidence": map[string]interface{}{
			"completed": []interface{}{"alpha", "beta"},
		},
	}
	result, err := EvaluateRolloutStop(RolloutStopInput{Tracker: tracker})
	if err != nil {
		t.Fatal(err)
	}
	if !result.ShouldStop {
		t.Fatalf("expected stop for corrupted tracker: %#v", result)
	}
	if !containsReasonPrefix(result.Reasons, stopWriterCorruptsTracker) {
		t.Fatalf("expected %s reason, got %#v", stopWriterCorruptsTracker, result.Reasons)
	}
}

func TestEvaluateRolloutStop_turnAdvancesWithoutBoundReceipt(t *testing.T) {
	tracker := minimalTracker("REQ-TEST")
	result, err := EvaluateRolloutStop(RolloutStopInput{
		Tracker: tracker,
		ReconcileReport: ReconcileReport{
			Findings: []ReconcileFinding{{Code: findingRenderedWithoutAck}},
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	if !result.ShouldStop || !containsReason(result.Reasons, stopTurnAdvancesWithoutBoundReceipt) {
		t.Fatalf("expected %s, got %#v", stopTurnAdvancesWithoutBoundReceipt, result)
	}
}

func TestEvaluateRolloutStop_statusChangeWithoutVerificationReceipt(t *testing.T) {
	result, err := EvaluateRolloutStop(RolloutStopInput{
		Tracker: minimalTracker("REQ-TEST"),
		ReconcileReport: ReconcileReport{
			Findings: []ReconcileFinding{{Code: findingStatusChangeWithoutReceipt}},
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	if !result.ShouldStop || !containsReason(result.Reasons, stopStatusChangeWithoutReceipt) {
		t.Fatalf("expected %s, got %#v", stopStatusChangeWithoutReceipt, result)
	}
}

func TestEvaluateRolloutStop_completedWithUnresolvedEvidence(t *testing.T) {
	result, err := EvaluateRolloutStop(RolloutStopInput{
		Tracker: minimalTracker("REQ-TEST"),
		ReconcileReport: ReconcileReport{
			Findings: []ReconcileFinding{{Code: findingCompletedWithUnresolved}},
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	if !result.ShouldStop || !containsReason(result.Reasons, stopCompletedWithUnresolvedEvidence) {
		t.Fatalf("expected %s, got %#v", stopCompletedWithUnresolvedEvidence, result)
	}
}

func TestEvaluateRolloutStop_canonicalChecklistBytesChanged(t *testing.T) {
	defPath := writeTrackerTestDefinition(t, nil)
	baseline, err := DefinitionContentHash(defPath)
	if err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(defPath, append(mustReadFile(t, defPath), '#'), 0o644); err != nil {
		t.Fatal(err)
	}
	result, err := EvaluateRolloutStop(RolloutStopInput{
		Tracker:                minimalTracker("REQ-TEST"),
		DefinitionPath:         defPath,
		BaselineDefinitionHash: baseline,
	})
	if err != nil {
		t.Fatal(err)
	}
	if !result.ShouldStop || !containsReason(result.Reasons, stopCanonicalChecklistBytesChanged) {
		t.Fatalf("expected %s, got %#v", stopCanonicalChecklistBytesChanged, result)
	}
}

func TestEvaluateRolloutStop_cleanPilotChainDoesNotStop(t *testing.T) {
	fixtureDir, ledgerPath, tracker, citdp, gatesDir := buildSixClassLinkedFixture(t)
	defPath := writeTrackerTestDefinition(t, nil)
	baseline, err := DefinitionContentHash(defPath)
	if err != nil {
		t.Fatal(err)
	}
	report, err := ReconcileAdherenceChain(ReconcileInput{
		LedgerPath: ledgerPath,
		Tracker:    tracker,
		CITDP:      citdp,
		GatesDir:   gatesDir,
		Workspace:  fixtureDir,
		TiedIndexes: TiedIndexSnapshot{
			Requirements: map[string]interface{}{
				"REQ-SYNTHETIC-PILOT": map[string]interface{}{"status": "Implemented"},
			},
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	result, err := EvaluateRolloutStop(RolloutStopInput{
		Tracker:                tracker,
		DefinitionPath:         defPath,
		RequestToken:           "REQ-SYNTHETIC-PILOT",
		BaselineDefinitionHash: baseline,
		ReconcileReport:        report,
	})
	if err != nil {
		t.Fatal(err)
	}
	if result.ShouldStop {
		t.Fatalf("clean chain should not stop rollout: %#v", result)
	}
}

func TestDetectTrackerWriterCorruption_identityMismatch(t *testing.T) {
	defPath, trackerPath := setupTrackerFixture(t)
	tracker, err := LoadTrackerYAML(trackerPath)
	if err != nil {
		t.Fatal(err)
	}
	result, err := EvaluateRolloutStop(RolloutStopInput{
		Tracker:        tracker,
		DefinitionPath: defPath,
		RequestToken:   "REQ-WRONG",
	})
	if err != nil {
		t.Fatal(err)
	}
	if !result.ShouldStop {
		t.Fatalf("expected identity mismatch stop: %#v", result)
	}
}

func containsReason(reasons []string, want string) bool {
	for _, reason := range reasons {
		if reason == want {
			return true
		}
	}
	return false
}

func containsReasonPrefix(reasons []string, prefix string) bool {
	for _, reason := range reasons {
		if strings.HasPrefix(reason, prefix) {
			return true
		}
	}
	return false
}

func TestDefinitionBytesChanged_missingBaselineIsNoOp(t *testing.T) {
	changed, err := DefinitionBytesChanged("", filepath.Join(t.TempDir(), "missing.yaml"))
	if err != nil {
		t.Fatal(err)
	}
	if changed {
		t.Fatal("empty baseline must not signal change")
	}
}
