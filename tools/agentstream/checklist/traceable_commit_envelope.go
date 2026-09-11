// Traceable-commit envelope warn/enforce pilot (Wave 7-D4).
// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
package checklist

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

const traceableCommitSlug = "traceable-commit"

// TraceableCommitEnvelopeInput configures envelope presence check before traceable-commit turn.
type TraceableCommitEnvelopeInput struct {
	ProjectRoot   string
	RequestToken  string
	StepSlug      string
	EnforceEnvelope bool
}

// TraceableCommitEnvelopeResult is warn-only by default; EnforceEnvelope promotes missing path to hard block.
type TraceableCommitEnvelopeResult struct {
	StepSlug      string `json:"step_slug"`
	EnvelopePath  string `json:"envelope_path"`
	EnvelopeExists bool   `json:"envelope_exists"`
	Warn          bool   `json:"warn"`
	Block         bool   `json:"block"`
	Message       string `json:"message,omitempty"`
}

// EnvelopeArtifactPath returns working/{REQ}/evidence/request-evidence-envelope.v1.json under project root.
func EnvelopeArtifactPath(projectRoot, requestToken string) string {
	token := strings.TrimSpace(requestToken)
	root := filepath.Clean(strings.TrimSpace(projectRoot))
	return filepath.Join(root, "working", token, "evidence", "request-evidence-envelope.v1.json")
}

// EvaluateTraceableCommitEnvelope checks envelope presence when approaching traceable-commit.
func EvaluateTraceableCommitEnvelope(input TraceableCommitEnvelopeInput) TraceableCommitEnvelopeResult {
	result := TraceableCommitEnvelopeResult{StepSlug: strings.TrimSpace(input.StepSlug)}
	if result.StepSlug != traceableCommitSlug {
		return result
	}
	token := strings.TrimSpace(input.RequestToken)
	if token == "" {
		msg := "traceable-commit requires REQUEST checklist var for envelope check"
		result.Warn = !input.EnforceEnvelope
		result.Block = input.EnforceEnvelope
		result.Message = msg
		return result
	}
	result.EnvelopePath = EnvelopeArtifactPath(input.ProjectRoot, token)
	if st, err := os.Stat(result.EnvelopePath); err == nil && !st.IsDir() {
		result.EnvelopeExists = true
		return result
	}
	msg := fmt.Sprintf(
		"traceable-commit approached without request-evidence-envelope at %s; run sub-close-out-evidence-sync or request_evidence_envelope_backfill before close-out",
		result.EnvelopePath,
	)
	result.EnvelopeExists = false
	result.Message = msg
	if input.EnforceEnvelope {
		result.Block = true
	} else {
		result.Warn = true
	}
	return result
}
