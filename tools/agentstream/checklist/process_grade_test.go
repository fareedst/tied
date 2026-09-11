// Tests for Wave 5 process_grade extension.
// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
package checklist

import (
	"os"
	"path/filepath"
	"testing"
)

func dualWriteTracker() map[string]interface{} {
	return map[string]interface{}{
		"request_token": "REQ-DUPCOMPARE",
		"execution_evidence": map[string]interface{}{
			"completed": []interface{}{"persist-citdp-record", "verification-gate"},
		},
		"steps": []interface{}{
			map[string]interface{}{
				"slug":       "verification-gate",
				"disposition": "pending",
				"tracking": map[string]interface{}{
					"status": "pending",
				},
			},
		},
	}
}

func syncedTracker() map[string]interface{} {
	return map[string]interface{}{
		"request_token": "REQ-DUPCOMPARE",
		"execution_evidence": map[string]interface{}{
			"completed": []interface{}{"persist-citdp-record", "verification-gate"},
		},
		"steps": []interface{}{
			map[string]interface{}{
				"slug":        "verification-gate",
				"disposition": "completed",
				"tracking": map[string]interface{}{
					"status": "completed",
				},
			},
			map[string]interface{}{
				"slug":        "persist-citdp-record",
				"disposition": "completed",
				"tracking": map[string]interface{}{
					"status": "completed",
				},
			},
		},
	}
}

func TestComputeProcessGrade_dualWriteBandC(t *testing.T) {
	dir := t.TempDir()
	report, err := ReconcileAdherenceChain(ReconcileInput{
		LedgerPath: filepath.Join(dir, "missing.jsonl"),
		Tracker:    dualWriteTracker(),
		Workspace:  dir,
	})
	if err != nil {
		t.Fatal(err)
	}
	grade := ComputeProcessGrade(ReconcileInput{Tracker: dualWriteTracker(), Workspace: dir}, report)
	if grade.Band != "C" && grade.Band != "D" {
		t.Fatalf("expected band C or D for dual-write fixture, got %s score=%f", grade.Band, grade.Score)
	}
	if len(grade.GapCodes) == 0 {
		t.Fatal("expected gap codes for dual-write fixture")
	}
}

func TestComputeProcessGrade_syncedImprovesScore(t *testing.T) {
	dir := t.TempDir()
	requestToken := "REQ-DUPCOMPARE"
	evidenceDir := filepath.Join(dir, "working", requestToken, "evidence")
	if err := os.MkdirAll(evidenceDir, 0o755); err != nil {
		t.Fatal(err)
	}
	manifestPath := filepath.Join(evidenceDir, "verification-evidence-manifest.v1.json")
	if err := os.WriteFile(manifestPath, []byte(`{"schema_version":"verification-evidence-manifest.v1"}`), 0o644); err != nil {
		t.Fatal(err)
	}

	report, err := ReconcileAdherenceChain(ReconcileInput{
		LedgerPath: filepath.Join(dir, "missing.jsonl"),
		Tracker:    syncedTracker(),
		Workspace:  dir,
	})
	if err != nil {
		t.Fatal(err)
	}
	grade := ComputeProcessGrade(ReconcileInput{Tracker: syncedTracker(), Workspace: dir}, report)
	if grade.Score < 75 {
		t.Fatalf("expected score >= 75 (band B) after sync+manifest, got %f band=%s", grade.Score, grade.Band)
	}
	if grade.Band != "B" && grade.Band != "A" {
		t.Fatalf("expected band B or A after sync, got %s", grade.Band)
	}
}

func TestComputeProcessGrade_externalFixtureWhenPresent(t *testing.T) {
	fixtureRoot := "/Users/fareed/Documents/dev/test/1789087315"
	trackerPath := filepath.Join(fixtureRoot, "working", "REQ-DUPCOMPARE", "agent-req-implementation-checklist.yaml")
	if _, err := os.Stat(trackerPath); err != nil {
		t.Skip("external fixture 1789087315 not present")
	}
	report, err := ReconcileAdherenceChain(ReconcileInput{
		LedgerPath:  filepath.Join(fixtureRoot, "working", "REQ-DUPCOMPARE", "gates", "ledger.jsonl"),
		TrackerPath: trackerPath,
		GatesDir:    filepath.Join(fixtureRoot, "working", "REQ-DUPCOMPARE", "gates"),
		Workspace:   fixtureRoot,
	})
	if err != nil {
		t.Fatal(err)
	}
	input := ReconcileInput{
		TrackerPath: trackerPath,
		GatesDir:    filepath.Join(fixtureRoot, "working", "REQ-DUPCOMPARE", "gates"),
		Workspace:   fixtureRoot,
	}
	grade := ComputeProcessGrade(input, report)
	if grade.Band != "C" && grade.Band != "D" {
		t.Fatalf("expected pre-sync band C/D on fixture 1789087315, got %s score=%f", grade.Band, grade.Score)
	}
}
