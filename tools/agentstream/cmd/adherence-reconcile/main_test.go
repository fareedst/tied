// CLI tests for read-only adherence reconciliation operator surface (Stage N A26).
// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: table parity with adherence_reconcile_test.go via subprocess.
package main_test

import (
	"encoding/json"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"

	"stdd/agentstream/checklist"
)

const (
	findingRenderedWithoutAck         = "rendered_without_acknowledgment"
	findingAcknowledgedWithoutAttempt = "acknowledged_without_attempt"
	findingAttemptWithoutVerified     = "attempt_without_verified_outcome"
	findingCompletedWithUnresolved    = "completed_with_unresolved_evidence"
	findingGateWithoutCurrentEvidence = "gate_without_current_evidence"
	findingStatusChangeWithoutReceipt = "status_change_without_verification_receipt"
	findingLegacyNoAdherenceChain     = "legacy_no_adherence_chain"
)

func TestCLI_emitsReconcileReport(t *testing.T) {
	dir := t.TempDir()
	ledgerPath := writeFixtureLedger(t, dir, []map[string]interface{}{
		instructionRenderedRow(1, "alpha", "nonce-a", "sha256:one"),
	})
	trackerPath := writeTrackerYAML(t, dir, minimalTracker("REQ-CLI"))

	report := runCLI(t, dir, []string{
		"--ledger", ledgerPath,
		"--tracker", trackerPath,
		"--workspace", dir,
	})
	if !report.ReadOnly {
		t.Fatal("report must be read-only")
	}
	if report.LedgerRows != 1 {
		t.Fatalf("ledger_rows: got %d", report.LedgerRows)
	}
	assertFinding(t, report.Findings, findingRenderedWithoutAck)
}

