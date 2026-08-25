package checklist

import (
	"bufio"
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: adherence ledger schema and append-only contract.
func TestAdherenceLedgerAppendInstructionRendered_schema(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "events.jsonl")
	fields := InstructionCorrelation{
		RequestToken:     "REQ-TEST",
		RunID:            "run-1",
		TurnIndex:        2,
		StepSlug:         "change-definition",
		InstructionHash:  "sha256:abc123",
		InstructionNonce: "nonce-1",
		SourceRevision:   "deadbeef",
	}
	if err := AppendInstructionRendered(path, fields); err != nil {
		t.Fatal(err)
	}
	row, err := readLastLedgerRow(path)
	if err != nil {
		t.Fatal(err)
	}
	if row["schema_version"] != adherenceEventSchemaVersion {
		t.Fatalf("schema_version: %#v", row["schema_version"])
	}
	if row["event_class"] != "instruction_rendered" {
		t.Fatalf("event_class: %#v", row["event_class"])
	}
	corr, ok := row["correlation"].(map[string]interface{})
	if !ok {
		t.Fatalf("missing correlation: %#v", row)
	}
	for _, key := range []string{"request_token", "run_id", "turn_index", "step_slug", "instruction_hash", "instruction_nonce"} {
		if _, ok := corr[key]; !ok {
			t.Fatalf("missing correlation.%s in %#v", key, corr)
		}
	}
	if corr["request_token"] != "REQ-TEST" || corr["instruction_nonce"] != "nonce-1" {
		t.Fatalf("unexpected correlation: %#v", corr)
	}
	body, _ := json.Marshal(row)
	if strings.Contains(string(body), "prompt") || strings.Contains(string(body), "response") {
		t.Fatalf("ledger must not store prompt/response bodies: %s", body)
	}
}

func TestAdherenceLedgerAppendOutcomeVerified_schema(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "events.jsonl")
	fields := InstructionCorrelation{
		RequestToken:     "REQ-TEST",
		RunID:            "run-1",
		TurnIndex:        2,
		StepSlug:         "change-definition",
		InstructionHash:  "sha256:abc123",
		InstructionNonce: "nonce-1",
	}
	resolved := ResolvedRef{
		Ref:          "working/REQ-TEST/evidence.md",
		Kind:         "file_path",
		ArtifactRef:  "working/REQ-TEST/evidence.md",
		ArtifactHash: "sha256:deadbeef",
	}
	if err := AppendOutcomeVerified(path, fields, resolved, "receipt-hash-1"); err != nil {
		t.Fatal(err)
	}
	row, err := readLastLedgerRow(path)
	if err != nil {
		t.Fatal(err)
	}
	if row["event_class"] != "outcome_verified" {
		t.Fatalf("event_class: %#v", row)
	}
	if row["artifact_ref"] != resolved.ArtifactRef || row["artifact_hash"] != resolved.ArtifactHash {
		t.Fatalf("artifact fields: %#v", row)
	}
	if row["ref_kind"] != "file_path" {
		t.Fatalf("ref_kind: %#v", row["ref_kind"])
	}
	corr, ok := row["correlation"].(map[string]interface{})
	if !ok {
		t.Fatalf("missing correlation: %#v", row)
	}
	if corr["receipt_hash"] != "receipt-hash-1" {
		t.Fatalf("receipt_hash: %#v", corr["receipt_hash"])
	}
}

func TestAdherenceLedgerAppendOnly(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "events.jsonl")
	fields := InstructionCorrelation{
		RequestToken:     "REQ-TEST",
		RunID:            "run-1",
		TurnIndex:        1,
		StepSlug:         "alpha",
		InstructionHash:  "sha256:one",
		InstructionNonce: "nonce-a",
	}
	if err := AppendInstructionRendered(path, fields); err != nil {
		t.Fatal(err)
	}
	if err := AppendAgentAcknowledged(path, fields, "receipt-hash-1", "session-hash-1"); err != nil {
		t.Fatal(err)
	}
	lines, err := readLedgerLines(path)
	if err != nil {
		t.Fatal(err)
	}
	if len(lines) != 2 {
		t.Fatalf("expected 2 rows, got %d", len(lines))
	}
	if lines[1]["event_class"] != "agent_acknowledged" {
		t.Fatalf("second event: %#v", lines[1])
	}
}

func readLastLedgerRow(path string) (map[string]interface{}, error) {
	lines, err := readLedgerLines(path)
	if err != nil {
		return nil, err
	}
	if len(lines) == 0 {
		return nil, os.ErrNotExist
	}
	return lines[len(lines)-1], nil
}

func readLedgerLines(path string) ([]map[string]interface{}, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	var out []map[string]interface{}
	sc := bufio.NewScanner(f)
	for sc.Scan() {
		line := strings.TrimSpace(sc.Text())
		if line == "" {
			continue
		}
		var row map[string]interface{}
		if err := json.Unmarshal([]byte(line), &row); err != nil {
			return nil, err
		}
		out = append(out, row)
	}
	return out, sc.Err()
}
