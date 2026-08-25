// Evidence ref resolution before Tracker write for completed dispositions.
// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
// How: RESOLVE_EVIDENCE_REFS classifies refs, verifies artifacts, and records hashes for outcome_verified ledger rows.
package checklist

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"gopkg.in/yaml.v3"
)

const verificationEvidenceManifestSchema = "verification-evidence-manifest.v1"

// ResolvedRef is one resolved evidence_refs entry with artifact hash metadata.
type ResolvedRef struct {
	Ref          string
	Kind         string
	ArtifactRef  string
	ArtifactHash string
}

var genericProseDenylist = []string{
	"tests passed",
	"build ok",
	"done",
	"success",
}

// ResolveEvidenceRefs resolves completed disposition evidence_refs under workspace.
func ResolveEvidenceRefs(receipt CompletionReceipt, workspace string) ([]ResolvedRef, error) {
	if strings.TrimSpace(receipt.Disposition) != "completed" {
		return nil, fmt.Errorf("evidence_resolution_skipped: disposition %q", receipt.Disposition)
	}
	if !nonEmptyStringList(receipt.EvidenceRefs) {
		return nil, fmt.Errorf("missing_disposition_evidence: completed requires evidence_refs")
	}
	ws := filepath.Clean(workspace)
	var resolved []ResolvedRef
	for _, ref := range receipt.EvidenceRefs {
		item, err := resolveOneEvidenceRef(strings.TrimSpace(ref), ws)
		if err != nil {
			return nil, err
		}
		resolved = append(resolved, item)
	}
	return resolved, nil
}

// ApplyReceiptWithEvidenceResolution resolves completed evidence before atomic Tracker write.
func ApplyReceiptWithEvidenceResolution(trackerPath string, receipt CompletionReceipt, identity TurnIdentity, workspace string) error {
	if strings.TrimSpace(receipt.Disposition) == "completed" {
		if _, err := ResolveEvidenceRefs(receipt, workspace); err != nil {
			return err
		}
	}
	return ApplyTrackerDisposition(trackerPath, receipt, identity)
}

func resolveOneEvidenceRef(ref, workspace string) (ResolvedRef, error) {
	if ref == "" {
		return ResolvedRef{}, fmt.Errorf("unresolved_evidence_ref: empty ref")
	}
	if doc, ok := tryParseCommandEvidence(ref); ok {
		return resolveCommandEvidenceRef(ref, doc, workspace)
	}
	if isGenericProse(ref) {
		return ResolvedRef{}, fmt.Errorf("unresolved_evidence_ref: generic prose %q", ref)
	}
	absPath := ref
	if !filepath.IsAbs(ref) {
		absPath = filepath.Join(workspace, ref)
	}
	absPath = filepath.Clean(absPath)
	rel, err := filepath.Rel(workspace, absPath)
	if err != nil || strings.HasPrefix(rel, "..") {
		return ResolvedRef{}, fmt.Errorf("unresolved_evidence_ref: path outside workspace %q", ref)
	}
	data, err := os.ReadFile(absPath)
	if err != nil {
		if os.IsNotExist(err) {
			return ResolvedRef{}, fmt.Errorf("missing_artifact: %q", ref)
		}
		return ResolvedRef{}, fmt.Errorf("missing_artifact: %w", err)
	}
	hash := fileContentHash(data)
	if doc, ok := parseVerificationManifest(data); ok {
		if err := validateManifestExitCodes(doc); err != nil {
			return ResolvedRef{}, err
		}
		return ResolvedRef{
			Ref:          ref,
			Kind:         "manifest_ref",
			ArtifactRef:  ref,
			ArtifactHash: hash,
		}, nil
	}
	return ResolvedRef{
		Ref:          ref,
		Kind:         "file_path",
		ArtifactRef:  ref,
		ArtifactHash: hash,
	}, nil
}

func tryParseCommandEvidence(ref string) (map[string]interface{}, bool) {
	trimmed := strings.TrimSpace(ref)
	if strings.HasPrefix(trimmed, "command_evidence:") {
		trimmed = strings.TrimSpace(strings.TrimPrefix(trimmed, "command_evidence:"))
	}
	if !strings.HasPrefix(trimmed, "{") {
		return nil, false
	}
	var doc map[string]interface{}
	if json.Unmarshal([]byte(trimmed), &doc) != nil {
		return nil, false
	}
	return doc, true
}