func TestCLI_tableParity(t *testing.T) {
	cases := []struct {
		name     string
		build    func(t *testing.T) (workspace, ledgerPath, trackerPath, citdpPath, gatesDir string, extraArgs []string)
		wantCode string
		wantNone []string
	}{
		{
			name: "legacy_no_adherence_chain",
			build: func(t *testing.T) (string, string, string, string, string, []string) {
				dir := t.TempDir()
				trackerPath := writeTrackerYAML(t, dir, minimalTracker("REQ-TEST"))
				return dir, filepath.Join(dir, "missing.jsonl"), trackerPath, "", "", nil
			},
			wantCode: findingLegacyNoAdherenceChain,
		},
		{
			name: "acknowledged_without_attempt",
			build: func(t *testing.T) (string, string, string, string, string, []string) {
				dir := t.TempDir()
				ledgerPath := writeFixtureLedger(t, dir, []map[string]interface{}{
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
				return dir, ledgerPath, writeTrackerYAML(t, dir, tracker), "", "", nil
			},
			wantCode: findingAcknowledgedWithoutAttempt,
		},
		{
			name: "attempt_without_verified_outcome",
			build: func(t *testing.T) (string, string, string, string, string, []string) {
				dir := t.TempDir()
				ledgerPath := writeFixtureLedger(t, dir, []map[string]interface{}{
					instructionRenderedRow(1, "change-definition", "nonce-a", "sha256:one"),
					agentAcknowledgedRow(1, "change-definition", "nonce-a", "sha256:one", "receipt-1"),
					actionAttemptedRow(1, "change-definition", "nonce-a", "sha256:one", "receipt-1", []string{"docs/plan.md"}),
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
				return dir, ledgerPath, writeTrackerYAML(t, dir, tracker), "", "", nil
			},
			wantCode: findingAttemptWithoutVerified,
		},
		{
			name: "six_class_linked_zero_blocking",
			build: func(t *testing.T) (string, string, string, string, string, []string) {
				repoRoot := findRepoRoot(t)
				requestToken := "REQ-TIED_CHECKLIST_GATE_ENFORCEMENT"
				input, err := checklist.BuildPilotControlledClientFixture(repoRoot, requestToken)
				if err != nil {
					t.Fatal(err)
				}
				return repoRoot, input.LedgerPath, input.TrackerPath, input.CITDPPath, input.GatesDir, nil
			},
			wantNone: []string{
				findingRenderedWithoutAck,
				findingAcknowledgedWithoutAttempt,
				findingAttemptWithoutVerified,
				findingCompletedWithUnresolved,
				findingGateWithoutCurrentEvidence,
				findingStatusChangeWithoutReceipt,
				findingLegacyNoAdherenceChain,
			},
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			workspace, ledgerPath, trackerPath, citdpPath, gatesDir, extra := tc.build(t)
			args := []string{
				"--ledger", ledgerPath,
				"--tracker", trackerPath,
				"--workspace", workspace,
			}
			if citdpPath != "" {
				args = append(args, "--citdp", citdpPath)
			}
			if gatesDir != "" {
				args = append(args, "--gates-dir", gatesDir)
			}
			args = append(args, extra...)
			report := runCLI(t, workspace, args)
			if tc.wantCode != "" {
				assertFinding(t, report.Findings, tc.wantCode)
			}
			for _, code := range tc.wantNone {
				if hasFindingCode(report.Findings, code) {
					t.Fatalf("unexpected finding %s: %#v", code, report.Findings)
				}
			}
		})
	}
}

func runCLI(t *testing.T, cwd string, args []string) checklist.ReconcileReport {
	t.Helper()
	binary := os.Getenv("ADHERENCE_RECONCILE_BIN")
	var cmd *exec.Cmd
	var cmdDir string
	if binary != "" {
		cmd = exec.Command(binary, args...)
		cmdDir = cwd
	} else {
		moduleRoot := filepath.Join(findRepoRoot(t), "tools/agentstream")
		cmd = exec.Command("go", append([]string{"run", "./cmd/adherence-reconcile"}, args...)...)
		cmdDir = moduleRoot
	}
	cmd.Dir = cmdDir
	out, err := cmd.Output()
	if err != nil {
		if ee, ok := err.(*exec.ExitError); ok {
			t.Fatalf("cli failed: %v stderr=%s", err, string(ee.Stderr))
		}
		t.Fatal(err)
	}
	var report checklist.ReconcileReport
	if err := json.Unmarshal(out, &report); err != nil {
		t.Fatalf("invalid json: %v body=%s", err, out)
	}
	return report
}

func minimalTracker(requestToken string) map[string]interface{} {
	return map[string]interface{}{
		"request_token":  requestToken,
		"schema_version": "checklist-tracker.v1",
		"steps":          []interface{}{},
	}
}

func instructionRenderedRow(turn int, slug, nonce, hash string) map[string]interface{} {
	return map[string]interface{}{
		"schema_version": "agent-adherence-event.v1",
		"event_class":    "instruction_rendered",
		"correlation": map[string]interface{}{
			"request_token":     "REQ-TEST",
			"run_id":            "run-1",
			"turn_index":        turn,
			"step_slug":         slug,
			"instruction_hash":  hash,
			"instruction_nonce": nonce,
		},
		"source": map[string]interface{}{"kind": "agentstream"},
	}
}

func agentAcknowledgedRow(turn int, slug, nonce, hash, receiptHash string) map[string]interface{} {
	return map[string]interface{}{
		"schema_version": "agent-adherence-event.v1",
		"event_class":    "agent_acknowledged",
		"correlation": map[string]interface{}{
			"request_token":     "REQ-TEST",
			"run_id":            "run-1",
			"turn_index":        turn,
			"step_slug":         slug,
			"instruction_hash":  hash,
			"instruction_nonce": nonce,
			"receipt_hash":      receiptHash,
		},
		"source": map[string]interface{}{"kind": "agentstream"},
	}
}

func actionAttemptedRow(turn int, slug, nonce, hash, receiptHash string, refs []string) map[string]interface{} {
	evidenceRefs := make([]interface{}, len(refs))
	for i, ref := range refs {
		evidenceRefs[i] = ref
	}
	corr := map[string]interface{}{
		"request_token":     "REQ-TEST",
		"run_id":            "run-1",
		"turn_index":        turn,
		"step_slug":         slug,
		"instruction_hash":  hash,
		"instruction_nonce": nonce,
		"receipt_hash":      receiptHash,
	}
	return map[string]interface{}{
		"schema_version": "agent-adherence-event.v1",
		"event_class":    "action_attempted",
		"correlation":    corr,
		"evidence_refs":  evidenceRefs,
		"hook_log_ref": map[string]interface{}{
			"path": "/tmp/synthetic-hook.yaml",
			"line": 1,
		},
		"source": map[string]interface{}{"kind": "cursor_hook", "hook_event": "postToolUse"},
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
	if err := os.WriteFile(path, []byte(strings.Join(lines, "\n")+"\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	return path
}

func writeTrackerYAML(t *testing.T, dir string, tracker map[string]interface{}) string {
	t.Helper()
	path := filepath.Join(dir, "tracker.yaml")
	if err := os.WriteFile(path, []byte(mustYAML(t, tracker)), 0o644); err != nil {
		t.Fatal(err)
	}
	return path
}

func mustYAML(t *testing.T, doc map[string]interface{}) string {
	t.Helper()
	b, err := json.Marshal(doc)
	if err != nil {
		t.Fatal(err)
	}
	// round-trip through checklist atomicWriteYAML is not exported; write simple yaml manually for tests
	if token, ok := doc["request_token"].(string); ok {
		out := "request_token: " + token + "\nschema_version: checklist-tracker.v1\n"
		if steps, ok := doc["steps"].([]interface{}); ok {
			out += "steps:\n"
			for _, item := range steps {
				step, ok := item.(map[string]interface{})
				if !ok {
					continue
				}
				out += "  - slug: " + step["slug"].(string) + "\n"
				if disp, ok := step["disposition"].(string); ok {
					out += "    disposition: " + disp + "\n"
				}
				if refs, ok := step["evidence_refs"].([]interface{}); ok {
					out += "    evidence_refs:\n"
					for _, ref := range refs {
						out += "      - " + ref.(string) + "\n"
					}
				}
			}
		} else {
			out += "steps: []\n"
		}
		_ = b
		return out
	}
	t.Fatal("tracker missing request_token")
	return ""
}

func assertFinding(t *testing.T, findings []checklist.ReconcileFinding, code string) {
	t.Helper()
	if !hasFindingCode(findings, code) {
		t.Fatalf("expected finding %s, got %#v", code, findings)
	}
}

func hasFindingCode(findings []checklist.ReconcileFinding, code string) bool {
	for _, finding := range findings {
		if finding.Code == code {
			return true
		}
	}
	return false
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
