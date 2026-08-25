// Read-only adherence chain reconciliation for agent-adherence-event.v1 JSONL.
// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
// How: RECONCILE_ADHERENCE_CHAIN compares six event classes and emits deterministic finding codes.
package checklist

import (
	"bufio"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"gopkg.in/yaml.v3"
)

const (
	findingRenderedWithoutAck           = "rendered_without_acknowledgment"
	findingAcknowledgedWithoutAttempt   = "acknowledged_without_attempt"
	findingAttemptWithoutVerified       = "attempt_without_verified_outcome"
	findingCompletedWithUnresolved      = "completed_with_unresolved_evidence"
	findingGateWithoutCurrentEvidence   = "gate_without_current_evidence"
	findingStatusChangeWithoutReceipt   = "status_change_without_verification_receipt"
	findingLegacyNoAdherenceChain       = "legacy_no_adherence_chain"
	gateReceiptSchemaVersion            = "checklist-gate-receipt.v1"
)

// ReconcileFinding is one deterministic reconciliation diagnostic.
type ReconcileFinding struct {
	Code   string                 `json:"code"`
	Detail map[string]interface{} `json:"detail,omitempty"`
}

// ReconcileReport is the read-only output of RECONCILE_ADHERENCE_CHAIN.
type ReconcileReport struct {
	RequestToken string             `json:"request_token,omitempty"`
	Findings     []ReconcileFinding `json:"findings"`
	LedgerRows   int                `json:"ledger_rows"`
	ReadOnly     bool               `json:"read_only"`
}

// TiedIndexSnapshot holds parsed TIED index records for status correlation.
type TiedIndexSnapshot struct {
	Requirements     map[string]interface{}
	Implementation   map[string]interface{}
}

// ReconcileInput configures read-only adherence chain reconciliation.
type ReconcileInput struct {
	LedgerPath  string
	TrackerPath string
	Tracker     map[string]interface{}
	CITDP       map[string]interface{}
	GatesDir    string
	Workspace   string
	TiedIndexes TiedIndexSnapshot
}

// AdherenceEvent is one parsed agent-adherence-event.v1 row.
type AdherenceEvent struct {
	LineNumber int
	Raw        map[string]interface{}
	EventClass string
	Correlation map[string]interface{}
}

// ReconcileAdherenceChain emits deterministic findings without mutating inputs.
func ReconcileAdherenceChain(input ReconcileInput) (ReconcileReport, error) {
	report := ReconcileReport{ReadOnly: true, Findings: []ReconcileFinding{}}

	tracker, err := loadTracker(input)
	if err != nil {
		return report, err
	}
	citdp := input.CITDP
	if citdp == nil {
		citdp = map[string]interface{}{}
	}
	requestToken := trackerRequestToken(tracker)

	ledgerPath := strings.TrimSpace(input.LedgerPath)
	if ledgerPath == "" || !fileExists(ledgerPath) {
		report.Findings = append(report.Findings, ReconcileFinding{
			Code: findingLegacyNoAdherenceChain,
			Detail: map[string]interface{}{
				"ledger_path": ledgerPath,
			},
		})
		return report, nil
	}

	events, loadErrs := LoadAdherenceLedger(ledgerPath)
	for _, loadErr := range loadErrs {
		report.Findings = append(report.Findings, ReconcileFinding{
			Code: "malformed_ledger_row",
			Detail: map[string]interface{}{
				"error": loadErr.Error(),
			},
		})
	}
	report.LedgerRows = len(events)

	report.RequestToken = requestToken
	report.Findings = append(report.Findings, reconcileInstructionAck(events)...)
	report.Findings = append(report.Findings, reconcileAckAttempt(tracker, events)...)
	report.Findings = append(report.Findings, reconcileAttemptOutcome(events)...)
	report.Findings = append(report.Findings, reconcileCompletedEvidence(tracker, input.Workspace)...)
	report.Findings = append(report.Findings, reconcileGateEvidence(input.GatesDir, tracker, citdp, events)...)
	report.Findings = append(report.Findings, reconcileStatusMutations(input.TiedIndexes, events)...)

	return report, nil
}

