// Tests for read-only RECONCILE_ADHERENCE_CHAIN.
// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: table-driven finding codes and six-class fixture (A18/A19).
package checklist

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestLoadAdherenceLedger_schemaValidation(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "events.jsonl")
	writeLines(t, path, []string{
		`{"schema_version":"agent-adherence-event.v1","event_class":"instruction_rendered","correlation":{"request_token":"REQ-TEST","run_id":"r1","turn_index":1,"step_slug":"alpha","instruction_hash":"sha256:a","instruction_nonce":"n1"},"source":{"kind":"agentstream"}}`,
		`{"schema_version":"wrong","event_class":"instruction_rendered"}`,
	})
	events, errs := LoadAdherenceLedger(path)
	if len(events) != 1 {
		t.Fatalf("expected 1 valid row, got %d events and %d errs: %v", len(events), len(errs), errs)
	}
	if events[0].EventClass != "instruction_rendered" {
		t.Fatalf("unexpected event: %#v", events[0])
	}
	if len(errs) != 1 {
		t.Fatalf("expected 1 schema error, got %d", len(errs))
	}
}

func TestReconcileAdherenceChain_legacyNoAdherenceChain(t *testing.T) {
	report, err := ReconcileAdherenceChain(ReconcileInput{
		LedgerPath: filepath.Join(t.TempDir(), "missing.jsonl"),
		Tracker: map[string]interface{}{
			"request_token": "REQ-TEST",
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	if !hasFindingCode(report.Findings, findingLegacyNoAdherenceChain) {
		t.Fatalf("expected %s, got %#v", findingLegacyNoAdherenceChain, report.Findings)
	}
	if !report.ReadOnly {
		t.Fatal("report must be read-only")
	}
}

func TestReconcileAdherenceChain_renderedWithoutAcknowledgment(t *testing.T) {
	dir := t.TempDir()
	path := writeFixtureLedger(t, dir, []map[string]interface{}{
		instructionRenderedRow(1, "alpha", "nonce-a", "sha256:one"),
	})
	report, err := ReconcileAdherenceChain(ReconcileInput{
		LedgerPath: path,
		Tracker:    minimalTracker("REQ-TEST"),
	})
	if err != nil {
		t.Fatal(err)
	}
	assertFinding(t, report.Findings, findingRenderedWithoutAck)
}

func TestReconcileAdherenceChain_acknowledgedWithoutAttempt(t *testing.T) {
	dir := t.TempDir()
	path := writeFixtureLedger(t, dir, []map[string]interface{}{
		instructionRenderedRow(1, "change-definition", "nonce-a", "sha256:one"),
		agentAcknowledgedRow(1, "change-definition", "nonce-a", "sha256:one", "receipt-1"),
	})
	tracker := minimalTracker("REQ-TEST")
	tracker["steps"] = []interface{}{
		map[string]interface{}{
			"slug":        "change-definition",
			"disposition": "completed",
			"evidence_refs": []interface{}{
				"docs/plan.md",
			},
		},
	}
	report, err := ReconcileAdherenceChain(ReconcileInput{
		LedgerPath: path,
		Tracker:    tracker,
	})
	if err != nil {
		t.Fatal(err)
	}
	assertFinding(t, report.Findings, findingAcknowledgedWithoutAttempt)
}

func TestReconcileAdherenceChain_attemptWithoutVerifiedOutcome(t *testing.T) {
	dir := t.TempDir()
	path := writeFixtureLedger(t, dir, []map[string]interface{}{
		instructionRenderedRow(1, "change-definition", "nonce-a", "sha256:one"),
		agentAcknowledgedRow(1, "change-definition", "nonce-a", "sha256:one", "receipt-1"),
		actionAttemptedRow(1, "change-definition", "sha256:one", "receipt-1", []string{"docs/plan.md"}),
	})
	tracker := minimalTracker("REQ-TEST")
	tracker["steps"] = []interface{}{
		map[string]interface{}{
			"slug":        "change-definition",
			"disposition": "completed",
			"evidence_refs": []interface{}{
				"docs/plan.md",
			},
		},
	}
	report, err := ReconcileAdherenceChain(ReconcileInput{
		LedgerPath: path,
		Tracker:    tracker,
	})
	if err != nil {
		t.Fatal(err)
	}
	assertFinding(t, report.Findings, findingAttemptWithoutVerified)
}

func TestReconcileAdherenceChain_completedWithUnresolvedEvidence(t *testing.T) {
	dir := t.TempDir()
	path := writeFixtureLedger(t, dir, []map[string]interface{}{})
	tracker := minimalTracker("REQ-TEST")
	tracker["steps"] = []interface{}{
		map[string]interface{}{
			"slug":        "change-definition",
			"disposition": "completed",
			"evidence_refs": []interface{}{
				"missing/file.txt",
			},
		},
	}
	report, err := ReconcileAdherenceChain(ReconcileInput{
		LedgerPath:  path,
		Tracker:     tracker,
		Workspace:   dir,
	})
	if err != nil {
		t.Fatal(err)
	}
	assertFinding(t, report.Findings, findingCompletedWithUnresolved)
}

func TestReconcileAdherenceChain_gateWithoutCurrentEvidence(t *testing.T) {
	dir := t.TempDir()
	gatesDir := filepath.Join(dir, "gates")
	if err := os.MkdirAll(gatesDir, 0o755); err != nil {
		t.Fatal(err)
	}
	tracker := map[string]interface{}{"name": "stage-k-current"}
	citdp := map[string]interface{}{"title": "stage-k"}
	staleTracker := map[string]interface{}{"name": "stage-k-stale"}
	receiptBody := map[string]interface{}{
		"schema_version": gateReceiptSchemaVersion,
		"phase":          "verification",
		"input_hashes": map[string]interface{}{
			"tracker_hash": "sha256:" + StableHash(staleTracker),
			"citdp_hash":   "sha256:" + StableHash(citdp),
		},
	}
	receiptPath := filepath.Join(gatesDir, "verification-stale.json")
	writeJSONFile(t, receiptPath, receiptBody)

	path := writeFixtureLedger(t, dir, []map[string]interface{}{
		gateDecidedRow("REQ-TEST", "verification", receiptPath, "sha256:unused"),
	})
	report, err := ReconcileAdherenceChain(ReconcileInput{
		LedgerPath: path,
		Tracker:    tracker,
		CITDP:      citdp,
		GatesDir:   gatesDir,
	})
	if err != nil {
		t.Fatal(err)
	}
	assertFinding(t, report.Findings, findingGateWithoutCurrentEvidence)
}

func TestReconcileAdherenceChain_statusChangeWithoutVerificationReceipt(t *testing.T) {
	dir := t.TempDir()
	path := writeFixtureLedger(t, dir, []map[string]interface{}{})
	report, err := ReconcileAdherenceChain(ReconcileInput{
		LedgerPath: path,
		Tracker:    minimalTracker("REQ-TEST"),
		TiedIndexes: TiedIndexSnapshot{
			Requirements: map[string]interface{}{
				"REQ-ONE": map[string]interface{}{"status": "Implemented"},
			},
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	assertFinding(t, report.Findings, findingStatusChangeWithoutReceipt)
}

func TestReconcileAdherenceChain_sixClassLinkedFixture(t *testing.T) {
	fixtureDir, ledgerPath, tracker, citdp, gatesDir := buildSixClassLinkedFixture(t)

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
	if report.LedgerRows < 6 {
		t.Fatalf("expected at least six ledger rows, got %d", report.LedgerRows)
	}
	for _, code := range []string{
		findingRenderedWithoutAck,
		findingAcknowledgedWithoutAttempt,
		findingAttemptWithoutVerified,
		findingCompletedWithUnresolved,
		findingGateWithoutCurrentEvidence,
		findingStatusChangeWithoutReceipt,
		findingLegacyNoAdherenceChain,
	} {
		if hasFindingCode(report.Findings, code) {
			t.Fatalf("linked fixture must not emit %s: %#v", code, report.Findings)
		}
	}
	classes := eventClassesInLedger(t, ledgerPath)
	for _, class := range []string{
		"instruction_rendered",
		"agent_acknowledged",
		"action_attempted",
		"outcome_verified",
		"gate_decided",
		"status_mutated",
	} {
		if !classes[class] {
			t.Fatalf("fixture missing event class %s", class)
		}
	}

	staticDir := filepath.Join(findRepoRoot(t), "tools/agentstream/checklist/testdata/six_class_linked_chain")
	if err := os.MkdirAll(staticDir, 0o755); err != nil {
		t.Fatal(err)
	}
	copyFile(t, ledgerPath, filepath.Join(staticDir, "events.jsonl"))
}

func buildSixClassLinkedFixture(t *testing.T) (fixtureDir, ledgerPath string, tracker, citdp map[string]interface{}, gatesDir string) {
	t.Helper()
	fixtureDir = t.TempDir()
	evidencePath := filepath.Join(fixtureDir, "evidence.txt")
	if err := os.WriteFile(evidencePath, []byte("synthetic pilot evidence\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	evidenceRef := "evidence.txt"
	evidenceHash := fileContentHash([]byte("synthetic pilot evidence\n"))

	tracker = map[string]interface{}{
		"request_token":  "REQ-SYNTHETIC-PILOT",
		"schema_version": TrackerSchemaVersion,
		"steps": []interface{}{
			map[string]interface{}{
				"slug":        "change-definition",
				"disposition": "completed",
				"evidence_refs": []interface{}{
					evidenceRef,
				},
			},
		},
	}
	citdp = map[string]interface{}{
		"title": "synthetic-pilot",
		"risk_analysis": map[string]interface{}{
			"adversarial_inquiry": map[string]interface{}{
				"depth_tier": "integrated",
			},
		},
	}

	gatesDir = filepath.Join(fixtureDir, "gates")
	if err := os.MkdirAll(gatesDir, 0o755); err != nil {
		t.Fatal(err)
	}
	receiptBody := map[string]interface{}{
		"schema_version": gateReceiptSchemaVersion,
		"phase":          "verification",
		"allowed":        true,
		"input_hashes": map[string]interface{}{
			"tracker_hash": "sha256:" + StableHash(tracker),
			"citdp_hash":   "sha256:" + StableHash(citdp),
		},
	}
	receiptPath := filepath.Join(gatesDir, "verification-linked.json")
	writeJSONFile(t, receiptPath, receiptBody)
	receiptHash := fileContentHash(mustReadFile(t, receiptPath))

	rows := []map[string]interface{}{
		instructionRenderedRow(1, "change-definition", "nonce-pilot", "sha256:pilot"),
		agentAcknowledgedRow(1, "change-definition", "nonce-pilot", "sha256:pilot", "receipt-pilot"),
		actionAttemptedRow(1, "change-definition", "sha256:pilot", "receipt-pilot", []string{evidenceRef}),
		outcomeVerifiedRow(1, "change-definition", "receipt-pilot", evidenceRef, evidenceHash),
		gateDecidedRow("REQ-SYNTHETIC-PILOT", "verification", receiptPath, receiptHash),
		statusMutatedRow("REQ-SYNTHETIC-PILOT", receiptPath, receiptHash),
	}
	ledgerPath = writeFixtureLedger(t, fixtureDir, rows)
	return fixtureDir, ledgerPath, tracker, citdp, gatesDir
}

func mustReadFile(t *testing.T, path string) []byte {
	t.Helper()
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	return data
}

func copyFile(t *testing.T, src, dst string) {
	t.Helper()
	data, err := os.ReadFile(src)
	if err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(dst, data, 0o644); err != nil {
		t.Fatal(err)
	}
}

func TestReconcileAdherenceChain_gotoClearsCompletedWithUnresolvedFinding(t *testing.T) {
	defPath, trackerPath := setupTrackerFixture(t)
	doc, err := LoadTrackerYAML(trackerPath)
	if err != nil {
		t.Fatal(err)
	}
	steps := doc["steps"].([]interface{})
	beta := steps[1].(map[string]interface{})
	beta["disposition"] = "completed"
	beta["evidence_refs"] = []interface{}{"missing/beta-evidence.md"}
	steps[1] = beta
	doc["steps"] = steps
	if err := atomicWriteYAML(trackerPath, doc); err != nil {
		t.Fatal(err)
	}

	reportBefore, err := ReconcileAdherenceChain(ReconcileInput{
		LedgerPath: writeFixtureLedger(t, t.TempDir(), []map[string]interface{}{}),
		Tracker:    doc,
		Workspace:  t.TempDir(),
	})
	if err != nil {
		t.Fatal(err)
	}
	if !hasFindingCode(reportBefore.Findings, findingCompletedWithUnresolved) {
		t.Fatal("expected completed_with_unresolved_evidence before goto invalidation")
	}

	if _, err := InvalidateTrackerDownstream(trackerPath, defPath, "alpha"); err != nil {
		t.Fatal(err)
	}
	doc, err = LoadTrackerYAML(trackerPath)
	if err != nil {
		t.Fatal(err)
	}
	if dispositionForSlugMap(doc, "beta") != "pending" {
		t.Fatalf("beta should be pending after invalidation: %#v", doc)
	}

	reportAfter, err := ReconcileAdherenceChain(ReconcileInput{
		LedgerPath: writeFixtureLedger(t, t.TempDir(), []map[string]interface{}{}),
		Tracker:    doc,
		Workspace:  t.TempDir(),
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, finding := range reportAfter.Findings {
		if finding.Code != findingCompletedWithUnresolved {
			continue
		}
		slug, _ := finding.Detail["step_slug"].(string)
		if slug == "beta" {
			t.Fatalf("A20: cleared downstream must not emit %s for beta: %#v", findingCompletedWithUnresolved, finding)
		}
	}
}

func dispositionForSlugMap(doc map[string]interface{}, slug string) string {
	steps, ok := doc["steps"].([]interface{})
	if !ok {
		return ""
	}
	for _, item := range steps {
		row, ok := item.(map[string]interface{})
		if !ok {
			continue
		}
		if row["slug"] == slug {
			d, _ := row["disposition"].(string)
			return d
		}
	}
	return ""
}

func TestReconcileAdherenceChain_stageJGateFixtures(t *testing.T) {
	repoRoot := findRepoRoot(t)
	gatesDir := filepath.Join(repoRoot, "working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/gates")
	if _, err := os.Stat(gatesDir); err != nil {
		t.Skip("Stage J gate fixtures not present")
	}
	ledgerPath := filepath.Join(repoRoot, "working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/adherence/events.jsonl")
	if _, err := os.Stat(ledgerPath); err != nil {
		t.Skip("Stage J adherence ledger not present")
	}
	events, errs := LoadAdherenceLedger(ledgerPath)
	if len(errs) > 0 {
		t.Fatalf("ledger load errors: %v", errs)
	}
	gateRows := 0
	for _, ev := range events {
		if ev.EventClass == "gate_decided" {
			gateRows++
			artifactRef, _ := ev.Raw["artifact_ref"].(string)
			if !strings.HasPrefix(artifactRef, "working/") {
				continue
			}
			abs := filepath.Join(repoRoot, artifactRef)
			if _, err := os.Stat(abs); err != nil {
				t.Fatalf("gate receipt missing: %s", abs)
			}
		}
	}
	if gateRows == 0 {
		t.Fatal("expected gate_decided rows in Stage J ledger")
	}
	entries, err := os.ReadDir(gatesDir)
	if err != nil {
		t.Fatal(err)
	}
	if len(entries) == 0 {
		t.Fatal("expected gate JSON fixtures")
	}
}

func TestStableHash_matchesNodeSemantics(t *testing.T) {
	tracker := map[string]interface{}{
		"name": "stage-k",
		"steps": []interface{}{
			map[string]interface{}{"slug": "alpha", "disposition": "completed"},
		},
	}
	first := StableHash(tracker)
	second := StableHash(tracker)
	if first != second {
		t.Fatalf("stable hash not deterministic: %s vs %s", first, second)
	}
	if len(first) != 64 {
		t.Fatalf("expected 64 hex chars, got %q", first)
	}
}

func writeFixtureLedger(t *testing.T, dir string, rows []map[string]interface{}) string {
	t.Helper()
	path := filepath.Join(dir, "events.jsonl")
	var lines []string
	for _, row := range rows {
		body, err := json.Marshal(row)
		if err != nil {
			t.Fatal(err)
		}
		lines = append(lines, string(body))
	}
	writeLines(t, path, lines)
	return path
}

func writeLines(t *testing.T, path string, lines []string) {
	t.Helper()
	if err := os.WriteFile(path, []byte(strings.Join(lines, "\n")+"\n"), 0o644); err != nil {
		t.Fatal(err)
	}
}

func writeJSONFile(t *testing.T, path string, value interface{}) {
	t.Helper()
	body, err := json.MarshalIndent(value, "", "  ")
	if err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(path, append(body, '\n'), 0o644); err != nil {
		t.Fatal(err)
	}
}

func assertFinding(t *testing.T, findings []ReconcileFinding, code string) {
	t.Helper()
	if !hasFindingCode(findings, code) {
		t.Fatalf("expected finding %s, got %#v", code, findings)
	}
}

func hasFindingCode(findings []ReconcileFinding, code string) bool {
	for _, finding := range findings {
		if finding.Code == code {
			return true
		}
	}
	return false
}

func eventClassesInLedger(t *testing.T, path string) map[string]bool {
	t.Helper()
	events, errs := LoadAdherenceLedger(path)
	if len(errs) > 0 {
		t.Fatalf("ledger errors: %v", errs)
	}
	out := map[string]bool{}
	for _, ev := range events {
		out[ev.EventClass] = true
	}
	return out
}

func findRepoRoot(t *testing.T) string {
	t.Helper()
	wd, err := os.Getwd()
	if err != nil {
		t.Fatal(err)
	}
	dir := wd
	for {
		if _, err := os.Stat(filepath.Join(dir, "AGENTS.md")); err == nil {
			if _, err := os.Stat(filepath.Join(dir, "tools", "agentstream")); err == nil {
				return dir
			}
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			t.Fatal("repo root not found")
		}
		dir = parent
	}
}
