// Atomic Authoritative Tracker writer and loop-back invalidation.
// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
// How: APPLY_TRACKER_DISPOSITION and INVALIDATE_TRACKER_DOWNSTREAM mutate Tracker state atomically.
package checklist

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"gopkg.in/yaml.v3"
)

// TurnIdentity binds a receipt to one checklist turn for replay protection.
type TurnIdentity struct {
	TurnIndex int
	StepStub  string
	SessionID string
}

func (id TurnIdentity) String() string {
	return fmt.Sprintf("turn=%d:stub=%s:session=%s", id.TurnIndex, strings.TrimSpace(id.StepStub), strings.TrimSpace(id.SessionID))
}

// ApplyTrackerDisposition merges one validated receipt into exactly one Tracker step.
func ApplyTrackerDisposition(trackerPath string, receipt CompletionReceipt, identity TurnIdentity) error {
	tracker, err := LoadTrackerYAML(trackerPath)
	if err != nil {
		return fmt.Errorf("tracker_not_found: %w", err)
	}
	hash := ReceiptHash(receipt)
	if replay, ok := findStateHistoryReplay(tracker, identity.String(), hash); ok {
		if replay {
			return nil
		}
		return fmt.Errorf("conflicting_replay")
	}
	stepsRaw, ok := tracker["steps"].([]interface{})
	if !ok {
		return fmt.Errorf("malformed_tracker: missing steps")
	}
	updated := false
	for i, item := range stepsRaw {
		row, ok := item.(map[string]interface{})
		if !ok {
			continue
		}
		slug, _ := row["slug"].(string)
		if strings.TrimSpace(slug) != strings.TrimSpace(receipt.Slug) {
			continue
		}
		applyReceiptToRow(row, receipt)
		stepsRaw[i] = row
		updated = true
		break
	}
	if !updated {
		return fmt.Errorf("step_not_found: %q", receipt.Slug)
	}
	tracker["steps"] = stepsRaw
	if ee, ok := tracker["execution_evidence"].(map[string]interface{}); ok {
		ee["completed"] = deriveCompletedSlugs(stepsRaw)
	} else {
		tracker["execution_evidence"] = map[string]interface{}{
			"completed": deriveCompletedSlugs(stepsRaw),
		}
	}
	appendStateHistory(tracker, identity.String(), hash)
	return atomicWriteYAML(trackerPath, tracker)
}

func applyReceiptToRow(row map[string]interface{}, receipt CompletionReceipt) {
	clearStepEvidence(row)
	row["disposition"] = receipt.Disposition
	row["updated_at"] = time.Now().UTC().Format(time.RFC3339)
	switch receipt.Disposition {
	case "completed":
		row["evidence_refs"] = stringListToInterface(receipt.EvidenceRefs)
	case "not_applicable":
		row["policy"] = receipt.Policy
		row["rationale"] = receipt.Rationale
	case "waived":
		row["owner"] = receipt.Owner
		row["expiry"] = receipt.Expiry
		row["approval"] = receipt.Approval
		row["residual_risk"] = receipt.ResidualRisk
	}
}

func clearStepEvidence(row map[string]interface{}) {
	for _, key := range []string{
		"evidence_refs", "policy", "rationale", "owner", "expiry", "approval", "residual_risk",
		"gate_receipt", "gate_summary",
	} {
		delete(row, key)
	}
}

func deriveCompletedSlugs(steps []interface{}) []interface{} {
	out := make([]interface{}, 0)
	for _, item := range steps {
		row, ok := item.(map[string]interface{})
		if !ok {
			continue
		}
		disp, _ := row["disposition"].(string)
		if disp != "completed" {
			continue
		}
		slug, _ := row["slug"].(string)
		slug = strings.TrimSpace(slug)
		if slug != "" {
			out = append(out, slug)
		}
	}
	return out
}

func appendStateHistory(tracker map[string]interface{}, turnIdentity, receiptHash string) {
	entry := map[string]interface{}{
		"turn_identity": turnIdentity,
		"receipt_hash":  receiptHash,
		"updated_at":    time.Now().UTC().Format(time.RFC3339),
	}
	history, _ := tracker["state_history"].([]interface{})
	history = append(history, entry)
	tracker["state_history"] = history
}

func findStateHistoryReplay(tracker map[string]interface{}, turnIdentity, receiptHash string) (idempotent bool, found bool) {
	history, _ := tracker["state_history"].([]interface{})
	for _, item := range history {
		row, ok := item.(map[string]interface{})
		if !ok {
			continue
		}
		id, _ := row["turn_identity"].(string)
		if id != turnIdentity {
			continue
		}
		hash, _ := row["receipt_hash"].(string)
		return hash == receiptHash, true
	}
	return false, false
}