// LoadAdherenceLedger parses and validates agent-adherence-event.v1 JSONL rows.
func LoadAdherenceLedger(path string) ([]AdherenceEvent, []error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, []error{err}
	}
	defer f.Close()

	var events []AdherenceEvent
	var errs []error
	sc := bufio.NewScanner(f)
	lineNo := 0
	for sc.Scan() {
		lineNo++
		line := strings.TrimSpace(sc.Text())
		if line == "" {
			continue
		}
		var row map[string]interface{}
		if err := json.Unmarshal([]byte(line), &row); err != nil {
			errs = append(errs, fmt.Errorf("line %d: %w", lineNo, err))
			continue
		}
		if err := validateAdherenceRow(row); err != nil {
			errs = append(errs, fmt.Errorf("line %d: %w", lineNo, err))
			continue
		}
		eventClass, _ := row["event_class"].(string)
		corr, _ := row["correlation"].(map[string]interface{})
		events = append(events, AdherenceEvent{
			LineNumber:  lineNo,
			Raw:         row,
			EventClass:  eventClass,
			Correlation: corr,
		})
	}
	if err := sc.Err(); err != nil {
		errs = append(errs, err)
	}
	return events, errs
}

func validateAdherenceRow(row map[string]interface{}) error {
	if sv, _ := row["schema_version"].(string); strings.TrimSpace(sv) != adherenceEventSchemaVersion {
		return fmt.Errorf("invalid schema_version: %#v", row["schema_version"])
	}
	eventClass, ok := row["event_class"].(string)
	if !ok || strings.TrimSpace(eventClass) == "" {
		return fmt.Errorf("missing_correlation_field: event_class")
	}
	corr, ok := row["correlation"].(map[string]interface{})
	if !ok {
		return fmt.Errorf("missing_correlation_field: correlation")
	}
	switch eventClass {
	case "instruction_rendered":
		for _, key := range []string{"request_token", "turn_index", "step_slug", "instruction_hash", "instruction_nonce"} {
			if _, ok := corr[key]; !ok {
				return fmt.Errorf("missing_correlation_field: %s", key)
			}
		}
	case "agent_acknowledged":
		for _, key := range []string{"request_token", "turn_index", "step_slug", "instruction_hash", "instruction_nonce", "receipt_hash"} {
			if _, ok := corr[key]; !ok {
				return fmt.Errorf("missing_correlation_field: %s", key)
			}
		}
	case "action_attempted":
		for _, key := range []string{"request_token", "turn_index", "step_slug", "instruction_hash", "receipt_hash"} {
			if _, ok := corr[key]; !ok {
				return fmt.Errorf("missing_correlation_field: %s", key)
			}
		}
		if refs, ok := row["evidence_refs"].([]interface{}); !ok || len(refs) == 0 {
			return fmt.Errorf("missing_correlation_field: evidence_refs")
		}
	case "outcome_verified":
		for _, key := range []string{"request_token", "turn_index", "step_slug", "receipt_hash"} {
			if _, ok := corr[key]; !ok {
				return fmt.Errorf("missing_correlation_field: %s", key)
			}
		}
		if _, ok := row["artifact_ref"].(string); !ok {
			return fmt.Errorf("missing_correlation_field: artifact_ref")
		}
		if _, ok := row["artifact_hash"].(string); !ok {
			return fmt.Errorf("missing_correlation_field: artifact_hash")
		}
	case "gate_decided":
		for _, key := range []string{"request_token", "phase"} {
			if _, ok := corr[key]; !ok {
				return fmt.Errorf("missing_correlation_field: %s", key)
			}
		}
		if _, ok := row["artifact_ref"].(string); !ok {
			return fmt.Errorf("missing_correlation_field: artifact_ref")
		}
		if _, ok := row["artifact_hash"].(string); !ok {
			return fmt.Errorf("missing_correlation_field: artifact_hash")
		}
	case "status_mutated":
		for _, key := range []string{"request_token"} {
			if _, ok := corr[key]; !ok {
				return fmt.Errorf("missing_correlation_field: %s", key)
			}
		}
		if _, ok := row["gate_receipt_ref"].(string); !ok {
			return fmt.Errorf("missing_correlation_field: gate_receipt_ref")
		}
		if _, ok := row["gate_receipt_hash"].(string); !ok {
			return fmt.Errorf("missing_correlation_field: gate_receipt_hash")
		}
	default:
		return fmt.Errorf("unknown event_class: %s", eventClass)
	}
	return nil
}

