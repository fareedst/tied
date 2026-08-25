// Tests for controlled-client adherence pilot report assembly (Stage L A19).
// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: pilot report links six classes with zero blocking findings.
package checklist

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestRunControlledClientPilot_sixClassesLinkedZeroBlocking(t *testing.T) {
	repoRoot := findRepoRoot(t)
	requestToken := "REQ-TIED_CHECKLIST_GATE_ENFORCEMENT"
	input, err := BuildPilotControlledClientFixture(repoRoot, requestToken)
	if err != nil {
		t.Fatal(err)
	}

	report, err := RunControlledClientPilot(input)
	if err != nil {
		t.Fatal(err)
	}
	if report.SchemaVersion != pilotReportSchemaVersion {
		t.Fatalf("schema: got %q", report.SchemaVersion)
	}
	if report.RequestToken != requestToken {
		t.Fatalf("request token: got %q", report.RequestToken)
	}
	for _, class := range []string{
		"instruction_rendered",
		"agent_acknowledged",
		"action_attempted",
		"outcome_verified",
		"gate_decided",
		"status_mutated",
	} {
		if !report.EventClasses[class] {
			t.Fatalf("pilot report missing event class %s: %#v", class, report.EventClasses)
		}
	}
	if report.RolloutStop.ShouldStop {
		t.Fatalf("pilot should not stop rollout: %#v", report.RolloutStop)
	}
	if report.BlockingFindingCount != 0 {
		t.Fatalf("expected zero blocking findings, got %d: %#v", report.BlockingFindingCount, report.Reconcile.Findings)
	}
	for _, runID := range []string{
		input.PhaseRunIDs["pre_implementation"],
		input.PhaseRunIDs["verification"],
		input.PhaseRunIDs["close_out"],
	} {
		if runID == "" {
			t.Fatal("phase run_id must be distinct and non-empty")
		}
	}
	if _, err := os.Stat(input.ReportPath); err != nil {
		t.Fatalf("pilot report not written: %v", err)
	}

	staticDir := filepath.Join(findRepoRoot(t), "tools/agentstream/checklist/testdata/pilot_controlled_client")
	if err := os.MkdirAll(staticDir, 0o755); err != nil {
		t.Fatal(err)
	}
	copyFile(t, input.LedgerPath, filepath.Join(staticDir, "events.jsonl"))
}

func TestRunControlledClientPilot_rolloutStopOnBlockingFinding(t *testing.T) {
	fixtureDir, ledgerPath, tracker, citdp, gatesDir := buildSixClassLinkedFixture(t)
	tracker["steps"] = []interface{}{
		map[string]interface{}{
			"slug":        "change-definition",
			"disposition": "completed",
			"evidence_refs": []interface{}{
				"missing/evidence.txt",
			},
		},
	}
	report, err := ReconcileAdherenceChain(ReconcileInput{
		LedgerPath: ledgerPath,
		Tracker:    tracker,
		CITDP:      citdp,
		GatesDir:   gatesDir,
		Workspace:  fixtureDir,
	})
	if err != nil {
		t.Fatal(err)
	}
	stop, err := EvaluateRolloutStop(RolloutStopInput{
		Tracker:         tracker,
		ReconcileReport: report,
	})
	if err != nil {
		t.Fatal(err)
	}
	if !stop.ShouldStop || !containsReason(stop.Reasons, stopCompletedWithUnresolvedEvidence) {
		t.Fatalf("expected rollout stop on unresolved evidence: %#v", stop)
	}
}

func TestRunControlledClientPilot_stageQSecondPilot(t *testing.T) {
	repoRoot := findRepoRoot(t)
	requestToken := "REQ-TIED_CHECKLIST_GATE_ENFORCEMENT"
	input, err := BuildStageQPilotControlledClientFixture(repoRoot, requestToken)
	if err != nil {
		t.Fatal(err)
	}

	report, err := RunControlledClientPilot(input)
	if err != nil {
		t.Fatal(err)
	}
	if report.PilotClient != stageQPilotClientName {
		t.Fatalf("pilot client: got %q want %q", report.PilotClient, stageQPilotClientName)
	}
	for _, class := range []string{
		"instruction_rendered",
		"agent_acknowledged",
		"action_attempted",
		"outcome_verified",
		"gate_decided",
		"status_mutated",
	} {
		if !report.EventClasses[class] {
			t.Fatalf("stage Q pilot missing event class %s: %#v", class, report.EventClasses)
		}
	}
	if report.RolloutStop.ShouldStop {
		t.Fatalf("stage Q pilot should not stop rollout: %#v", report.RolloutStop)
	}
	if report.BlockingFindingCount != 0 {
		t.Fatalf("expected zero blocking findings, got %d: %#v", report.BlockingFindingCount, report.Reconcile.Findings)
	}
	for _, phase := range []string{"pre_implementation", "verification", "close_out"} {
		runID := input.PhaseRunIDs[phase]
		if !strings.HasPrefix(runID, "stage-q-") {
			t.Fatalf("phase %s run_id must use stage-q prefix: %q", phase, runID)
		}
	}
	if _, err := os.Stat(input.ReportPath); err != nil {
		t.Fatalf("stage Q pilot report not written: %v", err)
	}

	events, errs := LoadAdherenceLedger(input.LedgerPath)
	if len(errs) > 0 {
		t.Fatalf("ledger errors: %v", errs)
	}
	order := make([]string, 0, len(events))
	for _, ev := range events {
		order = append(order, ev.EventClass)
	}
	want := []string{"instruction_rendered", "action_attempted", "outcome_verified", "agent_acknowledged"}
	if !hasEventSubsequence(order, want) {
		t.Fatalf("stage Q ledger order %v must contain %v (live action_attempted before ack)", order, want)
	}
}

func hasEventSubsequence(haystack, needle []string) bool {
	if len(needle) == 0 {
		return true
	}
	i := 0
	for _, item := range haystack {
		if item == needle[i] {
			i++
			if i == len(needle) {
				return true
			}
		}
	}
	return false
}

func TestWritePilotReport_roundTrip(t *testing.T) {
	path := filepath.Join(t.TempDir(), "pilot-report.json")
	want := PilotReport{
		SchemaVersion: pilotReportSchemaVersion,
		RequestToken:  "REQ-TEST",
		PilotClient:   pilotClientName,
		EventClasses:  map[string]bool{"instruction_rendered": true},
		ReadOnly:      true,
	}
	if err := WritePilotReport(path, want); err != nil {
		t.Fatal(err)
	}
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	var got PilotReport
	if err := json.Unmarshal(data, &got); err != nil {
		t.Fatal(err)
	}
	if got.RequestToken != want.RequestToken || !got.ReadOnly {
		t.Fatalf("round trip mismatch: %#v", got)
	}
}