func resolveCommandEvidenceRef(ref string, doc map[string]interface{}, workspace string) (ResolvedRef, error) {
	if err := validateCommandEvidenceMap(doc); err != nil {
		return ResolvedRef{}, err
	}
	claimed, _ := doc["claimed_success"].(bool)
	if !claimed {
		return ResolvedRef{
			Ref:          ref,
			Kind:         "command_evidence",
			ArtifactRef:  ref,
			ArtifactHash: fileContentHash([]byte(ref)),
		}, nil
	}
	manifestRef := stringField(doc, "manifest_ref", "manifest_reference")
	manifestResolved, err := resolveManifestPathRef(manifestRef, workspace)
	if err != nil {
		return ResolvedRef{}, err
	}
	outputRef := stringField(doc, "stdout_ref", "stderr_ref", "output_path")
	outputResolved, err := resolveFilePathRef(outputRef, workspace)
	if err != nil {
		return ResolvedRef{}, err
	}
	combined := manifestResolved.ArtifactHash + "|" + outputResolved.ArtifactHash
	return ResolvedRef{
		Ref:          ref,
		Kind:         "command_evidence",
		ArtifactRef:  manifestRef,
		ArtifactHash: fileContentHash([]byte(combined)),
	}, nil
}

func validateCommandEvidenceMap(doc map[string]interface{}) error {
	claimed, ok := doc["claimed_success"].(bool)
	if !ok || !claimed {
		return nil
	}
	if stringField(doc, "manifest_ref", "manifest_reference") == "" {
		return fmt.Errorf("command_success_unproven: missing manifest_ref")
	}
	if stringField(doc, "stdout_ref", "stderr_ref", "output_path") == "" {
		return fmt.Errorf("command_success_unproven: missing output ref")
	}
	if _, ok := doc["exit_code"]; !ok {
		return fmt.Errorf("command_success_unproven: missing exit_code")
	}
	return nil
}

func stringField(doc map[string]interface{}, keys ...string) string {
	for _, key := range keys {
		if v, ok := doc[key].(string); ok && strings.TrimSpace(v) != "" {
			return strings.TrimSpace(v)
		}
	}
	return ""
}

func resolveManifestPathRef(ref, workspace string) (ResolvedRef, error) {
	resolved, err := resolveOneEvidenceRef(ref, workspace)
	if err != nil {
		return ResolvedRef{}, err
	}
	if resolved.Kind != "manifest_ref" {
		return ResolvedRef{}, fmt.Errorf("command_success_unproven: manifest_ref %q is not a valid manifest", ref)
	}
	return resolved, nil
}

func resolveFilePathRef(ref, workspace string) (ResolvedRef, error) {
	resolved, err := resolveOneEvidenceRef(ref, workspace)
	if err != nil {
		return ResolvedRef{}, err
	}
	if resolved.Kind != "file_path" {
		return ResolvedRef{}, fmt.Errorf("command_success_unproven: output ref %q is not a readable file", ref)
	}
	return resolved, nil
}

func isGenericProse(ref string) bool {
	lower := strings.ToLower(strings.TrimSpace(ref))
	for _, phrase := range genericProseDenylist {
		if lower == phrase {
			return true
		}
	}
	if !strings.Contains(ref, "/") && !strings.Contains(ref, ".") {
		return true
	}
	return false
}

func parseVerificationManifest(data []byte) (map[string]interface{}, bool) {
	var doc map[string]interface{}
	if json.Unmarshal(data, &doc) == nil {
		if schemaVersion(doc) == verificationEvidenceManifestSchema {
			return doc, true
		}
	}
	doc = nil
	if yaml.Unmarshal(data, &doc) == nil {
		if schemaVersion(doc) == verificationEvidenceManifestSchema {
			return doc, true
		}
	}
	return nil, false
}

func schemaVersion(doc map[string]interface{}) string {
	if doc == nil {
		return ""
	}
	sv, _ := doc["schema_version"].(string)
	return strings.TrimSpace(sv)
}

func validateManifestExitCodes(doc map[string]interface{}) error {
	results, ok := doc["command_results"].([]interface{})
	if !ok || len(results) == 0 {
		return fmt.Errorf("manifest_exit_nonzero: missing command_results")
	}
	for _, item := range results {
		row, ok := item.(map[string]interface{})
		if !ok {
			return fmt.Errorf("manifest_exit_nonzero: malformed command_results row")
		}
		switch v := row["exit_code"].(type) {
		case int:
			if v != 0 {
				return fmt.Errorf("manifest_exit_nonzero: command %v exit_code=%d", row["id"], v)
			}
		case int64:
			if v != 0 {
				return fmt.Errorf("manifest_exit_nonzero: command %v exit_code=%d", row["id"], v)
			}
		case float64:
			if int(v) != 0 {
				return fmt.Errorf("manifest_exit_nonzero: command %v exit_code=%v", row["id"], v)
			}
		default:
			return fmt.Errorf("manifest_exit_nonzero: missing exit_code")
		}
	}
	return nil
}

func fileContentHash(data []byte) string {
	sum := sha256.Sum256(data)
	return "sha256:" + hex.EncodeToString(sum[:])
}