func reconcileInstructionAck(events []AdherenceEvent) []ReconcileFinding {
	acks := make(map[string]struct{})
	for _, ev := range events {
		if ev.EventClass != "agent_acknowledged" {
			continue
		}
		acks[turnCorrelationKey(ev.Correlation)] = struct{}{}
	}
	var out []ReconcileFinding
	for _, ev := range events {
		if ev.EventClass != "instruction_rendered" {
			continue
		}
		key := turnCorrelationKey(ev.Correlation)
		if _, ok := acks[key]; ok {
			continue
		}
		out = append(out, ReconcileFinding{
			Code: findingRenderedWithoutAck,
			Detail: map[string]interface{}{
				"turn_index":        ev.Correlation["turn_index"],
				"step_slug":         ev.Correlation["step_slug"],
				"instruction_nonce": ev.Correlation["instruction_nonce"],
				"line":              ev.LineNumber,
			},
		})
	}
	return out
}

func reconcileAckAttempt(tracker map[string]interface{}, events []AdherenceEvent) []ReconcileFinding {
	stepEvidence := trackerStepEvidenceRefs(tracker)
	attempts := indexActionAttempts(events)
	var out []ReconcileFinding
	for _, ev := range events {
		if ev.EventClass != "agent_acknowledged" {
			continue
		}
		slug, _ := ev.Correlation["step_slug"].(string)
		refs := stepEvidence[slug]
		if len(refs) == 0 {
			continue
		}
		key := attemptCorrelationKey(ev.Correlation)
		covered := attempts[key]
		for _, ref := range refs {
			if !covered[ref] {
				out = append(out, ReconcileFinding{
					Code: findingAcknowledgedWithoutAttempt,
					Detail: map[string]interface{}{
						"turn_index":   ev.Correlation["turn_index"],
						"step_slug":    slug,
						"evidence_ref": ref,
						"line":         ev.LineNumber,
					},
				})
			}
		}
	}
	return out
}

func reconcileAttemptOutcome(events []AdherenceEvent) []ReconcileFinding {
	verified := indexOutcomeVerified(events)
	var out []ReconcileFinding
	for _, ev := range events {
		if ev.EventClass != "action_attempted" {
			continue
		}
		key := attemptCorrelationKey(ev.Correlation)
		refs, _ := ev.Raw["evidence_refs"].([]interface{})
		for _, item := range refs {
			ref, _ := item.(string)
			ref = strings.TrimSpace(ref)
			if ref == "" {
				continue
			}
			if verified[key][ref] {
				continue
			}
			out = append(out, ReconcileFinding{
				Code: findingAttemptWithoutVerified,
				Detail: map[string]interface{}{
					"turn_index":   ev.Correlation["turn_index"],
					"step_slug":    ev.Correlation["step_slug"],
					"evidence_ref": ref,
					"line":         ev.LineNumber,
				},
			})
		}
	}
	return out
}

