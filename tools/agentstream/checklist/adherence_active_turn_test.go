package checklist

import (
	"os"
	"path/filepath"
	"testing"
)

func TestWriteActiveTurnMarker_createsSchemaFile(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "active-turn.json")
	marker := ActiveTurnMarker{
		RequestToken:        "REQ-TEST",
		RunID:               "run-1",
		TurnIndex:           2,
		StepSlug:            "unit-test-red",
		InstructionNonce:    "run-1:2:abc",
		InstructionHash:     "sha256:abc",
		AdherenceLedgerPath: filepath.Join(dir, "events.jsonl"),
		SourceRevision:      "deadbeef",
	}
	if err := WriteActiveTurnMarker(path, marker); err != nil {
		t.Fatal(err)
	}
	got, err := ReadActiveTurnMarker(path)
	if err != nil {
		t.Fatal(err)
	}
	if got.SchemaVersion != activeTurnMarkerSchemaVersion {
		t.Fatalf("schema_version: %#v", got.SchemaVersion)
	}
	if got.RequestToken != "REQ-TEST" || got.StepSlug != "unit-test-red" {
		t.Fatalf("unexpected marker: %#v", got)
	}
}

func TestWriteActiveTurnMarker_rejectsMissingBinding(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "active-turn.json")
	err := WriteActiveTurnMarker(path, ActiveTurnMarker{
		RequestToken:        "REQ-TEST",
		AdherenceLedgerPath: filepath.Join(dir, "events.jsonl"),
	})
	if err == nil {
		t.Fatal("expected error for missing instruction binding")
	}
}

func TestClearActiveTurnMarker_removesFile(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "active-turn.json")
	if err := WriteActiveTurnMarker(path, ActiveTurnMarker{
		RequestToken:        "REQ-TEST",
		InstructionNonce:    "nonce",
		InstructionHash:     "sha256:abc",
		AdherenceLedgerPath: filepath.Join(dir, "events.jsonl"),
	}); err != nil {
		t.Fatal(err)
	}
	if err := ClearActiveTurnMarker(path); err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(path); !os.IsNotExist(err) {
		t.Fatalf("expected marker removed, stat err=%v", err)
	}
}

func TestClearActiveTurnMarker_missingIsSuccess(t *testing.T) {
	if err := ClearActiveTurnMarker(filepath.Join(t.TempDir(), "missing.json")); err != nil {
		t.Fatal(err)
	}
}

func TestActiveTurnMarkerPath_underWorkingAdherence(t *testing.T) {
	got := ActiveTurnMarkerPath("/repo", "REQ-TOKEN")
	want := filepath.Join("/repo", "working", "REQ-TOKEN", "adherence", "active-turn.json")
	if got != want {
		t.Fatalf("path = %q, want %q", got, want)
	}
}
