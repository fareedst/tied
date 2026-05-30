// Package agentstream provides shared types for Cursor agent multi-turn streaming.
// [IMPL-GOAGENT-LIB-TYPES] [ARCH-GOAGENT-LIB-LAYERING] [REQ-GOAGENT-LIB-MODULE]
// How: DATA-only root package; Turn, SessionID, VerifySessionPrompt shared by all agentstream packages.
package agentstream

// SessionID identifies a Cursor agent session for --resume chaining.
type SessionID string

// Turn is one agent invocation: prompt argv parts plus whether it resumes the prior session.
type Turn struct {
	// Parts are separate argv tokens passed to `agent` after flags (shell word-splitting semantics).
	Parts []string
	// ChainFromPrevious is false for feature-spec-batch records (each starts a new session).
	ChainFromPrevious bool
	// StepStub is the checklist step slug when this turn came from lead-checklist YAML; empty otherwise.
	StepStub string
}

// VerifySessionPrompt is appended when --verify-session is set (matches Ruby AgentStreamArgv).
const VerifySessionPrompt = "what was the most recent prompt?"
