// Request evidence envelope patch after Tracker disposition (dual-write with MCP hooks).
// [IMPL-REQUEST_EVIDENCE_ENVELOPE] [ARCH-REQUEST_EVIDENCE_ENVELOPE] [REQ-REQUEST_EVIDENCE_ENVELOPE]
package checklist

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"stdd/agentstream/config"
)

const envelopePatchCLIRel = "mcp-server/dist/cli/request-evidence-envelope-patch.js"

// PatchTrackerEnvelopeInput describes one checklist_tracker envelope patch.
type PatchTrackerEnvelopeInput struct {
	ProjectRoot  string
	RequestToken string
	TrackerPath  string
	TiedBasePath string
	Generator    string
}

type envelopePatchCLIResult struct {
	OK           bool   `json:"ok"`
	Revision     int    `json:"revision,omitempty"`
	EnvelopePath string `json:"envelope_path,omitempty"`
	Error        string `json:"error,omitempty"`
}

// IsEnvelopeHooksEnabled mirrors TIED_ENVELOPE_HOOKS=1 producer gate (RISK-001).
func IsEnvelopeHooksEnabled() bool {
	return os.Getenv("TIED_ENVELOPE_HOOKS") == "1"
}

// TryPatchTrackerEnvelope patches request-evidence-envelope.v1 after tracker write; failures are non-fatal.
func TryPatchTrackerEnvelope(input PatchTrackerEnvelopeInput) {
	if !IsEnvelopeHooksEnabled() {
		return
	}
	if strings.TrimSpace(input.RequestToken) == "" || strings.TrimSpace(input.TrackerPath) == "" {
		fmt.Fprintf(os.Stderr, "DIAGNOSTIC: envelope patch skipped: missing request_token or tracker_path\n")
		return
	}
	projectRoot := filepath.Clean(input.ProjectRoot)
	trackerAbs := input.TrackerPath
	if !filepath.IsAbs(trackerAbs) {
		trackerAbs = filepath.Join(projectRoot, trackerAbs)
	}
	trackerAbs = filepath.Clean(trackerAbs)
	data, err := os.ReadFile(trackerAbs)
	if err != nil {
		fmt.Fprintf(os.Stderr, "DIAGNOSTIC: envelope patch skipped: tracker read failed: %v\n", err)
		return
	}
	relTracker, err := filepath.Rel(projectRoot, trackerAbs)
	if err != nil || strings.HasPrefix(relTracker, "..") {
		fmt.Fprintf(os.Stderr, "DIAGNOSTIC: envelope patch skipped: tracker outside project root\n")
		return
	}
	relTracker = filepath.ToSlash(relTracker)

	tiedBase := strings.TrimSpace(input.TiedBasePath)
	if tiedBase == "" {
		tiedBase = filepath.Join(projectRoot, "tied")
	}
	generator := strings.TrimSpace(input.Generator)
	if generator == "" {
		generator = "agentstream_apply_tracker_disposition"
	}

	payload := map[string]interface{}{
		"request_token":             input.RequestToken,
		"project_root":              projectRoot,
		"tied_base_path":            tiedBase,
		"confirmed_tied_base_path":  tiedBase,
		"artifact": map[string]interface{}{
			"kind":             "checklist_tracker",
			"path":             relTracker,
			"content_hash":     fileContentHash(data),
			"phase":            nil,
			"schema_version":   nil,
			"status":           "present",
			"proof_boundaries": []string{"tracker_disposition_only"},
		},
	}
	if _, err := invokeEnvelopePatchCLI(projectRoot, payload); err != nil {
		fmt.Fprintf(os.Stderr, "DIAGNOSTIC: envelope patch failed for tracker %s: %v\n", relTracker, err)
	}
}

// InvokeEnvelopePatchCLI runs the Node patch CLI and returns parsed result (for tests and production).
func InvokeEnvelopePatchCLI(projectRoot string, payload map[string]interface{}) (envelopePatchCLIResult, error) {
	return invokeEnvelopePatchCLI(projectRoot, payload)
}

func invokeEnvelopePatchCLI(projectRoot string, payload map[string]interface{}) (envelopePatchCLIResult, error) {
	cliPath, err := resolveEnvelopePatchCLI(projectRoot)
	if err != nil {
		return envelopePatchCLIResult{}, err
	}
	body, err := json.Marshal(payload)
	if err != nil {
		return envelopePatchCLIResult{}, err
	}
	cmd := exec.Command("node", cliPath)
	cmd.Dir = projectRoot
	cmd.Stdin = strings.NewReader(string(body))
	out, err := cmd.CombinedOutput()
	if err != nil {
		return envelopePatchCLIResult{}, fmt.Errorf("%w: %s", err, strings.TrimSpace(string(out)))
	}
	var result envelopePatchCLIResult
	if err := json.Unmarshal(out, &result); err != nil {
		return envelopePatchCLIResult{}, fmt.Errorf("invalid patch CLI output: %w", err)
	}
	if !result.OK {
		msg := strings.TrimSpace(result.Error)
		if msg == "" {
			msg = "patch returned ok:false"
		}
		return result, fmt.Errorf("%s", msg)
	}
	return result, nil
}

func resolveEnvelopePatchCLI(projectRoot string) (string, error) {
	if override := strings.TrimSpace(os.Getenv("TIED_ENVELOPE_PATCH_CLI")); override != "" {
		if _, err := os.Stat(override); err != nil {
			return "", fmt.Errorf("TIED_ENVELOPE_PATCH_CLI not found: %w", err)
		}
		return override, nil
	}
	root := projectRoot
	if repoRoot, ok := config.FindRepoRoot(projectRoot); ok {
		root = repoRoot
	}
	cliPath := filepath.Join(root, envelopePatchCLIRel)
	if _, err := os.Stat(cliPath); err != nil {
		return "", fmt.Errorf("envelope patch CLI missing at %s (run npm run build --prefix mcp-server)", cliPath)
	}
	return cliPath, nil
}

// RequestTokenFromTracker reads execution_evidence.request from a Tracker map.
func RequestTokenFromTracker(tracker map[string]interface{}) string {
	ee, ok := tracker["execution_evidence"].(map[string]interface{})
	if !ok {
		return ""
	}
	request, _ := ee["request"].(string)
	return strings.TrimSpace(request)
}

// TiedBasePathFromWorkspace resolves tied/ under project root.
func TiedBasePathFromWorkspace(projectRoot string) string {
	return filepath.Join(filepath.Clean(projectRoot), "tied")
}