func reconcileCompletedEvidence(tracker map[string]interface{}, workspace string) []ReconcileFinding {
	if strings.TrimSpace(workspace) == "" {
		return nil
	}
	var out []ReconcileFinding
	for _, step := range trackerStepsFromMap(tracker) {
		disposition, _ := step["disposition"].(string)
		if strings.TrimSpace(disposition) != "completed" {
			continue
		}
		slug, _ := step["slug"].(string)
		refs := stringListField(step, "evidence_refs")
		if len(refs) == 0 {
			continue
		}
		receipt := CompletionReceipt{
			Slug:         slug,
			Disposition:  "completed",
			EvidenceRefs: refs,
		}
		if _, err := ResolveEvidenceRefs(receipt, workspace); err != nil {
			out = append(out, ReconcileFinding{
				Code: findingCompletedWithUnresolved,
				Detail: map[string]interface{}{
					"step_slug": slug,
					"error":     err.Error(),
				},
			})
		}
	}
	return out
}

func reconcileGateEvidence(gatesDir string, tracker, citdp map[string]interface{}, events []AdherenceEvent) []ReconcileFinding {
	if strings.TrimSpace(gatesDir) == "" {
		return nil
	}
	currentTrackerHash := "sha256:" + StableHash(tracker)
	currentCitdpHash := "sha256:" + StableHash(citdp)
	var out []ReconcileFinding

	entries, err := os.ReadDir(gatesDir)
	if err != nil {
		return nil
	}
	receiptByPath := map[string]map[string]interface{}{}
	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".json") {
			continue
		}
		path := filepath.Join(gatesDir, entry.Name())
		data, err := os.ReadFile(path)
		if err != nil {
			continue
		}
		var receipt map[string]interface{}
		if err := json.Unmarshal(data, &receipt); err != nil {
			continue
		}
		if sv, _ := receipt["schema_version"].(string); sv != gateReceiptSchemaVersion {
			continue
		}
		receiptByPath[path] = receipt
		inputHashes, _ := receipt["input_hashes"].(map[string]interface{})
		trackerHash, _ := inputHashes["tracker_hash"].(string)
		citdpHash, _ := inputHashes["citdp_hash"].(string)
		if trackerHash != currentTrackerHash || citdpHash != currentCitdpHash {
			out = append(out, ReconcileFinding{
				Code: findingGateWithoutCurrentEvidence,
				Detail: map[string]interface{}{
					"gate_receipt":        path,
					"stored_tracker_hash": trackerHash,
					"current_tracker_hash": currentTrackerHash,
					"stored_citdp_hash":   citdpHash,
					"current_citdp_hash":  currentCitdpHash,
				},
			})
		}
	}

	for _, ev := range events {
		if ev.EventClass != "gate_decided" {
			continue
		}
		artifactRef, _ := ev.Raw["artifact_ref"].(string)
		artifactHash, _ := ev.Raw["artifact_hash"].(string)
		if artifactRef == "" {
			continue
		}
		data, err := os.ReadFile(artifactRef)
		if err != nil {
			out = append(out, ReconcileFinding{
				Code: findingGateWithoutCurrentEvidence,
				Detail: map[string]interface{}{
					"gate_decided_line": ev.LineNumber,
					"artifact_ref":      artifactRef,
					"error":             "missing_gate_receipt_file",
				},
			})
			continue
		}
		computed := fileContentHash(data)
		if artifactHash != "" && artifactHash != computed {
			out = append(out, ReconcileFinding{
				Code: findingGateWithoutCurrentEvidence,
				Detail: map[string]interface{}{
					"gate_decided_line": ev.LineNumber,
					"artifact_ref":      artifactRef,
					"stored_hash":         artifactHash,
					"computed_hash":       computed,
				},
			})
		}
		_ = receiptByPath
	}
	return out
}

