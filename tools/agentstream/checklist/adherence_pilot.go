// Controlled-client adherence pilot runner and report assembly.
// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
// How: RUN_CONTROLLED_CLIENT_PILOT reconciles adherence chain and evaluates rollout stop for A19/A20 evidence.
package checklist

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"gopkg.in/yaml.v3"
)

const (
	pilotReportSchemaVersion = "adherence-pilot-report.v1"
	pilotClientName          = "stdd"
)

// PilotInput configures a controlled-client adherence pilot run.
type PilotInput struct {
	RepoRoot               string
	RequestToken           string
	TrackerPath            string
	CITDPPath              string
	LedgerPath             string
	GatesDir               string
	DefinitionPath         string
	BaselineDefinitionHash string
	ReportPath             string
	Workspace              string
	TiedIndexes            TiedIndexSnapshot
	PhaseRunIDs            map[string]string
}

// PilotReport is the controlled-client pilot artifact for A19 acceptance.
type PilotReport struct {
	SchemaVersion        string             `json:"schema_version"`
	RequestToken         string             `json:"request_token"`
	PilotClient          string             `json:"pilot_client"`
	ControlledClientPath string             `json:"controlled_client_path"`
	DepthTier            string             `json:"depth_tier"`
	PhaseRunIDs          map[string]string  `json:"phase_run_ids"`
	EventClasses         map[string]bool    `json:"event_classes"`
	LedgerPath           string             `json:"ledger_path"`
	TrackerPath          string             `json:"tracker_path"`
	Reconcile            ReconcileReport    `json:"reconcile"`
	RolloutStop          RolloutStopResult  `json:"rollout_stop"`
	BlockingFindingCount int                `json:"blocking_finding_count"`
	ReadOnly             bool               `json:"read_only"`
}

// RunControlledClientPilot assembles pilot inputs, reconciles adherence, and optionally writes the report.
func RunControlledClientPilot(input PilotInput) (PilotReport, error) {
	report := PilotReport{
		SchemaVersion:        pilotReportSchemaVersion,
		RequestToken:         strings.TrimSpace(input.RequestToken),
		PilotClient:          pilotClientName,
		ControlledClientPath: filepath.Clean(input.RepoRoot),
		DepthTier:            "integrated",
		PhaseRunIDs:          input.PhaseRunIDs,
		LedgerPath:           filepath.Clean(input.LedgerPath),
		TrackerPath:          filepath.Clean(input.TrackerPath),
		ReadOnly:             true,
		EventClasses:         map[string]bool{},
	}
	if report.PhaseRunIDs == nil {
		report.PhaseRunIDs = map[string]string{}
	}

	citdp, err := loadYAMLMap(input.CITDPPath)
	if err != nil {
		return report, err
	}
	tracker, err := loadTracker(ReconcileInput{TrackerPath: input.TrackerPath})
	if err != nil {
		return report, err
	}
	if report.RequestToken == "" {
		report.RequestToken = trackerRequestToken(tracker)
	}

	workspace := strings.TrimSpace(input.Workspace)
	if workspace == "" {
		workspace = input.RepoRoot
	}

	reconcileReport, err := ReconcileAdherenceChain(ReconcileInput{
		LedgerPath:  input.LedgerPath,
		TrackerPath: input.TrackerPath,
		Tracker:     tracker,
		CITDP:       citdp,
		GatesDir:    input.GatesDir,
		Workspace:   workspace,
		TiedIndexes: input.TiedIndexes,
	})
	if err != nil {
		return report, err
	}
	report.Reconcile = reconcileReport

	events, _ := LoadAdherenceLedger(input.LedgerPath)
	for _, ev := range events {
		report.EventClasses[ev.EventClass] = true
	}

	stopResult, err := EvaluateRolloutStop(RolloutStopInput{
		Tracker:                tracker,
		DefinitionPath:         input.DefinitionPath,
		RequestToken:           report.RequestToken,
		BaselineDefinitionHash: input.BaselineDefinitionHash,
		ReconcileReport:        reconcileReport,
	})
	if err != nil {
		return report, err
	}
	report.RolloutStop = stopResult
	report.BlockingFindingCount = countBlockingReconcileFindings(reconcileReport.Findings)

	if strings.TrimSpace(input.ReportPath) != "" {
		if err := WritePilotReport(input.ReportPath, report); err != nil {
			return report, err
		}
	}
	return report, nil
}

