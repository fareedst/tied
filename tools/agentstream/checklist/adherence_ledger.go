// Adherence ledger writer for agent-adherence-event.v1 JSONL rows.
// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
// How: RENDER_INSTRUCTION_EVIDENCE and agent_acknowledged append hash/reference edges only.
package checklist

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

const adherenceEventSchemaVersion = "agent-adherence-event.v1"

// InstructionCorrelation binds one rendered checklist turn instruction.
type InstructionCorrelation struct {
	RequestToken     string
	RunID            string
	TurnIndex        int
	StepSlug         string
	InstructionHash  string
	InstructionNonce string
	SourceRevision   string
}

// HashRenderedInstructionParts returns a stable sha256 hash for rendered turn parts.
func HashRenderedInstructionParts(parts []string) string {
	rendered := strings.Join(parts, "\n")
	sum := sha256.Sum256([]byte(rendered))
	return "sha256:" + hex.EncodeToString(sum[:])
}

// HashSessionID returns a stable hash for session correlation without storing raw IDs in the ledger.
func HashSessionID(sessionID string) string {
	sum := sha256.Sum256([]byte(strings.TrimSpace(sessionID)))
	return "sha256:" + hex.EncodeToString(sum[:])
}

// AppendInstructionRendered appends an instruction_rendered ledger row before subprocess execution.
func AppendInstructionRendered(ledgerPath string, fields InstructionCorrelation) error {
	row := map[string]interface{}{
		"schema_version": adherenceEventSchemaVersion,
		"event_class":    "instruction_rendered",
		"correlation": map[string]interface{}{
			"request_token":     strings.TrimSpace(fields.RequestToken),
			"run_id":            strings.TrimSpace(fields.RunID),
			"turn_index":        fields.TurnIndex,
			"step_slug":         strings.TrimSpace(fields.StepSlug),
			"instruction_hash":  strings.TrimSpace(fields.InstructionHash),
			"instruction_nonce": strings.TrimSpace(fields.InstructionNonce),
			"source_revision":   strings.TrimSpace(fields.SourceRevision),
		},
		"source": map[string]interface{}{
			"kind": "agentstream",
			"path": ledgerPath,
		},
	}
	return appendLedgerRow(ledgerPath, row)
}

// AppendAgentAcknowledged appends agent_acknowledged after valid receipt binding.
func AppendAgentAcknowledged(ledgerPath string, fields InstructionCorrelation, receiptHash, sessionIDHash string) error {
	row := map[string]interface{}{
		"schema_version": adherenceEventSchemaVersion,
		"event_class":    "agent_acknowledged",
		"correlation": map[string]interface{}{
			"request_token":     strings.TrimSpace(fields.RequestToken),
			"run_id":            strings.TrimSpace(fields.RunID),
			"turn_index":        fields.TurnIndex,
			"step_slug":         strings.TrimSpace(fields.StepSlug),
			"instruction_hash":  strings.TrimSpace(fields.InstructionHash),
			"instruction_nonce": strings.TrimSpace(fields.InstructionNonce),
			"receipt_hash":      strings.TrimSpace(receiptHash),
			"session_id_hash":   strings.TrimSpace(sessionIDHash),
		},
		"source": map[string]interface{}{
			"kind": "agentstream",
			"path": ledgerPath,
		},
	}
	return appendLedgerRow(ledgerPath, row)
}

// AppendOutcomeVerified appends outcome_verified after evidence ref resolution.
func AppendOutcomeVerified(ledgerPath string, fields InstructionCorrelation, resolved ResolvedRef, receiptHash string) error {
	row := map[string]interface{}{
		"schema_version": adherenceEventSchemaVersion,
		"event_class":    "outcome_verified",
		"correlation": map[string]interface{}{
			"request_token":     strings.TrimSpace(fields.RequestToken),
			"run_id":            strings.TrimSpace(fields.RunID),
			"turn_index":        fields.TurnIndex,
			"step_slug":         strings.TrimSpace(fields.StepSlug),
			"instruction_hash":  strings.TrimSpace(fields.InstructionHash),
			"instruction_nonce": strings.TrimSpace(fields.InstructionNonce),
			"receipt_hash":      strings.TrimSpace(receiptHash),
		},
		"artifact_ref":  strings.TrimSpace(resolved.ArtifactRef),
		"artifact_hash": strings.TrimSpace(resolved.ArtifactHash),
		"ref_kind":      strings.TrimSpace(resolved.Kind),
		"source": map[string]interface{}{
			"kind": "agentstream",
			"path": ledgerPath,
		},
	}
	return appendLedgerRow(ledgerPath, row)
}

func appendLedgerRow(ledgerPath string, row map[string]interface{}) error {
	if strings.TrimSpace(ledgerPath) == "" {
		return fmt.Errorf("ledger_path_required")
	}
	if err := os.MkdirAll(filepath.Dir(ledgerPath), 0o755); err != nil {
		return fmt.Errorf("ledger_write_failure: %w", err)
	}
	body, err := json.Marshal(row)
	if err != nil {
		return fmt.Errorf("ledger_write_failure: %w", err)
	}
	f, err := os.OpenFile(ledgerPath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0o644)
	if err != nil {
		return fmt.Errorf("ledger_write_failure: %w", err)
	}
	defer f.Close()
	if _, err := f.Write(append(body, '\n')); err != nil {
		return fmt.Errorf("ledger_write_failure: %w", err)
	}
	return nil
}
