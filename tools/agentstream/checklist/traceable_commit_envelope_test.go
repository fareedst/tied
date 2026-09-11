package checklist

import (
	"os"
	"path/filepath"
	"testing"
)

// [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] W7-D4 traceable-commit envelope pilot tests.
func TestTraceableCommitEnvelope_warnWhenMissing(t *testing.T) {
	root := t.TempDir()
	token := "REQ-ENVELOPE-PILOT"
	result := EvaluateTraceableCommitEnvelope(TraceableCommitEnvelopeInput{
		ProjectRoot:  root,
		RequestToken: token,
		StepSlug:     traceableCommitSlug,
	})
	if !result.Warn {
		t.Fatalf("expected warn when envelope missing, got %+v", result)
	}
	if result.Block {
		t.Fatalf("default must remain warn-only, got block")
	}
	want := EnvelopeArtifactPath(root, token)
	if result.EnvelopePath != want {
		t.Fatalf("envelope path = %q, want %q", result.EnvelopePath, want)
	}
}

func TestTraceableCommitEnvelope_enforceBlocksWhenMissing(t *testing.T) {
	root := t.TempDir()
	result := EvaluateTraceableCommitEnvelope(TraceableCommitEnvelopeInput{
		ProjectRoot:     root,
		RequestToken:    "REQ-ENFORCE",
		StepSlug:        traceableCommitSlug,
		EnforceEnvelope: true,
	})
	if !result.Block {
		t.Fatalf("expected block with --enforce-envelope, got %+v", result)
	}
}

func TestTraceableCommitEnvelope_passesWhenPresent(t *testing.T) {
	root := t.TempDir()
	token := "REQ-PRESENT"
	envDir := filepath.Join(root, "working", token, "evidence")
	if err := os.MkdirAll(envDir, 0o755); err != nil {
		t.Fatal(err)
	}
	envPath := filepath.Join(envDir, "request-evidence-envelope.v1.json")
	if err := os.WriteFile(envPath, []byte("{}\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	result := EvaluateTraceableCommitEnvelope(TraceableCommitEnvelopeInput{
		ProjectRoot:     root,
		RequestToken:    token,
		StepSlug:        traceableCommitSlug,
		EnforceEnvelope: true,
	})
	if !result.EnvelopeExists || result.Warn || result.Block {
		t.Fatalf("expected pass when envelope exists, got %+v", result)
	}
}

func TestTraceableCommitEnvelope_skipsNonTraceableStep(t *testing.T) {
	result := EvaluateTraceableCommitEnvelope(TraceableCommitEnvelopeInput{
		ProjectRoot:  t.TempDir(),
		RequestToken: "REQ-X",
		StepSlug:     "verification-gate",
	})
	if result.Warn || result.Block {
		t.Fatalf("non traceable-commit step must not warn/block: %+v", result)
	}
}