func reconcileStatusMutations(indexes TiedIndexSnapshot, events []AdherenceEvent) []ReconcileFinding {
	mutated := map[string]map[string]interface{}{}
	for _, ev := range events {
		if ev.EventClass != "status_mutated" {
			continue
		}
		gateRef, _ := ev.Raw["gate_receipt_ref"].(string)
		gateHash, _ := ev.Raw["gate_receipt_hash"].(string)
		if strings.TrimSpace(gateRef) == "" || strings.TrimSpace(gateHash) == "" {
			continue
		}
		mutations, _ := ev.Raw["status_mutations"].([]interface{})
		for _, item := range mutations {
			row, ok := item.(map[string]interface{})
			if !ok {
				continue
			}
			token, _ := row["token"].(string)
			indexName, _ := row["index"].(string)
			nextStatus, _ := row["next_status"].(string)
			if token == "" {
				continue
			}
			key := indexName + ":" + token
			mutated[key] = map[string]interface{}{
				"next_status":       nextStatus,
				"gate_receipt_ref":  gateRef,
				"gate_receipt_hash": gateHash,
				"line":              ev.LineNumber,
			}
		}
	}

	var out []ReconcileFinding
	checkIndex := func(indexName string, records map[string]interface{}) {
		for token, raw := range records {
			rec, ok := raw.(map[string]interface{})
			if !ok {
				continue
			}
			status, _ := rec["status"].(string)
			status = strings.TrimSpace(status)
			if status == "" || status == "Planned" || status == "Draft" {
				continue
			}
			key := indexName + ":" + token
			m, ok := mutated[key]
			if !ok {
				out = append(out, ReconcileFinding{
					Code: findingStatusChangeWithoutReceipt,
					Detail: map[string]interface{}{
						"index":  indexName,
						"token":  token,
						"status": status,
					},
				})
				continue
			}
			next, _ := m["next_status"].(string)
			if next != "" && next != status {
				out = append(out, ReconcileFinding{
					Code: findingStatusChangeWithoutReceipt,
					Detail: map[string]interface{}{
						"index":              indexName,
						"token":              token,
						"index_status":       status,
						"ledger_next_status": next,
						"ledger_line":        m["line"],
					},
				})
			}
			gateRef, _ := m["gate_receipt_ref"].(string)
			if gateRef != "" {
				if data, err := os.ReadFile(gateRef); err != nil {
					out = append(out, ReconcileFinding{
						Code: findingStatusChangeWithoutReceipt,
						Detail: map[string]interface{}{
							"index":            indexName,
							"token":            token,
							"gate_receipt_ref": gateRef,
							"error":            "missing_gate_receipt_file",
						},
					})
				} else {
					computed := fileContentHash(data)
					storedHash, _ := m["gate_receipt_hash"].(string)
					if storedHash != "" && storedHash != computed {
						out = append(out, ReconcileFinding{
							Code: findingStatusChangeWithoutReceipt,
							Detail: map[string]interface{}{
								"index":            indexName,
								"token":            token,
								"gate_receipt_ref": gateRef,
								"stored_hash":      storedHash,
								"computed_hash":    computed,
							},
						})
					}
				}
			}
		}
	}
	checkIndex("requirements", indexes.Requirements)
	checkIndex("implementation", indexes.Implementation)
	return out
}

func loadTracker(input ReconcileInput) (map[string]interface{}, error) {
	if input.Tracker != nil {
		return input.Tracker, nil
	}
	if strings.TrimSpace(input.TrackerPath) == "" {
		return map[string]interface{}{}, nil
	}
	data, err := os.ReadFile(input.TrackerPath)
	if err != nil {
		return nil, fmt.Errorf("tracker_not_readable: %w", err)
	}
	var doc map[string]interface{}
	if err := yaml.Unmarshal(data, &doc); err != nil {
		return nil, fmt.Errorf("invalid_tracker: %w", err)
	}
	return doc, nil
}

func trackerRequestToken(tracker map[string]interface{}) string {
	if token, ok := tracker["request_token"].(string); ok {
		return strings.TrimSpace(token)
	}
	return ""
}

func turnCorrelationKey(corr map[string]interface{}) string {
	parts := []string{
		fmt.Sprint(corr["turn_index"]),
		strings.TrimSpace(fmt.Sprint(corr["step_slug"])),
		strings.TrimSpace(fmt.Sprint(corr["instruction_nonce"])),
		strings.TrimSpace(fmt.Sprint(corr["instruction_hash"])),
	}
	return strings.Join(parts, "|")
}