// WritePilotReport writes adherence-pilot-report.v1 JSON atomically.
func WritePilotReport(path string, report PilotReport) error {
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return fmt.Errorf("pilot_report_write_failure: %w", err)
	}
	body, err := json.MarshalIndent(report, "", "  ")
	if err != nil {
		return fmt.Errorf("pilot_report_write_failure: %w", err)
	}
	tmp, err := os.CreateTemp(dir, ".pilot-report-*.json.tmp")
	if err != nil {
		return fmt.Errorf("pilot_report_write_failure: %w", err)
	}
	tmpPath := tmp.Name()
	defer func() {
		_ = os.Remove(tmpPath)
	}()
	if _, err := tmp.Write(append(body, '\n')); err != nil {
		_ = tmp.Close()
		return fmt.Errorf("pilot_report_write_failure: %w", err)
	}
	if err := tmp.Close(); err != nil {
		return fmt.Errorf("pilot_report_write_failure: %w", err)
	}
	if err := os.Rename(tmpPath, path); err != nil {
		return fmt.Errorf("pilot_report_write_failure: %w", err)
	}
	return nil
}

// BuildPilotControlledClientFixture materializes a controlled-client pilot corpus for REQ-TIED_CHECKLIST_GATE_ENFORCEMENT.
func BuildPilotControlledClientFixture(rootDir, requestToken string) (PilotInput, error) {
	rootDir = filepath.Clean(rootDir)
	adherenceDir := filepath.Join(rootDir, "working", requestToken, "adherence")
	gatesDir := filepath.Join(rootDir, "working", requestToken, "gates", "pilot")
	if err := os.MkdirAll(adherenceDir, 0o755); err != nil {
		return PilotInput{}, err
	}
	if err := os.MkdirAll(gatesDir, 0o755); err != nil {
		return PilotInput{}, err
	}

	evidencePath := filepath.Join(adherenceDir, "pilot-evidence.txt")
	evidenceBody := []byte("controlled-client pilot evidence for " + requestToken + "\n")
	if err := os.WriteFile(evidencePath, evidenceBody, 0o644); err != nil {
		return PilotInput{}, err
	}
	evidenceRef := filepath.Join("working", requestToken, "adherence", "pilot-evidence.txt")
	evidenceHash := fileContentHash(evidenceBody)

	trackerPath := filepath.Join(rootDir, "working", requestToken, "stage-l-controlled-pilot_20260825.yaml")
	citdpPath := filepath.Join(rootDir, "working", requestToken, "CITDP-"+requestToken+"-stage-l.yaml")
	definitionPath := filepath.Join(rootDir, "tied", "docs", "agent-req-implementation-checklist.yaml")
	citdpRecordKey := "CITDP-" + requestToken + "-stage-l"

	tracker := map[string]interface{}{
		"schema_version":  TrackerSchemaVersion,
		"request_token":   requestToken,
		"source_document": definitionPath,
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
	citdpDoc := map[string]interface{}{
		citdpRecordKey: map[string]interface{}{
			"record_identity": map[string]interface{}{
				"change_request_id": requestToken,
				"title":             "Stage L controlled-client pilot",
			},
			"risk_analysis": map[string]interface{}{
				"adversarial_inquiry": map[string]interface{}{
					"depth_tier":  "integrated",
					"gate_policy": "advisory",
				},
			},
		},
	}
	if err := atomicWriteYAML(trackerPath, tracker); err != nil {
		return PilotInput{}, err
	}
	if err := atomicWriteYAML(citdpPath, citdpDoc); err != nil {
		return PilotInput{}, err
	}
	citdp, err := loadYAMLMap(citdpPath)
	if err != nil {
		return PilotInput{}, err
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
	receiptPath := filepath.Join(gatesDir, "verification-stage-l-pilot-20260825.json")
	receiptBytes, err := json.MarshalIndent(receiptBody, "", "  ")
	if err != nil {
		return PilotInput{}, err
	}
	receiptBytesWithNL := append(receiptBytes, '\n')
	if err := os.WriteFile(receiptPath, receiptBytesWithNL, 0o644); err != nil {
		return PilotInput{}, err
	}
	receiptHash := fileContentHash(receiptBytesWithNL)

	phaseRunIDs := map[string]string{
		"pre_implementation": "stage-l-pre-implementation-20260825",
		"verification":       "stage-l-verification-20260825",
		"close_out":          "stage-l-close-out-20260825",
	}

	rows := []map[string]interface{}{
		pilotInstructionRenderedRow(requestToken, phaseRunIDs["pre_implementation"], 1, "change-definition", "nonce-stage-l", "sha256:stage-l"),
		pilotAgentAcknowledgedRow(requestToken, phaseRunIDs["pre_implementation"], 1, "change-definition", "nonce-stage-l", "sha256:stage-l", "receipt-stage-l"),
		pilotActionAttemptedRow(requestToken, phaseRunIDs["pre_implementation"], 1, "change-definition", "sha256:stage-l", "receipt-stage-l", []string{evidenceRef}),
		pilotOutcomeVerifiedRow(requestToken, phaseRunIDs["pre_implementation"], 1, "change-definition", "receipt-stage-l", evidenceRef, evidenceHash),
		gateDecidedRow(requestToken, "verification", receiptPath, receiptHash),
		statusMutatedRow(requestToken, receiptPath, receiptHash),
	}
	ledgerPath := filepath.Join(adherenceDir, "pilot-events.jsonl")
	if err := writePilotLedger(ledgerPath, rows); err != nil {
		return PilotInput{}, err
	}

	baselineHash, err := DefinitionContentHash(definitionPath)
	if err != nil {
		return PilotInput{}, err
	}

	return PilotInput{
		RepoRoot:               rootDir,
		RequestToken:           requestToken,
		TrackerPath:            trackerPath,
		CITDPPath:              citdpPath,
		LedgerPath:             ledgerPath,
		GatesDir:               gatesDir,
		DefinitionPath:         definitionPath,
		BaselineDefinitionHash: baselineHash,
		ReportPath:             filepath.Join(rootDir, "working", requestToken, "pilot-report.json"),
		Workspace:              rootDir,
		TiedIndexes: TiedIndexSnapshot{
			Requirements: map[string]interface{}{
				requestToken: map[string]interface{}{"status": "Implemented"},
			},
		},
		PhaseRunIDs: phaseRunIDs,
	}, nil
}

func loadYAMLMap(path string) (map[string]interface{}, error) {
	path = strings.TrimSpace(path)
	if path == "" {
		return map[string]interface{}{}, nil
	}
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("yaml_not_readable: %w", err)
	}
	var doc map[string]interface{}
	if err := yaml.Unmarshal(data, &doc); err != nil {
		return nil, fmt.Errorf("invalid_yaml: %w", err)
	}
	return doc, nil
}

func countBlockingReconcileFindings(findings []ReconcileFinding) int {
	count := 0
	for _, finding := range findings {
		switch finding.Code {
		case findingRenderedWithoutAck,
			findingAcknowledgedWithoutAttempt,
			findingAttemptWithoutVerified,
			findingCompletedWithUnresolved,
			findingGateWithoutCurrentEvidence,
			findingStatusChangeWithoutReceipt:
			count++
		}
	}
	return count
}

func writePilotLedger(path string, rows []map[string]interface{}) error {
	var lines []string
	for _, row := range rows {
		body, err := json.Marshal(row)
		if err != nil {
			return err
		}
		lines = append(lines, string(body))
	}
	return os.WriteFile(path, []byte(strings.Join(lines, "\n")+"\n"), 0o644)
}

func pilotInstructionRenderedRow(requestToken, runID string, turn int, slug, nonce, hash string) map[string]interface{} {
	row := instructionRenderedRow(turn, slug, nonce, hash)
	corr := row["correlation"].(map[string]interface{})
	corr["request_token"] = requestToken
	corr["run_id"] = runID
	return row
}

func pilotAgentAcknowledgedRow(requestToken, runID string, turn int, slug, nonce, hash, receiptHash string) map[string]interface{} {
	row := agentAcknowledgedRow(turn, slug, nonce, hash, receiptHash)
	corr := row["correlation"].(map[string]interface{})
	corr["request_token"] = requestToken
	corr["run_id"] = runID
	return row
}

func pilotActionAttemptedRow(requestToken, runID string, turn int, slug, hash, receiptHash string, refs []string) map[string]interface{} {
	row := actionAttemptedRow(turn, slug, hash, receiptHash, refs)
	corr := row["correlation"].(map[string]interface{})
	corr["request_token"] = requestToken
	corr["run_id"] = runID
	return row
}

func pilotOutcomeVerifiedRow(requestToken, runID string, turn int, slug, receiptHash, artifactRef, artifactHash string) map[string]interface{} {
	row := outcomeVerifiedRow(turn, slug, receiptHash, artifactRef, artifactHash)
	corr := row["correlation"].(map[string]interface{})
	corr["request_token"] = requestToken
	corr["run_id"] = runID
	return row
}
