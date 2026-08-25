// Active-turn marker lifecycle for hook-correlated action_attempted capture.
// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
// How: ACTIVE_TURN_MARKER writes short-lived JSON before subprocess; hooks read for ledger correlation.
package checklist

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"
)

const activeTurnMarkerSchemaVersion = "active-turn-marker.v1"

// ActiveTurnMarker is the hook-readable correlation file for the current checklist turn.
type ActiveTurnMarker struct {
	SchemaVersion       string `json:"schema_version"`
	RequestToken        string `json:"request_token"`
	RunID               string `json:"run_id"`
	TurnIndex           int    `json:"turn_index"`
	StepSlug            string `json:"step_slug"`
	InstructionNonce    string `json:"instruction_nonce"`
	InstructionHash     string `json:"instruction_hash"`
	AdherenceLedgerPath string `json:"adherence_ledger_path"`
	SourceRevision      string `json:"source_revision"`
	WrittenAt           string `json:"written_at"`
	WorkspaceRoot       string `json:"workspace_root,omitempty"`
}

// ActiveTurnMarkerPath returns working/{REQ-TOKEN}/adherence/active-turn.json under workspace.
func ActiveTurnMarkerPath(workspace, requestToken string) string {
	token := strings.TrimSpace(requestToken)
	return filepath.Join(strings.TrimSpace(workspace), "working", token, "adherence", "active-turn.json")
}

// WriteActiveTurnMarker persists the active-turn marker atomically.
func WriteActiveTurnMarker(path string, marker ActiveTurnMarker) error {
	if strings.TrimSpace(path) == "" {
		return fmt.Errorf("active_turn_marker_path_required")
	}
	marker.SchemaVersion = activeTurnMarkerSchemaVersion
	if strings.TrimSpace(marker.RequestToken) == "" {
		return fmt.Errorf("active_turn_marker_request_token_required")
	}
	if strings.TrimSpace(marker.AdherenceLedgerPath) == "" {
		return fmt.Errorf("active_turn_marker_ledger_path_required")
	}
	if strings.TrimSpace(marker.InstructionNonce) == "" || strings.TrimSpace(marker.InstructionHash) == "" {
		return fmt.Errorf("active_turn_marker_instruction_binding_required")
	}
	if strings.TrimSpace(marker.WrittenAt) == "" {
		marker.WrittenAt = time.Now().UTC().Format(time.RFC3339)
	}
	body, err := json.Marshal(marker)
	if err != nil {
		return fmt.Errorf("active_turn_marker_write_failure: %w", err)
	}
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return fmt.Errorf("active_turn_marker_write_failure: %w", err)
	}
	tmp := path + ".tmp"
	if err := os.WriteFile(tmp, append(body, '\n'), 0o644); err != nil {
		return fmt.Errorf("active_turn_marker_write_failure: %w", err)
	}
	if err := os.Rename(tmp, path); err != nil {
		_ = os.Remove(tmp)
		return fmt.Errorf("active_turn_marker_write_failure: %w", err)
	}
	return nil
}

// ReadActiveTurnMarker loads an active-turn marker when present.
func ReadActiveTurnMarker(path string) (ActiveTurnMarker, error) {
	var marker ActiveTurnMarker
	data, err := os.ReadFile(path)
	if err != nil {
		return marker, err
	}
	if err := json.Unmarshal(data, &marker); err != nil {
		return marker, fmt.Errorf("active_turn_marker_parse_failure: %w", err)
	}
	if marker.SchemaVersion != activeTurnMarkerSchemaVersion {
		return marker, fmt.Errorf("active_turn_marker_schema_mismatch")
	}
	return marker, nil
}

// ClearActiveTurnMarker removes the marker file; missing file is success.
func ClearActiveTurnMarker(path string) error {
	if strings.TrimSpace(path) == "" {
		return nil
	}
	err := os.Remove(path)
	if err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("active_turn_marker_clear_failure: %w", err)
	}
	return nil
}
