// Tracker completion receipt parsing for agentstream checklist turns.
// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
// How: PARSE_TRACKER_COMPLETION_RECEIPT scans fenced JSON for strict agentstream_tracker envelope.
package checklist

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"strings"
)

const trackerReceiptSchemaVersion = 1

// CompletionReceipt is the strict agentstream_tracker completion envelope.
type CompletionReceipt struct {
	SchemaVersion int      `json:"schema_version"`
	Slug          string   `json:"slug"`
	Disposition   string   `json:"disposition"`
	EvidenceRefs  []string `json:"evidence_refs,omitempty"`
	Policy        string   `json:"policy,omitempty"`
	Rationale     string   `json:"rationale,omitempty"`
	Owner         string   `json:"owner,omitempty"`
	Expiry        string   `json:"expiry,omitempty"`
	Approval      string   `json:"approval,omitempty"`
	ResidualRisk  string   `json:"residual_risk,omitempty"`
}

type trackerEnvelope struct {
	Receipt CompletionReceipt `json:"agentstream_tracker"`
}

var allowedReceiptFields = map[string]struct{}{
	"schema_version": {},
	"slug":           {},
	"disposition":    {},
	"evidence_refs":  {},
	"policy":         {},
	"rationale":      {},
	"owner":          {},
	"expiry":         {},
	"approval":       {},
	"residual_risk":  {},
}

var allowedDispositions = map[string]struct{}{
	"completed":      {},
	"not_applicable": {},
	"waived":         {},
}

// ParseTrackerCompletionReceipt scans transcript for the latest valid agentstream_tracker block.
func ParseTrackerCompletionReceipt(transcript, expectedSlug string) (CompletionReceipt, bool, error) {
	blocks := fencedJSONBlocks(transcript)
	for i := len(blocks) - 1; i >= 0; i-- {
		var raw map[string]json.RawMessage
		if err := json.Unmarshal([]byte(blocks[i]), &raw); err != nil {
			if strings.Contains(blocks[i], "agentstream_tracker") {
				return CompletionReceipt{}, false, fmt.Errorf("malformed_receipt: %w", err)
			}
			continue
		}
		body, ok := raw["agentstream_tracker"]
		if !ok {
			continue
		}
		if err := rejectUnknownReceiptFields(body); err != nil {
			return CompletionReceipt{}, false, err
		}
		var env trackerEnvelope
		if err := json.Unmarshal(body, &env.Receipt); err != nil {
			return CompletionReceipt{}, false, fmt.Errorf("malformed_receipt: %w", err)
		}
		if err := ValidateCompletionReceipt(env.Receipt, expectedSlug); err != nil {
			return CompletionReceipt{}, false, err
		}
		return env.Receipt, true, nil
	}
	return CompletionReceipt{}, false, fmt.Errorf("missing_receipt")
}

func rejectUnknownReceiptFields(body json.RawMessage) error {
	var obj map[string]json.RawMessage
	if err := json.Unmarshal(body, &obj); err != nil {
		return fmt.Errorf("malformed_receipt: %w", err)
	}
	for key := range obj {
		if _, ok := allowedReceiptFields[key]; !ok {
			return fmt.Errorf("unknown_field: %q", key)
		}
	}
	return nil
}

// ValidateCompletionReceipt checks schema, slug, and disposition evidence contracts.
func ValidateCompletionReceipt(receipt CompletionReceipt, expectedSlug string) error {
	if receipt.SchemaVersion != trackerReceiptSchemaVersion {
		return fmt.Errorf("unsupported_schema: schema_version must be %d", trackerReceiptSchemaVersion)
	}
	slug := strings.TrimSpace(receipt.Slug)
	if slug == "" {
		return fmt.Errorf("malformed_receipt: slug required")
	}
	if slug != strings.TrimSpace(expectedSlug) {
		return fmt.Errorf("wrong_slug: receipt slug %q does not match expected %q", slug, expectedSlug)
	}
	disp := strings.TrimSpace(receipt.Disposition)
	if disp == "skipped" {
		return fmt.Errorf("skipped_disposition_rejected")
	}
	if _, ok := allowedDispositions[disp]; !ok {
		return fmt.Errorf("invalid_disposition: %q", disp)
	}
	switch disp {
	case "completed":
		if !nonEmptyStringList(receipt.EvidenceRefs) {
			return fmt.Errorf("missing_disposition_evidence: completed requires evidence_refs")
		}
	case "not_applicable":
		if strings.TrimSpace(receipt.Policy) == "" || strings.TrimSpace(receipt.Rationale) == "" {
			return fmt.Errorf("missing_disposition_evidence: not_applicable requires policy and rationale")
		}
	case "waived":
		for _, field := range []struct {
			name string
			val  string
		}{
			{"owner", receipt.Owner},
			{"expiry", receipt.Expiry},
			{"approval", receipt.Approval},
			{"residual_risk", receipt.ResidualRisk},
		} {
			if strings.TrimSpace(field.val) == "" {
				return fmt.Errorf("missing_disposition_evidence: waived requires %s", field.name)
			}
		}
	}
	return nil
}

// ReceiptHash returns a stable hash for idempotent replay detection.
func ReceiptHash(receipt CompletionReceipt) string {
	body, _ := json.Marshal(receipt)
	sum := sha256.Sum256(body)
	return hex.EncodeToString(sum[:])
}

func nonEmptyStringList(items []string) bool {
	for _, item := range items {
		if strings.TrimSpace(item) != "" {
			return true
		}
	}
	return false
}

func fencedJSONBlocks(text string) []string {
	lines := strings.Split(text, "\n")
	var blocks []string
	inFence := false
	var current []string
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if !inFence {
			if trimmed == "```json" {
				inFence = true
				current = current[:0]
			}
			continue
		}
		if strings.HasPrefix(trimmed, "```") {
			blocks = append(blocks, strings.Join(current, "\n"))
			inFence = false
			current = nil
			continue
		}
		current = append(current, line)
	}
	return blocks
}