func attemptCorrelationKey(corr map[string]interface{}) string {
	parts := []string{
		fmt.Sprint(corr["turn_index"]),
		strings.TrimSpace(fmt.Sprint(corr["step_slug"])),
		strings.TrimSpace(fmt.Sprint(corr["receipt_hash"])),
	}
	return strings.Join(parts, "|")
}

func indexActionAttempts(events []AdherenceEvent) map[string]map[string]bool {
	out := map[string]map[string]bool{}
	for _, ev := range events {
		if ev.EventClass != "action_attempted" {
			continue
		}
		key := attemptCorrelationKey(ev.Correlation)
		if out[key] == nil {
			out[key] = map[string]bool{}
		}
		refs, _ := ev.Raw["evidence_refs"].([]interface{})
		for _, item := range refs {
			ref, _ := item.(string)
			ref = strings.TrimSpace(ref)
			if ref != "" {
				out[key][ref] = true
			}
		}
	}
	return out
}

func indexOutcomeVerified(events []AdherenceEvent) map[string]map[string]bool {
	out := map[string]map[string]bool{}
	for _, ev := range events {
		if ev.EventClass != "outcome_verified" {
			continue
		}
		key := attemptCorrelationKey(ev.Correlation)
		if out[key] == nil {
			out[key] = map[string]bool{}
		}
		artifactRef, _ := ev.Raw["artifact_ref"].(string)
		artifactRef = strings.TrimSpace(artifactRef)
		if artifactRef != "" {
			out[key][artifactRef] = true
		}
	}
	return out
}

func trackerStepEvidenceRefs(tracker map[string]interface{}) map[string][]string {
	out := map[string][]string{}
	for _, step := range trackerStepsFromMap(tracker) {
		slug, _ := step["slug"].(string)
		if slug == "" {
			continue
		}
		out[slug] = stringListField(step, "evidence_refs")
	}
	return out
}

func trackerStepsFromMap(tracker map[string]interface{}) []map[string]interface{} {
	stepsRaw, ok := tracker["steps"].([]interface{})
	if !ok {
		return nil
	}
	var out []map[string]interface{}
	for _, item := range stepsRaw {
		step, ok := item.(map[string]interface{})
		if !ok {
			continue
		}
		out = append(out, step)
	}
	return out
}

func stringListField(step map[string]interface{}, key string) []string {
	raw, ok := step[key].([]interface{})
	if !ok {
		return nil
	}
	var out []string
	for _, item := range raw {
		s, _ := item.(string)
		s = strings.TrimSpace(s)
		if s != "" {
			out = append(out, s)
		}
	}
	return out
}

func fileExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

// StableHash returns deterministic sha256 hex digest matching MCP stableHash semantics.
func StableHash(value interface{}) string {
	stable := stableValue(value)
	body, _ := json.Marshal(stable)
	sum := sha256.Sum256(body)
	return hex.EncodeToString(sum[:])
}

func stableValue(value interface{}) interface{} {
	switch v := value.(type) {
	case []interface{}:
		out := make([]interface{}, len(v))
		for i, item := range v {
			out[i] = stableValue(item)
		}
		return out
	case map[string]interface{}:
		keys := make([]string, 0, len(v))
		for key := range v {
			keys = append(keys, key)
		}
		sortStrings(keys)
		out := make(map[string]interface{}, len(v))
		for _, key := range keys {
			out[key] = stableValue(v[key])
		}
		return out
	case map[interface{}]interface{}:
		normalized := make(map[string]interface{}, len(v))
		for key, item := range v {
			normalized[fmt.Sprint(key)] = item
		}
		return stableValue(normalized)
	default:
		return v
	}
}

func sortStrings(values []string) {
	for i := 0; i < len(values); i++ {
		for j := i + 1; j < len(values); j++ {
			if values[j] < values[i] {
				values[i], values[j] = values[j], values[i]
			}
		}
	}
}