// InvalidateTrackerDownstream resets configured clear_slugs after a validated goto.
func InvalidateTrackerDownstream(trackerPath, definitionPath, gotoTarget string) ([]string, error) {
	data, err := os.ReadFile(definitionPath)
	if err != nil {
		return nil, err
	}
	var doc yamlDoc
	if err := yaml.Unmarshal(data, &doc); err != nil {
		return nil, err
	}
	lb, ok := doc.LoopBack[strings.TrimSpace(gotoTarget)]
	if !ok || len(lb.ClearSlugs) == 0 {
		return nil, fmt.Errorf("missing_clear_target: %q", gotoTarget)
	}
	tracker, err := LoadTrackerYAML(trackerPath)
	if err != nil {
		return nil, err
	}
	stepsRaw, ok := tracker["steps"].([]interface{})
	if !ok {
		return nil, fmt.Errorf("malformed_tracker: missing steps")
	}
	indexBySlug := map[string]int{}
	for i, item := range stepsRaw {
		row, ok := item.(map[string]interface{})
		if !ok {
			continue
		}
		slug, _ := row["slug"].(string)
		slug = strings.TrimSpace(slug)
		if slug != "" {
			indexBySlug[slug] = i
		}
	}
	for _, slug := range lb.ClearSlugs {
		slug = strings.TrimSpace(slug)
		idx, ok := indexBySlug[slug]
		if !ok {
			return nil, fmt.Errorf("missing_state_row: %q", slug)
		}
		row, ok := stepsRaw[idx].(map[string]interface{})
		if !ok {
			return nil, fmt.Errorf("missing_state_row: %q", slug)
		}
		clearStepEvidence(row)
		row["disposition"] = "pending"
		delete(row, "updated_at")
		stepsRaw[idx] = row
	}
	tracker["steps"] = stepsRaw
	if ee, ok := tracker["execution_evidence"].(map[string]interface{}); ok {
		ee["completed"] = deriveCompletedSlugs(stepsRaw)
		clearCloseOutGateSummaries(ee, lb.ClearSlugs)
	}
	return append([]string(nil), lb.ClearSlugs...), atomicWriteYAML(trackerPath, tracker)
}

func clearCloseOutGateSummaries(ee map[string]interface{}, slugs []string) {
	closeOut, ok := ee["close_out_evidence"].(map[string]interface{})
	if !ok {
		return
	}
	gates, ok := closeOut["gates"].(map[string]interface{})
	if !ok {
		return
	}
	for _, slug := range slugs {
		delete(gates, slug)
	}
}

func stringListToInterface(items []string) []interface{} {
	out := make([]interface{}, 0, len(items))
	for _, item := range items {
		out = append(out, item)
	}
	return out
}

// atomicWriteYAML writes YAML via same-directory temp file and rename.
func atomicWriteYAML(path string, doc interface{}) error {
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return fmt.Errorf("write_failure: %w", err)
	}
	body, err := yaml.Marshal(doc)
	if err != nil {
		return fmt.Errorf("write_failure: %w", err)
	}
	tmp, err := os.CreateTemp(dir, ".tracker-*.yaml.tmp")
	if err != nil {
		return fmt.Errorf("write_failure: %w", err)
	}
	tmpPath := tmp.Name()
	defer func() {
		_ = os.Remove(tmpPath)
	}()
	if _, err := tmp.Write(body); err != nil {
		_ = tmp.Close()
		return fmt.Errorf("write_failure: %w", err)
	}
	if err := tmp.Sync(); err != nil {
		_ = tmp.Close()
		return fmt.Errorf("write_failure: %w", err)
	}
	if err := tmp.Close(); err != nil {
		return fmt.Errorf("write_failure: %w", err)
	}
	if err := os.Rename(tmpPath, path); err != nil {
		return fmt.Errorf("write_failure: %w", err)
	}
	return nil
}

// DerivedCompletedFromTracker returns execution_evidence.completed from step dispositions only.
func DerivedCompletedFromTracker(tracker map[string]interface{}) []string {
	stepsRaw, ok := tracker["steps"].([]interface{})
	if !ok {
		return nil
	}
	out := make([]string, 0)
	for _, item := range deriveCompletedSlugs(stepsRaw) {
		if s, ok := item.(string); ok {
			out = append(out, s)
		}
	}
	return out
}

// ExecutionEvidenceCompletedOverride ignored when steps carry authoritative dispositions.
func ExecutionEvidenceCompletedOverride(tracker map[string]interface{}, override []string) bool {
	derived := DerivedCompletedFromTracker(tracker)
	if len(override) == 0 {
		return false
	}
	if len(derived) != len(override) {
		return true
	}
	seen := map[string]struct{}{}
	for _, slug := range derived {
		seen[slug] = struct{}{}
	}
	for _, slug := range override {
		if _, ok := seen[slug]; !ok {
			return true
		}
	}
	return false
}
